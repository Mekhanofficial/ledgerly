import React, { useState, useEffect } from 'react';
import { 
  MoreVertical, 
  Eye, 
  Mail, 
  Download, 
  Search, 
  FileText, 
  DollarSign, 
  Calendar,
  ChevronDown,
  Filter,
  Check,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useTheme } from '../../context/ThemeContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useAccount } from '../../context/AccountContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';

const InvoiceList = () => {
  const { isDarkMode } = useTheme();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  const formatMoney = (value, currencyCode) => formatCurrency(value, currencyCode || baseCurrency);
  const currencySymbol = getCurrencySymbol(baseCurrency);
  const authUser = useSelector((state) => state.auth?.user);
  const normalizedRole = String(authUser?.role || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  const isClient = normalizedRole === 'client';
  const canRecordPayment = ['admin', 'accountant', 'super_admin'].includes(normalizedRole);
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(null); // Track which invoice's actions are open

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
    { 
      label: 'Total Invoices', 
      value: statsData.totalInvoices, 
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400'
    },
    { 
      label: 'Total Amount', 
      value: statsData.totalAmount, 
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400'
    },
    { 
      label: 'Paid Amount', 
      value: statsData.paidAmount, 
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    { 
      label: 'Overdue', 
      value: statsData.overdueAmount, 
      icon: Calendar,
      color: 'text-red-600 dark:text-red-400'
    },
    { 
      label: 'Drafts', 
      value: statsData.draftInvoices, 
      icon: FileText,
      color: 'text-gray-600 dark:text-gray-400'
    },
    { 
      label: 'Sent', 
      value: statsData.sentInvoices, 
      icon: Mail,
      color: 'text-purple-600 dark:text-purple-400'
    }
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

  const canMarkAsPaid = (status) => ['sent', 'partial', 'overdue', 'viewed'].includes(status);

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
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setDateRange('all');
    setAmountRange({ min: '', max: '' });
    setSearchTerm('');
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

  // Mobile invoice card component
  const MobileInvoiceCard = ({ invoice }) => {
    const isActionsOpen = showMobileActions === invoice.id;
    
    return (
      <div className={`p-4 border rounded-lg mb-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center flex-1 min-w-0">
            {!isClient && (
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
                className={`h-4 w-4 text-primary-600 focus:ring-primary-500 rounded flex-shrink-0 ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                }`}
              />
            )}
            <div className="ml-3 min-w-0">
              <div className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {invoice.number || invoice.invoiceNumber}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {invoice.customer?.name || (typeof invoice.customer === 'string' ? invoice.customer : '')}
              </div>
            </div>
          </div>
          <div className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadge(invoice.status)}`}>
            {getStatusText(invoice.status)}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Issue Date</div>
            <div className="text-sm truncate">{formatDate(invoice.issueDate || invoice.createdAt)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Due Date</div>
            <div className="text-sm truncate">{formatDate(invoice.dueDate)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</div>
            <div className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatMoney(invoice.totalAmount || invoice.amount || 0, invoice.currency || baseCurrency)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Items</div>
            <div className="text-sm truncate">{invoice.lineItems ? invoice.lineItems.length : 0} items</div>
          </div>
        </div>
        
        <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
          <button 
            onClick={() => handleViewInvoice(invoice.id)}
            className={`flex-1 px-2 py-1.5 rounded-lg text-center text-xs font-medium mr-2 ${
              isDarkMode 
                ? 'text-primary-400 hover:bg-gray-700' 
                : 'text-primary-600 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-3 h-3 inline mr-1 align-text-bottom" /> View
          </button>
          
          {!isClient && (
            <div className="relative">
              <button
                onClick={() => setShowMobileActions(isActionsOpen ? null : invoice.id)}
                className={`px-3 py-1.5 rounded-lg ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {isActionsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMobileActions(null)}
                  />
                  <div className={`absolute right-0 mt-1 w-48 rounded-lg shadow-lg py-1 z-20 ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}>
                    {invoice.status !== 'sent' && invoice.status !== 'paid' && invoice.status !== 'draft' && (
                      <button 
                        onClick={() => {
                          handleSendInvoice(invoice.id);
                          setShowMobileActions(null);
                        }}
                        className={`w-full px-4 py-2 text-sm text-left flex items-center ${
                          isDarkMode 
                            ? 'hover:bg-gray-700 text-gray-300' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Mail className="w-4 h-4 mr-2" /> Send
                      </button>
                    )}
                    {canMarkAsPaid(invoice.status) && canRecordPayment && (
                      <button 
                        onClick={() => {
                          handleMarkAsPaid(invoice.id);
                          setShowMobileActions(null);
                        }}
                        className={`w-full px-4 py-2 text-sm text-left flex items-center ${
                          isDarkMode 
                          ? 'hover:bg-gray-700 text-emerald-400' 
                          : 'hover:bg-gray-100 text-emerald-600'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Mark as Paid
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        handleDeleteInvoice(invoice.id);
                        setShowMobileActions(null);
                      }}
                      className={`w-full px-4 py-2 text-sm text-left flex items-center ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 text-red-400' 
                          : 'hover:bg-gray-100 text-red-600'
                      }`}
                    >
                      <X className="w-4 h-4 mr-2" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
              Invoices
            </h1>
            <p className={`mt-1 text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {isClient ? 'View and track your invoices' : 'Manage and track all your invoices'}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {!isClient && (
              <>
                <button
                  onClick={() => navigate('/invoices/drafts')}
                  className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm whitespace-nowrap"
                >
                  Drafts
                </button>
                <button
                  onClick={handleCreateInvoice}
                  className="flex items-center justify-center px-3 py-2 md:px-4 md:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm md:text-base whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">New Invoice</span>
                  <span className="sm:hidden">New</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Bar and Mobile Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search invoices..."
              className={`w-full pl-10 pr-4 py-2.5 md:py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm md:text-base ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'border border-gray-300'
              }`}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button
              onClick={clearFilters}
              className="flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Mobile Filters Panel */}
        {showMobileFilters && (
          <div className={`sm:hidden p-4 border rounded-lg ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'draft', 'sent', 'paid', 'overdue'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        statusFilter === status
                          ? 'bg-primary-600 text-white'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Min Amount
                  </label>
                  <input
                    type="number"
                    value={amountRange.min}
                    onChange={(e) => setAmountRange({...amountRange, min: e.target.value})}
                    placeholder={`${currencySymbol}0`}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Max Amount
                  </label>
                  <input
                    type="number"
                    value={amountRange.max}
                    onChange={(e) => setAmountRange({...amountRange, max: e.target.value})}
                    placeholder={`${currencySymbol}10000`}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
              
              <button
                onClick={handleApplyFilters}
                className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Desktop Filters */}
        <div className={`hidden sm:block p-4 border rounded-lg ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300'
                }`}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300'
                }`}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              
              <input
                type="number"
                value={amountRange.min}
                onChange={(e) => setAmountRange({...amountRange, min: e.target.value})}
                placeholder="Min Amount"
                className={`px-3 py-2 rounded-lg border text-sm w-32 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300'
                }`}
              />
              
              <input
                type="number"
                value={amountRange.max}
                onChange={(e) => setAmountRange({...amountRange, max: e.target.value})}
                placeholder="Max Amount"
                className={`px-3 py-2 rounded-lg border text-sm w-32 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300'
                }`}
              />
            </div>
            
            <div className="flex items-center gap-2">
              {!isClient && (
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid - SINGLE STATS SECTION */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`p-3 md:p-4 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700' 
                    : 'bg-gray-100'
                }`}>
                  <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <div className={`text-xs md:text-sm truncate ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {stat.label}
                  </div>
                  <div className={`text-base md:text-lg font-semibold mt-1 truncate ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selection Bar */}
        {!isClient && selectedInvoices.length > 0 && (
          <div className={`sticky top-16 z-10 p-3 md:p-4 rounded-lg ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center">
                <Check className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-primary-400' : 'text-primary-600'}`} />
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedInvoices.length} invoice{selectedInvoices.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  Export Selected
                </button>
                <button
                  onClick={() => setSelectedInvoices([])}
                  className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Count */}
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </div>

        {/* Invoices Table (Desktop) */}
        <div className={`hidden lg:block border rounded-xl overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Invoice #
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Customer
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Issue Date
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Due Date
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Amount
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
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
                    <td colSpan="7" className="px-4 md:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {invoices.length === 0 
                        ? (isClient ? 'No invoices found.' : 'No invoices found. Create your first invoice!') 
                        : searchTerm 
                          ? 'No invoices match your search. Try a different search term.' 
                          : 'No invoices match the selected filters.'
                      }
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {!isClient && (
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
                          )}
                          <div className={`${!isClient ? 'ml-3 md:ml-4' : ''}`}>
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
                      <td className="px-4 md:px-6 py-4">
                        <div>
                          <div className={`text-sm font-medium truncate max-w-xs ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {invoice.customer?.name || (typeof invoice.customer === 'string' ? invoice.customer : '')}
                          </div>
                          <div className={`text-xs truncate max-w-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {invoice.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {formatDate(invoice.issueDate || invoice.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {formatDate(invoice.dueDate)}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatMoney(invoice.totalAmount || invoice.amount || 0, invoice.currency || baseCurrency)}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 md:space-x-2">
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
                          {!isClient && (
                            <>
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
                              {canMarkAsPaid(invoice.status) && canRecordPayment && (
                                <button 
                                  onClick={() => handleMarkAsPaid(invoice.id)}
                                  className={`p-1 rounded ${
                                    isDarkMode 
                                      ? 'hover:bg-gray-700 text-emerald-400' 
                                      : 'hover:bg-gray-100 text-emerald-600'
                                  }`} 
                                  title="Mark as Paid"
                                >
                                  <CheckCircle className="w-4 h-4" />
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
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Invoice Cards */}
        <div className="lg:hidden space-y-3">
          {filteredInvoices.length === 0 ? (
            <div className={`p-8 text-center rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-gray-400' 
                : 'bg-white border-gray-200 text-gray-500'
            }`}>
              {invoices.length === 0 
                ? (isClient ? 'No invoices found.' : 'No invoices found. Create your first invoice!') 
                : searchTerm 
                  ? 'No invoices match your search. Try a different search term.' 
                  : 'No invoices match the selected filters.'
              }
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <MobileInvoiceCard key={invoice.id} invoice={invoice} />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceList;
