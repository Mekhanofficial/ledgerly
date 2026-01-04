import React from 'react';
import { Eye, Plus, Palette, Layout, FileText } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
const TemplateCustom = () => {
  const { isDarkMode } = useTheme();
  
  const features = [
    {
      icon: Palette,
      title: 'Brand Colors',
      description: 'Match your brand with custom colors and logos',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Layout,
      title: 'Layout Control',
      description: 'Drag and drop elements to create perfect layout',
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      icon: FileText,
      title: 'Save & Reuse',
      description: 'Save templates for future use across all invoices',
      color: 'text-violet-600 bg-violet-100'
    }
  ];

  return (
    <div className={`border rounded-xl p-6 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Create Custom Template
          </h3>
          <p className={`mt-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Design your own invoice template with our drag-and-drop editor
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button className={`flex items-center px-4 py-2 rounded-lg ${
            isDarkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-primary-300 text-primary-700 hover:bg-primary-50'
          }`}>
            <Eye className="w-4 h-4 mr-2" />
            View Examples
          </button>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Start Designing
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className={`p-4 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-700' 
                : 'bg-white'
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

export default TemplateCustom;