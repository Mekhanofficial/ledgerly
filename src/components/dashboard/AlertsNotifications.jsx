import React from 'react';
import { AlertCircle, Package, DollarSign, UserPlus, Clock, ChevronRight } from 'lucide-react';

const AlertsNotifications = () => {
  const alerts = [
    {
      type: 'overdue',
      icon: AlertCircle,
      title: 'Overdue Invoices',
      description: '8 invoices are past due',
      details: 'Total amount: $24,680',
      time: 'Urgent',
      action: 'View Details',
      color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    },
    {
      type: 'stock',
      icon: Package,
      title: 'Low Stock Alert',
      description: '5 products are running low on stock',
      details: 'Check inventory levels',
      time: 'Today',
      action: 'Manage Inventory',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
    },
    {
      type: 'payment',
      icon: DollarSign,
      title: 'Payment Received',
      description: '$2,450 payment from Acme Corp',
      details: 'For INV-2024-001',
      time: '2 hours ago',
      action: 'View Receipt',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
    },
    {
      type: 'customer',
      icon: UserPlus,
      title: 'New Customer Added',
      description: 'BlueTech Industries has been added',
      details: 'To your customer list',
      time: '5 hours ago',
      action: 'View Profile',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  ];

  const getIconColor = (type) => {
    switch (type) {
      case 'overdue': return 'text-red-500 dark:text-red-400';
      case 'stock': return 'text-amber-500 dark:text-amber-400';
      case 'payment': return 'text-emerald-500 dark:text-emerald-400';
      case 'customer': return 'text-blue-500 dark:text-blue-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts</h2>
        <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
          Mark all as read
        </button>
      </div>
      
      <div className="space-y-4">
        {alerts.map((alert, index) => {
          const Icon = alert.icon;
          return (
            <div key={index} className={`p-4 rounded-xl border ${alert.color}`}>
              <div className="flex items-start">
                <div className={`p-2 rounded-lg ${getIconColor(alert.type)} bg-white dark:bg-gray-800 mr-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{alert.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{alert.description}</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mt-1">{alert.details}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {alert.time}
                    </span>
                  </div>
                  <button className="mt-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center">
                    {alert.action}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsNotifications;