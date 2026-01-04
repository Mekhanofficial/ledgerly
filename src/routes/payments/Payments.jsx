import React, { useState } from 'react';
import { CreditCard, Plus, Filter, Download, BarChart3, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import PaymentStats from '../../components/payments/PaymentStats';
import PaymentTable from '../../components/payments/PaymentTable';
import { useTheme } from '../../context/ThemeContext';

const Payments = () => {
  const { isDarkMode } = useTheme();
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');

  const payments = [
    // ... (same payments data)
  ];

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.status === filter);

  const handleViewDetails = (paymentId) => {
    console.log('View payment details:', paymentId);
  };

  const handleProcessPayment = (paymentId) => {
    console.log('Process payment:', paymentId);
  };

  const handleRefund = (paymentId) => {
    console.log('Refund payment:', paymentId);
  };

  const handleSyncPayments = () => {
    console.log('Syncing payments...');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Payments
            </h1>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage and track customer payments
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button 
              onClick={handleSyncPayments}
              className={`flex items-center px-4 py-2 border rounded-lg ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Payments
            </button>
            <button className={`flex items-center px-4 py-2 border rounded-lg ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </button>
          </div>
        </div>

        {/* Stats Component */}
        <PaymentStats />

        {/* Date Range and Filters */}
        <div className={`border rounded-xl p-4 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['today', 'yesterday', 'this-week', 'this-month', 'last-month'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                    dateRange === range
                      ? 'bg-primary-600 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.replace('-', ' ')}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex flex-wrap gap-2">
                {['all', 'completed', 'pending', 'failed', 'refunded'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                      filter === status
                        ? 'bg-primary-600 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <button className={`flex items-center px-3 py-2 border rounded-lg ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}>
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </button>
              <button className={`flex items-center px-3 py-2 border rounded-lg ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Payment Table Component */}
        <PaymentTable
          payments={filteredPayments}
          onViewDetails={handleViewDetails}
          onProcess={handleProcessPayment}
          onRefund={handleRefund}
        />

        {/* Payment Methods Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Methods Card */}
          <div className={`border rounded-xl p-6 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Payment Methods
            </h3>
            <div className="space-y-3">
              {[
                { method: 'Credit Card', percentage: 45, amount: '$40,158', color: 'bg-blue-500' },
                { method: 'Bank Transfer', percentage: 28, amount: '$24,987', color: 'bg-emerald-500' },
                { method: 'PayPal', percentage: 15, amount: '$13,386', color: 'bg-blue-400' },
                { method: 'Mobile Money', percentage: 8, amount: '$7,139', color: 'bg-purple-500' },
                { method: 'Cash', percentage: 4, amount: '$3,570', color: 'bg-gray-500' }
              ].map((item) => (
                <div key={item.method} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${item.color} rounded-full mr-3`}></div>
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {item.method}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.percentage}%
                    </div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {item.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className={`border rounded-xl p-6 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className={`w-full flex items-center justify-between p-3 border rounded-lg ${
                isDarkMode 
                  ? 'border-gray-700 hover:bg-gray-750' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
                  <span className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Process Pending Payments
                  </span>
                </div>
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  15 pending
                </span>
              </button>
              <button className={`w-full flex items-center justify-between p-3 border rounded-lg ${
                isDarkMode 
                  ? 'border-gray-700 hover:bg-gray-750' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <div className="flex items-center">
                  <Download className="w-5 h-5 text-emerald-600 mr-3" />
                  <span className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Export Payment Report
                  </span>
                </div>
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  PDF/Excel
                </span>
              </button>
              <button className={`w-full flex items-center justify-between p-3 border rounded-lg ${
                isDarkMode 
                  ? 'border-gray-700 hover:bg-gray-750' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
                  <span className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    View Payment Analytics
                  </span>
                </div>
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  →
                </span>
              </button>
            </div>
          </div>

          {/* Payment Status Card */}
          <div className={`border rounded-xl p-6 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Payment Status
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Completed</span>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    85%
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Pending</span>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    12%
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div className="bg-amber-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Failed/Refunded</span>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    3%
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '3%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payments;