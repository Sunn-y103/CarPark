import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';

export const WalletScreen: React.FC = () => {
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const transactions = [
    {
      id: 1,
      type: 'payment',
      description: 'Parking at Mall Plaza',
      amount: '- ₹120',
      date: 'Today, 5:45 PM',
      status: 'completed',
    },
    {
      id: 2,
      type: 'topup',
      description: 'Wallet Top-up',
      amount: '+ ₹500',
      date: 'Yesterday, 9:30 AM',
      status: 'completed',
    },
    {
      id: 3,
      type: 'payment',
      description: 'Parking at City Center',
      amount: '- ₹80',
      date: 'Yesterday, 12:30 PM',
      status: 'completed',
    },
    {
      id: 4,
      type: 'refund',
      description: 'Refund - Cancelled Booking',
      amount: '+ ₹60',
      date: '2 days ago, 3:15 PM',
      status: 'completed',
    },
  ];

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: theme.spacing.lg }}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <Text style={[commonStyles.title, { textAlign: 'left' }]}>
            My Wallet
          </Text>
        </View>

        {/* Wallet Balance Card */}
        <View style={[
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.xl,
            shadowColor: theme.colors.shadow,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }
        ]}>
          <Text style={{
            fontSize: theme.typography.fontSizes.base,
            color: theme.colors.surface,
            marginBottom: theme.spacing.sm,
          }}>
            Available Balance
          </Text>
          <Text style={{
            fontSize: theme.typography.fontSizes['4xl'],
            fontWeight: theme.typography.fontWeights.bold as any,
            color: theme.colors.surface,
            marginBottom: theme.spacing.base,
          }}>
            ₹1,250
          </Text>
          <Text style={{
            fontSize: theme.typography.fontSizes.sm,
            color: theme.colors.surface + 'CC',
          }}>
            Last updated: Today, 6:30 PM
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.xl,
        }}>
          <TouchableOpacity
            onPressIn={() => setPressedButton('addMoney')}
            onPressOut={() => setPressedButton(null)}
            style={[
              commonStyles.button,
              { flex: 1, marginRight: theme.spacing.sm },
              pressedButton === 'addMoney' && { opacity: 0.7 }
            ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>💰</Text>
              <Text style={[
                commonStyles.buttonText,
                pressedButton === 'addMoney' && { color: theme.colors.text.secondary }
              ]}>
                Add Money
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPressIn={() => setPressedButton('viewStatement')}
            onPressOut={() => setPressedButton(null)}
            style={[
              commonStyles.socialButton,
              { flex: 1, marginLeft: theme.spacing.sm },
              pressedButton === 'viewStatement' && { opacity: 0.7 }
            ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>📄</Text>
              <Text style={[
                { color: theme.colors.text.primary, fontWeight: '600' },
                pressedButton === 'viewStatement' && { color: theme.colors.text.secondary }
              ]}>
                View Statement
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Payment Methods */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <Text style={{
            fontSize: theme.typography.fontSizes.lg,
            fontWeight: theme.typography.fontWeights.semibold as any,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.base,
          }}>Payment Methods</Text>
          
          <TouchableOpacity style={[
            commonStyles.socialButton,
            { 
              width: '100%',
              paddingVertical: theme.spacing.lg,
              alignItems: 'flex-start',
              marginBottom: theme.spacing.sm,
            }
          ]}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
            }}>
              <Text style={{ fontSize: 20, marginRight: theme.spacing.base }}>💳</Text>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: theme.typography.fontSizes.base,
                  fontWeight: theme.typography.fontWeights.medium as any,
                  color: theme.colors.text.primary,
                }}>
                  **** **** **** 4567
                </Text>
                <Text style={{
                  fontSize: theme.typography.fontSizes.sm,
                  color: theme.colors.text.secondary,
                }}>
                  Expires 12/26
                </Text>
              </View>
              <Text style={{
                fontSize: theme.typography.fontSizes.sm,
                color: theme.colors.primary,
                fontWeight: theme.typography.fontWeights.medium as any,
              }}>
                Primary
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[
            commonStyles.socialButton,
            { 
              width: '100%',
              paddingVertical: theme.spacing.lg,
              alignItems: 'center',
              borderStyle: 'dashed',
            }
          ]}>
            <Text style={{
              color: theme.colors.primary,
              fontWeight: theme.typography.fontWeights.medium as any,
            }}>
              + Add New Payment Method
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View>
          <Text style={{
            fontSize: theme.typography.fontSizes.lg,
            fontWeight: theme.typography.fontWeights.semibold as any,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.base,
          }}>Recent Transactions</Text>
          
          {transactions.map((transaction) => (
            <View
              key={transaction.id}
              style={[
                commonStyles.socialButton,
                { 
                  width: '100%',
                  paddingVertical: theme.spacing.lg,
                  alignItems: 'flex-start',
                  marginBottom: theme.spacing.sm,
                }
              ]}>
              
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                marginBottom: theme.spacing.xs,
              }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: transaction.type === 'payment' 
                    ? theme.colors.error + '20' 
                    : theme.colors.success + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: theme.spacing.base,
                }}>
                  <Text style={{ fontSize: 18 }}>
                    {transaction.type === 'payment' 
                      ? '🅿️'
                      : transaction.type === 'topup'
                      ? '💰'
                      : '🔄'
                    }
                  </Text>
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: theme.typography.fontSizes.base,
                    fontWeight: theme.typography.fontWeights.medium as any,
                    color: theme.colors.text.primary,
                  }}>
                    {transaction.description}
                  </Text>
                  <Text style={{
                    fontSize: theme.typography.fontSizes.sm,
                    color: theme.colors.text.secondary,
                  }}>
                    {transaction.date}
                  </Text>
                </View>
                
                <Text style={{
                  fontSize: theme.typography.fontSizes.base,
                  fontWeight: theme.typography.fontWeights.semibold as any,
                  color: transaction.amount.startsWith('-') 
                    ? theme.colors.error 
                    : theme.colors.success,
                }}>
                  {transaction.amount}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
