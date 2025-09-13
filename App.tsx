/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { BottomTabNavigation } from './src/components/BottomTabNavigation';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import FirebaseConfig from './src/config/firebase';
import FirestoreService from './src/services/FirestoreService';

type AppState = 'login' | 'register' | 'authenticated';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [appState, setAppState] = useState<AppState>('login');
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Handle user state changes
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
    setUser(user);
    if (user) {
      setAppState('authenticated');
      // Track login activity for returning users
      const trackLoginActivity = async () => {
        try {
          const firestoreService = FirestoreService.getInstance();
          await firestoreService.trackUserActivity({
            userId: user.uid,
            type: 'login',
            description: 'User session restored',
            metadata: {
              method: 'session_restore',
              timestamp: new Date().toISOString(),
            },
          });
        } catch (error) {
          console.error('Error tracking login activity:', error);
        }
      };
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

  const handleLogout = async () => {
    try {
      if (user) {
        // Track logout activity
        const firestoreService = FirestoreService.getInstance();
        await firestoreService.trackUserActivity({
          userId: user.uid,
          type: 'logout',
          description: 'User logged out',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        });
      }
      
      // Clear user state immediately
      setUser(null);
      setAppState('login');
      
      // Then sign out from Firebase
      await auth().signOut();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Firebase signOut fails, ensure we navigate to login
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
          />
        );
      case 'register':
        return (
          <RegisterScreen 
            onNavigateToLogin={() => setAppState('login')}
          />
        );
      case 'authenticated':
        return <BottomTabNavigation onLogout={handleLogout} />;
      default:
        return (
          <LoginScreen 
            onNavigateToRegister={() => setAppState('register')}
            onNavigateToHome={handleNavigateToHome}
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
