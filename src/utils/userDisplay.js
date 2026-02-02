const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
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
  return user.role === 'admin' ? 'Admin' : 'User';
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
