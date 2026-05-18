import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Printer, ShieldCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useInvoice } from '../../context/InvoiceContext';
import { useAccount } from '../../context/AccountContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const formatCurrency = (value = 0, currency = 'USD') => {
  if (Number.isNaN(value)) value = 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(value);
};

const ViewInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, customers, sendInvoice } = useInvoice();
  const { accountInfo } = useAccount();
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const authUser = useSelector((state) => state.auth?.user);
  const [isSending, setIsSending] = useState(false);
  const [isOpeningWhatsApp, setIsOpeningWhatsApp] = useState(false);
  const [isLoadingCompliance, setIsLoadingCompliance] = useState(false);
  const [compliancePreview, setCompliancePreview] = useState(null);
  const normalizedRole = String(authUser?.role || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  const isClient = normalizedRole === 'client';

  const invoice = invoices.find(inv => inv.id === id || inv.invoiceNumber === id);
  const lineItems = invoice?.lineItems || invoice?.items || [];

  const invoiceCustomer = useMemo(() => {
    if (!invoice) return null;
    if (invoice.customerId) {
      return customers.find(cust => cust.id === invoice.customerId) || null;
    }
    if (invoice.customer || invoice.customerName) {
      return {
        name: invoice.customerName || invoice.customer,
        email: invoice.customerEmail,
        phone: invoice.customerPhone,
        address: invoice.customerAddress
      };
    }
    return null;
  }, [invoice, customers]);

  const totals = useMemo(() => {
    const parts = lineItems.map(item => ({
      rate: item.rate || item.unit || 0,
      quantity: item.quantity || item.qty || 1,
      amount: item.amount ?? ((item.rate || 0) * (item.quantity || 1)),
      tax: item.tax || 0
    }));

    const subtotal = parts.reduce((sum, item) => sum + item.amount, 0);
    const tax = Number(
      invoice?.taxAmount
      ?? invoice?.totalTax
      ?? invoice?.tax?.amount
      ?? parts.reduce((sum, item) => sum + item.amount * (item.tax / 100), 0)
    ) || 0;
    const withholding = Number(invoice?.withholdingAmount ?? invoice?.withholding?.amount ?? 0) || 0;
    const total =
      invoice?.totalAmount ??
      invoice?.amount ??
      invoice?.total ??
      invoice?.grandTotal ??
      subtotal + tax;
    const netAmountDue = Number(invoice?.netAmountDue ?? (total - withholding)) || 0;
    const balanceDue = Number(invoice?.balance ?? netAmountDue) || 0;

    return { subtotal, tax, withholding, total, netAmountDue, balanceDue };
  }, [invoice, lineItems]);

  const statusColors = {
    paid: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    sent: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    draft: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    overdue: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  };
  const statusType = invoice?.status || 'sent';
  const statusClass = statusColors[statusType] || statusColors.sent;
  const canSendOrResend = !['cancelled', 'void'].includes(String(statusType || '').toLowerCase());
  const sendButtonLabel = String(statusType || '').toLowerCase() === 'draft' ? 'Send Invoice' : 'Resend Invoice';
  const showWithholding = totals.withholding > 0 || Number(invoice?.withholdingRateUsed || 0) > 0;
  const taxLabel = invoice?.taxName || 'Tax';
  const withholdingLabel = invoice?.withholdingName || 'WHT';

  const companyLines = [
    accountInfo?.address,
    [accountInfo?.city, accountInfo?.state, accountInfo?.zipCode].filter(Boolean).join(', '),
    accountInfo?.country
  ].filter(Boolean);
  const contactDetails = [
    accountInfo?.contactName && `Attn: ${accountInfo.contactName}`,
    accountInfo?.email,
    accountInfo?.phone,
    accountInfo?.website
  ].filter(Boolean);

  const handlePrint = () => window.print();
  const handleSendOrResend = async () => {
    if (!invoice?.id) return;
    setIsSending(true);
    try {
      await sendInvoice(invoice.id);
    } catch {
      addToast('Unable to send invoice right now', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenWhatsApp = async () => {
    if (!invoice?.id) return;
    setIsOpeningWhatsApp(true);
    try {
      const response = await api.get(`/invoices/${invoice.id}/whatsapp-link`);
      const link = response?.data?.data?.link;
      if (!link) {
        throw new Error('WhatsApp link is not available for this invoice');
      }
      window.open(link, '_blank', 'noopener,noreferrer');
      addToast('WhatsApp share link opened', 'success');
    } catch (error) {
      addToast(error?.response?.data?.error || error?.message || 'Unable to open WhatsApp link', 'error');
    } finally {
      setIsOpeningWhatsApp(false);
    }
  };

  const handleLoadCompliancePreview = async () => {
    if (!invoice?.id) return;
    setIsLoadingCompliance(true);
    try {
      const response = await api.get(`/invoices/${invoice.id}/compliance/preview`);
      setCompliancePreview(response?.data?.data || null);
    } catch (error) {
      addToast(error?.response?.data?.error || 'Unable to load compliance preview', 'error');
    } finally {
      setIsLoadingCompliance(false);
    }
  };

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Invoice not found
          </p>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Double-check the invoice ID or return to the invoices list.
          </p>
          <button
            onClick={() => navigate('/invoices')}
            className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go back to invoices
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Invoice #{invoice.invoiceNumber || invoice.number}
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {invoiceCustomer?.name ? `Billed to ${invoiceCustomer.name}` : 'View invoice details'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/invoices')}
              className={`px-4 py-2 border rounded-lg text-sm ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ArrowLeft className="w-4 h-4 inline-block mr-1" />
              Back
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print / Download
            </button>
            {!isClient && canSendOrResend && (
              <button
                onClick={handleSendOrResend}
                disabled={isSending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Mail className="w-4 h-4" />
                {isSending ? 'Sending...' : sendButtonLabel}
              </button>
            )}
            {!isClient && (
              <button
                onClick={handleOpenWhatsApp}
                disabled={isOpeningWhatsApp}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-4 h-4" />
                {isOpeningWhatsApp ? 'Opening...' : 'WhatsApp'}
              </button>
            )}
            {!isClient && (
              <button
                onClick={handleLoadCompliancePreview}
                disabled={isLoadingCompliance}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-4 h-4" />
                {isLoadingCompliance ? 'Loading...' : 'Compliance'}
              </button>
            )}
          </div>
        </div>

        {compliancePreview && (
          <div className={`rounded-2xl border p-5 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} shadow-sm`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Nigeria E-Invoice Preview
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {compliancePreview.preview?.ready ? 'Ready for transmission' : 'Needs attention before submission'}
                </p>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                compliancePreview.preview?.ready
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {compliancePreview.compliance?.transmissionStatus || 'draft'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
              <div>
                <div className="text-gray-500">Regime</div>
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {compliancePreview.compliance?.regime || 'NRS_EFS'}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Seller TIN</div>
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {compliancePreview.compliance?.sellerTin || 'Missing'}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Buyer TIN</div>
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {compliancePreview.compliance?.buyerTin || 'Missing'}
                </div>
              </div>
            </div>
            {(compliancePreview.preview?.errors?.length > 0 || compliancePreview.preview?.warnings?.length > 0) && (
              <div className="mt-4 space-y-2 text-sm">
                {compliancePreview.preview?.errors?.length > 0 && (
                  <div className="rounded-lg bg-red-50 text-red-700 p-3">
                    {compliancePreview.preview.errors.join(' ')}
                  </div>
                )}
                {compliancePreview.preview?.warnings?.length > 0 && (
                  <div className="rounded-lg bg-amber-50 text-amber-800 p-3">
                    {compliancePreview.preview.warnings.join(' ')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className={`rounded-2xl border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} shadow-sm`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                  {statusType.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-gray-500 flex flex-col gap-1">
                <span>Issue Date: {new Date(invoice.issueDate || invoice.createdAt).toLocaleDateString()}</span>
                <span>Due Date: {new Date(invoice.dueDate || invoice.due).toLocaleDateString()}</span>
              </div>
              <div className="text-sm text-gray-500 text-right">
                <p>Total Due</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totals.balanceDue, invoice.currency || accountInfo?.currency)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <div>
              <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>From</h3>
              <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="font-medium">{accountInfo?.companyName || 'BillMetro Inc.'}</div>
                {companyLines.map((line, index) => (
                  <div key={`from-line-${index}`}>{line}</div>
                ))}
                {contactDetails.map((line, index) => (
                  <div key={`from-contact-${index}`}>{line}</div>
                ))}
              </div>
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bill To</h3>
              <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="font-medium">{invoiceCustomer?.name || 'Walk-in Customer'}</div>
                {invoiceCustomer?.address && <div>{invoiceCustomer.address}</div>}
                {invoiceCustomer?.email && <div>{invoiceCustomer.email}</div>}
                {invoiceCustomer?.phone && <div>{invoiceCustomer.phone}</div>}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tax</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {lineItems.map((item, idx) => (
                  <tr key={item.id || `${idx}-${item.description}`}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {item.description || item.name || 'Item'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.quantity || 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {formatCurrency(item.rate || item.unit || 0, invoice.currency || accountInfo?.currency)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {item.tax != null ? `${item.tax}%` : '0%'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-right text-gray-900 dark:text-white">
                      {formatCurrency(item.amount ?? ((item.rate || 0) * (item.quantity || 1)), invoice.currency || accountInfo?.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lineItems.length === 0 && (
              <div className="px-6 py-4 text-sm italic text-gray-500 dark:text-gray-400">
                No line items recorded for this invoice.
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-sm ml-auto space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(totals.subtotal, invoice.currency || accountInfo?.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{taxLabel}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(totals.tax, invoice.currency || accountInfo?.currency)}
                </span>
              </div>
              {showWithholding && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{withholdingLabel}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    -{formatCurrency(totals.withholding, invoice.currency || accountInfo?.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(totals.total, invoice.currency || accountInfo?.currency)}</span>
              </div>
              {showWithholding && (
                <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-white">
                  <span>Net Payable</span>
                  <span>{formatCurrency(totals.netAmountDue, invoice.currency || accountInfo?.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-primary-600">
                <span>Balance Due</span>
                <span>{formatCurrency(totals.balanceDue, invoice.currency || accountInfo?.currency)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notes</h4>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {invoice.notes}
              </p>
            </div>
          )}

          {invoice.terms && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Terms</h4>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {invoice.terms}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewInvoice;
