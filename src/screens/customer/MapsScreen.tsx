import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { NavigationMode } from '../../types';

interface MapsScreenProps {
  mode?: NavigationMode;
}

export const MapsScreen: React.FC<MapsScreenProps> = ({ mode }) => {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={{ 
        flex: 1, 
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xl + theme.spacing.sm,
        paddingBottom: theme.spacing.xl + theme.spacing.base
      }}>
        
        {/* Header */}
        <View style={[commonStyles.headerContainer, { marginBottom: theme.spacing.lg, borderBottomWidth: 0, paddingHorizontal: 0 }]}>
          <View>
            <Text style={[commonStyles.headerTitle, { color: theme.colors.text.primary }]}>
              {mode === 'book' ? 'Book Parking Slot' : 'Parking Nearby'}
            </Text>
            <Text style={[commonStyles.headerSubtitle, { color: theme.colors.text.secondary }]}>
              {mode === 'book' ? 'Select a slot and time for booking' : 'Find parking spots around you'}
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
            <Text style={{ color: theme.colors.text.tertiary }}>
              Search Location
            </Text>
          </TouchableOpacity>
        </View>

        {/* Map Placeholder */}
        <View style={{
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.borderRadius.xl,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <View style={{ alignItems: 'center' }}>
            <Image 
              source={require('../../assets/map.png')} 
              style={{ width: 40, height: 40, marginBottom: 8 }}
            />
            <Text style={{
              fontSize: theme.typography.fontSizes.lg,
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}>
              Interactive Map{'\n'}Coming Soon
            </Text>
          </View>
        </View>

        {/* Map Controls */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.base,
        }}>
          <TouchableOpacity
            style={[
              commonStyles.zoneButton,
              { minWidth: '30%' }
            ]}>
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
              { minWidth: '30%' }
            ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image 
                source={require('../../assets/Find_Parking.png')} 
                style={{ width: 12, height: 12, marginRight: 4, tintColor: theme.colors.primary }}
              />
              <Text style={[commonStyles.zoneButtonText, commonStyles.zoneButtonTextActive]}>Available</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              commonStyles.zoneButton,
              { minWidth: '30%' }
            ]}>
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
          style={[
            commonStyles.buttonAccent,
            { marginTop: theme.spacing.base }
          ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image 
              source={require('../../assets/Nearby.png')} 
              style={{ width: 16, height: 16, marginRight: 8, tintColor: theme.colors.surface }}
            />
            <Text style={commonStyles.buttonAccentText}>Use Current Location</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
