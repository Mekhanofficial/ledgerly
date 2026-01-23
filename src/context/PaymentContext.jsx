import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { useInvoice } from './InvoiceContext';
import { useNotifications } from './NotificationContext';

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
  const { invoices, updateInvoice, customers, updateStockOnPayment } = useInvoice();
  const { addNotification } = useNotifications();
  
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load data from localStorage
  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = () => {
    try {
      // Load payment methods
      const savedMethods = JSON.parse(localStorage.getItem('ledgerly_payment_methods')) || getDefaultPaymentMethods();
      setPaymentMethods(savedMethods);
      
      // Load transactions
      const savedTransactions = JSON.parse(localStorage.getItem('ledgerly_transactions')) || [];
      setTransactions(savedTransactions);
      
      // Load receipts
      const savedReceipts = JSON.parse(localStorage.getItem('Ledgerly_receipts')) || [];
      setReceipts(savedReceipts);
      
      // Load pending payments
      const savedPending = JSON.parse(localStorage.getItem('pending_payments')) || [];
      setPendingPayments(savedPending);
      
    } catch (error) {
      console.error('Error loading payment data:', error);
      addToast('Error loading payment data', 'error');
    } finally {
      setLoading(false);
    }
  };

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

  // Save transactions to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ledgerly_transactions', JSON.stringify(transactions));
    }
  }, [transactions, loading]);

  // Save receipts to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('Ledgerly_receipts', JSON.stringify(receipts));
    }
  }, [receipts, loading]);

  // Save pending payments to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('pending_payments', JSON.stringify(pendingPayments));
    }
  }, [pendingPayments, loading]);

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
      });
      
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
      (invoice.status === 'sent' || invoice.status === 'pending_payment') && 
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
        notes = '',
        generateReceipt = true
      } = paymentData;

      // Find the invoice
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Find payment method
      const paymentMethod = paymentMethods.find(method => method.id === paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      // Find customer
      const customer = customers.find(c => c.id === customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Create transaction record
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newTransaction = {
        id: transactionId,
        invoiceId,
        invoiceNumber: invoice.number || invoice.invoiceNumber,
        customerId,
        customerName: customer.name,
        amount,
        paymentMethod: paymentMethod.type,
        paymentMethodId: paymentMethod.id,
        paymentMethodDetails: paymentMethod.type === 'credit_card' 
          ? `${paymentMethod.brand} ending in ${paymentMethod.last4}`
          : paymentMethod.type === 'paypal'
          ? `PayPal: ${paymentMethod.email}`
          : paymentMethod.type === 'bank_transfer'
          ? `Bank Transfer: ${paymentMethod.last4}`
          : paymentMethod.type === 'mobile_money'
          ? `Mobile Money: ${paymentMethod.phone}`
          : 'Cash Payment',
        status: 'completed',
        processedAt: new Date().toISOString(),
        notes,
        type: 'payment',
        metadata: {
          invoiceAmount: invoice.totalAmount || invoice.amount,
          outstandingBefore: invoice.outstanding || 0,
          itemsCount: invoice.lineItems?.length || invoice.items?.length || 0
        }
      };

      // Add to transactions
      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);

      // Update invoice status to paid
      updateInvoice(invoiceId, {
        status: 'paid',
        paymentStatus: 'completed',
        paidAt: new Date().toISOString(),
        transactionId,
        paymentMethod: paymentMethod.type
      });

      // Update stock if inventory integration is enabled
      try {
        if (typeof updateStockOnPayment === 'function') {
          updateStockOnPayment(invoiceId);
        }
      } catch (stockError) {
        console.warn('Could not update stock:', stockError);
      }

      // Remove from pending payments
      const updatedPending = pendingPayments.filter(p => p.invoiceId !== invoiceId);
      setPendingPayments(updatedPending);

      // Generate receipt if requested
      let receipt = null;
      if (generateReceipt) {
        receipt = await generateReceiptFromPayment({
          transaction: newTransaction,
          invoice,
          customer,
          paymentMethod
        });
      }

      // Update customer stats
      const customerInvoices = invoices.filter(inv => inv.customerId === customerId);
      const totalOutstanding = customerInvoices
        .filter(inv => inv.status !== 'paid')
        .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
      
      // Send notification
      addNotification({
        type: 'payment',
        title: 'Payment Processed',
        description: `$${amount.toLocaleString()} from ${customer.name}`,
        details: `Invoice #${invoice.number || invoice.invoiceNumber}`,
        time: 'Just now',
        action: 'View Receipt',
        color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
        link: receipt ? `/receipts` : `/invoices/view/${invoiceId}`,
        icon: 'DollarSign',
        invoiceId,
        customerId,
        receiptId: receipt?.id
      });

      addToast(`Payment of $${amount} processed successfully!`, 'success');
      
      return {
        transaction: newTransaction,
        invoice: {
          ...invoice,
          status: 'paid',
          paidAt: newTransaction.processedAt
        },
        receipt
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      addToast(`Payment failed: ${error.message}`, 'error');
      throw error;
    }
  };

  // Generate receipt from payment
  const generateReceiptFromPayment = async (paymentData) => {
    try {
      const { transaction, invoice, customer, paymentMethod } = paymentData;
      
      const receiptId = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const receiptData = {
        id: receiptId,
        date: new Date().toLocaleString(),
        items: invoice.lineItems || invoice.items || [],
        subtotal: invoice.subtotal || invoice.totalAmount,
        tax: invoice.tax || 0,
        total: transaction.amount,
        customerName: customer.name,
        customerEmail: customer.email,
        customerId: customer.id,
        paymentMethod: paymentMethod.type,
        paymentMethodId: paymentMethod.id,
        paymentMethodDetails: paymentMethod.type === 'credit_card' 
          ? `${paymentMethod.brand} ending in ${paymentMethod.last4}`
          : paymentMethod.type === 'paypal'
          ? `PayPal: ${paymentMethod.email}`
          : paymentMethod.type === 'bank_transfer'
          ? `Bank Transfer: ${paymentMethod.last4}`
          : paymentMethod.type === 'mobile_money'
          ? `Mobile Money: ${paymentMethod.phone}`
          : 'Cash Payment',
        notes: transaction.notes,
        invoiceNumber: invoice.number || invoice.invoiceNumber,
        transactionId: transaction.id,
        savedAt: new Date().toISOString(),
        status: 'completed',
        type: 'invoice_payment'
      };

      // Add to receipts
      const updatedReceipts = [receiptData, ...receipts];
      setReceipts(updatedReceipts);

      return receiptData;
    } catch (error) {
      console.error('Error generating receipt:', error);
      addToast('Error generating receipt', 'warning');
      return null;
    }
  };

  // Record a transaction (e.g., from receipts or manual entry)
  const recordTransaction = (transactionData) => {
    try {
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
        });
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
        });
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
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const { amount, reason = '' } = refundData;

      // Create refund transaction
      const refundId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const refundTransaction = {
        id: refundId,
        originalTransactionId: transactionId,
        invoiceId: transaction.invoiceId,
        invoiceNumber: transaction.invoiceNumber,
        customerId: transaction.customerId,
        customerName: transaction.customerName,
        amount: -amount, // Negative amount for refund
        paymentMethod: transaction.paymentMethod,
        paymentMethodDetails: transaction.paymentMethodDetails,
        status: 'refunded',
        processedAt: new Date().toISOString(),
        notes: reason,
        type: 'refund',
        metadata: {
          originalAmount: transaction.amount,
          refundReason: reason
        }
      };

      // Add to transactions
      const updatedTransactions = [refundTransaction, ...transactions];
      setTransactions(updatedTransactions);

      // Update original invoice status if needed
      const invoice = invoices.find(inv => inv.id === transaction.invoiceId);
      if (invoice) {
        // If full refund, mark as refunded
        if (amount >= transaction.amount) {
          updateInvoice(transaction.invoiceId, {
            status: 'refunded',
            refundedAt: new Date().toISOString()
          });
        } else {
          // Partial refund
          updateInvoice(transaction.invoiceId, {
            status: 'partially_refunded',
            refundedAmount: amount,
            refundedAt: new Date().toISOString()
          });
        }
      }

      // Send notification
      addNotification({
        type: 'refund',
        title: 'Refund Processed',
        description: `$${amount.toLocaleString()} refunded to ${transaction.customerName}`,
        details: `Original invoice #${transaction.invoiceNumber}`,
        time: 'Just now',
        action: 'View Details',
        color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
        link: '/payments',
        icon: 'RefreshCw',
        transactionId: refundId
      });

      addToast(`Refund of $${amount} processed successfully!`, 'success');
      
      return refundTransaction;

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
        });
        
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
      });
      
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
      });
      
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