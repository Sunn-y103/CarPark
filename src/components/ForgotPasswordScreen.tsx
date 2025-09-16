import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { theme } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';
import { LoadingScreen } from './LoadingScreen';

interface ForgotPasswordScreenProps {
  onNavigateBack: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onNavigateBack }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Error states
  const [errors, setErrors] = useState<{
    vehicleNumber?: string;
    phoneNumber?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    // Validate vehicle number
    if (!vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required';
    } else if (vehicleNumber.trim().length < 3) {
      newErrors.vehicleNumber = 'Please enter a valid vehicle number';
    }
    
    // Validate phone number
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    
    // Validate new password
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate password reset process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. Please log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => onNavigateBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        contentContainerStyle={commonStyles.centerContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        {/* Header with Back Button */}
        <View style={{ 
          width: '100%', 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base 
        }}>
          <TouchableOpacity 
            onPress={onNavigateBack}
            style={{
              padding: theme.spacing.sm,
              marginRight: theme.spacing.sm,
            }}>
            <Image 
              source={require('../assets/Back_Arrow.png')} 
              style={{ width: 24, height: 24, tintColor: theme.colors.primary }} 
            />
          </TouchableOpacity>
          <Text style={[commonStyles.title, { flex: 1, textAlign: 'center', marginRight: 48 }]}>
            Reset Password
          </Text>
        </View>

        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
          <Image 
            source={require('../assets/CarPark_Logo.png')} 
            style={{ 
              width: 100, 
              height: 100, 
              marginBottom: theme.spacing.lg,
              resizeMode: 'contain' 
            }} 
          />
          <Text style={[commonStyles.subtitle, { textAlign: 'center' }]}>
            Enter your vehicle number and phone number to reset your password
          </Text>
        </View>

        {/* Vehicle Number Input */}
        <View style={commonStyles.inputContainer}>
          <TextInput
            style={[commonStyles.input, errors.vehicleNumber && { borderColor: theme.colors.error }]}
            placeholder="Vehicle Number (e.g., ABC1234)"
            placeholderTextColor={theme.colors.text.tertiary}
            value={vehicleNumber}
            onChangeText={(text) => {
              setVehicleNumber(text.toUpperCase());
              if (errors.vehicleNumber) {
                setErrors(prev => ({ ...prev, vehicleNumber: undefined }));
              }
            }}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {errors.vehicleNumber && (
            <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
              {errors.vehicleNumber}
            </Text>
          )}
        </View>

        {/* Phone Number Input */}
        <View style={commonStyles.inputContainer}>
          <TextInput
            style={[commonStyles.input, errors.phoneNumber && { borderColor: theme.colors.error }]}
            placeholder="Phone Number"
            placeholderTextColor={theme.colors.text.tertiary}
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              if (errors.phoneNumber) {
                setErrors(prev => ({ ...prev, phoneNumber: undefined }));
              }
            }}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.phoneNumber && (
            <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
              {errors.phoneNumber}
            </Text>
          )}
        </View>

        {/* New Password Input */}
        <View style={commonStyles.inputContainer}>
          <TextInput
            style={[commonStyles.input, errors.newPassword && { borderColor: theme.colors.error }]}
            placeholder="New Password (minimum 6 characters)"
            placeholderTextColor={theme.colors.text.tertiary}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.newPassword) {
                setErrors(prev => ({ ...prev, newPassword: undefined }));
              }
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.newPassword && (
            <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
              {errors.newPassword}
            </Text>
          )}
        </View>

        {/* Confirm Password Input */}
        <View style={commonStyles.inputContainer}>
          <TextInput
            style={[commonStyles.input, errors.confirmPassword && { borderColor: theme.colors.error }]}
            placeholder="Confirm New Password"
            placeholderTextColor={theme.colors.text.tertiary}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.confirmPassword && (
            <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
              {errors.confirmPassword}
            </Text>
          )}
        </View>

        {/* Reset Password Button */}
        <View style={[commonStyles.inputContainer, { marginTop: theme.spacing.lg }]}>
          <TouchableOpacity style={commonStyles.buttonAccent} onPress={handleResetPassword}>
            <Text style={commonStyles.buttonAccentText}>Reset Password</Text>
          </TouchableOpacity>
        </View>

        {/* Back to Login */}
        <TouchableOpacity 
          onPress={onNavigateBack}
          style={{ marginTop: theme.spacing.lg }}>
          <Text style={commonStyles.linkText}>Back to Login</Text>
        </TouchableOpacity>

      </ScrollView>
      
      <LoadingScreen
        visible={isLoading}
        message="Resetting your password..."
      />
    </SafeAreaView>
  );
};
