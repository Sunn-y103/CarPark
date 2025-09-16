import FirestoreService from './FirestoreService';
import { 
  UserProfile, 
  CreateActivityData 
} from '../types/firebase';

export class SafeFirestoreService {
  private static instance: SafeFirestoreService;
  private firestoreAvailable = true;

  private constructor() {}

  private cleanUndefinedValues<T extends Record<string, any>>(obj: T): Partial<T> {
    const cleaned: Partial<T> = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined) {
        cleaned[key as keyof T] = value;
      }
    });
    return cleaned;
  }

  public static getInstance(): SafeFirestoreService {
    if (!SafeFirestoreService.instance) {
      SafeFirestoreService.instance = new SafeFirestoreService();
    }
    return SafeFirestoreService.instance;
  }

  async safeCreateOrUpdateUserProfile(userProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<boolean> {
    if (!this.firestoreAvailable) {
      console.log('Firestore unavailable, skipping user profile operation');
      return false;
    }

    try {
      const firestoreService = FirestoreService.getInstance();
      const cleanedProfile = this.cleanUndefinedValues(userProfile) as Omit<UserProfile, 'createdAt' | 'updatedAt'>;
      console.log('Creating/updating user profile with cleaned data:', cleanedProfile);
      await firestoreService.createOrUpdateUserProfile(cleanedProfile);
      console.log('User profile operation successful');
      return true;
    } catch (error: any) {
      console.warn('User profile operation failed:', error?.message || error);
      
      if (this.isFirestoreUnavailableError(error)) {
        this.firestoreAvailable = false;
        console.log('Marking Firestore as unavailable');
      }
      
      return false;
    }
  }

  async safeTrackUserActivity(activityData: CreateActivityData): Promise<boolean> {
    if (!this.firestoreAvailable) {
      console.log('Firestore unavailable, skipping activity tracking');
      return false;
    }

    try {
      const firestoreService = FirestoreService.getInstance();
      const cleanedActivity = this.cleanUndefinedValues(activityData) as CreateActivityData;
      console.log('Tracking user activity with cleaned data:', cleanedActivity);
      await firestoreService.trackUserActivity(cleanedActivity);
      console.log('Activity tracking successful');
      return true;
    } catch (error: any) {
      console.warn('Activity tracking failed:', error?.message || error);
      
      if (this.isFirestoreUnavailableError(error)) {
        this.firestoreAvailable = false;
        console.log('Marking Firestore as unavailable');
      }
      
      return false;
    }
  }

  private isFirestoreUnavailableError(error: any): boolean {
    if (!error) return false;
    
    const errorMessage = error.message || error.toString();
    const errorCode = error.code;
    
    return (
      errorCode === 'firestore/unavailable' ||
      errorCode === 'unavailable' ||
      errorMessage.includes('unavailable') ||
      errorMessage.includes('network') ||
      errorCode === 'firestore/permission-denied' ||
      errorCode === 'permission-denied'
    );
  }

  async testFirestoreConnection(): Promise<boolean> {
    try {
      const firestoreService = FirestoreService.getInstance();
      const testUserId = 'test-connection';
      await firestoreService.getUserProfile(testUserId);
      
      this.firestoreAvailable = true;
      console.log('Firestore connection test: Available');
      return true;
    } catch (error: any) {
      console.warn('Firestore connection test failed:', error?.message || error);
      
      if (this.isFirestoreUnavailableError(error)) {
        this.firestoreAvailable = false;
      }
      
      return false;
    }
  }

  isFirestoreAvailable(): boolean {
    return this.firestoreAvailable;
  }

  resetAvailabilityStatus(): void {
    this.firestoreAvailable = true;
    console.log('Firestore availability status reset');
  }

  getFirestore() {
    const firestoreService = FirestoreService.getInstance();
    return firestoreService.getFirestore();
  }
}
