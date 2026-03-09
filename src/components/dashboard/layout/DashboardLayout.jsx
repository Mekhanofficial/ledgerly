// layouts/DashboardLayout.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { useAccount } from '../../../context/AccountContext';
import NavBar from '../../dashboard/layout/NavBar';
import SideBar from '../../dashboard/layout/SideBar';
import { StaggerEntrance } from '../../motion';
import { resolveAuthUser } from '../../../utils/userDisplay';
import GlowingBorderTrail from '../../ui/GlowingBorderTrail';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const { accountInfo } = useAccount();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth?.user);
  const resolvedUser = resolveAuthUser(authUser);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const normalizedRole = String(resolvedUser?.role || authUser?.role || '').trim().toLowerCase();
  const isSuperAdmin = normalizedRole === 'super_admin';

  const modalStorageKey = useMemo(() => {
    const id = resolvedUser?.id || resolvedUser?._id;
    return id ? `ledgerly_upgrade_modal_dismissed_${id}` : 'ledgerly_upgrade_modal_dismissed';
  }, [resolvedUser]);

  const subscriptionBanner = useMemo(() => {
    if (isSuperAdmin) return null;
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
  }, [accountInfo, isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      setShowUpgradeModal(false);
      return;
    }
    const status = String(accountInfo?.subscriptionStatus || 'active').toLowerCase();
    if (typeof window === 'undefined') return;
    if (status === 'expired') {
      const dismissed = sessionStorage.getItem(modalStorageKey) === 'true';
      setShowUpgradeModal(!dismissed);
    } else {
      setShowUpgradeModal(false);
      sessionStorage.removeItem(modalStorageKey);
    }
  }, [accountInfo?.subscriptionStatus, modalStorageKey, isSuperAdmin]);

  const handleDismissUpgradeModal = () => {
    setShowUpgradeModal(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(modalStorageKey, 'true');
    }
  };

  return (
    <div className={`dashboard-shell min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Glowing Border Animation */}
      <GlowingBorderTrail
        isActive={true}
        duration={24000}
        pauseDuration={0}
        isDarkMode={isDarkMode}
      />

      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.button
            type="button"
            aria-label="Close mobile sidebar"
            className="fixed inset-0 z-40 bg-slate-900/45 dark:bg-slate-950/72 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <SideBar
        isOpen={sidebarOpen}
        mobileOpen={mobileSidebarOpen}
        onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main Content */}
      <motion.div
        layout
        className={`flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}
      >
        <NavBar
          onMenuClick={() => setMobileSidebarOpen(true)}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8 bg-transparent min-h-screen space-y-4">
            <AnimatePresence initial={false}>
              {subscriptionBanner && (
                <motion.div
                  className={`rounded-xl border px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
                    subscriptionBanner.tone === 'error'
                      ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'
                      : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <div>
                    <div className="font-semibold">{subscriptionBanner.title}</div>
                    <div className="text-sm">{subscriptionBanner.message}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/pricing')}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500"
                  >
                    Upgrade
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <StaggerEntrance className="space-y-4">
              {children}
            </StaggerEntrance>
          </div>
        </main>
      </motion.div>

      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div className="absolute inset-0 bg-black/60" />
            <motion.div
              className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-sm font-semibold uppercase tracking-widest text-cyan-500">
                Upgrade Required
              </div>
              <h2 className="mt-2 text-2xl font-bold">
                Your subscription has expired
              </h2>
              <p className={`mt-3 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Upgrade to continue creating invoices, exporting PDFs, and using premium templates.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/pricing')}
                  className="flex-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:from-cyan-500 hover:to-blue-500"
                >
                  Upgrade Now
                </button>
                <button
                  type="button"
                  onClick={handleDismissUpgradeModal}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm font-semibold ${
                    isDarkMode
                      ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Not Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
