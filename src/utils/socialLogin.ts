import { Alert } from 'react-native';

export interface SocialLoginResult {
  success: boolean;
  userData?: {
    name: string;
    email: string;
    password: string; // Auto-generated for social login
  };
}

export interface SocialProvider {
  name: string;
  icon: any; // Will be replaced with actual icon imports
}

// Mock user data for different social providers
const mockSocialAccounts = {
  google: [
    { name: 'John Doe', email: 'john.doe@gmail.com' },
    { name: 'Jane Smith', email: 'jane.smith@gmail.com' },
    { name: 'Mike Johnson', email: 'mike.johnson@gmail.com' },
  ],
  facebook: [
    { name: 'Sarah Wilson', email: 'sarah.wilson@facebook.com' },
    { name: 'David Brown', email: 'david.brown@facebook.com' },
    { name: 'Emily Davis', email: 'emily.davis@facebook.com' },
  ],
  apple: [
    { name: 'Alex Thompson', email: 'alex.thompson@icloud.com' },
    { name: 'Lisa Anderson', email: 'lisa.anderson@icloud.com' },
    { name: 'Chris Martinez', email: 'chris.martinez@icloud.com' },
  ],
};

// Generate a secure random password for social login
const generateSocialPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const handleSocialLogin = async (
  provider: 'google' | 'facebook' | 'apple'
): Promise<SocialLoginResult> => {
  return new Promise((resolve) => {
    const accounts = mockSocialAccounts[provider];
    
    // Create account selection options
    const accountOptions = accounts.map((account, index) => ({
      text: `${account.name} (${account.email})`,
      onPress: () => {
        const userData = {
          name: account.name,
          email: account.email,
          password: generateSocialPassword(),
        };
        resolve({ success: true, userData });
      },
    }));
    
    // Add cancel option
    accountOptions.push({
      text: 'Cancel',
      onPress: () => resolve({ success: false }),
    });
    
    // Show account selection alert
    Alert.alert(
      `Select ${provider.charAt(0).toUpperCase() + provider.slice(1)} Account`,
      'Choose an account to continue with:',
      accountOptions
    );
  });
};

export const getSocialProviders = (): SocialProvider[] => {
  return [
    { name: 'google', icon: null }, // Will be replaced with actual icons
    { name: 'facebook', icon: null },
    { name: 'apple', icon: null },
  ];
};
