import firestore from '@react-native-firebase/firestore';
import { NewBooking, COLLECTIONS } from '../../types/firebase';

/**
 * Service for managing bookings with race-condition-safe Firestore transactions.
 */

/**
 * Generate a 32-character hex string for QR code identification.
 * Uses Math.random as React Native doesn't have crypto.getRandomValues in all environments.
 */
export function generateQrId(): string {
    let result = '';
    const hexChars = '0123456789abcdef';
    for (let i = 0; i < 32; i++) {
        result += hexChars.charAt(Math.floor(Math.random() * 16));
    }
    return result;
}

interface BookingResult {
    bookingId: string;
    qrId: string;
    slotNumber: number;
}

/**
 * Create a booking using a Firestore transaction to prevent race conditions.
 *
 * Flow:
 * 1. Query first available slot for the location (outside tx for query, ref locked inside)
 * 2. Assert slot is still available inside tx (race condition guard)
 * 3. Generate qrId
 * 4. Create booking document
 * 5. Update slot: isAvailable = false, currentBookingId = bookingId
 * 6. Decrement parkingLocations.availableSpots
 *
 * Returns { bookingId, qrId, slotNumber } on success.
 * Throws an error with message 'No spots available' if no slots are free.
 */
export async function createBookingWithTransaction(
    userId: string,
    locationId: string,
    hourlyRate: number,
    totalAmount: number,
    selectedTimeSlots: string[],
    selectedDate: string,
): Promise<BookingResult> {
    const db = firestore();

    // Step 1: Find an available slot (query outside tx)
    const availableSlotSnapshot = await db
        .collection(COLLECTIONS.SLOTS)
        .where('locationId', '==', locationId)
        .where('isAvailable', '==', true)
        .limit(1)
        .get();

    if (availableSlotSnapshot.empty) {
        throw new Error('No spots available');
    }

    const slotDoc = availableSlotSnapshot.docs[0];
    const slotRef = db.collection(COLLECTIONS.SLOTS).doc(slotDoc.id);
    const locationRef = db.collection(COLLECTIONS.PARKING_LOCATIONS).doc(locationId);
    const bookingRef = db.collection(COLLECTIONS.BOOKINGS).doc(); // Auto-generate ID

    const qrId = generateQrId();

    // Step 2-6: Firestore transaction
    await db.runTransaction(async (transaction) => {
        // Re-read slot inside transaction to guard against race conditions
        const slotSnap = await transaction.get(slotRef);
        if (!slotSnap.exists() || slotSnap.data()?.isAvailable !== true) {
            throw new Error('No spots available');
        }

        // Re-read location to get current availableSpots
        const locationSnap = await transaction.get(locationRef);
        if (!locationSnap.exists()) {
            throw new Error('Parking location not found');
        }

        const currentAvailable = locationSnap.data()?.availableSpots ?? 0;
        if (currentAvailable <= 0) {
            throw new Error('No spots available');
        }

        const slotData = slotSnap.data();

        // Create booking document
        transaction.set(bookingRef, {
            userId,
            locationId,
            slotId: slotDoc.id,
            slotNumber: slotData?.slotNumber ?? 0,
            qrId,
            status: 'booked',
            hourlyRate,
            totalAmount,
            selectedTimeSlots,
            selectedDate,
            createdAt: firestore.FieldValue.serverTimestamp(),
        });

        // Update slot
        transaction.update(slotRef, {
            isAvailable: false,
            currentBookingId: bookingRef.id,
        });

        // Decrement available spots on the location
        transaction.update(locationRef, {
            availableSpots: currentAvailable - 1,
        });
    });

    const slotData = slotDoc.data();
    return {
        bookingId: bookingRef.id,
        qrId,
        slotNumber: slotData?.slotNumber ?? 0,
    };
}

/**
 * Real-time listener for a booking's status (e.g. for QR status display).
 * Returns an unsubscribe function.
 */
export function listenToBookingStatus(
    bookingId: string,
    callback: (booking: NewBooking | null) => void,
): () => void {
    return firestore()
        .collection(COLLECTIONS.BOOKINGS)
        .doc(bookingId)
        .onSnapshot(
            doc => {
                if (doc.exists()) {
                    callback({ id: doc.id, ...doc.data() } as NewBooking);
                } else {
                    callback(null);
                }
            },
            error => {
                console.error('Error listening to booking status:', error);
            },
        );
}

/**
 * Fetch all bookings for a given user.
 */
export async function getUserBookings(userId: string): Promise<NewBooking[]> {
    try {
        const snapshot = await firestore()
            .collection(COLLECTIONS.BOOKINGS)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as NewBooking[];
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        throw error;
    }
}
