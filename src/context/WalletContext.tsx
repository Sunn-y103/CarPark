import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Transaction {
    id: string;
    type: 'payment' | 'topup' | 'refund';
    description: string;
    amount: number;
    date: string;
}

interface WalletContextType {
    balance: number;
    transactions: Transaction[];
    addFunds: (amount: number) => void;
    deductFunds: (amount: number, description: string) => boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [balance, setBalance] = useState<number>(1250); // Initial balance for demo
    const [transactions, setTransactions] = useState<Transaction[]>([
        {
            id: '1',
            type: 'payment',
            description: 'Parking at Mall Plaza',
            amount: 120,
            date: 'Today, 5:45 PM',
        },
        {
            id: '2',
            type: 'topup',
            description: 'Wallet Top-up',
            amount: 500,
            date: 'Yesterday, 9:30 AM',
        },
    ]);

    const addFunds = (amount: number) => {
        setBalance((prev) => prev + amount);
        const newTransaction: Transaction = {
            id: Date.now().toString(),
            type: 'topup',
            description: 'Wallet Top-up',
            amount: amount,
            date: new Date().toLocaleString(),
        };
        setTransactions((prev) => [newTransaction, ...prev]);
    };

    const deductFunds = (amount: number, description: string): boolean => {
        if (balance >= amount) {
            setBalance((prev) => prev - amount);
            const newTransaction: Transaction = {
                id: Date.now().toString(),
                type: 'payment',
                description: description,
                amount: amount,
                date: new Date().toLocaleString(),
            };
            setTransactions((prev) => [newTransaction, ...prev]);
            return true;
        }
        return false;
    };

    return (
        <WalletContext.Provider value={{ balance, transactions, addFunds, deductFunds }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = (): WalletContextType => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
