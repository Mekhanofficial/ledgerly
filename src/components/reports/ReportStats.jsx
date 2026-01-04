import React from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users, BarChart, PieChart } from 'lucide-react';

const ReportStats = () => {
  const stats = [
    {
      label: 'Total Revenue',
      value: '$124,850',
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-emerald-500'
    },
    {
      label: 'Total Sales',
      value: '1,248',
      change: '+8.2%',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      label: 'New Customers',
      value: '89',
      change: '+15.3%',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      label: 'Avg. Order Value',
      value: '$245',
      change: '+5.7%',
      icon: TrendingUp,
      color: 'bg-amber-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">vs last month</span>
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

export default ReportStats;