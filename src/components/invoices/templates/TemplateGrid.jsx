import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Copy, Star, ChevronDown, Filter, Lock, Crown, Sparkles, Zap } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useToast } from '../../../context/ToastContext';
import TemplatePreviewRenderer from './TemplatePreviewRenderer';

const TemplateGrid = ({ templates, categories, activeTab, onTabChange, onFavoriteToggle, onUseTemplate, onPurchaseTemplate, onPurchaseBundle }) => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [selectedPremiumTemplate, setSelectedPremiumTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const hasPaidAccess = templates.some((template) => template.hasAccess && (template.category === 'PREMIUM' || template.category === 'ELITE'));
  const hasLockedTemplates = templates.some((template) => template.category !== 'CUSTOM' && template.hasAccess === false);
  
  const filteredTemplates = activeTab === 'all' 
    ? templates 
    : activeTab === 'favorites'
      ? templates.filter(t => t.isFavorite)
      : templates.filter(t => t.category === activeTab);

  const getCategoryBadge = (category) => {
    const normalized = String(category || '').toUpperCase();
    const styles = {
      STANDARD: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      PREMIUM: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      ELITE: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white',
      CUSTOM: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return styles[normalized] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getCategoryLabel = (category) => {
    const normalized = String(category || '').toUpperCase();
    if (normalized === 'STANDARD') return 'Standard';
    if (normalized === 'PREMIUM') return 'Premium';
    if (normalized === 'ELITE') return 'Elite';
    if (normalized === 'CUSTOM') return 'Custom';
    return normalized || 'Standard';
  };

  const formatPlanLabel = (planId) => {
    const normalized = String(planId || '').toLowerCase();
    if (normalized === 'starter') return 'Starter';
    if (normalized === 'professional') return 'Professional';
    if (normalized === 'enterprise') return 'Enterprise';
    return 'a higher plan';
  };

  const resolveAccess = (template) => template?.hasAccess !== false;

  const handleTemplateClick = (template) => {
    if (!resolveAccess(template)) {
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
      if (!selectedPremiumTemplate) return;
      await onPurchaseTemplate(selectedPremiumTemplate.id);
      addToast(`Successfully purchased ${selectedPremiumTemplate.name}!`, 'success');
      setSelectedPremiumTemplate(null);
    } catch (error) {
      addToast('Purchase failed. Please try again.', 'error');
    }
  };

  const handleBundlePurchase = async () => {
    if (!onPurchaseBundle) return;
    try {
      await onPurchaseBundle();
      addToast('All templates unlocked successfully!', 'success');
      setSelectedPremiumTemplate(null);
    } catch (error) {
      addToast('Bundle purchase failed. Please try again.', 'error');
    }
  };

  const handlePreviewPrimaryAction = () => {
    if (!previewTemplate) return;
    const hasAccess = resolveAccess(previewTemplate);
    if (!hasAccess) {
      setSelectedPremiumTemplate(previewTemplate);
      setPreviewTemplate(null);
      return;
    }
    onUseTemplate(previewTemplate);
    setPreviewTemplate(null);
  };

  const getActiveCategoryLabel = () => {
    const activeCategory = categories.find(cat => cat.id === activeTab);
    return activeCategory ? activeCategory.label : 'All Templates';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Upgrade Banner */}
      {hasLockedTemplates && (
        <div className={`rounded-lg p-4 md:p-5 border ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-700/50' 
            : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Unlock More Templates
                </h3>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Upgrade your plan or purchase templates individually to unlock premium and elite designs.
              </p>
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              View Plans
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
                ? (category.id === 'PREMIUM' || category.id === 'ELITE')
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
                    ? (category.id === 'PREMIUM' || category.id === 'ELITE')
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-300'
                      : 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  {(category.id === 'PREMIUM' || category.id === 'ELITE') && <Crown className="w-4 h-4 mr-2 text-purple-500" />}
                  <span className="font-medium">{category.label}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === category.id
                    ? (category.id === 'PREMIUM' || category.id === 'ELITE')
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
        {hasPaidAccess && (
          <span className="ml-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full">
            PAID ACCESS
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
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            No templates found
          </h3>
          <p className={`text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {activeTab === 'favorites' 
              ? 'You haven\'t favorited any templates yet' 
              : `No templates found in "${getActiveCategoryLabel()}" category`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => {
            const hasAccess = resolveAccess(template);
            const isLocked = !hasAccess && template.category !== 'CUSTOM';
            const categoryLabel = getCategoryLabel(template.category);
            const isPaidTier = template.category === 'PREMIUM' || template.category === 'ELITE';
            const tierBadgeClass = template.category === 'ELITE'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
              : 'bg-gradient-to-r from-purple-600 to-pink-600';
            const isHovered = hoveredId === template.id;

            return (
              <div
                key={template.id}
                className="group relative"
                onMouseEnter={() => setHoveredId(template.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Glass card */}
                <div className={`
                  relative rounded-2xl overflow-hidden backdrop-blur-sm
                  ${isDarkMode 
                    ? 'bg-gray-800/80 border border-gray-700/50' 
                    : 'bg-white/80 border border-white/30 shadow-xl'
                  }
                  transition-all duration-500 hover:shadow-2xl hover:-translate-y-1
                  ${isLocked ? 'opacity-90' : ''}
                `}>
                  {/* Animated premium overlay */}
                  {isPaidTier && hasAccess && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  )}

                  {/* Premium ribbon */}
                  {isPaidTier && (
                    <div className="absolute top-4 left-4 z-20">
                      <div className={`flex items-center gap-1 ${tierBadgeClass} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg`}>
                        <Crown className="w-3 h-3" />
                        <span>{categoryLabel.toUpperCase()}</span>
                        <Sparkles className="w-3 h-3 ml-1 animate-pulse" />
                      </div>
                    </div>
                  )}

                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6">
                      <Lock className="w-12 h-12 text-white mb-3" />
                      <h3 className="text-white font-semibold text-lg mb-2">{categoryLabel} Template</h3>
                      <p className="text-gray-200 text-center text-sm mb-4">
                        Upgrade to {formatPlanLabel(template.requiredPlan)} or purchase for ${template.price}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handlePreview(template)}
                          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                        >
                          View Fullscreen
                        </button>
                        <button
                          onClick={() => navigate('/pricing')}
                          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                        >
                          Upgrade to {formatPlanLabel(template.requiredPlan)}
                        </button>
                        {template.canPurchase !== false && (
                          <button 
                            onClick={() => setSelectedPremiumTemplate(template)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90"
                          >
                            Purchase for ${template.price}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Preview area */}
                  <div
                    className="h-48 cursor-pointer relative overflow-hidden"
                    onClick={() => handlePreview(template)}
                  >
                    <div className={isLocked ? 'blur-sm scale-[1.02]' : ''}>
                      <TemplatePreviewRenderer
                        template={template}
                        variant="card"
                        className="h-full w-full rounded-none border-0"
                      />
                    </div>
                    
                    {/* Default badge */}
                    {template.isDefault && (
                      <div className={`
                        absolute top-4 right-4 text-xs font-medium px-2.5 py-1 rounded-full z-10
                        ${isDarkMode 
                          ? 'bg-gray-900/80 text-primary-400 border border-primary-400/30' 
                          : 'bg-white/90 text-primary-700 shadow-sm border border-primary-200'
                        }`}
                      >
                        Default
                      </div>
                    )}
                  </div>

                  {/* Floating action button */}
                  {!isLocked && (
                    <div className={`
                      absolute left-1/2 -translate-x-1/2 bottom-24 z-30
                      transition-all duration-300
                      ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                    `}>
                      <button
                        onClick={() => handleTemplateClick(template)}
                        className="px-5 py-2.5 bg-white text-primary-700 rounded-full shadow-xl font-semibold text-sm flex items-center gap-2 border border-primary-200 hover:bg-primary-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Use Template
                      </button>
                    </div>
                  )}

                  {/* Info footer */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-bold text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {template.name}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(template.category)}`}>
                            {categoryLabel}
                          </span>
                          {isLocked && (
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                              ${template.price}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onFavoriteToggle(template.id); }}
                        className={`p-1.5 rounded-full transition-colors ${
                          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${template.isFavorite ? 'text-amber-400 fill-amber-400' : isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                      </button>
                    </div>

                    <p className={`text-xs line-clamp-2 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {template.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button 
                          className={`p-1.5 rounded ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                          onClick={() => handlePreview(template)}
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className={`p-1.5 rounded ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                          onClick={() => {
                            console.log('Duplicate template:', template.id);
                            addToast(`Duplicating ${template.name}...`, 'info');
                          }}
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleTemplateClick(template)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isLocked
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 shadow-lg'
                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {isLocked ? 'Unlock' : 'Use'}
                      </button>
                    </div>
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
          <div 
            className="fixed inset-0 bg-black/70 z-50"
            onClick={() => setSelectedPremiumTemplate(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            }`}>
              <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${selectedPremiumTemplate.previewColor} flex items-center justify-center`}>
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedPremiumTemplate.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {getCategoryLabel(selectedPremiumTemplate.category)} Template
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${selectedPremiumTemplate.price}
                    </div>
                    <div className="text-sm text-gray-500">One-time purchase</div>
                    {selectedPremiumTemplate.requiredPlan && (
                      <div className="text-xs text-gray-400">
                        Included in {formatPlanLabel(selectedPremiumTemplate.requiredPlan)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
                  
                  <div>
                    <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Template Preview
                    </h4>
                    <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="h-32">
                        <TemplatePreviewRenderer
                          template={selectedPremiumTemplate}
                          variant="card"
                          className="h-full w-full border-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`rounded-xl p-5 mb-6 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700/30' 
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
                }`}>
                  <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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

              <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
                    onClick={() => navigate('/pricing')}
                    className={`px-6 py-3 rounded-lg text-sm font-medium ${
                      isDarkMode
                        ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Upgrade to {formatPlanLabel(selectedPremiumTemplate.requiredPlan)}
                  </button>
                  {onPurchaseBundle && (
                    <button
                      onClick={handleBundlePurchase}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg text-sm font-medium hover:opacity-90"
                    >
                      Unlock All Templates - $79
                    </button>
                  )}
                  {selectedPremiumTemplate.canPurchase !== false && (
                    <button
                      onClick={handlePurchase}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Purchase Template - ${selectedPremiumTemplate.price}
                    </button>
                  )}
                </div>
                <p className={`text-xs text-center mt-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
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
              <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${previewTemplate.previewColor}`} />
                    <div>
                      <div className="text-xs uppercase tracking-wide text-gray-400">Template Preview</div>
                      <h3 className="text-xl font-bold">{previewTemplate.name}</h3>
                      <div className="text-sm text-gray-500">
                        {getCategoryLabel(previewTemplate.category)} • {resolveAccess(previewTemplate) ? 'Unlocked' : 'Locked'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!resolveAccess(previewTemplate) && (
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
                  <TemplatePreviewRenderer
                    template={previewTemplate}
                    variant="fullscreen"
                    className="w-full rounded-none border-0"
                  />
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
                    !resolveAccess(previewTemplate)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {!resolveAccess(previewTemplate) ? 'Unlock Template' : 'Use Template'}
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
