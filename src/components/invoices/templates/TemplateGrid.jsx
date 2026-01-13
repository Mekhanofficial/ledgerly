import React, { useState } from 'react';
import { Eye, Copy, Star, MoreVertical, ChevronDown, Filter } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const TemplateGrid = ({ templates, categories, activeTab, onTabChange, onFavoriteToggle, onUseTemplate }) => {
  const { isDarkMode } = useTheme();
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  
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

  // Get active category label for mobile dropdown
  const getActiveCategoryLabel = () => {
    const activeCategory = categories.find(cat => cat.id === activeTab);
    return activeCategory ? activeCategory.label : 'All Templates';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Category Filter - Desktop */}
      <div className="hidden md:flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onTabChange(category.id)}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === category.id
                ? 'bg-primary-600 text-white'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
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

      {/* Category Filter - Mobile Dropdown */}
      <div className="md:hidden relative">
        <button
          onClick={() => setShowMobileCategories(!showMobileCategories)}
          className="flex items-center justify-between w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
        >
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            <span className="font-medium">{getActiveCategoryLabel()}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${showMobileCategories ? 'rotate-180' : ''}`} />
        </button>
        
        {showMobileCategories && (
          <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  onTabChange(category.id);
                  setShowMobileCategories(false);
                }}
                className={`flex items-center justify-between w-full px-4 py-3 text-left ${
                  activeTab === category.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="font-medium">{category.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === category.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Template Count */}
      <div className={`text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Showing {filteredTemplates.length} of {templates.length} templates
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 ? (
        <div className={`border rounded-lg p-8 md:p-12 text-center ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <Copy className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className={`text-lg font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            No templates found
          </h3>
          <p className={`text-sm md:text-base ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {activeTab === 'favorites' 
              ? 'You haven\'t favorited any templates yet' 
              : `No templates found in "${getActiveCategoryLabel()}" category`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className={`border rounded-lg md:rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-lg ${
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
                    className={`p-1.5 backdrop-blur-sm rounded-full ${
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
                    <div className={`text-xs mt-0.5 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {template.lineItems?.length || 0} items
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-4 md:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-semibold text-sm md:text-base truncate ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {template.name}
                    </h3>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(template.category)}`}>
                        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className={`text-xs md:text-sm mb-4 line-clamp-2 ${
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
                        console.log('Duplicate template:', template.id);
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => onUseTemplate(template)}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 whitespace-nowrap"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateGrid;