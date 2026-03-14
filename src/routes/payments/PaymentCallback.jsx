import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { verifyPayment } from '../../services/billingService';
import { useToast } from '../../context/ToastContext';
import { useAccount } from '../../context/AccountContext';
import { clearPendingCheckout } from '../../utils/subscriptionCheckout';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { refreshAccountInfo } = useAccount();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying payment...');
  const [primaryTarget, setPrimaryTarget] = useState('/settings');
  const [primaryLabel, setPrimaryLabel] = useState('Go to Billing');
  const [secondaryTarget, setSecondaryTarget] = useState('/invoices/templates');
  const [secondaryLabel, setSecondaryLabel] = useState('View Templates');

  useEffect(() => {
    const reference =
      searchParams.get('reference') ||
      searchParams.get('trxref') ||
      searchParams.get('ref');

    if (!reference) {
      setStatus('error');
      setMessage('Missing payment reference.');
      return;
    }

    let isActive = true;
    let redirectTimer;

    const verify = async () => {
      try {
        const verification = await verifyPayment(reference);
        await refreshAccountInfo({ silent: true });
        clearPendingCheckout();
        if (!isActive) return;
        const applied = verification?.data?.applied || verification?.applied || {};
        const appliedType = String(applied?.type || '').trim().toLowerCase();

        if (appliedType === 'subscription') {
          setPrimaryTarget('/settings?section=billing');
          setPrimaryLabel('Open Billing');
          setSecondaryTarget('/payments/pricing');
          setSecondaryLabel('View Plans');
          setMessage('Payment verified. Your subscription has been updated.');
        } else if (appliedType === 'template' || appliedType === 'bundle' || appliedType === 'lifetime') {
          setPrimaryTarget('/invoices/templates');
          setPrimaryLabel('Open Templates');
          setSecondaryTarget('/settings?section=billing');
          setSecondaryLabel('Go to Billing');
          setMessage('Payment verified. Template access has been unlocked.');
        } else {
          setMessage('Payment verified. Your account is now updated.');
        }
        setStatus('success');
        addToast('Payment verified successfully', 'success');

        const redirectPath = appliedType === 'subscription'
          ? '/settings?section=billing'
          : (appliedType === 'template' || appliedType === 'bundle' || appliedType === 'lifetime'
            ? '/invoices/templates'
            : '');

        if (redirectPath) {
          redirectTimer = window.setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 1400);
        }
      } catch (error) {
        if (!isActive) return;
        setStatus('error');
        setMessage(error?.response?.data?.error || 'Payment verification failed.');
        addToast('Payment verification failed', 'error');
      }
    };

    verify();

    return () => {
      isActive = false;
      if (redirectTimer) {
        window.clearTimeout(redirectTimer);
      }
    };
  }, [searchParams, addToast, navigate, refreshAccountInfo]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {status === 'loading' && 'Processing Payment'}
          {status === 'success' && 'Payment Successful'}
          {status === 'error' && 'Payment Error'}
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">{message}</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate(primaryTarget)}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold"
          >
            {primaryLabel}
          </button>
          <button
            type="button"
            onClick={() => navigate(secondaryTarget)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
          >
            {secondaryLabel}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentCallback;
