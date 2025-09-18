import React, { useState, useEffect } from 'react';
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
import { 
  validateFullName,
  validatePhoneNumber,
  validateVehicleNumber,
  validateEmail,
  validatePassword,
  formatVehicleNumber,
  formatPhoneNumber,
  ValidationResult 
} from '../utils/validation';
import { handleSocialLogin as processSocialLogin } from '../utils/socialLogin';
import { testFirebaseConnection, testNetworkConnection } from '../utils/networkTest';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import FirebaseConfig from '../config/firebase';
import FirestoreService from '../services/FirestoreService';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const [userType, setUserType] = useState<'customer' | 'owner' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [ownerName, setOwnerName] = useState('');
  
  
  const [errors, setErrors] = useState<{
    customerName?: string;
    phoneNumber?: string;
    vehicleNumber?: string;
    email?: string;
    password?: string;
    ownerName?: string;
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
  }>({});

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        await FirebaseConfig.getInstance().initialize();
        setFirebaseInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        Alert.alert('Error', 'Failed to initialize app. Please check your internet connection.');
      }
    };

    initializeFirebase();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!userType) {
      Alert.alert('Error', 'Please select user type (Customer or Owner)');
      return false;
    }
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.errorMessage;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errorMessage;
    }
    
    if (userType === 'customer') {
      const nameValidation = validateFullName(customerName);
      if (!nameValidation.isValid) {
        newErrors.customerName = nameValidation.errorMessage;
      }
      
      const phoneValidation = validatePhoneNumber(phoneNumber);
      if (!phoneValidation.isValid) {
        newErrors.phoneNumber = phoneValidation.errorMessage;
      }
      
      const vehicleValidation = validateVehicleNumber(vehicleNumber);
      if (!vehicleValidation.isValid) {
        newErrors.vehicleNumber = vehicleValidation.errorMessage;
      }
    } else if (userType === 'owner') {
      const ownerNameValidation = validateFullName(ownerName);
      if (!ownerNameValidation.isValid) {
        newErrors.ownerName = ownerNameValidation.errorMessage;
      }
      
      if (!businessName || businessName.trim().length === 0) {
        newErrors.businessName = 'Business name is required';
      }
      
      if (!businessAddress || businessAddress.trim().length === 0) {
        newErrors.businessAddress = 'Business address is required';
      }
      
      const businessPhoneValidation = validatePhoneNumber(businessPhone);
      if (!businessPhoneValidation.isValid) {
        newErrors.businessPhone = businessPhoneValidation.errorMessage;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleRegister = async (): Promise<void> => {
    if (!validateForm() || !firebaseInitialized) {
      if (!firebaseInitialized) {
        Alert.alert('Error', 'App is still initializing. Please wait a moment.');
      }
      return;
    }
    
    setIsLoading(true);
    
    console.log('Testing network connectivity...');
    const networkOk = await testNetworkConnection();
    if (!networkOk) {
      Alert.alert('No Internet Connection', 'Please check your internet connection and try again.');
      setIsLoading(false);
      return;
    }
    
    console.log('Testing Firebase connectivity...');
    const firebaseOk = await testFirebaseConnection();
    if (!firebaseOk) {
      Alert.alert('Service Unavailable', 'Unable to connect to registration services. Please try again later.');
      setIsLoading(false);
      return;
    }
    
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      if (user) {
        const firestoreService = FirestoreService.getInstance();
        const timestamp = new Date().toISOString();
        
        const displayName = userType === 'customer' ? customerName : ownerName;
        await user.updateProfile({ displayName });
        
        await firestoreService.createOrUpdateUserProfile({
          id: user.uid,
          email: user.email || '',
          displayName,
          phoneNumber: userType === 'customer' ? phoneNumber : businessPhone,
          isActive: true,
          role: userType || 'customer',
        });
        
        if (userType === 'customer') {
          await firestoreService.createOrUpdateCustomerProfile({
            userId: user.uid,
            fullName: customerName,
            phoneNumber,
            vehicleNumber,
          });
        } else if (userType === 'owner') {
          await firestoreService.getFirestore().collection('ownerProfiles').doc(user.uid).set({
            ownerName,
            businessName,
            businessAddress,
            businessPhone,
            createdAt: firestore.Timestamp.now(),
          });
        }
        
        await firestoreService.trackUserActivity({
          userId: user.uid,
          type: 'register',
          description: `User registered as ${userType}`,
          metadata: {
            userType,
            timestamp,
          },
        });
        
        await auth().signOut();
        
        Alert.alert(
          'Registration Successful!', 
          'Your account has been created. Please login to continue.',
          [
            {
              text: 'OK',
              onPress: () => onNavigateToLogin()
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email address is already in use. Try logging in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use a stronger password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and make sure you are connected to the internet. If using emulator, try restarting it.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = `Registration failed: ${error.message}`;
          break;
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple'): Promise<void> => {
    try {
      const result = await processSocialLogin(provider);
      
      if (result.success && result.userData) {
        if (userType === 'customer') {
          setCustomerName(result.userData.name);
        } else if (userType === 'owner') {
          setOwnerName(result.userData.name);
        }
        setEmail(result.userData.email);
        setPassword(result.userData.password);
        
        setErrors(prev => ({
          ...prev,
          customerName: undefined,
          ownerName: undefined,
          email: undefined,
          password: undefined,
        }));
        
        Alert.alert(
          'Account Selected',
          `Name and password have been auto-filled. Please enter your ${userType === 'customer' ? 'vehicle number and phone number' : 'business details'} to complete registration.`
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Social login failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        contentContainerStyle={commonStyles.centerContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
          <Text style={commonStyles.title}>Join the Community</Text>
          <Text style={[commonStyles.subtitle, { marginBottom: theme.spacing.base }]}>Create your account to start parking</Text>
        </View>

        
        <View style={{ width: '100%', marginBottom: theme.spacing.lg }}>
          <Text style={{
            fontSize: theme.typography.fontSizes.base,
            fontWeight: theme.typography.fontWeights.medium as any,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
          }}>Select Account Type:</Text>
          
          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', gap: theme.spacing.base }}>
            <TouchableOpacity
              style={[
                commonStyles.zoneButton,
                { minWidth: 120, flexDirection: 'row', alignItems: 'center' },
                userType === 'customer' && commonStyles.zoneButtonActive
              ]}
              onPress={() => setUserType('customer')}>
              <Image source={require('../assets/userprofile.png')} style={{ width: 16, height: 16, marginRight: 8 }} />
              <Text style={[
                commonStyles.zoneButtonText,
                userType === 'customer' && commonStyles.zoneButtonTextActive,
              ]}>Customer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                commonStyles.zoneButton,
                { minWidth: 120, flexDirection: 'row', alignItems: 'center' },
                userType === 'owner' && commonStyles.zoneButtonActive
              ]}
              onPress={() => setUserType('owner')}>
              <Image source={require('../assets/Owner.png')} style={{ width: 16, height: 16, marginRight: 8 }} />
              <Text style={[
                commonStyles.zoneButtonText,
                userType === 'owner' && commonStyles.zoneButtonTextActive,
              ]}>Owner</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Conditional Form Fields */}
        {userType === 'customer' && (
          <>
            {/* Customer Name */}
            <View style={commonStyles.inputContainer}>
              <TextInput
                style={[commonStyles.input, errors.customerName && { borderColor: theme.colors.error }]}
                placeholder="Full Name"
                placeholderTextColor={theme.colors.text.tertiary}
                value={customerName}
                onChangeText={(text) => {
                  setCustomerName(text);
                  // Clear error when user starts typing
                  if (errors.customerName) {
                    setErrors(prev => ({ ...prev, customerName: undefined }));
                  }
                }}
                autoCapitalize="words"
              />
              {errors.customerName && (
                <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
                  {errors.customerName}
                </Text>
              )}
            </View>
            
            {/* Phone Number */}
            <View style={commonStyles.inputContainer}>
              <TextInput
                style={[commonStyles.input, errors.phoneNumber && { borderColor: theme.colors.error }]}
                placeholder="Phone Number (10 digits)"
                placeholderTextColor={theme.colors.text.tertiary}
                value={phoneNumber}
                onChangeText={(text) => {
                  const formatted = formatPhoneNumber(text);
                  if (formatted.length <= 10) {
                    setPhoneNumber(formatted);
                  }
                  // Clear error when user starts typing
                  if (errors.phoneNumber) {
                    setErrors(prev => ({ ...prev, phoneNumber: undefined }));
                  }
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {errors.phoneNumber && (
                <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
                  {errors.phoneNumber}
                </Text>
              )}
            </View>
            
            {/* Vehicle Number */}
            <View style={commonStyles.inputContainer}>
              <TextInput
                style={[commonStyles.input, errors.vehicleNumber && { borderColor: theme.colors.error }]}
                placeholder="Vehicle Number (AB12CD3456)"
                placeholderTextColor={theme.colors.text.tertiary}
                value={vehicleNumber}
                onChangeText={(text) => {
                  const formatted = formatVehicleNumber(text);
                  if (formatted.length <= 10) {
                    setVehicleNumber(formatted);
                  }
                  // Clear error when user starts typing
                  if (errors.vehicleNumber) {
                    setErrors(prev => ({ ...prev, vehicleNumber: undefined }));
                  }
                }}
                autoCapitalize="characters"
                maxLength={10}
              />
              {errors.vehicleNumber && (
                <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
                  {errors.vehicleNumber}
                </Text>
              )}
            </View>
          </>
        )}
        
        {userType === 'owner' && (
          <>
            {/* Owner Name */}
            <View style={commonStyles.inputContainer}>
              <TextInput
                style={[commonStyles.input, errors.ownerName && { borderColor: theme.colors.error }]}
                placeholder="Owner Name"
                placeholderTextColor={theme.colors.text.tertiary}
                value={ownerName}
                onChangeText={(text) => {
                  setOwnerName(text);
                  // Clear error when user starts typing
                  if (errors.ownerName) {
                    setErrors(prev => ({ ...prev, ownerName: undefined }));
                  }
                }}
                autoCapitalize="words"
              />
              {errors.ownerName && (
                <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
                  {errors.ownerName}
                </Text>
              )}
            </View>
            
            {/* Business Name */}
            <View style={commonStyles.inputContainer}>
              <TextInput
                style={[commonStyles.input, errors.businessName && { borderColor: theme.colors.error }]}
                placeholder="Business Name"
                placeholderTextColor={theme.colors.text.tertiary}
                value={businessName}
                onChangeText={(text) => {
                  setBusinessName(text);
                  // Clear error when user starts typing
                  if (errors.businessName) {
                    setErrors(prev => ({ ...prev, businessName: undefined }));
                  }
                }}
                autoCapitalize="words"
              />
              {errors.businessName && (
                <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
                  {errors.businessName}
                </Text>
              )}
            </View>
            
            {/* Business Address */}
            <View style={commonStyles.inputContainer}>
              <TextInput
                style={[commonStyles.input, errors.businessAddress && { borderColor: theme.colors.error }]}
                placeholder="Business Address"
                placeholderTextColor={theme.colors.text.tertiary}
                value={businessAddress}
                onChangeText={(text) => {
                  setBusinessAddress(text);
                  // Clear error when user starts typing
                  if (errors.businessAddress) {
                    setErrors(prev => ({ ...prev, businessAddress: undefined }));
                  }
                }}
                multiline
                numberOfLines={2}
              />
              {errors.businessAddress && (
                <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
                  {errors.businessAddress}
                </Text>
              )}
            </View>
            
            {/* Business Phone */}
            <View style={commonStyles.inputContainer}>
              <TextInput
                style={[commonStyles.input, errors.businessPhone && { borderColor: theme.colors.error }]}
                placeholder="Business Phone (10 digits)"
                placeholderTextColor={theme.colors.text.tertiary}
                value={businessPhone}
                onChangeText={(text) => {
                  const formatted = formatPhoneNumber(text);
                  if (formatted.length <= 10) {
                    setBusinessPhone(formatted);
                  }
                  // Clear error when user starts typing
                  if (errors.businessPhone) {
                    setErrors(prev => ({ ...prev, businessPhone: undefined }));
                  }
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {errors.businessPhone && (
                <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
                  {errors.businessPhone}
                </Text>
              )}
            </View>
          </>
        )}

        {/* Email Input */}
        {userType && (
          <View style={commonStyles.inputContainer}>
            <TextInput
              style={[commonStyles.input, errors.email && { borderColor: theme.colors.error }]}
              placeholder="Email address"
              placeholderTextColor={theme.colors.text.tertiary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                // Clear error when user starts typing
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && (
              <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
                {errors.email}
              </Text>
            )}
          </View>
        )}

        {/* Password Input */}
        {userType && (
          <View style={commonStyles.inputContainer}>
            <TextInput
              style={[commonStyles.input, errors.password && { borderColor: theme.colors.error }]}
              placeholder="Password (minimum 6 characters)"
              placeholderTextColor={theme.colors.text.tertiary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                // Clear error when user starts typing
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: undefined }));
                }
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.password && (
              <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
                {errors.password}
              </Text>
            )}
          </View>
        )}

        {/* Remember Me Checkbox */}
        {userType && (
          <View style={commonStyles.rememberMeContainer}>
            <TouchableOpacity
              style={[
                commonStyles.checkbox,
                rememberMe && commonStyles.checkboxChecked,
              ]}
              onPress={() => setRememberMe(!rememberMe)}>
            {rememberMe && (
              <Image 
                source={require('../assets/userprofile.png')} 
                style={{ width: 12, height: 12, tintColor: theme.colors.primary }} 
              />
            )}
            </TouchableOpacity>
            <Text style={commonStyles.checkboxText}>Remember me</Text>
          </View>
        )}

        {/* Sign Up Button */}
        {userType && (
          <View style={[commonStyles.inputContainer, { marginBottom: theme.spacing.lg }]}>
            <TouchableOpacity style={commonStyles.buttonAccent} onPress={handleRegister}>
              <Text style={commonStyles.buttonAccentText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}


        {/* Navigate to Login */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.lg }}>
          <Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSizes.base }}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={onNavigateToLogin}>
            <Text style={commonStyles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <LoadingScreen
        visible={isLoading}
        message="Creating your account..."
      />
    </SafeAreaView>
  );
};
