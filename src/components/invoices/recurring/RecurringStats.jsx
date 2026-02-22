// src/components/invoices/recurring/RecurringStats.jsx
import React from 'react';
import { Play, DollarSign, Users, Calendar, Clock } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useAccount } from '../../../context/AccountContext';
import { formatCurrency } from '../../../utils/currency';

const RecurringStats = ({ invoices = [] }) => {
  const { isDarkMode } = useTheme();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  const formatMoney = (value) => formatCurrency(value, baseCurrency);
  
  const activeInvoices = invoices.filter(inv => inv.status === 'active');
  const totalValue = activeInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const next30Days = activeInvoices.filter(inv => {
    if (!inv.nextRun) return false;
    const nextRun = new Date(inv.nextRun);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return nextRun <= thirtyDaysFromNow;
  }).length;

  const stats = [
    { 
      label: 'Active Profiles', 
      value: activeInvoices.length.toString(), 
      icon: Play, 
      color: 'bg-emerald-500' 
    },
    { 
      label: 'Total Value', 
      value: `${formatMoney(totalValue)}/mo`, 
      icon: DollarSign, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Customers', 
      value: [...new Set(invoices.map(inv => inv.customer?.name || inv.customer))].length.toString(), 
      icon: Users, 
      color: 'bg-violet-500' 
    },
    { 
      label: 'Next 30 Days', 
      value: `${next30Days} invoices`, 
      icon: Calendar, 
      color: 'bg-amber-500' 
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={`border rounded-xl p-5 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
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
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecurringStats;
