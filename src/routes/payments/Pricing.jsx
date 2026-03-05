// src/pages/Pricing.jsx
import React, { useMemo, useState } from 'react';
import { Check, Crown, Sparkles, Zap, Shield, Star } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { initializeSubscriptionPayment } from '../../services/billingService';
import { useToast } from '../../context/ToastContext';
import { useAccount } from '../../context/AccountContext';
import { normalizePlanId } from '../../utils/subscription';

const Pricing = () => {
  const { isDarkMode } = useTheme();
  const [billingCycle, setBillingCycle] = useState('yearly');
  const { addToast } = useToast();
  const { accountInfo } = useAccount();
  const currentPlan = useMemo(() => normalizePlanId(accountInfo?.plan), [accountInfo]);
  const subscriptionStatus = String(accountInfo?.subscriptionStatus || 'active').toLowerCase();
  const isSubscriptionActive = subscriptionStatus !== 'expired';
  const pricingCurrency = 'NGN';

  const formatNgn = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return value;
    const hasWholeAmount = Number.isInteger(amount);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: pricingCurrency,
      minimumFractionDigits: hasWholeAmount ? 0 : 2,
      maximumFractionDigits: hasWholeAmount ? 0 : 2
    }).format(amount);
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'For freelancers and solo operators',
      monthlyPrice: 2000,
      yearlyPrice: 24000,
      monthlyEquivalent: 2000,
      popular: false,
      features: [
        '100 invoices per month',
        'Unlimited receipts',
        'Basic reporting',
        'Single user',
        '5 Standard templates',
        'No recurring invoices',
        'No API',
        'No team'
      ],
      buttonText: 'Choose Starter',
      buttonVariant: 'outline'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'For growing businesses and small teams',
      monthlyPrice: 7000,
      yearlyPrice: 84000,
      monthlyEquivalent: 7000,
      popular: true,
      features: [
        'Unlimited invoices',
        'Advanced reporting',
        '5 team members',
        'Recurring invoices',
        'Inventory',
        'Customer database',
        'Multi-currency',
        'Limited API',
        'All Standard + Premium templates'
      ],
      buttonText: 'Start Professional',
      buttonVariant: 'primary'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For larger businesses and advanced workflows',
      monthlyPrice: 30000,
      yearlyPrice: 360000,
      monthlyEquivalent: 30000,
      popular: false,
      features: [
        'Everything in Professional',
        '20 team members',
        'Full API',
        'White-label branding',
        'Custom workflows',
        'Dedicated manager',
        'SLA guarantee',
        'All templates (Standard + Premium + Elite)'
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'primary'
    }
  ];

  const templateTiers = [
    {
      name: 'Premium',
      price: 3500,
      description: 'Advanced designs included in Professional+',
      includedIn: 'Included in Professional Plan',
      valueText: 'Designed for growing businesses that want polished, brand-ready invoices.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Elite',
      price: 8500,
      description: 'Top-tier designs included in Enterprise',
      includedIn: 'Included in Enterprise Plan',
      valueText: 'High-end identity-driven invoice designs for agencies, startups, and premium brands.',
      gradient: 'from-amber-500 to-yellow-500'
    }
  ];

  const addOns = [
    {
      name: 'White-label Add-on',
      price: 60000,
      suffix: '/year',
      description: 'Remove Ledgerly branding (Professional only).'
    },
    {
      name: 'Extra Team Member',
      price: 18000,
      suffix: '/year per seat',
      description: 'Add additional seats beyond your plan.'
    },
    {
      name: 'Advanced Analytics AI',
      price: 36000,
      suffix: '/year',
      description: 'AI insights and forecasting.'
    }
  ];

  const templateBundles = [
    {
      id: 'premium-bundle',
      name: 'Premium Bundle',
      price: 10000,
      description: 'Unlock all premium templates with one purchase.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'elite-bundle',
      name: 'Elite Bundle',
      price: 25000,
      description: 'Unlock all elite templates with one purchase.',
      gradient: 'from-amber-500 to-yellow-500'
    }
  ];

  const startCheckout = async (planId) => {
    try {
      const response = await initializeSubscriptionPayment({ plan: planId, billingCycle });
      const data = response?.data || response || {};
      const url = data?.authorizationUrl || data?.authorization_url;
      if (url) {
        window.location.href = url;
        return;
      }
      addToast('Unable to start payment. Please try again.', 'error');
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to start payment', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 mb-4">
            <Crown className="w-4 h-4 text-purple-600 dark:text-purple-300" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              PRICING AND TEMPLATES
            </span>
          </div>
          <h1 className={`text-3xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Choose the Right Plan
          </h1>
          <p className={`text-lg md:text-xl mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Upgrade to unlock premium and elite templates, recurring invoices, and team features.
          </p>
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            All prices are in NGN (Paystack checkout).
          </p>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                billingCycle === 'monthly'
                  ? 'bg-primary-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                billingCycle === 'yearly'
                  ? 'bg-primary-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              Yearly
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">
                Recommended
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border ${
                plan.popular
                  ? 'relative border-2 border-purple-500 shadow-xl'
                  : isDarkMode
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-gray-200 bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-6 md:p-8">
                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className={`text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNgn(billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice)}
                    </span>
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && plan.monthlyEquivalent && (
                    <div className="text-xs text-emerald-600 mt-2">
                      ({formatNgn(plan.monthlyEquivalent)}/month equivalent)
                    </div>
                  )}
                </div>

                <button
                  onClick={() => startCheckout(plan.id)}
                  className={`w-full py-3 rounded-lg font-semibold mb-6 ${
                    plan.buttonVariant === 'primary'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {isSubscriptionActive && currentPlan === plan.id ? 'Current Plan' : plan.buttonText}
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {plan.popular && (
                  <div className="text-center mt-6 pt-4 border-t border-purple-200/40 dark:border-purple-800/30">
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold text-purple-600">1,200+ businesses</span> upgraded last month
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Template Tiers
            </h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Standard templates are included in all plans. Unlock Premium or Elite individually, or buy a bundle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templateTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border p-5 ${
                  isDarkMode
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className={`h-24 rounded-lg mb-4 bg-gradient-to-br ${tier.gradient}`} />
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {tier.name}
                    </h3>
                    <span className="text-sm text-purple-600 dark:text-purple-400">
                      {tier.description}
                    </span>
                  </div>
                  <span className="font-bold text-lg">{formatNgn(tier.price)}</span>
                </div>
                <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {tier.valueText}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Unlock for {formatNgn(tier.price)}
                </div>
                <div className="mt-1 text-xs text-emerald-600">
                  {tier.includedIn}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {templateBundles.map((bundle) => (
              <div
                key={bundle.id}
                className={`rounded-2xl p-6 border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${bundle.gradient}`}>
                  Bundle Unlock
                </div>
                <h3 className={`mt-3 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {bundle.name}
                </h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {bundle.description}
                </p>
                <div className={`mt-4 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatNgn(bundle.price)}
                </div>
                <div className="text-xs text-gray-500">One-time payment</div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl p-6 md:p-8 max-w-6xl mx-auto ${
          isDarkMode
            ? 'bg-gradient-to-r from-gray-800 to-gray-900'
            : 'bg-gradient-to-r from-gray-50 to-white'
        }`}
        >
          <h2 className={`text-2xl md:text-3xl font-bold mb-6 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
          >
            Optional Add-ons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {addOns.map((addon) => (
              <div key={addon.name} className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
                }`}
                >
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {addon.name}
                </h3>
                <div className="text-sm text-purple-600 dark:text-purple-400 mb-2">{formatNgn(addon.price)}{addon.suffix}</div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {addon.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl p-6 md:p-8 max-w-6xl mx-auto ${
          isDarkMode
            ? 'bg-gradient-to-r from-gray-800 to-gray-900'
            : 'bg-gradient-to-r from-gray-50 to-white'
        }`}
        >
          <h2 className={`text-2xl md:text-3xl font-bold mb-8 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
          >
            Why Upgrade?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'Exclusive Designs',
                description: 'Premium and elite templates you cannot access on Starter.'
              },
              {
                icon: Zap,
                title: 'Recurring Invoices',
                description: 'Automate billing and keep cash flow consistent.'
              },
              {
                icon: Shield,
                title: 'Priority Support',
                description: 'Faster help and dedicated guidance when it matters.'
              },
              {
                icon: Crown,
                title: 'Scale Confidently',
                description: 'Teams, API access, and white-label controls.'
              }
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
                }`}
                >
                  <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Pricing;
