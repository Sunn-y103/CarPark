import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  PermissionsAndroid,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  PanResponder,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import MapView, { Marker, Circle, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { NavigationMode } from '../../types';
import { useBooking } from '../../context/BookingContext';
import { useWallet } from '../../context/WalletContext';

interface MapsScreenProps {
  mode?: NavigationMode;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface ParkingMarker {
  id: string;
  coordinate: Location;
  title: string;
  description: string;
  images: string[];
  hourlyRate: number;
  availableSpots: number;
}

export const MapsScreen: React.FC<MapsScreenProps> = ({ mode }) => {
  // ✅ FIX 1: Add ref to MapView for programmatic control
  const mapRef = useRef<MapView>(null);
  const { addBooking } = useBooking();
  const { balance, deductFunds } = useWallet();

  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  // ✅ FIX 2: Use initialRegion instead of region for better performance
  // ✅ Set initial region to user's area (Kalamboli, India based on previous location)
  const [initialRegion] = useState<Region>({
    latitude: 19.2403,
    longitude: 73.1305,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });

  const [markers, setMarkers] = useState<ParkingMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // Bottom sheet state
  const [selectedParking, setSelectedParking] = useState<ParkingMarker | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  // Spot selection modal state
  const [spotSelectionVisible, setSpotSelectionVisible] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
  const [timeSlotVisible, setTimeSlotVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Parking spot data (Flattened)
  const parkingSpots = [123, 125, 126, 127, 128, 131, 132, 134, 223, 225, 226, 227, 228, 231, 232, 234];
  const occupiedSpots = [123, 131, 127, 225, 231];

  // Helper to generate dates
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Helper to generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      const start = i;
      const end = (i + 1) % 24;
      const startStr = start < 12 ? `${start === 0 ? 12 : start} AM` : `${start === 12 ? 12 : start - 12} PM`;
      const endStr = end < 12 ? `${end === 0 ? 12 : end} AM` : `${end === 12 ? 12 : end - 12} PM`;
      slots.push({
        id: `${i}`,
        label: `${startStr} - ${endStr}`,
        hour: i
      });
    }
    return slots;
  };


  // Request location permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'CarPark needs access to your location to show nearby parking spots.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        console.log('Permission result:', granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  // ✅ FIX 3: Improved location fetching with better error handling
  const getCurrentLocation = () => {
    console.log('🔍 Requesting current location...');
    setFetchingLocation(true);

    Geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Location received:', position.coords);
        const { latitude, longitude } = position.coords;
        const location = { latitude, longitude };

        console.log('🎯 Setting currentLocation to:', location);
        setCurrentLocation(location);

        // ✅ FIX 4: Use animateToRegion for smooth centering
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            },
            1000, // Animation duration in ms
          );
        }

        // Generate dummy markers around current location
        generateDummyMarkers(latitude, longitude);
        setLoading(false);
        setFetchingLocation(false);
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);

        // Fallback: Use default location (Kalamboli, India)
        const defaultLocation = {
          latitude: 19.2403,
          longitude: 73.1305,
        };

        console.log('⚠️ Using default location:', defaultLocation);
        setCurrentLocation(defaultLocation);

        // Animate to default location
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: defaultLocation.latitude,
              longitude: defaultLocation.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            },
            1000,
          );
        }

        generateDummyMarkers(defaultLocation.latitude, defaultLocation.longitude);
        setLoading(false);
        setFetchingLocation(false);

        Alert.alert(
          'Location Notice',
          `Unable to get your exact location (Error: ${error.message}). Using default location. Make sure:\n\n1. Location is enabled in emulator settings\n2. GPS provider is active\n3. A location is set in emulator`,
          [{ text: 'OK' }]
        );
      },
      {
        enableHighAccuracy: true, // ✅ Try high accuracy first
        timeout: 30000, // Increased timeout
        maximumAge: 10000, // Allow cached location
      },
    );
  };

  // Generate four dummy markers around current location
  const generateDummyMarkers = (lat: number, lng: number) => {
    const offset = 0.003; // Approximately 330 meters (increased for better visibility)
    const dummyMarkers: ParkingMarker[] = [
      {
        id: '1',
        coordinate: { latitude: lat + offset, longitude: lng },
        title: 'Sumit Parking Spot',
        description: '₹50/hr • 5 spots available',
        images: [
          'https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGFya2luZ3xlbnwwfHwwfHx8MA%3D%3D',
          'https://t4.ftcdn.net/jpg/03/30/78/85/360_F_330788577_0DDjwHh2WYlf4DQJt5d0eMqzMZ9mMy4C.jpg',
        ],
        hourlyRate: 50,
        availableSpots: 5,
      },
      {
        id: '2',
        coordinate: { latitude: lat - offset, longitude: lng },
        title: 'Hari Parking Spot',
        description: '₹40/hr • 3 spots available',
        images: [
          'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFya2luZ3xlbnwwfHwwfHx8MA%3D%3D',
          'https://images.unsplash.com/photo-1616363088386-31c4a8414858?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGFya2luZ3xlbnwwfHwwfHx8MA%3D%3D',
        ],
        hourlyRate: 40,
        availableSpots: 3,
      },
      {
        id: '3',
        coordinate: { latitude: lat, longitude: lng + offset },
        title: 'Raj Parking Spot',
        description: '₹60/hr • 8 spots available',
        images: [
          'https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGFya2luZ3xlbnwwfHwwfHx8MA%3D%3D',
          'https://t4.ftcdn.net/jpg/03/30/78/85/360_F_330788577_0DDjwHh2WYlf4DQJt5d0eMqzMZ9mMy4C.jpg',
        ],
        hourlyRate: 60,
        availableSpots: 8,
      },
      {
        id: '4',
        coordinate: { latitude: lat, longitude: lng - offset },
        title: 'Rohit Parking Spot',
        description: '₹45/hr • 2 spots available',
        images: [
          'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFya2luZ3xlbnwwfHwwfHx8MA%3D%3D',
          'https://images.unsplash.com/photo-1616363088386-31c4a8414858?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGFya2luZ3xlbnwwfHwwfHx8MA%3D%3D',
        ],
        hourlyRate: 45,
        availableSpots: 2,
      },
    ];
    console.log('📍 Generated markers:', dummyMarkers.length);
    setMarkers(dummyMarkers);
  };

  // Bottom sheet functions
  const openBottomSheet = (marker: ParkingMarker) => {
    console.log('🔵 Opening bottom sheet for:', marker.title);
    setSelectedParking(marker);
    setBottomSheetVisible(true);
    Animated.spring(bottomSheetAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeBottomSheet = () => {
    Animated.timing(bottomSheetAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setBottomSheetVisible(false);
      setSelectedParking(null);
    });
  };



  // PanResponder for swipe-to-close gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          bottomSheetAnim.setValue(1 - gestureState.dy / (screenHeight * 0.6));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeBottomSheet();
        } else {
          Animated.spring(bottomSheetAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Initialize location on mount
  useEffect(() => {
    const initLocation = async () => {
      console.log('🚀 Initializing location...');
      const hasPermission = await requestLocationPermission();

      if (hasPermission) {
        console.log('✅ Permission granted, fetching location...');
        getCurrentLocation();
      } else {
        console.log('❌ Permission denied');
        setLoading(false);
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show nearby parking. Please enable it in app settings.',
          [{ text: 'OK' }]
        );
      }
    };

    initLocation();
  }, []);

  // Debug: Log when currentLocation changes
  useEffect(() => {
    if (currentLocation) {
      console.log('🔵 currentLocation updated, marker should render at:', currentLocation);
    } else {
      console.log('⚪ currentLocation is null');
    }
  }, [currentLocation]);

  // ✅ FIX 5: Enhanced "Use Current Location" with loading state
  const handleUseCurrentLocation = () => {
    console.log('🔄 Fetching fresh location...');
    setFetchingLocation(true);

    Geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Live location received:', position.coords);
        const { latitude, longitude } = position.coords;
        const location = { latitude, longitude };

        setCurrentLocation(location);

        // Animate to new location
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            },
            1000,
          );
        }

        // Regenerate markers around new location
        generateDummyMarkers(latitude, longitude);
        setFetchingLocation(false);
      },
      (error) => {
        console.error('❌ Error fetching live location:', error);
        setFetchingLocation(false);

        // If we have a cached location, use it
        if (currentLocation && mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            },
            1000,
          );
        } else {
          Alert.alert(
            'Error',
            'Unable to get your current location. Please check your location settings.'
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 5000, // Allow slightly cached location
      },
    );
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View
        style={{
          flex: 1,
          padding: theme.spacing.lg,
          paddingTop: theme.spacing.xl + theme.spacing.sm,
          paddingBottom: theme.spacing.xl + theme.spacing.base,
        }}>
        {/* Header */}
        <View
          style={[
            commonStyles.headerContainer,
            { marginBottom: theme.spacing.lg, borderBottomWidth: 0, paddingHorizontal: 0 },
          ]}>
          <View>
            <Text style={[commonStyles.headerTitle, { color: theme.colors.text.primary }]}>
              {mode === 'book' ? 'Book Parking Slot' : 'Parking Nearby'}
            </Text>
            <Text style={[commonStyles.headerSubtitle, { color: theme.colors.text.secondary }]}>
              {mode === 'book'
                ? 'Select a slot and time for booking'
                : 'Find parking spots around you'}
            </Text>
          </View>
          <TouchableOpacity style={{ padding: theme.spacing.xs }}>
            <Image
              source={require('../../assets/Security&Privacy.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </View>

        {/* Search Location */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <TouchableOpacity style={commonStyles.input}>
            <Text style={{ color: theme.colors.text.tertiary }}>Search Location</Text>
          </TouchableOpacity>
        </View>

        {/* Map View */}
        <View
          style={{
            flex: 1,
            borderRadius: theme.borderRadius.xl,
            overflow: 'hidden',
            marginBottom: theme.spacing.lg,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
          {loading ? (
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.backgroundSecondary,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text
                style={{
                  fontSize: theme.typography.fontSizes.lg,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  marginTop: 16,
                }}>
                Loading Map...
              </Text>
            </View>
          ) : (
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              initialRegion={initialRegion}
              showsUserLocation={false}
              followsUserLocation={false}
              showsMyLocationButton={false}
              showsCompass={true}
              showsScale={true}
              zoomEnabled={true}
              scrollEnabled={true}
              pitchEnabled={true}
              rotateEnabled={true}>



              {/* ✅ Custom Blue Dot Marker - Enhanced Visibility */}
              {currentLocation && (
                <Marker
                  coordinate={currentLocation}
                  title="Your Location"
                  description="You are here"
                  anchor={{ x: 0.5, y: 0.5 }}
                  zIndex={1000}
                  tracksViewChanges={false}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: '#4285F4', // Google Maps blue
                      borderWidth: 3,
                      borderColor: '#FFFFFF',
                      shadowColor: '#000000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 3,
                      elevation: 5,
                    }}
                  />
                </Marker>
              )}

              {/* Parking Spot Markers */}
              {markers.map((marker) => (
                <Marker
                  key={marker.id}
                  coordinate={marker.coordinate}
                  title={marker.title}
                  description={marker.description}
                  anchor={{ x: 0.5, y: 0.5 }}
                  tracksViewChanges={false}
                  onPress={() => openBottomSheet(marker)}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: '#34A853',
                      borderWidth: 3,
                      borderColor: '#FFFFFF',
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#000000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 3,
                      elevation: 5,
                    }}>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 20,
                        fontWeight: 'bold',
                      }}>
                      P
                    </Text>
                  </View>
                </Marker>
              ))}

            </MapView>
          )}

          {/* Loading overlay for "Use Current Location" */}
          {fetchingLocation && (
            <View
              style={{
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                alignItems: 'center',
              }}>
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', marginLeft: 8, fontSize: 14 }}>
                  Fetching location...
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Map Controls */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.base,
          }}>
          <TouchableOpacity style={[commonStyles.zoneButton, { minWidth: '30%' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('../../assets/Nearby.png')}
                style={{ width: 12, height: 12, marginRight: 4 }}
              />
              <Text style={commonStyles.zoneButtonText}>Nearby</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              commonStyles.zoneButton,
              commonStyles.zoneButtonActive,
              { minWidth: '30%' },
            ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('../../assets/Find_Parking.png')}
                style={{ width: 12, height: 12, marginRight: 4, tintColor: theme.colors.primary }}
              />
              <Text style={[commonStyles.zoneButtonText, commonStyles.zoneButtonTextActive]}>
                Available
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[commonStyles.zoneButton, { minWidth: '30%' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('../../assets/Top_Rated.png')}
                style={{ width: 12, height: 12, marginRight: 4 }}
              />
              <Text style={commonStyles.zoneButtonText}>Top Rated</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Current Location Button */}
        <TouchableOpacity
          style={[commonStyles.buttonAccent, { marginTop: theme.spacing.base }]}
          onPress={handleUseCurrentLocation}
          disabled={fetchingLocation}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {fetchingLocation ? (
              <ActivityIndicator size="small" color={theme.colors.surface} />
            ) : (
              <Image
                source={require('../../assets/Nearby.png')}
                style={{ width: 16, height: 16, marginRight: 8, tintColor: theme.colors.surface }}
              />
            )}
            <Text style={commonStyles.buttonAccentText}>
              {fetchingLocation ? 'Locating...' : 'Use Current Location'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={bottomSheetVisible && selectedParking !== null}
        transparent={true}
        animationType="none"
        onRequestClose={closeBottomSheet}>
        <>
          {/* Backdrop */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
            }}
            activeOpacity={1}
            onPress={closeBottomSheet}
          />

          {/* Bottom Sheet Container */}
          <Animated.View
            {...panResponder.panHandlers}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: screenHeight * 0.6,
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 10,
              zIndex: 1000,
              transform: [
                {
                  translateY: bottomSheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [screenHeight * 0.6, 0],
                  }),
                },
              ],
            }}>
            {/* Drag Handle */}
            <View
              style={{
                alignItems: 'center',
                paddingVertical: 12,
              }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: '#CCCCCC',
                  borderRadius: 2,
                }}
              />
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={closeBottomSheet}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 10,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{ fontSize: 18, color: '#666666' }}>✕</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Image Carousel */}
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={{ height: 200 }}>
                {selectedParking?.images.map((img, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: img }}
                    style={{
                      width: Dimensions.get('window').width,
                      height: 200,
                    }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>

              {/* Pagination Dots */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  paddingVertical: 12,
                }}>
                {selectedParking?.images.map((_, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: idx === 0 ? '#34A853' : '#CCCCCC',
                      marginHorizontal: 4,
                    }}
                  />
                ))}
              </View>

              {/* Parking Details */}
              <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                {/* Parking Name */}
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#1A1A1A',
                    marginBottom: 16,
                  }}>
                  {selectedParking?.title}
                </Text>

                {/* Hourly Rate */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                  <Text style={{ fontSize: 28, marginRight: 8 }}>💰</Text>
                  <Text
                    style={{
                      fontSize: 18,
                      color: '#1A1A1A',
                      fontWeight: '600',
                    }}>
                    ₹{selectedParking?.hourlyRate}/hr
                  </Text>
                </View>

                {/* Available Spots */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}>
                  <Text style={{ fontSize: 28, marginRight: 8 }}>🅿️</Text>
                  <Text
                    style={{
                      fontSize: 18,
                      color: '#1A1A1A',
                      fontWeight: '600',
                    }}>
                    {selectedParking?.availableSpots} spots available
                  </Text>
                </View>

                {/* Book Button */}
                <TouchableOpacity
                  onPress={() => setSpotSelectionVisible(true)}
                  style={{
                    backgroundColor: '#34A853',
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 18,
                      fontWeight: 'bold',
                    }}>
                    Book Now
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </>
      </Modal>

      {/* Parking Spot Selection Modal */}
      <Modal
        visible={spotSelectionVisible}
        animationType="slide"
        onRequestClose={() => setSpotSelectionVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
          {/* Header */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#E0E0E0',
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' }}>
                  {selectedParking?.title || 'Parking Location'}
                </Text>
                <Text style={{ fontSize: 14, color: '#666666', marginTop: 4 }}>
                  Courtyard Marina View Tower
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSpotSelectionVisible(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#F0F0F0',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 20, color: '#666666' }}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Parking Spots Grid */}
          <ScrollView
            style={{ flex: 1, backgroundColor: '#F5F5F5' }}
            contentContainerStyle={{ padding: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}>
              {parkingSpots.map((spotNumber) => {
                const isOccupied = occupiedSpots.includes(spotNumber);
                const isSelected = selectedSpot === spotNumber;

                return (
                  <TouchableOpacity
                    key={spotNumber}
                    disabled={isOccupied}
                    onPress={() => setSelectedSpot(spotNumber)}
                    style={{
                      width: '48%',
                      aspectRatio: 2,
                      marginBottom: 16,
                      borderRadius: 12,
                      backgroundColor: '#FFFFFF',
                      borderWidth: isSelected ? 3 : 1,
                      borderColor: isSelected ? '#BFFF00' : '#E0E0E0',
                      justifyContent: 'center',
                      alignItems: 'center',
                      overflow: 'hidden',
                    }}>
                    {isOccupied ? (
                      <Image
                        source={{
                          uri: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
                        }}
                        style={{ width: '80%', height: '80%' }}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' }}>
                          {spotNumber}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#999999', marginTop: 4 }}>
                          Available
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Continue Button */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: '#E0E0E0',
            }}>
            <TouchableOpacity
              disabled={!selectedSpot}
              onPress={() => {
                setSpotSelectionVisible(false);
                setTimeSlotVisible(true);
              }}
              style={{
                backgroundColor: selectedSpot ? '#2C2C2C' : '#CCCCCC',
                paddingVertical: 18,
                borderRadius: 12,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: selectedSpot ? '#BFFF00' : '#666666',
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginRight: 8,
                }}>
                Continue
              </Text>
              <Text style={{ color: selectedSpot ? '#BFFF00' : '#666666', fontSize: 20 }}>→</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>



      {/* Time Slot Selection Modal */}
      <Modal
        visible={timeSlotVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setTimeSlotVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={{ padding: 20 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => setTimeSlotVisible(false)} style={{ padding: 8 }}>
                <Text style={{ fontSize: 24, color: '#1A1A1A' }}>←</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginLeft: 16 }}>
                Select Time
              </Text>
            </View>

            {/* Parking Info */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, color: '#666666', marginBottom: 4 }}>Parking at</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' }}>{selectedParking?.title}</Text>
            </View>

            {/* Date Selector */}
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 }}>
              Select Date
            </Text>
            <View style={{ marginBottom: 24 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {generateDates().map((date, index) => {
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedDate(date)}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        borderRadius: 16,
                        backgroundColor: isSelected ? '#2C2C2C' : '#F0F0F0',
                        marginRight: 10,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: isSelected ? '#2C2C2C' : '#E0E0E0',
                      }}>
                      <Text style={{
                        fontSize: 14,
                        color: isSelected ? '#BFFF00' : '#666666',
                        fontWeight: '600',
                        marginBottom: 4
                      }}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Text>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: isSelected ? '#FFFFFF' : '#1A1A1A'
                      }}>
                        {date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Time Slot Grid */}
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 }}>
              Select Time Slots
            </Text>
            <ScrollView style={{ height: 300 }} nestedScrollEnabled={true}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {generateTimeSlots().map((slot) => {
                  const isSelected = selectedTimeSlots.includes(slot.id);
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedTimeSlots(prev => prev.filter(id => id !== slot.id));
                        } else {
                          setSelectedTimeSlots(prev => [...prev, slot.id]);
                        }
                      }}
                      style={{
                        width: '48%',
                        paddingVertical: 12,
                        marginBottom: 10,
                        borderRadius: 12,
                        backgroundColor: isSelected ? '#2C2C2C' : '#FFFFFF',
                        borderWidth: 1,
                        borderColor: isSelected ? '#BFFF00' : '#E0E0E0',
                        alignItems: 'center',
                      }}>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: isSelected ? '#BFFF00' : '#1A1A1A'
                      }}>
                        {slot.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Total Price & Confirm */}
            <View style={{
              position: 'absolute',
              bottom: -80, // Adjust for absolute positioning context
              left: 0,
              right: 0,
              padding: 20,
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E0E0E0',
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontSize: 16, color: '#666666' }}>Total Amount</Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' }}>
                  ₹{(selectedParking?.hourlyRate || 0) * selectedTimeSlots.length}
                </Text>
              </View>

              <TouchableOpacity
                disabled={selectedTimeSlots.length === 0}
                onPress={() => {
                  if (selectedSpot && selectedParking) {
                    const totalAmount = (selectedParking.hourlyRate || 0) * selectedTimeSlots.length;

                    if (balance >= totalAmount) {
                      const success = deductFunds(totalAmount, `Parking at ${selectedParking.title}`);

                      if (success) {
                        addBooking({
                          location: selectedParking.title,
                          date: `${selectedDate.toLocaleDateString()} ${selectedTimeSlots.length > 0 ? generateTimeSlots().find(s => s.id === selectedTimeSlots[0])?.label : ''}`,
                          duration: `${selectedTimeSlots.length}h`,
                          amount: `₹${totalAmount}`,
                          status: 'Active',
                          spotNumber: selectedSpot,
                        });
                        setTimeSlotVisible(false);
                        setBookingConfirmed(true);
                      }
                    } else {
                      Alert.alert('Insufficient Funds', 'Please add money to your wallet to continue.');
                    }
                  }
                }}
                style={{
                  backgroundColor: selectedTimeSlots.length > 0 ? '#34A853' : '#CCCCCC',
                  paddingVertical: 18,
                  borderRadius: 12,
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }}>
                  Confirm Booking
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>
      </Modal>
      <Modal
        visible={bookingConfirmed}
        animationType="slide"
        transparent={false}
        onRequestClose={() => { }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ alignItems: 'center', padding: 20, width: '100%' }}>

            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#4CAF50',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24
            }}>
              <Text style={{ fontSize: 40, color: 'white' }}>✓</Text>
            </View>

            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 }}>
              Booking Confirmed!
            </Text>

            <Text style={{ fontSize: 18, color: '#666666', marginBottom: 32 }}>
              Your Parking Slot: <Text style={{ fontWeight: 'bold', color: '#1A1A1A' }}>{selectedSpot}</Text>
            </Text>

            <View style={{
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 5,
              marginBottom: 32
            }}>
              <Image
                source={{
                  uri: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ParkingBookingConfirmed',
                }}
                style={{ width: 250, height: 250 }}
                resizeMode="contain"
              />
            </View>

            <Text style={{ fontSize: 16, color: '#999999', marginBottom: 40, textAlign: 'center' }}>
              Scan this QR code at the entrance to access your parking spot.
            </Text>

            <TouchableOpacity
              onPress={() => {
                // Reset flow
                setBookingConfirmed(false);
                setSpotSelectionVisible(false);
                setBottomSheetVisible(false);
                setSelectedSpot(null);
                setSelectedTimeSlots([]);
                setSelectedDate(new Date());
              }}
              style={{
                backgroundColor: '#2C2C2C',
                paddingVertical: 18,
                paddingHorizontal: 40,
                borderRadius: 12,
                width: '100%',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: '#BFFF00',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}>
                Done
              </Text>
            </TouchableOpacity>

          </View>
        </SafeAreaView>
      </Modal >
    </SafeAreaView >
  );
};
