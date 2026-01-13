// src/routes/payments/Payments.js - RESPONSIVE VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Plus, Filter, Download, BarChart3, RefreshCw, Eye, CheckCircle, Clock, XCircle, DollarSign, Trash2, AlertTriangle, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import PaymentStats from '../../components/payments/PaymentStats';
import PaymentTable from '../../components/payments/PaymentTable';
import { useTheme } from '../../context/ThemeContext';
import { usePayments } from '../../context/PaymentContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useToast } from '../../context/ToastContext';

const Payments = () => {
  const { isDarkMode } = useTheme();
  const { 
    paymentMethods, 
    transactions, 
    getPaymentStats, 
    getTransactionsByDateRange,
    syncPayments,
    processPayment,
    processRefund,
    deleteAllPayments
  } = usePayments();
  const { invoices } = useInvoice();
  const { addToast } = useToast();
  
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load stats and filter transactions
  useEffect(() => {
    const stats = getPaymentStats();
    setPaymentStats(stats);
    
    const filtered = getTransactionsByDateRange(dateRange);
    
    // Apply status filter
    if (filter !== 'all') {
      const statusMap = {
        'completed': 'completed',
        'pending': 'pending',
        'failed': 'failed',
        'refunded': 'refunded'
      };
      
      const targetStatus = statusMap[filter];
      setFilteredTransactions(filtered.filter(t => t.status === targetStatus));
    } else {
      setFilteredTransactions(filtered);
    }
  }, [filter, dateRange, transactions, getPaymentStats, getTransactionsByDateRange]);

  const handleViewDetails = (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      addToast(`Viewing details for transaction ${transactionId}`, 'info');
      console.log('Transaction details:', transaction);
    }
  };

  const handleProcessPayment = (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      addToast('Invoice not found', 'error');
      return;
    }
    
    addToast(`Processing payment for invoice ${invoice.number || invoice.invoiceNumber}`, 'info');
    
    const defaultPaymentMethod = paymentMethods.find(m => m.isDefault);
    if (defaultPaymentMethod) {
      processPayment({
        invoiceId,
        amount: invoice.totalAmount || invoice.amount || 0,
        paymentMethodId: defaultPaymentMethod.id,
        customerId: invoice.customerId,
        notes: 'Manual payment processing'
      }).catch(error => {
        console.error('Payment processing error:', error);
      });
    } else {
      addToast('No default payment method found. Please add one first.', 'warning');
    }
  };

  const handleRefund = (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) {
      addToast('Transaction not found', 'error');
      return;
    }
    
    const confirmRefund = window.confirm(
      `Refund $${transaction.amount} to ${transaction.customerName}?`
    );
    
    if (confirmRefund) {
      processRefund(transactionId, {
        amount: transaction.amount,
        reason: 'Customer request'
      }).catch(error => {
        console.error('Refund processing error:', error);
      });
    }
  };

  const handleSyncPayments = async () => {
    setIsSyncing(true);
    try {
      await syncPayments();
    } catch (error) {
      // Error is already handled in syncPayments
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRecordPayment = () => {
    addToast('Opening payment recording form...', 'info');
  };

  const handleDeleteAllPayments = async () => {
    if (!transactions || transactions.length === 0) {
      addToast('No payment history to delete', 'warning');
      setShowDeleteConfirm(false);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAllPayments();
      addToast('All payment history has been deleted successfully', 'success');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting payment history:', error);
      addToast('Failed to delete payment history', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Convert transactions to payment table format
  const paymentsForTable = filteredTransactions.map(transaction => {
    const invoice = invoices.find(inv => inv.id === transaction.invoiceId);
    
    return {
      id: transaction.id,
      transactionId: transaction.id.substring(0, 8).toUpperCase(),
      invoiceId: transaction.invoiceId,
      customer: typeof transaction.customerName === 'object' ? (transaction.customerName?.name || 'Unknown') : transaction.customerName,
      customerEmail: invoice?.customerEmail || 'N/A',
      amount: Math.abs(transaction.amount),
      method: transaction.paymentMethod === 'credit_card' ? 'Credit Card' :
              transaction.paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
              transaction.paymentMethod === 'paypal' ? 'PayPal' :
              transaction.paymentMethod === 'cash' ? 'Cash' :
              transaction.paymentMethod === 'mobile_money' ? 'Mobile Money' :
              transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1),
      date: new Date(transaction.processedAt).toLocaleDateString(),
      time: new Date(transaction.processedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: transaction.status,
      type: transaction.type || 'payment'
    };
  });

  // Calculate payment methods overview
  const paymentMethodStats = React.useMemo(() => {
    const methodCounts = {};
    const methodAmounts = {};
    
    transactions.forEach(t => {
      if (t.amount > 0) {
        const method = t.paymentMethod;
        methodCounts[method] = (methodCounts[method] || 0) + 1;
        methodAmounts[method] = (methodAmounts[method] || 0) + t.amount;
      }
    });
    
    const totalAmount = Object.values(methodAmounts).reduce((a, b) => a + b, 0);
    
    return Object.entries(methodAmounts).map(([method, amount]) => {
      const methodName = method === 'credit_card' ? 'Credit Card' :
                       method === 'bank_transfer' ? 'Bank Transfer' :
                       method === 'paypal' ? 'PayPal' :
                       method === 'cash' ? 'Cash' :
                       method === 'mobile_money' ? 'Mobile Money' : method;
      
      const percentage = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
      
      const colors = {
        'Credit Card': 'bg-blue-500',
        'Bank Transfer': 'bg-emerald-500',
        'PayPal': 'bg-blue-400',
        'Mobile Money': 'bg-purple-500',
        'Cash': 'bg-gray-500'
      };
      
      return {
        method: methodName,
        percentage,
        amount: `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        color: colors[methodName] || 'bg-gray-500',
        count: methodCounts[method] || 0
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [transactions]);

  // Calculate payment status percentages
  const paymentStatusStats = React.useMemo(() => {
    const statusCounts = {
      completed: 0,
      pending: 0,
      failed: 0,
      refunded: 0
    };
    
    transactions.forEach(t => {
      if (t.amount > 0) {
        if (statusCounts[t.status] !== undefined) {
          statusCounts[t.status]++;
        }
      }
    });
    
    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  }, [transactions]);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Mobile Header Controls */}
        {isMobile && (
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Payments
              </h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage payments
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMobileActions(!showMobileActions)}
                className={`p-2 rounded-lg border ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link
                to="/payments/process"
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Payments
              </h1>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage and track customer payments
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button 
                onClick={handleSyncPayments}
                disabled={isSyncing}
                className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Payments'}
              </button>
              <Link
                to="/payments/process"
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Process Payment
              </Link>
              <button 
                onClick={handleRecordPayment}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Record Payment
              </button>
            </div>
          </div>
        )}

        {/* Mobile Actions Dropdown */}
        {isMobile && showMobileActions && (
          <div className={`border rounded-lg mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="space-y-1 p-2">
              <button 
                onClick={handleSyncPayments}
                disabled={isSyncing}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-3 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync Payments
              </button>
              <Link
                to="/payments/process"
                className="w-full flex items-center px-3 py-2.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
              >
                <CheckCircle className="w-4 h-4 mr-3" />
                Process Payment
              </Link>
              <button 
                onClick={handleRecordPayment}
                className="w-full flex items-center px-3 py-2.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-3" />
                Record Payment
              </button>
            </div>
          </div>
        )}

        {/* Stats Component - Mobile Optimized */}
        <div className="mb-4 md:mb-6">
          <PaymentStats stats={paymentStats} isMobile={isMobile} />
        </div>

        {/* Date Range and Filters */}
        <div className={`border rounded-xl ${isMobile ? 'p-3' : 'p-4'} ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Mobile Filter Toggle */}
          {isMobile && (
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`w-full flex items-center justify-between py-2 px-3 mb-3 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                <span className="font-medium text-sm">Filters</span>
              </div>
              {showMobileFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {/* Date Range Filters */}
          <div className={`${isMobile && !showMobileFilters ? 'hidden' : 'block'}`}>
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? 'gap-3' : 'gap-4'}`}>
              {isMobile && (
                <h3 className={`font-medium text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date Range
                </h3>
              )}
              <div className={`flex flex-wrap gap-2 ${isMobile ? 'w-full' : 'flex-1'}`}>
                {['today', 'yesterday', 'this-week', 'this-month', 'last-month'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium capitalize transition-colors ${
                      dateRange === range
                        ? 'bg-primary-600 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range.replace('-', ' ')}
                  </button>
                ))}
              </div>

              {/* Status Filters */}
              {!isMobile && (
                <div className="flex items-center space-x-3">
                  <div className="flex flex-wrap gap-2">
                    {['all', 'completed', 'pending', 'failed', 'refunded'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                          filter === status
                            ? 'bg-primary-600 text-white'
                            : isDarkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  {transactions && transactions.length > 0 && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className={`flex items-center px-3 py-2 border rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'border-red-600 text-red-400 hover:bg-red-900/20' 
                          : 'border-red-300 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear History
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Status Filters */}
            {isMobile && showMobileFilters && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <h3 className={`font-medium text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['all', 'completed', 'pending', 'failed', 'refunded'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilter(status);
                        setShowMobileFilters(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                        filter === status
                          ? 'bg-primary-600 text-white'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                
                {/* Mobile Action Buttons */}
                <div className="flex space-x-2 mt-4">
                  <button className={`flex items-center justify-center flex-1 px-3 py-2 border rounded-lg text-xs ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    <Filter className="w-3 h-3 mr-1.5" />
                    More
                  </button>
                  <button className={`flex items-center justify-center flex-1 px-3 py-2 border rounded-lg text-xs ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    <Download className="w-3 h-3 mr-1.5" />
                    Export
                  </button>
                  {transactions && transactions.length > 0 && (
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setShowMobileFilters(false);
                      }}
                      className={`flex items-center justify-center flex-1 px-3 py-2 border rounded-lg text-xs ${
                        isDarkMode 
                          ? 'border-red-600 text-red-400 hover:bg-red-900/20' 
                          : 'border-red-300 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="w-3 h-3 mr-1.5" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className={`max-w-md w-full rounded-xl p-6 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border shadow-lg`}>
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-lg mr-3 ${
                  isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
                }`}>
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Delete All Payment History
                </h3>
              </div>
              <p className={`mb-6 text-sm md:text-base ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                This action will permanently delete all {transactions.length} payment records. 
                This includes completed payments, pending transactions, failed payments, and refunds. 
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllPayments}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete All
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Table Component */}
        {transactions && transactions.length > 0 ? (
          <div className={`border rounded-xl ${isMobile ? 'p-3' : 'p-4'} ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`mb-4 flex ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
              <h3 className={`font-semibold ${isMobile ? 'text-sm mb-3' : ''} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Payment History ({paymentsForTable.length})
              </h3>
              {!isMobile && (
                <div className="flex items-center space-x-3">
                  <button className={`flex items-center px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                  <button className={`flex items-center px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              )}
            </div>
            <div className={isMobile ? 'overflow-x-auto' : ''}>
              <PaymentTable
                payments={paymentsForTable}
                onViewDetails={handleViewDetails}
                onProcess={handleProcessPayment}
                onRefund={handleRefund}
                isMobile={isMobile}
              />
            </div>
          </div>
        ) : (
          <div className={`border rounded-xl p-6 md:p-8 text-center ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <CreditCard className={`w-12 h-12 mx-auto mb-4 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              No Payment History
            </h3>
            <p className={`mb-6 text-sm md:text-base ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              No payment records found. Process payments or sync with your payment gateway to see transactions here.
            </p>
            <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-center space-x-3'}`}>
              <Link
                to="/payments/process"
                className={`flex items-center justify-center ${isMobile ? 'w-full' : 'px-4'} py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Process Payment
              </Link>
              <button 
                onClick={handleSyncPayments}
                disabled={isSyncing}
                className={`flex items-center justify-center ${isMobile ? 'w-full' : 'px-4'} py-2 border rounded-lg transition-colors text-sm ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync Payments
              </button>
            </div>
          </div>
        )}

        {/* Payment Methods Overview - Responsive Grid */}
        {transactions && transactions.length > 0 && (
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'}`}>
            {/* Payment Methods Card */}
            <div className={`border rounded-xl ${isMobile ? 'p-4' : 'p-6'} ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${isMobile ? 'text-sm' : ''} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Payment Methods
                </h3>
                <button className={`text-xs md:text-sm px-3 py-1 rounded-lg ${
                  isDarkMode 
                    ? 'text-primary-400 hover:bg-gray-700' 
                    : 'text-primary-600 hover:bg-gray-50'
                }`}>
                  Manage
                </button>
              </div>
              <div className="space-y-3">
                {paymentMethodStats.map((item) => (
                  <div key={item.method} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 md:w-3 md:h-3 ${item.color} rounded-full mr-3`}></div>
                      <div>
                        <span className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item.method}
                        </span>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {item.count} transactions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.percentage}%
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {item.amount}
                      </div>
                    </div>
                  </div>
                ))}
                {paymentMethodStats.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No payment data available
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className={`border rounded-xl ${isMobile ? 'p-4' : 'p-6'} ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-semibold mb-4 ${isMobile ? 'text-sm' : ''} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h3>
              <div className="space-y-2 md:space-y-3">
                <button 
                  onClick={handleSyncPayments}
                  disabled={isSyncing}
                  className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors text-sm ${
                    isDarkMode 
                      ? 'border-gray-700 hover:bg-gray-750 disabled:opacity-50' 
                      : 'border-gray-200 hover:bg-gray-50 disabled:opacity-50'
                  }`}
                >
                  <div className="flex items-center">
                    <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 text-blue-600 mr-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Sync Payments
                    </span>
                  </div>
                  <span className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    →
                  </span>
                </button>
                <button className={`w-full flex items-center justify-between p-3 border rounded-lg text-sm ${
                  isDarkMode 
                    ? 'border-gray-700 hover:bg-gray-750' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center">
                    <Download className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 mr-3" />
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Export Report
                    </span>
                  </div>
                  <span className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    PDF/Excel
                  </span>
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className={`w-full flex items-center justify-between p-3 border rounded-lg text-sm ${
                    isDarkMode 
                      ? 'border-gray-700 hover:bg-gray-750' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-600 mr-3" />
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Clear History
                    </span>
                  </div>
                  <span className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {transactions.length} records
                  </span>
                </button>
              </div>
            </div>

            {/* Payment Status Card */}
            <div className={`border rounded-xl ${isMobile ? 'p-4' : 'p-6'} ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-semibold mb-4 ${isMobile ? 'text-sm' : ''} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Payment Status
              </h3>
              <div className="space-y-3 md:space-y-4">
                {paymentStatusStats.map((stat) => {
                  const statusConfig = {
                    completed: { label: 'Completed', color: 'bg-emerald-600' },
                    pending: { label: 'Pending', color: 'bg-amber-600' },
                    failed: { label: 'Failed', color: 'bg-red-600' },
                    refunded: { label: 'Refunded', color: 'bg-blue-600' }
                  };
                  
                  const config = statusConfig[stat.status] || { label: stat.status, color: 'bg-gray-600' };
                  
                  return (
                    <div key={stat.status}>
                      <div className="flex justify-between text-xs md:text-sm mb-1">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {config.label}
                        </span>
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {stat.percentage}%
                        </span>
                      </div>
                      <div className={`w-full rounded-full h-1.5 md:h-2 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <div 
                          className={`${config.color} h-1.5 md:h-2 rounded-full`} 
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                      <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {stat.count} payments
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Payments;