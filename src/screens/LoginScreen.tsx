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
import { LoadingScreen } from '../components/LoadingScreen';
import { validateEmail, validatePassword, ValidationResult } from '../utils/validation';
import { handleSocialLogin as processSocialLogin } from '../utils/socialLogin';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToHome: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister, onNavigateToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Error states
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

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
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Implement actual login logic
      // Simulate API call
      await new Promise<void>(res => setTimeout(() => res(), 1500));
      
      // Navigate to home screen after successful login
      onNavigateToHome();
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please check your credentials and try again.');
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
    Alert.alert('Forgot Password', 'Password reset functionality would be implemented here');
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        contentContainerStyle={commonStyles.centerContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
          <Text style={commonStyles.title}>Welcome Back</Text>
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

        {/* Divider */}
        <View style={commonStyles.dividerContainer}>
          <View style={commonStyles.divider} />
          <Text style={commonStyles.dividerText}>OR</Text>
          <View style={commonStyles.divider} />
        </View>

        {/* Social Login Buttons */}
        <View style={{
          flexDirection: 'row',
          width: '100%',
          marginBottom: theme.spacing.lg,
          gap: theme.spacing.sm,
        }}>
          <TouchableOpacity
            style={[commonStyles.socialButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
            onPress={() => handleSocialLogin('google')}>
            <Image source={require('../assets/Google.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
            <Text style={{ 
              color: theme.colors.text.primary, 
              fontSize: theme.typography.fontSizes.sm,
              fontWeight: theme.typography.fontWeights.medium as any
            }}>
              Google
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[commonStyles.socialButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
            onPress={() => handleSocialLogin('facebook')}>
            <Image source={require('../assets/Facebook.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
            <Text style={{ 
              color: theme.colors.text.primary, 
              fontSize: theme.typography.fontSizes.sm,
              fontWeight: theme.typography.fontWeights.medium as any
            }}>
              Facebook
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[commonStyles.socialButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
            onPress={() => handleSocialLogin('apple')}>
            <Image source={require('../assets/Apple.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
            <Text style={{ 
              color: theme.colors.text.primary, 
              fontSize: theme.typography.fontSizes.sm,
              fontWeight: theme.typography.fontWeights.medium as any
            }}>
              Apple
            </Text>
          </TouchableOpacity>
        </View>

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
