// src/components/dashboard/AlertsNotifications.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertCircle, Package, DollarSign, UserPlus, Clock, ChevronRight, FileText, Receipt, BarChart3, CreditCard, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNotifications } from '../../context/NotificationContext';
import { usePayments } from '../../context/PaymentContext'; // Added import
import { Link } from 'react-router-dom';

const AlertsNotifications = () => {
  const invoices = useSelector((state) => state.invoices?.invoices || []);
  const customers = useSelector((state) => state.customers?.customers || []);
  const { notifications, getRecentNotifications } = useNotifications();
  const { transactions, getPaymentStats, receipts } = usePayments(); // Added payment context
  
  const [alerts, setAlerts] = useState([]);
  const [previousInvoiceCount, setPreviousInvoiceCount] = useState(invoices.length);
  const [previousCustomerCount, setPreviousCustomerCount] = useState(customers.length);
  const [previousTransactionCount, setPreviousTransactionCount] = useState(transactions.length); // Added
  const [reports, setReports] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const getInvoiceTotal = useCallback(
    (invoice) => invoice.totalAmount || invoice.amount || invoice.total || 0,
    []
  );
  
  // Load reports from localStorage
  useEffect(() => {
    try {
      const savedReports = JSON.parse(localStorage.getItem('ledgerly_reports') || '[]');
      setReports(savedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  }, []);

  // Load payment stats
  useEffect(() => {
    const stats = getPaymentStats();
    setPaymentStats(stats);
  }, [transactions, getPaymentStats]);

  // Listen for report updates
  useEffect(() => {
    const handleReportUpdate = () => {
      try {
        const savedReports = JSON.parse(localStorage.getItem('ledgerly_reports') || '[]');
        setReports(savedReports);
      } catch (error) {
        console.error('Error updating reports:', error);
      }
    };

    window.addEventListener('storage', handleReportUpdate);
    window.addEventListener('reportsUpdated', handleReportUpdate);
    
    return () => {
      window.removeEventListener('storage', handleReportUpdate);
      window.removeEventListener('reportsUpdated', handleReportUpdate);
    };
  }, []);

  // Convert notifications to alerts format
  const convertNotificationToAlert = useCallback((notification) => {
    const iconMap = {
      'new-invoice': FileText,
      'new-customer': UserPlus,
      'overdue': AlertCircle,
      'payment': DollarSign,
      'draft': Package,
      'pending': FileText,
      'receipt': Receipt,
      'report': BarChart3,
      'report-completed': BarChart3,
      'report-failed': AlertCircle,
      'payment-method': CreditCard,
      'refund': RefreshCw,
      'sync': RefreshCw,
      'payment-due': Clock,
      'payment-reminder': Clock,
      'revenue-trend': TrendingUp,
      'low-revenue': TrendingDown,
      'failed-payment': AlertCircle
    };
    
    const colorMap = {
      'new-invoice': 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
      'new-customer': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      'overdue': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      'payment': 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      'draft': 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
      'pending': 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      'receipt': 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      'report': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      'report-completed': 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      'report-failed': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      'payment-method': 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800',
      'refund': 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
      'sync': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      'payment-due': 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      'payment-reminder': 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800',
      'revenue-trend': 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      'low-revenue': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      'failed-payment': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    };
    
    const priorityMap = {
      'overdue': 0,
      'report-failed': 0,
      'failed-payment': 0,
      'payment': 1,
      'new-invoice': 1,
      'new-customer': 1,
      'payment-due': 1,
      'report-completed': 2,
      'receipt': 2,
      'report': 2,
      'payment-method': 2,
      'refund': 2,
      'sync': 3,
      'draft': 3,
      'pending': 4,
      'payment-reminder': 4,
      'revenue-trend': 5,
      'low-revenue': 5
    };
    
    return {
      type: notification.type,
      icon: iconMap[notification.type] || FileText,
      title: notification.title,
      description: notification.description,
      details: notification.details || '',
      time: notification.time || 'Just now',
      action: notification.action || 'View',
      color: colorMap[notification.type] || 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
      link: notification.link || '#',
      timestamp: new Date(notification.timestamp).getTime(),
      sortPriority: priorityMap[notification.type] || 5,
      reportId: notification.reportId,
      invoiceId: notification.invoiceId,
      customerId: notification.customerId,
      transactionId: notification.transactionId
    };
  }, []);

  // Calculate ongoing alerts from invoices, customers, payments, and reports
  const calculateOngoingAlerts = useCallback(() => {
    const ongoingAlerts = [];
    
    // Overdue invoices
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
    
    if (overdueInvoices.length > 0) {
      ongoingAlerts.push({
        type: 'overdue',
        icon: AlertCircle,
        title: 'Overdue Invoices',
        description: `${overdueInvoices.length} invoice${overdueInvoices.length > 1 ? 's are' : ' is'} past due`,
        details: `Total amount: $${overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        time: 'Urgent',
        action: 'View Details',
        color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        link: '/invoices?status=overdue',
        timestamp: Date.now(),
        sortPriority: 0
      });
    }

    // Draft invoices
    const draftInvoices = invoices.filter(inv => inv.status === 'draft');
    if (draftInvoices.length > 0) {
      const draftAmount = draftInvoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
      
      ongoingAlerts.push({
        type: 'draft',
        icon: Package,
        title: 'Draft Invoices',
        description: `${draftInvoices.length} draft invoice${draftInvoices.length > 1 ? 's' : ''} pending`,
        details: `Total value: $${draftAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        time: 'Needs attention',
        action: 'View Drafts',
        color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
        link: '/invoices/drafts',
        timestamp: Date.now(),
        sortPriority: 3
      });
    }

    // Sent invoices waiting for payment (older than 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const pendingInvoices = invoices.filter(inv => 
      inv.status === 'sent' && 
      new Date(inv.sentAt || inv.createdAt) < sevenDaysAgo
    );
    
    if (pendingInvoices.length > 0) {
      const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
      
      ongoingAlerts.push({
        type: 'pending',
        icon: FileText,
        title: 'Pending Payments',
        description: `${pendingInvoices.length} invoice${pendingInvoices.length > 1 ? 's' : ''} sent, awaiting payment`,
        details: `Total pending: $${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        time: 'Follow up needed',
        action: 'View Sent',
        color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
        link: '/invoices?status=sent',
        timestamp: Date.now(),
        sortPriority: 4
      });
    }

    // Check for pending payments due within 7 days
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueSoonInvoices = invoices.filter(inv => 
      (inv.status === 'sent' || inv.status === 'viewed') &&
      inv.dueDate &&
      new Date(inv.dueDate) <= nextWeek &&
      new Date(inv.dueDate) >= today
    );
    
    if (dueSoonInvoices.length > 0) {
      const dueSoonAmount = dueSoonInvoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
      
      ongoingAlerts.push({
        type: 'payment-due',
        icon: Clock,
        title: 'Payments Due Soon',
        description: `${dueSoonInvoices.length} invoice${dueSoonInvoices.length > 1 ? 's' : ''} due within 7 days`,
        details: `Total: $${dueSoonAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        time: 'Upcoming',
        action: 'View Pending',
        color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
        link: '/invoices?status=sent',
        timestamp: Date.now(),
        sortPriority: 2
      });
    }

    // Check for recent receipts from backend history
    const recentReceipts = receipts
      .filter((receipt) => {
        const savedAt = new Date(receipt.savedAt || receipt.paymentDate || receipt.date || Date.now());
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return savedAt > oneDayAgo;
      })
      .sort((a, b) => {
        const aTime = new Date(a.savedAt || a.paymentDate || a.date || 0).getTime();
        const bTime = new Date(b.savedAt || b.paymentDate || b.date || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 3); // Show max 3 recent receipts

    if (recentReceipts.length > 0) {
      const totalReceiptAmount = recentReceipts.reduce((sum, receipt) => sum + (receipt.total || 0), 0);
      
      if (recentReceipts.length === 1) {
        const receipt = recentReceipts[0];
        ongoingAlerts.push({
          type: 'receipt',
          icon: Receipt,
          title: 'Recent Receipt',
          description: `Receipt #${receipt.id} generated`,
          details: `Amount: $${(receipt.total || 0).toFixed(2)}`,
          time: 'Today',
          action: 'View Receipts',
          color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          link: '/receipts',
          timestamp: new Date(receipt.savedAt || receipt.paymentDate || receipt.date || Date.now()).getTime(),
          sortPriority: 2
        });
      } else {
        ongoingAlerts.push({
          type: 'receipt',
          icon: Receipt,
          title: 'Recent Receipts',
          description: `${recentReceipts.length} receipts generated today`,
          details: `Total amount: $${totalReceiptAmount.toFixed(2)}`,
          time: 'Today',
          action: 'View Receipts',
          color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          link: '/receipts',
          timestamp: Date.now(),
          sortPriority: 2
        });
      }
    }

    // Check for processing reports
    const processingReports = reports.filter(report => report.status === 'processing');
    if (processingReports.length > 0) {
      if (processingReports.length === 1) {
        const report = processingReports[0];
        ongoingAlerts.push({
          type: 'report',
          icon: BarChart3,
          title: 'Report in Progress',
          description: `${report.title} is being generated`,
          details: `${report.progress || 0}% complete`,
          time: 'Processing',
          action: 'View Progress',
          color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          link: '/reports',
          timestamp: new Date(report.createdAt).getTime(),
          sortPriority: 2,
          reportId: report.id
        });
      } else {
        ongoingAlerts.push({
          type: 'report',
          icon: BarChart3,
          title: 'Reports Processing',
          description: `${processingReports.length} reports being generated`,
          details: processingReports.map(r => r.title).join(', '),
          time: 'In progress',
          action: 'View Progress',
          color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          link: '/reports',
          timestamp: Date.now(),
          sortPriority: 2
        });
      }
    }

    // Check for recently completed reports (last 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const recentCompletedReports = reports.filter(report => 
      report.status === 'completed' && 
      new Date(report.createdAt) > twoHoursAgo
    );

    if (recentCompletedReports.length > 0) {
      if (recentCompletedReports.length === 1) {
        const report = recentCompletedReports[0];
        ongoingAlerts.push({
          type: 'report-completed',
          icon: BarChart3,
          title: 'Report Ready',
          description: `${report.title} is ready to download`,
          details: `Format: ${report.format?.toUpperCase()}`,
          time: 'Just completed',
          action: 'Download',
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
          link: '/reports',
          timestamp: new Date(report.createdAt).getTime(),
          sortPriority: 1,
          reportId: report.id
        });
      } else {
        ongoingAlerts.push({
          type: 'report-completed',
          icon: BarChart3,
          title: 'Reports Ready',
          description: `${recentCompletedReports.length} reports are ready`,
          details: recentCompletedReports.map(r => r.title).join(', '),
          time: 'Ready for download',
          action: 'View Reports',
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
          link: '/reports',
          timestamp: Date.now(),
          sortPriority: 1
        });
      }
    }

    // Payment-related alerts
    if (paymentStats) {
      // High pending payments alert
      if (paymentStats.pendingPayments > 10000) {
        ongoingAlerts.push({
          type: 'payment-reminder',
          icon: Clock,
          title: 'High Pending Payments',
          description: `$${paymentStats.pendingPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })} awaiting payment`,
          details: `${paymentStats.pendingCount} invoices pending`,
          time: 'Attention needed',
          action: 'Process Payments',
          color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800',
          link: '/payments',
          timestamp: Date.now(),
          sortPriority: 1
        });
      }

      // Failed payments alert
      if (paymentStats.failedCount > 0) {
        ongoingAlerts.push({
          type: 'failed-payment',
          icon: AlertCircle,
          title: 'Failed Payments',
          description: `${paymentStats.failedCount} payment${paymentStats.failedCount > 1 ? 's' : ''} failed`,
          details: `Total: $${paymentStats.failedPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          time: 'Needs review',
          action: 'View Failed',
          color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          link: '/payments?status=failed',
          timestamp: Date.now(),
          sortPriority: 0
        });
      }

      // Revenue trend alerts
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Calculate last week's revenue
      const lastWeekTransactions = transactions.filter(t => {
        const tDate = new Date(t.processedAt);
        return tDate >= lastWeek && tDate < today && t.amount > 0;
      });
      const lastWeekRevenue = lastWeekTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate this week's revenue
      const thisWeekTransactions = transactions.filter(t => {
        const tDate = new Date(t.processedAt);
        return tDate >= today && t.amount > 0;
      });
      const thisWeekRevenue = thisWeekTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      if (lastWeekRevenue > 0 && thisWeekRevenue > 0) {
        const changePercentage = ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100;
        
        if (changePercentage >= 20) {
          ongoingAlerts.push({
            type: 'revenue-trend',
            icon: TrendingUp,
            title: 'Revenue Growth',
            description: `Revenue increased by ${Math.abs(changePercentage).toFixed(1)}% this week`,
            details: `This week: $${thisWeekRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            time: 'Positive trend',
            action: 'View Analytics',
            color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
            link: '/payments',
            timestamp: Date.now(),
            sortPriority: 3
          });
        } else if (changePercentage <= -20) {
          ongoingAlerts.push({
            type: 'low-revenue',
            icon: TrendingDown,
            title: 'Revenue Decline',
            description: `Revenue decreased by ${Math.abs(changePercentage).toFixed(1)}% this week`,
            details: `This week: $${thisWeekRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            time: 'Needs attention',
            action: 'View Analytics',
            color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
            link: '/payments',
            timestamp: Date.now(),
            sortPriority: 1
          });
        }
      }
    }

    // Check for recent transactions (last 2 hours)
    const recentTransactions = transactions.filter(t => {
      const tDate = new Date(t.processedAt);
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      return tDate > twoHoursAgo;
    }).slice(0, 3); // Show max 3 recent transactions

    if (recentTransactions.length > 0) {
      const totalAmount = recentTransactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);
      
      if (recentTransactions.length === 1) {
        const transaction = recentTransactions[0];
        ongoingAlerts.push({
          type: transaction.amount > 0 ? 'payment' : 'refund',
          icon: transaction.amount > 0 ? DollarSign : RefreshCw,
          title: transaction.amount > 0 ? 'Recent Payment' : 'Recent Refund',
          description: transaction.amount > 0 
            ? `$${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} received`
            : `$${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} refunded`,
          details: `From ${transaction.customerName}`,
          time: 'Recent',
          action: 'View Transaction',
          color: transaction.amount > 0 
            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
            : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
          link: '/payments',
          timestamp: new Date(transaction.processedAt).getTime(),
          sortPriority: 1,
          transactionId: transaction.id
        });
      } else {
        ongoingAlerts.push({
          type: 'payment',
          icon: DollarSign,
          title: 'Recent Transactions',
          description: `${recentTransactions.length} recent ${recentTransactions.length > 1 ? 'transactions' : 'transaction'}`,
          details: `Total: $${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          time: 'Today',
          action: 'View Payments',
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
          link: '/payments',
          timestamp: Date.now(),
          sortPriority: 2
        });
      }
    }

    return ongoingAlerts;
  }, [invoices, reports, transactions, receipts, paymentStats, getInvoiceTotal]);

  // Combine notifications and ongoing alerts
  useEffect(() => {
    // Convert recent notifications to alerts (last 24 hours)
    const recentNotifications = getRecentNotifications(20);
    
    const recentAlerts = recentNotifications
      .filter(notif => {
        const notificationDate = new Date(notif.timestamp);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return notificationDate > oneDayAgo;
      })
      .map(convertNotificationToAlert);
    
    // Get ongoing alerts
    const ongoingAlerts = calculateOngoingAlerts();
    
    // Combine and deduplicate
    const allAlerts = [...recentAlerts, ...ongoingAlerts];
    
    // Remove duplicates by type and timestamp
    const uniqueAlerts = allAlerts.filter((alert, index, self) =>
      index === self.findIndex(a => 
        a.type === alert.type && 
        a.timestamp === alert.timestamp &&
        a.description === alert.description
      )
    );
    
    setAlerts(uniqueAlerts);
    
    // Update previous counts
    setPreviousInvoiceCount(invoices.length);
    setPreviousCustomerCount(customers.length);
    setPreviousTransactionCount(transactions.length);
    
  }, [notifications, invoices, customers, transactions, reports, getRecentNotifications, convertNotificationToAlert, calculateOngoingAlerts]);

  // Sort alerts by priority and time (newest first)
  const sortedAlerts = useMemo(() => {
    return alerts.sort((a, b) => {
      // First by sortPriority (lower number = higher priority)
      if (a.sortPriority !== b.sortPriority) {
        return a.sortPriority - b.sortPriority;
      }
      
      // If same priority, show most recent first
      return b.timestamp - a.timestamp;
    }).slice(0, 8); // Show up to 8 alerts
  }, [alerts]);

  const getIconColor = (type) => {
    switch (type) {
      case 'overdue': return 'text-red-500 dark:text-red-400';
      case 'draft': return 'text-amber-500 dark:text-amber-400';
      case 'payment': return 'text-emerald-500 dark:text-emerald-400';
      case 'customer': return 'text-blue-500 dark:text-blue-400';
      case 'new-invoice': return 'text-indigo-500 dark:text-indigo-400';
      case 'pending': return 'text-purple-500 dark:text-purple-400';
      case 'receipt': return 'text-green-500 dark:text-green-400';
      case 'report': return 'text-blue-500 dark:text-blue-400';
      case 'report-completed': return 'text-emerald-500 dark:text-emerald-400';
      case 'report-failed': return 'text-red-500 dark:text-red-400';
      case 'payment-method': return 'text-violet-500 dark:text-violet-400';
      case 'refund': return 'text-amber-500 dark:text-amber-400';
      case 'sync': return 'text-blue-500 dark:text-blue-400';
      case 'payment-due': return 'text-orange-500 dark:text-orange-400';
      case 'payment-reminder': return 'text-cyan-500 dark:text-cyan-400';
      case 'revenue-trend': return 'text-emerald-500 dark:text-emerald-400';
      case 'low-revenue': return 'text-red-500 dark:text-red-400';
      case 'failed-payment': return 'text-red-500 dark:text-red-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const handleClearAll = () => {
    setAlerts([]);
    setPreviousInvoiceCount(invoices.length);
    setPreviousCustomerCount(customers.length);
    setPreviousTransactionCount(transactions.length);
  };

  const handleAlertClick = (alert) => {
    if (alert.reportId) {
      // Store which report to show when navigating
      localStorage.setItem('ledgerly_focus_report', alert.reportId);
    }
    if (alert.transactionId) {
      // Store transaction to focus
      localStorage.setItem('ledgerly_focus_transaction', alert.transactionId);
    }
    if (alert.invoiceId) {
      // Store invoice to focus
      localStorage.setItem('ledgerly_focus_invoice', alert.invoiceId);
    }
  };

  // Calculate alert summary
  const alertSummary = useMemo(() => {
    const urgent = alerts.filter(a => a.sortPriority <= 1).length;
    const important = alerts.filter(a => a.sortPriority <= 2).length;
    const informational = alerts.filter(a => a.sortPriority >= 3).length;
    
    return { urgent, important, informational, total: alerts.length };
  }, [alerts]);

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts & Notifications</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {sortedAlerts.length} active alert{sortedAlerts.length !== 1 ? 's' : ''}
            {alertSummary.urgent > 0 && ` • ${alertSummary.urgent} urgent`}
          </p>
        </div>
        {sortedAlerts.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
          >
            Clear all
          </button>
        )}
      </div>
      
      {/* Alert Summary Badges */}
      {alertSummary.total > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {alertSummary.urgent > 0 && (
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-xs font-medium">
              {alertSummary.urgent} Urgent
            </span>
          )}
          {alertSummary.important > alertSummary.urgent && (
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-xs font-medium">
              {alertSummary.important - alertSummary.urgent} Important
            </span>
          )}
          {alertSummary.informational > 0 && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
              {alertSummary.informational} Info
            </span>
          )}
        </div>
      )}
      
      {sortedAlerts.length === 0 ? (
        <div className="text-center py-8 flex-1 flex flex-col justify-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No alerts at the moment
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Everything is running smoothly!
          </p>
          <div className="flex justify-center space-x-3">
            <Link
              to="/invoices/create"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
            >
              Create Invoice
            </Link>
            <Link
              to="/payments"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              View Payments
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 max-h-[500px] custom-scrollbar">
          {sortedAlerts.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <Link
                key={`${alert.type}-${index}-${alert.timestamp}`}
                to={alert.link || '#'}
                onClick={() => handleAlertClick(alert)}
                className={`block p-4 rounded-xl border ${alert.color} hover:opacity-90 transition-opacity hover:shadow-md hover:scale-[1.02] transition-transform duration-200`}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg ${getIconColor(alert.type)} bg-white dark:bg-gray-800 mr-3 flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 mr-2">
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">{alert.title}</h3>
                          {alert.sortPriority <= 1 && (
                            <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">{alert.description}</p>
                        {alert.details && (
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mt-1 truncate">{alert.details}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center whitespace-nowrap flex-shrink-0">
                        <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                        {alert.time}
                      </span>
                    </div>
                    <div className="mt-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center">
                      {alert.action}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      
      {/* Quick Stats Footer */}
      <div className={`mt-4 pt-4 border-t ${sortedAlerts.length > 0 ? 'border-gray-200 dark:border-gray-700' : ''}`}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Invoices</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{invoices.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Customers</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{customers.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Transactions</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{transactions.length}</div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default AlertsNotifications;
