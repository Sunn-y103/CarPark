import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  role?: 'customer' | 'owner';
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  isActive: boolean;
}

export type ActivityType =
  | 'login'
  | 'logout'
  | 'register'
  | 'profile_update'
  | 'parking_search'
  | 'parking_book'
  | 'parking_cancel'
  | 'payment_success'
  | 'payment_failed'
  | 'wallet_topup'
  | 'wallet_debit'
  | 'map_view'
  | 'history_view'
  | 'profile_view';

export interface UserActivity {
  id?: string;
  userId: string;
  type: ActivityType;
  description: string;
  metadata?: {
    [key: string]: any;
  };
  timestamp: FirebaseFirestoreTypes.Timestamp;
  deviceInfo?: {
    platform?: string;
    version?: string;
    model?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface ParkingHistory {
  id?: string;
  userId: string;
  parkingSpotId: string;
  parkingSpotName: string;
  address: string;
  startTime: FirebaseFirestoreTypes.Timestamp;
  endTime?: FirebaseFirestoreTypes.Timestamp;
  duration?: number;
  cost: number;
  status: 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  metadata?: {
    [key: string]: any;
  };
}

export interface WalletTransaction {
  id?: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  relatedParkingId?: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export interface UserAnalytics {
  id?: string;
  userId: string;
  totalParkingSessions: number;
  totalAmountSpent: number;
  averageSessionDuration: number;
  favoriteLocations: string[];
  lastLoginDate: FirebaseFirestoreTypes.Timestamp;
  accountCreatedDate: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

export interface ParkingLocation {
  id: string;
  title: string;
  ownerId: string;
  latitude: number;
  longitude: number;
  hourlyRate: number;
  totalSpots: number;
  availableSpots: number;
  images: string[];
  createdAt: FirebaseFirestoreTypes.FieldValue | FirebaseFirestoreTypes.Timestamp;
}

export interface Slot {
  id: string;
  locationId: string;
  slotNumber: number;
  isAvailable: boolean;
  currentBookingId: string | null;
  createdAt: FirebaseFirestoreTypes.FieldValue | FirebaseFirestoreTypes.Timestamp;
}

export interface NewBooking {
  id: string;
  userId: string;
  locationId: string;
  slotId: string;
  slotNumber: number;
  qrId: string;
  status: 'booked' | 'checked_in' | 'completed' | 'cancelled';
  hourlyRate: number;
  totalAmount: number;
  selectedTimeSlots: string[];
  selectedDate: string;
  createdAt: FirebaseFirestoreTypes.FieldValue | FirebaseFirestoreTypes.Timestamp;
}

export const COLLECTIONS = {
  USERS: 'users',
  USER_ACTIVITIES: 'userActivities',
  PARKING_HISTORY: 'parkingHistory',
  WALLET_TRANSACTIONS: 'walletTransactions',
  USER_ANALYTICS: 'userAnalytics',
  PARKING_LOCATIONS: 'parkingLocations',
  SLOTS: 'slots',
  BOOKINGS: 'bookings',
} as const;
export interface CreateActivityData {
  userId: string;
  type: ActivityType;
  description: string;
  metadata?: { [key: string]: any };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}
