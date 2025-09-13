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

interface ProfileScreenProps {
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [userData, setUserData] = useState<User>({
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
  });
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      make: 'Honda',
      model: 'Civic',
      licensePlate: 'MH 12 AB 1234',
      color: 'Blue',
      year: 2020,
      type: 'car',
    },
  ]);

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleSaveProfile = (newUserData: User, newVehicles: Vehicle[]) => {
    setUserData(newUserData);
    setUserVehicles(newVehicles);
    setShowEditProfile(false);
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
          onPress: async () => {
            try {
              console.log('User confirmed logout');
              await onLogout();
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: theme.spacing.lg }}
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
            Vehicles: {userVehicles.map(v => v.licensePlate).join(', ')}
          </Text>
        </View>

        {/* Menu Options */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          {/* Edit Profile */}
          <TouchableOpacity
            onPress={handleEditProfile}
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
    </SafeAreaView>
  );
};
