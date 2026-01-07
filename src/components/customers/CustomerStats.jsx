import React from 'react';
import { Users, UserCheck, DollarSign, TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useInvoice } from '../../context/InvoiceContext'; // Added import

const CustomerStats = () => {
  const { isDarkMode } = useTheme();
  const { getCustomerStats } = useInvoice(); // Get real stats
  
  // Use real stats from context instead of hardcoded values
  const statsData = getCustomerStats();
  
  const stats = [
    {
      label: 'Total Customers',
      value: statsData[0]?.value || '0',
      description: '+8.3% vs last month',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      label: 'Active Customers',
      value: statsData[1]?.value || '0',
      description: 'Transactions in last 90 days',
      icon: UserCheck,
      color: 'bg-emerald-500'
    },
    {
      label: 'Total Outstanding',
      value: statsData[2]?.value || '$0.00',
      description: 'Across all customers',
      icon: DollarSign,
      color: 'bg-amber-500'
    },
    {
      label: 'Avg Transaction Value',
      value: statsData[3]?.value || '$0.00',
      description: '+4.2% vs last month',
      icon: TrendingUp,
      color: 'bg-violet-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={`border rounded-xl p-5 hover:shadow-lg transition-shadow ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 hover:border-primary-500' 
              : 'bg-white border-gray-200 hover:border-primary-300'
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
                <p className={`text-sm mt-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {stat.description}
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

export default CustomerStats;