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
  const [billingCycle, setBillingCycle] = useState('monthly');
  const { addToast } = useToast();
  const { accountInfo } = useAccount();
  const currentPlan = useMemo(() => normalizePlanId(accountInfo?.plan), [accountInfo]);

  const toYearlyPrice = (monthly) => Number((Number(monthly) * 12 * 0.8).toFixed(2));

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'For freelancers and solo operators',
      monthlyPrice: 9,
      yearlyPrice: toYearlyPrice(9),
      popular: false,
      features: [
        '100 invoices per month',
        'Unlimited receipts',
        'Basic reporting',
        'Email support',
        'Single user',
        'Mobile app access',
        'Access to 5 Standard templates only',
        'No recurring invoices',
        'No API access',
        'No team access'
      ],
      buttonText: 'Choose Starter',
      buttonVariant: 'outline'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'For growing businesses and small teams',
      monthlyPrice: 29,
      yearlyPrice: toYearlyPrice(29),
      popular: true,
      features: [
        'Unlimited invoices',
        'Advanced reporting',
        '5 team members',
        'Priority support',
        'Recurring invoices',
        'Inventory management',
        'Customer database',
        'Multi-currency',
        'API access (limited)',
        'Access to ALL Standard + Premium templates'
      ],
      buttonText: 'Start Professional',
      buttonVariant: 'primary'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For larger businesses and advanced workflows',
      monthlyPrice: 79,
      yearlyPrice: toYearlyPrice(79),
      popular: false,
      features: [
        'Everything in Professional',
        '20 team members',
        'Full API access',
        'White-label branding',
        'Custom workflows',
        'Dedicated manager',
        'SLA guarantee',
        'Access to ALL templates including Elite'
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'primary'
    }
  ];

  const templateTiers = [
    {
      name: 'Standard',
      price: '$5',
      description: 'Clean, professional templates included in Starter+',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Premium',
      price: '$12',
      description: 'Advanced designs included in Professional+',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Elite',
      price: '$25',
      description: 'Top-tier designs included in Enterprise',
      gradient: 'from-amber-500 to-yellow-500'
    }
  ];

  const addOns = [
    {
      name: 'White-label Add-on',
      price: '$49/month',
      description: 'Remove Ledgerly branding (Professional only).'
    },
    {
      name: 'Extra Team Member',
      price: '$5/month',
      description: 'Add additional seats beyond your plan.'
    },
    {
      name: 'Advanced Analytics AI',
      price: '$10/month',
      description: 'AI insights and forecasting.'
    }
  ];

  const bundle = {
    name: 'All Templates Lifetime Bundle',
    price: '$79',
    description: 'Unlock all templates forever. Non-refundable.'
  };

  const isYearly = billingCycle === 'yearly';
  const periodLabel = isYearly ? 'per year' : 'per month';

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
        {/* Hero */}
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

          <div className="flex items-center justify-center gap-2">
            <button
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
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const savings = isYearly ? 'Save ~2 months' : '';

            return (
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
                        ${price}
                      </span>
                      <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        /{periodLabel}
                      </span>
                    </div>
                    {isYearly && (
                      <div className="text-xs text-emerald-600 mt-2">
                        {savings}
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
                    {currentPlan === plan.id ? 'Current Plan' : plan.buttonText}
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
            );
          })}
        </div>

        {/* Template Tiers */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Template Tiers
            </h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Purchase templates individually or unlock them with a plan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <span className="font-bold text-lg">{tier.price}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Lifetime unlock per template
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-6 rounded-2xl p-6 border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {bundle.name}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {bundle.description}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {bundle.price}
                </div>
                <div className="text-xs text-gray-500">One-time payment</div>
              </div>
            </div>
          </div>
        </div>

        {/* Add-ons */}
        <div className={`rounded-2xl p-6 md:p-8 max-w-6xl mx-auto ${
          isDarkMode
            ? 'bg-gradient-to-r from-gray-800 to-gray-900'
            : 'bg-gradient-to-r from-gray-50 to-white'
        }`}>
          <h2 className={`text-2xl md:text-3xl font-bold mb-6 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Optional Add-ons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {addOns.map((addon) => (
              <div key={addon.name} className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
                }`}>
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {addon.name}
                </h3>
                <div className="text-sm text-purple-600 dark:text-purple-400 mb-2">{addon.price}</div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {addon.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Upgrade */}
        <div className={`rounded-2xl p-6 md:p-8 max-w-6xl mx-auto ${
          isDarkMode
            ? 'bg-gradient-to-r from-gray-800 to-gray-900'
            : 'bg-gradient-to-r from-gray-50 to-white'
        }`}>
          <h2 className={`text-2xl md:text-3xl font-bold mb-8 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
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
                }`}>
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
