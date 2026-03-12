import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView,
    Image,
} from 'react-native';
import { theme } from '../../styles/theme';

interface OwnerScannerScreenProps {
    onGoBack: () => void;
}

/**
 * OwnerScannerScreen - Informational screen replacing the in-app QR scanner.
 *
 * Scanning is now handled 100% by the Python gate script.
 * This screen informs the owner that scanning is handled externally.
 */
export const OwnerScannerScreen: React.FC<OwnerScannerScreenProps> = ({ onGoBack }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>QR Scanner</Text>
                <TouchableOpacity onPress={onGoBack} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Scanner Icon */}
                <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>📡</Text>
                </View>

                <Text style={styles.title}>Python Gate Scanner Active</Text>

                <Text style={styles.description}>
                    QR code scanning is now handled automatically by the Python gate scanner system.
                    No in-app scanning is required.
                </Text>

                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>✅</Text>
                        <Text style={styles.infoText}>
                            Check-in and check-out are processed at the gate
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>🔒</Text>
                        <Text style={styles.infoText}>
                            Booking status updates automatically in Firestore
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>📱</Text>
                        <Text style={styles.infoText}>
                            Customers show their QR code to the gate scanner
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onGoBack}
                >
                    <Text style={styles.backButtonText}>Back to Dashboard</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: {
        color: theme.colors.text.primary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconText: {
        fontSize: 48,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    infoCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 32,
        elevation: 2,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    infoText: {
        fontSize: 14,
        color: theme.colors.text.primary,
        flex: 1,
        lineHeight: 20,
    },
    backButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
