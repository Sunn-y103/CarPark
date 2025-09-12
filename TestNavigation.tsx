import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import SimpleBottomNavigation from './SimpleBottomNavigation';

const TestNavigation: React.FC = () => {
  const handleTabPress = (tabId: string) => {
    console.log('Tab pressed:', tabId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎉 Navigation Test</Text>
        <Text style={styles.subtitle}>
          The bottom navigation should appear below with emoji icons
        </Text>
      </View>
      
      <SimpleBottomNavigation
        onTabPress={handleTabPress}
        initialTab="home"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A1A5C',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default TestNavigation;
