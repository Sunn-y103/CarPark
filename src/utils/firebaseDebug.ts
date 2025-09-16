import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';

export class FirebaseDebug {
  /**
   * Test Firebase Auth connection and current state
   */
  static async testAuth(): Promise<void> {
    try {
      console.log('=== Firebase Auth Debug Test ===');
      
      // Check if Firebase is initialized
      const currentUser = auth().currentUser;
      console.log('Current User:', currentUser?.uid || 'No user signed in');
      console.log('User Email:', currentUser?.email || 'N/A');
      
      // Test auth state
      const authState = auth().currentUser !== null;
      console.log('Is Authenticated:', authState);
      
      // Test signOut functionality
      if (currentUser) {
        console.log('Testing signOut...');
        await auth().signOut();
        console.log('SignOut successful');
        
        // Check state after signOut
        const userAfterSignOut = auth().currentUser;
        console.log('User after signOut:', userAfterSignOut?.uid || 'Successfully signed out');
      } else {
        console.log('No user to sign out');
      }
      
      Alert.alert(
        'Firebase Debug Complete', 
        'Check console logs for detailed information'
      );
      
    } catch (error) {
      console.error('Firebase Debug Error:', error);
      Alert.alert(
        'Firebase Debug Error', 
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Force clear auth state (nuclear option)
   */
  static async forceSignOut(): Promise<void> {
    try {
      console.log('=== Force SignOut ===');
      
      // Multiple attempts to sign out
      for (let i = 0; i < 3; i++) {
        try {
          await auth().signOut();
          console.log(`SignOut attempt ${i + 1}: Success`);
          break;
        } catch (error) {
          console.log(`SignOut attempt ${i + 1}: Failed -`, error);
          if (i === 2) {
            throw error;
          }
        }
      }
      
      // Verify sign out
      const currentUser = auth().currentUser;
      if (currentUser) {
        console.warn('Warning: User still signed in after force signOut');
      } else {
        console.log('Force signOut successful');
      }
      
    } catch (error) {
      console.error('Force SignOut Error:', error);
      throw error;
    }
  }

  /**
   * Get detailed auth info
   */
  static getAuthInfo(): string {
    const user = auth().currentUser;
    if (!user) {
      return 'No user authenticated';
    }
    
    return `
User ID: ${user.uid}
Email: ${user.email}
Email Verified: ${user.emailVerified}
Display Name: ${user.displayName}
Provider: ${user.providerData.map(p => p.providerId).join(', ')}
Creation Time: ${user.metadata.creationTime}
Last Sign In: ${user.metadata.lastSignInTime}
    `.trim();
  }
}
