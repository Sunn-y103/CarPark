import { useState, useEffect, useCallback } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import FirestoreService from '../services/FirestoreService';
import { UserProfile } from '../types/firebase';
import { User, Vehicle } from '../types';

export interface UserProfileData {
  user: User | null;
  vehicles: Vehicle[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}

export const useUserProfile = () => {
  const [profileData, setProfileData] = useState<UserProfileData>({
    user: null,
    vehicles: [],
    isLoading: true,
    isError: false,
    error: null,
  });

  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) {
        // User logged out, clear profile data
        setProfileData({
          user: null,
          vehicles: [],
          isLoading: false,
          isError: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  // Fetch user profile data when user changes
  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

  const fetchUserProfile = useCallback(async () => {
    if (!currentUser) return;

    try {
      setProfileData(prev => ({ ...prev, isLoading: true, isError: false, error: null }));

      const firestoreService = FirestoreService.getInstance();
      
      // Get user profile from users collection
      const userProfile = await firestoreService.getUserProfile(currentUser.uid);
      
      let user: User | null = null;
      let vehicles: Vehicle[] = [];

      if (userProfile) {
        // Map Firebase UserProfile to app User type
        user = {
          id: userProfile.id,
          name: userProfile.displayName || currentUser.displayName || 'User',
          email: userProfile.email || currentUser.email || '',
          phone: userProfile.phoneNumber || undefined,
        };
      } else {
        // Fallback to auth user data if profile doesn't exist
        user = {
          id: currentUser.uid,
          name: currentUser.displayName || 'User',
          email: currentUser.email || '',
          phone: currentUser.phoneNumber || undefined,
        };
      }

      // Try to get customer-specific data
      try {
        const customerProfile = await firestoreService.getCustomerProfile(currentUser.uid);

        if (customerProfile) {
          // Update user name with full name from customer profile
          if (customerProfile.fullName) {
            user.name = customerProfile.fullName;
          }

          // Update phone number from customer profile
          if (customerProfile.phoneNumber) {
            user.phone = customerProfile.phoneNumber;
          }

          // Create vehicle from customer profile data
          if (customerProfile.vehicleNumber) {
            vehicles = [{
              id: '1',
              make: 'Vehicle',
              model: '',
              licensePlate: customerProfile.vehicleNumber,
              color: '',
              year: new Date().getFullYear(),
              type: 'car',
            }];
          }
        }
      } catch (error) {
        console.warn('Could not fetch customer profile:', error);
        // Continue with basic user data
      }

      setProfileData({
        user,
        vehicles,
        isLoading: false,
        isError: false,
        error: null,
      });

    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfileData(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: error instanceof Error ? error.message : 'Failed to load profile',
      }));
    }
  }, [currentUser]);

  const updateUserProfile = useCallback(async (userData: User, userVehicles: Vehicle[] = []) => {
    if (!currentUser) throw new Error('No authenticated user');

    try {
      setProfileData(prev => ({ ...prev, isLoading: true }));

      const firestoreService = FirestoreService.getInstance();

      // Update Firebase Auth display name
      await currentUser.updateProfile({
        displayName: userData.name,
      });

      // Update user profile in Firestore
      await firestoreService.createOrUpdateUserProfile({
        id: currentUser.uid,
        email: userData.email,
        displayName: userData.name,
        phoneNumber: userData.phone,
        isActive: true,
      });

      // Update customer-specific profile
      try {
        const customerUpdateData = {
          userId: currentUser.uid,
          fullName: userData.name,
          phoneNumber: userData.phone,
          vehicleNumber: userVehicles.length > 0 ? userVehicles[0].licensePlate : undefined,
        };

        await firestoreService.createOrUpdateCustomerProfile(customerUpdateData);
      } catch (error) {
        console.warn('Could not update customer profile:', error);
        // Continue even if customer profile update fails
      }

      // Update local state immediately
      setProfileData(prev => ({
        ...prev,
        user: userData,
        vehicles: userVehicles,
        isLoading: false,
        isError: false,
        error: null,
      }));
      
      // Log the update for debugging
      console.log('useUserProfile: Profile updated successfully:', {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        vehicleCount: userVehicles.length,
      });

      // Track profile update activity
      try {
        await firestoreService.trackUserActivity({
          userId: currentUser.uid,
          type: 'profile_update',
          description: 'User updated profile information',
          metadata: {
            updatedFields: ['name', 'phone', 'vehicles'],
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.warn('Could not track profile update activity:', error);
      }

    } catch (error) {
      console.error('Error updating user profile:', error);
      setProfileData(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      }));
      throw error;
    }
  }, [currentUser]);

  const refreshProfile = useCallback(() => {
    if (currentUser) {
      fetchUserProfile();
    }
  }, [fetchUserProfile]);

  return {
    ...profileData,
    currentUser,
    updateUserProfile,
    refreshProfile,
  };
};
