import React, { useEffect, useMemo, useState } from 'react';
import { Check, Star, CreditCard, Calendar, Users, Shield, Zap, Crown, Plus, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { fetchBillingSummary, updateAddOns, initializeSubscriptionPayment } from '../../services/billingService';

const PLAN_FEATURES = {
  starter: [
    '100 invoices per month',
    'Unlimited receipts',
    'Basic reporting',
    'Email support',
    'Single user',
    'Mobile app access',
    'Access to 5 Standard templates only'
  ],
  professional: [
    'Unlimited invoices',
    'Advanced reporting',
    '5 team members',
    'Priority support',
    'Recurring invoices',
    'Inventory management',
    'Customer database',
    'Multi-currency',
    'API access (limited)',
    'Access to Standard + Premium templates'
  ],
  enterprise: [
    'Everything in Professional',
    '20 team members',
    'Full API access',
    'White-label branding',
    'Custom workflows',
    'Dedicated manager',
    'SLA guarantee',
    'Access to all templates including Elite'
  ]
};

const BillingSettings = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const authUser = useSelector((state) => state.auth.user);
  const normalizedRole = useMemo(() => {
    return String(authUser?.role || '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');
  }, [authUser]);
  const canManagePayments = normalizedRole === 'super_admin';

  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [addOns, setAddOns] = useState({
    whiteLabelEnabled: false,
    extraSeats: 0,
    analyticsEnabled: false
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [savingPlan, setSavingPlan] = useState(false);
  const [savingAddOns, setSavingAddOns] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    name: '',
    accountDetails: ''
  });

  const loadSummary = async () => {
    setLoading(true);
    try {
      const response = await fetchBillingSummary();
      const data = response?.data || response || {};
      setBilling(data);
      setSelectedPlan(data?.subscription?.plan || 'starter');
      setBillingCycle(data?.subscription?.billingCycle || 'monthly');
      setAddOns({
        whiteLabelEnabled: Boolean(data?.addOns?.whiteLabelEnabled),
        extraSeats: Number.isFinite(Number(data?.addOns?.extraSeats))
          ? Number(data.addOns.extraSeats)
          : 0,
        analyticsEnabled: Boolean(data?.addOns?.analyticsEnabled)
      });
      setPaymentMethods(Array.isArray(data?.paymentMethods) ? data.paymentMethods : []);
    } catch (error) {
      addToast(error?.response?.data?.error || 'Unable to load billing settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const planCatalog = useMemo(() => {
    const catalog = billing?.planCatalog || {};
    const order = ['starter', 'professional', 'enterprise'];
    return order
      .map((id) => catalog[id])
      .filter(Boolean);
  }, [billing]);

  const currentSubscription = billing?.subscription || {};
  const pricingCurrency = billing?.pricingCurrency || 'NGN';
  const currentPlan = currentSubscription?.plan || 'starter';
  const currentCycle = currentSubscription?.billingCycle || 'monthly';
  const currentStatus = String(currentSubscription?.status || 'active').toLowerCase();
  const hasPlanChanges = selectedPlan !== currentPlan || billingCycle !== currentCycle;

  const formatDate = (value) => {
    if (!value) return 'Not set';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Not set';
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return value;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: pricingCurrency
    }).format(amount);
  };

  const handleUpdatePlan = async () => {
    if (!hasPlanChanges) return;
    setSavingPlan(true);
    try {
      const response = await initializeSubscriptionPayment({
        plan: selectedPlan,
        billingCycle
      });
      const data = response?.data || response || {};
      const url = data?.authorizationUrl || data?.authorization_url;
      if (url) {
        window.location.href = url;
        return;
      }
      addToast('Unable to start payment. Please try again.', 'error');
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to start payment', 'error');
    } finally {
      setSavingPlan(false);
    }
  };

  const hasAddOnChanges = useMemo(() => {
    if (!billing?.addOns) return true;
    return (
      Boolean(billing.addOns.whiteLabelEnabled) !== Boolean(addOns.whiteLabelEnabled) ||
      Number(billing.addOns.extraSeats || 0) !== Number(addOns.extraSeats || 0) ||
      Boolean(billing.addOns.analyticsEnabled) !== Boolean(addOns.analyticsEnabled)
    );
  }, [billing, addOns]);

  const canUseWhiteLabel = currentStatus !== 'trial' && ['professional', 'enterprise'].includes(currentPlan);
  const canUseExtraSeats = currentStatus !== 'trial' && ['professional', 'enterprise'].includes(currentPlan);

  const handleUpdateAddOns = async () => {
    setSavingAddOns(true);
    try {
      await updateAddOns({
        whiteLabelEnabled: canUseWhiteLabel ? addOns.whiteLabelEnabled : false,
        extraSeats: canUseExtraSeats ? addOns.extraSeats : 0,
        analyticsEnabled: addOns.analyticsEnabled
      });
      addToast('Add-ons updated successfully', 'success');
      await loadSummary();
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to update add-ons', 'error');
    } finally {
      setSavingAddOns(false);
    }
  };

  const statusLabel = String(currentSubscription?.status || 'active').replace('_', ' ');
  const statusKey = String(currentSubscription?.status || 'active').toLowerCase();
  const statusColor = statusKey === 'active'
    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300'
    : statusKey === 'trial'
      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300'
      : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300';

  const handlePaymentMethodChange = (field, value) => {
    setNewPaymentMethod((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.name.trim()) {
      addToast('Payment method name is required', 'error');
      return;
    }
    if (!canManagePayments) {
      addToast('Only super admins can manage payment methods', 'error');
      return;
    }
    setPaymentBusy(true);
    try {
      const response = await api.post('/business/payment-methods', {
        name: newPaymentMethod.name.trim(),
        accountDetails: newPaymentMethod.accountDetails.trim()
      });
      const method = response?.data?.data;
      setPaymentMethods((prev) => [...prev, method]);
      setNewPaymentMethod({ name: '', accountDetails: '' });
      addToast('Payment method added', 'success');
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to add payment method', 'error');
    } finally {
      setPaymentBusy(false);
    }
  };

  const handleTogglePaymentMethod = async (method) => {
    if (!canManagePayments) return;
    setPaymentBusy(true);
    try {
      const response = await api.put(`/business/payment-methods/${method._id}`, {
        isActive: !method.isActive
      });
      const updated = response?.data?.data;
      setPaymentMethods((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      );
      addToast('Payment method updated', 'success');
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to update payment method', 'error');
    } finally {
      setPaymentBusy(false);
    }
  };

  const handleRemovePaymentMethod = async (methodId) => {
    if (!canManagePayments) return;
    setPaymentBusy(true);
    try {
      await api.delete(`/business/payment-methods/${methodId}`);
      setPaymentMethods((prev) => prev.filter((item) => item._id !== methodId));
      addToast('Payment method removed', 'success');
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to remove payment method', 'error');
    } finally {
      setPaymentBusy(false);
    }
  };

  return (
    <div className={`border rounded-xl p-6 ${
      isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Billing & Plan
          </h3>
          <p className={`mt-1 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage your subscription, add-ons, and payment methods.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSummary}
          className={`px-4 py-2 rounded-lg text-sm font-medium border ${
            isDarkMode
              ? 'border-gray-600 text-gray-200 hover:bg-gray-700'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className={`rounded-lg border p-6 ${
          isDarkMode ? 'border-gray-700 bg-gray-900/30 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-600'
        }`}>
          Loading billing details...
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`border rounded-xl p-4 ${
              isDarkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Crown className="w-4 h-4" />
                Current Plan
              </div>
              <div className={`mt-2 text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </div>
              <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                {statusLabel}
              </div>
            </div>
            <div className={`border rounded-xl p-4 ${
              isDarkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Renewal Date
              </div>
              <div className={`mt-2 text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {formatDate(currentSubscription?.subscriptionEnd)}
              </div>
              <div className={`mt-2 text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Billing cycle: {currentCycle}
              </div>
            </div>
            <div className={`border rounded-xl p-4 ${
              isDarkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CreditCard className="w-4 h-4" />
                Pricing Currency
              </div>
              <div className={`mt-2 text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {pricingCurrency}
              </div>
              <div className={`mt-2 text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Paystack checkout currency for plans and add-ons
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Subscription Plans
              </h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Choose a plan and billing cycle that fits your business.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-full text-xs font-medium ${
                  billingCycle === 'monthly'
                    ? 'bg-primary-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-full text-xs font-medium ${
                  billingCycle === 'yearly'
                    ? 'bg-primary-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                Yearly
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {planCatalog.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const isPopular = plan.id === 'professional';
              const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
              const features = PLAN_FEATURES[plan.id] || [];

              return (
                <div
                  key={plan.id}
                  className={`relative border rounded-2xl p-6 transition ${
                    isSelected
                      ? 'border-primary-500 shadow-lg'
                      : isDarkMode
                        ? 'border-gray-700 bg-gray-900/30'
                        : 'border-gray-200 bg-white'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full flex items-center gap-2">
                        <Star className="w-3 h-3" />
                        Most Popular
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <h5 className={`text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {plan.name}
                    </h5>
                    {currentPlan === plan.id && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-100 text-primary-700">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatCurrency(price)}
                    </span>
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`mt-6 w-full py-2 rounded-lg text-sm font-semibold ${
                      isSelected
                        ? 'bg-primary-600 text-white'
                        : isDarkMode
                          ? 'border border-gray-700 text-gray-200 hover:bg-gray-800'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              You will be redirected to Paystack to complete payment in NGN. Plan updates after verification.
            </div>
            <button
              type="button"
              disabled={!hasPlanChanges || savingPlan}
              onClick={handleUpdatePlan}
              className="px-6 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingPlan ? 'Updating...' : 'Update Plan'}
            </button>
          </div>

          <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary-500" />
              <h4 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Add-ons
              </h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className={`border rounded-xl p-4 ${
                isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-white'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      White-label
                    </div>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Remove Ledgerly branding (Professional+)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!canUseWhiteLabel) return;
                      setAddOns((prev) => ({
                        ...prev,
                        whiteLabelEnabled: !prev.whiteLabelEnabled
                      }));
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      addOns.whiteLabelEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                    } ${!canUseWhiteLabel ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        addOns.whiteLabelEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {!canUseWhiteLabel && (
                  <div className="mt-3 text-xs text-amber-600">
                    Upgrade to Professional or Enterprise to enable this add-on.
                  </div>
                )}
              </div>
              <div className={`border rounded-xl p-4 ${
                isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-white'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Extra team seats
                    </div>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      ₦5 per additional seat
                    </p>
                  </div>
                  <Users className="w-5 h-5 text-primary-500" />
                </div>
                <div className="mt-3">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={addOns.extraSeats}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setAddOns((prev) => ({
                        ...prev,
                        extraSeats: Number.isFinite(value) ? value : 0
                      }));
                    }}
                    disabled={!canUseExtraSeats}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'border-gray-200 text-gray-900'
                    } ${!canUseExtraSeats ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
                {!canUseExtraSeats && (
                  <div className="mt-3 text-xs text-amber-600">
                    Upgrade to Professional or Enterprise to add seats.
                  </div>
                )}
              </div>
              <div className={`border rounded-xl p-4 ${
                isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-white'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Advanced analytics AI
                    </div>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      ₦10 per month
                    </p>
                  </div>
                  <Zap className="w-5 h-5 text-primary-500" />
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setAddOns((prev) => ({
                      ...prev,
                      analyticsEnabled: !prev.analyticsEnabled
                    }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      addOns.analyticsEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        addOns.analyticsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-5">
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Add-ons are billed monthly and can be changed anytime.
              </div>
              <button
                type="button"
                disabled={!hasAddOnChanges || savingAddOns}
                onClick={handleUpdateAddOns}
                className="px-6 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingAddOns ? 'Saving...' : 'Save Add-ons'}
              </button>
            </div>
          </div>

          <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary-500" />
              <h4 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Payment Methods
              </h4>
            </div>
            <div className="space-y-3">
              {paymentMethods.length === 0 && (
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  No payment methods on file.
                </div>
              )}
              {paymentMethods.map((method) => (
                <div
                  key={method._id}
                  className={`border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div>
                    <div className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {method.name}
                    </div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {method.accountDetails || 'No account details'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePaymentMethod(method)}
                      disabled={!canManagePayments || paymentBusy}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        method.isActive
                          ? 'border-emerald-300 text-emerald-600'
                          : 'border-gray-300 text-gray-500'
                      } ${!canManagePayments ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {method.isActive ? 'Active' : 'Inactive'}
                    </button>
                    {canManagePayments && (
                      <button
                        type="button"
                        onClick={() => handleRemovePaymentMethod(method._id)}
                        disabled={paymentBusy}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {canManagePayments ? (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Payment method name"
                  value={newPaymentMethod.name}
                  onChange={(event) => handlePaymentMethodChange('name', event.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'border-gray-200 text-gray-900'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Account details"
                  value={newPaymentMethod.accountDetails}
                  onChange={(event) => handlePaymentMethodChange('accountDetails', event.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'border-gray-200 text-gray-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddPaymentMethod}
                  disabled={paymentBusy}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Add Method
                </button>
              </div>
            ) : (
              <div className={`mt-4 text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Only super admins can manage payment methods.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSettings;
