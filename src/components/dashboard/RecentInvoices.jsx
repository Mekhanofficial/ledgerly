import React from 'react';
import { Eye, Download, Mail, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInvoice } from '../../context/InvoiceContext';

const RecentInvoices = () => {
  const { invoices, sendInvoice, markAsPaid } = useInvoice();

  // Get recent 5 invoices sorted by date
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt || b.issueDate) - new Date(a.createdAt || a.issueDate))
    .slice(0, 5);

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
      sent: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      viewed: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      overdue: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      draft: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
      pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
    };
    return styles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'Draft',
      sent: 'Sent',
      viewed: 'Viewed',
      paid: 'Paid',
      overdue: 'Overdue',
      pending: 'Pending'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleSendInvoice = (invoiceId, e) => {
    e?.stopPropagation();
    sendInvoice(invoiceId);
  };

  const handleMarkAsPaid = (invoiceId, e) => {
    e?.stopPropagation();
    markAsPaid(invoiceId);
  };

  const handleViewInvoice = (invoiceId) => {
    // Navigate to invoice view page
    window.location.href = `/invoices/view/${invoiceId}`;
  };

  const handleDownloadPDF = (invoice, e) => {
    e?.stopPropagation();
    // Generate and download PDF
    alert(`Downloading PDF for ${invoice.number || invoice.invoiceNumber}`);
  };

  return (
    <div className="card mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Invoices</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Latest {Math.min(5, invoices.length)} of {invoices.length} total invoices
          </p>
        </div>
        <Link to="/invoices" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
          View all invoices →
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No invoices yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Create your first invoice to get started
          </p>
          <Link
            to="/invoices/create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Create Invoice
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date Issued
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.number || invoice.invoiceNumber}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {invoice.lineItems?.length || 0} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.customer?.name || (typeof invoice.customer === 'string' ? invoice.customer : 'No customer')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Due {formatDate(invoice.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${(invoice.totalAmount || invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(invoice.issueDate || invoice.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewInvoice(invoice.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" 
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button 
                          onClick={(e) => handleDownloadPDF(invoice, e)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" 
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        {invoice.status === 'draft' || invoice.status === 'pending' ? (
                          <button 
                            onClick={(e) => handleSendInvoice(invoice.id, e)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" 
                            title="Send"
                          >
                            <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        ) : invoice.status === 'sent' ? (
                          <button 
                            onClick={(e) => handleMarkAsPaid(invoice.id, e)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" 
                            title="Mark as Paid"
                          >
                            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </button>
                        ) : null}
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {recentInvoices.length} of {invoices.length} total invoices
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Previous
                </button>
                <button className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium">
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Add missing import
const FileText = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default RecentInvoices;