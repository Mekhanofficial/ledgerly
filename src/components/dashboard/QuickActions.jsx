import React from 'react';
import { FileText, Receipt, Package, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const QuickActions = () => {
  const authUser = useSelector((state) => state.auth?.user);
  const normalizedRole = String(authUser?.role || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  const isClient = normalizedRole === 'client';
  const canViewReports = ['admin', 'accountant', 'super_admin'].includes(normalizedRole);
  const canAccessReceipts = ['admin', 'accountant', 'super_admin'].includes(normalizedRole);
  const canManageInventoryAdmin = ['admin', 'accountant', 'super_admin'].includes(normalizedRole);

  if (isClient) {
    return null;
  }

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
      action: '/receipts',
      requiresRole: canAccessReceipts
    },
    {
      icon: Package,
      label: 'Add Product',
      description: 'Add to inventory',
      color: 'bg-gradient-to-br from-violet-500 to-purple-500',
      action: '/inventory/products/new',
      requiresRole: canManageInventoryAdmin
    },
    {
      icon: BarChart3,
      label: 'Create Report',
      description: 'Generate business insights',
      color: 'bg-gradient-to-br from-orange-500 to-amber-500',
      action: '/reports',
      requiresRole: canViewReports
    },
  ].filter((action) => action.requiresRole !== false);

  return (
    <div className="card p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <Link 
          to="/invoices" 
          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200"
        >
          View all actions →
        </Link>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.action}
              className="group flex flex-col items-center p-3 md:p-4 rounded-xl border border-gray-200 dark:border-gray-700 
                       hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md 
                       dark:hover:shadow-lg dark:hover:shadow-primary-900/20 hover:shadow-primary-100 
                       transition-all duration-200 bg-white dark:bg-gray-800 hover:scale-[1.02] 
                       active:scale-[0.98]"
            >
              <div 
                className={`${action.color} w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl 
                          flex items-center justify-center mb-2 md:mb-3 
                          group-hover:scale-110 transition-transform duration-300 
                          shadow-md group-hover:shadow-lg`}
              >
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white mb-1 text-xs sm:text-sm md:text-base text-center">
                {action.label}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight hidden sm:block">
                {action.description}
              </span>
            </Link>
          );
        })}
      </div>

    </div>
  );
};

export default QuickActions;
