import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Booking {
    id: string;
    location: string;
    date: string;
    duration: string;
    amount: string;
    status: 'Active' | 'Completed' | 'Cancelled';
    spotNumber: number;
}

interface BookingContextType {
    bookings: Booking[];
    addBooking: (booking: Omit<Booking, 'id'>) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);

    const addBooking = (newBooking: Omit<Booking, 'id'>) => {
        const bookingWithId = {
            ...newBooking,
            id: Date.now().toString(),
        };
        setBookings((prevBookings) => [bookingWithId, ...prevBookings]);
    };

    return (
        <BookingContext.Provider value={{ bookings, addBooking }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = (): BookingContextType => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};
