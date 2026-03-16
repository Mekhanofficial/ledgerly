import axios from 'axios';
import { resolveApiBaseUrl } from '../utils/apiConfig';

const parseTimeout = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS, 45000),
});

let pendingMutatingRequests = 0;
const activityListeners = new Set();

const emitApiActivity = () => {
  const snapshot = {
    pendingMutatingRequests,
    isLoading: pendingMutatingRequests > 0
  };

  activityListeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch {
      // Ignore listener errors to avoid breaking request flow.
    }
  });
};

const shouldTrackGlobalLoading = (config) => {
  if (!config || config.__skipGlobalLoading) return false;
  if (config.__trackGlobalLoading === true) return true;

  const method = String(config.method || 'get').trim().toLowerCase();
  return !['get', 'head', 'options'].includes(method);
};

const markRequestStart = (config) => {
  if (!shouldTrackGlobalLoading(config)) return;
  if (config.__isGlobalLoadingTracked) return;

  config.__isGlobalLoadingTracked = true;
  pendingMutatingRequests += 1;
  emitApiActivity();
};

const markRequestEnd = (config) => {
  if (!config?.__isGlobalLoadingTracked) return;
  config.__isGlobalLoadingTracked = false;

  pendingMutatingRequests = Math.max(0, pendingMutatingRequests - 1);
  emitApiActivity();
};

export const subscribeToApiActivity = (listener) => {
  if (typeof listener !== 'function') {
    return () => {};
  }

  activityListeners.add(listener);
  listener({
    pendingMutatingRequests,
    isLoading: pendingMutatingRequests > 0
  });

  return () => {
    activityListeners.delete(listener);
  };
};

api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    if (config.__skipAuth) {
      delete config.headers.Authorization;
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    markRequestStart(config);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    markRequestEnd(response?.config);
    return response;
  },
  (error) => {
    markRequestEnd(error?.config);
    return Promise.reject(error);
  }
);

export default api;
