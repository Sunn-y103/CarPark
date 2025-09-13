import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { testFirebaseConnection } from '../utils/firebaseTest';
import { theme } from '../styles/theme';

export const FirebaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('Not tested');
  const [isLoading, setIsLoading] = useState(false);

  const runFirebaseTest = async () => {
    setIsLoading(true);
    setTestResult('Testing...');

    try {
      const success = await testFirebaseConnection();
      
      if (success) {
        setTestResult('✅ Firebase Connected Successfully!');
        Alert.alert('Success!', 'Firebase is working correctly!');
      } else {
        setTestResult('❌ Firebase Connection Failed');
        Alert.alert('Error', 'Firebase connection failed. Check console for details.');
      }
    } catch (error) {
      console.error('Test error:', error);
      setTestResult('❌ Test Error - Check console');
      Alert.alert('Error', 'Test failed. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-run test on component mount
  useEffect(() => {
    runFirebaseTest();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Firebase Status</Text>
      <Text style={styles.status}>{testResult}</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={runFirebaseTest}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Firebase Connection'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.text.primary,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
