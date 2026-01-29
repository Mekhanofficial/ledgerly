import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ledgerly_account_info';

const DEFAULT_ACCOUNT_INFO = {
  companyName: 'Ledgerly Inc.',
  contactName: 'John Smith',
  email: 'john@ledgerly.com',
  phone: '+1 (555) 123-4567',
  address: '123 Business Street',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94107',
  country: 'United States',
  website: 'www.ledgerly.com',
  timezone: 'America/Los_Angeles',
  currency: 'USD'
};

const AccountContext = createContext();

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within AccountProvider');
  }
  return context;
};

export const AccountProvider = ({ children }) => {
  const [accountInfo, setAccountInfo] = useState(DEFAULT_ACCOUNT_INFO);

  // Hydrate from storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAccountInfo(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Failed to load account settings:', error);
    }
  }, []);

  // Persist updates
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accountInfo));
    } catch (error) {
      console.error('Failed to save account settings:', error);
    }
  }, [accountInfo]);

  const updateAccountInfo = useCallback((updates) => {
    setAccountInfo(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <AccountContext.Provider value={{ accountInfo, updateAccountInfo }}>
      {children}
    </AccountContext.Provider>
  );
};
