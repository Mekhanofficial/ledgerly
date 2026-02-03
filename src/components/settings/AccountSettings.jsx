import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Building, MapPin, Save, Camera, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAccount } from '../../context/AccountContext';
import { useToast } from '../../context/ToastContext';

const AccountSettings = () => {
  const { isDarkMode } = useTheme();
  const { accountInfo, updateAccountInfo } = useAccount();
  const { addToast } = useToast();
  const EMPTY_FORM_STATE = {
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    currency: 'USD'
  };
  const [formData, setFormData] = useState({
    ...EMPTY_FORM_STATE,
    ...accountInfo
  });
  const [isSaving, setIsSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  useEffect(() => {
    setFormData({
      ...EMPTY_FORM_STATE,
      ...accountInfo
    });
  }, [accountInfo]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!profileImageFile) {
      setProfilePreviewUrl('');
    }
  }, [accountInfo.avatarUrl, profileImageFile]);

  const rawAvatarUrl = profilePreviewUrl || accountInfo.avatarUrl || '';
  const resolvedAvatarUrl = avatarLoadError ? '' : rawAvatarUrl;
  const hasAvatar = Boolean(resolvedAvatarUrl);
  const canRemovePhoto = Boolean(profileImageFile || accountInfo.avatarUrl);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [profilePreviewUrl, accountInfo.avatarUrl]);

  const handleRemovePhoto = () => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setProfileImageFile(null);
    setProfilePreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      handleRemovePhoto();
      return;
    }

    if (!file.type.startsWith('image/')) {
      addToast('Only image files are allowed for profile photos', 'error');
      event.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('Profile photo must be 10MB or smaller', 'error');
      event.target.value = '';
      return;
    }

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    previewRef.current = objectUrl;
    setProfilePreviewUrl(objectUrl);
    setProfileImageFile(file);
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateAccountInfo(formData, profileImageFile);
      addToast('Account settings saved', 'success');
      handleRemovePhoto();
    } catch (error) {
      addToast(error?.message || 'Failed to save account settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`border rounded-xl p-6 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-semibold mb-6 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Account Settings
      </h3>

      <div className={`mb-6 border-b pb-6 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className={`relative w-24 h-24 rounded-full border-2 overflow-hidden ${
            isDarkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            {hasAvatar ? (
              <img
                src={resolvedAvatarUrl}
                alt="Profile photo"
                className="w-full h-full object-cover"
                onError={() => setAvatarLoadError(true)}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'
              }`}>
                <User className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className={`text-sm font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Profile photo
            </div>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Upload a JPEG, PNG, or WEBP image (max 10MB).
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="profileImageUpload"
                className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                  isDarkMode ? 'border-gray-600 text-white' : 'border-gray-200 text-gray-700'
                } hover:bg-primary-50 dark:hover:bg-gray-700`}
              >
                <Camera className="w-4 h-4 mr-1" />
                Change photo
              </label>
              {canRemovePhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remove
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400">
              Photos are stored on the Ledgerly backend and sync immediately.
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          id="profileImageUpload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleProfileImageChange}
        />
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h4 className={`font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Company Information
            </h4>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Company Name
              </label>
              <div className="relative">
                <Building className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Contact Name
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Address & Preferences */}
          <div className="space-y-4">
            <h4 className={`font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Address & Preferences
            </h4>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Address
              </label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300 text-gray-900'
                  }`}
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300 text-gray-900'
                  }`}
                >
                  <option>America/Los_Angeles</option>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                  <option>Europe/Berlin</option>
                  <option>Asia/Tokyo</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300 text-gray-900'
                  }`}
                >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>CAD</option>
                  <option>AUD</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-8 pt-6 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Tap "Save Changes" to persist the account profile locally
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AccountSettings;
