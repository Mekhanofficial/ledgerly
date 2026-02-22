import React from 'react';
import { FileText, Layout, Star, Palette } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const TemplateStats = ({ templates = [] }) => {
  const { isDarkMode } = useTheme();
  
  const defaultTemplate = templates.find(t => t.isDefault);
  const customTemplates = templates.filter(t => t.category === 'CUSTOM');
  const favoriteTemplates = templates.filter(t => t.isFavorite);
  
  const stats = [
    { 
      label: 'Total Templates', 
      value: templates.length.toString(), 
      icon: FileText, 
      color: 'bg-blue-500',
      description: 'Available templates'
    },
    { 
      label: 'Favorite Templates', 
      value: favoriteTemplates.length.toString(), 
      icon: Star, 
      color: 'bg-amber-500',
      description: 'Starred templates'
    },
    { 
      label: 'Default Template', 
      value: defaultTemplate?.name || 'Standard', 
      icon: Layout, 
      color: 'bg-emerald-500',
      description: 'Most used'
    },
    { 
      label: 'Custom Templates', 
      value: customTemplates.length.toString(), 
      icon: Palette, 
      color: 'bg-violet-500',
      description: 'User created'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isLongValue = stat.value.length > 10;
        
        return (
          <div 
            key={index} 
            className={`border rounded-lg md:rounded-xl p-3 md:p-4 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className={`text-xs md:text-sm truncate ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {stat.label}
                </p>
                <p className={`text-base md:text-lg lg:text-xl font-bold mt-1 truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </p>
                <p className={`text-xs mt-1 truncate ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {stat.description}
                </p>
              </div>
              <div className={`${stat.color} w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl flex items-center justify-center ml-2 flex-shrink-0`}>
                <Icon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TemplateStats;
