/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/components/LoginScreen';
import { RegisterScreen } from './src/components/RegisterScreen';
import { ForgotPasswordScreen } from './src/components/ForgotPasswordScreen';
import { BottomTabNavigation } from './src/components/BottomTabNavigation';
import { OwnerBottomTabNavigation } from './src/components/OwnerBottomTabNavigation';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import FirebaseConfig from './src/config/firebase';
import { SafeFirestoreService } from './src/services/SafeFirestoreService';
import { RoleNavigationService, UserRole } from './src/services/RoleNavigationService';

type AppState = 'login' | 'register' | 'forgotPassword' | 'authenticated';
// UserRole is now imported from RoleNavigationService

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [appState, setAppState] = useState<AppState>('login');
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [initializing, setInitializing] = useState(true);

  // Handle user state changes
  async function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
    setUser(user);
    if (user) {
      // Determine user role using RoleNavigationService
      try {
        const roleService = RoleNavigationService.getInstance();
        const roleResult = await roleService.getUserRole(user.uid);
        
        if (roleResult.success) {
          console.log('User role determined:', roleResult.role);
          setUserRole(roleResult.role);
        } else {
          console.log('Error determining user role:', roleResult.error);
          console.log('Defaulting to customer role');
          setUserRole('customer');
        }
      } catch (error) {
        console.error('Unexpected error in role detection:', error);
        setUserRole('customer'); // Safe fallback
      }
      setAppState('authenticated');
      
      // Track login activity for returning users (non-blocking background operation)
      const trackLoginActivity = async () => {
        const safeFirestore = SafeFirestoreService.getInstance();
        const result = await safeFirestore.safeTrackUserActivity({
          userId: user.uid,
          type: 'login',
          description: 'User session restored',
          metadata: {
            method: 'session_restore',
            timestamp: new Date().toISOString(),
          },
        });
        
        console.log('Session restore tracking:', {
          success: result,
          firestoreAvailable: safeFirestore.isFirestoreAvailable()
        });
      };
      
      // Run in background, don't await
      trackLoginActivity();
    } else {
      console.log('Setting app state to login');
      setAppState('login');
    }
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    // Initialize Firebase
    const initializeApp = async () => {
      try {
        await FirebaseConfig.getInstance().initialize();
        console.log('Firebase initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
      }
    };

    initializeApp();

    // Subscribe to authentication state changes
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const handleNavigateToHome = () => {
    setAppState('authenticated');
  };

  const handleNavigateToForgotPassword = () => {
    setAppState('forgotPassword');
  };

  const handleNavigateBackToLogin = () => {
    setAppState('login');
  };

  const handleLogout = async () => {
    try {
      console.log('handleLogout called - current user:', user?.uid);
      console.log('handleLogout called - current appState:', appState);
      
      // Skip Firestore tracking for now to avoid delays
      // if (user) {
      //   try {
      //     const firestoreService = FirestoreService.getInstance();
      //     await firestoreService.trackUserActivity({
      //       userId: user.uid,
      //       type: 'logout',
      //       description: 'User logged out',
      //       metadata: {
      //         timestamp: new Date().toISOString(),
      //       },
      //     });
      //     console.log('Logout activity tracked');
      //   } catch (trackingError) {
      //     console.warn('Failed to track logout activity:', trackingError);
      //   }
      // }
      
      // Clear user state immediately
      console.log('Clearing user state and setting appState to login');
      setUser(null);
      setUserRole(null);
      setAppState('login');
      
      // Then sign out from Firebase
      try {
        console.log('Attempting Firebase signOut');
        await auth().signOut();
        console.log('Firebase signOut successful');
      } catch (firebaseError) {
        console.warn('Firebase signOut failed:', firebaseError);
      }
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Firebase signOut fails, ensure we navigate to login
      console.log('Error occurred, forcing logout by clearing state');
      setUser(null);
      setAppState('login');
    }
  };

  if (initializing) return null; // or a loading screen

  const renderContent = () => {
    switch (appState) {
      case 'login':
        return (
          <LoginScreen 
            onNavigateToRegister={() => setAppState('register')}
            onNavigateToHome={handleNavigateToHome}
            onNavigateToForgotPassword={handleNavigateToForgotPassword}
          />
        );
      case 'register':
        return (
          <RegisterScreen 
            onNavigateToLogin={() => setAppState('login')}
          />
        );
      case 'forgotPassword':
        return (
          <ForgotPasswordScreen 
            onNavigateBack={handleNavigateBackToLogin}
          />
        );
      case 'authenticated':
        // Route to appropriate navigation based on user role
        if (userRole === 'owner') {
          return <OwnerBottomTabNavigation onLogout={handleLogout} />;
        } else {
          return <BottomTabNavigation onLogout={handleLogout} />;
        }
      default:
        return (
          <LoginScreen 
            onNavigateToRegister={() => setAppState('register')}
            onNavigateToHome={handleNavigateToHome}
            onNavigateToForgotPassword={handleNavigateToForgotPassword}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {renderContent()}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
