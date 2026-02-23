import React, { useEffect, useMemo, useState } from 'react';
import { KeyRound, Save, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  fetchSettings,
  updateSettings,
  normalizeRolePermissions,
  ROLE_PERMISSION_ORDER,
  ROLE_PERMISSION_LABELS,
  PERMISSION_SCHEMA,
  DEFAULT_ROLE_PERMISSION_TEMPLATES
} from '../../services/settingsService';
import { isAccessDeniedError } from '../../utils/accessControl';

const clone = (value) => JSON.parse(JSON.stringify(value));

const prettyDomain = (domain) =>
  String(domain)
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase());

const prettyAction = (action) =>
  String(action)
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase());

const RolePermissionsSettings = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeRole, setActiveRole] = useState('admin');
  const [templates, setTemplates] = useState(() => normalizeRolePermissions({}));
  const [readOnly, setReadOnly] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const settings = await fetchSettings();
      setTemplates(normalizeRolePermissions(settings?.rolePermissions || {}));
      setReadOnly(false);
    } catch (error) {
      if (isAccessDeniedError(error)) {
        setReadOnly(true);
        return;
      }
      addToast(error?.response?.data?.error || 'Failed to load role permission templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeTemplate = useMemo(() => templates?.[activeRole] || {}, [templates, activeRole]);

  const togglePermission = (domain, action) => {
    setTemplates((prev) => {
      const next = clone(prev);
      next[activeRole] = next[activeRole] || {};
      next[activeRole][domain] = next[activeRole][domain] || {};
      next[activeRole][domain][action] = !Boolean(next[activeRole][domain][action]);
      return next;
    });
  };

  const resetRole = () => {
    setTemplates((prev) => ({
      ...prev,
      [activeRole]: clone(DEFAULT_ROLE_PERMISSION_TEMPLATES[activeRole])
    }));
  };

  const resetAll = () => {
    setTemplates(normalizeRolePermissions({}));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { rolePermissions: templates };
      const updated = await updateSettings(payload);
      setTemplates(normalizeRolePermissions(updated?.rolePermissions || templates));
      addToast('Role permission templates saved', 'success');
    } catch (error) {
      if (isAccessDeniedError(error)) {
        setReadOnly(true);
        addToast('You do not have permission to update role permission templates', 'warning');
        return;
      }
      addToast(error?.response?.data?.error || 'Failed to save role permission templates', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`border rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className={`w-5 h-5 ${isDarkMode ? 'text-primary-300' : 'text-primary-600'}`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Role Permissions
            </h3>
          </div>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure default permission templates for each role. These templates are saved to settings and apply to new invites and future role changes (not existing users automatically).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetRole}
            disabled={readOnly || loading}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
              isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            } disabled:opacity-60`}
          >
            <RotateCcw className="w-4 h-4" />
            Reset Role
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || readOnly || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Templates'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading permission templates...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className={`lg:col-span-1 rounded-xl border p-3 ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
            <div className={`text-xs uppercase tracking-wide mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Roles
            </div>
            <div className="space-y-2">
              {ROLE_PERMISSION_ORDER.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setActiveRole(role)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${
                    activeRole === role
                      ? 'bg-primary-600 text-white'
                      : isDarkMode
                        ? 'text-gray-200 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  {ROLE_PERMISSION_LABELS[role] || role}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={resetAll}
              disabled={readOnly}
              className={`mt-4 w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-white'
              } disabled:opacity-60`}
            >
              Reset All to Defaults
            </button>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {ROLE_PERMISSION_LABELS[activeRole] || activeRole} Template
              </div>
              <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Toggle what users in this role can do by default.
              </div>
            </div>

            {Object.entries(PERMISSION_SCHEMA).map(([domain, actions]) => (
              <div
                key={domain}
                className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-white'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {prettyDomain(domain)}
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {actions.filter((action) => activeTemplate?.[domain]?.[action]).length}/{actions.length} enabled
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {actions.map((action) => {
                    const checked = Boolean(activeTemplate?.[domain]?.[action]);
                    return (
                      <label
                        key={`${domain}.${action}`}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                          isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {prettyAction(action)}
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(domain, action)}
                          disabled={readOnly}
                          className="h-4 w-4"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {readOnly && (
              <div className={`text-xs ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                You can view templates, but your account does not have permission to update them.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermissionsSettings;
