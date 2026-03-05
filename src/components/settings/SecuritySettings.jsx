import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Shield,
  Lock,
  BellRing,
  Smartphone,
  Clock3,
  CalendarClock,
  RefreshCw,
  Save
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { updatePassword } from '../../store/slices/authSlice';
import {
  fetchSettings,
  updateSettings,
  normalizeSecuritySettings,
  DEFAULT_SECURITY_SETTINGS
} from '../../services/settingsService';
import { isAccessDeniedError } from '../../utils/accessControl';

const PASSWORD_DEFAULTS = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

const SecuritySettings = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth?.user);

  const [security, setSecurity] = useState(() => normalizeSecuritySettings(DEFAULT_SECURITY_SETTINGS));
  const [loadingSecurity, setLoadingSecurity] = useState(true);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [securityReadOnly, setSecurityReadOnly] = useState(false);

  const [passwordForm, setPasswordForm] = useState(PASSWORD_DEFAULTS);
  const [savingPassword, setSavingPassword] = useState(false);

  const loadSecuritySettings = useCallback(async () => {
    try {
      setLoadingSecurity(true);
      const settings = await fetchSettings();
      setSecurity(normalizeSecuritySettings(settings?.security || DEFAULT_SECURITY_SETTINGS));
      setSecurityReadOnly(false);
    } catch (error) {
      if (isAccessDeniedError(error)) {
        setSecurityReadOnly(true);
        return;
      }
      addToast(error?.response?.data?.error || 'Failed to load security settings', 'error');
    } finally {
      setLoadingSecurity(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadSecuritySettings();
  }, [loadSecuritySettings]);

  const lastLoginLabel = useMemo(() => {
    const raw = authUser?.lastLogin;
    if (!raw) return 'No recent login timestamp available';

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return 'No recent login timestamp available';

    return parsed.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [authUser?.lastLogin]);

  const handleSecurityToggle = (field) => {
    setSecurity((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSecurityInput = (event) => {
    const { name, value } = event.target;
    setSecurity((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSecurity = async () => {
    try {
      setSavingSecurity(true);
      const payload = normalizeSecuritySettings(security);
      const updated = await updateSettings({ security: payload });
      setSecurity(normalizeSecuritySettings(updated?.security || payload));
      addToast('Security preferences saved', 'success');
    } catch (error) {
      if (isAccessDeniedError(error)) {
        setSecurityReadOnly(true);
        addToast('You can change password, but only admins/accountants can update security preferences', 'warning');
        return;
      }
      addToast(error?.response?.data?.error || 'Failed to save security preferences', 'error');
    } finally {
      setSavingSecurity(false);
    }
  };

  const handlePasswordInput = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Please fill in current password, new password, and confirmation', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New password and confirmation do not match', 'warning');
      return;
    }
    if (currentPassword === newPassword) {
      addToast('New password must be different from current password', 'warning');
      return;
    }

    try {
      setSavingPassword(true);
      await dispatch(updatePassword({ currentPassword, newPassword })).unwrap();
      setPasswordForm(PASSWORD_DEFAULTS);
      addToast('Password updated successfully', 'success');
    } catch (error) {
      addToast(
        typeof error === 'string' ? error : error?.response?.data?.error || 'Failed to update password',
        'error'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const sectionCardClasses = isDarkMode
    ? 'rounded-xl border border-gray-700 bg-gray-900/30 p-5'
    : 'rounded-xl border border-gray-200 bg-gray-50 p-5';

  const inputClasses = `w-full px-3 py-2 rounded-lg border text-sm ${
    isDarkMode
      ? 'bg-gray-900/60 border-gray-700 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  return (
    <div className={`border rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${isDarkMode ? 'text-primary-300' : 'text-primary-600'}`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Security Settings
            </h3>
          </div>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Change password and manage security preferences synced to Ledgerly backend.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSecuritySettings}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
            isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={sectionCardClasses}>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary-600" />
            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Change Password</h4>
          </div>
          <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Last login: {lastLoginLabel}
          </p>

          <form className="mt-4 space-y-4" onSubmit={handleChangePassword}>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordInput}
                className={inputClasses}
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordInput}
                className={inputClasses}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordInput}
                className={inputClasses}
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className={sectionCardClasses}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-600" />
            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Security Preferences</h4>
          </div>
          <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Control login protection, trusted devices, and session limits.
          </p>

          {loadingSecurity ? (
            <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading security preferences...
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <label className={`flex items-center justify-between rounded-lg border p-3 ${
                isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'
              }`}>
                <div className="pr-3">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span className="inline-flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-primary-600" />
                      Two-factor authentication
                    </span>
                  </div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Require a second verification step during sign in.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(security.twoFactorEnabled)}
                  onChange={() => handleSecurityToggle('twoFactorEnabled')}
                  disabled={securityReadOnly}
                  className="h-4 w-4"
                />
              </label>

              <label className={`flex items-center justify-between rounded-lg border p-3 ${
                isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'
              }`}>
                <div className="pr-3">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span className="inline-flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-primary-600" />
                      Login alerts
                    </span>
                  </div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Notify admins on new login attempts or unknown devices.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(security.loginAlerts)}
                  onChange={() => handleSecurityToggle('loginAlerts')}
                  disabled={securityReadOnly}
                  className="h-4 w-4"
                />
              </label>

              <label className={`flex items-center justify-between rounded-lg border p-3 ${
                isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'
              }`}>
                <div className="pr-3">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Trusted devices only
                  </div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Restrict access to remembered devices unless approved again.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(security.trustedDevicesOnly)}
                  onChange={() => handleSecurityToggle('trustedDevicesOnly')}
                  disabled={securityReadOnly}
                  className="h-4 w-4"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="w-4 h-4 text-primary-600" />
                      Session timeout (minutes)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    name="sessionTimeoutMinutes"
                    value={security.sessionTimeoutMinutes}
                    onChange={handleSecurityInput}
                    disabled={securityReadOnly}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="inline-flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-primary-600" />
                      Remember device (days)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    name="rememberMeDays"
                    value={security.rememberMeDays}
                    onChange={handleSecurityInput}
                    disabled={securityReadOnly}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {securityReadOnly
                    ? 'Read-only: only admins/accountants can update shared security preferences.'
                    : 'These preferences are shared for your business settings.'}
                </div>
                <button
                  type="button"
                  onClick={handleSaveSecurity}
                  disabled={savingSecurity || securityReadOnly}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {savingSecurity ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
