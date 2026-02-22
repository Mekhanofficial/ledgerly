import React, { useEffect, useMemo, useState } from 'react';
import { Cable, Save, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  DEFAULT_INTEGRATIONS,
  fetchSettings,
  normalizeIntegrations,
  updateIntegration
} from '../../services/settingsService';
import { isAccessDeniedError } from '../../utils/accessControl';

const PROVIDERS = [
  {
    id: 'stripe',
    label: 'Stripe',
    category: 'Payments',
    fields: [
      { key: 'publicKey', label: 'Public Key' },
      { key: 'secretKey', label: 'Secret Key', type: 'password' },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' }
    ]
  },
  {
    id: 'paypal',
    label: 'PayPal',
    category: 'Payments',
    fields: [
      { key: 'clientId', label: 'Client ID' },
      { key: 'secret', label: 'Secret', type: 'password' },
      { key: 'mode', label: 'Mode', type: 'select', options: ['sandbox', 'live'] }
    ]
  },
  {
    id: 'paystack',
    label: 'Paystack',
    category: 'Payments',
    fields: [
      { key: 'publicKey', label: 'Public Key' },
      { key: 'secretKey', label: 'Secret Key', type: 'password' }
    ]
  },
  {
    id: 'email',
    label: 'SMTP / Email',
    category: 'Messaging',
    fields: [
      { key: 'provider', label: 'Provider' },
      { key: 'host', label: 'Host' },
      { key: 'port', label: 'Port', type: 'number' },
      { key: 'secure', label: 'Secure (TLS)', type: 'checkbox' },
      { key: 'username', label: 'Username' },
      { key: 'password', label: 'Password', type: 'password' }
    ]
  },
  {
    id: 'quickbooks',
    label: 'QuickBooks',
    category: 'Accounting',
    fields: [
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' }
    ]
  },
  {
    id: 'xero',
    label: 'Xero',
    category: 'Accounting',
    fields: [
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' }
    ]
  },
  {
    id: 'wave',
    label: 'Wave',
    category: 'Accounting',
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password' }]
  },
  {
    id: 'zapier',
    label: 'Zapier',
    category: 'Automation',
    fields: [{ key: 'webhookUrl', label: 'Webhook URL' }]
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    category: 'Messaging',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'senderId', label: 'Sender ID' }
    ]
  },
  {
    id: 'sms',
    label: 'SMS',
    category: 'Messaging',
    fields: [
      { key: 'provider', label: 'Provider' },
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'senderId', label: 'Sender ID' }
    ]
  },
  {
    id: 'restApi',
    label: 'REST API',
    category: 'Platform',
    fields: [
      { key: 'keyRotationDays', label: 'Key Rotation (days)', type: 'number' },
      { key: 'webhookBaseUrl', label: 'Webhook Base URL' }
    ]
  }
];

const clone = (value) => JSON.parse(JSON.stringify(value));

const IntegrationsSettings = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingProvider, setSavingProvider] = useState('');
  const [activeProvider, setActiveProvider] = useState('stripe');
  const [integrations, setIntegrations] = useState(() => normalizeIntegrations({}));
  const [readOnly, setReadOnly] = useState(false);

  const categories = useMemo(() => {
    const map = new Map();
    PROVIDERS.forEach((provider) => {
      if (!map.has(provider.category)) {
        map.set(provider.category, []);
      }
      map.get(provider.category).push(provider);
    });
    return Array.from(map.entries());
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const settings = await fetchSettings();
      setIntegrations(normalizeIntegrations(settings?.integrations || DEFAULT_INTEGRATIONS));
      setReadOnly(false);
    } catch (error) {
      if (isAccessDeniedError(error)) {
        setReadOnly(true);
        return;
      }
      addToast(error?.response?.data?.error || 'Failed to load integrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeConfig = integrations?.[activeProvider] || {};
  const activeMeta = PROVIDERS.find((provider) => provider.id === activeProvider) || PROVIDERS[0];

  const setField = (providerId, key, value) => {
    setIntegrations((prev) => {
      const next = clone(prev);
      next[providerId] = next[providerId] || {};
      next[providerId][key] = value;
      return next;
    });
  };

  const handleSaveProvider = async () => {
    try {
      setSavingProvider(activeProvider);
      const saved = await updateIntegration(activeProvider, integrations[activeProvider] || {});
      setIntegrations((prev) => ({
        ...prev,
        [activeProvider]: {
          ...(prev[activeProvider] || {}),
          ...(saved || {})
        }
      }));
      addToast(`${activeMeta.label} settings saved`, 'success');
    } catch (error) {
      if (isAccessDeniedError(error)) {
        setReadOnly(true);
        addToast('You do not have permission to update integrations', 'warning');
        return;
      }
      addToast(error?.response?.data?.error || `Failed to save ${activeMeta.label} settings`, 'error');
    } finally {
      setSavingProvider('');
    }
  };

  const renderField = (field) => {
    const value = activeConfig?.[field.key];

    if (field.type === 'checkbox') {
      return (
        <label
          key={field.key}
          className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
            isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{field.label}</span>
          <input
            type="checkbox"
            checked={Boolean(value)}
            disabled={readOnly}
            onChange={(event) => setField(activeProvider, field.key, event.target.checked)}
            className="h-4 w-4"
          />
        </label>
      );
    }

    if (field.type === 'select') {
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {field.label}
          </label>
          <select
            value={value ?? field.options?.[0] ?? ''}
            disabled={readOnly}
            onChange={(event) => setField(activeProvider, field.key, event.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${
              isDarkMode ? 'bg-gray-900/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {(field.options || []).map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={field.key}>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {field.label}
        </label>
        <input
          type={field.type || 'text'}
          value={value ?? ''}
          disabled={readOnly}
          onChange={(event) => {
            const nextValue = field.type === 'number' ? Number(event.target.value || 0) : event.target.value;
            setField(activeProvider, field.key, nextValue);
          }}
          className={`w-full px-3 py-2 border rounded-lg ${
            isDarkMode ? 'bg-gray-900/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
    );
  };

  return (
    <div className={`border rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Cable className={`w-5 h-5 ${isDarkMode ? 'text-primary-300' : 'text-primary-600'}`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Integrations
            </h3>
          </div>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure payment gateways, accounting sync, messaging providers, automation hooks, and API settings.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
            isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading integrations...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className={`lg:col-span-1 rounded-xl border p-3 ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
            {categories.map(([category, providers]) => (
              <div key={category} className="mb-4 last:mb-0">
                <div className={`text-[11px] uppercase tracking-wide mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {category}
                </div>
                <div className="space-y-2">
                  {providers.map((provider) => {
                    const enabled = Boolean(integrations?.[provider.id]?.enabled);
                    return (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => setActiveProvider(provider.id)}
                        className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${
                          activeProvider === provider.id
                            ? 'bg-primary-600 text-white'
                            : isDarkMode
                              ? 'text-gray-200 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{provider.label}</span>
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                            activeProvider === provider.id
                              ? 'bg-white/20 text-white'
                              : enabled
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-200 text-gray-600'
                          }`}>
                            {enabled ? 'On' : 'Off'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activeMeta.label}</div>
              <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {activeMeta.category} integration settings
              </div>
            </div>

            <label className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
              isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-white'
            }`}>
              <div>
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enable {activeMeta.label}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Toggle this integration on or off for your business.
                </div>
              </div>
              <input
                type="checkbox"
                checked={Boolean(activeConfig?.enabled)}
                disabled={readOnly}
                onChange={(event) => setField(activeProvider, 'enabled', event.target.checked)}
                className="h-4 w-4"
              />
            </label>

            <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-white'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeMeta.fields.map(renderField)}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Save writes provider settings to your business settings profile.
              </div>
              <button
                type="button"
                onClick={handleSaveProvider}
                disabled={Boolean(savingProvider) || readOnly}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {savingProvider === activeProvider ? 'Saving...' : `Save ${activeMeta.label}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsSettings;

