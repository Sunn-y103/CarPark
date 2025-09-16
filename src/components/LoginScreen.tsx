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
import { validateEmail, validatePassword, ValidationResult } from '../utils/validation';
import { handleSocialLogin as processSocialLogin } from '../utils/socialLogin';
import auth from '@react-native-firebase/auth';
import FirebaseConfig from '../config/firebase';
import { SafeFirestoreService } from '../services/SafeFirestoreService';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToHome: () => void;
  onNavigateToForgotPassword?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister, onNavigateToHome, onNavigateToForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  
  // Error states
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Initialize Firebase on component mount
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
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.errorMessage;
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errorMessage;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleLogin = async (): Promise<void> => {
    if (!validateForm() || !firebaseInitialized) {
      if (!firebaseInitialized) {
        Alert.alert('Error', 'App is still initializing. Please wait a moment.');
      }
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Sign in with Firebase Auth
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      if (user) {
        console.log('Firebase Auth successful, user logged in:', user.uid);
        
        // Navigate to home screen immediately after successful auth
        // The role will be determined in onAuthStateChanged
        onNavigateToHome();
        
        // Try Firestore operations in background (don't block login)
        const safeFirestore = SafeFirestoreService.getInstance();
        
        // Update user profile (background operation - won't throw errors)
        const profileResult = await safeFirestore.safeCreateOrUpdateUserProfile({
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || undefined,
          phoneNumber: user.phoneNumber || undefined,
          photoURL: user.photoURL || undefined,
          isActive: true,
        });
        
        // Track login activity (background operation - won't throw errors)
        const activityResult = await safeFirestore.safeTrackUserActivity({
          userId: user.uid,
          type: 'login',
          description: 'User logged in successfully',
          metadata: {
            method: 'email_password',
            timestamp: new Date().toISOString(),
          },
        });
        
        console.log('Firestore operations completed:', {
          profileUpdated: profileResult,
          activityTracked: activityResult,
          firestoreAvailable: safeFirestore.isFirestoreAvailable()
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle specific Firebase Auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple'): Promise<void> => {
    try {
      const result = await processSocialLogin(provider);
      
      if (result.success && result.userData) {
        // Auto-fill email and password
        setEmail(result.userData.email);
        setPassword(result.userData.password);
        
        // Clear any existing errors
        setErrors({});
        
        Alert.alert(
          'Account Selected',
          'Email and password have been auto-filled. You can now sign in.',
          [
            {
              text: 'Sign In Now',
              onPress: handleLogin
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Social login failed. Please try again.');
    }
  };

  const handleForgotPassword = (): void => {
    if (onNavigateToForgotPassword) {
      onNavigateToForgotPassword();
    } else {
      Alert.alert('Forgot Password', 'Password reset functionality would be implemented here');
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        contentContainerStyle={commonStyles.centerContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        {/* Header with Logo */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
          <Image 
            source={require('../assets/CarPark_Logo.png')} 
            style={{ 
              width: 120, 
              height: 120, 
              marginBottom: theme.spacing.lg,
              borderRadius:25,
              resizeMode: 'contain' 
            }} 
          />
          <Text style={commonStyles.title}>Welcome Back!</Text>
          <Text style={[commonStyles.subtitle, { marginBottom: theme.spacing.base }]}>Sign in to find your perfect parking spot</Text>
        </View>

        {/* Email Input */}
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

        {/* Password Input */}
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


        {/* Remember Me Checkbox */}
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

        {/* Login Button */}
        <View style={[commonStyles.inputContainer, { marginBottom: theme.spacing.base }]}>
          <TouchableOpacity style={commonStyles.buttonAccent} onPress={handleLogin}>
            <Text style={commonStyles.buttonAccentText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity 
          onPress={handleForgotPassword}
          style={{ marginBottom: theme.spacing.lg }}>
          <Text style={commonStyles.linkText}>Forgot password?</Text>
        </TouchableOpacity>


        {/* Navigate to Register */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSizes.base }}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={onNavigateToRegister}>
            <Text style={commonStyles.linkText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <LoadingScreen
        visible={isLoading}
        message="Logging you in..."
      />
    </SafeAreaView>
  );
};
