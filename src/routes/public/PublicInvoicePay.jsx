import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPublicInvoice, initializePublicInvoicePayment, verifyPublicInvoicePayment } from '../../services/publicInvoicePaymentService';
import { resolveServerBaseUrl } from '../../utils/apiConfig';

const loadPaystackScript = () =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Browser environment required'));
      return;
    }

    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }

    const existing = document.querySelector('script[data-paystack-inline="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.PaystackPop), { once: true });
      existing.addEventListener('error', () => reject(new Error('Unable to load Paystack SDK')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.dataset.paystackInline = 'true';
    script.onload = () => resolve(window.PaystackPop);
    script.onerror = () => reject(new Error('Unable to load Paystack SDK'));
    document.body.appendChild(script);
  });

const formatAmount = (amount, currency = 'NGN') => {
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN'
    }).format(Number(amount || 0));
  } catch (error) {
    return `${currency || 'NGN'} ${Number(amount || 0).toFixed(2)}`;
  }
};

const cardStyle = {
  maxWidth: 720,
  margin: '40px auto',
  background: '#fff',
  borderRadius: 18,
  border: '1px solid #e5e7eb',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
  padding: 24
};

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
  padding: '24px 16px'
};

export default function PublicInvoicePay() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const serverBaseUrl = useMemo(() => resolveServerBaseUrl(), []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPublicInvoice(slug);
        if (active) {
          setInvoice(data);
        }
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.error || err?.message || 'Unable to load invoice');
        }
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

  const handlePayNow = async () => {
    if (!invoice || paying) return;

    setPaying(true);
    setError('');
    setNotice('');

    try {
      const [_, initPayload] = await Promise.all([
        loadPaystackScript(),
        initializePublicInvoicePayment(slug)
      ]);

      const payment = initPayload?.payment;
      const invoicePayload = initPayload?.invoice || invoice;

      if (!payment?.publicKey || !payment?.reference) {
        throw new Error('Payment initialization response is incomplete');
      }

      setInvoice(invoicePayload);

      const paystack = window.PaystackPop?.setup?.({
        key: payment.publicKey,
        email: invoicePayload?.customer?.email,
        amount: Math.round(Number(payment.amount || invoicePayload?.amountDue || 0) * 100),
        currency: payment.currency || invoicePayload?.currency || 'NGN',
        ref: payment.reference,
        access_code: payment.accessCode,
        metadata: {
          invoiceNumber: invoicePayload?.invoiceNumber,
          publicSlug: invoicePayload?.publicSlug
        },
        callback: async (response) => {
          try {
            await verifyPublicInvoicePayment(response.reference);
            navigate(`/invoice/success/${invoicePayload?.publicSlug || slug}`);
          } catch (verifyError) {
            window.location.href = `${serverBaseUrl}/api/v1/payments/verify?reference=${encodeURIComponent(response.reference)}`;
          }
        },
        onClose: () => {
          setNotice('Payment window closed. You can try again, and webhook confirmation will still update the invoice if payment completed.');
          setPaying(false);
        }
      });

      if (!paystack || typeof paystack.openIframe !== 'function') {
        throw new Error('Paystack popup could not be opened');
      }

      paystack.openIframe();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Unable to start payment');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <p style={{ margin: 0, color: '#475569' }}>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, color: '#0f172a' }}>Invoice Payment</h2>
          <p style={{ color: '#b91c1c' }}>{error}</p>
        </div>
      </div>
    );
  }

  const canPayOnline = Boolean(invoice?.payment?.canPayOnline);
  const isPaid = String(invoice?.status || '').toLowerCase() === 'paid' || Number(invoice?.amountDue || 0) <= 0;

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>INVOICE</div>
            <h1 style={{ margin: '6px 0 0', fontSize: 28, color: '#0f172a' }}>
              {invoice?.invoiceNumber || 'Invoice'}
            </h1>
          </div>
          <div
            style={{
              alignSelf: 'flex-start',
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              background: isPaid ? '#dcfce7' : '#e0e7ff',
              color: isPaid ? '#166534' : '#3730a3',
              textTransform: 'uppercase'
            }}
          >
            {invoice?.status || 'pending'}
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
            <div style={{ color: '#64748b', fontSize: 12 }}>Business</div>
            <div style={{ color: '#0f172a', fontWeight: 700, marginTop: 4 }}>{invoice?.business?.name || 'Business'}</div>
          </div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
            <div style={{ color: '#64748b', fontSize: 12 }}>Customer</div>
            <div style={{ color: '#0f172a', fontWeight: 700, marginTop: 4 }}>{invoice?.customer?.name || 'Customer'}</div>
            {invoice?.customer?.email && (
              <div style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>{invoice.customer.email}</div>
            )}
          </div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
            <div style={{ color: '#64748b', fontSize: 12 }}>Amount Due</div>
            <div style={{ color: '#0f172a', fontWeight: 800, marginTop: 4, fontSize: 24 }}>
              {formatAmount(invoice?.amountDue, invoice?.currency)}
            </div>
          </div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
            <div style={{ color: '#64748b', fontSize: 12 }}>Due Date</div>
            <div style={{ color: '#0f172a', fontWeight: 700, marginTop: 4 }}>
              {invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Not set'}
            </div>
          </div>
        </div>

        {invoice?.notes && (
          <div style={{ marginTop: 16, border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
            <div style={{ color: '#64748b', fontSize: 12, marginBottom: 6 }}>Notes</div>
            <div style={{ color: '#334155', whiteSpace: 'pre-wrap' }}>{invoice.notes}</div>
          </div>
        )}

        {error && <p style={{ marginTop: 16, color: '#b91c1c' }}>{error}</p>}
        {notice && <p style={{ marginTop: 16, color: '#334155' }}>{notice}</p>}

        <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handlePayNow}
            disabled={!canPayOnline || paying || isPaid}
            style={{
              border: 'none',
              borderRadius: 12,
              padding: '14px 18px',
              background: !canPayOnline || paying || isPaid ? '#cbd5e1' : '#111827',
              color: '#fff',
              fontWeight: 700,
              cursor: !canPayOnline || paying || isPaid ? 'not-allowed' : 'pointer',
              minWidth: 180
            }}
          >
            {isPaid ? 'Already Paid' : paying ? 'Opening Paystack...' : 'Pay Now'}
          </button>
          {!canPayOnline && !isPaid && (
            <div style={{ color: '#475569', fontSize: 13, alignSelf: 'center' }}>
              Online payment is not available for this invoice yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
