import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Building, Check, Sparkles, Users, Zap } from 'lucide-react';
import { initializePublicSubscriptionPayment } from '../../services/billingService';
import { useToast } from '../../context/ToastContext';
import {
  savePendingCheckout
} from '../../utils/subscriptionCheckout';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 2000,
    yearlyPrice: 24000,
    monthlyEquivalent: 2000,
    description: 'For freelancers and solo operators',
    icon: Zap,
    popular: false,
    features: [
      '100 invoices/month',
      'Unlimited receipts',
      'Basic reporting',
      'Single user',
      '5 Standard templates',
      'No recurring invoices',
      'No API',
      'No team'
    ],
    ctaText: 'Pay for Starter',
    ctaLink: '/dashboard',
    accent: {
      icon: 'from-cyan-500 to-blue-600',
      border: 'border-slate-200/85 dark:border-slate-700/85 hover:border-cyan-300 dark:hover:border-cyan-500/70',
      glow: 'bg-cyan-500/20',
      check: 'text-cyan-600 dark:text-cyan-300',
      button:
        'bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-300 dark:hover:border-cyan-500/60 hover:text-cyan-700 dark:hover:text-cyan-200',
      badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200'
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 7000,
    yearlyPrice: 84000,
    monthlyEquivalent: 7000,
    description: 'For growing businesses and small teams',
    icon: Users,
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
    ctaText: 'Pay for Professional',
    ctaLink: '/dashboard',
    accent: {
      icon: 'from-blue-600 to-cyan-500',
      border: 'border-cyan-400/80 dark:border-cyan-500/75',
      glow: 'bg-cyan-500/30',
      check: 'text-cyan-600 dark:text-cyan-300',
      button:
        'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25',
      badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 30000,
    yearlyPrice: 360000,
    monthlyEquivalent: 30000,
    description: 'For larger businesses and advanced workflows',
    icon: Building,
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
    ctaText: 'Pay for Enterprise',
    ctaLink: '/dashboard',
    accent: {
      icon: 'from-slate-700 to-slate-900 dark:from-slate-500 dark:to-slate-700',
      border: 'border-slate-200/85 dark:border-slate-700/85 hover:border-slate-400 dark:hover:border-slate-500/70',
      glow: 'bg-slate-500/20',
      check: 'text-slate-600 dark:text-slate-300',
      button:
        'bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500/70',
      badge: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200'
    }
  }
];

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [checkoutLoadingPlan, setCheckoutLoadingPlan] = useState('');
  const { addToast } = useToast();

  const formatNgn = (value) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);

  const startCheckout = async ({ planId, email }) => {
    setCheckoutLoadingPlan(planId);
    try {
      const response = await initializePublicSubscriptionPayment({
        email,
        plan: planId,
        billingCycle
      });
      const data = response?.data || response || {};
      const authorizationUrl = data?.authorizationUrl || data?.authorization_url;
      const paymentReference = String(data?.reference || '').trim();
      if (!authorizationUrl) {
        throw new Error('Unable to start payment right now.');
      }
      savePendingCheckout({
        plan: planId,
        billingCycle,
        source: 'landing',
        checkoutEmail: email,
        paymentReference,
        paid: null
      });
      window.location.assign(authorizationUrl);
      return;
    } catch (error) {
      addToast(error?.response?.data?.error || error?.message || 'Failed to start checkout', 'error');
      setCheckoutLoadingPlan('');
    }
  };

  const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value || '').trim().toLowerCase());

  const resolveCheckoutEmail = () => {
    const saved = String(localStorage.getItem('ledgerly_checkout_email') || '').trim().toLowerCase();
    if (isValidEmail(saved)) {
      return saved;
    }

    const input = window.prompt('Enter your email for payment and account setup:', saved || '');
    if (input === null) return '';

    const normalized = String(input).trim().toLowerCase();
    if (!isValidEmail(normalized)) {
      addToast('Please enter a valid email address to continue.', 'error');
      return '';
    }

    localStorage.setItem('ledgerly_checkout_email', normalized);
    return normalized;
  };

  const handlePlanAction = async (plan) => {
    const email = resolveCheckoutEmail();
    if (!email) {
      return;
    }

    savePendingCheckout({
      plan: plan.id,
      billingCycle,
      source: 'landing',
      checkoutEmail: email,
      paid: null
    });
    await startCheckout({ planId: plan.id, email });
  };

  return (
    <motion.section
      id="pricing"
      className="relative py-20 bg-gradient-to-b from-[#f5f7ff] to-[#eef2ff] dark:from-slate-950 dark:to-slate-900"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45 }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs md:text-sm font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-cyan-300">
            Plans & Pricing
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
            Pricing that scales with
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
              {' '}your invoice volume
            </span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            All plans include core invoicing and receipts. Choose monthly or yearly billing in NGN.
          </p>

          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-slate-200/85 dark:border-slate-700/85 bg-white/90 dark:bg-slate-900/80 p-1.5 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Yearly
            </button>
            <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 px-3 py-1 text-xs font-semibold">
              Save more yearly
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
          {PLANS.map((plan, idx) => {
            const Icon = plan.icon;
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <motion.div
                key={plan.id}
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white/92 dark:bg-slate-900/75 p-6 md:p-7 backdrop-blur-sm transition-all duration-300 ${plan.accent.border} ${
                  plan.popular
                    ? 'md:-translate-y-2 shadow-[0_26px_65px_-40px_rgba(6,182,212,0.9)]'
                    : 'shadow-[0_24px_60px_-42px_rgba(15,23,42,0.95)]'
                }`}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.35, delay: idx * 0.07 }}
                whileHover={{ y: -8 }}
              >
                <div className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl transition-opacity duration-300 opacity-60 group-hover:opacity-95 ${plan.accent.glow}`} />

                {plan.popular && (
                  <div className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    Most Popular
                  </div>
                )}

                <div className="relative z-10">
                  <div className="mb-5 flex items-center justify-between">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${plan.accent.icon} flex items-center justify-center shadow-lg shadow-slate-900/10`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${plan.accent.badge}`}>
                      {plan.popular ? 'Recommended' : 'Popular choice'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>

                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-4xl md:text-5xl font-bold leading-none text-slate-900 dark:text-white">
                      {formatNgn(price)}
                    </span>
                    <span className="pb-1 text-sm text-slate-500 dark:text-slate-400">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>

                  {billingCycle === 'yearly' && (
                    <p className="mt-2 text-sm text-cyan-700 dark:text-cyan-300">
                      {formatNgn(plan.monthlyEquivalent)}/month equivalent
                    </p>
                  )}
                </div>

                <ul className="relative z-10 mt-6 space-y-3.5">
                  {plan.features.map((feature) => (
                    <li key={`${plan.id}-${feature}`} className="flex items-start gap-3">
                      <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${plan.accent.check}`} />
                      <span className="text-sm text-slate-700 dark:text-slate-200">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="relative z-10 mt-7 pt-6 border-t border-slate-200/80 dark:border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => handlePlanAction(plan)}
                    disabled={checkoutLoadingPlan === plan.id}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 ${plan.accent.button}`}
                  >
                    {checkoutLoadingPlan === plan.id ? 'Starting Checkout...' : plan.ctaText}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/85 dark:bg-slate-900/75 px-4 py-2 text-sm text-slate-600 dark:text-slate-300">
            <span>All plans include secure cloud backups and invoice analytics.</span>
            <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">
              NGN pricing
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Pricing;
