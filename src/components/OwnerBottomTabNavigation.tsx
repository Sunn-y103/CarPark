import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
} from 'react-native';
import { theme } from '../styles/theme';
import { OwnerDashboardScreen } from '../screens/owner/OwnerDashboardScreen';
import { ParkingManagementScreen } from '../screens/owner/ParkingManagementScreen';
import { BookingRequestsScreen } from '../screens/owner/BookingRequestsScreen';
import { OwnerProfileScreen } from '../screens/owner/OwnerProfileScreen';
import OwnerBottomNavigation from './OwnerBottomNavigation';

type TabType = 'dashboard' | 'parking' | 'bookings' | 'revenue' | 'profile';

interface OwnerBottomTabNavigationProps {
  onLogout: () => void;
}

export const OwnerBottomTabNavigation: React.FC<OwnerBottomTabNavigationProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const handleNavigateToManagement = () => {
    setActiveTab('parking');
  };

  const handleNavigateToBookings = () => {
    setActiveTab('bookings');
  };

  const handleNavigateToRevenue = () => {
    setActiveTab('revenue');
  };

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId as TabType);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <OwnerDashboardScreen 
            onNavigateToManagement={handleNavigateToManagement}
            onNavigateToBookings={handleNavigateToBookings}
            onNavigateToRevenue={handleNavigateToRevenue}
          />
        );
      case 'parking':
        return <ParkingManagementScreen />;
      case 'bookings':
        return <BookingRequestsScreen />;
      case 'revenue':
        return <RevenueScreen />;
      case 'profile':
        return <OwnerProfileScreen onLogout={onLogout} />;
      default:
        return (
          <OwnerDashboardScreen 
            onNavigateToManagement={handleNavigateToManagement}
            onNavigateToBookings={handleNavigateToBookings}
            onNavigateToRevenue={handleNavigateToRevenue}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Screen Content */}
      <View style={styles.contentContainer}>
        {renderScreen()}
      </View>

      {/* Owner Bottom Navigation */}
      <OwnerBottomNavigation
        onTabPress={handleTabPress}
        initialTab="dashboard"
        activeTab={activeTab}
      />
    </SafeAreaView>
  );
};

// Placeholder Revenue Screen (to be implemented later)
const RevenueScreen: React.FC = () => {
  return (
    <View style={styles.placeholderContainer}>
      <View style={styles.placeholderContent}>
        <Text style={styles.placeholderTitle}>Revenue Analytics</Text>
        <Text style={styles.placeholderText}>
          Revenue reports and analytics will be implemented here
        </Text>
      </View>
    </View>
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
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  placeholderContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  placeholderTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.base,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
