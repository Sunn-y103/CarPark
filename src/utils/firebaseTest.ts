import FirebaseConfig from '../config/firebase';
import FirestoreService from '../services/FirestoreService';

/**
 * Test Firebase connection and basic functionality
 * This can be called from your app to verify everything is working
 */
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // 1. Test Firebase initialization
    await FirebaseConfig.getInstance().initialize();
    console.log('✅ Firebase initialized successfully');
    
    // 2. Test Firestore connection
    const firestore = FirebaseConfig.getInstance().getFirestore();
    if (!firestore) {
      throw new Error('Firestore instance not available');
    }
    console.log('✅ Firestore instance available');
    
    // 3. Test basic Firestore operation (read system time from server)
    const testDoc = await firestore.doc('test/connection').get();
    console.log('✅ Firestore connection established');
    
    // 4. Test FirestoreService
    const firestoreService = FirestoreService.getInstance();
    console.log('✅ FirestoreService instance created');
    
    // 5. Test Auth service
    const auth = FirebaseConfig.getInstance().getAuth();
    if (!auth) {
      throw new Error('Auth instance not available');
    }
    console.log('✅ Auth instance available');
    
    console.log('🎉 All Firebase tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return false;
  }
};

/**
 * Test user activity tracking
 * Only call this when user is authenticated
 */
export const testUserActivityTracking = async (userId: string): Promise<boolean> => {
  try {
    console.log('📊 Testing user activity tracking...');
    
    const firestoreService = FirestoreService.getInstance();
    
    // Track a test activity
    const activityId = await firestoreService.trackUserActivity({
      userId,
      type: 'login',
      description: 'Test activity tracking',
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
      },
    });
    
    console.log('✅ Activity tracked with ID:', activityId);
    
    // Retrieve recent activities
    const activities = await firestoreService.getUserActivities(userId, 5);
    console.log('✅ Retrieved activities:', activities.length);
    
    console.log('🎉 Activity tracking test passed!');
    return true;
  } catch (error) {
    console.error('❌ Activity tracking test failed:', error);
    return false;
  }
};

/**
 * Clean up test data
 * Call this to remove any test documents created during testing
 */
export const cleanupTestData = async (): Promise<void> => {
  try {
    const firestore = FirebaseConfig.getInstance().getFirestore();
    await firestore.doc('test/connection').delete();
    console.log('🧹 Test data cleaned up');
  } catch (error) {
    console.log('Note: No test data to clean up or cleanup failed:', error);
  }
};
