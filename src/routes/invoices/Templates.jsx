// src/pages/invoices/InvoiceTemplates.jsx
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
  
  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const savedTemplates = templateStorage.getTemplates();
    
    // If no templates exist, create some default ones
    if (savedTemplates.length === 0) {
      const defaultTemplates = [
        {
          id: 'standard',
          name: 'Standard Invoice',
          description: 'Clean, professional design for all businesses',
          category: 'basic',
          isDefault: true,
          isFavorite: true,
          previewColor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
          lineItems: [
            { id: 1, description: 'Web Development Services', quantity: 1, rate: 125.00, tax: 10, amount: 137.50 },
            { id: 2, description: 'UI/UX Design', quantity: 1, rate: 150.00, tax: 10, amount: 165.00 }
          ],
          notes: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
          terms: 'All services are subject to our terms and conditions.',
          emailSubject: 'Invoice for Services Rendered',
          emailMessage: 'Dear valued customer,\n\nPlease find attached your invoice for services rendered.\n\nThank you for your business.\n\nBest regards,',
          currency: 'USD'
        },
        {
          id: 'consulting',
          name: 'Consulting Template',
          description: 'Professional template for consulting services',
          category: 'industry',
          isDefault: false,
          isFavorite: true,
          previewColor: 'bg-gradient-to-br from-indigo-500 to-blue-500',
          lineItems: [
            { id: 1, description: 'Consulting Services', quantity: 1, rate: 200.00, tax: 0, amount: 200.00 },
            { id: 2, description: 'Strategy Session', quantity: 2, rate: 150.00, tax: 0, amount: 300.00 }
          ],
          notes: 'Payment due within 15 days.',
          terms: 'Consulting services billed hourly.',
          emailSubject: 'Consulting Invoice',
          emailMessage: 'Dear Client,\n\nPlease find attached your consulting invoice.\n\nBest regards,',
          currency: 'USD'
        },
        {
          id: 'retail',
          name: 'Retail Template',
          description: 'Optimized for retail and product sales',
          category: 'industry',
          isDefault: false,
          isFavorite: false,
          previewColor: 'bg-gradient-to-br from-pink-500 to-rose-500',
          lineItems: [
            { id: 1, description: 'Product A', quantity: 5, rate: 49.99, tax: 8.25, amount: 270.70 },
            { id: 2, description: 'Product B', quantity: 3, rate: 29.99, tax: 8.25, amount: 97.42 }
          ],
          notes: 'All sales are final.',
          terms: '30-day return policy.',
          emailSubject: 'Your Order Invoice',
          emailMessage: 'Thank you for your order!\n\nPlease find attached your invoice.',
          currency: 'USD'
        }
      ];
      
      defaultTemplates.forEach(template => templateStorage.saveTemplate(template));
      setTemplates(defaultTemplates);
    } else {
      setTemplates(savedTemplates);
    }
  };

  const categories = [
    { id: 'all', label: 'All Templates', count: templates.length },
    { id: 'basic', label: 'Basic', count: templates.filter(t => t.category === 'basic').length },
    { id: 'premium', label: 'Premium', count: templates.filter(t => t.category === 'premium').length },
    { id: 'industry', label: 'Industry', count: templates.filter(t => t.category === 'industry').length },
    { id: 'custom', label: 'Custom', count: templates.filter(t => t.category === 'custom').length },
    { id: 'favorites', label: 'Favorites', count: templates.filter(t => t.isFavorite).length }
  ];

  const handleFavoriteToggle = (templateId) => {
    const updatedTemplates = templates.map(template => 
      template.id === templateId 
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    );
    setTemplates(updatedTemplates);
    
    // Update in storage
    const template = templates.find(t => t.id === templateId);
    if (template) {
      templateStorage.updateTemplate(templateId, { ...template, isFavorite: !template.isFavorite });
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
      <div className="space-y-6 p-4 md:p-6">
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
            <button 
              onClick={() => navigate('/invoices/create')}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </button>
          </div>
        </div>

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
      </div>
    </DashboardLayout>
  );
};

export default InvoiceTemplates;