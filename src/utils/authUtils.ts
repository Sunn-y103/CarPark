import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';
import FirestoreService from '../services/FirestoreService';

/**
 * Robust logout utility that handles various edge cases
 */
export class AuthUtils {
  /**
   * Performs a complete logout with proper error handling
   * @param userId - Current user ID for activity tracking
   * @param onLogoutComplete - Callback to execute after successful logout
   */
  static async performLogout(
    userId?: string, 
    onLogoutComplete?: () => void
  ): Promise<void> {
    try {
      console.log('Starting logout process...');
      
      // Track logout activity if user ID is available
      if (userId) {
        try {
          const firestoreService = FirestoreService.getInstance();
          await firestoreService.trackUserActivity({
            userId,
            type: 'logout',
            description: 'User logged out',
            metadata: {
              timestamp: new Date().toISOString(),
            },
          });
          console.log('Logout activity tracked successfully');
        } catch (trackingError) {
          console.warn('Failed to track logout activity:', trackingError);
          // Don't block logout if tracking fails
        }
      }

      // Sign out from Firebase Auth
      await auth().signOut();
      console.log('Firebase signOut successful');

      // Execute completion callback
      if (onLogoutComplete) {
        onLogoutComplete();
      }

    } catch (error) {
      console.error('Logout failed:', error);
      
      // Show user-friendly error message
      Alert.alert(
        'Logout Failed',
        'There was an error signing you out. Please try again.',
        [
          {
            text: 'Retry',
            onPress: () => AuthUtils.performLogout(userId, onLogoutComplete)
          },
          {
            text: 'Force Logout',
            style: 'destructive',
            onPress: () => {
              // Force logout by clearing local state
              if (onLogoutComplete) {
                onLogoutComplete();
              }
            }
          }
        ]
      );
    }
  }

  /**
   * Checks if user is currently authenticated
   */
  static isUserAuthenticated(): boolean {
    const user = auth().currentUser;
    return user !== null;
  }

  /**
   * Gets current user information
   */
  static getCurrentUser() {
    return auth().currentUser;
  }

  /**
   * Clears all authentication state (use as last resort)
   */
  static async forceSignOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Force signout error:', error);
    }
  }
}
