const ACCESS_DENIED_PATTERNS = [
  /not authorized/i,
  /not authorised/i,
  /unauthorized/i,
  /forbidden/i,
  /access denied/i,
  /not allowed/i,
  /not permitted/i,
  /not accessible/i,
  /only admins?/i,
  /only super admins?/i,
  /status code 401/i,
  /status code 403/i,
  /access this route/i,
  /insufficient permissions?/i
];

export const isAccessDeniedMessage = (message) => {
  if (!message) return false;
  let text = '';

  if (typeof message === 'string') {
    text = message;
  } else if (typeof message === 'object') {
    const candidate = message?.message || message?.error || message?.detail;
    if (candidate) {
      text = String(candidate);
    } else {
      try {
        text = JSON.stringify(message);
      } catch (error) {
        text = String(message);
      }
    }
  } else {
    text = String(message);
  }

  return ACCESS_DENIED_PATTERNS.some((pattern) => pattern.test(text));
};

export const isAccessDeniedError = (error) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403) return true;

  const message =
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message;

  return isAccessDeniedMessage(message);
};
