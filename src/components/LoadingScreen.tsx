import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { theme } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';

interface LoadingScreenProps {
  visible: boolean;
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  visible, 
  message = 'Please wait...' 
}) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent>
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.xl,
          alignItems: 'center',
          minWidth: 200,
          shadowColor: theme.colors.shadow,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 10,
        }}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ marginBottom: theme.spacing.base }}
          />
          <Text style={{
            fontSize: theme.typography.fontSizes.base,
            color: theme.colors.text.primary,
            textAlign: 'center',
            fontWeight: theme.typography.fontWeights.medium as any,
          }}>
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};
