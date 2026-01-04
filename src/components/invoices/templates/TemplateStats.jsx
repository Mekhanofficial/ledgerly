import React from 'react';
import { FileText, Layout, Star, Palette } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const TemplateStats = () => {
  const { isDarkMode } = useTheme();
  
  const stats = [
    { 
      label: 'Total Templates', 
      value: '8', 
      icon: FileText, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'In Use', 
      value: '3', 
      icon: Layout, 
      color: 'bg-emerald-500' 
    },
    { 
      label: 'Default Template', 
      value: 'Standard', 
      icon: Star, 
      color: 'bg-amber-500' 
    },
    { 
      label: 'Custom Templates', 
      value: '2', 
      icon: Palette, 
      color: 'bg-violet-500' 
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={`border rounded-xl p-5 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
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

export default TemplateStats;