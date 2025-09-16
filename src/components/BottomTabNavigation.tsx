import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { theme } from '../styles/theme';
import { HomeScreen } from '../screens/customer/HomeScreen';
import { MapsScreen } from '../screens/customer/MapsScreen';
import { HistoryScreen } from '../screens/customer/HistoryScreen';
import { WalletScreen } from '../screens/customer/WalletScreen';
import { ProfileScreen } from '../screens/customer/ProfileScreen';
import { NavigationMode } from '../types';
import CustomBottomNavigation from './CustomBottomNavigation';

type TabType = 'home' | 'maps' | 'history' | 'wallet' | 'profile';

interface BottomTabNavigationProps {
  onLogout: () => void;
}

export const BottomTabNavigation: React.FC<BottomTabNavigationProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [mapsMode, setMapsMode] = useState<NavigationMode | undefined>(undefined);

  const handleNavigateToMaps = (mode?: NavigationMode) => {
    setMapsMode(mode);
    setActiveTab('maps');
  };

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId as TabType);
    if (tabId === 'maps') {
      setMapsMode(undefined); // Reset maps mode when switching to maps tab
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigateToMaps={handleNavigateToMaps} />;
      case 'maps':
        return <MapsScreen mode={mapsMode} />;
      case 'history':
        return <HistoryScreen />;
      case 'wallet':
        return <WalletScreen />;
      case 'profile':
        return <ProfileScreen onLogout={onLogout} />;
      default:
        return <HomeScreen onNavigateToMaps={handleNavigateToMaps} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Screen Content */}
      <View style={styles.contentContainer}>
        {renderScreen()}
      </View>

      {/* Custom Bottom Navigation */}
      <CustomBottomNavigation
        onTabPress={handleTabPress}
        initialTab="home"
        activeTab={activeTab}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 100, // Add padding to prevent navigation bar overlay
  },
});
