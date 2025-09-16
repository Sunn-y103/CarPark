import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Firebase connection...');
    
    const authUser = auth().currentUser;
    console.log('Auth connection test passed. Current user:', authUser?.uid || 'No user');
    
    const testDoc = firestore().collection('test').doc('connection');
    await testDoc.get();
    console.log('Firestore connection test passed');
    
    return true;
  } catch (error: any) {
    console.error('Firebase connection test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return false;
  }
};

export const testNetworkConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    console.error('Network test failed:', error);
    return false;
  }
};
