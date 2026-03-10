import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import {
  buildCheckoutParams,
  clearPendingCheckout,
  getPendingCheckout,
  normalizeCheckoutBillingCycle,
  normalizeCheckoutPlan,
  savePendingCheckout
} from '../../utils/subscriptionCheckout';
import { 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  ArrowRight, 
  AlertCircle,
  Building,
  DollarSign,
  BarChart3,
  Users
} from 'lucide-react';
import logo from '../../assets/icons/ledgerly-logo.webp';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state from Redux
  const { loading, error } = useSelector((state) => state.auth);
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isPaidFlow = searchParams.get('paid') === '1';
  const queryCheckoutEmail = String(searchParams.get('checkoutEmail') || '').trim().toLowerCase();
  const paymentReference = String(searchParams.get('reference') || '').trim();
  const hasPaymentReference = Boolean(paymentReference);
  const queryPlan = normalizeCheckoutPlan(searchParams.get('selectedPlan'));
  const queryBillingCycle = normalizeCheckoutBillingCycle(searchParams.get('billingCycle'));
  const pendingCheckout = useMemo(() => getPendingCheckout(), [location.search]);
  const selectedPlan = queryPlan || pendingCheckout?.plan || '';
  const selectedBillingCycle = queryPlan
    ? queryBillingCycle
    : normalizeCheckoutBillingCycle(pendingCheckout?.billingCycle);
  const hasPendingCheckout = Boolean(selectedPlan);
  const selectedPlanLabel = selectedPlan
    ? `${selectedPlan.charAt(0).toUpperCase()}${selectedPlan.slice(1)}`
    : '';
  const checkoutParams = buildCheckoutParams({
    plan: selectedPlan,
    billingCycle: selectedBillingCycle,
    checkout: hasPendingCheckout && !isPaidFlow && !hasPaymentReference
  });
  if (isPaidFlow) {
    checkoutParams.set('paid', '1');
  }
  if (queryCheckoutEmail) {
    checkoutParams.set('checkoutEmail', queryCheckoutEmail);
  }
  if (hasPaymentReference) {
    checkoutParams.set('reference', paymentReference);
  }
  const checkoutQuery = checkoutParams.toString();
  const signupPath = checkoutQuery ? `/signup?${checkoutQuery}` : '/signup';
  const getVerifyEmailPath = (emailValue) => {
    const params = buildCheckoutParams({
      plan: selectedPlan,
      billingCycle: selectedBillingCycle,
      checkout: hasPendingCheckout && !isPaidFlow && !hasPaymentReference
    });
    if (isPaidFlow) {
      params.set('paid', '1');
    }
    if (queryCheckoutEmail) {
      params.set('checkoutEmail', queryCheckoutEmail);
    }
    if (hasPaymentReference) {
      params.set('reference', paymentReference);
    }
    params.set('verifyEmail', String(emailValue || '').trim().toLowerCase());
    return `/signup?${params.toString()}`;
  };

  useEffect(() => {
    if (!queryPlan) return;
    savePendingCheckout({
      plan: queryPlan,
      billingCycle: queryBillingCycle,
      source: 'landing'
    });
  }, [queryPlan, queryBillingCycle]);

  useEffect(() => {
    if (!queryCheckoutEmail) return;
    setEmail((prev) => prev || queryCheckoutEmail);
  }, [queryCheckoutEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      dispatch(clearError());
      // You can set a local error here if needed
      return;
    }

    try {
      const result = await dispatch(login({ email, password }));
      
      if (result.meta.requestStatus === 'fulfilled') {
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        if (hasPendingCheckout && !isPaidFlow && !hasPaymentReference) {
          navigate(`/payments/pricing?${checkoutQuery}`);
          return;
        }

        if (isPaidFlow || hasPaymentReference) {
          clearPendingCheckout();
        }

        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const clearErrors = () => {
    dispatch(clearError());
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-cyan-50 to-blue-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/50 md:p-6">
      <div className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/20" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-600/20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(56,189,248,0.16),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.14),transparent_40%)]" />

      <div className="relative flex w-full max-w-6xl overflow-hidden rounded-3xl border border-cyan-100/70 bg-white/85 shadow-[0_32px_80px_-30px_rgba(2,132,199,0.55)] backdrop-blur-xl dark:border-cyan-900/40 dark:bg-slate-900/80 dark:shadow-[0_34px_84px_-34px_rgba(14,116,144,0.7)]">
        {/* Left Side - Visual */}
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 p-10 text-white lg:flex">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.24),transparent_42%),radial-gradient(circle_at_85%_70%,rgba(255,255,255,0.12),transparent_45%)]" />
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <img loading="eager" decoding="async" src={logo} alt="Ledgerly logo" className="h-9 w-9 object-contain" />
            </div>
            <h1 className="mb-2 text-4xl font-bold">Invoicing & Inventory</h1>
            <p className="text-lg text-cyan-50/90">
              Professional tools for billing, payments, and stock control
            </p>
          </div>

          <div className="relative space-y-4">
            <div className="flex items-center rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="mr-4 rounded-full bg-white/20 p-2">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Create Professional Invoices</h3>
                <p className="text-sm text-cyan-50/85">Generate invoices in seconds with customizable templates</p>
              </div>
            </div>

            <div className="flex items-center rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="mr-4 rounded-full bg-white/20 p-2">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Track Business Analytics</h3>
                <p className="text-sm text-cyan-50/85">Monitor sales, expenses, and cash flow in real-time</p>
              </div>
            </div>

            <div className="flex items-center rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="mr-4 rounded-full bg-white/20 p-2">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Customers & Products</h3>
                <p className="text-sm text-cyan-50/85">Organize customer data and inventory efficiently</p>
              </div>
            </div>
          </div>

          <div className="relative mt-8 border-t border-white/25 pt-6">
            <p className="text-sm text-cyan-50/90">Join thousands of businesses using Ledgerly</p>
            <div className="flex items-center mt-3 space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-cyan-700 bg-cyan-300/80"
                  />
                ))}
              </div>
              <p className="text-sm text-cyan-50/90">5000+ businesses trust us</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full bg-white/60 p-8 dark:bg-slate-950/30 lg:w-1/2 md:p-12">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 shadow-lg shadow-cyan-500/30 lg:hidden">
              <img loading="eager" decoding="async" src={logo} alt="Ledgerly logo" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Sign in to your Ledgerly account
            </p>
            {hasPendingCheckout && (
              <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-left dark:border-cyan-800 dark:bg-cyan-950/35">
                <p className="text-sm text-cyan-800 dark:text-cyan-200">
                  {isPaidFlow
                    ? <>Payment received for <strong>{selectedPlanLabel}</strong> ({selectedBillingCycle}). Sign in to continue setup.</>
                    : hasPaymentReference
                    ? <>Payment reference detected for <strong>{selectedPlanLabel}</strong> ({selectedBillingCycle}). Sign in to continue setup.</>
                    : <>Selected plan: <strong>{selectedPlanLabel}</strong> ({selectedBillingCycle}). Sign in to continue checkout.</>}
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  <div className="mt-2 flex items-center space-x-4">
                    <button
                      onClick={clearErrors}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                    >
                      Dismiss
                    </button>
                    {error.includes('Invalid credentials') && (
                      <Link 
                        to={signupPath} 
                        className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium"
                        onClick={clearErrors}
                      >
                        Create account
                      </Link>
                    )}
                    {error.includes('User no longer exists') && (
                      <Link 
                        to="/contact" 
                        className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium"
                        onClick={clearErrors}
                      >
                        Contact support
                      </Link>
                    )}
                    {error.toLowerCase().includes('verify your email') && email.trim() && (
                      <Link
                        to={getVerifyEmailPath(email)}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium"
                        onClick={clearErrors}
                      >
                        Verify email
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <div className="rounded-3xl border border-cyan-100/80 bg-white/80 p-6 shadow-[0_24px_50px_-34px_rgba(2,132,199,0.5)] backdrop-blur-sm dark:border-cyan-900/40 dark:bg-slate-900/75 dark:shadow-[0_24px_50px_-34px_rgba(6,182,212,0.45)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearErrors();
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 pl-12 text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800/85 dark:text-white dark:placeholder-slate-400 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
                    placeholder="you@company.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearErrors();
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 pl-12 pr-12 text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800/85 dark:text-white dark:placeholder-slate-400 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary-600 dark:text-primary-500 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600 rounded"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Remember me</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                  onClick={clearErrors}
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 px-8 py-4 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:from-cyan-500 hover:via-sky-500 hover:to-blue-600 hover:shadow-xl hover:shadow-cyan-500/40 dark:from-cyan-500 dark:via-sky-500 dark:to-blue-600 ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Don't have an account?
                </p>
                <Link 
                  to={signupPath} 
                  className="inline-block w-full rounded-xl border border-cyan-600 py-3 text-center font-medium text-cyan-700 transition hover:bg-cyan-50 dark:border-cyan-500 dark:text-cyan-300 dark:hover:bg-cyan-900/20"
                  onClick={clearErrors}
                >
                  Create Ledgerly Account
                </Link>
              </div>
            </div>

            {/* Social Login Options */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white/80 px-4 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </button>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your data is protected with bank-level encryption. 
              <Link to="/security" className="text-primary-600 dark:text-primary-400 hover:underline ml-1">
                Learn more
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


