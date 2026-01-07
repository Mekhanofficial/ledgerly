// src/routes/invoices/InvoiceList.js
import React, { useState, useEffect } from 'react';
import { MoreVertical, Eye, Mail, Download, Search, FileText, DollarSign, Calendar, Users } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import InvoiceFilters from '../../components/invoices/InvoiceFilters';
import { useTheme } from '../../context/ThemeContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useNavigate } from 'react-router-dom';

const InvoiceList = () => {
  const { isDarkMode } = useTheme();
  const { 
    invoices, 
    sendInvoice, 
    markAsPaid, 
    deleteInvoice,
    getInvoiceStats,
    filterInvoices,
    exportInvoices,
    exportInvoicesAsCSV
  } = useInvoice();
  
  const navigate = useNavigate();
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  // Update filtered invoices when filters change
  useEffect(() => {
    const filtered = filterInvoices({
      status: statusFilter,
      dateRange: dateRange,
      minAmount: amountRange.min ? parseFloat(amountRange.min) : null,
      maxAmount: amountRange.max ? parseFloat(amountRange.max) : null,
      search: searchTerm
    });
    setFilteredInvoices(filtered);
  }, [statusFilter, dateRange, amountRange, searchTerm, invoices]);

  // Get real-time stats
  const statsData = getInvoiceStats();
  
  const stats = [
    { label: 'Total Invoices', value: statsData.totalInvoices, icon: FileText },
    { label: 'Total Amount', value: statsData.totalAmount, icon: DollarSign },
    { label: 'Paid Amount', value: statsData.paidAmount, icon: DollarSign },
    { label: 'Overdue', value: statsData.overdueAmount, icon: Calendar },
    { label: 'Drafts', value: statsData.draftInvoices, icon: FileText },
    { label: 'Sent', value: statsData.sentInvoices, icon: Mail }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      viewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'Draft',
      sent: 'Sent',
      viewed: 'Viewed',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const handleExport = () => {
    if (selectedInvoices.length > 0) {
      exportInvoices(selectedInvoices);
    } else {
      exportInvoicesAsCSV();
    }
  };

  const handleCreateInvoice = () => {
    navigate('/invoices/create');
  };

  const handleSendInvoice = (invoiceId) => {
    sendInvoice(invoiceId);
  };

  const handleMarkAsPaid = (invoiceId) => {
    markAsPaid(invoiceId);
  };

  const handleDeleteInvoice = (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(invoiceId);
      setSelectedInvoices(selectedInvoices.filter(id => id !== invoiceId));
    }
  };

  const handleViewInvoice = (invoiceId) => {
    navigate(`/invoices/view/${invoiceId}`);
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically via useEffect
  };

  // Format date for display
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

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Invoices
            </h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage and track all your invoices
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={handleCreateInvoice}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              New Invoice
            </button>
            <button
              onClick={() => navigate('/invoices/drafts')}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              View Drafts
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice number or customer name..."
            className={`w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                : 'border border-gray-300'
            }`}
          />
        </div>

        {/* Filters Component */}
        <InvoiceFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          amountRange={amountRange}
          setAmountRange={setAmountRange}
          onExport={handleExport}
          onCreateInvoice={handleCreateInvoice}
          onApplyFilters={handleApplyFilters}
          selectedCount={selectedInvoices.length}
          totalCount={filteredInvoices.length}
          stats={stats}
        />

        {/* Invoices Table */}
        <div className={`border rounded-xl overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Table Header */}
          <div className={`px-6 py-4 border-b ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className={`h-4 w-4 text-primary-600 focus:ring-primary-500 rounded ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedInvoices(filteredInvoices.map(inv => inv.id));
                    } else {
                      setSelectedInvoices([]);
                    }
                  }}
                  checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                />
                <span className={`ml-3 text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {selectedInvoices.length > 0 
                    ? `Selected ${selectedInvoices.length} invoices` 
                    : `Select all invoices (${filteredInvoices.length})`
                  }
                </span>
              </div>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Showing {filteredInvoices.length} of {invoices.length} invoices
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Invoice #
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Customer
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Issue Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Due Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Amount
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {invoices.length === 0 
                        ? 'No invoices found. Create your first invoice!' 
                        : searchTerm 
                          ? 'No invoices match your search. Try a different search term.' 
                          : 'No invoices match the selected filters.'
                      }
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedInvoices([...selectedInvoices, invoice.id]);
                              } else {
                                setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id));
                              }
                            }}
                            className={`h-4 w-4 text-primary-600 focus:ring-primary-500 rounded ${
                              isDarkMode ? 'border-gray-600' : 'border-gray-300'
                            }`}
                          />
                          <div className="ml-4">
                            <div className={`text-sm font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {invoice.number || invoice.invoiceNumber}
                            </div>
                            <div className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {invoice.lineItems ? invoice.lineItems.length : 0} items
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {invoice.customer}
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {invoice.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {formatDate(invoice.issueDate || invoice.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {formatDate(invoice.dueDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${(invoice.totalAmount || invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewInvoice(invoice.id)}
                            className={`p-1 rounded ${
                              isDarkMode 
                                ? 'hover:bg-gray-700 text-gray-400' 
                                : 'hover:bg-gray-100 text-gray-600'
                            }`} 
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {invoice.status !== 'sent' && invoice.status !== 'paid' && invoice.status !== 'draft' && (
                            <button 
                              onClick={() => handleSendInvoice(invoice.id)}
                              className={`p-1 rounded ${
                                isDarkMode 
                                  ? 'hover:bg-gray-700 text-gray-400' 
                                  : 'hover:bg-gray-100 text-gray-600'
                              }`} 
                              title="Send"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          )}
                          {invoice.status === 'sent' && (
                            <button 
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              className={`p-1 rounded ${
                                isDarkMode 
                                  ? 'hover:bg-gray-700 text-emerald-400' 
                                  : 'hover:bg-gray-100 text-emerald-600'
                              }`} 
                              title="Mark as Paid"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className={`p-1 rounded ${
                              isDarkMode 
                                ? 'hover:bg-gray-700 text-red-400' 
                                : 'hover:bg-gray-100 text-red-600'
                            }`}
                            title="Delete"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={`px-6 py-4 border-t ${
            isDarkMode 
              ? 'border-gray-700' 
              : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Showing {filteredInvoices.length} of {invoices.length} invoices
              </div>
              <div className="flex items-center space-x-2">
                <button className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  Previous
                </button>
                <button className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceList;