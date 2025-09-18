import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { theme } from '../styles/theme';

const { width: screenWidth } = Dimensions.get('window');

interface Tab {
  id: string;
  label: string;
  icon: any;
}

interface OwnerBottomNavigationProps {
  onTabPress?: (tabId: string) => void;
  initialTab?: string;
  activeTab?: string;
}

const OWNER_TABS: Tab[] = [
  { id: 'dashboard', label: 'Home', icon: require('../assets/home.png') },
  { id: 'parking', label: 'Parking', icon: require('../assets/Parking.png') },
  { id: 'bookings', label: 'Bookings', icon: require('../assets/Book_In_Advance.png') },
  { id: 'revenue', label: 'Revenue', icon: require('../assets/wallet.png') },
  { id: 'profile', label: 'Profile', icon: require('../assets/Owner.png') },
];

const OwnerBottomNavigation: React.FC<OwnerBottomNavigationProps> = ({
  onTabPress,
  initialTab = 'dashboard',
  activeTab: parentActiveTab,
}) => {
  const [activeTab, setActiveTab] = useState(parentActiveTab || initialTab);
  
  // Calculate tab width based on screen width and container padding
  const containerWidth = screenWidth - 80; // 40px padding on each side for shorter width
  const tabWidth = containerWidth / OWNER_TABS.length;
  
  // Animated values for indicator position and width
  const indicatorPosition = useRef(
    new Animated.Value(OWNER_TABS.findIndex(tab => tab.id === initialTab) * tabWidth)
  ).current;
  
  const indicatorWidth = useRef(
    new Animated.Value(getContentWidth(parentActiveTab || initialTab))
  ).current;

  // Calculate content width based on icon and text
  function getContentWidth(tabId: string) {
    const baseIconWidth = 20;
    const textPadding = 8; // 4px gap + margins
    
    switch (tabId) {
      case 'dashboard': return baseIconWidth + textPadding + 40; // "Dashboard" width
      case 'parking': return baseIconWidth + textPadding + 48; // "Parking" width  
      case 'bookings': return baseIconWidth + textPadding + 60; // "Bookings" width
      case 'revenue': return baseIconWidth + textPadding + 55; // "Revenue" width
      case 'profile': return baseIconWidth + textPadding + 42; // "Profile" width
      default: return baseIconWidth + textPadding + 32;
    }
  }

  // Sync with parent active tab
  React.useEffect(() => {
    if (parentActiveTab && parentActiveTab !== activeTab) {
      setActiveTab(parentActiveTab);
      const tabIndex = OWNER_TABS.findIndex(tab => tab.id === parentActiveTab);
      if (tabIndex >= 0) {
        const newContentWidth = getContentWidth(parentActiveTab);
        
        // Animate both position and width
        Animated.parallel([
          Animated.timing(indicatorPosition, {
            toValue: tabIndex * tabWidth + (tabWidth - newContentWidth) / 2,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(indicatorWidth, {
            toValue: newContentWidth,
            duration: 300,
            useNativeDriver: false,
          })
        ]).start();
      }
    }
  }, [parentActiveTab, activeTab, tabWidth]);

  const handleTabPress = (tab: Tab, index: number) => {
    setActiveTab(tab.id);
    
    const newContentWidth = getContentWidth(tab.id);
    
    // Animate both position and width
    Animated.parallel([
      Animated.timing(indicatorPosition, {
        toValue: index * tabWidth + (tabWidth - newContentWidth) / 2,
        duration: 300,
        useNativeDriver: false, // Using false because we're animating layout properties
      }),
      Animated.timing(indicatorWidth, {
        toValue: newContentWidth,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
    
    onTabPress?.(tab.id);
  };

  const getIndicatorStyle = () => {
    return {
      height: 36,
      borderRadius: 18, // Always perfectly rounded
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.navigationBar}>
        {/* Animated white indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              transform: [{ translateX: indicatorPosition }],
              width: indicatorWidth,
            },
            getIndicatorStyle(),
          ]}
        />
        
        {/* Tab buttons */}
        {OWNER_TABS.map((tab, index) => {
          const isActive = activeTab === tab.id;
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, { width: tabWidth }]}
              onPress={() => handleTabPress(tab, index)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Image
                  source={tab.icon}
                  style={[
                    styles.tabIcon,
                    {
                      tintColor: isActive ? theme.colors.primary : theme.colors.text.inverse
                    }
                  ]}
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
    bottom: 40,
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
  tabIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});

export default OwnerBottomNavigation;
