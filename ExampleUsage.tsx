import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import CustomBottomNavigation from './CustomBottomNavigation';

const ExampleUsage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('home');

  const handleTabPress = (tabId: string) => {
    console.log('Tab pressed:', tabId);
    setCurrentTab(tabId);
    // Here you can implement navigation logic, such as:
    // - Updating state to show different screens
    // - Using React Navigation to navigate between screens
    // - Any other tab-specific logic
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'maps':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Maps Screen</Text>
            <Text style={styles.contentText}>Your parking locations and navigation</Text>
          </View>
        );
      case 'history':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>History Screen</Text>
            <Text style={styles.contentText}>Your parking history and past bookings</Text>
          </View>
        );
      case 'home':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Home Screen</Text>
            <Text style={styles.contentText}>Find and book parking spots</Text>
          </View>
        );
      case 'wallet':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Wallet Screen</Text>
            <Text style={styles.contentText}>Payment methods and transaction history</Text>
          </View>
        );
      case 'profile':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Profile Screen</Text>
            <Text style={styles.contentText}>Account settings and personal information</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Main content area */}
      <View style={styles.mainContent}>
        {renderContent()}
      </View>

      {/* Custom Bottom Navigation */}
      <CustomBottomNavigation
        onTabPress={handleTabPress}
        initialTab="home"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
    paddingBottom: 100, // Add padding to account for bottom navigation
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A1A5C',
    marginBottom: 10,
  },
  contentText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default ExampleUsage;

/*
 * USAGE INSTRUCTIONS:
 * 
 * 1. Install required dependencies:
 *    npm install react-native-reanimated react-native-vector-icons
 *    # For Expo projects:
 *    expo install react-native-reanimated @expo/vector-icons
 * 
 * 2. For React Native CLI projects, follow the installation guide for:
 *    - react-native-reanimated: https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation
 *    - react-native-vector-icons: https://github.com/oblador/react-native-vector-icons#installation
 * 
 * 3. Import and use the component:
 *    import CustomBottomNavigation from './path/to/CustomBottomNavigation';
 * 
 * 4. Props available:
 *    - onTabPress?: (tabId: string) => void - Callback when tab is pressed
 *    - initialTab?: string - Initial active tab (default: 'home')
 * 
 * 5. Tab IDs available: 'maps', 'history', 'home', 'wallet', 'profile'
 * 
 * 6. Customization:
 *    - Modify TABS array in CustomBottomNavigation.tsx to change icons/labels
 *    - Update colors in styles to match your app's theme
 *    - Adjust animation duration/easing in handleTabPress function
 */
