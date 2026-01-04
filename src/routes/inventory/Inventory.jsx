import React from 'react';
import { Package, ArrowRight, TrendingUp, TrendingDown, BarChart, AlertCircle, Layers, Users } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Inventory = () => {
  const { isDarkMode } = useTheme();
  
  const quickStats = [
    {
      label: 'Total Products',
      value: '42',
      change: '+12%',
      icon: Package,
      color: 'bg-blue-500',
      to: '/inventory/products'
    },
    {
      label: 'Total Value',
      value: '$89,240',
      change: '+32%',
      icon: TrendingUp,
      color: 'bg-emerald-500',
      to: '/inventory'
    },
    {
      label: 'Low Stock Items',
      value: '5',
      change: '-2',
      icon: AlertCircle,
      color: 'bg-amber-500',
      to: '/inventory/products?filter=low-stock'
    },
    {
      label: 'Categories',
      value: '8',
      change: '+1',
      icon: Layers,
      color: 'bg-violet-500',
      to: '/inventory/categories'
    }
  ];

  const recentActivity = [
    { id: 1, action: 'Restocked Wireless Headphones', quantity: '+25', time: '2 hours ago', user: 'John D.' },
    { id: 2, action: 'Low stock alert: Laptop Computers', quantity: '8 left', time: '5 hours ago', user: 'System' },
    { id: 3, action: 'New supplier added', details: 'Tech Distributors', time: '1 day ago', user: 'Sarah W.' },
    { id: 4, action: 'Stock adjustment', details: 'Office Chair returned', time: '2 days ago', user: 'Mike J.' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Inventory Dashboard
            </h1>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Overview of your inventory management
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Link
              to="/inventory/products"
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Manage Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                to={stat.to}
                className={`border rounded-xl p-5 hover:shadow-lg transition-shadow cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:border-primary-500' 
                    : 'bg-white border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.value}
                    </p>
                    <p className={`text-sm mt-2 ${
                      stat.change.startsWith('+') 
                        ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        : isDarkMode ? 'text-amber-400' : 'text-amber-600'
                    }`}>
                      {stat.change} vs last month
                    </p>
                  </div>
                  <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/inventory/products"
            className={`border rounded-xl p-6 hover:shadow-lg transition-shadow ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-primary-500' 
                : 'bg-white border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <Package className={`w-6 h-6 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Products
                </h3>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Manage all products
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/inventory/categories"
            className={`border rounded-xl p-6 hover:shadow-lg transition-shadow ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-primary-500' 
                : 'bg-white border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-100'
              }`}>
                <Layers className={`w-6 h-6 ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Categories
                </h3>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Organize by category
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/inventory/stock-adjustments"
            className={`border rounded-xl p-6 hover:shadow-lg transition-shadow ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-primary-500' 
                : 'bg-white border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'
              }`}>
                <BarChart className={`w-6 h-6 ${
                  isDarkMode ? 'text-amber-400' : 'text-amber-600'
                }`} />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Stock Adjustments
                </h3>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Track inventory changes
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/inventory/suppliers"
            className={`border rounded-xl p-6 hover:shadow-lg transition-shadow ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-primary-500' 
                : 'bg-white border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                isDarkMode ? 'bg-violet-900/30' : 'bg-violet-100'
              }`}>
                <Users className={`w-6 h-6 ${
                  isDarkMode ? 'text-violet-400' : 'text-violet-600'
                }`} />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Suppliers
                </h3>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Manage suppliers
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className={`border rounded-xl p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Recent Inventory Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className={`flex items-center justify-between py-3 border-b last:border-0 ${
                isDarkMode ? 'border-gray-700' : 'border-gray-100'
              }`}>
                <div>
                  <p className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {activity.action}
                  </p>
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {activity.details && <span className="mr-2">{activity.details}</span>}
                    {activity.quantity && <span className={`font-medium ${
                      activity.quantity.startsWith('+') 
                        ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        : isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {activity.quantity}
                    </span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {activity.time}
                  </p>
                  <p className={`text-xs mt-1 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    by {activity.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;