export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  color?: string;
  year?: number;
  type: 'car' | 'motorcycle' | 'suv' | 'truck';
}

export interface ParkingSlot {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
  pricePerHour: number;
  type: 'regular' | 'ev_charging' | 'disabled';
  amenities?: string[];
}

export interface Booking {
  id: string;
  userId: string;
  slotId: string;
  vehicleId: string;
  startTime: Date;
  endTime: Date;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  qrCode?: string;
  qrCodeValid?: boolean;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
}

export interface ChargingStation {
  id: string;
  name: string;
  location: string;
  availableSlots: number;
  totalSlots: number;
  chargingSpeed: 'slow' | 'fast' | 'rapid';
  pricePerHour: number;
  distance: number;
}

export type NavigationMode = 'find' | 'book';

// Navigation parameter types
export type RootStackParamList = {
  Home: undefined;
  Maps: { mode?: NavigationMode };
  BookingConfirmation: { booking: Booking };
  EditProfile: undefined;
  Profile: undefined;
  Wallet: undefined;
  History: undefined;
};
