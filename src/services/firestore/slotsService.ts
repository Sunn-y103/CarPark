import firestore from '@react-native-firebase/firestore';
import { Slot, COLLECTIONS } from '../../types/firebase';

/**
 * Service for managing parking slots in Firestore.
 */

/**
 * Initialize N slot documents for a given parking location.
 * Slot numbers start at 101 and increment.
 * Idempotent — skips if slots already exist for this location.
 */
export async function initializeSlotsForLocation(
    locationId: string,
    totalSpots: number,
): Promise<void> {
    try {
        // Check if slots already exist for this location
        const existing = await firestore()
            .collection(COLLECTIONS.SLOTS)
            .where('locationId', '==', locationId)
            .limit(1)
            .get();

        if (!existing.empty) {
            console.log(`Slots already exist for location ${locationId}, skipping.`);
            return;
        }

        console.log(`Creating ${totalSpots} slots for location ${locationId}...`);
        const batch = firestore().batch();

        for (let i = 0; i < totalSpots; i++) {
            const slotNumber = 101 + i; // Start from 101
            const ref = firestore().collection(COLLECTIONS.SLOTS).doc();
            batch.set(ref, {
                locationId,
                slotNumber,
                isAvailable: true,
                currentBookingId: null,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });
        }

        await batch.commit();
        console.log(`Created ${totalSpots} slots for location ${locationId}.`);
    } catch (error) {
        console.error('Error initializing slots:', error);
        throw error;
    }
}

/**
 * Fetch all slots for a given parking location.
 */
export async function getSlotsForLocation(locationId: string): Promise<Slot[]> {
    try {
        const snapshot = await firestore()
            .collection(COLLECTIONS.SLOTS)
            .where('locationId', '==', locationId)
            .orderBy('slotNumber', 'asc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Slot[];
    } catch (error) {
        console.error('Error fetching slots:', error);
        throw error;
    }
}
