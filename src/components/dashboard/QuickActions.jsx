import React from 'react';
import { FileText, Receipt, Package, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const actions = [
    {
      icon: FileText,
      label: 'Create Invoice',
      description: 'New invoice for customer',
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      action: '/invoices/create'
    },
    {
      icon: Receipt,
      label: 'Generate Receipt',
      description: 'Quick POS receipt',
      color: 'bg-gradient-to-br from-emerald-500 to-green-500',
      action: '/receipts/create'
    },
    {
      icon: Package,
      label: 'Add Product',
      description: 'Add to inventory',
      color: 'bg-gradient-to-br from-violet-500 to-purple-500',
      action: '/products/create'
    },
    {
      icon: Mail,
      label: 'Send Reminders',
      description: 'Overdue invoices',
      color: 'bg-gradient-to-br from-amber-500 to-orange-500',
      action: '/invoices/reminders'
    }
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        <Link to="/actions" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
          View all actions →
        </Link>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.action}
              className="group flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
            >
              <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white mb-1 text-sm">{action.label}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">{action.description}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;