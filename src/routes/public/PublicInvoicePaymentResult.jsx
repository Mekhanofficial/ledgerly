import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPublicInvoice } from '../../services/publicInvoicePaymentService';

const formatAmount = (amount, currency = 'NGN') => {
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(Number(amount || 0));
  } catch (error) {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
};

export default function PublicInvoicePaymentResult({ mode = 'success' }) {
  const { slug } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await fetchPublicInvoice(slug);
        if (active) setInvoice(data);
      } catch (err) {
        if (active) setError(err?.response?.data?.error || err?.message || 'Unable to load invoice');
      } finally {
        if (active) setLoading(false);
      }
    };

    if (slug) {
      load();
    } else {
      setLoading(false);
      setError('Invalid invoice link');
    }

    return () => {
      active = false;
    };
  }, [slug]);

  const isSuccess = mode === 'success';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: isSuccess ? 'linear-gradient(180deg, #f0fdf4 0%, #ecfeff 100%)' : 'linear-gradient(180deg, #fff7ed 0%, #fef2f2 100%)',
        padding: '24px 16px'
      }}
    >
      <div
        style={{
          maxWidth: 680,
          margin: '40px auto',
          background: '#fff',
          borderRadius: 18,
          border: '1px solid #e5e7eb',
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
          padding: 24
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            display: 'grid',
            placeItems: 'center',
            fontSize: 28,
            fontWeight: 700,
            background: isSuccess ? '#dcfce7' : '#fee2e2',
            color: isSuccess ? '#166534' : '#b91c1c'
          }}
        >
          {isSuccess ? '✓' : '!'}
        </div>

        <h1 style={{ margin: '14px 0 8px', color: '#0f172a' }}>
          {isSuccess ? 'Payment successful' : 'Payment not completed'}
        </h1>

        <p style={{ margin: 0, color: '#475569' }}>
          {isSuccess
            ? 'Your invoice payment has been received and verified.'
            : 'We could not confirm this payment. You can retry from the invoice page.'}
        </p>

        <div style={{ marginTop: 18, border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
          {loading ? (
            <p style={{ margin: 0, color: '#475569' }}>Loading invoice details...</p>
          ) : error ? (
            <p style={{ margin: 0, color: '#b91c1c' }}>{error}</p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ color: '#0f172a', fontWeight: 700 }}>{invoice?.business?.name || 'Business'}</div>
              <div style={{ color: '#334155' }}>Invoice: {invoice?.invoiceNumber || '—'}</div>
              <div style={{ color: '#334155' }}>Customer: {invoice?.customer?.name || 'Customer'}</div>
              <div style={{ color: '#334155' }}>
                Status: <strong>{invoice?.status || '—'}</strong>
              </div>
              <div style={{ color: '#334155' }}>
                Outstanding: <strong>{formatAmount(invoice?.amountDue, invoice?.currency || 'NGN')}</strong>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            to={`/invoice/pay/${slug}`}
            style={{
              textDecoration: 'none',
              background: '#111827',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: 10,
              fontWeight: 700
            }}
          >
            {isSuccess ? 'View Invoice' : 'Retry Payment'}
          </Link>
        </div>
      </div>
    </div>
  );
}
