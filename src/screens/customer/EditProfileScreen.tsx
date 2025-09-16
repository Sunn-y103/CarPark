import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { User, Vehicle } from '../../types';
import { LoadingScreen } from '../../components/LoadingScreen';

interface EditProfileScreenProps {
  onBack: () => void;
  onSave: (userData: User, vehicles: Vehicle[]) => Promise<void>;
  initialUserData: User;
  initialVehicles: Vehicle[];
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  onBack,
  onSave,
  initialUserData,
  initialVehicles,
}) => {
  const [userData, setUserData] = useState<User>(initialUserData);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!userData.name.trim() || !userData.email.trim()) {
      Alert.alert('Validation Error', 'Name and email are required.');
      return;
    }

    if (vehicles.length === 0) {
      Alert.alert('Validation Error', 'At least one vehicle is required.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(userData, vehicles);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onBack },
      ]
    );
  };

  const addVehicle = () => {
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      make: '',
      model: '',
      licensePlate: '',
      color: '',
      year: new Date().getFullYear(),
      type: 'car',
    };
    setVehicles([...vehicles, newVehicle]);
    setIsEditing(true);
  };

  const updateVehicle = (index: number, updatedVehicle: Vehicle) => {
    const updatedVehicles = vehicles.map((vehicle, i) =>
      i === index ? updatedVehicle : vehicle
    );
    setVehicles(updatedVehicles);
  };

  const removeVehicle = (index: number) => {
    if (vehicles.length === 1) {
      Alert.alert('Cannot Remove', 'At least one vehicle is required.');
      return;
    }

    Alert.alert(
      'Remove Vehicle',
      'Are you sure you want to remove this vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedVehicles = vehicles.filter((_, i) => i !== index);
            setVehicles(updatedVehicles);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: theme.spacing.lg }}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={[commonStyles.headerContainer, { marginBottom: theme.spacing.xl, borderBottomWidth: 0, paddingHorizontal: 0 }]}>
          <TouchableOpacity onPress={handleCancel} style={{ padding: theme.spacing.xs, flexDirection: 'row', alignItems: 'center' }}>
            <Image 
              source={require('../../assets/Back_Arrow.png')} 
              style={{ width: 20, height: 20, marginRight: 4, tintColor: theme.colors.primary }} 
            />
            <Text style={{ fontSize: 16, color: theme.colors.primary }}>Back</Text>
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: theme.colors.text.primary }]}>
            Edit Profile
          </Text>
          <TouchableOpacity onPress={handleSave} style={{ padding: theme.spacing.xs }}>
            <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <Text style={{
            fontSize: theme.typography.fontSizes.lg,
            fontWeight: theme.typography.fontWeights.semibold as any,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.base,
          }}>Personal Information</Text>
          
          <View style={[commonStyles.socialButton, { width: '100%', paddingVertical: theme.spacing.lg, alignItems: 'flex-start', marginBottom: theme.spacing.sm }]}>
            <Text style={{ fontSize: theme.typography.fontSizes.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
              Full Name
            </Text>
            <TextInput
              style={{
                fontSize: theme.typography.fontSizes.base,
                color: theme.colors.text.primary,
                width: '100%',
                padding: 0,
              }}
              value={userData.name}
              onChangeText={(text) => setUserData({ ...userData, name: text })}
              placeholder="Enter your full name"
              placeholderTextColor={theme.colors.text.tertiary}
            />
          </View>

          <View style={[commonStyles.socialButton, { width: '100%', paddingVertical: theme.spacing.lg, alignItems: 'flex-start', marginBottom: theme.spacing.sm }]}>
            <Text style={{ fontSize: theme.typography.fontSizes.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
              Email Address
            </Text>
            <TextInput
              style={{
                fontSize: theme.typography.fontSizes.base,
                color: theme.colors.text.primary,
                width: '100%',
                padding: 0,
              }}
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[commonStyles.socialButton, { width: '100%', paddingVertical: theme.spacing.lg, alignItems: 'flex-start', marginBottom: theme.spacing.sm }]}>
            <Text style={{ fontSize: theme.typography.fontSizes.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
              Phone Number
            </Text>
            <TextInput
              style={{
                fontSize: theme.typography.fontSizes.base,
                color: theme.colors.text.primary,
                width: '100%',
                padding: 0,
              }}
              value={userData.phone || ''}
              onChangeText={(text) => setUserData({ ...userData, phone: text })}
              placeholder="Enter your phone number"
              placeholderTextColor={theme.colors.text.tertiary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Vehicles Section */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.base }}>
            <Text style={{
              fontSize: theme.typography.fontSizes.lg,
              fontWeight: theme.typography.fontWeights.semibold as any,
              color: theme.colors.text.primary,
            }}>My Vehicles</Text>
            <TouchableOpacity onPress={addVehicle} style={{ padding: theme.spacing.xs }}>
              <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '600' }}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {vehicles.map((vehicle, index) => (
            <View key={vehicle.id} style={[commonStyles.socialButton, { width: '100%', paddingVertical: theme.spacing.lg, alignItems: 'flex-start', marginBottom: theme.spacing.sm }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: theme.spacing.base }}>
                <Text style={{
                  fontSize: theme.typography.fontSizes.base,
                  fontWeight: theme.typography.fontWeights.medium as any,
                  color: theme.colors.text.primary,
                }}>Vehicle {index + 1}</Text>
                {vehicles.length > 1 && (
                  <TouchableOpacity onPress={() => removeVehicle(index)} style={{ padding: theme.spacing.xs }}>
                    <Text style={{ color: theme.colors.error, fontSize: 16 }}>🗑️ Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ width: '100%' }}>
                <View style={{ flexDirection: 'row', marginBottom: theme.spacing.sm }}>
                  <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                    <Text style={{ fontSize: theme.typography.fontSizes.xs, color: theme.colors.text.secondary, marginBottom: 4 }}>Make</Text>
                    <TextInput
                      style={{
                        fontSize: theme.typography.fontSizes.sm,
                        color: theme.colors.text.primary,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: 6,
                        padding: 8,
                      }}
                      value={vehicle.make}
                      onChangeText={(text) => updateVehicle(index, { ...vehicle, make: text })}
                      placeholder="Honda"
                      placeholderTextColor={theme.colors.text.tertiary}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
                    <Text style={{ fontSize: theme.typography.fontSizes.xs, color: theme.colors.text.secondary, marginBottom: 4 }}>Model</Text>
                    <TextInput
                      style={{
                        fontSize: theme.typography.fontSizes.sm,
                        color: theme.colors.text.primary,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: 6,
                        padding: 8,
                      }}
                      value={vehicle.model}
                      onChangeText={(text) => updateVehicle(index, { ...vehicle, model: text })}
                      placeholder="Civic"
                      placeholderTextColor={theme.colors.text.tertiary}
                    />
                  </View>
                </View>

                <View style={{ marginBottom: theme.spacing.sm }}>
                  <Text style={{ fontSize: theme.typography.fontSizes.xs, color: theme.colors.text.secondary, marginBottom: 4 }}>License Plate</Text>
                  <TextInput
                    style={{
                      fontSize: theme.typography.fontSizes.sm,
                      color: theme.colors.text.primary,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: 6,
                      padding: 8,
                    }}
                    value={vehicle.licensePlate}
                    onChangeText={(text) => updateVehicle(index, { ...vehicle, licensePlate: text })}
                    placeholder="MH 12 AB 1234"
                    placeholderTextColor={theme.colors.text.tertiary}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                    <Text style={{ fontSize: theme.typography.fontSizes.xs, color: theme.colors.text.secondary, marginBottom: 4 }}>Color</Text>
                    <TextInput
                      style={{
                        fontSize: theme.typography.fontSizes.sm,
                        color: theme.colors.text.primary,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: 6,
                        padding: 8,
                      }}
                      value={vehicle.color || ''}
                      onChangeText={(text) => updateVehicle(index, { ...vehicle, color: text })}
                      placeholder="Blue"
                      placeholderTextColor={theme.colors.text.tertiary}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
                    <Text style={{ fontSize: theme.typography.fontSizes.xs, color: theme.colors.text.secondary, marginBottom: 4 }}>Year</Text>
                    <TextInput
                      style={{
                        fontSize: theme.typography.fontSizes.sm,
                        color: theme.colors.text.primary,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: 6,
                        padding: 8,
                      }}
                      value={vehicle.year?.toString() || ''}
                      onChangeText={(text) => updateVehicle(index, { ...vehicle, year: parseInt(text) || undefined })}
                      placeholder="2020"
                      placeholderTextColor={theme.colors.text.tertiary}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.lg }}>
          <TouchableOpacity
            onPress={handleCancel}
            style={[
              commonStyles.socialButton,
              { flex: 1, marginRight: theme.spacing.sm, paddingVertical: theme.spacing.lg }
            ]}>
            <Text style={{ color: theme.colors.text.primary, fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSave}
            style={[
              commonStyles.button,
              { flex: 1, marginLeft: theme.spacing.sm, paddingVertical: theme.spacing.lg }
            ]}>
            <Text style={commonStyles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <LoadingScreen
        visible={isSaving}
        message="Saving profile changes..."
      />
    </SafeAreaView>
  );
};
