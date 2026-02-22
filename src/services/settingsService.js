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
    settings: { view: true, update: false }
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
  paypal: { enabled: false, clientId: '', secret: '', mode: 'sandbox' },
  paystack: { enabled: false, publicKey: '', secretKey: '' },
  email: { enabled: false, provider: 'smtp', host: '', port: 587, secure: false, username: '', password: '' },
  quickbooks: { enabled: false, clientId: '', clientSecret: '' },
  xero: { enabled: false, clientId: '', clientSecret: '' },
  wave: { enabled: false, apiKey: '' },
  zapier: { enabled: false, webhookUrl: '' },
  whatsapp: { enabled: false, apiKey: '', senderId: '' },
  sms: { enabled: false, provider: '', apiKey: '', senderId: '' },
  restApi: { enabled: true, keyRotationDays: 90, webhookBaseUrl: '' }
};

const deepClone = (value) => JSON.parse(JSON.stringify(value));

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
  const fileName = fileNameMatch?.[1] || `ledgerly-backup-${new Date().toISOString().split('T')[0]}.json`;

  return {
    blob: response.data,
    fileName
  };
};

