// Update Drafts.jsx to use InvoiceContext
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Mail, Calendar, FileText, User, Send } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useInvoice } from '../../context/InvoiceContext';
import { useToast } from '../../context/ToastContext';
import { useAccount } from '../../context/AccountContext';

const Drafts = () => {
  const { drafts, deleteDraft, convertDraftToInvoice, sendInvoice } = useInvoice();
  const { addToast } = useToast();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  const [selectedDrafts, setSelectedDrafts] = useState([]);

  const handleDeleteDraft = (id, e) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to delete this draft?')) {
      deleteDraft(id);
      addToast('Draft deleted successfully', 'success');
    }
  };

  const handleDeleteSelected = () => {
    if (selectedDrafts.length === 0) {
      addToast('No drafts selected', 'warning');
      return;
    }

    if (window.confirm(`Delete ${selectedDrafts.length} selected draft(s)?`)) {
      selectedDrafts.forEach(id => deleteDraft(id));
      setSelectedDrafts([]);
      addToast(`${selectedDrafts.length} draft(s) deleted`, 'success');
    }
  };

  const handleConvertToInvoice = async (draftId) => {
    try {
      const invoice = await convertDraftToInvoice(draftId);
      if (!invoice) {
        throw new Error('Invoice creation failed');
      }
      addToast(`Draft converted to invoice: ${invoice.invoiceNumber}`, 'success');
    } catch (error) {
      addToast('Error converting draft to invoice', 'error');
    }
  };

  const handleSendDraft = async (draftId) => {
    try {
      const invoice = await convertDraftToInvoice(draftId);
      if (!invoice) {
        throw new Error('Invoice creation failed');
      }
      await sendInvoice(invoice.id);
      addToast(`Invoice ${invoice.invoiceNumber} sent successfully!`, 'success');
    } catch (error) {
      addToast('Error sending draft', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotal = (draft) => {
    return draft.lineItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  };

  const formatCurrency = (amount, currencyCode = baseCurrency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Draft Invoices
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage your unsent invoice drafts ({drafts.length} total)
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            {selectedDrafts.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedDrafts.length})
              </button>
            )}
            <Link
              to="/invoices/create"
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              New Invoice
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Drafts</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {drafts.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">Last 7 Days</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {drafts.filter(d => new Date(d.savedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Amount</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(drafts.reduce((sum, draft) => sum + calculateTotal(draft), 0))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">Items in Drafts</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {drafts.reduce((sum, draft) => sum + (draft.lineItems?.length || 0), 0)}
            </div>
          </div>
        </div>

        {/* Drafts List */}
        {drafts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No draft invoices
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You haven't saved any invoice drafts yet.
            </p>
            <Link
              to="/invoices/create"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Your First Invoice
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedDrafts.length === drafts.length && drafts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDrafts(drafts.map(d => d.id));
                      } else {
                        setSelectedDrafts([]);
                      }
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select all ({drafts.length})
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDrafts([])}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear selection
                </button>
              </div>
            </div>

            {/* Drafts Grid */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedDrafts.includes(draft.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedDrafts.includes(draft.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDrafts([...selectedDrafts, draft.id]);
                          } else {
                            setSelectedDrafts(selectedDrafts.filter(id => id !== draft.id));
                          }
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded border-gray-300 dark:border-gray-600 mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <Link
                              to={`/invoices/edit/${draft.id}`}
                              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600"
                            >
                              {draft.invoiceNumber}
                            </Link>
                            {draft.customer && (
                              <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-300">
                                <User className="w-4 h-4 mr-1" />
                                {draft.customer.name || draft.customer}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                              {formatCurrency(calculateTotal(draft), draft.currency || baseCurrency)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              Saved {formatDate(draft.savedAt)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Line items preview */}
                        {draft.lineItems && draft.lineItems.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                              Items: {draft.lineItems.length}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {draft.lineItems.slice(0, 3).map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300"
                                >
                                  {item.description}
                                </span>
                              ))}
                              {draft.lineItems.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                                  +{draft.lineItems.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSendDraft(draft.id)}
                        className="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                        title="Send Invoice"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/invoices/edit/${draft.id}`}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteDraft(draft.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Drafts;
