import { FirebaseApp, getApps, initializeApp } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Firebase configuration (these will be loaded from your google-services.json and GoogleService-Info.plist)
// No need to manually configure - React Native Firebase handles this automatically

class FirebaseConfig {
  private static instance: FirebaseConfig;
  private app: FirebaseApp | null = null;

  private constructor() {}

  public static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Check if Firebase is already initialized
      const apps = getApps();
      if (apps.length === 0) {
        // Initialize Firebase - configuration comes from platform files
        this.app = initializeApp();
      } else {
        this.app = apps[0];
      }

      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }

  public getApp(): FirebaseApp | null {
    return this.app;
  }

  public getFirestore() {
    return firestore();
  }

  public getAuth() {
    return auth();
  }
}

export default FirebaseConfig;
