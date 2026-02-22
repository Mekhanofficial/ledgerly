// auth/forgot-password/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import logo from '../../assets/icons/ledgerly-logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      addToast('Please enter your email address', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/forgotpassword', { email: normalizedEmail });
      setEmail(normalizedEmail);
      addToast('Password reset instructions sent to your email', 'success');
      setSubmitted(true);
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to send reset instructions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <img src={logo} alt="Ledgerly logo" className="h-9 w-9 object-contain" />
          </div>
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-blue-100 mt-2">Enter your email to receive reset instructions</p>
        </div>

        <div className="p-8 space-y-6">
          {submitted ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium"
              >
                Send Another Link
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="text-center">
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
