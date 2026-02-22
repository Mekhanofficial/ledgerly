import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { setUser } from '../store/slices/authSlice';
import { getAvatarUrl, resolveAuthUser } from '../utils/userDisplay';
import { isAccessDeniedError } from '../utils/accessControl';

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
  currency: 'USD',
  plan: 'starter',
  subscriptionStatus: 'active',
  trialEndsAt: null,
  subscriptionEndsAt: null,
  profileImage: '',
  avatarUrl: ''
};

const mapBusinessToAccount = (business = {}, user = {}) => {
  const resolvedProfile = user.profileImage || business.owner?.profileImage || '';
  const avatarUrl = getAvatarUrl(user) || getAvatarUrl(business.owner);

  return {
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
    currency: business.currency || 'USD',
    plan: business.subscription?.plan || 'starter',
    subscriptionStatus: business.subscription?.status || 'active',
    trialEndsAt: business.subscription?.trialEndsAt || null,
    subscriptionEndsAt: business.subscription?.currentPeriodEnd || null,
    profileImage: resolvedProfile,
    avatarUrl
  };
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
  const authUser = useSelector((state) => state.auth.user);
  const resolvedUser = resolveAuthUser(authUser);
  const dispatch = useDispatch();
  const [accountInfo, setAccountInfo] = useState(EMPTY_ACCOUNT_INFO);
  const [loading, setLoading] = useState(false);
  const normalizedRole = String(resolvedUser?.role || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  const canUpdateBusiness = normalizedRole === 'super_admin';
  const storageKey = authUser?.id || authUser?._id
    ? `${STORAGE_KEY}_${authUser.id || authUser._id}`
    : null;

  // Hydrate from storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!storageKey) {
      setAccountInfo(EMPTY_ACCOUNT_INFO);
      return;
    }
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAccountInfo(parsed);
      } else {
        setAccountInfo(EMPTY_ACCOUNT_INFO);
      }
    } catch (error) {
      console.error('Failed to load account settings:', error);
    }
  }, [storageKey]);

  // Persist updates
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(accountInfo));
    } catch (error) {
      console.error('Failed to save account settings:', error);
    }
  }, [accountInfo, storageKey]);

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

  const updateAccountInfo = useCallback(async (updates, profileImageFile) => {
    if (!resolvedUser) {
      throw new Error('Not authenticated');
    }

    const businessPayload = {};
    if (updates.companyName !== undefined) {
      businessPayload.name = updates.companyName;
    }
    if (updates.email !== undefined) {
      businessPayload.email = updates.email;
    }
    if (updates.phone !== undefined) {
      businessPayload.phone = updates.phone;
    }
    if (updates.website !== undefined) {
      businessPayload.website = updates.website;
    }
    if (updates.timezone !== undefined) {
      businessPayload.timezone = updates.timezone;
    }
    if (updates.currency !== undefined) {
      businessPayload.currency = updates.currency;
    }

    const addressFields = {
      street: updates.address ?? accountInfo.address,
      city: updates.city ?? accountInfo.city,
      state: updates.state ?? accountInfo.state,
      country: updates.country ?? accountInfo.country,
      postalCode: updates.zipCode ?? accountInfo.zipCode
    };

    if (Object.values(addressFields).some(value => value !== undefined && value !== null && value !== '')) {
      businessPayload.address = addressFields;
    }

    const userPayload = {};
    if (updates.contactName !== undefined) {
      userPayload.name = updates.contactName;
    }
    if (updates.email !== undefined) {
      userPayload.email = updates.email;
    }
    if (updates.phone !== undefined) {
      userPayload.phone = updates.phone;
    }

    let updatedUser = null;
    if (profileImageFile || Object.keys(userPayload).length) {
      try {
        if (profileImageFile) {
          const formData = new FormData();
          if (userPayload.name) formData.append('name', userPayload.name);
          if (userPayload.email) formData.append('email', userPayload.email);
          if (userPayload.phone) formData.append('phone', userPayload.phone);
          formData.append('profileImage', profileImageFile);

          const userResponse = await api.put('/auth/updatedetails', formData);
          updatedUser = userResponse.data.data;
        } else {
          const userResponse = await api.put('/auth/updatedetails', userPayload);
          updatedUser = userResponse.data.data;
        }

        dispatch(setUser(updatedUser));
      } catch (error) {
        if (!isAccessDeniedError(error)) {
          throw error;
        }
      }
    }

    let businessData;
    if (Object.keys(businessPayload).length > 0 && canUpdateBusiness) {
      try {
        const response = await api.put('/business', businessPayload);
        businessData = response.data.data;
      } catch (error) {
        if (!isAccessDeniedError(error)) {
          throw error;
        }
      }
    }

    if (!businessData) {
      try {
        const response = await api.get('/business');
        businessData = response.data.data;
      } catch (error) {
        if (!isAccessDeniedError(error)) {
          throw error;
        }
      }
    }

    if (businessData) {
      const normalized = mapBusinessToAccount(businessData, updatedUser || resolvedUser);
      setAccountInfo(normalized);
      return normalized;
    }

    const fallback = {
      ...accountInfo,
      contactName: updates.contactName ?? accountInfo.contactName,
      email: updates.email ?? accountInfo.email,
      phone: updates.phone ?? accountInfo.phone
    };
    if (updatedUser?.profileImage) {
      fallback.profileImage = updatedUser.profileImage;
    }
    if (updatedUser?.avatarUrl) {
      fallback.avatarUrl = updatedUser.avatarUrl;
    }
    setAccountInfo(fallback);
    return fallback;
  }, [resolvedUser, accountInfo, dispatch, canUpdateBusiness]);

  return (
    <AccountContext.Provider value={{ accountInfo, updateAccountInfo, loading }}>
      {children}
    </AccountContext.Provider>
  );
};
