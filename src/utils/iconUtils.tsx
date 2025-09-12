import React from 'react';
import { Image, ImageSourcePropType } from 'react-native';

// Icon source mappings
export const icons = {
  check: require('../assets/userprofile.png'), // Using userprofile as checkmark for now
  user: require('../assets/userprofile.png'),
  owner: require('../assets/Owner.png'),
  google: require('../assets/Google.png'),
  facebook: require('../assets/Facebook.png'),
  apple: require('../assets/Apple.png'),
  home: require('../assets/home.png'),
  map: require('../assets/map.png'),
  wallet: require('../assets/wallet.png'),
  history: require('../assets/history.png'),
  notifications: require('../assets/Notifications.png'),
  nearby: require('../assets/Nearby.png'),
  findParking: require('../assets/Find_Parking.png'),
  bookInAdvance: require('../assets/Book_In_Advance.png'),
  topRated: require('../assets/Top_Rated.png'),
  noParking: require('../assets/No_Parking.png'),
  editProfile: require('../assets/Edit_Profile.png'),
  helpSupport: require('../assets/Help&Support.png'),
  securityPrivacy: require('../assets/Security&Privacy.png'),
};

export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  size: number;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({ name, size, style }) => {
  return (
    <Image 
      source={icons[name]} 
      style={[{ width: size, height: size }, style]} 
      resizeMode="contain"
    />
  );
};
