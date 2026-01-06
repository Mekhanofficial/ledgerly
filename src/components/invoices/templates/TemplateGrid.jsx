// src/components/invoices/templates/TemplateGrid.jsx
import React from 'react';
import { Eye, Copy, Download, Star, MoreVertical } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const TemplateGrid = ({ templates, categories, activeTab, onTabChange, onFavoriteToggle, onUseTemplate }) => {
  const { isDarkMode } = useTheme();
  
  const filteredTemplates = activeTab === 'all' 
    ? templates 
    : activeTab === 'favorites'
      ? templates.filter(t => t.isFavorite)
      : templates.filter(t => t.category === activeTab);

  const getCategoryBadge = (category) => {
    const styles = {
      basic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      premium: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      industry: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      custom: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return styles[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onTabChange(category.id)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === category.id
                ? 'bg-primary-600 text-white'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === category.id
                ? 'bg-white/30 text-white'
                : isDarkMode
                  ? 'bg-gray-600 text-gray-300'
                  : 'bg-gray-300 text-gray-700'
            }`}>
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Default Template Selection - REMOVED or UPDATED */}
      {/* You might want to move this to a separate section or handle default templates differently */}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className={`border rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-lg ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            {/* Template Preview */}
            <div className={`h-32 ${template.previewColor} relative`}>
              {template.isDefault && (
                <div className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full ${
                  isDarkMode 
                    ? 'bg-gray-700 text-primary-400' 
                    : 'bg-white text-primary-600'
                }`}>
                  Default
                </div>
              )}
              <div className="absolute top-3 right-3">
                <button 
                  onClick={() => onFavoriteToggle(template.id)}
                  className={`p-1 backdrop-blur-sm rounded ${
                    isDarkMode 
                      ? 'bg-gray-700/20 hover:bg-gray-700/30' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <Star className={`w-4 h-4 ${template.isFavorite ? 'text-amber-400 fill-amber-400' : isDarkMode ? 'text-gray-300' : 'text-white'}`} />
                </button>
              </div>
              
              {/* Template Info Badge */}
              <div className={`absolute bottom-3 left-3 right-3 backdrop-blur-sm rounded p-2 ${
                isDarkMode 
                  ? 'bg-gray-700/20' 
                  : 'bg-white/20'
              }`}>
                <div className="text-center">
                  <div className={`text-sm font-medium truncate ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {template.name}
                  </div>
                  <div className={`text-xs mt-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {template.lineItems?.length || 0} items
                  </div>
                </div>
              </div>
            </div>

            {/* Template Info */}
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {template.name}
                  </h3>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(template.category)}`}>
                    {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                  </span>
                </div>
              </div>
              
              <p className={`text-sm mt-3 mb-4 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {template.description}
              </p>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button 
                    className={`p-1.5 rounded ${
                      isDarkMode 
                        ? 'text-gray-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`} 
                    title="Preview"
                    onClick={() => {
                      // You might want to add preview functionality
                      console.log('Preview template:', template.id);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    className={`p-1.5 rounded ${
                      isDarkMode 
                        ? 'text-gray-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`} 
                    title="Duplicate"
                    onClick={() => {
                      // Handle duplicate template
                      console.log('Duplicate template:', template.id);
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onUseTemplate(template)}
                    className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateGrid;