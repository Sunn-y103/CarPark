import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';
import FirestoreService from '../services/FirestoreService';

export class AuthUtils {
  static async performLogout(
    userId?: string, 
    onLogoutComplete?: () => void
  ): Promise<void> {
    try {
      console.log('Starting logout process...');
      
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
        }
      }

      await auth().signOut();
      console.log('Firebase signOut successful');

      if (onLogoutComplete) {
        onLogoutComplete();
      }

    } catch (error) {
      console.error('Logout failed:', error);
      
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
              if (onLogoutComplete) {
                onLogoutComplete();
              }
            }
          }
        ]
      );
    }
  }

  static isUserAuthenticated(): boolean {
    const user = auth().currentUser;
    return user !== null;
  }

  static getCurrentUser() {
    return auth().currentUser;
  }

  static async forceSignOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Force signout error:', error);
    }
  }
}
