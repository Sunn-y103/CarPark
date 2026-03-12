import firestore from '@react-native-firebase/firestore';
import { ParkingLocation, COLLECTIONS } from '../../types/firebase';
import { initializeSlotsForLocation } from './slotsService';

/**
 * Service for managing parking locations in Firestore.
 */

// The 4 original dummy locations to seed into Firestore
const SEED_LOCATIONS = [
    {
        title: 'Pen Samishra Nagar Parking',
        latitude: 18.7378,
        longitude: 73.0969,
        hourlyRate: 40,
        totalSpots: 5,
        availableSpots: 5,
        ownerId: 'system_admin',
        images: [],
    },
    {
        title: 'Rasayani Mohpada Parking',
        latitude: 18.9766,
        longitude: 73.1295,
        hourlyRate: 50,
        totalSpots: 6,
        availableSpots: 6,
        ownerId: 'system_admin',
        images: [],
    },
    {
        title: 'Rasayani HOC Colony Parking',
        latitude: 18.9832,
        longitude: 73.1257,
        hourlyRate: 45,
        totalSpots: 4,
        availableSpots: 4,
        ownerId: 'system_admin',
        images: [],
    },
    {
        title: 'Panvel ST Stand Parking',
        latitude: 18.9894,
        longitude: 73.1175,
        hourlyRate: 60,
        totalSpots: 8,
        availableSpots: 8,
        ownerId: 'system_admin',
        images: [],
    },
];

/**
 * Fetch all parking locations from Firestore.
 */
export async function getAllParkingLocations(): Promise<ParkingLocation[]> {
    try {
        const snapshot = await firestore()
            .collection(COLLECTIONS.PARKING_LOCATIONS)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as ParkingLocation[];
    } catch (error) {
        console.error('Error fetching parking locations:', error);
        throw error;
    }
}

/**
 * Real-time listener for a single parking location (e.g. to track availableSpots).
 * Returns an unsubscribe function.
 */
export function listenToParkingLocation(
    locationId: string,
    callback: (location: ParkingLocation | null) => void,
): () => void {
    return firestore()
        .collection(COLLECTIONS.PARKING_LOCATIONS)
        .doc(locationId)
        .onSnapshot(
            doc => {
                if (doc.exists()) {
                    callback({ id: doc.id, ...doc.data() } as ParkingLocation);
                } else {
                    callback(null);
                }
            },
            error => {
                console.error('Error listening to parking location:', error);
            },
        );
}

/**
 * Idempotent seed: creates the 4 original dummy locations in Firestore
 * only if the collection is empty.
 * Also initializes slots for each location via the slotsService.
 */
export async function initializeParkingLocations(): Promise<void> {
    try {
        const existing = await firestore()
            .collection(COLLECTIONS.PARKING_LOCATIONS)
            .limit(1)
            .get();

        if (!existing.empty) {
            console.log('Parking locations already initialized, skipping seed.');
            return;
        }

        console.log('Seeding parking locations...');
        const batch = firestore().batch();

        const locationRefs: { ref: any; totalSpots: number }[] = [];

        for (const loc of SEED_LOCATIONS) {
            const ref = firestore().collection(COLLECTIONS.PARKING_LOCATIONS).doc();
            batch.set(ref, {
                ...loc,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });
            locationRefs.push({ ref, totalSpots: loc.totalSpots });
        }

        await batch.commit();
        console.log(`Seeded ${SEED_LOCATIONS.length} parking locations.`);

        // Initialize slots for each location
        for (const { ref, totalSpots } of locationRefs) {
            await initializeSlotsForLocation(ref.id, totalSpots);
        }

        console.log('Parking locations and slots initialized successfully.');
    } catch (error) {
        console.error('Error initializing parking locations:', error);
        throw error;
    }
}
