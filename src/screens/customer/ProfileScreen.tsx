import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { EditProfileScreen } from './EditProfileScreen';
import { User, Vehicle } from '../../types';
import { AuthUtils } from '../../utils/authUtils';
import { useUserProfile } from '../../hooks/useUserProfile';
import { LoadingScreen } from '../../components/LoadingScreen';
import auth from '@react-native-firebase/auth';

interface ProfileScreenProps {
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const { user, vehicles, isLoading, isError, error, updateUserProfile, refreshProfile } = useUserProfile();
  
  // Use actual user data if available, show loading state if not
  const userData = user || {
    id: '1',
    name: 'Loading...',
    email: 'Loading...',
    phone: '',
  };
  
  // Don't allow editing if user data is still loading
  const canEdit = user !== null && !isLoading;
  
  const userVehicles = vehicles.length > 0 ? vehicles : [
    {
      id: '1',
      make: 'No vehicle',
      model: '',
      licensePlate: 'Not set',
      color: '',
      year: new Date().getFullYear(),
      type: 'car' as const,
    },
  ];

  const handleEditProfile = () => {
    if (canEdit) {
      setShowEditProfile(true);
    }
  };

  const handleSaveProfile = async (newUserData: User, newVehicles: Vehicle[]) => {
    try {
      await updateUserProfile(newUserData, newVehicles);
      setShowEditProfile(false);
      
      // Explicitly refresh profile data to ensure all screens get latest data
      await refreshProfile();
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleBackFromEdit = () => {
    setShowEditProfile(false);
  };

  if (showEditProfile) {
    return (
      <EditProfileScreen
        onBack={handleBackFromEdit}
        onSave={handleSaveProfile}
        initialUserData={userData}
        initialVehicles={userVehicles}
      />
    );
  }

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Notification settings would be implemented here');
  };

  const handleSecurity = () => {
    Alert.alert('Security', 'Security settings would be implemented here');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Support/Help section would be implemented here');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => {
            AuthUtils.performLogout(userData.id, onLogout);
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        contentContainerStyle={{ 
          flexGrow: 1, 
          padding: theme.spacing.lg,
          paddingTop: theme.spacing.xl + theme.spacing.sm,
          paddingBottom: theme.spacing.xl + theme.spacing.base
        }}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <Text style={[commonStyles.title, { textAlign: 'left' }]}>
            Profile
          </Text>
        </View>

        {/* User Info Card */}
        <View style={[
          commonStyles.socialButton,
          { 
            width: '100%',
            paddingVertical: theme.spacing.xl,
            alignItems: 'center',
            marginBottom: theme.spacing.xl,
          }
        ]}>
          {/* Profile Avatar */}
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.base,
          }}>
            <Text style={{
              fontSize: theme.typography.fontSizes['2xl'],
              color: theme.colors.surface,
              fontWeight: theme.typography.fontWeights.bold as any,
            }}>
              {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          
          <Text style={{
            fontSize: theme.typography.fontSizes.xl,
            fontWeight: theme.typography.fontWeights.bold as any,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.xs,
          }}>
            {userData.name}
          </Text>
          
          <Text style={{
            fontSize: theme.typography.fontSizes.base,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.xs,
          }}>
            {userData.email}
          </Text>
          
          <Text style={{
            fontSize: theme.typography.fontSizes.sm,
            color: theme.colors.text.tertiary,
          }}>
            Vehicles: {userVehicles.map(v => v.licensePlate).filter(plate => plate !== 'Not set').join(', ') || 'No vehicles added'}
          </Text>
        </View>

        {/* Menu Options */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          {/* Edit Profile */}
          <TouchableOpacity
            onPress={handleEditProfile}
            disabled={!canEdit}
            style={[
              commonStyles.socialButton,
              { 
                width: '100%',
                paddingVertical: theme.spacing.lg,
                alignItems: 'flex-start',
                marginBottom: theme.spacing.sm,
                opacity: canEdit ? 1 : 0.6,
              }
            ]}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
            }}>
              <Image 
                source={require('../../assets/Edit_Profile.png')} 
                style={{ width: 20, height: 20, marginRight: theme.spacing.base }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: theme.typography.fontSizes.base,
                  fontWeight: theme.typography.fontWeights.medium as any,
                  color: theme.colors.text.primary,
                }}>
                  Edit Profile
                </Text>
                <Text style={{
                  fontSize: theme.typography.fontSizes.sm,
                  color: theme.colors.text.secondary,
                }}>
                  Update your personal information
                </Text>
              </View>
              <Text style={{
                fontSize: theme.typography.fontSizes.lg,
                color: theme.colors.text.tertiary,
              }}>
                ›
              </Text>
            </View>
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            onPress={handleNotifications}
            style={[
              commonStyles.socialButton,
              { 
                width: '100%',
                paddingVertical: theme.spacing.lg,
                alignItems: 'flex-start',
                marginBottom: theme.spacing.sm,
              }
            ]}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
            }}>
              <Image 
                source={require('../../assets/Notifications.png')} 
                style={{ width: 20, height: 20, marginRight: theme.spacing.base }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: theme.typography.fontSizes.base,
                  fontWeight: theme.typography.fontWeights.medium as any,
                  color: theme.colors.text.primary,
                }}>
                  Notifications
                </Text>
                <Text style={{
                  fontSize: theme.typography.fontSizes.sm,
                  color: theme.colors.text.secondary,
                }}>
                  Manage notification preferences
                </Text>
              </View>
              <Text style={{
                fontSize: theme.typography.fontSizes.lg,
                color: theme.colors.text.tertiary,
              }}>
                ›
              </Text>
            </View>
          </TouchableOpacity>

          {/* Security */}
          <TouchableOpacity
            onPress={handleSecurity}
            style={[
              commonStyles.socialButton,
              { 
                width: '100%',
                paddingVertical: theme.spacing.lg,
                alignItems: 'flex-start',
                marginBottom: theme.spacing.sm,
              }
            ]}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
            }}>
              <Image 
                source={require('../../assets/Security&Privacy.png')} 
                style={{ width: 20, height: 20, marginRight: theme.spacing.base }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: theme.typography.fontSizes.base,
                  fontWeight: theme.typography.fontWeights.medium as any,
                  color: theme.colors.text.primary,
                }}>
                  Security & Privacy
                </Text>
                <Text style={{
                  fontSize: theme.typography.fontSizes.sm,
                  color: theme.colors.text.secondary,
                }}>
                  Password and privacy settings
                </Text>
              </View>
              <Text style={{
                fontSize: theme.typography.fontSizes.lg,
                color: theme.colors.text.tertiary,
              }}>
                ›
              </Text>
            </View>
          </TouchableOpacity>

          {/* Support */}
          <TouchableOpacity
            onPress={handleSupport}
            style={[
              commonStyles.socialButton,
              { 
                width: '100%',
                paddingVertical: theme.spacing.lg,
                alignItems: 'flex-start',
                marginBottom: theme.spacing.sm,
              }
            ]}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
            }}>
              <Image 
                source={require('../../assets/Help&Support.png')} 
                style={{ width: 20, height: 20, marginRight: theme.spacing.base }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: theme.typography.fontSizes.base,
                  fontWeight: theme.typography.fontWeights.medium as any,
                  color: theme.colors.text.primary,
                }}>
                  Help & Support
                </Text>
                <Text style={{
                  fontSize: theme.typography.fontSizes.sm,
                  color: theme.colors.text.secondary,
                }}>
                  Get help and contact support
                </Text>
              </View>
              <Text style={{
                fontSize: theme.typography.fontSizes.lg,
                color: theme.colors.text.tertiary,
              }}>
                ›
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <Text style={{
            fontSize: theme.typography.fontSizes.lg,
            fontWeight: theme.typography.fontWeights.semibold as any,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.base,
          }}>App Information</Text>
          
          <View style={[
            commonStyles.socialButton,
            { 
              width: '100%',
              paddingVertical: theme.spacing.lg,
              alignItems: 'flex-start',
            }
          ]}>
            <Text style={{
              fontSize: theme.typography.fontSizes.base,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs,
            }}>
              Version: 1.0.0
            </Text>
            <Text style={{
              fontSize: theme.typography.fontSizes.sm,
              color: theme.colors.text.tertiary,
            }}>
              Major CarPark © 2024
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[
            commonStyles.button,
            { 
              backgroundColor: theme.colors.error,
              marginBottom: theme.spacing.base,
            }
          ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            
            <Text style={[commonStyles.buttonText, { color: theme.colors.surface }]}>
              Logout
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      
      <LoadingScreen
        visible={isLoading}
        message="Loading profile..."
      />
      
      {isError && (
        <View style={{
          position: 'absolute',
          top: 100,
          left: 20,
          right: 20,
          backgroundColor: theme.colors.error,
          padding: theme.spacing.base,
          borderRadius: theme.borderRadius.base,
        }}>
          <Text style={{ color: theme.colors.surface, textAlign: 'center' }}>
            Error: {error}
          </Text>
          <TouchableOpacity 
            onPress={refreshProfile}
            style={{
              marginTop: theme.spacing.xs,
              alignItems: 'center',
            }}>
            <Text style={{ color: theme.colors.surface, fontWeight: 'bold' }}>
              Tap to retry
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};
