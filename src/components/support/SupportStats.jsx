import React from 'react';
import { HelpCircle, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const SupportStats = () => {
  const { isDarkMode } = useTheme();
  
  const stats = [
    {
      label: 'Open Tickets',
      value: '24',
      description: 'Needs attention',
      icon: HelpCircle,
      color: 'bg-amber-500',
      darkColor: 'bg-amber-600'
    },
    {
      label: 'Resolved Today',
      value: '18',
      description: 'Closed tickets',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      darkColor: 'bg-emerald-600'
    },
    {
      label: 'Avg. Response Time',
      value: '2.4 hrs',
      description: 'From ticket creation',
      icon: Clock,
      color: 'bg-blue-500',
      darkColor: 'bg-blue-600'
    },
    {
      label: 'Satisfaction Rate',
      value: '94%',
      description: 'Customer feedback',
      icon: MessageSquare,
      color: 'bg-purple-500',
      darkColor: 'bg-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={`
            border rounded-xl p-5 hover:shadow-sm transition-shadow
            ${isDarkMode 
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
              : 'bg-white border-gray-200 hover:bg-gray-50'}
          `}>
            <div className="flex items-start justify-between gap-3">
              <div className="stat-content-safe">
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold mt-1 stat-value-safe ${
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
              <div className={`${isDarkMode ? stat.darkColor : stat.color} 
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

export default SupportStats;
