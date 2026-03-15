import { DEFAULT_ROLE_PERMISSION_TEMPLATES } from '../services/settingsService';

const ROLE_ALIASES = {
  sales: 'staff'
};

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const mergePermissions = (base = {}, override = {}) => {
  const result = deepClone(base);
  Object.entries(override || {}).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = mergePermissions(result[key] || {}, value);
      return;
    }
    result[key] = value;
  });
  return result;
};

export const normalizeRole = (role) => {
  if (!role) return 'staff';
  const normalized = String(role).trim().toLowerCase().replace(/[\s-]+/g, '_');
  return ROLE_ALIASES[normalized] || normalized;
};

export const resolvePermissions = (user) => {
  if (!user) {
    return deepClone(DEFAULT_ROLE_PERMISSION_TEMPLATES.staff);
  }

  const role = normalizeRole(user.role);
  const defaults = DEFAULT_ROLE_PERMISSION_TEMPLATES[role] || DEFAULT_ROLE_PERMISSION_TEMPLATES.staff;
  return mergePermissions(defaults, user.permissions || {});
};

export const hasPermission = (user, domain, action) => {
  const role = normalizeRole(user?.role);
  if (role === 'super_admin') {
    return true;
  }

  if (role === 'admin' && domain === 'settings') {
    return true;
  }

  const permissions = resolvePermissions(user);
  return Boolean(permissions?.[domain]?.[action]);
};

export const hasAnyPermission = (user, checks = []) => {
  return checks.some(({ domain, action }) => hasPermission(user, domain, action));
};
