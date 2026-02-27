const LOCAL_API_FALLBACK = 'http://localhost:7000/api/v1';
const LOCAL_SERVER_FALLBACK = 'http://localhost:7000';
const PROD_API_FALLBACK = 'https://ledgerly-backend-iayk.onrender.com/api/v1';

const isBrowser = typeof window !== 'undefined';

const isLocalhost = () => {
  if (!isBrowser) return true;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
};

const normalizeBaseUrl = (value) => {
  if (!value) return value;
  return value.replace(/\/+$/, '');
};

export const resolveApiBaseUrl = () => {
  const runtimeUrl = isBrowser ? window.__LEDGERLY_API_URL__ : undefined;
  const envUrl = import.meta.env.VITE_API_URL;
  const rawUrl = runtimeUrl || envUrl;
  const allowRemoteOnLocalhost = String(import.meta.env.VITE_ALLOW_REMOTE_API_ON_LOCALHOST || '')
    .trim()
    .toLowerCase() === 'true';

  if (isLocalhost()) {
    if (!rawUrl) {
      return LOCAL_API_FALLBACK;
    }
    const normalized = normalizeBaseUrl(rawUrl);
    const pointsToLocal = /localhost|127\.0\.0\.1/i.test(normalized);
    if (!pointsToLocal && !allowRemoteOnLocalhost) {
      return LOCAL_API_FALLBACK;
    }
    return normalized;
  }

  if (rawUrl) {
    const normalized = normalizeBaseUrl(rawUrl);
    if (/localhost|127\.0\.0\.1/i.test(normalized)) {
      return PROD_API_FALLBACK;
    }
    return normalized;
  }

  if (isBrowser) {
    return PROD_API_FALLBACK;
  }

  return LOCAL_API_FALLBACK;
};

export const resolveServerBaseUrl = () => {
  const apiBase = resolveApiBaseUrl();

  if (!apiBase) {
    return isBrowser ? window.location.origin : LOCAL_SERVER_FALLBACK;
  }

  if (isBrowser) {
    try {
      return new URL(apiBase, window.location.origin).origin;
    } catch {
      return window.location.origin;
    }
  }

  try {
    return new URL(apiBase).origin;
  } catch {
    return LOCAL_SERVER_FALLBACK;
  }
};
