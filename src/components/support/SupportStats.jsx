import React from 'react';
import { HelpCircle, MessageSquare, Clock, CheckCircle } from 'lucide-react';

const SupportStats = () => {
  const stats = [
    {
      label: 'Open Tickets',
      value: '24',
      description: 'Needs attention',
      icon: HelpCircle,
      color: 'bg-amber-500'
    },
    {
      label: 'Resolved Today',
      value: '18',
      description: 'Closed tickets',
      icon: CheckCircle,
      color: 'bg-emerald-500'
    },
    {
      label: 'Avg. Response Time',
      value: '2.4 hrs',
      description: 'From ticket creation',
      icon: Clock,
      color: 'bg-blue-500'
    },
    {
      label: 'Satisfaction Rate',
      value: '94%',
      description: 'Customer feedback',
      icon: MessageSquare,
      color: 'bg-purple-500'
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

export default SupportStats;