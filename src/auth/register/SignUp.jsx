import { useState, useEffect } from "react"; 
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  register,
  clearError,
  clearPendingVerification,
  resendEmailOtp,
  verifyEmailOtp
} from "../../store/slices/authSlice";
import {
  buildCheckoutParams,
  getPendingCheckout,
  normalizeCheckoutBillingCycle,
  normalizeCheckoutEmail,
  normalizeCheckoutPaid,
  normalizeCheckoutPlan,
  normalizeCheckoutReference,
  savePendingCheckout
} from "../../utils/subscriptionCheckout";
import countryData from "../../data/CountryData.json";
import {
  FileText, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Building,
  Mail,
  Phone,
  Globe,
  DollarSign,
  User,
  Shield,
  TrendingUp
} from 'lucide-react';
import logo from '../../assets/icons/ledger-icon.png';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    country: "United States",
    currencyCode: "USD",
    currencySymbol: "$",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessType: "",
    industry: "",
    acceptTerms: false,
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpNotice, setOtpNotice] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const accessMessage = location.state?.registerRequired
    ? (location.state?.accessMessage || 'Create your account to continue.')
    : '';
  const signupParams = new URLSearchParams(location.search);
  const queryVerificationEmail = signupParams.get('verifyEmail');
  const queryPaid = normalizeCheckoutPaid(signupParams.get('paid'));
  const queryCheckoutEmail = normalizeCheckoutEmail(
    signupParams.get('checkoutEmail') || signupParams.get('email')
  );
  const queryPaymentReference = normalizeCheckoutReference(
    signupParams.get('reference')
    || signupParams.get('trxref')
    || signupParams.get('ref')
    || signupParams.get('paymentReference')
  );
  const queryPlan = normalizeCheckoutPlan(signupParams.get('selectedPlan'));
  const queryBillingCycle = normalizeCheckoutBillingCycle(signupParams.get('billingCycle'));
  const pendingCheckout = getPendingCheckout();
  const checkoutEmail = queryCheckoutEmail || pendingCheckout?.checkoutEmail || '';
  const paymentReference = queryPaymentReference || pendingCheckout?.paymentReference || '';
  const hasPaymentReference = Boolean(paymentReference);
  const isPaidFlow = queryPaid === true || pendingCheckout?.paid === true;
  const selectedPlan = queryPlan || pendingCheckout?.plan || '';
  const selectedBillingCycle = queryPlan
    ? queryBillingCycle
    : normalizeCheckoutBillingCycle(pendingCheckout?.billingCycle);
  const hasPendingCheckout = Boolean(selectedPlan);
  const selectedPlanLabel = selectedPlan
    ? `${selectedPlan.charAt(0).toUpperCase()}${selectedPlan.slice(1)}`
    : '';
  const loginCheckoutParams = buildCheckoutParams({
    plan: selectedPlan,
    billingCycle: selectedBillingCycle,
    checkout: hasPendingCheckout && !isPaidFlow && !hasPaymentReference
  });
  if (isPaidFlow) {
    loginCheckoutParams.set('paid', '1');
  }
  if (checkoutEmail) {
    loginCheckoutParams.set('checkoutEmail', checkoutEmail);
  }
  if (hasPaymentReference) {
    loginCheckoutParams.set('reference', paymentReference);
  }
  const loginPath = loginCheckoutParams.toString() ? `/login?${loginCheckoutParams.toString()}` : '/login';
  
  const { loading, error: apiError, pendingVerification } = useSelector((state) => state.auth);
  const apiErrorMessage =
    typeof apiError === 'string'
      ? apiError
      : (apiError && typeof apiError.message === 'string' ? apiError.message : '');
  const hasExistingAccountError = apiErrorMessage.toLowerCase().includes('already exists');

  useEffect(() => {
    if (!queryPlan) return;
    savePendingCheckout({
      plan: queryPlan,
      billingCycle: queryBillingCycle,
      source: 'landing',
      checkoutEmail,
      paymentReference,
      paid: isPaidFlow
    });
  }, [queryPlan, queryBillingCycle, checkoutEmail, paymentReference, isPaidFlow]);

  useEffect(() => {
    if (pendingVerification?.email) {
      setVerificationEmail(pendingVerification.email);
      setRegistrationSuccess(true);
    }
  }, [pendingVerification]);

  useEffect(() => {
    if (queryVerificationEmail) {
      setVerificationEmail(queryVerificationEmail.trim().toLowerCase());
      setRegistrationSuccess(true);
    }
  }, [queryVerificationEmail]);

  useEffect(() => {
    if (!checkoutEmail) return;
    setFormData((prev) => (prev.email ? prev : { ...prev, email: checkoutEmail }));
  }, [checkoutEmail]);

  useEffect(() => {
    if (!otpVerified) return undefined;
    if (redirectSeconds <= 0) {
      navigate(loginPath);
      return undefined;
    }

    const timer = setTimeout(() => {
      setRedirectSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [otpVerified, redirectSeconds, navigate, loginPath]);

  // Auto-populate currency when country is selected
  useEffect(() => {
    if (formData.country) {
      const selectedCountry = countryData.find(
        (country) => country.name === formData.country
      );
      if (selectedCountry) {
        setFormData((prevData) => ({
          ...prevData,
          currencyCode: selectedCountry.currencyCode || "USD",
          currencySymbol: selectedCountry.currencySymbol || "$",
        }));
      }
    }
  }, [formData.country]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    
    // Clear API error when user starts typing
    if (apiError) {
      dispatch(clearError());
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!formData.country) {
      newErrors.country = "Please select your country";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (!formData.businessType) {
      newErrors.businessType = "Please select business type";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep === 2 && validateStep2()) {
      try {
        // Prepare data EXACTLY as backend expects
        const userData = {
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          businessName: formData.businessName.trim(),
          country: formData.country,
          currencyCode: formData.currencyCode,
          // Backend supports optional paymentReference for paid landing signups
        };

        if (paymentReference) {
          userData.paymentReference = paymentReference;
        }
        
        console.log('Submitting registration to backend:', userData);
        
        // Dispatch register action to Redux
        const result = await dispatch(register(userData));
        
        console.log('Registration result:', result);
        
        if (result.meta.requestStatus === 'fulfilled') {
          const emailToVerify = result.payload?.pendingVerification?.email || userData.email;
          const otpSent = result.payload?.pendingVerification?.otpSent !== false;
          const otpError = result.payload?.pendingVerification?.otpError;
          setVerificationEmail(emailToVerify);
          setRegistrationSuccess(true);
          setOtpCode('');
          setOtpVerified(false);
          setRedirectSeconds(0);
          setOtpNotice(
            otpSent
              ? (result.payload?.message || 'A verification code has been sent to your email.')
              : (otpError || result.payload?.message || 'Account created, but OTP could not be sent. Please click "Resend OTP".')
          );
        } else {
          console.error('Registration failed:', result.payload);
        }
      } catch (err) {
        console.error('Registration submission error:', err);
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpVerified) return;

    if (!otpCode.trim()) {
      setOtpNotice('Please enter the verification code.');
      return;
    }

    const result = await dispatch(
      verifyEmailOtp({
        email: verificationEmail,
        otp: otpCode.trim()
      })
    );

    if (result.meta.requestStatus === 'fulfilled') {
      setOtpNotice('Email verified successfully.');
      setOtpVerified(true);
      setRedirectSeconds(3);
      dispatch(clearPendingVerification());
    }
  };

  const handleResendOtp = async () => {
    if (!verificationEmail || otpVerified) return;
    const result = await dispatch(resendEmailOtp(verificationEmail));
    if (result.meta.requestStatus === 'fulfilled') {
      const otpSent = result.payload?.data?.otpSent !== false;
      const otpError = result.payload?.data?.otpError;
      setOtpVerified(false);
      setRedirectSeconds(0);
      setOtpNotice(
        otpSent
          ? (result.payload?.message || 'Verification code sent.')
          : (otpError || result.payload?.message || 'We could not send verification code right now. Please try again shortly.')
      );
    }
  };

  // If registration was successful, show success message
  if (registrationSuccess) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-cyan-50 to-blue-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/50">
        <div className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/20" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-600/20" />
        <div className="relative w-full max-w-lg">
          <div className="rounded-3xl border border-cyan-100/80 bg-white/85 p-8 shadow-[0_28px_64px_-32px_rgba(2,132,199,0.58)] backdrop-blur-sm dark:border-cyan-900/40 dark:bg-slate-900/85 dark:shadow-[0_30px_70px_-34px_rgba(6,182,212,0.6)]">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              Verify Your Email
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
              Enter the 6-digit code sent to <strong>{verificationEmail || formData.email}</strong> to activate your Ledgerly account.
            </p>

            {apiErrorMessage && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <p className="text-sm text-red-700 dark:text-red-300">{apiErrorMessage}</p>
              </div>
            )}

            {otpNotice && (
              <div className={`mb-4 border rounded-xl p-3 ${
                otpVerified
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                  : 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
              }`}>
                <p className={`text-sm ${
                  otpVerified
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-primary-700 dark:text-primary-300'
                }`}>
                  {otpNotice}
                </p>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otpCode}
                onChange={(event) => {
                  setOtpCode(event.target.value.replace(/\D/g, ''));
                  if (apiError) dispatch(clearError());
                }}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white placeholder-gray-500 dark:placeholder-gray-400 tracking-[0.4em] text-center text-lg"
                disabled={loading || otpVerified}
              />

              <button
                type="submit"
                disabled={loading || otpCode.length < 6 || otpVerified}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : otpVerified ? 'Verified' : 'Verify Email'}
              </button>
            </form>

            {otpVerified && (
              <p className="mt-3 text-center text-sm text-emerald-600 dark:text-emerald-300">
                Redirecting to login in {redirectSeconds}s...
              </p>
            )}

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || otpVerified}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium disabled:opacity-70"
              >
                Resend code
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(clearPendingVerification());
                  setRegistrationSuccess(false);
                  setOtpCode('');
                  setOtpNotice('');
                  setOtpVerified(false);
                  setRedirectSeconds(0);
                }}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
              >
                Back to signup
              </button>
              <Link to={loginPath} className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium">
                Go to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step indicators
  const StepIndicator = () => (
    <div className="mb-8 rounded-2xl border border-cyan-100/80 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-cyan-900/40 dark:bg-slate-900/60">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center">
          {[1, 2].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                step === currentStep
                  ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white'
                  : step < currentStep
                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200'
                    : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
              }`}>
                {step}
              </div>
              {step < 2 && (
                <div className={`mx-2 h-1 w-16 rounded-full ${
                  step < currentStep
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Step {currentStep} of 2
        </span>
      </div>
    </div>
  );

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
            <img
              loading="eager"
              decoding="async"
              src={logo}
              alt="Ledgerly logo"
              className="mb-4 h-14 w-14 object-contain"
            />
            <h1 className="mb-2 text-4xl font-bold">Invoicing & Inventory</h1>
            <p className="text-lg text-cyan-50/90">
              Professional tools for billing, payments, and stock control
            </p>
          </div>

          <div className="relative space-y-4">
            <div className="flex items-center rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="mr-4 rounded-full bg-white/20 p-2">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Create Professional Invoices</h3>
                <p className="text-sm text-cyan-50/85">Generate invoices in seconds with customizable templates</p>
              </div>
            </div>

            <div className="flex items-center rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="mr-4 rounded-full bg-white/20 p-2">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Track Business Analytics</h3>
                <p className="text-sm text-cyan-50/85">Monitor sales, expenses, and cash flow in real-time</p>
              </div>
            </div>

            <div className="flex items-center rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="mr-4 rounded-full bg-white/20 p-2">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Secure & Reliable</h3>
                <p className="text-sm text-cyan-50/85">Bank-level security with automatic backups</p>
              </div>
            </div>
          </div>

          <div className="relative mt-8 border-t border-white/25 pt-6">
            <p className="mb-3 text-sm text-cyan-50/90">Join thousands of businesses using Ledgerly</p>
            <div className="flex items-center space-x-4">
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

        {/* Right Side - Form */}
        <div className="w-full bg-white/60 p-8 dark:bg-slate-950/30 lg:w-1/2">
          <StepIndicator />

          {accessMessage && (
            <div className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 dark:border-cyan-800 dark:bg-cyan-950/35">
              <p className="text-sm text-cyan-800 dark:text-cyan-200">{accessMessage}</p>
            </div>
          )}
          
          {/* API Error Message */}
          {apiErrorMessage && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-700 dark:text-red-300">{apiErrorMessage}</p>
                  <div className="mt-2 flex items-center space-x-4">
                    <button
                      onClick={() => dispatch(clearError())}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                    >
                      Dismiss
                    </button>
                    {hasExistingAccountError && (
                      <Link 
                        to={loginPath} 
                        className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium"
                        onClick={() => dispatch(clearError())}
                      >
                        Go to Login
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {currentStep === 1 ? "Create Your Account" : "Setup Your Business"}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              {currentStep === 1 
                ? (isPaidFlow
                  ? "Your payment was successful. Finish creating your account."
                  : "Start your 30-day free trial. No credit card required.")
                : "Tell us about your business to get started"}
            </p>
            {isPaidFlow && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left dark:border-emerald-800 dark:bg-emerald-950/35">
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  Payment received. Complete signup to continue with your selected plan.
                </p>
                {paymentReference && (
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                    Ref: {paymentReference}
                  </p>
                )}
              </div>
            )}
            {hasPendingCheckout && (
              <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-left dark:border-cyan-800 dark:bg-cyan-950/35">
                <p className="text-sm text-cyan-800 dark:text-cyan-200">
                  Selected plan: <strong>{selectedPlanLabel}</strong> ({selectedBillingCycle}). We will keep this selection after signup.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 ? (
              <>
                {/* Step 1: Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="firstName"
                        className={`w-full px-4 py-3 pl-11 rounded-xl border ${
                          errors.firstName ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                        } focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="lastName"
                        className={`w-full px-4 py-3 pl-11 rounded-xl border ${
                          errors.lastName ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                        } focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      className={`w-full px-4 py-3 pl-11 rounded-xl border ${
                        errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                      } focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="phone"
                      className={`w-full px-4 py-3 pl-11 rounded-xl border ${
                        errors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                      } focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.phone}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.gender ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                      } focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white`}
                      onChange={handleChange}
                      value={formData.gender}
                      required
                      disabled={loading}
                    >
                      <option value="" className="text-gray-500 dark:text-gray-400">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.gender}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="country"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                          errors.country ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                        } focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white`}
                        onChange={handleChange}
                        value={formData.country}
                        required
                        disabled={loading}
                      >
                        <option value="" className="text-gray-500 dark:text-gray-400">Select country</option>
                        {countryData.map((country) => (
                          <option key={country.name} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      <Globe className="pointer-events-none absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.country}</p>
                    )}
                  </div>
                </div>

                {formData.currencyCode && (
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                      <p className="text-sm text-primary-700 dark:text-primary-300">
                        Selected currency: <strong>{formData.currencyCode}</strong> ({formData.currencySymbol})
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                      } focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-12`}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 6 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                      } focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-12`}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Step 2: Business Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="businessName"
                      className={`w-full px-4 py-3 pl-11 rounded-xl border ${
                        errors.businessName ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                      } focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                      placeholder="Your Business Name"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                      {errors.businessName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="businessType"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.businessType ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                    } focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white`}
                    onChange={handleChange}
                    value={formData.businessType}
                    required
                    disabled={loading}
                  >
                    <option value="" className="text-gray-500 dark:text-gray-400">Select business type</option>
                    <option value="retail">Retail Store</option>
                    <option value="service">Service Provider</option>
                    <option value="freelance">Freelancer/Consultant</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="wholesale">Wholesale/Distribution</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="restaurant">Restaurant/Food Service</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.businessType && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.businessType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Industry (Optional)
                  </label>
                  <select
                    name="industry"
                    className={`w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white`}
                    onChange={handleChange}
                    value={formData.industry}
                    disabled={loading}
                  >
                    <option value="" className="text-gray-500 dark:text-gray-400">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="finance">Finance</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="construction">Construction</option>
                    <option value="transportation">Transportation</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="non_profit">Non-profit</option>
                  </select>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Ledgerly Features:</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                      Professional Invoice Templates
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                      Inventory Management
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                      Customer Management
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                      Reports & Analytics
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                      Mobile App Access
                    </li>
                  </ul>
                </div>

                <div className={`p-4 rounded-lg border ${
                  errors.acceptTerms 
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-800' 
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700'
                }`}>
                  <label className="flex items-start">
                    <input
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 dark:text-primary-500 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600 rounded mt-1"
                      required
                      disabled={loading}
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      I agree to the{" "}
                      <a href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                        Privacy Policy
                      </a>. I understand that Ledgerly will process my data in accordance with these terms.
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">{errors.acceptTerms}</p>
                  )}
                </div>
              </>
            )}

            <div className="flex space-x-4">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={loading}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Back
                </button>
              )}
              
              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={loading}
                  className="flex-1 flex justify-center items-center py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 transition"
                >
                  Continue to Business Setup
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg font-medium text-white ${
                    loading
                      ? "bg-primary-400 dark:bg-primary-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-primary-500/30 dark:focus:ring-primary-400/30 transition-all duration-300"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

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
              <div className="inline-flex w-full justify-center rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </div>

              <div className="inline-flex w-full justify-center rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.016 4.388 11.003 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.017 1.792-4.684 4.533-4.684c1.313 0 2.686.236 2.686.236v2.963h-1.514c-1.49 0-1.955.931-1.955 1.887v2.261h3.328l-.532 3.49h-2.796V24C19.612 23.076 24 18.089 24 12.073z" />
                </svg>
                Facebook
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to={loginPath}
                className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;


