# Custom Bottom Navigation Bar

A beautiful, animated bottom navigation bar component inspired by modern mobile app designs. Features a pill-shaped background with smooth animations and a sliding white indicator.

## Features

- 🎨 **Beautiful Design**: Pill-shaped background with dark purple color scheme
- ✨ **Smooth Animations**: Linear animations powered by React Native Reanimated
- 📱 **Responsive**: Adapts to different screen sizes automatically
- 🔧 **Customizable**: Easy to modify colors, icons, and labels
- 🏗️ **TypeScript**: Full TypeScript support with proper type definitions

## Installation

### For Expo Projects
```bash
expo install react-native-reanimated @expo/vector-icons
```

### For React Native CLI Projects
```bash
npm install react-native-reanimated react-native-vector-icons
```

Follow the platform-specific installation guides:
- [React Native Reanimated Installation](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation)
- [React Native Vector Icons Installation](https://github.com/oblador/react-native-vector-icons#installation)

## Usage

```tsx
import React from 'react';
import { SafeAreaView } from 'react-native';
import CustomBottomNavigation from './CustomBottomNavigation';

const App = () => {
  const handleTabPress = (tabId: string) => {
    console.log('Tab pressed:', tabId);
    // Handle navigation here
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Your app content */}
      
      <CustomBottomNavigation
        onTabPress={handleTabPress}
        initialTab="home"
      />
    </SafeAreaView>
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onTabPress` | `(tabId: string) => void` | `undefined` | Callback function called when a tab is pressed |
| `initialTab` | `string` | `'home'` | The initially active tab |

## Available Tabs

The component includes 5 pre-configured tabs:

| Tab ID | Label | Icon | Description |
|--------|-------|------|-------------|
| `maps` | Maps | map-outline | Navigation and location features |
| `history` | History | time-outline | Past activities and records |
| `home` | Home | home-outline | Main/dashboard screen |
| `wallet` | Wallet | wallet-outline | Payment and financial features |
| `profile` | Profile | person-outline | User account and settings |

## Customization

### Changing Colors

Edit the styles in `CustomBottomNavigation.tsx`:

```tsx
const styles = StyleSheet.create({
  navigationBar: {
    backgroundColor: '#4A1A5C', // Change main background color
    // ... other styles
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF', // Change indicator color
    // ... other styles
  },
  // ... other styles
});
```

### Modifying Tabs

Update the `TABS` array in `CustomBottomNavigation.tsx`:

```tsx
const TABS: Tab[] = [
  { id: 'custom1', label: 'Custom', icon: 'star-outline' },
  // Add, remove, or modify tabs as needed
];
```

### Animation Settings

Adjust animation timing in the `handleTabPress` function:

```tsx
indicatorPosition.value = withTiming(index * tabWidth, {
  duration: 300, // Change animation duration
  easing: Easing.out(Easing.cubic), // Modify easing function
});
```

## Integration with React Navigation

If you're using React Navigation, you can integrate the component like this:

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Create a custom tab bar component
const CustomTabBar = ({ navigation, state }) => {
  const handleTabPress = (tabId: string) => {
    const routeIndex = state.routeNames.indexOf(tabId);
    navigation.navigate(state.routeNames[routeIndex]);
  };

  return (
    <CustomBottomNavigation
      onTabPress={handleTabPress}
      initialTab={state.routeNames[state.index]}
    />
  );
};

// Use in your navigator
const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
        {/* Your screens */}
      </Tab.Navigator>
    </NavigationContainer>
  );
};
```

## Troubleshooting

### Icons not showing
Make sure you've properly installed and linked `react-native-vector-icons` or are using `@expo/vector-icons` for Expo projects.

### Animations not working
Ensure `react-native-reanimated` is properly installed and configured for your platform.

### Component not responsive
The component automatically calculates tab widths based on screen size. If you're having issues, check that the container has proper padding/margins.

## License

MIT License - feel free to use this component in your projects!
