import React, { useState, useEffect } from 'react';
import { Plus, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import TemplateStats from '../../components/invoices/templates/TemplateStats';
import TemplateGrid from '../../components/invoices/templates/TemplateGrid';
import TemplateCustom from '../../components/invoices/templates/TemplateCustom';
import { useTheme } from '../../context/ThemeContext';
import { templateStorage } from '../../utils/templateStorage';

const InvoiceTemplates = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    setIsLoading(true);
    try {
      const allTemplates = templateStorage.getAllTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All', count: templates.length },
    { id: 'basic', label: 'Basic', count: templates.filter(t => t.category === 'basic').length },
    { id: 'premium', label: 'Premium', count: templates.filter(t => t.category === 'premium').length },
    { id: 'industry', label: 'Industry', count: templates.filter(t => t.category === 'industry').length },
    { id: 'custom', label: 'Custom', count: templates.filter(t => t.category === 'custom').length },
    { id: 'favorites', label: 'Favorites', count: templates.filter(t => t.isFavorite).length }
  ];

  const handleFavoriteToggle = (templateId) => {
    try {
      templateStorage.toggleFavorite(templateId);
      setTemplates(prevTemplates => prevTemplates.map(template => 
        template.id === templateId 
          ? { ...template, isFavorite: !template.isFavorite }
          : template
      ));
    } catch (error) {
      console.error('Error toggling favorite template:', error);
    }
  };

  const handleUseTemplate = (template) => {
    // Navigate to create invoice with template ID
    navigate(`/invoices/create?template=${template.id}`);
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
            <h1 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
              Invoice Templates
            </h1>
            <p className={`mt-1 text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Choose from professional templates or create your own custom design
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
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

            {/* Grid Component */}
            <TemplateGrid
              templates={templates}
              categories={categories}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onFavoriteToggle={handleFavoriteToggle}
              onUseTemplate={handleUseTemplate}
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
