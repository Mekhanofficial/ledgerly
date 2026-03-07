import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { setUser } from '../store/slices/authSlice';
import { getAvatarUrl, resolveAuthUser } from '../utils/userDisplay';
import { isAccessDeniedError } from '../utils/accessControl';
import { resolveBrandingProfile } from '../utils/brandingPlan';

const STORAGE_KEY = 'ledgerly_account_info';
const normalizeCurrencyCode = (value) => {
  if (typeof value !== 'string') return '';
  const normalized = value.trim().toUpperCase();
  return normalized.length >= 3 ? normalized : '';
};

const resolvePreferredCurrency = (...candidates) => {
  for (const candidate of candidates) {
    const normalized = normalizeCurrencyCode(candidate);
    if (normalized) return normalized;
  }
  return 'USD';
};

const buildEmptyAccountInfo = (preferredCurrency = 'USD') => ({
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
  currency: resolvePreferredCurrency(preferredCurrency),
  plan: 'starter',
  billingCycle: 'monthly',
  subscriptionStatus: 'active',
  trialEndsAt: null,
  subscriptionEndsAt: null,
  customDomain: '',
  customEmailSender: '',
  brandingSettings: {
    removeWatermark: false,
    logoUrl: '',
    brandColor: ''
  },
  whiteLabel: {
    enabled: false,
    customDomain: '',
    customEmailSender: '',
    hideLedgerlyBrandingEverywhere: false
  },
  isWhiteLabelClient: false,
  profileImage: '',
  avatarUrl: ''
});

const mapBusinessToAccount = (business = {}, user = {}) => {
  const resolvedProfile = user.profileImage || business.owner?.profileImage || '';
  const avatarUrl = getAvatarUrl(user) || getAvatarUrl(business.owner);

  const rawAccount = {
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
    currency: resolvePreferredCurrency(
      business.currency,
      user.currency,
      user.currencyCode
    ),
    plan: business.subscription?.plan || 'starter',
    billingCycle: business.subscription?.billingCycle || 'monthly',
    subscriptionStatus: business.subscription?.status || 'active',
    trialEndsAt: business.subscription?.trialEndsAt || null,
    subscriptionEndsAt: business.subscription?.currentPeriodEnd || null,
    customDomain: business.customDomain || business.whiteLabel?.customDomain || '',
    customEmailSender: business.customEmailSender || business.whiteLabel?.customEmailSender || '',
    brandingSettings: {
      removeWatermark: business.brandingSettings?.removeWatermark,
      logoUrl: business.brandingSettings?.logoUrl || business.logoUrl || '',
      brandColor: business.brandingSettings?.brandColor || business.brandColor || ''
    },
    whiteLabel: {
      enabled: business.whiteLabel?.enabled,
      customDomain: business.whiteLabel?.customDomain || business.customDomain || '',
      customEmailSender: business.whiteLabel?.customEmailSender || business.customEmailSender || '',
      hideLedgerlyBrandingEverywhere: business.whiteLabel?.hideLedgerlyBrandingEverywhere
    },
    isWhiteLabelClient: Boolean(business.isWhiteLabelClient),
    profileImage: resolvedProfile,
    avatarUrl
  };

  return resolveBrandingProfile(rawAccount);
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
  const resolvedUser = useMemo(() => resolveAuthUser(authUser), [authUser]);
  const activeUser = authUser || resolvedUser;
  const dispatch = useDispatch();
  const userId = resolvedUser?.id || resolvedUser?._id || authUser?.id || authUser?._id || null;
  const preferredCurrency = useMemo(
    () => resolvePreferredCurrency(
      resolvedUser?.currency,
      resolvedUser?.currencyCode
    ),
    [resolvedUser?.currency, resolvedUser?.currencyCode]
  );
  const defaultAccountInfo = useMemo(
    () => buildEmptyAccountInfo(preferredCurrency),
    [preferredCurrency]
  );
  const storageKey = userId ? `${STORAGE_KEY}_${userId}` : null;

  const [accountInfo, setAccountInfo] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultAccountInfo;
    }

    try {
      const stored = (storageKey && localStorage.getItem(storageKey))
        || localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return defaultAccountInfo;
      }

      const parsed = JSON.parse(stored);
      return resolveBrandingProfile({
        ...defaultAccountInfo,
        ...parsed,
        currency: resolvePreferredCurrency(parsed?.currency, preferredCurrency)
      });
    } catch {
      return defaultAccountInfo;
    }
  });
  const [loading, setLoading] = useState(false);
  const normalizedRole = String(activeUser?.role || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  const canUpdateBusiness = normalizedRole === 'super_admin';

  // Hydrate from storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const scopedStored = storageKey ? localStorage.getItem(storageKey) : null;
      const legacyStored = localStorage.getItem(STORAGE_KEY);
      const stored = scopedStored || legacyStored;

      if (stored) {
        const parsed = JSON.parse(stored);
        const normalized = resolveBrandingProfile({
          ...defaultAccountInfo,
          ...parsed,
          currency: resolvePreferredCurrency(parsed?.currency, preferredCurrency)
        });
        setAccountInfo(normalized);

        // Migrate legacy storage into scoped storage when possible.
        if (!scopedStored && storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(normalized));
        }
      } else {
        setAccountInfo(defaultAccountInfo);
      }
    } catch (error) {
      console.error('Failed to load account settings:', error);
      setAccountInfo(defaultAccountInfo);
    }
  }, [storageKey, defaultAccountInfo, preferredCurrency]);

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

  const refreshAccountInfo = useCallback(async ({ silent = false } = {}) => {
    if (!activeUser) {
      setAccountInfo(defaultAccountInfo);
      if (!silent) setLoading(false);
      return defaultAccountInfo;
    }

    if (!silent) {
      setLoading(true);
    }

    try {
      const response = await api.get('/business');
      const normalized = mapBusinessToAccount(response.data.data, activeUser);
      setAccountInfo(normalized);
      return normalized;
    } catch (error) {
      console.error('Failed to load business profile:', error);
      return null;
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [activeUser, defaultAccountInfo]);

  useEffect(() => {
    let isActive = true;

    const syncBusiness = async () => {
      if (!activeUser) {
        setAccountInfo(defaultAccountInfo);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get('/business');
        if (!isActive) return;
        const normalized = mapBusinessToAccount(response.data.data, activeUser);
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
  }, [activeUser, defaultAccountInfo]);

  const updateAccountInfo = useCallback(async (updates, profileImageFile) => {
    if (!activeUser) {
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
      const normalized = mapBusinessToAccount(businessData, updatedUser || activeUser);
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
  }, [activeUser, accountInfo, dispatch, canUpdateBusiness]);

  return (
    <AccountContext.Provider value={{ accountInfo, updateAccountInfo, refreshAccountInfo, loading }}>
      {children}
    </AccountContext.Provider>
  );
};
