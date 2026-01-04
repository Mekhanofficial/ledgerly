import React, { useState } from 'react';
import { Plus, Palette } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import TemplateStats from '../../components/invoices/templates/TemplateStats';
import TemplateGrid from '../../components/invoices/templates/TemplateGrid';
import TemplateCustom from '../../components/invoices/templates/TemplateCustom';
import { useTheme } from '../../context/ThemeContext';

const InvoiceTemplates = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  const [templates, setTemplates] = useState([
    {
      id: 'standard',
      name: 'Standard',
      description: 'Clean, professional design for all businesses',
      category: 'basic',
      isDefault: true,
      isFavorite: true,
      previewColor: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Sleek design with contemporary typography',
      category: 'premium',
      isDefault: false,
      isFavorite: true,
      previewColor: 'bg-gradient-to-br from-emerald-500 to-green-500'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and elegant, focuses on content',
      category: 'basic',
      isDefault: false,
      isFavorite: false,
      previewColor: 'bg-gradient-to-br from-gray-700 to-gray-900'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Formal design suitable for corporate use',
      category: 'premium',
      isDefault: false,
      isFavorite: false,
      previewColor: 'bg-gradient-to-br from-violet-500 to-purple-500'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Colorful design for creative businesses',
      category: 'premium',
      isDefault: false,
      isFavorite: false,
      previewColor: 'bg-gradient-to-br from-orange-500 to-amber-500'
    },
    {
      id: 'retail',
      name: 'Retail',
      description: 'Optimized for retail and product sales',
      category: 'industry',
      isDefault: false,
      isFavorite: false,
      previewColor: 'bg-gradient-to-br from-pink-500 to-rose-500'
    },
    {
      id: 'consulting',
      name: 'Consulting',
      description: 'Designed for service-based businesses',
      category: 'industry',
      isDefault: false,
      isFavorite: true,
      previewColor: 'bg-gradient-to-br from-indigo-500 to-blue-500'
    },
    {
      id: 'freelancer',
      name: 'Freelancer',
      description: 'Perfect for freelancers and solo entrepreneurs',
      category: 'industry',
      isDefault: false,
      isFavorite: false,
      previewColor: 'bg-gradient-to-br from-teal-500 to-cyan-500'
    }
  ]);

  const categories = [
    { id: 'all', label: 'All Templates', count: templates.length },
    { id: 'basic', label: 'Basic', count: templates.filter(t => t.category === 'basic').length },
    { id: 'premium', label: 'Premium', count: templates.filter(t => t.category === 'premium').length },
    { id: 'industry', label: 'Industry', count: templates.filter(t => t.category === 'industry').length },
    { id: 'favorites', label: 'Favorites', count: templates.filter(t => t.isFavorite).length }
  ];

  const handleFavoriteToggle = (templateId) => {
    setTemplates(templates.map(template => 
      template.id === templateId 
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ));
  };

  const handleUseTemplate = (templateId) => {
    console.log('Using template:', templateId);
    window.location.href = `/invoices/create?template=${templateId}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Invoice Templates
            </h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Choose from professional templates or create your own custom design
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button className={`flex items-center px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <Palette className="w-4 h-4 mr-2" />
              Customize
            </button>
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </button>
          </div>
        </div>

        {/* Stats Component */}
        <TemplateStats />

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
        <TemplateCustom />
      </div>
    </DashboardLayout>
  );
};

export default InvoiceTemplates;