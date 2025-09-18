import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';

interface BookingRequest {
  id: string;
  customerName: string;
  vehicleNumber: string;
  requestedTime: string;
  duration: string;
  spotPreference: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  customerPhone: string;
  requestedDate: string;
}

export const BookingRequestsScreen: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRequest[]>([
    {
      id: '1',
      customerName: 'John Doe',
      vehicleNumber: 'ABC1234',
      requestedTime: '10:30 AM',
      duration: '2 hours',
      spotPreference: 'Any available',
      amount: 100,
      status: 'pending',
      customerPhone: '+91 9876543210',
      requestedDate: 'Today'
    },
    {
      id: '2',
      customerName: 'Jane Smith',
      vehicleNumber: 'XYZ5678',
      requestedTime: '2:00 PM',
      duration: '3 hours',
      spotPreference: 'Ground floor',
      amount: 150,
      status: 'pending',
      customerPhone: '+91 8765432109',
      requestedDate: 'Tomorrow'
    },
    {
      id: '3',
      customerName: 'Mike Johnson',
      vehicleNumber: 'DEF9012',
      requestedTime: '11:15 AM',
      duration: '1 hour',
      spotPreference: 'Covered parking',
      amount: 60,
      status: 'approved',
      customerPhone: '+91 7654321098',
      requestedDate: 'Today'
    },
    {
      id: '4',
      customerName: 'Sarah Wilson',
      vehicleNumber: 'GHI3456',
      requestedTime: '4:30 PM',
      duration: '4 hours',
      spotPreference: 'Near exit',
      amount: 200,
      status: 'rejected',
      customerPhone: '+91 6543210987',
      requestedDate: 'Yesterday'
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'approved':
        return theme.colors.success;
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filterStatus);

  const handleBookingAction = (bookingId: string, action: 'approve' | 'reject') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const actionText = action === 'approve' ? 'approve' : 'reject';
    Alert.alert(
      `${actionText.charAt(0).toUpperCase()}${actionText.slice(1)} Booking`,
      `Are you sure you want to ${actionText} the booking for ${booking.customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          onPress: () => {
            setBookings(prev => prev.map(b => 
              b.id === bookingId 
                ? { ...b, status: action === 'approve' ? 'approved' : 'rejected' }
                : b
            ));
            Alert.alert('Success', `Booking ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
          }
        }
      ]
    );
  };

  const handleContactCustomer = (booking: BookingRequest) => {
    Alert.alert(
      'Contact Customer',
      `Would you like to call ${booking.customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Calling', `Calling ${booking.customerPhone}`) }
      ]
    );
  };

  const getStatsCount = (status: string) => {
    return bookings.filter(booking => booking.status === status).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking Requests</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>
            {getStatsCount('pending')} pending
          </Text>
        </View>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.warning }]}>
          <Text style={styles.statNumber}>{getStatsCount('pending')}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.success }]}>
          <Text style={styles.statNumber}>{getStatsCount('approved')}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.error }]}>
          <Text style={styles.statNumber}>{getStatsCount('rejected')}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.statNumber}>{bookings.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filterStatus === status && styles.filterButtonActive
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[
              styles.filterButtonText,
              filterStatus === status && styles.filterButtonTextActive
            ]}>
              {status === 'all' ? 'All Requests' : getStatusText(status)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Booking Requests List */}
      <ScrollView style={styles.bookingsContainer} showsVerticalScrollIndicator={false}>
        {filteredBookings.map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>
            {/* Header */}
            <View style={styles.bookingHeader}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{booking.customerName}</Text>
                <Text style={styles.vehicleNumber}>{booking.vehicleNumber}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(booking.status) }
              ]}>
                <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
              </View>
            </View>

            {/* Booking Details */}
            <View style={styles.bookingDetails}>
              <View style={styles.detailRow}>
                <Image source={require('../../assets/Book_In_Advance.png')} style={styles.detailIcon} />
                <Text style={styles.detailText}>{booking.requestedDate} at {booking.requestedTime}</Text>
              </View>
              <View style={styles.detailRow}>
                <Image source={require('../../assets/history.png')} style={styles.detailIcon} />
                <Text style={styles.detailText}>Duration: {booking.duration}</Text>
              </View>
              <View style={styles.detailRow}>
                <Image source={require('../../assets/CarPark_Logo.png')} style={styles.detailIcon} />
                <Text style={styles.detailText}>Preference: {booking.spotPreference}</Text>
              </View>
              <View style={styles.detailRow}>
                <Image source={require('../../assets/wallet.png')} style={styles.detailIcon} />
                <Text style={styles.detailText}>Amount: ₹{booking.amount}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => handleContactCustomer(booking)}
              >
                <Image source={require('../../assets/Notifications.png')} style={styles.buttonIcon} />
                <Text style={styles.contactButtonText}>Contact</Text>
              </TouchableOpacity>

              {booking.status === 'pending' && (
                <>
                  <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={() => handleBookingAction(booking.id, 'reject')}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.approveButton}
                    onPress={() => handleBookingAction(booking.id, 'approve')}
                  >
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ))}

        {/* Bottom Spacing for Navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    marginBottom: theme.spacing.base,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
  },
  headerStats: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statsText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium as any,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.base,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.sm,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.inverse,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.text.inverse,
  },
  filterContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.base,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.primary,
  },
  filterButtonTextActive: {
    color: theme.colors.text.inverse,
  },
  bookingsContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  bookingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.base,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  vehicleNumber: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.medium as any,
    color: theme.colors.text.inverse,
  },
  bookingDetails: {
    marginBottom: theme.spacing.base,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailIcon: {
    width: 16,
    height: 16,
    tintColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  detailText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.primary,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    flex: 1,
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
  },
  buttonIcon: {
    width: 16,
    height: 16,
    tintColor: theme.colors.text.inverse,
    marginRight: theme.spacing.xs,
  },
  contactButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium as any,
  },
  rejectButton: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  rejectButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium as any,
  },
  approveButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  approveButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium as any,
  },
});
