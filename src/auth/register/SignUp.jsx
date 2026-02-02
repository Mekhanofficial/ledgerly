import { useState, useEffect } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError } from "../../store/slices/authSlice";
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
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { loading, error: apiError } = useSelector((state) => state.auth);

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
          // Only these fields are expected by backend register function
          // Remove other fields that backend doesn't accept
        };
        
        console.log('Submitting registration to backend:', userData);
        
        // Dispatch register action to Redux
        const result = await dispatch(register(userData));
        
        console.log('Registration result:', result);
        
        if (result.meta.requestStatus === 'fulfilled') {
          setRegistrationSuccess(true);
          
          // Auto-redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          console.error('Registration failed:', result.payload);
        }
      } catch (err) {
        console.error('Registration submission error:', err);
      }
    }
  };

  // If registration was successful, show success message
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to InvoiceFlow!
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your business account has been created successfully. You're now ready to start managing your invoices, customers, and inventory.
            </p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Account Details:</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Business:</strong> {formData.businessName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Email:</strong> {formData.email}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Plan:</strong> Free Trial (30 days)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Redirecting to dashboard...
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-300"
                >
                  Go to Dashboard Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step indicators
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === currentStep 
              ? 'bg-primary-600 text-white' 
              : step < currentStep 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }`}>
            {step}
          </div>
          {step < 2 && (
            <div className={`w-16 h-1 mx-2 ${
              step < currentStep ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'
            }`} />
          )}
        </div>
      ))}
      <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
        Step {currentStep} of 2
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white">
          <div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">InvoiceFlow</h1>
            <p className="text-primary-100 text-lg">
              Professional Invoicing & Inventory Management
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center">
              <div className="bg-primary-500 rounded-full p-2 mr-4">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Create Professional Invoices</h3>
                <p className="text-primary-200 text-sm">Generate invoices in seconds with customizable templates</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="bg-primary-500 rounded-full p-2 mr-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Track Business Analytics</h3>
                <p className="text-primary-200 text-sm">Monitor sales, expenses, and cash flow in real-time</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="bg-primary-500 rounded-full p-2 mr-4">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Secure & Reliable</h3>
                <p className="text-primary-200 text-sm">Bank-level security with automatic backups</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-primary-400 pt-6">
            <p className="text-sm text-primary-200 mb-3">Join thousands of businesses using InvoiceFlow</p>
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className="w-8 h-8 rounded-full bg-primary-400 border-2 border-primary-600"
                  />
                ))}
              </div>
              <p className="text-sm text-primary-200">5000+ businesses trust us</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8">
          <StepIndicator />
          
          {/* API Error Message */}
          {apiError && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-700 dark:text-red-300">{apiError}</p>
                  <div className="mt-2 flex items-center space-x-4">
                    <button
                      onClick={() => dispatch(clearError())}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                    >
                      Dismiss
                    </button>
                    {apiError.includes("already exists") && (
                      <Link 
                        to="/login" 
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {currentStep === 1 ? "Create Your Account" : "Setup Your Business"}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {currentStep === 1 
                ? "Start your 30-day free trial. No credit card required." 
                : "Tell us about your business to get started"}
            </p>
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
                        className={`w-full px-4 py-3 rounded-xl border ${
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
                      <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">InvoiceFlow Features:</h4>
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
                      </a>. I understand that InvoiceFlow will process my data in accordance with these terms.
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
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