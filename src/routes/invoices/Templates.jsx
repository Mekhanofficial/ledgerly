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
    setTimeout(() => {
      try {
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
            },
            {
              id: 'contractor',
              name: 'Contractor Template',
              description: 'Perfect for contractors and freelancers',
              category: 'basic',
              isDefault: false,
              isFavorite: false,
              previewColor: 'bg-gradient-to-br from-emerald-500 to-green-500',
              lineItems: [
                { id: 1, description: 'Project Work', quantity: 1, rate: 1500.00, tax: 0, amount: 1500.00 },
                { id: 2, description: 'Additional Hours', quantity: 10, rate: 75.00, tax: 0, amount: 750.00 }
              ],
              notes: 'Payment due upon receipt.',
              terms: '50% deposit required for new projects.',
              emailSubject: 'Project Invoice',
              emailMessage: 'Dear client,\n\nPlease find attached your project invoice.\n\nThank you.',
              currency: 'USD'
            },
            {
              id: 'restaurant',
              name: 'Restaurant Template',
              description: 'Designed for food service businesses',
              category: 'industry',
              isDefault: false,
              isFavorite: true,
              previewColor: 'bg-gradient-to-br from-amber-500 to-orange-500',
              lineItems: [
                { id: 1, description: 'Catering Services', quantity: 1, rate: 1200.00, tax: 8.25, amount: 1299.00 },
                { id: 2, description: 'Equipment Rental', quantity: 1, rate: 200.00, tax: 8.25, amount: 216.50 }
              ],
              notes: 'Gratuity not included.',
              terms: 'Cancellation within 24 hours incurs 50% fee.',
              emailSubject: 'Catering Invoice',
              emailMessage: 'Thank you for choosing us!\n\nPlease find your catering invoice attached.',
              currency: 'USD'
            },
            {
              id: 'professional',
              name: 'Professional Services',
              description: 'Elegant template for professional services',
              category: 'premium',
              isDefault: false,
              isFavorite: false,
              previewColor: 'bg-gradient-to-br from-purple-500 to-violet-500',
              lineItems: [
                { id: 1, description: 'Legal Consultation', quantity: 3, rate: 300.00, tax: 0, amount: 900.00 },
                { id: 2, description: 'Document Review', quantity: 1, rate: 450.00, tax: 0, amount: 450.00 }
              ],
              notes: 'Professional fees as agreed.',
              terms: 'Retainer may be required for ongoing services.',
              emailSubject: 'Professional Services Invoice',
              emailMessage: 'Dear client,\n\nPlease find your invoice for professional services attached.',
              currency: 'USD'
            }
          ];
          
          defaultTemplates.forEach(template => templateStorage.saveTemplate(template));
          setTemplates(defaultTemplates);
        } else {
          setTemplates(savedTemplates);
        }
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Small delay for better UX
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

            {/* Category Tabs */}
            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex space-x-1 md:space-x-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === category.id
                        ? 'bg-primary-600 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{category.label}</span>
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
            </div>

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