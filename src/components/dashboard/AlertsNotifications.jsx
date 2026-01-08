// src/components/dashboard/AlertsNotifications.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertCircle, Package, DollarSign, UserPlus, Clock, ChevronRight, FileText, Receipt, BarChart3 } from 'lucide-react';
import { useInvoice } from '../../context/InvoiceContext';
import { useNotifications } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';

const AlertsNotifications = () => {
  const { invoices, customers } = useInvoice();
  const { notifications, getRecentNotifications } = useNotifications();
  
  const [alerts, setAlerts] = useState([]);
  const [previousInvoiceCount, setPreviousInvoiceCount] = useState(invoices.length);
  const [previousCustomerCount, setPreviousCustomerCount] = useState(customers.length);
  const [reports, setReports] = useState([]);
  
  // Load reports from localStorage
  useEffect(() => {
    try {
      const savedReports = JSON.parse(localStorage.getItem('ledgerly_reports') || '[]');
      setReports(savedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  }, []);

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
      'report-failed': AlertCircle
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
      'report-failed': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    };
    
    const priorityMap = {
      'overdue': 0,
      'report-failed': 0,
      'payment': 1,
      'new-invoice': 1,
      'new-customer': 1,
      'report-completed': 2,
      'receipt': 2,
      'report': 2,
      'draft': 3,
      'pending': 4
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
      reportId: notification.reportId
    };
  }, []);

  // Calculate ongoing alerts from invoices, customers, and reports
  const calculateOngoingAlerts = useCallback(() => {
    const ongoingAlerts = [];
    
    // Overdue invoices
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    
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
      const draftAmount = draftInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
      
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
      const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
      
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

    // Check for recent receipts from localStorage
    try {
      const savedReceipts = JSON.parse(localStorage.getItem('invoiceflow_receipts') || '[]');
      const recentReceipts = savedReceipts.filter(receipt => {
        const savedAt = new Date(receipt.savedAt || receipt.date || Date.now());
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return savedAt > oneDayAgo;
      }).slice(0, 3); // Show max 3 recent receipts

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
            timestamp: new Date(receipt.savedAt || receipt.date || Date.now()).getTime(),
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
    } catch (error) {
      console.error('Error checking receipts:', error);
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

    return ongoingAlerts;
  }, [invoices, reports]);

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
    
  }, [notifications, invoices, customers, reports, getRecentNotifications, convertNotificationToAlert, calculateOngoingAlerts]);

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
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const handleClearAll = () => {
    setAlerts([]);
    setPreviousInvoiceCount(invoices.length);
    setPreviousCustomerCount(customers.length);
  };

  const handleAlertClick = (alert) => {
    if (alert.reportId) {
      // Store which report to show when navigating
      localStorage.setItem('ledgerly_focus_report', alert.reportId);
    }
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts & Notifications</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {sortedAlerts.length} active alert{sortedAlerts.length !== 1 ? 's' : ''}
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
      
      {sortedAlerts.length === 0 ? (
        <div className="text-center py-8 flex-1 flex flex-col justify-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No alerts at the moment
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Everything is running smoothly!
          </p>
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
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">{alert.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">{alert.description}</p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mt-1 truncate">{alert.details}</p>
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