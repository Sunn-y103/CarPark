import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Platform } from 'react-native';
import { 
  UserProfile, 
  UserActivity, 
  ParkingHistory, 
  WalletTransaction, 
  UserAnalytics,
  ActivityType, 
  CreateActivityData, 
  COLLECTIONS 
} from '../types/firebase';
import FirebaseConfig from '../config/firebase';

class FirestoreService {
  private static instance: FirestoreService;
  private firestore: FirebaseFirestoreTypes.Module;

  private constructor() {
    this.firestore = FirebaseConfig.getInstance().getFirestore();
  }

  public static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  // ============ USER PROFILE METHODS ============
  
  /**
   * Create or update user profile
   */
  async createOrUpdateUserProfile(userProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const userRef = this.firestore.collection(COLLECTIONS.USERS).doc(userProfile.id);
      const userDoc = await userRef.get();
      
      const timestamp = firestore.Timestamp.now();
      
      if (userDoc.exists) {
        // Update existing user
        await userRef.update({
          ...userProfile,
          updatedAt: timestamp,
        });
      } else {
        // Create new user
        await userRef.set({
          ...userProfile,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await this.firestore.collection(COLLECTIONS.USERS).doc(userId).get();
      
      if (userDoc.exists) {
        return { id: userDoc.id, ...userDoc.data() } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // ============ USER ACTIVITY METHODS ============

  /**
   * Track user activity
   */
  async trackUserActivity(activityData: CreateActivityData): Promise<string> {
    try {
      const activity: Omit<UserActivity, 'id'> = {
        ...activityData,
        timestamp: firestore.Timestamp.now(),
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version.toString(),
        },
      };

      const docRef = await this.firestore.collection(COLLECTIONS.USER_ACTIVITIES).add(activity);
      return docRef.id;
    } catch (error) {
      console.error('Error tracking user activity:', error);
      throw error;
    }
  }

  /**
   * Get user activities with pagination
   */
  async getUserActivities(
    userId: string, 
    limit: number = 20, 
    lastActivity?: UserActivity
  ): Promise<UserActivity[]> {
    try {
      let query = this.firestore
        .collection(COLLECTIONS.USER_ACTIVITIES)
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(limit);

      if (lastActivity && lastActivity.timestamp) {
        query = query.startAfter(lastActivity.timestamp);
      }

      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserActivity[];
    } catch (error) {
      console.error('Error getting user activities:', error);
      throw error;
    }
  }

  /**
   * Get user activities by type
   */
  async getUserActivitiesByType(userId: string, activityType: ActivityType, limit: number = 10): Promise<UserActivity[]> {
    try {
      const snapshot = await this.firestore
        .collection(COLLECTIONS.USER_ACTIVITIES)
        .where('userId', '==', userId)
        .where('type', '==', activityType)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserActivity[];
    } catch (error) {
      console.error('Error getting activities by type:', error);
      throw error;
    }
  }

  // ============ PARKING HISTORY METHODS ============

  /**
   * Create parking history record
   */
  async createParkingHistory(parkingData: Omit<ParkingHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const timestamp = firestore.Timestamp.now();
      const parkingHistory: Omit<ParkingHistory, 'id'> = {
        ...parkingData,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const docRef = await this.firestore.collection(COLLECTIONS.PARKING_HISTORY).add(parkingHistory);
      return docRef.id;
    } catch (error) {
      console.error('Error creating parking history:', error);
      throw error;
    }
  }

  /**
   * Update parking history
   */
  async updateParkingHistory(parkingId: string, updates: Partial<ParkingHistory>): Promise<void> {
    try {
      await this.firestore.collection(COLLECTIONS.PARKING_HISTORY).doc(parkingId).update({
        ...updates,
        updatedAt: firestore.Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating parking history:', error);
      throw error;
    }
  }

  /**
   * Get user parking history
   */
  async getUserParkingHistory(userId: string, limit: number = 20): Promise<ParkingHistory[]> {
    try {
      const snapshot = await this.firestore
        .collection(COLLECTIONS.PARKING_HISTORY)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParkingHistory[];
    } catch (error) {
      console.error('Error getting parking history:', error);
      throw error;
    }
  }

  // ============ WALLET TRANSACTION METHODS ============

  /**
   * Create wallet transaction
   */
  async createWalletTransaction(transactionData: Omit<WalletTransaction, 'id'>): Promise<string> {
    try {
      const docRef = await this.firestore.collection(COLLECTIONS.WALLET_TRANSACTIONS).add(transactionData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating wallet transaction:', error);
      throw error;
    }
  }

  /**
   * Get user wallet transactions
   */
  async getUserWalletTransactions(userId: string, limit: number = 50): Promise<WalletTransaction[]> {
    try {
      const snapshot = await this.firestore
        .collection(COLLECTIONS.WALLET_TRANSACTIONS)
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WalletTransaction[];
    } catch (error) {
      console.error('Error getting wallet transactions:', error);
      throw error;
    }
  }

  // ============ ANALYTICS METHODS ============

  /**
   * Update user analytics
   */
  async updateUserAnalytics(userId: string, analytics: Partial<UserAnalytics>): Promise<void> {
    try {
      const analyticsRef = this.firestore.collection(COLLECTIONS.USER_ANALYTICS).doc(userId);
      
      await analyticsRef.set({
        userId,
        ...analytics,
        updatedAt: firestore.Timestamp.now(),
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user analytics:', error);
      throw error;
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    try {
      const doc = await this.firestore.collection(COLLECTIONS.USER_ANALYTICS).doc(userId).get();
      
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as UserAnalytics;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }

  // ============ UTILITY METHODS ============

  /**
   * Batch write operations
   */
  async batchWrite(operations: Array<{ type: 'set' | 'update' | 'delete', ref: FirebaseFirestoreTypes.DocumentReference, data?: any }>): Promise<void> {
    try {
      const batch = this.firestore.batch();

      operations.forEach(({ type, ref, data }) => {
        switch (type) {
          case 'set':
            batch.set(ref, data);
            break;
          case 'update':
            batch.update(ref, data);
            break;
          case 'delete':
            batch.delete(ref);
            break;
        }
      });

      await batch.commit();
    } catch (error) {
      console.error('Error in batch write:', error);
      throw error;
    }
  }

  /**
   * Listen to real-time updates for user activities
   */
  subscribeToUserActivities(userId: string, callback: (activities: UserActivity[]) => void): () => void {
    const unsubscribe = this.firestore
      .collection(COLLECTIONS.USER_ACTIVITIES)
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .onSnapshot(
        (snapshot) => {
          const activities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as UserActivity[];
          callback(activities);
        },
        (error) => {
          console.error('Error in activities subscription:', error);
        }
      );

    return unsubscribe;
  }
}

export default FirestoreService;
