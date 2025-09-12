import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from './src/styles/theme';

const { width: screenWidth } = Dimensions.get('window');

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface CustomBottomNavigationProps {
  onTabPress?: (tabId: string) => void;
  initialTab?: string;
}

const TABS: Tab[] = [
  { id: 'maps', label: 'Maps', icon: 'map-outline' },
  { id: 'history', label: 'History', icon: 'time-outline' },
  { id: 'home', label: 'Home', icon: 'home-outline' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet-outline' },
  { id: 'profile', label: 'Profile', icon: 'person-outline' },
];

const CustomBottomNavigation: React.FC<CustomBottomNavigationProps> = ({
  onTabPress,
  initialTab = 'home',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Calculate tab width based on screen width and container padding
  const containerWidth = screenWidth - 80; // 40px padding on each side for shorter width
  const tabWidth = containerWidth / TABS.length;
  
  // Animated value for indicator position
  const indicatorPosition = useRef(
    new Animated.Value(TABS.findIndex(tab => tab.id === initialTab) * tabWidth)
  ).current;

  const handleTabPress = (tab: Tab, index: number) => {
    setActiveTab(tab.id);
    
    // Animate indicator to new position
    Animated.timing(indicatorPosition, {
      toValue: index * tabWidth,
      duration: 300,
      useNativeDriver: false, // Using false because we're animating layout properties
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
                <Icon
                  name={tab.icon}
                  size={20}
                  color={isActive ? theme.colors.primary : theme.colors.text.inverse}
                />
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
    left: 40, // Increased from 20 to make navigation bar shorter
    right: 40, // Increased from 20 to make navigation bar shorter
    alignItems: 'center',
  },
  navigationBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary, // Updated to match theme
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 4,
    elevation: 10,
    shadowColor: theme.colors.shadow,
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
    backgroundColor: theme.colors.accent, // Updated to use theme accent color
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
  activeTabLabel: {
    color: theme.colors.primary, // Updated to use theme primary color
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default CustomBottomNavigation;
