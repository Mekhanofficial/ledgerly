// src/context/NotificationContext.js
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useInvoice } from './InvoiceContext';
import { useToast } from './ToastContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { invoices, customers } = useInvoice();
  const { addToast } = useToast();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Use refs to prevent infinite loops
  const prevInvoicesRef = useRef([]);
  const prevCustomersRef = useRef([]);
  const prevReportsRef = useRef([]);
  const processedItemsRef = useRef(new Set());

  // Load notifications from localStorage - only once on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedNotifications = JSON.parse(localStorage.getItem('ledgerly_notifications')) || [];
        setNotifications(savedNotifications);
        const unread = savedNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
        
        // Load processed items
        const savedProcessed = JSON.parse(localStorage.getItem('ledgerly_processed_items')) || [];
        processedItemsRef.current = new Set(savedProcessed);
        
        setInitialized(true);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    // Small delay to prevent UI blocking
    const timer = setTimeout(loadData, 100);
    return () => clearTimeout(timer);
  }, []);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (!loading && initialized) {
      try {
        localStorage.setItem('ledgerly_notifications', JSON.stringify(notifications));
        localStorage.setItem('ledgerly_processed_items', JSON.stringify([...processedItemsRef.current]));
        const unread = notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error saving notifications:', error);
      }
    }
  }, [notifications, loading, initialized]);

  // Check for new notifications - debounced and optimized
  const checkForNotifications = useCallback(() => {
    if (loading || !initialized) return;
    
    try {
      const newNotifications = [];
      const currentProcessedItems = processedItemsRef.current;
      const newProcessedItems = new Set(currentProcessedItems);

      // Only check if invoices, customers, or reports have actually changed
      const invoicesChanged = JSON.stringify(invoices) !== JSON.stringify(prevInvoicesRef.current);
      const customersChanged = JSON.stringify(customers) !== JSON.stringify(prevCustomersRef.current);
      
      // Check reports separately
      let reports = [];
      try {
        reports = JSON.parse(localStorage.getItem('ledgerly_reports') || '[]');
      } catch (error) {
        console.error('Error loading reports:', error);
      }
      
      const reportsChanged = JSON.stringify(reports) !== JSON.stringify(prevReportsRef.current);
      
      if (!invoicesChanged && !customersChanged && !reportsChanged) {
        return; // No changes, skip processing
      }

      // Check for new invoices
      if (invoicesChanged) {
        invoices.forEach(inv => {
          const invoiceKey = `invoice_${inv.id}`;
          if (currentProcessedItems.has(invoiceKey)) return;
          
          const createdAt = new Date(inv.createdAt);
          const now = new Date();
          const minutesAgo = Math.floor((now - createdAt) / (1000 * 60));
          
          if (minutesAgo < 5) {
            newNotifications.push({
              id: `notif_${Date.now()}_invoice_${inv.id}`,
              type: 'new-invoice',
              title: 'New Invoice Created',
              description: `Invoice #${inv.number || inv.invoiceNumber} for ${inv.customer || 'Customer'}`,
              details: `Amount: $${(inv.totalAmount || inv.amount || 0).toLocaleString()}`,
              time: 'Just now',
              action: 'View Invoice',
              color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
              link: `/invoices/view/${inv.id}`,
              timestamp: new Date().toISOString(),
              read: false,
              icon: 'FileText',
              invoiceId: inv.id
            });
            newProcessedItems.add(invoiceKey);
          }
        });
      }

      // Check for new customers
      if (customersChanged) {
        customers.forEach(cust => {
          const customerKey = `customer_${cust.id}`;
          if (currentProcessedItems.has(customerKey)) return;
          
          const createdAt = new Date(cust.createdAt || cust.joinedDate);
          const now = new Date();
          const minutesAgo = Math.floor((now - createdAt) / (1000 * 60));
          
          if (minutesAgo < 5) {
            newNotifications.push({
              id: `notif_${Date.now()}_customer_${cust.id}`,
              type: 'new-customer',
              title: 'New Customer Added',
              description: `${cust.name} has been added`,
              details: cust.email || 'No email provided',
              time: 'Just now',
              action: 'View Profile',
              color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
              link: `/customers/${cust.id}`,
              timestamp: new Date().toISOString(),
              read: false,
              icon: 'UserPlus',
              customerId: cust.id
            });
            newProcessedItems.add(customerKey);
          }
        });
      }

      // Check for paid invoices
      if (invoicesChanged) {
        invoices.forEach(inv => {
          const paidKey = `paid_${inv.id}`;
          if (currentProcessedItems.has(paidKey)) return;
          
          if (inv.status === 'paid') {
            const paidAt = new Date(inv.paidAt || inv.updatedAt || inv.createdAt);
            const now = new Date();
            const hoursAgo = Math.floor((now - paidAt) / (1000 * 60 * 60));
            
            if (hoursAgo < 24) { // Within last 24 hours
              newNotifications.push({
                id: `notif_${Date.now()}_paid_${inv.id}`,
                type: 'payment',
                title: 'Payment Received',
                description: `$${(inv.totalAmount || inv.amount || 0).toLocaleString()} from ${inv.customer || 'Customer'}`,
                details: `Invoice #${inv.number || inv.invoiceNumber}`,
                time: hoursAgo < 1 ? 'Just now' : `${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`,
                action: 'View Receipt',
                color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
                link: `/invoices/view/${inv.id}`,
                timestamp: new Date().toISOString(),
                read: false,
                icon: 'DollarSign',
                invoiceId: inv.id
              });
              newProcessedItems.add(paidKey);
            }
          }
        });
      }

      // Check for overdue invoices
      if (invoicesChanged) {
        const overdueInvoices = invoices.filter(inv => 
          inv.status === 'overdue' && 
          new Date(inv.dueDate) < new Date() &&
          !notifications.some(n => n.type === 'overdue' && n.invoiceId === inv.id)
        );

        overdueInvoices.forEach(inv => {
          newNotifications.push({
            id: `notif_${Date.now()}_overdue_${inv.id}`,
            type: 'overdue',
            title: 'Overdue Invoice',
            description: `Invoice #${inv.number || inv.invoiceNumber} is past due`,
            details: `Due date: ${new Date(inv.dueDate).toLocaleDateString()}`,
            time: 'Urgent',
            action: 'View Invoice',
            color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
            link: `/invoices/view/${inv.id}`,
            timestamp: new Date().toISOString(),
            read: false,
            icon: 'AlertCircle',
            invoiceId: inv.id
          });
        });
      }

      // Check for new receipts
      try {
        const savedReceipts = JSON.parse(localStorage.getItem('invoiceflow_receipts') || '[]');
        const recentReceipts = savedReceipts.filter(receipt => {
          const receiptKey = `receipt_${receipt.id}`;
          if (currentProcessedItems.has(receiptKey)) return false;
          
          const savedAt = new Date(receipt.savedAt || receipt.date || Date.now());
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          return savedAt > oneHourAgo;
        });

        recentReceipts.forEach(receipt => {
          const receiptKey = `receipt_${receipt.id}`;
          newNotifications.push({
            id: `notif_${Date.now()}_receipt_${receipt.id}`,
            type: 'receipt',
            title: 'New Receipt Generated',
            description: `Receipt #${receipt.id} for ${receipt.customerEmail || 'Walk-in Customer'}`,
            details: `Amount: $${(receipt.total || 0).toFixed(2)}`,
            time: 'Just now',
            action: 'View Receipt',
            color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
            link: '/receipts',
            timestamp: new Date().toISOString(),
            read: false,
            icon: 'Receipt',
            receiptId: receipt.id
          });
          newProcessedItems.add(receiptKey);
        });
      } catch (error) {
        console.error('Error checking receipts:', error);
      }

      // Check for completed reports
      if (reportsChanged) {
        const completedReports = reports.filter(report => {
          const reportKey = `report_${report.id}`;
          if (currentProcessedItems.has(reportKey)) return false;
          
          return report.status === 'completed' && 
                 new Date(report.createdAt).getTime() > (Date.now() - 5 * 60 * 1000); // Last 5 minutes
        });

        completedReports.forEach(report => {
          const reportKey = `report_${report.id}`;
          newNotifications.push({
            id: `notif_${Date.now()}_report_${report.id}`,
            type: 'report-completed',
            title: 'Report Generated',
            description: `${report.title} is ready`,
            details: `Click to view and download`,
            time: 'Just now',
            action: 'View Report',
            color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            link: '/reports',
            timestamp: new Date().toISOString(),
            read: false,
            icon: 'BarChart3',
            reportId: report.id
          });
          newProcessedItems.add(reportKey);
        });

        // Check for failed reports
        const failedReports = reports.filter(report => {
          const reportKey = `report_failed_${report.id}`;
          if (currentProcessedItems.has(reportKey)) return false;
          
          return report.status === 'failed' && 
                 new Date(report.updatedAt || report.createdAt).getTime() > (Date.now() - 5 * 60 * 1000);
        });

        failedReports.forEach(report => {
          const reportKey = `report_failed_${report.id}`;
          newNotifications.push({
            id: `notif_${Date.now()}_report_failed_${report.id}`,
            type: 'report-failed',
            title: 'Report Generation Failed',
            description: `Failed to generate ${report.title}`,
            details: 'Click to retry',
            time: 'Just now',
            action: 'Retry',
            color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
            link: '/reports',
            timestamp: new Date().toISOString(),
            read: false,
            icon: 'AlertCircle',
            reportId: report.id
          });
          newProcessedItems.add(reportKey);
        });

        // Check for new report creation
        const newReports = reports.filter(report => {
          const reportKey = `report_new_${report.id}`;
          if (currentProcessedItems.has(reportKey)) return false;
          
          return new Date(report.createdAt).getTime() > (Date.now() - 2 * 60 * 1000); // Last 2 minutes
        });

        newReports.forEach(report => {
          const reportKey = `report_new_${report.id}`;
          newNotifications.push({
            id: `notif_${Date.now()}_report_new_${report.id}`,
            type: 'report',
            title: 'Report Creation Started',
            description: `${report.title} is being generated`,
            details: 'Processing...',
            time: 'Just now',
            action: 'View Progress',
            color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            link: '/reports',
            timestamp: new Date().toISOString(),
            read: false,
            icon: 'BarChart3',
            reportId: report.id
          });
          newProcessedItems.add(reportKey);
        });
      }

      // Update state if we have new notifications
      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
        processedItemsRef.current = newProcessedItems;
        
        // Show a single toast for the most important notification
        if (newNotifications.some(n => n.type === 'overdue' || n.type === 'report-failed')) {
          const importantNotif = newNotifications.find(n => n.type === 'overdue' || n.type === 'report-failed');
          addToast(importantNotif.description, 'error');
        } else if (newNotifications.some(n => n.type === 'payment')) {
          const paymentNotif = newNotifications.find(n => n.type === 'payment');
          addToast(paymentNotif.description, 'success');
        } else if (newNotifications.some(n => n.type === 'report-completed')) {
          const reportNotif = newNotifications.find(n => n.type === 'report-completed');
          addToast(reportNotif.description, 'success');
        } else if (newNotifications.length === 1) {
          addToast(newNotifications[0].description, 'info');
        } else if (newNotifications.length > 1) {
          // Show count for multiple notifications
          const receiptCount = newNotifications.filter(n => n.type === 'receipt').length;
          const invoiceCount = newNotifications.filter(n => n.type === 'new-invoice').length;
          const customerCount = newNotifications.filter(n => n.type === 'new-customer').length;
          const reportCount = newNotifications.filter(n => n.type.includes('report')).length;
          
          let message = '';
          if (reportCount > 0) message += `${reportCount} new report${reportCount > 1 ? 's' : ''} `;
          if (receiptCount > 0) message += `${receiptCount} new receipt${receiptCount > 1 ? 's' : ''} `;
          if (invoiceCount > 0) message += `${invoiceCount} new invoice${invoiceCount > 1 ? 's' : ''} `;
          if (customerCount > 0) message += `${customerCount} new customer${customerCount > 1 ? 's' : ''} `;
          
          if (message) {
            addToast(`${message.trim()} created`, 'info');
          }
        }
      }

      // Update refs for next comparison
      prevInvoicesRef.current = [...invoices];
      prevCustomersRef.current = [...customers];
      prevReportsRef.current = reports;

    } catch (error) {
      console.error('Error checking for notifications:', error);
    }
  }, [invoices, customers, notifications, addToast, loading, initialized]);

  // Debounced notification check when data changes
  useEffect(() => {
    if (!initialized || loading) return;
    
    const timer = setTimeout(() => {
      checkForNotifications();
    }, 500); // Wait 500ms after data loads
    
    return () => clearTimeout(timer);
  }, [invoices, customers, initialized, loading, checkForNotifications]);

  // Also check periodically (every 5 minutes)
  useEffect(() => {
    if (!initialized) return;
    
    const interval = setInterval(() => {
      checkForNotifications();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkForNotifications, initialized]);

  const addNotification = useCallback((notificationData) => {
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notificationData,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Also show a toast for immediate feedback
    addToast(notificationData.description || 'New notification', 'info');
    
    return newNotification;
  }, [addToast]);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const getNotificationStats = useCallback(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const today = notifications.filter(n => {
      const notifDate = new Date(n.timestamp);
      const todayDate = new Date();
      return notifDate.toDateString() === todayDate.toDateString();
    }).length;
    const important = notifications.filter(n => n.type === 'overdue' || n.type === 'warning' || n.type === 'error' || n.type === 'report-failed').length;
    
    return { total, unread, today, important };
  }, [notifications]);

  const getNotificationsByType = useCallback((type) => {
    switch(type) {
      case 'all':
        return notifications;
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'today':
        const today = new Date();
        return notifications.filter(n => new Date(n.timestamp).toDateString() === today.toDateString());
      default:
        return notifications.filter(n => n.type === type);
    }
  }, [notifications]);

  const getRecentNotifications = useCallback((limit = 5) => {
    return notifications
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }, [notifications]);

  // Special function to add report notifications
  const addReportNotification = useCallback((reportData, status = 'completed') => {
    const iconMap = {
      'completed': 'BarChart3',
      'failed': 'AlertCircle',
      'processing': 'BarChart3'
    };
    
    const typeMap = {
      'completed': 'report-completed',
      'failed': 'report-failed',
      'processing': 'report'
    };
    
    const colorMap = {
      'completed': 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      'failed': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      'processing': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    };
    
    const actionMap = {
      'completed': 'Download Report',
      'failed': 'Retry',
      'processing': 'View Progress'
    };
    
    const titleMap = {
      'completed': 'Report Generated',
      'failed': 'Report Generation Failed',
      'processing': 'Report in Progress'
    };
    
    const descriptionMap = {
      'completed': `${reportData.title} is ready`,
      'failed': `Failed to generate ${reportData.title}`,
      'processing': `${reportData.title} is being generated`
    };
    
    const notification = addNotification({
      type: typeMap[status],
      title: titleMap[status],
      description: descriptionMap[status],
      details: status === 'completed' ? `Format: ${reportData.format?.toUpperCase()}` : 'Click for details',
      time: 'Just now',
      action: actionMap[status],
      color: colorMap[status],
      link: '/reports',
      icon: iconMap[status],
      reportId: reportData.id
    });
    
    return notification;
  }, [addNotification]);

  const contextValue = {
    notifications,
    unreadCount,
    loading,
    addNotification,
    addReportNotification, // New function for report notifications
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getNotificationStats,
    getNotificationsByType,
    getRecentNotifications
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};