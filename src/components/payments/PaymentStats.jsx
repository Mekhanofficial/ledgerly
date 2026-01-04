import React from 'react';
import { DollarSign, CreditCard, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const PaymentStats = () => {
  const stats = [
    {
      label: 'Total Revenue',
      value: '$89,240',
      description: 'This month',
      icon: DollarSign,
      color: 'bg-emerald-500'
    },
    {
      label: 'Pending Payments',
      value: '$12,580',
      description: '15 transactions',
      icon: Clock,
      color: 'bg-amber-500'
    },
    {
      label: 'Processed Today',
      value: '$8,420',
      description: '24 transactions',
      icon: CheckCircle,
      color: 'bg-blue-500'
    },
    {
      label: 'Failed Payments',
      value: '$1,240',
      description: '3 transactions',
      icon: AlertTriangle,
      color: 'bg-red-500'
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
                <p className="text-sm text-gray-500 mt-2">{stat.description}</p>
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

export default PaymentStats;