import React, {  } from 'react';
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
      industry: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
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

      {/* Default Template Selection */}
      <div className={`border rounded-xl p-6 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Default Template
          </h3>
          <span className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            This template is used for all new invoices
          </span>
        </div>
        <div className="flex items-center justify-between">
          <select className={`w-full max-w-xs px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'border border-gray-300'
          }`}>
            {templates.filter(t => t.isFavorite || t.isDefault).map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
          <button className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
            Set as Default
          </button>
        </div>
      </div>

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
              
              {/* Mock Invoice Preview */}
              <div className={`absolute bottom-3 left-3 right-3 backdrop-blur-sm rounded p-2 ${
                isDarkMode 
                  ? 'bg-gray-700/20' 
                  : 'bg-white/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div className={`h-2 rounded w-1/3 ${
                    isDarkMode 
                      ? 'bg-gray-600/40' 
                      : 'bg-white/40'
                  }`}></div>
                  <div className={`h-2 rounded w-1/4 ${
                    isDarkMode 
                      ? 'bg-gray-600/40' 
                      : 'bg-white/40'
                  }`}></div>
                </div>
                <div className={`mt-1 h-2 rounded w-2/3 ${
                  isDarkMode 
                    ? 'bg-gray-600/40' 
                    : 'bg-white/40'
                }`}></div>
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
                  <button className={`p-1.5 rounded ${
                    isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`} title="Preview">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className={`p-1.5 rounded ${
                    isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`} title="Duplicate">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className={`p-1.5 rounded ${
                    isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`} title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onUseTemplate(template.id)}
                    className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                  >
                    Use
                  </button>
                  <button className={`p-1.5 rounded ${
                    isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}>
                    <MoreVertical className="w-4 h-4" />
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