import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { verifyPayment } from '../../services/billingService';
import { useToast } from '../../context/ToastContext';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying payment...');

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

    const verify = async () => {
      try {
        const response = await verifyPayment(reference);
        if (!isActive) return;
        setStatus('success');
        setMessage('Payment verified. Your account is now updated.');
        addToast('Payment verified successfully', 'success');
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
    };
  }, [searchParams, addToast]);

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
            onClick={() => navigate('/settings')}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold"
          >
            Go to Billing
          </button>
          <button
            type="button"
            onClick={() => navigate('/invoices/templates')}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
          >
            View Templates
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentCallback;
