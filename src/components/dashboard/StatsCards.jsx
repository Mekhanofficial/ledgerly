import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Package } from 'lucide-react';
import { useAccount } from '../../context/AccountContext';
import { formatCurrency } from '../../utils/currency';

const StatsCards = ({ statsData }) => {
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  const periodLabel = statsData?.periodLabel || 'This month';

  const revenueTrend = statsData?.revenueChange?.startsWith('+') ? 'up' : 'down';
  const invoiceTrend = statsData?.invoiceChange?.startsWith('+') ? 'up' : 'down';
  const activeCustomersTrend = statsData?.activeCustomersChange?.startsWith('+') ? 'up' : 'down';
  const overdueTrend = statsData?.overdueChange?.startsWith('-') ? 'up' : 'down';

  const stats = [
    {
      title: 'Total Revenue',
      value: statsData?.totalRevenue || formatCurrency(0, baseCurrency),
      change: statsData?.revenueChange || '0%',
      trend: revenueTrend,
      icon: DollarSign,
      color: 'bg-gradient-to-br from-emerald-500 to-green-500',
      period: periodLabel
    },
    {
      title: 'Total Invoices',
      value: statsData?.totalInvoices || '0',
      change: statsData?.invoiceChange || '0%',
      trend: invoiceTrend,
      icon: FileText,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      period: periodLabel
    },
    {
      title: 'Active Customers',
      value: statsData?.activeCustomers || '0',
      change: statsData?.activeCustomersChange || '0%',
      trend: activeCustomersTrend,
      icon: Users,
      color: 'bg-gradient-to-br from-violet-500 to-purple-500',
      period: periodLabel
    },
    {
      title: 'Overdue Invoices',
      value: statsData?.overdueInvoices || '0',
      change: statsData?.overdueChange || '0%',
      trend: overdueTrend,
      icon: Package,
      color: 'bg-gradient-to-br from-amber-500 to-orange-500',
      period: periodLabel
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="card card-hover">
            <div className="flex items-start justify-between gap-3">
              <div className="stat-content-safe">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2 stat-value-safe">{stat.value}</p>
                <div className="flex items-center">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 dark:text-red-400 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{stat.period}</span>
                </div>
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

export default StatsCards;
