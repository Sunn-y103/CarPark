import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useOwnerProfile } from '../../hooks/useOwnerProfile';

const { width: screenWidth } = Dimensions.get('window');

interface OwnerDashboardScreenProps {
  onNavigateToManagement?: () => void;
  onNavigateToBookings?: () => void;
  onNavigateToRevenue?: () => void;
}

export const OwnerDashboardScreen: React.FC<OwnerDashboardScreenProps> = ({
  onNavigateToManagement,
  onNavigateToBookings,
  onNavigateToRevenue,
}) => {
  const { owner, isLoading } = useOwnerProfile();
  const [dashboardStats, setDashboardStats] = useState({
    totalSpots: 50,
    occupiedSpots: 35,
    todayRevenue: 2500,
    pendingBookings: 8,
    totalBookings: 127,
    monthlyRevenue: 45000,
  });

  const [recentBookings] = useState([
    { id: '1', customerName: 'John Doe', vehicleNumber: 'ABC1234', time: '10:30 AM', status: 'Active' },
    { id: '2', customerName: 'Jane Smith', vehicleNumber: 'XYZ5678', time: '11:15 AM', status: 'Completed' },
    { id: '3', customerName: 'Mike Johnson', vehicleNumber: 'DEF9012', time: '12:00 PM', status: 'Pending' },
  ]);

  const occupancyRate = Math.round((dashboardStats.occupiedSpots / dashboardStats.totalSpots) * 100);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'management':
        onNavigateToManagement?.();
        break;
      case 'bookings':
        onNavigateToBookings?.();
        break;
      case 'revenue':
        onNavigateToRevenue?.();
        break;
      default:
        Alert.alert('Feature', `${action} feature will be implemented here`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.businessName}>
              {isLoading ? 'Loading...' : (owner?.businessName || owner?.ownerName || 'CarPark Business')}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Image 
              source={require('../../assets/Notifications.png')} 
              style={styles.notificationIcon}
            />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.statNumber}>{dashboardStats.occupiedSpots}/{dashboardStats.totalSpots}</Text>
              <Text style={styles.statLabel}>Occupied Spots</Text>
              <Text style={styles.statSubtext}>{occupancyRate}% occupancy</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.statNumber}>₹{dashboardStats.todayRevenue}</Text>
              <Text style={styles.statLabel}>Today's Revenue</Text>
              <Text style={styles.statSubtext}>+12% from yesterday</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.warning }]}>
              <Text style={styles.statNumber}>{dashboardStats.pendingBookings}</Text>
              <Text style={styles.statLabel}>Pending Bookings</Text>
              <Text style={styles.statSubtext}>Requires attention</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.statNumber}>₹{dashboardStats.monthlyRevenue}</Text>
              <Text style={styles.statLabel}>Monthly Revenue</Text>
              <Text style={styles.statSubtext}>This month</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('management')}
            >
              <Image 
                source={require('../../assets/Parking.png')}
                style={styles.quickActionIcon}
              />
              <Text style={styles.quickActionText}>Manage Parking</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('bookings')}
            >
              <Image 
                source={require('../../assets/Book_In_Advance.png')} 
                style={styles.quickActionIcon}
              />
              <Text style={styles.quickActionText}>View Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('revenue')}
            >
              <Image 
                source={require('../../assets/wallet.png')} 
                style={styles.quickActionIcon}
              />
              <Text style={styles.quickActionText}>Revenue Report</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('settings')}
            >
              <Image 
                source={require('../../assets/userprofile.png')} 
                style={styles.quickActionIcon}
              />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <TouchableOpacity onPress={() => handleQuickAction('bookings')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bookingsContainer}>
            {recentBookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.customerName}>{booking.customerName}</Text>
                  <Text style={styles.vehicleNumber}>{booking.vehicleNumber}</Text>
                </View>
                <View style={styles.bookingDetails}>
                  <Text style={styles.bookingTime}>{booking.time}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(booking.status) }
                  ]}>
                    <Text style={styles.statusText}>{booking.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Spacing for Navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return theme.colors.success;
    case 'completed':
      return theme.colors.primary;
    case 'pending':
      return theme.colors.warning;
    default:
      return theme.colors.text.secondary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  welcomeText: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  businessName: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
  },
  notificationButton: {
    position: 'relative',
    padding: theme.spacing.sm,
  },
  notificationIcon: {
    width: 24,
    height: 24,
    tintColor: theme.colors.text.primary,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: theme.typography.fontWeights.bold as any,
  },
  statsContainer: {
    marginBottom: theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.base,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.xs,
  },
  statNumber: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.inverse,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.inverse,
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.text.inverse,
    opacity: 0.8,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
  },
  viewAllText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium as any,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (screenWidth - 80) / 2 - 8,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.base,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    tintColor: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  quickActionText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium as any,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  bookingsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  bookingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  bookingInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: theme.typography.fontWeights.medium as any,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  vehicleNumber: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.secondary,
  },
  bookingDetails: {
    alignItems: 'flex-end',
  },
  bookingTime: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.medium as any,
    color: theme.colors.text.inverse,
  },
});
