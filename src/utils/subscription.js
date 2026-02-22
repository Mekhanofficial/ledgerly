export const normalizePlanId = (plan) => {
  if (!plan) return 'starter';
  const value = String(plan).trim().toLowerCase();
  if (value === 'pro') return 'professional';
  if (value === 'free') return 'starter';
  if (value === 'starter' || value === 'professional' || value === 'enterprise') {
    return value;
  }
  return 'starter';
};

export const isMultiCurrencyPlan = (plan, subscriptionStatus = 'active') => {
  const status = String(subscriptionStatus || 'active').toLowerCase();
  if (status === 'expired') return false;
  return ['professional', 'enterprise'].includes(normalizePlanId(plan));
};
