// src/components/invoices/templates/TemplateGrid.jsx
import React, { useState } from 'react';
import { Eye, Copy, Star, ChevronDown, Filter, Lock, Crown, Sparkles, Zap } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useToast } from '../../../context/ToastContext';

const TemplateGrid = ({ templates, categories, activeTab, onTabChange, onFavoriteToggle, onUseTemplate, onPurchaseTemplate }) => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [selectedPremiumTemplate, setSelectedPremiumTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const hasPremiumAccess = templates.some((template) => template.isPremium && template.hasAccess);
  const hasLockedPremium = templates.some((template) => template.isPremium && !template.hasAccess);
  
  const filteredTemplates = activeTab === 'all' 
    ? templates 
    : activeTab === 'favorites'
      ? templates.filter(t => t.isFavorite)
      : activeTab === 'premium'
      ? templates.filter(t => t.isPremium)
      : templates.filter(t => t.category === activeTab);

  const getCategoryBadge = (category, isPremium) => {
    if (isPremium) {
      return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
    }
    
    const styles = {
      basic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      premium: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      industry: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      custom: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return styles[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getTemplateFeatures = (template) => {
    if (template.isPremium) {
      return [
        { icon: Crown, text: 'Premium Design', color: 'text-purple-500' },
        { icon: Sparkles, text: 'Advanced Features', color: 'text-amber-500' },
        { icon: Zap, text: 'Priority Support', color: 'text-blue-500' }
      ];
    }
    return [
      { icon: Copy, text: 'Basic Features', color: 'text-gray-500' },
      { icon: Eye, text: 'Standard Preview', color: 'text-gray-500' }
    ];
  };

  const resolveAccess = (template) => {
    if (!template.isPremium) return true;
    return template.hasAccess === true;
  };

  const handleTemplateClick = (template) => {
    if (template.isPremium && !resolveAccess(template)) {
      setSelectedPremiumTemplate(template);
      return;
    }
    onUseTemplate(template);
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  const toRgb = (value, fallback = 'rgb(41, 128, 185)') => {
    if (Array.isArray(value)) {
      return `rgb(${value.join(',')})`;
    }
    return value || fallback;
  };

  const previewPalette = previewTemplate
    ? {
        primary: toRgb(previewTemplate.colors?.primary, 'rgb(41, 128, 185)'),
        secondary: toRgb(previewTemplate.colors?.secondary, toRgb(previewTemplate.colors?.primary)),
        accent: toRgb(previewTemplate.colors?.accent, 'rgb(236, 240, 241)'),
        text: toRgb(previewTemplate.colors?.text, 'rgb(44, 62, 80)')
      }
    : null;

  const handlePurchase = async () => {
    try {
      await onPurchaseTemplate(selectedPremiumTemplate.id);
      addToast(`Successfully purchased ${selectedPremiumTemplate.name}!`, 'success');
      setSelectedPremiumTemplate(null);
    } catch (error) {
      addToast('Purchase failed. Please try again.', 'error');
    }
  };

  const handlePreviewPrimaryAction = () => {
    if (!previewTemplate) return;
    const hasAccess = resolveAccess(previewTemplate);
    if (previewTemplate.isPremium && !hasAccess) {
      setSelectedPremiumTemplate(previewTemplate);
      setPreviewTemplate(null);
      return;
    }
    onUseTemplate(previewTemplate);
    setPreviewTemplate(null);
  };

  // Get active category label for mobile dropdown
  const getActiveCategoryLabel = () => {
    const activeCategory = categories.find(cat => cat.id === activeTab);
    return activeCategory ? activeCategory.label : 'All Templates';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Premium Banner */}
      {hasLockedPremium && (
        <div className={`rounded-lg p-4 md:p-5 border ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-700/50' 
            : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className={`font-semibold text-lg ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Unlock Premium Templates
                </h3>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Get access to premium templates with advanced features, custom designs, and priority support.
              </p>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Category Filter - Desktop */}
      <div className="hidden md:flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onTabChange(category.id)}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === category.id
                ? category.id === 'premium'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-primary-600 text-white'
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
                    ? category.id === 'premium'
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-300'
                      : 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  {category.id === 'premium' && <Crown className="w-4 h-4 mr-2 text-purple-500" />}
                  <span className="font-medium">{category.label}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === category.id
                    ? category.id === 'premium'
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                      : 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300'
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
        {hasPremiumAccess && (
          <span className="ml-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full">
            PREMIUM
          </span>
        )}
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
          {filteredTemplates.map((template) => {
            const hasAccess = resolveAccess(template);
            const isLocked = template.isPremium && !hasAccess;
            const features = getTemplateFeatures(template);
            
            return (
              <div 
                key={template.id} 
                className={`border rounded-lg md:rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl relative ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } ${isLocked ? 'opacity-90' : ''}`}
              >
                {/* Premium Badge */}
                {template.isPremium && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      <Crown className="w-3 h-3" />
                      <span>PREMIUM</span>
                    </div>
                  </div>
                )}

                {/* Lock Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6">
                    <Lock className="w-12 h-12 text-white mb-3" />
                    <h3 className="text-white font-semibold text-lg mb-2">Premium Template</h3>
                    <p className="text-gray-200 text-center text-sm mb-4">
                      Unlock this premium template for ${template.price}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handlePreview(template)}
                        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                      >
                        View Fullscreen
                      </button>
                      <button 
                        onClick={() => setSelectedPremiumTemplate(template)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90"
                      >
                        Purchase Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Template Preview */}
                <div
                  className={`h-40 ${template.previewColor} relative overflow-hidden cursor-pointer`}
                  onClick={() => handlePreview(template)}
                >
                  {/* Animated gradient for premium templates */}
                  {template.isPremium && hasAccess && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  )}
                  
                  {template.isDefault && (
                    <div className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full ${
                      isDarkMode 
                        ? 'bg-gray-700 text-primary-400' 
                        : 'bg-white text-primary-600'
                    }`}>
                      Default
                    </div>
                  )}
                  <div className="absolute top-3 right-3 z-10">
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
                  <div className={`absolute bottom-3 left-3 right-3 backdrop-blur-sm rounded-lg p-3 ${
                    isDarkMode 
                      ? 'bg-gray-800/80' 
                      : 'bg-white/80'
                  }`}>
                    <div className="text-center">
                      <div className={`text-sm font-semibold truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {template.name}
                      </div>
                      <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {template.isPremium && hasAccess ? (
                          <>
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Premium Features</span>
                          </>
                        ) : (
                          `${template.lineItems?.length || 0} items`
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-4 md:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-bold text-sm md:text-base truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {template.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(template.category, template.isPremium)}`}>
                          {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                        </span>
                        {template.isPremium && !hasAccess && (
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                            ${template.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className={`text-xs md:text-sm mb-4 line-clamp-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {template.description}
                  </p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {features.slice(0, 2).map((feature, idx) => {
                      const Icon = feature.icon;
                      return (
                        <div key={idx} className={`flex items-center gap-1 text-xs ${feature.color}`}>
                          <Icon className="w-3 h-3" />
                          <span>{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>
                  
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
                        onClick={() => handlePreview(template)}
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
                      onClick={() => handleTemplateClick(template)}
                      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm whitespace-nowrap ${
                        template.isPremium && !hasAccess
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {template.isPremium && !hasAccess ? 'Purchase' : 'Use Template'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Premium Template Modal */}
      {selectedPremiumTemplate && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 z-50"
            onClick={() => setSelectedPremiumTemplate(null)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            }`}>
              {/* Modal Header */}
              <div className={`p-6 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${selectedPremiumTemplate.previewColor} flex items-center justify-center`}>
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {selectedPremiumTemplate.name}
                      </h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Premium Template
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${selectedPremiumTemplate.price}
                    </div>
                    <div className="text-sm text-gray-500">One-time purchase</div>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Left Column - Features */}
                  <div>
                    <h4 className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      What's Included
                    </h4>
                    <div className="space-y-3">
                      {selectedPremiumTemplate.features?.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Right Column - Preview */}
                  <div>
                    <h4 className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Template Preview
                    </h4>
                    <div className={`rounded-xl p-4 ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                    }`}>
                      <div className={`h-32 rounded-lg ${selectedPremiumTemplate.previewColor} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className={`text-lg font-bold mb-2 ${
                              isDarkMode ? 'text-white' : 'text-white'
                            }`}>
                              {selectedPremiumTemplate.name}
                            </div>
                            <div className="text-sm opacity-80">
                              Premium Design
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className={`rounded-xl p-5 mb-6 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700/30' 
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
                }`}>
                  <h4 className={`text-lg font-semibold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Benefits
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                        isDarkMode ? 'bg-purple-800' : 'bg-purple-100'
                      }`}>
                        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div className="text-sm font-medium">Exclusive Design</div>
                    </div>
                    <div className="text-center">
                      <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                        isDarkMode ? 'bg-purple-800' : 'bg-purple-100'
                      }`}>
                        <Zap className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div className="text-sm font-medium">Priority Support</div>
                    </div>
                    <div className="text-center">
                      <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                        isDarkMode ? 'bg-purple-800' : 'bg-purple-100'
                      }`}>
                        <Copy className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div className="text-sm font-medium">Lifetime Updates</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`p-6 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setSelectedPremiumTemplate(null)}
                    className={`px-6 py-3 rounded-lg text-sm font-medium ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurchase}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Purchase Template - ${selectedPremiumTemplate.price}
                  </button>
                </div>
                <p className={`text-xs text-center mt-4 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-600'
                }`}>
                  One-time payment. Lifetime access. 30-day money-back guarantee.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Fullscreen Preview */}
      {previewTemplate && (
        <>
          <div className="fixed inset-0 bg-black/80 z-50" onClick={closePreview} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-2xl ${
              isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
            }`}>
              <div className={`p-6 border-b ${
                isDarkMode ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${previewTemplate.previewColor}`} />
                    <div>
                      <div className="text-xs uppercase tracking-wide text-gray-400">Template Preview</div>
                      <h3 className="text-xl font-bold">{previewTemplate.name}</h3>
                      <div className="text-sm text-gray-500">
                        {previewTemplate.category?.toUpperCase()} {previewTemplate.isPremium ? '• Premium' : '• Free'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {previewTemplate.isPremium && !resolveAccess(previewTemplate) && (
                      <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
                        Locked
                      </div>
                    )}
                    <button
                      onClick={closePreview}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className={`rounded-2xl border overflow-hidden ${
                  isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
                }`}>
                  <div className={`h-48 ${previewTemplate.previewColor} relative`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                    <div className="absolute inset-0 flex items-end">
                      <div className="p-6 text-white">
                        <div className="text-xs uppercase tracking-widest opacity-80">Invoice Template</div>
                        <div className="text-2xl font-bold">{previewTemplate.name}</div>
                        <div className="text-sm opacity-80">Designed for modern businesses</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-6" style={{ color: previewPalette?.text }}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-gray-400">From</div>
                        <div className="text-lg font-semibold">Ledgerly Inc.</div>
                        <div className="text-sm text-gray-500">billing@ledgerly.com</div>
                      </div>
                      <div className="text-left md:text-right">
                        <div className="text-xs uppercase tracking-wide text-gray-400">Invoice</div>
                        <div className="text-lg font-semibold">#INV-2026-004</div>
                        <div className="text-sm text-gray-500">Due: Feb 15, 2026</div>
                      </div>
                    </div>

                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: previewPalette?.primary }}>
                      <div className="grid grid-cols-4 text-xs uppercase tracking-wide font-semibold" style={{ background: previewPalette?.primary, color: 'white' }}>
                        <div className="px-4 py-3">Item</div>
                        <div className="px-4 py-3">Qty</div>
                        <div className="px-4 py-3">Rate</div>
                        <div className="px-4 py-3 text-right">Total</div>
                      </div>
                      <div className="divide-y" style={{ background: previewPalette?.accent }}>
                        {['Design Retainer', 'Consulting Support', 'Brand Assets'].map((item, idx) => (
                          <div key={item} className="grid grid-cols-4 px-4 py-3 text-sm">
                            <div>{item}</div>
                            <div>1</div>
                            <div>$850</div>
                            <div className="text-right">${idx === 1 ? '650' : '850'}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div className="text-sm text-gray-500">
                        Notes: Thank you for your business. Payment due within 30 days.
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Subtotal: $2,350</div>
                        <div className="text-sm text-gray-500">Tax: $188</div>
                        <div className="text-xl font-bold" style={{ color: previewPalette?.primary }}>
                          Total: $2,538
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Color Palette</div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full" style={{ background: previewPalette?.primary }} />
                    <div className="w-10 h-10 rounded-full" style={{ background: previewPalette?.secondary }} />
                    <div className="w-10 h-10 rounded-full border" style={{ background: previewPalette?.accent }} />
                    <div className="text-xs text-gray-500">Primary • Secondary • Accent</div>
                  </div>
                </div>
              </div>

              <div className={`p-6 border-t flex flex-col sm:flex-row gap-3 justify-end ${
                isDarkMode ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <button
                  onClick={closePreview}
                  className={`px-5 py-2 rounded-lg text-sm ${
                    isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={handlePreviewPrimaryAction}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold ${
                    previewTemplate.isPremium && !resolveAccess(previewTemplate)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {previewTemplate.isPremium && !resolveAccess(previewTemplate) ? 'Purchase Template' : 'Use Template'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TemplateGrid;
