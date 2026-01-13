import { useState, useEffect } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import countryData from "../../data/countryData.json";
import { FileText, ArrowRight, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    sex: "",
    country: "",
    currencyCode: "",
    currencySymbol: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();
  const { registerUser, loading } = useUser();

  // Auto-populate currency when country is selected
  useEffect(() => {
    if (formData.country) {
      const selectedCountry = countryData.find(
        (country) => country.name === formData.country
      );
      if (selectedCountry) {
        setFormData((prevData) => ({
          ...prevData,
          currencyCode: selectedCountry.currencyCode,
          currencySymbol: selectedCountry.currencySymbol,
        }));
      }
    }
  }, [formData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    // Clear API error when user starts typing
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = () => {
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

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!formData.sex) {
      newErrors.sex = "Please select your gender";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(""); // Clear previous API errors

    if (!validateForm()) {
      return;
    }

    try {
      await registerUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        phoneNumber: formData.phoneNumber.trim(),
        sex: formData.sex,
        country: formData.country,
        currencyCode: formData.currencyCode,
        currencySymbol: formData.currencySymbol,
        password: formData.password,
      });
      
      // Show success message
      setRegistrationSuccess(true);
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      // Handle specific error messages from authServices
      if (err.message.includes("User already exists")) {
        setApiError("An account already exists with this email. Please use a different email or try logging in.");
      } else if (err.message.includes("Registration failed")) {
        setApiError("Registration failed. Please check your information and try again.");
      } else {
        setApiError(err.message || "Registration failed. Please try again.");
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
              Account Created Successfully!
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your InvoiceFlow account has been created. You'll be redirected to the login page in a few seconds.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3 text-gray-700 dark:text-gray-300">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <span>Account ready for login</span>
              </div>
              
              <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Redirecting to login page...
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-300"
                >
                  Go to Login Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Left Side - Visual */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white">
          <div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold">InvoiceFlow</h1>
            <p className="mt-2 text-primary-100">
              Streamline your invoicing and billing process
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-primary-500 rounded-full p-2 mr-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p>Bank-level security & encryption</p>
            </div>

            <div className="flex items-center">
              <div className="bg-primary-500 rounded-full p-2 mr-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p>Automated invoice generation</p>
            </div>

            <div className="flex items-center">
              <div className="bg-primary-500 rounded-full p-2 mr-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p>Advanced reporting & analytics</p>
            </div>
          </div>

          <div className="mt-8 border-t border-primary-400 pt-4">
            <p className="text-sm text-primary-200">Already using InvoiceFlow?</p>
            <Link
              to="/login"
              className="mt-2 inline-block bg-white text-primary-700 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8">
          {/* API Error Message */}
          {apiError && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-700 dark:text-red-300">{apiError}</p>
                  <div className="mt-2 flex items-center space-x-4">
                    <button
                      onClick={() => setApiError("")}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                    >
                      Dismiss
                    </button>
                    {apiError.includes("already exists") && (
                      <Link 
                        to="/login" 
                        className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium"
                        onClick={() => setApiError("")}
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
              Create Your Account
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Join thousands of businesses using InvoiceFlow
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="firstName"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.firstName ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  } focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
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
                <input
                  name="lastName"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.lastName ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  } focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                } focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                name="phoneNumber"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                } focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                placeholder="+1 234 567 8900"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                disabled={loading}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.phoneNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="sex"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.sex ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  } focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white`}
                  onChange={handleChange}
                  value={formData.sex}
                  required
                  disabled={loading}
                >
                  <option value="" className="text-gray-500 dark:text-gray-400">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.sex && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.sex}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
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
                {errors.country && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.country}</p>
                )}
              </div>
            </div>

            {formData.currencyCode && (
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  Selected currency: <strong>{formData.currencyCode}</strong> ({formData.currencySymbol})
                </p>
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

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 dark:text-primary-500 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600 rounded"
                required
                disabled={loading}
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                I agree to the{" "}
                <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg font-medium text-white ${
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