import api from './api';

export const ROLE_PERMISSION_ORDER = ['admin', 'accountant', 'staff', 'viewer', 'client'];

export const ROLE_PERMISSION_LABELS = {
  admin: 'Admin',
  accountant: 'Accountant',
  staff: 'Sales / Staff',
  viewer: 'Viewer',
  client: 'Client'
};

export const PERMISSION_SCHEMA = {
  invoices: ['create', 'read', 'update', 'delete'],
  customers: ['create', 'read', 'update', 'delete'],
  products: ['create', 'read', 'update', 'delete'],
  reports: ['view', 'export'],
  settings: ['view', 'update']
};

export const DEFAULT_ROLE_PERMISSION_TEMPLATES = {
  admin: {
    invoices: { create: true, read: true, update: true, delete: false },
    customers: { create: true, read: true, update: true, delete: true },
    products: { create: true, read: true, update: true, delete: true },
    reports: { view: true, export: true },
    settings: { view: true, update: true }
  },
  accountant: {
    invoices: { create: true, read: true, update: true, delete: false },
    customers: { create: false, read: true, update: false, delete: false },
    products: { create: false, read: true, update: false, delete: false },
    reports: { view: true, export: true },
    settings: { view: false, update: false }
  },
  staff: {
    invoices: { create: true, read: true, update: true, delete: false },
    customers: { create: true, read: true, update: true, delete: false },
    products: { create: false, read: true, update: false, delete: false },
    reports: { view: false, export: false },
    settings: { view: false, update: false }
  },
  viewer: {
    invoices: { create: false, read: true, update: false, delete: false },
    customers: { create: false, read: true, update: false, delete: false },
    products: { create: false, read: true, update: false, delete: false },
    reports: { view: false, export: false },
    settings: { view: false, update: false }
  },
  client: {
    invoices: { create: false, read: true, update: false, delete: false },
    customers: { create: false, read: false, update: false, delete: false },
    products: { create: false, read: false, update: false, delete: false },
    reports: { view: false, export: false },
    settings: { view: false, update: false }
  }
};

export const DEFAULT_INTEGRATIONS = {
  stripe: { enabled: false, publicKey: '', secretKey: '', webhookSecret: '' },
  flutterwave: { enabled: false, publicKey: '', secretKey: '', webhookSecret: '' },
  paypal: { enabled: false, clientId: '', secret: '', mode: 'sandbox' },
  paystack: { enabled: false, publicKey: '', secretKey: '' },
  email: { enabled: false, provider: 'smtp', host: '', port: 587, secure: false, username: '', password: '' },
  quickbooks: { enabled: false, clientId: '', clientSecret: '' },
  xero: { enabled: false, clientId: '', clientSecret: '' },
  wave: { enabled: false, apiKey: '' },
  zapier: { enabled: false, webhookUrl: '' },
  whatsapp: {
    enabled: false,
    apiKey: '',
    senderId: '',
    defaultCountryCode: '234',
    reminderTemplate: '',
    invoiceTemplate: ''
  },
  sms: { enabled: false, provider: '', apiKey: '', senderId: '' },
  nigeriaEInvoice: {
    enabled: false,
    regime: 'NRS_EFS',
    sellerTin: '',
    appProvider: '',
    appProviderId: '',
    apiBaseUrl: '',
    autoSubmitOnSend: false,
    requireBuyerTin: false,
    autoGenerateQr: true,
    schemaVersion: 'NRS-2026.1'
  },
  restApi: { enabled: true, keyRotationDays: 90, webhookBaseUrl: '' }
};

export const DEFAULT_SECURITY_SETTINGS = {
  twoFactorEnabled: false,
  loginAlerts: true,
  trustedDevicesOnly: false,
  sessionTimeoutMinutes: 60,
  rememberMeDays: 30
};

export const DEFAULT_NOTIFICATION_SETTINGS = {
  lowStock: {
    enabled: true,
    threshold: 10
  },
  invoiceOverdue: {
    enabled: true,
    daysBefore: 7
  },
  dailySummary: {
    enabled: false,
    time: '18:00',
    recipients: []
  },
  arAutomation: {
    enabled: false,
    preDueDays: [7, 3, 1],
    overdueDays: [1, 7, 14],
    defaultChannel: 'email',
    fallbackToWhatsApp: true,
    autoApplyLateFees: false
  }
};

const deepClone = (value) => JSON.parse(JSON.stringify(value));
const toBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
};
const toBoundedInt = (value, fallback, min, max) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};
const toIntList = (value, fallback = []) => {
  if (!Array.isArray(value)) return [...fallback];

  const normalized = value
    .map((entry) => Number.parseInt(String(entry ?? '').trim(), 10))
    .filter((entry) => Number.isFinite(entry) && entry >= 0);

  return normalized.length ? Array.from(new Set(normalized)) : [...fallback];
};
const toRecipients = (value, fallback = []) => {
  if (!Array.isArray(value)) return [...fallback];

  const normalized = value
    .map((entry) => String(entry ?? '').trim())
    .filter(Boolean);

  return normalized.length ? normalized : [...fallback];
};

const mergeDeep = (base, override) => {
  const result = deepClone(base || {});
  Object.entries(override || {}).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = mergeDeep(result[key] || {}, value);
    } else {
      result[key] = value;
    }
  });
  return result;
};

export const normalizeRolePermissions = (rolePermissions = {}) => {
  const normalized = {};
  ROLE_PERMISSION_ORDER.forEach((role) => {
    normalized[role] = mergeDeep(DEFAULT_ROLE_PERMISSION_TEMPLATES[role], rolePermissions?.[role] || {});
  });
  return normalized;
};

export const normalizeIntegrations = (integrations = {}) => mergeDeep(DEFAULT_INTEGRATIONS, integrations || {});
export const normalizeSecuritySettings = (security = {}) => ({
  twoFactorEnabled: toBoolean(security?.twoFactorEnabled, DEFAULT_SECURITY_SETTINGS.twoFactorEnabled),
  loginAlerts: toBoolean(security?.loginAlerts, DEFAULT_SECURITY_SETTINGS.loginAlerts),
  trustedDevicesOnly: toBoolean(security?.trustedDevicesOnly, DEFAULT_SECURITY_SETTINGS.trustedDevicesOnly),
  sessionTimeoutMinutes: toBoundedInt(
    security?.sessionTimeoutMinutes,
    DEFAULT_SECURITY_SETTINGS.sessionTimeoutMinutes,
    5,
    1440
  ),
  rememberMeDays: toBoundedInt(
    security?.rememberMeDays,
    DEFAULT_SECURITY_SETTINGS.rememberMeDays,
    1,
    365
  )
});
export const normalizeNotificationSettings = (notifications = {}) => ({
  lowStock: {
    enabled: toBoolean(notifications?.lowStock?.enabled, DEFAULT_NOTIFICATION_SETTINGS.lowStock.enabled),
    threshold: toBoundedInt(
      notifications?.lowStock?.threshold,
      DEFAULT_NOTIFICATION_SETTINGS.lowStock.threshold,
      0,
      100000
    )
  },
  invoiceOverdue: {
    enabled: toBoolean(
      notifications?.invoiceOverdue?.enabled,
      DEFAULT_NOTIFICATION_SETTINGS.invoiceOverdue.enabled
    ),
    daysBefore: toBoundedInt(
      notifications?.invoiceOverdue?.daysBefore,
      DEFAULT_NOTIFICATION_SETTINGS.invoiceOverdue.daysBefore,
      0,
      365
    )
  },
  dailySummary: {
    enabled: toBoolean(
      notifications?.dailySummary?.enabled,
      DEFAULT_NOTIFICATION_SETTINGS.dailySummary.enabled
    ),
    time: String(notifications?.dailySummary?.time || DEFAULT_NOTIFICATION_SETTINGS.dailySummary.time),
    recipients: toRecipients(
      notifications?.dailySummary?.recipients,
      DEFAULT_NOTIFICATION_SETTINGS.dailySummary.recipients
    )
  },
  arAutomation: {
    enabled: toBoolean(
      notifications?.arAutomation?.enabled,
      DEFAULT_NOTIFICATION_SETTINGS.arAutomation.enabled
    ),
    preDueDays: toIntList(
      notifications?.arAutomation?.preDueDays,
      DEFAULT_NOTIFICATION_SETTINGS.arAutomation.preDueDays
    ),
    overdueDays: toIntList(
      notifications?.arAutomation?.overdueDays,
      DEFAULT_NOTIFICATION_SETTINGS.arAutomation.overdueDays
    ),
    defaultChannel: ['email', 'whatsapp', 'both'].includes(notifications?.arAutomation?.defaultChannel)
      ? notifications.arAutomation.defaultChannel
      : DEFAULT_NOTIFICATION_SETTINGS.arAutomation.defaultChannel,
    fallbackToWhatsApp: toBoolean(
      notifications?.arAutomation?.fallbackToWhatsApp,
      DEFAULT_NOTIFICATION_SETTINGS.arAutomation.fallbackToWhatsApp
    ),
    autoApplyLateFees: toBoolean(
      notifications?.arAutomation?.autoApplyLateFees,
      DEFAULT_NOTIFICATION_SETTINGS.arAutomation.autoApplyLateFees
    )
  }
});

export const fetchSettings = async () => {
  const response = await api.get('/settings');
  return response.data?.data || {};
};

export const updateSettings = async (payload) => {
  const response = await api.put('/settings', payload);
  return response.data?.data || {};
};

export const updateIntegration = async (provider, payload) => {
  const response = await api.put(`/settings/integrations/${provider}`, payload);
  return response.data?.data || {};
};

export const runBackup = async (payload = {}) => {
  const response = await api.post('/settings/backup/run', payload);
  return response.data || {};
};

export const fetchAuditLogs = async ({ limit = 25, action = '' } = {}) => {
  const response = await api.get('/settings/audit-log', {
    params: {
      limit,
      ...(action ? { action } : {})
    }
  });
  return {
    count: response.data?.count || 0,
    data: response.data?.data || []
  };
};

export const downloadBackupSnapshot = async () => {
  const response = await api.get('/settings/backup/export', {
    responseType: 'blob'
  });

  const disposition = response.headers?.['content-disposition'] || '';
  const fileNameMatch = disposition.match(/filename="?([^"]+)"?/i);
  const fileName = fileNameMatch?.[1] || `billmetro-backup-${new Date().toISOString().split('T')[0]}.json`;

  return {
    blob: response.data,
    fileName
  };
};
