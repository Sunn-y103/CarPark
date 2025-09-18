import { useState, useEffect, useCallback } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import FirestoreService from '../services/FirestoreService';
import { UserProfile } from '../types/firebase';

export interface OwnerData {
  id: string;
  ownerName: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  businessLicense: string;
  totalSpots: number;
  operatingHours: string;
  autoApproval: boolean;
  notifications: boolean;
  emailAlerts: boolean;
}

export interface OwnerProfileData {
  owner: OwnerData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}

export const useOwnerProfile = () => {
  const [profileData, setProfileData] = useState<OwnerProfileData>({
    owner: null,
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
          owner: null,
          isLoading: false,
          isError: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  // Fetch owner profile data when user changes
  useEffect(() => {
    if (currentUser) {
      fetchOwnerProfile();
    }
  }, [currentUser]);

  const fetchOwnerProfile = useCallback(async () => {
    if (!currentUser) return;

    try {
      setProfileData(prev => ({ ...prev, isLoading: true, isError: false, error: null }));

      const firestoreService = FirestoreService.getInstance();
      
      // Get user profile from users collection
      const userProfile = await firestoreService.getUserProfile(currentUser.uid);
      
      // Get owner-specific profile from ownerProfiles collection
      const ownerProfile = await firestoreService.getOwnerProfile(currentUser.uid);

      let owner: OwnerData | null = null;

      if (ownerProfile || userProfile) {
        // Create owner data from both profiles
        owner = {
          id: currentUser.uid,
          ownerName: ownerProfile?.ownerName || userProfile?.displayName || currentUser.displayName || 'Owner',
          businessName: ownerProfile?.businessName || 'CarPark Business',
          email: userProfile?.email || currentUser.email || '',
          phone: ownerProfile?.businessPhone || userProfile?.phoneNumber || currentUser.phoneNumber || '',
          address: ownerProfile?.businessAddress || '',
          businessLicense: ownerProfile?.businessLicense || '',
          totalSpots: ownerProfile?.totalSpots || 50,
          operatingHours: ownerProfile?.operatingHours || '24/7',
          autoApproval: ownerProfile?.autoApproval !== undefined ? ownerProfile.autoApproval : true,
          notifications: ownerProfile?.notifications !== undefined ? ownerProfile.notifications : true,
          emailAlerts: ownerProfile?.emailAlerts !== undefined ? ownerProfile.emailAlerts : false,
        };
      }

      setProfileData({
        owner,
        isLoading: false,
        isError: false,
        error: null,
      });

    } catch (error) {
      console.error('Error fetching owner profile:', error);
      setProfileData(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: error instanceof Error ? error.message : 'Failed to load owner profile',
      }));
    }
  }, [currentUser]);

  const updateOwnerProfile = useCallback(async (ownerData: Partial<OwnerData>) => {
    if (!currentUser) throw new Error('No authenticated user');

    try {
      setProfileData(prev => ({ ...prev, isLoading: true }));

      const firestoreService = FirestoreService.getInstance();

      // Update Firebase Auth display name if owner name changed
      if (ownerData.ownerName && ownerData.ownerName !== currentUser.displayName) {
        await currentUser.updateProfile({
          displayName: ownerData.ownerName,
        });
      }

      // Update user profile in users collection
      await firestoreService.createOrUpdateUserProfile({
        id: currentUser.uid,
        email: ownerData.email || currentUser.email || '',
        displayName: ownerData.ownerName || currentUser.displayName || 'Owner',
        phoneNumber: ownerData.phone,
        isActive: true,
        role: 'owner',
      });

      // Update owner-specific profile in ownerProfiles collection
      await firestoreService.createOrUpdateOwnerProfile({
        userId: currentUser.uid,
        ownerName: ownerData.ownerName || 'Owner',
        businessName: ownerData.businessName,
        businessAddress: ownerData.address,
        businessPhone: ownerData.phone,
        businessLicense: ownerData.businessLicense,
        totalSpots: ownerData.totalSpots,
        operatingHours: ownerData.operatingHours,
        autoApproval: ownerData.autoApproval,
        notifications: ownerData.notifications,
        emailAlerts: ownerData.emailAlerts,
      });

      // Update local state
      setProfileData(prev => ({
        ...prev,
        owner: prev.owner ? { ...prev.owner, ...ownerData } : null,
        isLoading: false,
      }));

      // Track profile update activity
      try {
        await firestoreService.trackUserActivity({
          userId: currentUser.uid,
          type: 'profile_update',
          description: 'Owner updated profile information',
          metadata: {
            updatedFields: Object.keys(ownerData),
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.warn('Could not track profile update activity:', error);
      }

    } catch (error) {
      console.error('Error updating owner profile:', error);
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
      fetchOwnerProfile();
    }
  }, [fetchOwnerProfile]);

  return {
    ...profileData,
    currentUser,
    updateOwnerProfile,
    refreshProfile,
  };
};
