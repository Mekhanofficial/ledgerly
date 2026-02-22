import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { useAccount } from '../../../context/AccountContext';
import NavBar from '../../dashboard/layout/NavBar';
import SideBar from '../../dashboard/layout/SideBar';
import { resolveAuthUser } from '../../../utils/userDisplay';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const { accountInfo } = useAccount();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth?.user);
  const resolvedUser = resolveAuthUser(authUser);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const modalStorageKey = useMemo(() => {
    const id = resolvedUser?.id || resolvedUser?._id;
    return id ? `ledgerly_upgrade_modal_dismissed_${id}` : 'ledgerly_upgrade_modal_dismissed';
  }, [resolvedUser]);

  const subscriptionBanner = useMemo(() => {
    const status = String(accountInfo?.subscriptionStatus || 'active').toLowerCase();
    if (status === 'expired') {
      return {
        tone: 'error',
        title: 'Your subscription has expired.',
        message: 'Upgrade to continue creating invoices and using premium features.'
      };
    }
    if (status === 'trial') {
      const trialEnds = accountInfo?.trialEndsAt ? new Date(accountInfo.trialEndsAt) : null;
      const formatted = trialEnds && !Number.isNaN(trialEnds.getTime())
        ? trialEnds.toLocaleDateString('en-GB')
        : null;
      return {
        tone: 'warning',
        title: 'Free trial active.',
        message: formatted
          ? `Trial ends on ${formatted}. Upgrade anytime to keep access.`
          : 'Upgrade anytime to keep access after your trial.'
      };
    }
    return null;
  }, [accountInfo]);

  useEffect(() => {
    const status = String(accountInfo?.subscriptionStatus || 'active').toLowerCase();
    if (typeof window === 'undefined') return;
    if (status === 'expired') {
      const dismissed = sessionStorage.getItem(modalStorageKey) === 'true';
      setShowUpgradeModal(!dismissed);
    } else {
      setShowUpgradeModal(false);
      sessionStorage.removeItem(modalStorageKey);
    }
  }, [accountInfo?.subscriptionStatus, modalStorageKey]);

  const handleDismissUpgradeModal = () => {
    setShowUpgradeModal(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(modalStorageKey, 'true');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-90 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <SideBar 
        isOpen={sidebarOpen} 
        mobileOpen={mobileSidebarOpen}
        onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main Content */}
      <div className={`flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        <NavBar 
          onMenuClick={() => setMobileSidebarOpen(true)}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 min-h-screen space-y-4">
            {subscriptionBanner && (
              <div className={`rounded-xl border px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
                subscriptionBanner.tone === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'
                  : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
              }`}>
                <div>
                  <div className="font-semibold">{subscriptionBanner.title}</div>
                  <div className="text-sm">{subscriptionBanner.message}</div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/pricing')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700"
                >
                  Upgrade
                </button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" />
          <div className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
            isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="text-sm font-semibold uppercase tracking-widest text-primary-500">
              Upgrade Required
            </div>
            <h2 className="mt-2 text-2xl font-bold">
              Your subscription has expired
            </h2>
            <p className={`mt-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Upgrade to continue creating invoices, exporting PDFs, and using premium templates.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Upgrade Now
              </button>
              <button
                type="button"
                onClick={handleDismissUpgradeModal}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-semibold ${
                  isDarkMode
                    ? 'border-gray-700 text-gray-200 hover:bg-gray-800'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
