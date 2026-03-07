import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Package } from 'lucide-react';
import { useAccount } from '../../context/AccountContext';
import { formatCurrency } from '../../utils/currency';
import CountUpNumber from '../ui/CountUpNumber';

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
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            className="card card-hover"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            whileHover={{ y: -4 }}
          >
            <div className="stat-content-safe">
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="pt-1 text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <div className={`${stat.color} h-12 w-12 flex-shrink-0 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>

              <p className="text-[clamp(1.45rem,2.1vw,1.9rem)] font-bold text-gray-900 dark:text-white mb-2 stat-value-safe">
                <CountUpNumber value={stat.value} />
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 dark:text-red-400" />
                )}
                <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{stat.period}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatsCards;
