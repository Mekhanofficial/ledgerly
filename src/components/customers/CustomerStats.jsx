import React, { useMemo } from 'react';
import { Users, UserCheck, DollarSign, TrendingUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useAccount } from '../../context/AccountContext';
import { mapCustomerFromApi } from '../../utils/customerAdapter';
import { formatCurrency } from '../../utils/currency';

const CustomerStats = ({ customers: customersProp }) => {
  const { isDarkMode } = useTheme();
  const { accountInfo } = useAccount();
  const storeCustomers = useSelector((state) => state.customers?.customers || []);
  const baseCurrency = accountInfo?.currency || 'USD';

  const customers = useMemo(() => {
    if (customersProp) {
      return customersProp;
    }
    return storeCustomers.map(mapCustomerFromApi);
  }, [customersProp, storeCustomers]);

  const statsData = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((customer) =>
      (customer.transactions || 0) > 0 ||
      (customer.totalSpent || 0) > 0 ||
      (customer.outstanding || 0) > 0
    ).length;
    const totalOutstanding = customers.reduce((sum, customer) => sum + (customer.outstanding || 0), 0);
    const totalSpent = customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0);
    const avgTransactionValue = activeCustomers > 0 ? totalSpent / activeCustomers : 0;

    const now = new Date();
    const newCustomersThisMonth = customers.filter((customer) => {
      if (!customer.createdAt) return false;
      const createdAt = new Date(customer.createdAt);
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    }).length;

    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const newCustomersLastMonth = customers.filter((customer) => {
      if (!customer.createdAt) return false;
      const createdAt = new Date(customer.createdAt);
      return createdAt.getMonth() === lastMonth.getMonth() && createdAt.getFullYear() === lastMonth.getFullYear();
    }).length;

    const customerChange = newCustomersLastMonth > 0
      ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth * 100).toFixed(1)
      : newCustomersThisMonth > 0 ? '100.0' : '0.0';

    return [
      {
        label: 'Total Customers',
        value: totalCustomers.toString(),
        description: `+${customerChange}% vs last month`
      },
      {
        label: 'Active Customers',
        value: activeCustomers.toString(),
        description: 'Transactions in last 90 days'
      },
      {
        label: 'Total Outstanding',
        value: formatCurrency(totalOutstanding, baseCurrency),
        description: 'Across all customers'
      },
      {
        label: 'Avg Transaction Value',
        value: formatCurrency(avgTransactionValue, baseCurrency),
        description: '+4.2% vs last month'
      }
    ];
  }, [customers, baseCurrency]);
  
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
      value: statsData[2]?.value || formatCurrency(0, baseCurrency),
      description: 'Across all customers',
      icon: DollarSign,
      color: 'bg-amber-500'
    },
    {
      label: 'Avg Transaction Value',
      value: statsData[3]?.value || formatCurrency(0, baseCurrency),
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
            <div className="flex items-start justify-between gap-3">
              <div className="stat-content-safe">
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold mt-1 stat-value-safe ${
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
