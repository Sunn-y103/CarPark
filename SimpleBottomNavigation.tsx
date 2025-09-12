import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface Tab {
  id: string;
  label: string;
  icon: string; // We'll use simple text icons for now
}

interface SimpleBottomNavigationProps {
  onTabPress?: (tabId: string) => void;
  initialTab?: string;
}

const TABS: Tab[] = [
  { id: 'maps', label: 'Maps', icon: '🗺️' },
  { id: 'history', label: 'History', icon: '🕐' },
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'wallet', label: 'Wallet', icon: '💰' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

const SimpleBottomNavigation: React.FC<SimpleBottomNavigationProps> = ({
  onTabPress,
  initialTab = 'home',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Calculate tab width based on screen width and container padding
  const containerWidth = screenWidth - 40; // 20px padding on each side
  const tabWidth = containerWidth / TABS.length;
  
  // Animated value for indicator position
  const indicatorPosition = new Animated.Value(
    TABS.findIndex(tab => tab.id === initialTab) * tabWidth
  );

  const handleTabPress = (tab: Tab, index: number) => {
    setActiveTab(tab.id);
    
    // Animate indicator to new position
    Animated.timing(indicatorPosition, {
      toValue: index * tabWidth,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    onTabPress?.(tab.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navigationBar}>
        {/* Animated white indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              width: tabWidth,
              transform: [{ translateX: indicatorPosition }],
            },
          ]}
        />
        
        {/* Tab buttons */}
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab.id;
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, { width: tabWidth }]}
              onPress={() => handleTabPress(tab, index)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Text style={[styles.icon, { color: isActive ? '#4A1A5C' : '#FFFFFF' }]}>
                  {tab.icon}
                </Text>
                {isActive && (
                  <Text style={styles.activeTabLabel}>{tab.label}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  navigationBar: {
    flexDirection: 'row',
    backgroundColor: '#4A1A5C',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 4,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    top: 8,
    left: 4,
    zIndex: 1,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    zIndex: 2,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  icon: {
    fontSize: 20,
  },
  activeTabLabel: {
    color: '#4A1A5C',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default SimpleBottomNavigation;
