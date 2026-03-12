import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { User, ChargingStation, Booking, NavigationMode } from '../../types';
import { useUserProfile } from '../../hooks/useUserProfile';

interface HomeScreenProps {
  onNavigateToMaps: (mode?: NavigationMode) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToMaps }) => {
  const { user: profileUser } = useUserProfile();
  const [activeBooking, setActiveBooking] = useState<any | null>(null);

  // Track user profile changes for debugging
  useEffect(() => {
    if (profileUser) {
      console.log('HomeScreen: User profile updated:', {
        name: profileUser.name,
        email: profileUser.email,
        phone: profileUser.phone,
      });
    }
  }, [profileUser]);

  const user = profileUser || {
    id: '1',
    name: 'User',
    email: 'user@example.com',
  };
  const [showQRModal, setShowQRModal] = useState(false);

  // Monitor active booking for status changes (Check-in / Check-out)
  useEffect(() => {
    if (!activeBooking?.id) return;

    const unsubscribe = import('../../services/FirestoreService').then(({ default: FirestoreService }) => {
      return FirestoreService.getInstance().listenToBooking(activeBooking.id, (updatedBooking) => {
        if (updatedBooking) {
          console.log('Booking Update:', updatedBooking);
          // Check if status changed or check-in status changed
          const isCheckedIn = updatedBooking.metadata?.isCheckedIn;
          const isCompleted = updatedBooking.status === 'completed';

          setActiveBooking((prev: any) => ({
            ...prev,
            ...updatedBooking,
            qrCodeValid: !isCompleted && !isCheckedIn // QR valid only if NOT checked in and NOT completed
          }));

          if (isCheckedIn && !activeBooking.metadata?.isCheckedIn) {
            Alert.alert('Check-in Confirmed', 'You have successfully checked in!');
          }

          if (isCompleted && activeBooking.status !== 'completed') {
            Alert.alert('Check-out Confirmed', 'Your parking session has ended. Have a safe drive!');
            setShowQRModal(false); // Close QR modal on checkout
          }
        }
      });
    });

    return () => {
      unsubscribe.then(unsub => unsub && unsub());
    };
  }, [activeBooking?.id]);

  const simulateBookingProcess = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to make a booking.');
      return;
    }

    try {
      Alert.alert('Processing Payment', 'Please wait while we process your payment...');

      const FirestoreService = (await import('../../services/FirestoreService')).default;

      // Create REAL Firestore Booking
      const newBookingId = await FirestoreService.getInstance().createParkingHistory({
        userId: user.id,
        parkingSpotId: 'slot-001', // Mock slot
        parkingSpotName: 'Central Mall Parking',
        address: '123 Mall Road',
        startTime: new Date() as any, // Firestore Timestamp conversion handled by service if needed, or simple date
        cost: 120,
        status: 'active',
        paymentStatus: 'paid',
        metadata: {
          isCheckedIn: false,
          vehicleId: 'vehicle-001'
        }
      } as any); // Cast as any if strict type mismatch on Timestamp vs Date

      setActiveBooking({
        id: newBookingId,
        userId: user.id,
        slotId: 'slot-001',
        startTime: new Date(),
        status: 'active',
        qrCodeValid: true,
        metadata: { isCheckedIn: false }
      });

      Alert.alert('Booking Confirmed!', `Hi ${user.name.split(' ')[0]}! Your parking slot has been reserved. QR code is now visible in the header.`, [
        { text: 'View QR Code', onPress: () => setShowQRModal(true) },
        { text: 'OK' },
      ]);

    } catch (error) {
      console.error(error);
      Alert.alert('Booking Failed', 'There was an error processing your booking. Please try again.');
    }
  };
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: theme.spacing.lg,
          paddingTop: theme.spacing.lg + theme.spacing.sm,
          paddingBottom: theme.spacing.xl + theme.spacing.base
        }}
        showsVerticalScrollIndicator={false}>

        <View style={{
          alignItems: 'flex-start',
          marginBottom: theme.spacing.sm
        }}>
          <Image
            source={require('../../assets/CarPark_Logo2.png')}
            style={{
              width: 90,
              height: 90,
              borderRadius: 25,
              resizeMode: 'contain'
            }}
          />
        </View>

        <View style={[commonStyles.headerContainer, {
          marginBottom: theme.spacing.lg,
          borderBottomWidth: 0,
          paddingHorizontal: theme.spacing.base,
          paddingVertical: theme.spacing.base,
          backgroundColor: theme.colors.backgroundCard,
          borderRadius: theme.borderRadius.lg,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }]}>
          <View style={{ justifyContent: 'center' }}>
            <Text style={[commonStyles.headerTitle, {
              fontSize: theme.typography.fontSizes['2xl'],
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.xs
            }]}>
              Hi {user.name.split(' ')[0]}! 👋
            </Text>
            <Text style={[commonStyles.headerSubtitle, {
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSizes.sm
            }]}>
              Find your perfect parking spot
            </Text>
          </View>
          {activeBooking && activeBooking.qrCode && (
            <TouchableOpacity
              onPress={() => setShowQRModal(true)}
              style={{
                backgroundColor: activeBooking.qrCodeValid ? theme.colors.success : theme.colors.text.tertiary,
                borderRadius: 20,
                padding: theme.spacing.sm,
                paddingHorizontal: theme.spacing.base
              }}>
              <Text style={{ color: theme.colors.surface, fontSize: 12, fontWeight: '600' }}>
                {activeBooking.qrCodeValid ? '🅿️ Active' : '🅿️ Used'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ marginBottom: theme.spacing.xl }}>
          <Text style={{
            fontSize: theme.typography.fontSizes.lg,
            fontWeight: theme.typography.fontWeights.semibold as any,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.base,
          }}>Available EV Charging Stations</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: theme.spacing.lg }}
          >
            {[
              { name: 'Central Mall Station', distance: 0.3, slots: 8, total: 10, speed: 'Fast', price: 45 },
              { name: 'City Plaza Hub', distance: 0.7, slots: 5, total: 8, speed: 'Rapid', price: 60 },
              { name: 'Tech Park Station', distance: 1.2, slots: 12, total: 15, speed: 'Fast', price: 50 },
            ].map((station, index) => (
              <View key={index} style={[
                commonStyles.card,
                {
                  backgroundColor: theme.colors.backgroundCard,
                  borderLeftWidth: 4,
                  borderLeftColor: theme.colors.success,
                  marginRight: theme.spacing.base,
                  width: 200,
                }
              ]}>
                <Text style={{
                  fontSize: theme.typography.fontSizes.base,
                  fontWeight: theme.typography.fontWeights.semibold as any,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.xs,
                }}>{station.name}</Text>
                <Text style={{
                  fontSize: theme.typography.fontSizes.sm,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.xs,
                }}>{station.slots}/{station.total} available • {station.speed} charging</Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <Text style={{
                    fontSize: theme.typography.fontSizes.sm,
                    color: theme.colors.success,
                    fontWeight: theme.typography.fontWeights.semibold as any,
                  }}>₹{station.price}/hr</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, marginRight: 4 }}>⚡</Text>
                    <Text style={{
                      fontSize: theme.typography.fontSizes.xs,
                      color: theme.colors.text.tertiary,
                    }}>{station.distance} km</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Available Parking Spaces */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.base }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: theme.typography.fontSizes['2xl'], fontWeight: 'bold', color: theme.colors.text.primary }}>112</Text>
              <Text style={{ fontSize: theme.typography.fontSizes.sm, color: theme.colors.text.secondary }}>Available</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: theme.typography.fontSizes['2xl'], fontWeight: 'bold', color: theme.colors.text.primary }}>119</Text>
              <Text style={{ fontSize: theme.typography.fontSizes.sm, color: theme.colors.text.secondary }}>Available</Text>
            </View>
          </View>

          {/* Car illustrations */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.base }}>
            <View style={{ backgroundColor: theme.colors.accent, borderRadius: theme.borderRadius.base, padding: theme.spacing.sm, alignItems: 'center', width: '22%' }}>
              <Image source={require('../../assets/userprofile.png')} style={{ width: 40, height: 40 }} />
            </View>
            <View style={{ backgroundColor: theme.colors.accent, borderRadius: theme.borderRadius.base, padding: theme.spacing.sm, alignItems: 'center', width: '22%' }}>
              <Image source={require('../../assets/userprofile.png')} style={{ width: 40, height: 40 }} />
            </View>
            <View style={{ backgroundColor: theme.colors.accent, borderRadius: theme.borderRadius.base, padding: theme.spacing.sm, alignItems: 'center', width: '22%' }}>
              <Image source={require('../../assets/userprofile.png')} style={{ width: 40, height: 40 }} />
            </View>
            <View style={{ backgroundColor: theme.colors.accent, borderRadius: theme.borderRadius.base, padding: theme.spacing.sm, alignItems: 'center', width: '22%' }}>
              <Image source={require('../../assets/userprofile.png')} style={{ width: 40, height: 40 }} />
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={simulateBookingProcess}
          style={[commonStyles.button, { marginBottom: theme.spacing.xl }]}>
          <Text style={[commonStyles.buttonText, { flexDirection: 'row', alignItems: 'center' }]}>Test Booking & QR →</Text>
        </TouchableOpacity>

        {/* Free Parking Available Section */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <Text style={{
            fontSize: theme.typography.fontSizes.lg,
            fontWeight: theme.typography.fontWeights.semibold as any,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.base,
          }}>Free parking available</Text>

          <View style={[
            commonStyles.card,
            {
              backgroundColor: theme.colors.backgroundCard,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.success,
            }
          ]}>
            <Text style={{
              fontSize: theme.typography.fontSizes.base,
              fontWeight: theme.typography.fontWeights.semibold as any,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.xs,
            }}>Central Park Area</Text>
            <Text style={{
              fontSize: theme.typography.fontSizes.sm,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs,
            }}>Available for next 2 hours • 15 spots remaining</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: theme.typography.fontSizes.sm,
                color: theme.colors.success,
                fontWeight: theme.typography.fontWeights.semibold as any,
                marginRight: theme.spacing.sm,
              }}>FREE</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../../assets/map.png')} style={{ width: 12, height: 12, marginRight: 4 }} />
                <Text style={{
                  fontSize: theme.typography.fontSizes.xs,
                  color: theme.colors.text.tertiary,
                }}>0.3 km away</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <Text style={{
            fontSize: theme.typography.fontSizes.lg,
            fontWeight: theme.typography.fontWeights.semibold as any,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.base,
          }}>Quick Actions</Text>

          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
            <TouchableOpacity
              onPress={() => onNavigateToMaps('find')}
              style={[
                commonStyles.buttonAccent,
                {
                  width: '48%',
                  marginBottom: theme.spacing.base,
                  paddingVertical: theme.spacing.lg,
                }
              ]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../../assets/Find_Parking.png')} style={{ width: 16, height: 16, marginRight: 8 }} />
                <Text style={commonStyles.buttonAccentText}>Find Parking</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onNavigateToMaps('book')}
              style={[
                commonStyles.socialButton,
                {
                  width: '48%',
                  marginBottom: theme.spacing.base,
                  paddingVertical: theme.spacing.lg,
                }
              ]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../../assets/Book_In_Advance.png')} style={{ width: 16, height: 16, marginRight: 8 }} />
                <Text style={{ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeights.semibold as any }}>
                  Book in Advance
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Parking */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <Text style={{
            fontSize: theme.typography.fontSizes.lg,
            fontWeight: theme.typography.fontWeights.semibold as any,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.base,
          }}>Recent Parking</Text>

          <View style={[
            commonStyles.card,
            {
              alignItems: 'flex-start',
            }
          ]}>
            <Text style={{
              fontSize: theme.typography.fontSizes.base,
              fontWeight: theme.typography.fontWeights.semibold as any,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.xs,
            }}>Mall Plaza Parking</Text>
            <Text style={{
              fontSize: theme.typography.fontSizes.sm,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs,
            }}>Yesterday, 2:30 PM - 5:45 PM</Text>
            <Text style={{
              fontSize: theme.typography.fontSizes.sm,
              color: theme.colors.primary,
              fontWeight: theme.typography.fontWeights.medium as any,
            }}>₹120</Text>
          </View>
        </View>

        {/* Nearby Parking */}
        <View>
          <Text style={{
            fontSize: theme.typography.fontSizes.lg,
            fontWeight: theme.typography.fontWeights.semibold as any,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.base,
          }}>Nearby Parking</Text>

          <TouchableOpacity style={[
            commonStyles.card,
            {
              alignItems: 'flex-start',
              marginBottom: theme.spacing.sm,
            }
          ]}>
            <Text style={{
              fontSize: theme.typography.fontSizes.base,
              fontWeight: theme.typography.fontWeights.semibold as any,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.xs,
            }}>City Center Parking</Text>
            <Text style={{
              fontSize: theme.typography.fontSizes.sm,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs,
            }}>0.5 km away • Available slots: 25</Text>
            <Text style={{
              fontSize: theme.typography.fontSizes.sm,
              color: theme.colors.primary,
              fontWeight: theme.typography.fontWeights.medium as any,
            }}>₹40/hour</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[
            commonStyles.card,
            {
              alignItems: 'flex-start',
            }
          ]}>
            <Text style={{
              fontSize: theme.typography.fontSizes.base,
              fontWeight: theme.typography.fontWeights.semibold as any,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.xs,
            }}>Metro Station Parking</Text>
            <Text style={{
              fontSize: theme.typography.fontSizes.sm,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs,
            }}>1.2 km away • Available slots: 12</Text>
            <Text style={{
              fontSize: theme.typography.fontSizes.sm,
              color: theme.colors.primary,
              fontWeight: theme.typography.fontWeights.medium as any,
            }}>₹30/hour</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing.lg,
        }}>
          <View style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.xl,
            alignItems: 'center',
            width: '100%',
            maxWidth: 320,
          }}>
            <Text style={{
              fontSize: theme.typography.fontSizes.xl,
              fontWeight: theme.typography.fontWeights.bold as any,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.base,
              textAlign: 'center',
            }}>Parking QR Code</Text>

            <View style={{
              width: 200,
              height: 200,
              backgroundColor: theme.colors.backgroundSecondary,
              borderRadius: theme.borderRadius.base,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: theme.spacing.lg,
              borderWidth: 2,
              borderColor: activeBooking?.qrCodeValid ? theme.colors.success : theme.colors.text.tertiary,
              overflow: 'hidden'
            }}>
              {activeBooking?.id ? (
                <Image
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${activeBooking.id}_${activeBooking.userId}_${activeBooking.slotId}` }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <Text style={{ fontSize: 48, textAlign: 'center' }}>📦</Text>
              )}
              {!activeBooking?.id && (
                <Text style={{
                  fontSize: theme.typography.fontSizes.sm,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  marginTop: theme.spacing.xs,
                }}>
                  {activeBooking?.qrCodeValid ? 'Scan to Check In' : 'QR Code Used'}
                </Text>
              )}
            </View>

            {activeBooking && (
              <View style={{ alignItems: 'center', marginBottom: theme.spacing.base }}>
                <Text style={{
                  fontSize: theme.typography.fontSizes.base,
                  color: theme.colors.text.primary,
                  fontWeight: theme.typography.fontWeights.medium as any,
                  marginBottom: theme.spacing.xs,
                }}>Booking #{activeBooking.id}</Text>
                <Text style={{
                  fontSize: theme.typography.fontSizes.sm,
                  color: activeBooking.qrCodeValid ? theme.colors.success : theme.colors.error,
                  fontWeight: theme.typography.fontWeights.medium as any,
                }}>
                  Status: {activeBooking.qrCodeValid ? 'Active' : 'Used'}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setShowQRModal(false)}
              style={[
                commonStyles.button,
                { width: '100%' }
              ]}
            >
              <Text style={commonStyles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
