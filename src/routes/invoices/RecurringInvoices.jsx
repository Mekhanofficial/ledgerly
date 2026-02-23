import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  MoreVertical, 
  PlayCircle, 
  X,
  ChevronDown,
  Check
} from 'lucide-react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useAccount } from '../../context/AccountContext';
import { recurringStorage } from '../../utils/recurringStorage';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { saveInvoice } from '../../utils/invoiceStorage';
import TablePagination from '../../components/ui/TablePagination';
import { useTablePagination } from '../../hooks/usePagination';

const RecurringInvoices = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  const authUser = useSelector((state) => state.auth?.user);
  const recurringUserId = authUser?.id || authUser?._id || null;
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [recurringInvoices, setRecurringInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(null);

  useEffect(() => {
    loadRecurringInvoices();
  }, [recurringUserId]);

  const loadRecurringInvoices = () => {
    setLoading(true);
    try {
      const invoices = recurringStorage.getRecurringInvoices(recurringUserId);
      setRecurringInvoices(invoices);
    } catch (error) {
      console.error('Error loading recurring invoices:', error);
      addToast('Error loading recurring invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseResume = (invoiceId) => {
    try {
      const invoice = recurringInvoices.find(inv => inv.id === invoiceId);
      if (!invoice) return;

      const newStatus = invoice.status === 'active' ? 'paused' : 'active';
      
      if (newStatus === 'paused') {
        recurringStorage.pauseRecurring(invoiceId, recurringUserId);
        addToast('Recurring invoice paused', 'success');
      } else {
        recurringStorage.resumeRecurring(invoiceId, recurringUserId);
        addToast('Recurring invoice resumed', 'success');
      }
      
      loadRecurringInvoices();
    } catch (error) {
      addToast('Error updating recurring invoice', 'error');
    }
  };

  const handleEdit = (invoiceId) => {
    // Navigate to edit page or show edit modal
    console.log('Edit invoice:', invoiceId);
    addToast('Edit feature coming soon', 'info');
  };

  const handleDelete = (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this recurring invoice profile?')) {
      try {
        recurringStorage.deleteRecurring(invoiceId, recurringUserId);
        addToast('Recurring invoice deleted', 'success');
        // Remove from selected if it was selected
        setSelectedInvoices(prev => prev.filter(id => id !== invoiceId));
        loadRecurringInvoices();
      } catch (error) {
        addToast('Error deleting recurring invoice', 'error');
      }
    }
  };

  const handleDeleteSelected = () => {
    if (selectedInvoices.length === 0) {
      addToast('No invoices selected', 'warning');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedInvoices.length} selected recurring invoice(s)?`)) {
      try {
        selectedInvoices.forEach(id => recurringStorage.deleteRecurring(id, recurringUserId));
        addToast('Selected recurring invoices deleted', 'success');
        setSelectedInvoices([]);
        loadRecurringInvoices();
      } catch (error) {
        addToast('Error deleting recurring invoices', 'error');
      }
    }
  };

  const handleGenerateNow = (invoiceId) => {
    try {
      const invoice = recurringInvoices.find(inv => inv.id === invoiceId);
      if (!invoice) return;
      const invoiceCurrency = invoice.currency || baseCurrency;

      // Generate invoice from recurring profile
      const newInvoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const invoiceData = {
        id: `inv_${Date.now()}`,
        invoiceNumber: newInvoiceNumber,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentTerms: 'net-30',
        customer: invoice.customer,
        lineItems: invoice.lineItems || [
          { description: invoice.name, quantity: 1, rate: invoice.amount, tax: 0, amount: invoice.amount }
        ],
        subtotal: invoice.amount,
        totalTax: 0,
        totalAmount: invoice.amount,
        notes: 'Generated from recurring invoice profile',
        terms: '',
        currency: invoiceCurrency,
        status: 'sent',
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // Save to invoices
      saveInvoice(invoiceData);

      // Generate PDF
      const pdfDoc = generateInvoicePDF(invoiceData);
      pdfDoc.save(`${newInvoiceNumber}.pdf`);
      
      // Update cycles completed
      const updatedCycles = (invoice.cyclesCompleted || 0) + 1;
      recurringStorage.updateRecurring(invoiceId, { 
        cyclesCompleted: updatedCycles,
        nextRun: calculateNextRun(invoice.frequency, invoice.startDate, updatedCycles)
      }, recurringUserId);

      addToast(`Invoice generated: ${newInvoiceNumber}`, 'success');
      loadRecurringInvoices();
    } catch (error) {
      addToast('Error generating invoice', 'error');
    }
  };

  const calculateNextRun = (frequency, startDate, cyclesCompleted) => {
    const start = new Date(startDate);
    let nextRun = new Date(start);
    
    switch(frequency) {
      case 'daily':
        nextRun.setDate(start.getDate() + cyclesCompleted);
        break;
      case 'weekly':
        nextRun.setDate(start.getDate() + (cyclesCompleted * 7));
        break;
      case 'biweekly':
        nextRun.setDate(start.getDate() + (cyclesCompleted * 14));
        break;
      case 'monthly':
        nextRun.setMonth(start.getMonth() + cyclesCompleted);
        break;
      case 'quarterly':
        nextRun.setMonth(start.getMonth() + (cyclesCompleted * 3));
        break;
      case 'yearly':
        nextRun.setFullYear(start.getFullYear() + cyclesCompleted);
        break;
      default:
        return startDate;
    }
    
    return nextRun.toISOString().split('T')[0];
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      biweekly: 'Bi-weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly'
    };
    return labels[frequency] || frequency;
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      paused: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getFrequencyColor = (frequency) => {
    const colors = {
      'Weekly': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Bi-weekly': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      'Monthly': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Quarterly': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
      'Yearly': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'Daily': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    };
    return colors[frequency] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const filteredInvoices = recurringInvoices.filter(invoice => {
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesSearch = !searchTerm || 
      invoice.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    paginatedItems: paginatedInvoices
  } = useTablePagination(filteredInvoices, { initialRowsPerPage: 10 });

  const handleCreateNew = () => {
    window.location.href = '/invoices/create';
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

  const formatCurrency = (value, currencyCode = baseCurrency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  // Calculate stats
  const activeInvoices = recurringInvoices.filter(inv => inv.status === 'active');
  const totalValue = activeInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const next30Days = activeInvoices.filter(inv => {
    if (!inv.nextRun) return false;
    const nextRun = new Date(inv.nextRun);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return nextRun <= thirtyDaysFromNow;
  }).length;

  const stats = [
    { label: 'Active Profiles', value: activeInvoices.length, icon: Play, color: 'bg-emerald-500' },
    { label: 'Total Value', value: totalValue, icon: Calendar, color: 'bg-blue-500' },
    { label: 'Customers', value: [...new Set(recurringInvoices.map(inv => inv.customer?.name || inv.customer))].length, icon: Plus, color: 'bg-violet-500' },
    { label: 'Next 30 Days', value: next30Days, icon: Calendar, color: 'bg-amber-500' }
  ];

  // Mobile card component
  const MobileRecurringCard = ({ invoice }) => {
    const isActionsOpen = showMobileActions === invoice.id;
    
    return (
      <div className={`p-4 border rounded-lg mb-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center flex-1 min-w-0">
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
            <div className="ml-3 min-w-0 flex-1">
              <div className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {invoice.name || `Recurring Invoice #${invoice.id?.substring(0, 8)}`}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {invoice.invoiceNumber || invoice.id}
              </div>
            </div>
          </div>
          <div className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadge(invoice.status)}`}>
            {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1) || 'Active'}
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer</div>
              <div className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {invoice.customer?.name || (typeof invoice.customer === 'string' ? invoice.customer : 'No customer')}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</div>
              <div className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(invoice.amount, invoice.currency || baseCurrency)}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Frequency</div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium truncate ${getFrequencyColor(getFrequencyLabel(invoice.frequency))}`}>
                {getFrequencyLabel(invoice.frequency)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Next Run</div>
              <div className="text-sm truncate">{formatDate(invoice.nextRun)}</div>
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Progress</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {invoice.cyclesCompleted || 0} of {invoice.totalCycles || '∞'}
                </span>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {invoice.totalCycles ? 
                    `${Math.round(((invoice.cyclesCompleted || 0) / invoice.totalCycles) * 100)}%` : 
                    'Ongoing'}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-primary-600 h-1.5 rounded-full" 
                  style={{ 
                    width: invoice.totalCycles ? 
                      `${((invoice.cyclesCompleted || 0) / invoice.totalCycles) * 100}%` : 
                      '100%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex space-x-2">
            {invoice.status === 'active' && (
              <button 
                onClick={() => handleGenerateNow(invoice.id)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-700 text-emerald-400' : 'hover:bg-gray-100 text-emerald-600'
                }`}
                title="Generate Now"
              >
                <PlayCircle className="w-4 h-4" />
              </button>
            )}
            {invoice.status === 'active' ? (
              <button 
                onClick={() => handlePauseResume(invoice.id)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-700 text-amber-400' : 'hover:bg-gray-100 text-amber-600'
                }`}
                title="Pause"
              >
                <Pause className="w-4 h-4" />
              </button>
            ) : invoice.status === 'paused' ? (
              <button 
                onClick={() => handlePauseResume(invoice.id)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-700 text-emerald-400' : 'hover:bg-gray-100 text-emerald-600'
                }`}
                title="Resume"
              >
                <Play className="w-4 h-4" />
              </button>
            ) : null}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMobileActions(isActionsOpen ? null : invoice.id)}
              className={`p-2 rounded-lg ${
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
                <div className={`absolute right-0 mt-1 w-40 rounded-lg shadow-lg py-1 z-20 ${
                  isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <button 
                    onClick={() => {
                      handleEdit(invoice.id);
                      setShowMobileActions(null);
                    }}
                    className={`w-full px-4 py-2 text-sm text-left flex items-center ${
                      isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </button>
                  <button 
                    onClick={() => {
                      handleDelete(invoice.id);
                      setShowMobileActions(null);
                    }}
                    className={`w-full px-4 py-2 text-sm text-left flex items-center ${
                      isDarkMode 
                        ? 'hover:bg-gray-700 text-red-400' 
                        : 'hover:bg-gray-100 text-red-600'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading recurring invoices...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
              Recurring Invoices
            </h1>
            <p className={`mt-1 text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Automate your regular billing with recurring invoice profiles
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {selectedInvoices.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="hidden sm:flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm md:text-base whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                <span className="hidden md:inline">Delete Selected</span>
                <span className="md:hidden">Delete</span>
                <span className="ml-1">({selectedInvoices.length})</span>
              </button>
            )}
            <button 
              onClick={handleCreateNew}
              className="flex items-center justify-center px-3 py-2 md:px-4 md:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm md:text-base whitespace-nowrap"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">New Profile</span>
              <span className="sm:hidden">New</span>
            </button>
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
              placeholder="Search recurring invoices..."
              className={`w-full pl-10 pr-4 py-2.5 md:py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm md:text-base ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'border border-gray-300'
              }`}
            />
          </div>
          
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="sm:hidden flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
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
                  {['all', 'active', 'paused', 'completed'].map((status) => (
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
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                        statusFilter === status
                          ? 'bg-white/30 text-white'
                          : isDarkMode
                            ? 'bg-gray-600 text-gray-300'
                            : 'bg-gray-300 text-gray-700'
                      }`}>
                        {recurringInvoices.filter(inv => status === 'all' || inv.status === status).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const displayValue = index === 1
              ? `${formatCurrency(stat.value)}/mo`
              : stat.value.toString();
            
            return (
              <div key={index} className={`border rounded-lg p-3 md:p-4 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs md:text-sm truncate ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {stat.label}
                    </p>
                    <p className={`text-lg md:text-xl font-bold mt-1 truncate ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {displayValue}
                    </p>
                  </div>
                  <div className={`${stat.color} w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center ml-2 flex-shrink-0`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Status Filter */}
        <div className="hidden sm:flex flex-wrap gap-2">
          {['all', 'active', 'paused', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-primary-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                statusFilter === status
                  ? 'bg-white/30 text-white'
                  : isDarkMode
                    ? 'bg-gray-600 text-gray-300'
                    : 'bg-gray-300 text-gray-700'
              }`}>
                {recurringInvoices.filter(inv => status === 'all' || inv.status === status).length}
              </span>
            </button>
          ))}
        </div>

        {/* Selection Bar */}
        {selectedInvoices.length > 0 && (
          <div className={`sticky top-16 z-10 p-3 md:p-4 rounded-lg ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center">
                <Check className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-primary-400' : 'text-primary-600'}`} />
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedInvoices.length} profile{selectedInvoices.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Delete Selected
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

        {/* Count Display */}
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Showing {filteredInvoices.length} of {recurringInvoices.length} profiles
        </div>

        {/* Empty State */}
        {filteredInvoices.length === 0 ? (
          <div className={`border rounded-lg p-8 md:p-12 text-center ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <Calendar className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`} />
            <h3 className={`text-base md:text-lg font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              No recurring invoices found
            </h3>
            <p className={`text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
              Create your first recurring invoice profile
            </p>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm md:text-base"
            >
              Create Recurring Invoice
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className={`hidden lg:block border rounded-lg overflow-hidden ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className="px-4 md:px-6 py-3">
                        <input
                          type="checkbox"
                          className={`h-4 w-4 text-primary-600 focus:ring-primary-500 rounded ${
                            isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'
                          }`}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvoices(filteredInvoices.map(inv => inv.id));
                            } else {
                              setSelectedInvoices([]);
                            }
                          }}
                          checked={filteredInvoices.length > 0 && selectedInvoices.length === filteredInvoices.length}
                        />
                      </th>
                      <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Profile
                      </th>
                      <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Customer
                      </th>
                      <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Amount & Frequency
                      </th>
                      <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Next Run
                      </th>
                      <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Status
                      </th>
                      <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Progress
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
                    {paginatedInvoices.map((invoice) => (
                      <tr key={invoice.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-4 md:px-6 py-4">
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
                              isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'
                            }`}
                          />
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="min-w-0">
                            <div className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {invoice.name || `Recurring Invoice #${invoice.id?.substring(0, 8)}`}
                            </div>
                            <div className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {invoice.invoiceNumber || invoice.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="min-w-0">
                            <div className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {invoice.customer?.name || (typeof invoice.customer === 'string' ? invoice.customer : 'No customer')}
                            </div>
                            <div className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {invoice.customer?.email || ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(invoice.amount, invoice.currency || baseCurrency)}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(getFrequencyLabel(invoice.frequency))}`}>
                              {getFrequencyLabel(invoice.frequency)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDate(invoice.nextRun)}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                            {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1) || 'Active'}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                {invoice.cyclesCompleted || 0} of {invoice.totalCycles || '∞'}
                              </span>
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                {invoice.totalCycles ? 
                                  `${Math.round(((invoice.cyclesCompleted || 0) / invoice.totalCycles) * 100)}%` : 
                                  'Ongoing'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div 
                                className="bg-primary-600 h-1.5 rounded-full" 
                                style={{ 
                                  width: invoice.totalCycles ? 
                                    `${((invoice.cyclesCompleted || 0) / invoice.totalCycles) * 100}%` : 
                                    '100%'
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1 md:space-x-2">
                            {invoice.status === 'active' && (
                              <button 
                                onClick={() => handleGenerateNow(invoice.id)}
                                className={`p-1 rounded ${
                                  isDarkMode ? 'hover:bg-gray-700 text-emerald-400' : 'hover:bg-gray-100 text-emerald-600'
                                }`}
                                title="Generate Now"
                              >
                                <PlayCircle className="w-4 h-4" />
                              </button>
                            )}
                            {invoice.status === 'active' ? (
                              <button 
                                onClick={() => handlePauseResume(invoice.id)}
                                className={`p-1 rounded ${
                                  isDarkMode ? 'hover:bg-gray-700 text-amber-400' : 'hover:bg-gray-100 text-amber-600'
                                }`}
                                title="Pause"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            ) : invoice.status === 'paused' ? (
                              <button 
                                onClick={() => handlePauseResume(invoice.id)}
                                className={`p-1 rounded ${
                                  isDarkMode ? 'hover:bg-gray-700 text-emerald-400' : 'hover:bg-gray-100 text-emerald-600'
                                }`}
                                title="Resume"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            ) : null}
                            <button 
                              onClick={() => handleEdit(invoice.id)}
                              className={`p-1 rounded ${
                                isDarkMode ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-100 text-blue-600'
                              }`}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(invoice.id)}
                              className={`p-1 rounded ${
                                isDarkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'
                              }`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {paginatedInvoices.map((invoice) => (
                <MobileRecurringCard key={invoice.id} invoice={invoice} />
              ))}
            </div>

            <TablePagination
              page={page}
              totalItems={filteredInvoices.length}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
              isDarkMode={isDarkMode}
              itemLabel="profiles"
              className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700"
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RecurringInvoices;
