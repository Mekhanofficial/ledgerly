import React from 'react';
import { Calendar, FileText, DollarSign } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
const HowItWorks = () => {
  const { isDarkMode } = useTheme();
  
  const features = [
    {
      icon: Calendar,
      title: 'Schedule Setup',
      description: 'Set frequency, start date, and end date for automatic billing',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: FileText,
      title: 'Auto-Generation',
      description: 'Invoices are automatically created and sent on schedule',
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      icon: DollarSign,
      title: 'Payment Tracking',
      description: 'Track payments and send reminders automatically',
      color: 'text-violet-600 bg-violet-100'
    }
  ];

  return (
    <div className={`px-6 py-8 border-t ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        How Recurring Invoices Work
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${feature.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className={`font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {feature.title}
              </h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HowItWorks;