const CHECKOUT_STORAGE_KEY = 'ledgerly_pending_subscription_checkout';
const STALE_WINDOW_MS = 24 * 60 * 60 * 1000;

const PLAN_IDS = ['starter', 'professional', 'enterprise'];
const BILLING_CYCLES = ['monthly', 'yearly'];

export const normalizeCheckoutPlan = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return PLAN_IDS.includes(normalized) ? normalized : '';
};

export const normalizeCheckoutBillingCycle = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return BILLING_CYCLES.includes(normalized) ? normalized : 'yearly';
};

export const buildCheckoutParams = ({ plan, billingCycle, checkout = true } = {}) => {
  const params = new URLSearchParams();
  const normalizedPlan = normalizeCheckoutPlan(plan);
  if (normalizedPlan) {
    params.set('selectedPlan', normalizedPlan);
    params.set('billingCycle', normalizeCheckoutBillingCycle(billingCycle));
    if (checkout) {
      params.set('checkout', '1');
    }
  }
  return params;
};

export const savePendingCheckout = ({ plan, billingCycle, source = 'landing' } = {}) => {
  if (typeof window === 'undefined') return;
  const normalizedPlan = normalizeCheckoutPlan(plan);
  if (!normalizedPlan) return;

  const payload = {
    plan: normalizedPlan,
    billingCycle: normalizeCheckoutBillingCycle(billingCycle),
    source: String(source || 'landing'),
    savedAt: Date.now()
  };
  localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(payload));
};

export const getPendingCheckout = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const plan = normalizeCheckoutPlan(parsed?.plan);
    if (!plan) {
      localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      return null;
    }

    const savedAt = Number(parsed?.savedAt || 0);
    if (savedAt > 0 && Date.now() - savedAt > STALE_WINDOW_MS) {
      localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      return null;
    }

    return {
      plan,
      billingCycle: normalizeCheckoutBillingCycle(parsed?.billingCycle),
      source: String(parsed?.source || 'landing'),
      savedAt
    };
  } catch {
    localStorage.removeItem(CHECKOUT_STORAGE_KEY);
    return null;
  }
};

export const clearPendingCheckout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CHECKOUT_STORAGE_KEY);
};
