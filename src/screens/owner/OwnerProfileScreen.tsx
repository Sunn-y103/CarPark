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
  TextInput,
  Switch,
} from 'react-native';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useOwnerProfile, OwnerData } from '../../hooks/useOwnerProfile';
import { LoadingScreen } from '../../components/LoadingScreen';

interface OwnerProfileScreenProps {
  onLogout: () => void;
}

export const OwnerProfileScreen: React.FC<OwnerProfileScreenProps> = ({ onLogout }) => {
  const { owner, isLoading, isError, error, updateOwnerProfile, refreshProfile } = useOwnerProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<OwnerData>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Update editedProfile when owner data changes
  useEffect(() => {
    if (owner) {
      setEditedProfile({
        ownerName: owner.ownerName,
        businessName: owner.businessName,
        email: owner.email,
        phone: owner.phone,
        address: owner.address,
        businessLicense: owner.businessLicense,
        totalSpots: owner.totalSpots,
        operatingHours: owner.operatingHours,
        autoApproval: owner.autoApproval,
        notifications: owner.notifications,
        emailAlerts: owner.emailAlerts,
      });
    }
  }, [owner]);

  const businessStats = {
    totalRevenue: 125000,
    totalBookings: 1500,
    averageRating: 4.5,
    monthlyRevenue: 45000,
  };

  // Show loading screen while data is being fetched
  if (isLoading) {
    return (
      <LoadingScreen
        visible={true}
        message="Loading owner profile..."
      />
    );
  }

  // Show error state
  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading profile: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show fallback if no owner data
  if (!owner) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No owner profile found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshProfile}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveProfile = async () => {
    if (!editedProfile.ownerName?.trim()) {
      Alert.alert('Error', 'Owner name is required');
      return;
    }

    setIsSaving(true);
    try {
      await updateOwnerProfile(editedProfile);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (owner) {
      setEditedProfile({
        ownerName: owner.ownerName,
        businessName: owner.businessName,
        email: owner.email,
        phone: owner.phone,
        address: owner.address,
        businessLicense: owner.businessLicense,
        totalSpots: owner.totalSpots,
        operatingHours: owner.operatingHours,
        autoApproval: owner.autoApproval,
        notifications: owner.notifications,
        emailAlerts: owner.emailAlerts,
      });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: onLogout, style: 'destructive' }
      ]
    );
  };

  const menuOptions = [
    { id: 'business', title: 'Business Settings', icon: require('../../assets/userprofile.png') },
    { id: 'pricing', title: 'Pricing & Rates', icon: require('../../assets/wallet.png') },
    { id: 'analytics', title: 'Analytics & Reports', icon: require('../../assets/history.png') },
    { id: 'payments', title: 'Payment Methods', icon: require('../../assets/wallet.png') },
    { id: 'support', title: 'Support & Help', icon: require('../../assets/Help&Support.png') },
    { id: 'terms', title: 'Terms & Conditions', icon: require('../../assets/Security&Privacy.png') },
  ];

  const handleMenuPress = (menuId: string) => {
    Alert.alert('Feature', `${menuId} feature will be implemented here`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Owner Profile</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image 
              source={require('../../assets/Owner.png')} 
              style={styles.avatar}
            />
            <View style={styles.onlineIndicator} />
          </View>

          <View style={styles.profileInfo}>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editedProfile.ownerName || ''}
                onChangeText={(text) => setEditedProfile({...editedProfile, ownerName: text})}
                placeholder="Owner Name"
              />
            ) : (
              <Text style={styles.ownerName}>{owner.ownerName}</Text>
            )}
            
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editedProfile.businessName || ''}
                onChangeText={(text) => setEditedProfile({...editedProfile, businessName: text})}
                placeholder="Business Name"
              />
            ) : (
              <Text style={styles.businessName}>{owner.businessName}</Text>
            )}
            
            <Text style={styles.businessLicense}>License: {owner.businessLicense || 'Not set'}</Text>
          </View>
        </View>

        {/* Business Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Business Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>₹{businessStats.totalRevenue.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{businessStats.totalBookings}</Text>
              <Text style={styles.statLabel}>Total Bookings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{businessStats.averageRating}⭐</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>₹{businessStats.monthlyRevenue.toLocaleString()}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Image source={require('../../assets/userprofile.png')} style={styles.infoIcon} />
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={editedProfile.email || ''}
                  onChangeText={(text) => setEditedProfile({...editedProfile, email: text})}
                  placeholder="Email"
                  keyboardType="email-address"
                />
              ) : (
                <Text style={styles.infoText}>{owner.email}</Text>
              )}
            </View>
            
            <View style={styles.infoRow}>
              <Image source={require('../../assets/Notifications.png')} style={styles.infoIcon} />
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={editedProfile.phone || ''}
                  onChangeText={(text) => setEditedProfile({...editedProfile, phone: text})}
                  placeholder="Phone"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoText}>{owner.phone}</Text>
              )}
            </View>
            
            <View style={styles.infoRow}>
              <Image source={require('../../assets/map.png')} style={styles.infoIcon} />
              {isEditing ? (
                <TextInput
                  style={[styles.editInput, styles.multilineInput]}
                  value={editedProfile.address || ''}
                  onChangeText={(text) => setEditedProfile({...editedProfile, address: text})}
                  placeholder="Business Address"
                  multiline
                />
              ) : (
                <Text style={styles.infoText}>{owner.address || 'Not set'}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Auto-approve Bookings</Text>
              <Switch
                value={editedProfile.autoApproval !== undefined ? editedProfile.autoApproval : false}
                onValueChange={(value) => setEditedProfile({...editedProfile, autoApproval: value})}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={editedProfile.autoApproval ? theme.colors.accent : theme.colors.text.tertiary}
                disabled={!isEditing}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Switch
                value={editedProfile.notifications !== undefined ? editedProfile.notifications : false}
                onValueChange={(value) => setEditedProfile({...editedProfile, notifications: value})}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={editedProfile.notifications ? theme.colors.accent : theme.colors.text.tertiary}
                disabled={!isEditing}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Email Alerts</Text>
              <Switch
                value={editedProfile.emailAlerts !== undefined ? editedProfile.emailAlerts : false}
                onValueChange={(value) => setEditedProfile({...editedProfile, emailAlerts: value})}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={editedProfile.emailAlerts ? theme.colors.accent : theme.colors.text.tertiary}
                disabled={!isEditing}
              />
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Options</Text>
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.menuOption}
              onPress={() => handleMenuPress(option.title)}
            >
              <Image source={option.icon} style={styles.menuIcon} />
              <Text style={styles.menuText}>{option.title}</Text>
              <Image 
                source={require('../../assets/Back_Arrow.png')} 
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Cancel Edit Button */}
        {isEditing && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
            <Text style={styles.cancelButtonText}>Cancel Changes</Text>
          </TouchableOpacity>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* Bottom Spacing for Navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      <LoadingScreen
        visible={isSaving}
        message="Saving profile..."
      />
    </SafeAreaView>
  );
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
  headerTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  editButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeights.medium as any,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    backgroundColor: theme.colors.success,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  profileInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  businessName: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium as any,
    marginBottom: 4,
  },
  businessLicense: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.secondary,
  },
  editInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  statsContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.base,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    width: '48%',
    marginBottom: theme.spacing.base,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  infoIcon: {
    width: 20,
    height: 20,
    tintColor: theme.colors.primary,
    marginRight: theme.spacing.base,
  },
  infoText: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.text.primary,
    flex: 1,
  },
  settingsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  settingLabel: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.text.primary,
    flex: 1,
  },
  menuOption: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: theme.colors.primary,
    marginRight: theme.spacing.base,
  },
  menuText: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.text.primary,
    flex: 1,
  },
  arrowIcon: {
    width: 16,
    height: 16,
    tintColor: theme.colors.text.secondary,
  },
  cancelButton: {
    backgroundColor: theme.colors.text.secondary,
    paddingVertical: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  cancelButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSizes.base,
    fontWeight: theme.typography.fontWeights.medium as any,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  logoutButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSizes.base,
    fontWeight: theme.typography.fontWeights.medium as any,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
  },
  retryButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSizes.base,
    fontWeight: theme.typography.fontWeights.medium as any,
  },
});
