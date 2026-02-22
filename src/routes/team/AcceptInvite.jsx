import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import logo from '../../assets/icons/ledgerly-logo.png';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/team/accept/${token}`, { password, name: name.trim() || undefined });
      setSuccess('Invitation accepted! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to accept invitation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950/20 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
            <img src={logo} alt="Ledgerly logo" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accept Team Invite</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Set your password to activate your Ledgerly account.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-sm text-emerald-700 dark:text-emerald-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:outline-none transition-all bg-white/80 dark:bg-gray-800/80 dark:text-white"
              placeholder="Your full name"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:outline-none transition-all bg-white/80 dark:bg-gray-800/80 dark:text-white"
              placeholder="Create a password"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:outline-none transition-all bg-white/80 dark:bg-gray-800/80 dark:text-white"
              placeholder="Confirm password"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-300 shadow-lg shadow-primary-500/20 disabled:opacity-75"
          >
            {loading ? 'Activating...' : 'Accept Invitation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvite;
