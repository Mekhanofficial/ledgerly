import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useInvoice } from '../../context/InvoiceContext';
import { useAccount } from '../../context/AccountContext';
import { useTheme } from '../../context/ThemeContext';

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
  const { invoices, customers } = useInvoice();
  const { accountInfo } = useAccount();
  const { isDarkMode } = useTheme();

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
    const tax = invoice?.tax ?? parts.reduce((sum, item) => sum + item.amount * (item.tax / 100), 0);
    const total =
      invoice?.totalAmount ??
      invoice?.amount ??
      invoice?.total ??
      invoice?.grandTotal ??
      subtotal + tax;

    return { subtotal, tax, total };
  }, [invoice, lineItems]);

  const statusColors = {
    paid: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    sent: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    draft: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    overdue: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  };
  const statusType = invoice?.status || 'sent';
  const statusClass = statusColors[statusType] || statusColors.sent;

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
          </div>
        </div>

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
                  {formatCurrency(totals.total, invoice.currency || accountInfo?.currency)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <div>
              <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>From</h3>
              <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="font-medium">{accountInfo?.companyName || 'Ledgerly Inc.'}</div>
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
                <span className="text-gray-500">Tax</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(totals.tax, invoice.currency || accountInfo?.currency)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(totals.total, invoice.currency || accountInfo?.currency)}</span>
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
