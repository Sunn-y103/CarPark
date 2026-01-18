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

import { useWallet } from '../../context/WalletContext';

export const WalletScreen: React.FC = () => {
  const { balance, transactions, addFunds } = useWallet();
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: theme.spacing.lg,
          paddingTop: theme.spacing.xl + theme.spacing.sm,
          paddingBottom: theme.spacing.xl + theme.spacing.base
        }}
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
            {/* Format as currency */}
            ₹{balance.toLocaleString()}
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
            onPress={() => addFunds(500)} // Simulating adding ₹500
            onPressIn={() => setPressedButton('addMoney')}
            onPressOut={() => setPressedButton(null)}
            style={[
              {
                backgroundColor: pressedButton === 'addMoney' ? theme.colors.primary : theme.colors.surface,
                borderRadius: theme.borderRadius.lg,
                paddingVertical: theme.spacing.lg,
                paddingHorizontal: theme.spacing.lg,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadow,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              },
              { flex: 1, marginRight: theme.spacing.sm },
            ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>💰</Text>
              <Text style={{
                fontSize: theme.typography.fontSizes.base,
                fontWeight: theme.typography.fontWeights.semibold as any,
                color: pressedButton === 'addMoney' ? theme.colors.surface : theme.colors.text.primary
              }}>
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
                  color: transaction.type === 'payment'
                    ? theme.colors.error
                    : theme.colors.success,
                }}>
                  {transaction.type === 'payment' ? '-' : '+'} ₹{transaction.amount}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
