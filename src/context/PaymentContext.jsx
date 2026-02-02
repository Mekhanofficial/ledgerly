import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { useInvoice } from './InvoiceContext';
import { useNotifications } from './NotificationContext';
import { getPayments, refundPayment } from '../services/paymentService';
import { getReceipts, createReceipt } from '../services/receiptService';

const mapPaymentToTransaction = (payment = {}) => {
  const invoice = payment.invoice || {};
  const customer = payment.customer || {};
  const processedAt = payment.paymentDate || payment.createdAt || new Date().toISOString();
  const refundAmount = payment.refundAmount || 0;
  const amount = Number(payment.amount ?? 0);
  return {
    id: payment._id || payment.id,
    invoiceId: invoice._id || invoice.id || payment.invoiceId,
    invoiceNumber: invoice.invoiceNumber || payment.invoiceNumber,
    customerId: customer._id || customer.id || payment.customerId,
    customerName: customer.name || payment.customerName || 'Customer',
    customerEmail: customer.email || payment.customerEmail,
    amount: refundAmount > 0 ? amount - refundAmount : amount,
    paymentMethod: payment.paymentMethod || 'manual',
    paymentMethodDetails: payment.paymentGateway
      ? `${payment.paymentMethod || 'payment'} via ${payment.paymentGateway}`
      : payment.paymentMethod || 'manual',
    paymentReference: payment.paymentReference,
    paymentGateway: payment.paymentGateway,
    status: payment.status || 'completed',
    processedAt,
    notes: payment.notes || '',
    type: payment.type || (refundAmount > 0 ? 'refund' : 'payment'),
    raw: payment,
    refundAmount
  };
};

const mapReceiptToUi = (receipt = {}) => {
  const invoice = receipt.invoice || {};
  const customer = receipt.customer || {};
  const date = receipt.date || receipt.createdAt;
  return {
    id: receipt._id || receipt.id,
    receiptNumber: receipt.receiptNumber,
    invoiceId: invoice._id || invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    customerId: customer._id || customer.id,
    customerName: customer.name || receipt.customerName || 'Customer',
    customerEmail: customer.email,
    total: receipt.total || 0,
    amountPaid: receipt.amountPaid || receipt.total || 0,
    change: receipt.change || 0,
    paymentMethod: receipt.paymentMethod,
    paymentReference: receipt.paymentReference,
    paymentDate: date,
    status: receipt.isVoid ? 'void' : (receipt.status || 'completed'),
    metadata: receipt
  };
};

export const PaymentContext = createContext();

export const usePayments = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayments must be used within PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const { addToast } = useToast();
  const { invoices, updateInvoice, customers, updateStockOnPayment, markAsPaid } = useInvoice();
  const { addNotification } = useNotifications();
  
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const savedMethods = JSON.parse(localStorage.getItem('ledgerly_payment_methods')) || getDefaultPaymentMethods();
    setPaymentMethods(savedMethods);
  }, []);

  const refreshTransactions = useCallback(async (params = {}) => {
    try {
      const payload = await getPayments(params);
      const backendTransactions = payload?.data || [];
      const mapped = backendTransactions.map(mapPaymentToTransaction);
      setTransactions(mapped);
      return mapped;
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
      addToast('Unable to load payment history', 'error');
      return [];
    }
  }, [addToast]);

  const refreshReceipts = useCallback(async (params = {}) => {
    try {
      const payload = await getReceipts(params);
      const backendReceipts = payload?.data || [];
      const mapped = backendReceipts.map(mapReceiptToUi);
      setReceipts(mapped);
      return mapped;
    } catch (error) {
      console.error('Failed to refresh receipts:', error);
      addToast('Unable to load receipt history', 'error');
      return [];
    }
  }, [addToast]);

  const loadPaymentData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([refreshTransactions(), refreshReceipts()]);
    } catch (error) {
      console.error('Error loading payment data:', error);
      addToast('Unable to load payment data', 'error');
    } finally {
      setLoading(false);
    }
  }, [refreshTransactions, refreshReceipts, addToast]);

  useEffect(() => {
    loadPaymentData();
  }, [loadPaymentData]);

  const getDefaultPaymentMethods = () => {
    return [
      {
        id: 'method_1',
        type: 'credit_card',
        name: 'Visa ending in 4242',
        last4: '4242',
        brand: 'visa',
        isDefault: true,
        expiryDate: '12/25',
        status: 'active',
        addedAt: new Date().toISOString()
      },
      {
        id: 'method_2',
        type: 'bank_transfer',
        name: 'Chase Bank Account',
        last4: '1234',
        brand: 'bank',
        isDefault: false,
        status: 'active',
        addedAt: new Date().toISOString()
      },
      {
        id: 'method_3',
        type: 'paypal',
        name: 'PayPal Account',
        email: 'user@example.com',
        brand: 'paypal',
        isDefault: false,
        status: 'active',
        addedAt: new Date().toISOString()
      },
      {
        id: 'method_4',
        type: 'cash',
        name: 'Cash Payment',
        brand: 'cash',
        isDefault: false,
        status: 'active',
        addedAt: new Date().toISOString()
      },
      {
        id: 'method_5',
        type: 'mobile_money',
        name: 'Mobile Money',
        phone: '+1 (555) 123-4567',
        brand: 'mobile',
        isDefault: false,
        status: 'active',
        addedAt: new Date().toISOString()
      }
    ];
  };

  // Save payment methods to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ledgerly_payment_methods', JSON.stringify(paymentMethods));
    }
  }, [paymentMethods, loading]);

  // Add a new payment method
  const addPaymentMethod = (methodData) => {
    try {
      const newMethod = {
        id: `method_${Date.now()}`,
        ...methodData,
        addedAt: new Date().toISOString(),
        status: 'active'
      };
      
      // If setting as default, unset other defaults
      const updatedMethods = methodData.isDefault 
        ? paymentMethods.map(method => ({ ...method, isDefault: false }))
        : [...paymentMethods];
      
      updatedMethods.push(newMethod);
      setPaymentMethods(updatedMethods);
      
      addToast('Payment method added successfully!', 'success');
      addNotification({
        type: 'payment-method',
        title: 'New Payment Method Added',
        description: `Added ${methodData.type} ending in ${methodData.last4 || 'new'}`,
        time: 'Just now',
        action: 'View Methods',
        color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        link: '/payments',
        icon: 'CreditCard'
      }, { showToast: false });
      
      return newMethod;
    } catch (error) {
      addToast('Error adding payment method', 'error');
      throw error;
    }
  };

  // Update payment method
  const updatePaymentMethod = (id, updates) => {
    try {
      const updatedMethods = paymentMethods.map(method => {
        if (method.id === id) {
          // If setting as default, unset other defaults
          if (updates.isDefault) {
            paymentMethods.forEach(m => {
              if (m.id !== id && m.isDefault) {
                m.isDefault = false;
              }
            });
          }
          return { ...method, ...updates };
        }
        return method;
      });
      
      setPaymentMethods(updatedMethods);
      addToast('Payment method updated successfully!', 'success');
      return updatedMethods.find(method => method.id === id);
    } catch (error) {
      addToast('Error updating payment method', 'error');
      throw error;
    }
  };

  // Delete payment method
  const deletePaymentMethod = (id) => {
    try {
      const methodToDelete = paymentMethods.find(method => method.id === id);
      const updatedMethods = paymentMethods.filter(method => method.id !== id);
      
      // If deleting default method and there are other methods, set first one as default
      if (methodToDelete.isDefault && updatedMethods.length > 0) {
        updatedMethods[0].isDefault = true;
      }
      
      setPaymentMethods(updatedMethods);
      addToast('Payment method deleted successfully!', 'success');
      return true;
    } catch (error) {
      addToast('Error deleting payment method', 'error');
      return false;
    }
  };

  // Get invoices ready for payment
  const getInvoicesForPayment = useCallback(() => {
    return invoices.filter(invoice => 
      (invoice.status === 'sent' || invoice.status === 'partial' || invoice.status === 'overdue' || invoice.status === 'viewed') && 
      (invoice.totalAmount || invoice.amount) > 0 &&
      !invoice.paidAt
    );
  }, [invoices]);

  // Process a payment for an invoice
  const processPayment = async (paymentData) => {
    try {
      const {
        invoiceId,
        amount,
        paymentMethodId,
        customerId,
        notes = ''
      } = paymentData;

      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const paymentMethod = paymentMethods.find(method => method.id === paymentMethodId)
        || paymentMethods.find(method => method.isDefault);
      const methodType = paymentMethod?.type || paymentData.paymentMethod || 'manual';
      const customer = customers.find(c => c.id === customerId) || {};

      const result = await markAsPaid(invoiceId, {
        amount,
        paymentMethod: methodType,
        paymentReference: paymentMethod?.id || paymentData.paymentReference,
        paymentGateway: paymentData.paymentGateway,
        notes
      }, { showToast: false });

      const recordedInvoice = result?.invoice;
      const payment = result?.payment;
      const receipt = result?.receipt;

      if (!recordedInvoice) {
        throw new Error('Failed to record payment');
      }

      try {
        if (typeof updateStockOnPayment === 'function') {
          updateStockOnPayment(invoiceId);
        }
      } catch (stockError) {
        console.warn('Could not update stock:', stockError);
      }

      setPendingPayments(prev => prev.filter(p => p.invoiceId !== invoiceId));

      await Promise.all([refreshTransactions(), refreshReceipts()]);

      const customerName = customer.name || recordedInvoice?.customer?.name || 'Customer';
      const displayAmount = Number(payment?.amount ?? amount) || 0;

      addNotification({
        type: 'payment',
        title: 'Payment Processed',
        description: `$${displayAmount.toLocaleString()} from ${customerName}`,
        details: `Invoice #${recordedInvoice.invoiceNumber || recordedInvoice.number}`,
        time: 'Just now',
        action: receipt ? 'View Receipt' : 'View Invoice',
        color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
        link: receipt ? `/receipts` : `/invoices/view/${invoiceId}`,
        icon: 'DollarSign',
        invoiceId,
        customerId,
        receiptId: receipt?.id
      }, { showToast: false });

      addToast(`Payment of $${displayAmount.toLocaleString()} processed successfully!`, 'success');

      return {
        transaction: payment ? mapPaymentToTransaction(payment) : null,
        invoice: recordedInvoice,
        receipt
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      addToast(`Payment failed: ${error.message}`, 'error');
      throw error;
    }
  };

  // Record a transaction (e.g., from receipts or manual entry)
  const recordTransaction = async (transactionData) => {
    try {
      if (transactionData.type === 'receipt' && transactionData.receiptPayload?.items?.length) {
        const payload = {
          customer: transactionData.receiptPayload.customerId || transactionData.receiptPayload.customer,
          customerEmail: transactionData.receiptPayload.customerEmail,
          items: transactionData.receiptPayload.items,
          paymentMethod: transactionData.receiptPayload.paymentMethod || transactionData.paymentMethod,
          amountPaid: transactionData.receiptPayload.total || transactionData.amount,
          subtotal: transactionData.receiptPayload.subtotal,
          tax: transactionData.receiptPayload.tax,
          notes: transactionData.receiptPayload.notes || transactionData.notes,
          paymentReference: transactionData.receiptPayload.paymentReference || transactionData.paymentReference,
          change: transactionData.receiptPayload.change
        };

        await createReceipt(payload);
        await Promise.all([refreshTransactions(), refreshReceipts()]);
        return null;
      }

      const newTransaction = {
        id: transactionData.id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        processedAt: new Date().toISOString(),
        status: 'completed',
        type: transactionData.type || 'payment',
        customerId: transactionData.customerId || 'walk-in',
        customerName: transactionData.customerName || 'Walk-in Customer',
        invoiceId: transactionData.invoiceId,
        invoiceNumber: transactionData.invoiceNumber,
        amount: transactionData.amount || 0,
        paymentMethod: transactionData.paymentMethod || 'cash',
        paymentMethodDetails: transactionData.paymentMethodDetails || 'Cash',
        paymentMethodId: transactionData.paymentMethodId,
        notes: transactionData.notes || '',
        metadata: transactionData.metadata || {}
      };
      
      // Add to transactions
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Send notification
      if (transactionData.type === 'receipt') {
        addNotification({
          type: 'receipt',
          title: 'Receipt Generated',
          description: `Receipt #${transactionData.invoiceNumber} for ${transactionData.customerName}`,
          details: `Amount: $${transactionData.amount.toFixed(2)} | Payment: ${transactionData.paymentMethod}`,
          time: 'Just now',
          action: 'View Receipt',
          color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          link: '/receipts',
          icon: 'Receipt',
          transactionId: newTransaction.id
        }, { showToast: false });
      } else {
        addNotification({
          type: 'payment',
          title: 'Payment Recorded',
          description: `$${Math.abs(transactionData.amount).toLocaleString()} ${transactionData.type || 'payment'}`,
          details: `From: ${transactionData.customerName || 'Customer'}`,
          time: 'Just now',
          action: 'View Details',
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
          link: '/payments',
          icon: 'DollarSign',
          transactionId: newTransaction.id
        }, { showToast: false });
      }
      
      addToast('Transaction recorded successfully!', 'success');
      
      return newTransaction;
    } catch (error) {
      console.error('Error recording transaction:', error);
      addToast('Error recording transaction', 'error');
      throw error;
    }
  };

  // Process a refund
  const processRefund = async (transactionId, refundData) => {
    try {
      const response = await refundPayment(transactionId, refundData);
      const refundedPayment = response?.data;
      await Promise.all([refreshTransactions(), refreshReceipts()]);

      const refundAmount = Number(refundData.amount || refundedPayment?.refundAmount || 0);
      const customerName = refundedPayment?.customer?.name || refundedPayment?.customerName || 'Customer';

      addNotification({
        type: 'refund',
        title: 'Refund Processed',
        description: `$${Math.abs(refundAmount).toLocaleString()} refunded to ${customerName}`,
        details: `Original invoice #${refundedPayment?.invoiceNumber || refundedPayment?.invoice?.invoiceNumber || ''}`,
        time: 'Just now',
        action: 'View Payment',
        color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
        link: '/payments',
        icon: 'RefreshCw',
        transactionId
      }, { showToast: false });

      addToast(`Refund of $${Math.abs(refundAmount).toLocaleString()} processed successfully!`, 'success');

      return mapPaymentToTransaction(refundedPayment);
    } catch (error) {
      console.error('Refund processing error:', error);
      addToast(`Refund failed: ${error.message}`, 'error');
      throw error;
    }
  };

  // Delete all payment history
  const deleteAllPayments = async () => {
    return new Promise((resolve, reject) => {
      try {
        // Store backup before deletion (optional, for safety)
        const backup = {
          transactions: [...transactions],
          receipts: [...receipts],
          pendingPayments: [...pendingPayments],
          deletedAt: new Date().toISOString()
        };
        
        // Save backup to localStorage (optional)
        localStorage.setItem('payment_history_backup', JSON.stringify(backup));
        
        // Clear all payment data
        setTransactions([]);
        setReceipts([]);
        setPendingPayments([]);
        
        // Clear localStorage
        localStorage.removeItem('ledgerly_transactions');
        localStorage.removeItem('Ledgerly_receipts');
        localStorage.removeItem('pending_payments');
        
        // Update related invoice statuses
        // Note: This is important to reset invoice payment statuses
        invoices.forEach(invoice => {
          if (invoice.status === 'paid' || invoice.status === 'refunded' || invoice.status === 'partially_refunded') {
            updateInvoice(invoice.id, {
              status: invoice.status === 'paid' ? 'sent' : 'sent',
              paymentStatus: invoice.status === 'paid' ? 'pending' : 'pending',
              paidAt: null,
              transactionId: null,
              paymentMethod: null,
              refundedAt: null,
              refundedAmount: 0
            });
          }
        });
        
        // Send notification
        addNotification({
          type: 'system',
          title: 'Payment History Cleared',
          description: 'All payment history has been permanently deleted',
          details: `Deleted ${backup.transactions.length} transactions, ${backup.receipts.length} receipts, and ${backup.pendingPayments.length} pending payments`,
          time: 'Just now',
          action: 'Restore Backup',
          color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          link: '#',
          icon: 'Trash2',
          backupId: backup.deletedAt
        }, { showToast: false });
        
        resolve(backup);
      } catch (error) {
        console.error('Error deleting all payments:', error);
        addToast('Failed to delete payment history', 'error');
        reject(error);
      }
    });
  };

  // Restore payment history from backup (optional feature)
  const restoreFromBackup = async () => {
    try {
      const backup = JSON.parse(localStorage.getItem('payment_history_backup'));
      if (!backup) {
        throw new Error('No backup found');
      }
      
      setTransactions(backup.transactions || []);
      setReceipts(backup.receipts || []);
      setPendingPayments(backup.pendingPayments || []);
      
      // Save to localStorage
      localStorage.setItem('ledgerly_transactions', JSON.stringify(backup.transactions || []));
      localStorage.setItem('Ledgerly_receipts', JSON.stringify(backup.receipts || []));
      localStorage.setItem('pending_payments', JSON.stringify(backup.pendingPayments || []));
      
      addToast('Payment history restored from backup!', 'success');
      addNotification({
        type: 'system',
        title: 'Payment History Restored',
        description: 'Payment history has been restored from backup',
        details: `Restored ${backup.transactions?.length || 0} transactions`,
        time: 'Just now',
        action: 'View Payments',
        color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
        link: '/payments',
        icon: 'RotateCcw'
      }, { showToast: false });
      
      return backup;
    } catch (error) {
      console.error('Error restoring backup:', error);
      addToast('Failed to restore payment history', 'error');
      throw error;
    }
  };

  // Get payment stats
  const getPaymentStats = () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const todayTransactions = transactions.filter(t => 
      new Date(t.processedAt) >= startOfDay && t.amount > 0
    );
    
    const thisMonthTransactions = transactions.filter(t => 
      new Date(t.processedAt) >= startOfMonth && t.amount > 0
    );
    
    const pendingPaymentsCount = getInvoicesForPayment().length;
    const pendingPaymentsAmount = getInvoicesForPayment()
      .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    
    const failedPayments = transactions.filter(t => 
      t.status === 'failed'
    );
    
    const recentReceipts = receipts.filter(t => 
      t.type === 'invoice_payment' && 
      new Date(t.savedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    return {
      totalRevenue: thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0),
      pendingPayments: pendingPaymentsAmount,
      pendingCount: pendingPaymentsCount,
      processedToday: todayTransactions.reduce((sum, t) => sum + t.amount, 0),
      todayCount: todayTransactions.length,
      failedPayments: failedPayments.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      failedCount: failedPayments.length,
      receiptCount: recentReceipts.length,
      receiptRevenue: recentReceipts.reduce((sum, t) => sum + t.total, 0)
    };
  };

  // Get transactions by date range
  const getTransactionsByDateRange = (range = 'today') => {
    const now = new Date();
    let startDate;
    
    switch(range) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'yesterday':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        return transactions.filter(t => {
          const tDate = new Date(t.processedAt);
          return tDate >= startDate && tDate < endDate;
        });
      case 'this-week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDateLM = new Date(now.getFullYear(), now.getMonth(), 0);
        return transactions.filter(t => {
          const tDate = new Date(t.processedAt);
          return tDate >= startDate && tDate <= endDateLM;
        });
      case 'last-7-days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last-30-days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return transactions;
    }
    
    return transactions.filter(t => new Date(t.processedAt) >= startDate);
  };

  // Get recent transactions
  const getRecentTransactions = (limit = 10) => {
    return [...transactions]
      .sort((a, b) => new Date(b.processedAt) - new Date(a.processedAt))
      .slice(0, limit);
  };

  // Get recent receipts
  const getRecentReceipts = (limit = 10) => {
    return [...receipts]
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      .slice(0, limit);
  };

  // Get customer transactions
  const getCustomerTransactions = (customerId) => {
    return transactions.filter(t => t.customerId === customerId);
  };

  // Get transaction by ID
  const getTransactionById = (transactionId) => {
    return transactions.find(t => t.id === transactionId);
  };

  // Update transaction
  const updateTransaction = (transactionId, updates) => {
    try {
      const updatedTransactions = transactions.map(t =>
        t.id === transactionId ? { ...t, ...updates } : t
      );
      setTransactions(updatedTransactions);
      addToast('Transaction updated successfully!', 'success');
      return updatedTransactions.find(t => t.id === transactionId);
    } catch (error) {
      addToast('Error updating transaction', 'error');
      throw error;
    }
  };

  // Delete transaction
  const deleteTransaction = (transactionId) => {
    try {
      const updatedTransactions = transactions.filter(t => t.id !== transactionId);
      setTransactions(updatedTransactions);
      addToast('Transaction deleted successfully!', 'success');
      return true;
    } catch (error) {
      addToast('Error deleting transaction', 'error');
      return false;
    }
  };

  // Sync payments (simulate API call)
  const syncPayments = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotification({
        type: 'sync',
        title: 'Payments Synced',
        description: 'Payment data synchronized successfully',
        time: 'Just now',
        action: 'View Transactions',
        color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        link: '/payments',
        icon: 'RefreshCw'
      }, { showToast: false });
      
      addToast('Payments synced successfully!', 'success');
      
      return transactions;
    } catch (error) {
      addToast('Error syncing payments', 'error');
      throw error;
    }
  };

  // Export transactions
  const exportTransactions = (format = 'json') => {
    try {
      if (transactions.length === 0) {
        addToast('No transactions to export', 'warning');
        return false;
      }
      
      if (format === 'json') {
        const data = {
          exportedAt: new Date().toISOString(),
          totalTransactions: transactions.length,
          totalAmount: transactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0),
          transactions: transactions
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transactions-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const headers = ['ID', 'Date', 'Customer', 'Invoice #', 'Amount', 'Payment Method', 'Status', 'Type', 'Notes'];
        const rows = transactions.map(t => [
          t.id,
          new Date(t.processedAt).toLocaleDateString(),
          t.customerName,
          t.invoiceNumber || 'N/A',
          `$${Math.abs(t.amount).toFixed(2)}`,
          t.paymentMethod,
          t.status,
          t.type,
          t.notes || ''
        ]);
        
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      addToast(`Exported ${transactions.length} transactions successfully!`, 'success');
      return true;
    } catch (error) {
      addToast('Error exporting transactions', 'error');
      return false;
    }
  };

  // Calculate payment method statistics
  const getPaymentMethodStats = () => {
    const stats = {};
    
    transactions.forEach(t => {
      if (t.amount > 0) { // Only count payments, not refunds
        const method = t.paymentMethod;
        if (!stats[method]) {
          stats[method] = {
            count: 0,
            amount: 0,
            lastUsed: t.processedAt
          };
        }
        stats[method].count += 1;
        stats[method].amount += t.amount;
        if (new Date(t.processedAt) > new Date(stats[method].lastUsed)) {
          stats[method].lastUsed = t.processedAt;
        }
      }
    });
    
    return Object.entries(stats).map(([method, data]) => ({
      method,
      count: data.count,
      amount: data.amount,
      lastUsed: data.lastUsed,
      percentage: transactions.filter(t => t.amount > 0).length > 0 
        ? (data.count / transactions.filter(t => t.amount > 0).length) * 100 
        : 0
    })).sort((a, b) => b.amount - a.amount);
  };

  // Get daily revenue
  const getDailyRevenue = (days = 7) => {
    const dailyRevenue = {};
    const now = new Date();
    
    // Initialize last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyRevenue[dateKey] = 0;
    }
    
    // Calculate revenue for each day
    transactions.forEach(t => {
      if (t.amount > 0) {
        const tDate = new Date(t.processedAt);
        const dateKey = tDate.toISOString().split('T')[0];
        
        // Check if this date is within our range
        const daysAgo = Math.floor((now - tDate) / (1000 * 60 * 60 * 24));
        if (daysAgo < days && daysAgo >= 0) {
          if (dailyRevenue[dateKey] !== undefined) {
            dailyRevenue[dateKey] += t.amount;
          }
        }
      }
    });
    
    return Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date,
      revenue,
      formattedDate: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }));
  };

  // Get pending invoices for payment
  const getPendingInvoices = () => {
    return getInvoicesForPayment().map(invoice => {
      const customer = customers.find(c => c.id === invoice.customerId);
      return {
        ...invoice,
        customerName: customer?.name || typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.name,
        customerEmail: customer?.email || invoice.customerEmail
      };
    });
  };

  // Add invoice to pending payments
  const addPendingPayment = (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice && !pendingPayments.find(p => p.invoiceId === invoiceId)) {
      const pendingPayment = {
        id: `pending_${Date.now()}`,
        invoiceId,
        invoiceNumber: invoice.number || invoice.invoiceNumber,
        customerId: invoice.customerId,
        customerName: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.name,
        amount: invoice.totalAmount || invoice.amount,
        addedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      setPendingPayments(prev => [pendingPayment, ...prev]);
      return pendingPayment;
    }
    return null;
  };

  // Remove from pending payments
  const removePendingPayment = (invoiceId) => {
    setPendingPayments(prev => prev.filter(p => p.invoiceId !== invoiceId));
  };

  const contextValue = {
    // State
    paymentMethods,
    transactions,
    receipts,
    pendingPayments,
    loading,
    
    // Payment Method Methods
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    
    // Transaction Methods
    processPayment,
    processRefund,
    recordTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    
    // Bulk Operations
    deleteAllPayments,
    restoreFromBackup, // Optional: If you want to add restore functionality
    
    // Invoice Payment Methods
    getInvoicesForPayment,
    getPendingInvoices,
    addPendingPayment,
    removePendingPayment,
    
    // Query Methods
    getPaymentStats,
    getTransactionsByDateRange,
    getRecentTransactions,
    getRecentReceipts,
    getCustomerTransactions,
    getPaymentMethodStats,
    getDailyRevenue,
    
    // Utility Methods
    syncPayments,
    exportTransactions
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
};
