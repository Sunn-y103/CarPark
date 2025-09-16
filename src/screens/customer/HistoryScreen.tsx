import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';

export const HistoryScreen: React.FC = () => {
  const historyData = [
    {
      id: 1,
      location: 'Mall Plaza Parking',
      date: 'Today, 2:30 PM - 5:45 PM',
      duration: '3h 15m',
      amount: '₹120',
      status: 'Completed',
    },
    {
      id: 2,
      location: 'City Center Parking',
      date: 'Yesterday, 10:00 AM - 12:30 PM',
      duration: '2h 30m',
      amount: '₹80',
      status: 'Completed',
    },
    {
      id: 3,
      location: 'Metro Station Parking',
      date: '2 days ago, 9:15 AM - 6:00 PM',
      duration: '8h 45m',
      amount: '₹200',
      status: 'Completed',
    },
    {
      id: 4,
      location: 'Airport Parking',
      date: '1 week ago, 6:00 AM - 11:30 PM',
      duration: '17h 30m',
      amount: '₹450',
      status: 'Completed',
    },
  ];

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={{ 
        flex: 1, 
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xl + theme.spacing.sm,
        paddingBottom: theme.spacing.xl + theme.spacing.base
      }}>
        
        {/* Header */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text style={[commonStyles.title, { textAlign: 'left' }]}>
            Parking History
          </Text>
        </View>

        {/* Filter Options */}
        <View style={{
          flexDirection: 'row',
          marginBottom: theme.spacing.lg,
        }}>
          <TouchableOpacity
            style={[
              commonStyles.button,
              { 
                flex: 1,
                marginRight: theme.spacing.xs,
                paddingVertical: theme.spacing.sm + 2,
              }
            ]}>
            <Text style={[commonStyles.buttonText, { fontSize: theme.typography.fontSizes.sm }]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              commonStyles.socialButton,
              { 
                flex: 1,
                marginHorizontal: theme.spacing.xs,
                paddingVertical: theme.spacing.sm + 2,
              }
            ]}>
            <Text style={[{ color: theme.colors.text.primary }, { fontSize: theme.typography.fontSizes.sm }]}>
              This Month
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              commonStyles.socialButton,
              { 
                flex: 1,
                marginLeft: theme.spacing.xs,
                paddingVertical: theme.spacing.sm + 2,
              }
            ]}>
            <Text style={[{ color: theme.colors.text.primary }, { fontSize: theme.typography.fontSizes.sm }]}>
              This Year
            </Text>
          </TouchableOpacity>
        </View>

        {/* History List */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {historyData.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                commonStyles.socialButton,
                { 
                  width: '100%',
                  paddingVertical: theme.spacing.lg,
                  alignItems: 'flex-start',
                  marginBottom: theme.spacing.sm,
                }
              ]}>
              
              {/* Location and Status */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginBottom: theme.spacing.xs,
              }}>
                <Text style={{
                  fontSize: theme.typography.fontSizes.base,
                  fontWeight: theme.typography.fontWeights.semibold as any,
                  color: theme.colors.text.primary,
                }}>
                  {item.location}
                </Text>
                <View style={{
                  backgroundColor: theme.colors.success,
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs / 2,
                  borderRadius: theme.borderRadius.sm,
                }}>
                  <Text style={{
                    fontSize: theme.typography.fontSizes.xs,
                    color: theme.colors.surface,
                    fontWeight: theme.typography.fontWeights.medium as any,
                  }}>
                    {item.status}
                  </Text>
                </View>
              </View>

              {/* Date and Duration */}
              <Text style={{
                fontSize: theme.typography.fontSizes.sm,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.xs,
              }}>
                {item.date}
              </Text>

              {/* Duration and Amount */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}>
                <Text style={{
                  fontSize: theme.typography.fontSizes.sm,
                  color: theme.colors.text.secondary,
                }}>
                  Duration: {item.duration}
                </Text>
                <Text style={{
                  fontSize: theme.typography.fontSizes.lg,
                  color: theme.colors.primary,
                  fontWeight: theme.typography.fontWeights.semibold as any,
                }}>
                  {item.amount}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary */}
        <View style={[
          commonStyles.socialButton,
          { 
            width: '100%',
            paddingVertical: theme.spacing.lg,
            alignItems: 'center',
            marginTop: theme.spacing.base,
            backgroundColor: theme.colors.primary + '10',
            borderColor: theme.colors.primary,
          }
        ]}>
          <Text style={{
            fontSize: theme.typography.fontSizes.base,
            fontWeight: theme.typography.fontWeights.semibold as any,
            color: theme.colors.primary,
            marginBottom: theme.spacing.xs,
          }}>
            Total Spent This Month
          </Text>
          <Text style={{
            fontSize: theme.typography.fontSizes['2xl'],
            color: theme.colors.primary,
            fontWeight: theme.typography.fontWeights.bold as any,
          }}>
            ₹850
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
