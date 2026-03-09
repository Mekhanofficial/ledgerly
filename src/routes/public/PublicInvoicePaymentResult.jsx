import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  fetchPublicInvoice,
  sendPublicInvoiceReceiptEmail
} from '../../services/publicInvoicePaymentService';
import { buildReceiptEmailPdfAttachment } from '../../utils/receiptEmailPdf';

const getPaymentStateStorageKey = (slugValue) => `ledgerly_public_invoice_payment_state_${String(slugValue || '').trim()}`;
const getReceiptSentStorageKey = (slugValue, reference) =>
  `ledgerly_public_receipt_email_sent_${String(slugValue || '').trim()}_${String(reference || '').trim()}`;

const readPendingPaymentState = (slugValue) => {
  if (typeof window === 'undefined') return null;
  const key = getPaymentStateStorageKey(slugValue);
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
};

const clearPendingPaymentState = (slugValue) => {
  if (typeof window === 'undefined') return;
  const key = getPaymentStateStorageKey(slugValue);
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
};

const hasReceiptEmailBeenSent = (slugValue, reference) => {
  if (typeof window === 'undefined') return false;
  if (!reference) return false;
  const key = getReceiptSentStorageKey(slugValue, reference);
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};

const markReceiptEmailSent = (slugValue, reference) => {
  if (typeof window === 'undefined' || !reference) return;
  const key = getReceiptSentStorageKey(slugValue, reference);
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    // Ignore storage errors
  }
};

const formatAmount = (amount, currency = 'NGN') => {
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(Number(amount || 0));
  } catch (error) {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
};

export default function PublicInvoicePaymentResult({ mode = 'success' }) {
  const { slug } = useParams();
  const location = useLocation();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receiptStatus, setReceiptStatus] = useState('idle');
  const [receiptMessage, setReceiptMessage] = useState('');

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const queryReference = String(searchParams.get('reference') || '').trim();
  const pendingPaymentState = useMemo(() => readPendingPaymentState(slug), [slug]);
  const reference = useMemo(
    () =>
      queryReference
      || String(pendingPaymentState?.reference || '').trim()
      || String(invoice?.transactionReference || invoice?.paymentReference || '').trim(),
    [invoice?.paymentReference, invoice?.transactionReference, pendingPaymentState?.reference, queryReference]
  );

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
  const isPaid = String(invoice?.status || '').toLowerCase() === 'paid' || Number(invoice?.amountDue || 0) <= 0;

  useEffect(() => {
    let active = true;

    const sendReceipt = async () => {
      if (!isSuccess || loading || !invoice) return;
      if (!isPaid) return;

      if (!reference) {
        setReceiptStatus('error');
        setReceiptMessage('Payment reference is unavailable, so receipt email could not be sent.');
        return;
      }

      if (hasReceiptEmailBeenSent(slug, reference)) {
        setReceiptStatus('sent');
        setReceiptMessage('Receipt has already been sent to your email.');
        return;
      }

      const customerEmail = String(invoice?.customer?.email || '').trim().toLowerCase();
      if (!customerEmail) {
        setReceiptStatus('error');
        setReceiptMessage('Customer email is missing for this invoice.');
        return;
      }

      const resolvedTemplateStyle = String(
        invoice?.templateStyle || pendingPaymentState?.templateStyle || 'standard'
      ).trim() || 'standard';

      const normalizedItems = Array.isArray(invoice?.items)
        ? invoice.items.map((item) => ({
            name: item?.description || 'Item',
            quantity: Number(item?.quantity || 0),
            price: Number(item?.unitPrice || 0)
          }))
        : [];

      const total = Number(invoice?.total || 0);
      const subtotal = Number(invoice?.subtotal || Math.max(0, total - Number(invoice?.taxAmount || 0)));
      const tax = Number(invoice?.taxAmount || 0);
      const amountPaid = Number(invoice?.amountPaid || total);
      const change = Math.max(0, amountPaid - total);
      const business = invoice?.business || {};
      const businessAddress = typeof business?.address === 'string'
        ? business.address
        : (business?.address?.street || '');
      const accountInfo = {
        companyName: business?.name || 'Business',
        email: business?.email || '',
        phone: business?.phone || '',
        address: businessAddress,
        city: business?.address?.city || '',
        state: business?.address?.state || '',
        country: business?.address?.country || '',
        currency: invoice?.currency || business?.currency || 'NGN'
      };
      const receiptData = {
        id: invoice?.invoiceNumber || slug,
        receiptNumber: invoice?.invoiceNumber || slug,
        date: new Date().toLocaleDateString(),
        customerName: invoice?.customer?.name || 'Customer',
        customerEmail,
        items: normalizedItems,
        subtotal,
        tax,
        total,
        amountPaid,
        change,
        paymentMethod: 'online',
        paymentReference: reference,
        status: 'completed',
        currency: invoice?.currency || business?.currency || 'NGN',
        templateStyle: resolvedTemplateStyle
      };
      const pdfAttachment = buildReceiptEmailPdfAttachment({
        receiptData,
        accountInfo,
        templateId: resolvedTemplateStyle,
        fallbackReceiptId: slug
      });

      if (!pdfAttachment) {
        setReceiptStatus('error');
        setReceiptMessage('Unable to generate receipt PDF from template.');
        return;
      }

      setReceiptStatus('sending');
      setReceiptMessage('Sending receipt email...');

      try {
        const result = await sendPublicInvoiceReceiptEmail({
          reference,
          pdfAttachment,
          templateStyle: resolvedTemplateStyle
        });
        if (!active) return;
        markReceiptEmailSent(slug, reference);
        clearPendingPaymentState(slug);
        setReceiptStatus('sent');
        setReceiptMessage(
          result?.alreadySent
            ? 'Receipt has already been sent to your email.'
            : 'Receipt sent to your email successfully.'
        );
      } catch (sendError) {
        if (!active) return;
        setReceiptStatus('error');
        setReceiptMessage(
          sendError?.response?.data?.error
          || sendError?.message
          || 'Unable to send receipt email.'
        );
      }
    };

    sendReceipt();
    return () => {
      active = false;
    };
  }, [isPaid, isSuccess, invoice, loading, pendingPaymentState?.templateStyle, reference, slug]);

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

        {isSuccess && receiptStatus !== 'idle' && (
          <div
            style={{
              marginTop: 16,
              border: '1px solid',
              borderColor: receiptStatus === 'sent' ? '#bbf7d0' : receiptStatus === 'sending' ? '#bfdbfe' : '#fecaca',
              background: receiptStatus === 'sent' ? '#f0fdf4' : receiptStatus === 'sending' ? '#eff6ff' : '#fef2f2',
              color: receiptStatus === 'sent' ? '#166534' : receiptStatus === 'sending' ? '#1e3a8a' : '#b91c1c',
              borderRadius: 12,
              padding: '10px 12px',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            {receiptMessage}
          </div>
        )}

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
