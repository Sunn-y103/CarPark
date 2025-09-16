import app from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

class FirebaseConfig {
  private static instance: FirebaseConfig;
  private app: any = null;

  private constructor() {}

  public static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  public async initialize(): Promise<void> {
    try {
      this.app = app;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }

  public getApp(): any {
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
