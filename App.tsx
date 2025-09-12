/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { BottomTabNavigation } from './src/components/BottomTabNavigation';

type AppState = 'login' | 'register' | 'authenticated';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [appState, setAppState] = useState<AppState>('login');

  const handleNavigateToHome = () => {
    setAppState('authenticated');
  };

  const handleLogout = () => {
    setAppState('login');
  };

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
