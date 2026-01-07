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

      // Only check if invoices or customers have actually changed
      const invoicesChanged = JSON.stringify(invoices) !== JSON.stringify(prevInvoicesRef.current);
      const customersChanged = JSON.stringify(customers) !== JSON.stringify(prevCustomersRef.current);
      
      if (!invoicesChanged && !customersChanged) {
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

      // Update state if we have new notifications
      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
        processedItemsRef.current = newProcessedItems;
        
        // Show a single toast for the most important notification
        if (newNotifications.some(n => n.type === 'overdue')) {
          const overdueNotif = newNotifications.find(n => n.type === 'overdue');
          addToast(overdueNotif.description, 'error');
        } else if (newNotifications.some(n => n.type === 'payment')) {
          const paymentNotif = newNotifications.find(n => n.type === 'payment');
          addToast(paymentNotif.description, 'success');
        } else if (newNotifications.length === 1) {
          addToast(newNotifications[0].description, 'info');
        } else if (newNotifications.length > 1) {
          // Show count for multiple notifications
          const receiptCount = newNotifications.filter(n => n.type === 'receipt').length;
          const invoiceCount = newNotifications.filter(n => n.type === 'new-invoice').length;
          const customerCount = newNotifications.filter(n => n.type === 'new-customer').length;
          
          let message = '';
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
    const important = notifications.filter(n => n.type === 'overdue' || n.type === 'warning' || n.type === 'error').length;
    
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

  const contextValue = {
    notifications,
    unreadCount,
    loading,
    addNotification,
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