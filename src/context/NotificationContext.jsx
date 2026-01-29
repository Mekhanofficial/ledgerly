// src/context/NotificationContext.js - FIXED VERSION
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useToast } from './ToastContext';

export const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
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

  // Separate function to check for invoice notifications (called externally)
  const checkInvoiceNotifications = useCallback((invoices, customers) => {
    if (loading || !initialized) return [];
    
    try {
      const newNotifications = [];
      const currentProcessedItems = processedItemsRef.current;
      const newProcessedItems = new Set(currentProcessedItems);

      // Check invoices changed
      const invoicesChanged = JSON.stringify(invoices) !== JSON.stringify(prevInvoicesRef.current);
      const customersChanged = JSON.stringify(customers) !== JSON.stringify(prevCustomersRef.current);
      
      if (!invoicesChanged && !customersChanged) {
        return []; // No changes
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

      // Update refs
      prevInvoicesRef.current = [...invoices];
      prevCustomersRef.current = [...customers];
      
      // Update processed items
      processedItemsRef.current = newProcessedItems;
      
      return newNotifications;
    } catch (error) {
      console.error('Error checking invoice notifications:', error);
      return [];
    }
  }, [loading, initialized]);

  // Check for notifications from external sources
  const checkExternalNotifications = useCallback(() => {
    try {
      const newNotifications = [];
      const currentProcessedItems = processedItemsRef.current;
      const newProcessedItems = new Set(currentProcessedItems);

      // Check for new receipts
      try {
        const savedReceipts = JSON.parse(localStorage.getItem('Ledgerly_receipts') || '[]');
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
      try {
        const reports = JSON.parse(localStorage.getItem('ledgerly_reports') || '[]');
        const completedReports = reports.filter(report => {
          const reportKey = `report_${report.id}`;
          if (currentProcessedItems.has(reportKey)) return false;
          
          return report.status === 'completed' && 
                 new Date(report.createdAt).getTime() > (Date.now() - 5 * 60 * 1000);
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
      } catch (error) {
        console.error('Error checking reports:', error);
      }

      // Update processed items
      processedItemsRef.current = newProcessedItems;
      
      return newNotifications;
    } catch (error) {
      console.error('Error checking external notifications:', error);
      return [];
    }
  }, []);

  const addNotification = useCallback((notificationData, options = {}) => {
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notificationData,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Also show a toast for immediate feedback
    if (options.showToast !== false) {
      addToast(notificationData.description || 'New notification', 'info');
    }
    
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

  // Add multiple notifications at once
  const addNotifications = useCallback((notificationList) => {
    const newNotifications = notificationList.map(data => ({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      timestamp: new Date().toISOString(),
      read: false
    }));
    
    setNotifications(prev => [...newNotifications, ...prev]);
    
    if (newNotifications.length > 0) {
      addToast(`Added ${newNotifications.length} new notification(s)`, 'info');
    }
    
    return newNotifications;
  }, [addToast]);

  const addReportNotification = useCallback((report, status = 'completed') => {
    if (!report) return null;

    const title = report.title || 'Report';
    const notification = {
      type: 'report',
      title: status === 'completed' ? `${title} ready` : `${title} ${status}`,
      description: report.description || `Report ${status === 'completed' ? 'completed' : status}`,
      details: status === 'completed'
        ? `Download now from the generated reports list`
        : `Status: ${status}`,
      time: 'Just now',
      action: 'View Report',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      link: '/reports',
      icon: 'ReportChart',
      reportId: report.id
    };

    return addNotification(notification, { showToast: false });
  }, [addNotification]);

  const contextValue = {
    notifications,
    unreadCount,
    loading,
    addNotification,
    addNotifications,
    addReportNotification,
    checkInvoiceNotifications,
    checkExternalNotifications,
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
