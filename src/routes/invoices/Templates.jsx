// src/pages/InvoiceTemplates.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Palette, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import TemplateStats from '../../components/invoices/templates/TemplateStats';
import TemplateGrid from '../../components/invoices/templates/TemplateGrid';
import TemplateCustom from '../../components/invoices/templates/TemplateCustom';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useInvoice } from '../../context/InvoiceContext';
import { initializeTemplatePayment } from '../../services/billingService';

const InvoiceTemplates = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const { templates: contextTemplates, refreshTemplates } = useInvoice();
  const [favoriteMap, setFavoriteMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('template_favorites') || '{}');
    } catch (error) {
      return {};
    }
  });

  const applyFavorites = (templatesList, favorites) => {
    return (templatesList || []).map((template) => ({
      ...template,
      isFavorite: favorites[template.id] ?? template.isFavorite
    }));
  };
  const hasPaidAccess = templates.some((template) => template.hasAccess && (template.category === 'PREMIUM' || template.category === 'ELITE'));
  const hasLockedTemplates = templates.some((template) => template.category !== 'CUSTOM' && template.hasAccess === false);
  
  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTemplates(applyFavorites(contextTemplates, favoriteMap));
  }, [contextTemplates, favoriteMap]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await refreshTemplates();
      setTemplates(applyFavorites(data, favoriteMap));
    } catch (error) {
      console.error('Error loading templates:', error);
      addToast('Unable to load templates', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All', count: templates.length },
    { id: 'STANDARD', label: 'Standard', count: templates.filter(t => t.category === 'STANDARD').length },
    { id: 'PREMIUM', label: 'Premium', count: templates.filter(t => t.category === 'PREMIUM').length },
    { id: 'ELITE', label: 'Elite', count: templates.filter(t => t.category === 'ELITE').length },
    { id: 'CUSTOM', label: 'Custom', count: templates.filter(t => t.category === 'CUSTOM').length },
    { id: 'favorites', label: 'Favorites', count: templates.filter(t => t.isFavorite).length }
  ];

  const handleFavoriteToggle = (templateId) => {
    const updated = { ...favoriteMap, [templateId]: !favoriteMap[templateId] };
    setFavoriteMap(updated);
    localStorage.setItem('template_favorites', JSON.stringify(updated));
    setTemplates(prevTemplates => prevTemplates.map(template =>
      template.id === templateId
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ));
  };

  const handleUseTemplate = (template) => {
    // Navigate to create invoice with template ID
    navigate(`/invoices/create?template=${template.id}`);
  };

  const redirectToCheckout = (paymentData) => {
    const url = paymentData?.authorizationUrl || paymentData?.authorization_url;
    if (url) {
      window.location.href = url;
      return true;
    }
    return false;
  };

  const handlePurchaseTemplate = async (templateId) => {
    try {
      const response = await initializeTemplatePayment({ templateId });
      const data = response?.data || response;
      if (!redirectToCheckout(data)) {
        addToast('Unable to start payment. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error starting template payment:', error);
      addToast(error?.response?.data?.error || 'Unable to purchase template', 'error');
    }
  };

  const handlePurchaseBundle = async () => {
    try {
      const response = await initializeTemplatePayment({ type: 'lifetime' });
      const data = response?.data || response;
      if (!redirectToCheckout(data)) {
        addToast('Unable to start payment. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error starting template bundle payment:', error);
      addToast(error?.response?.data?.error || 'Unable to purchase template bundle', 'error');
    }
  };

  const handleTemplateCreated = () => {
    loadTemplates(); // Refresh templates list
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                Invoice Templates
              </h1>
              {hasPaidAccess && (
                <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  <span>PAID ACCESS</span>
                </span>
              )}
            </div>
            <p className={`mt-1 text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {hasPaidAccess 
                ? 'Access premium and elite templates included with your plan'
                : 'Choose from standard templates or upgrade to unlock premium and elite designs'
              }
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {hasLockedTemplates && (
              <button 
                onClick={() => navigate('/pricing')}
                className="flex items-center justify-center px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 text-sm md:text-base whitespace-nowrap"
              >
                <Crown className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Upgrade Now</span>
                <span className="sm:hidden">Upgrade</span>
              </button>
            )}
            <button 
              onClick={() => navigate('/invoices/create')}
              className="flex items-center justify-center px-3 py-2 md:px-4 md:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm md:text-base whitespace-nowrap"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Create Invoice</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className={`border rounded-lg p-8 md:p-12 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading templates...
            </p>
          </div>
        ) : (
          <>
            {/* Stats Component */}
            <TemplateStats templates={templates} />

            {/* Locked Templates Section */}
            {hasLockedTemplates && (
              <div className={`rounded-xl p-6 border ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700' 
                  : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'
              }`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Unlock Premium & Elite Templates
                    </h2>
                    <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Upgrade your plan or purchase templates individually to unlock advanced designs.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <Crown className="w-3 h-3 text-purple-600 dark:text-purple-300" />
                        </div>
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          Premium & Elite Designs
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Palette className="w-3 h-3 text-blue-600 dark:text-blue-300" />
                        </div>
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          Advanced Customization
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/pricing')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 font-semibold whitespace-nowrap"
                  >
                    View Pricing
                  </button>
                </div>
              </div>
            )}

            {/* Grid Component */}
            <TemplateGrid
              templates={templates}
              categories={categories}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onFavoriteToggle={handleFavoriteToggle}
              onUseTemplate={handleUseTemplate}
              onPurchaseTemplate={handlePurchaseTemplate}
              onPurchaseBundle={handlePurchaseBundle}
            />

            {/* Custom Template Component */}
            <TemplateCustom onTemplateCreated={handleTemplateCreated} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InvoiceTemplates;
