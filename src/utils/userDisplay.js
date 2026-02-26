import { resolveServerBaseUrl } from './apiConfig';

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getStoredAuthUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return safeJsonParse(localStorage.getItem('user'));
};

export const resolveAuthUser = (authUser) => authUser || getStoredAuthUser();

export const getUserDisplayName = (user) => {
  if (!user) return 'Welcome back!';

  if (user.name) {
    return user.name;
  }

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  if (user.firstName) {
    return user.firstName;
  }

  if (user.email) {
    return user.email.split('@')[0];
  }

  return 'Welcome back!';
};

export const getUserEmail = (user) => {
  if (!user) return 'guest@example.com';
  return user.email || 'guest@example.com';
};

export const getUserRoleLabel = (user) => {
  if (!user) return 'Guest';
  const role = user.role;
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'accountant':
      return 'Accountant';
    case 'staff':
    case 'sales':
      return 'Staff';
    case 'client':
      return 'Client';
    case 'viewer':
      return 'Viewer';
    default:
      return 'User';
  }
};

const getServerBaseUrl = () => resolveServerBaseUrl();

const resolveAssetUrl = (value) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  const base = getServerBaseUrl();
  const normalized = String(value).replace(/\\/g, '/');
  const trimmed = normalized.replace(/^\/+/, '');
  return `${base}/${trimmed}`;
};

export const getAvatarUrl = (user) => {
  const avatarCandidate = user?.avatarUrl || user?.profileImage;
  return resolveAssetUrl(avatarCandidate);
};

export const getUserInitials = (user) => {
  if (!user) return 'GU';

  if (user.name) {
    const parts = user.name.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const second = parts[1]?.[0] || '';
    const initials = `${first}${second}`.trim();
    return initials ? initials.toUpperCase() : 'GU';
  }

  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  if (user.firstName) {
    return user.firstName.slice(0, 2).toUpperCase();
  }

  if (user.email) {
    return user.email.slice(0, 2).toUpperCase();
  }

  return 'GU';
};

export const getAvatarSeed = (user) => {
  if (!user) return 'Guest';

  if (user.email) {
    return user.email;
  }

  if (user.name) {
    return user.name;
  }

  if (user.firstName && user.lastName) {
    return `${user.firstName}${user.lastName}`;
  }

  if (user.firstName) {
    return user.firstName;
  }

  return 'Ledgerly';
};
