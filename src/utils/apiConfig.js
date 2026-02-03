const LOCAL_API_FALLBACK = 'http://localhost:7000/api/v1';
const LOCAL_SERVER_FALLBACK = 'http://localhost:7000';

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

  if (rawUrl) {
    const normalized = normalizeBaseUrl(rawUrl);
    if (!isLocalhost() && /localhost|127\.0\.0\.1/i.test(normalized)) {
      return `${window.location.origin}/api/v1`;
    }
    return normalized;
  }

  if (isBrowser && !isLocalhost()) {
    return `${window.location.origin}/api/v1`;
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
    } catch (error) {
      return window.location.origin;
    }
  }

  try {
    return new URL(apiBase).origin;
  } catch (error) {
    return LOCAL_SERVER_FALLBACK;
  }
};
