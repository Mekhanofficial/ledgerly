// src/components/payments/PaymentStats.js - UPDATED
import React from 'react';
import { DollarSign, CreditCard, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const PaymentStats = ({ stats }) => {
  const { isDarkMode } = useTheme();
  
  // Default stats if none provided
  const defaultStats = {
    totalRevenue: 0,
    pendingPayments: 0,
    pendingCount: 0,
    processedToday: 0,
    todayCount: 0,
    failedPayments: 0,
    failedCount: 0
  };
  
  const actualStats = stats || defaultStats;
  
  const statsData = [
    {
      label: 'Total Revenue',
      value: `$${actualStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      description: 'This month',
      icon: DollarSign,
      color: 'bg-emerald-500',
      darkColor: 'bg-emerald-600'
    },
    {
      label: 'Pending Payments',
      value: `$${actualStats.pendingPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      description: `${actualStats.pendingCount} transactions`,
      icon: Clock,
      color: 'bg-amber-500',
      darkColor: 'bg-amber-600'
    },
    {
      label: 'Processed Today',
      value: `$${actualStats.processedToday.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      description: `${actualStats.todayCount} transactions`,
      icon: CheckCircle,
      color: 'bg-blue-500',
      darkColor: 'bg-blue-600'
    },
    {
      label: 'Failed Payments',
      value: `$${actualStats.failedPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      description: `${actualStats.failedCount} transactions`,
      icon: AlertTriangle,
      color: 'bg-red-500',
      darkColor: 'bg-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={`
            border rounded-xl p-5 hover:shadow-sm transition-shadow
            ${isDarkMode 
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
              : 'bg-white border-gray-200 hover:bg-gray-50'}
          `}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </p>
                <p className={`text-sm mt-2 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {stat.description}
                </p>
              </div>
              <div className={`${stat.color} ${isDarkMode ? stat.darkColor : stat.color} 
                w-12 h-12 rounded-xl flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentStats;