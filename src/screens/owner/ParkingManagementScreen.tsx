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
  TextInput,
  Modal,
} from 'react-native';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';

interface ParkingSpot {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  customerName?: string;
  vehicleNumber?: string;
  checkInTime?: string;
  rate: number;
}

export const ParkingManagementScreen: React.FC = () => {
  const [spots, setSpots] = useState<ParkingSpot[]>([
    { id: '1', number: 'A1', status: 'occupied', customerName: 'John Doe', vehicleNumber: 'ABC1234', checkInTime: '10:30 AM', rate: 50 },
    { id: '2', number: 'A2', status: 'available', rate: 50 },
    { id: '3', number: 'A3', status: 'reserved', customerName: 'Jane Smith', vehicleNumber: 'XYZ5678', rate: 50 },
    { id: '4', number: 'A4', status: 'available', rate: 50 },
    { id: '5', number: 'A5', status: 'maintenance', rate: 50 },
    { id: '6', number: 'A6', status: 'occupied', customerName: 'Mike Johnson', vehicleNumber: 'DEF9012', checkInTime: '11:15 AM', rate: 50 },
    { id: '7', number: 'A7', status: 'available', rate: 50 },
    { id: '8', number: 'A8', status: 'available', rate: 50 },
    { id: '9', number: 'B1', status: 'occupied', customerName: 'Sarah Wilson', vehicleNumber: 'GHI3456', checkInTime: '09:45 AM', rate: 60 },
    { id: '10', number: 'B2', status: 'available', rate: 60 },
    { id: '11', number: 'B3', status: 'available', rate: 60 },
    { id: '12', number: 'B4', status: 'reserved', customerName: 'David Brown', vehicleNumber: 'JKL7890', rate: 60 },
  ]);

  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getSpotColor = (status: string) => {
    switch (status) {
      case 'available':
        return theme.colors.success;
      case 'occupied':
        return theme.colors.error;
      case 'reserved':
        return theme.colors.warning;
      case 'maintenance':
        return theme.colors.text.secondary;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'occupied':
        return 'Occupied';
      case 'reserved':
        return 'Reserved';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
  };

  const filteredSpots = filterStatus === 'all' 
    ? spots 
    : spots.filter(spot => spot.status === filterStatus);

  const handleSpotPress = (spot: ParkingSpot) => {
    setSelectedSpot(spot);
    setModalVisible(true);
  };

  const handleStatusChange = (newStatus: string) => {
    if (selectedSpot) {
      setSpots(prev => prev.map(spot => 
        spot.id === selectedSpot.id 
          ? { ...spot, status: newStatus as any, customerName: undefined, vehicleNumber: undefined, checkInTime: undefined }
          : spot
      ));
      setModalVisible(false);
      setSelectedSpot(null);
    }
  };

  const getStatsCount = (status: string) => {
    return spots.filter(spot => spot.status === status).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parking Management</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Spot</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getStatsCount('available')}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getStatsCount('occupied')}</Text>
          <Text style={styles.statLabel}>Occupied</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getStatsCount('reserved')}</Text>
          <Text style={styles.statLabel}>Reserved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getStatsCount('maintenance')}</Text>
          <Text style={styles.statLabel}>Maintenance</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'available', 'occupied', 'reserved', 'maintenance'].map((status) => (
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
              {status === 'all' ? 'All Spots' : getStatusText(status)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Parking Spots Grid */}
      <ScrollView style={styles.spotsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.spotsGrid}>
          {filteredSpots.map((spot) => (
            <TouchableOpacity
              key={spot.id}
              style={[
                styles.spotCard,
                { borderColor: getSpotColor(spot.status) }
              ]}
              onPress={() => handleSpotPress(spot)}
            >
              <View style={styles.spotHeader}>
                <Text style={styles.spotNumber}>{spot.number}</Text>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: getSpotColor(spot.status) }
                ]} />
              </View>
              
              <Text style={styles.spotStatus}>{getStatusText(spot.status)}</Text>
              
              {spot.customerName && (
                <View style={styles.spotDetails}>
                  <Text style={styles.customerText}>{spot.customerName}</Text>
                  <Text style={styles.vehicleText}>{spot.vehicleNumber}</Text>
                  <Text style={styles.timeText}>{spot.checkInTime}</Text>
                </View>
              )}
              
              <Text style={styles.rateText}>₹{spot.rate}/hr</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Spot Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Spot {selectedSpot?.number}
              </Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {selectedSpot && (
              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>Current Status:</Text>
                <Text style={[
                  styles.modalStatus,
                  { color: getSpotColor(selectedSpot.status) }
                ]}>
                  {getStatusText(selectedSpot.status)}
                </Text>

                {selectedSpot.customerName && (
                  <View style={styles.customerInfo}>
                    <Text style={styles.modalLabel}>Customer: {selectedSpot.customerName}</Text>
                    <Text style={styles.modalLabel}>Vehicle: {selectedSpot.vehicleNumber}</Text>
                    <Text style={styles.modalLabel}>Check-in: {selectedSpot.checkInTime}</Text>
                  </View>
                )}

                <Text style={styles.modalLabel}>Change Status:</Text>
                <View style={styles.statusButtons}>
                  {['available', 'occupied', 'reserved', 'maintenance'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusButton,
                        { backgroundColor: getSpotColor(status) }
                      ]}
                      onPress={() => handleStatusChange(status)}
                    >
                      <Text style={styles.statusButtonText}>
                        {getStatusText(status)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  addButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeights.medium as any,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.base,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.sm,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.text.secondary,
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
  spotsContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  spotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  spotCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.base,
    borderWidth: 2,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  spotNumber: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  spotStatus: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium as any,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  spotDetails: {
    marginBottom: theme.spacing.sm,
  },
  customerText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeights.medium as any,
  },
  vehicleText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.text.secondary,
  },
  timeText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.text.secondary,
  },
  rateText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium as any,
    color: theme.colors.primary,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    width: '85%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.text.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.colors.text.inverse,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  modalLabel: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  modalStatus: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as any,
    marginBottom: theme.spacing.lg,
  },
  customerInfo: {
    marginBottom: theme.spacing.lg,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusButton: {
    width: '48%',
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeights.medium as any,
  },
});
