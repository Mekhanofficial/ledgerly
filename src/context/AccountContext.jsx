import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';

const STORAGE_KEY = 'ledgerly_account_info';
const EMPTY_ACCOUNT_INFO = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  website: '',
  timezone: '',
  currency: 'USD'
};

const mapBusinessToAccount = (business = {}, user = {}) => ({
  companyName: business.name || '',
  contactName: user.name || business.owner?.name || '',
  email: business.email || user.email || '',
  phone: business.phone || '',
  address: business.address?.street || '',
  city: business.address?.city || '',
  state: business.address?.state || '',
  zipCode: business.address?.postalCode || '',
  country: business.address?.country || '',
  website: business.website || '',
  timezone: business.timezone || '',
  currency: business.currency || 'USD'
});

const AccountContext = createContext();

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within AccountProvider');
  }
  return context;
};

export const AccountProvider = ({ children }) => {
  const authUser = useSelector((state) => state.auth.user);
  const [accountInfo, setAccountInfo] = useState(EMPTY_ACCOUNT_INFO);
  const [loading, setLoading] = useState(false);

  // Hydrate from storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAccountInfo(parsed);
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

  useEffect(() => {
    let isActive = true;

    const syncBusiness = async () => {
      if (!authUser) {
        setAccountInfo(EMPTY_ACCOUNT_INFO);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get('/business');
        if (!isActive) return;
        const normalized = mapBusinessToAccount(response.data.data, authUser);
        setAccountInfo(normalized);
      } catch (error) {
        console.error('Failed to load business profile:', error);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    syncBusiness();

    return () => {
      isActive = false;
    };
  }, [authUser]);

  const updateAccountInfo = useCallback(async (updates) => {
    if (!authUser) {
      throw new Error('Not authenticated');
    }

    const payload = {};
    if (updates.companyName !== undefined) {
      payload.name = updates.companyName;
    }
    if (updates.email !== undefined) {
      payload.email = updates.email;
    }
    if (updates.phone !== undefined) {
      payload.phone = updates.phone;
    }
    if (updates.website !== undefined) {
      payload.website = updates.website;
    }
    if (updates.timezone !== undefined) {
      payload.timezone = updates.timezone;
    }
    if (updates.currency !== undefined) {
      payload.currency = updates.currency;
    }

    const addressFields = {
      street: updates.address ?? accountInfo.address,
      city: updates.city ?? accountInfo.city,
      state: updates.state ?? accountInfo.state,
      country: updates.country ?? accountInfo.country,
      postalCode: updates.zipCode ?? accountInfo.zipCode
    };

    if (Object.values(addressFields).some(value => value !== undefined && value !== null && value !== '')) {
      payload.address = addressFields;
    }

    const response = await api.put('/business', payload);
    const normalized = mapBusinessToAccount(response.data.data, authUser);
    setAccountInfo(normalized);
    return normalized;
  }, [authUser, accountInfo]);

  return (
    <AccountContext.Provider value={{ accountInfo, updateAccountInfo, loading }}>
      {children}
    </AccountContext.Provider>
  );
};
