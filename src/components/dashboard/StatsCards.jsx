import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Package } from 'lucide-react';

const StatsCards = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$42,580',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-gradient-to-br from-emerald-500 to-green-500',
      period: 'This month'
    },
    {
      title: 'Total Invoices',
      value: '248',
      change: '+8.2%',
      trend: 'up',
      icon: FileText,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      period: 'This month'
    },
    {
      title: 'Active Customers',
      value: '1,248',
      change: '+5.1%',
      trend: 'up',
      icon: Users,
      color: 'bg-gradient-to-br from-violet-500 to-purple-500',
      period: 'Total'
    },
    {
      title: 'Low Stock Items',
      value: '5',
      change: '-2',
      trend: 'down',
      icon: Package,
      color: 'bg-gradient-to-br from-amber-500 to-orange-500',
      period: 'Needs attention'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="card card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
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