import React, { useState } from 'react';
import { Eye, Plus, Palette, Layout, FileText, Save, X } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useToast } from '../../../context/ToastContext';
import { templateStorage } from '../../../utils/templateStorage';

const TemplateCustom = ({ onTemplateCreated }) => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  
  const features = [
    {
      icon: Palette,
      title: 'Brand Colors',
      description: 'Match your brand with custom colors and logos',
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300'
    },
    {
      icon: Layout,
      title: 'Layout Control',
      description: 'Drag and drop elements to create perfect layout',
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300'
    },
    {
      icon: FileText,
      title: 'Save & Reuse',
      description: 'Save templates for future use across all invoices',
      color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300'
    }
  ];

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      addToast('Please enter a template name', 'error');
      return;
    }

    try {
      const templateData = {
        id: `template_${Date.now()}`,
        name: templateName,
        description: templateDescription || 'Custom invoice template',
        category: 'custom',
        isDefault: false,
        isFavorite: false,
        previewColor: 'bg-gradient-to-br from-primary-500 to-primary-600',
        createdAt: new Date().toISOString()
      };

      templateStorage.saveTemplate(templateData);
      addToast('Custom template created successfully!', 'success');
      
      setTemplateName('');
      setTemplateDescription('');
      setShowForm(false);
      setShowFormModal(false);
      
      if (onTemplateCreated) {
        onTemplateCreated();
      }
    } catch (error) {
      addToast('Error creating template: ' + error.message, 'error');
    }
  };

  return (
    <>
      <div className={`border rounded-lg md:rounded-xl p-4 md:p-6 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg md:text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Create Custom Template
            </h3>
            <p className={`mt-1 text-sm md:text-base ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Design your own invoice template with our drag-and-drop editor
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button className={`flex items-center px-3 py-2 rounded-lg text-sm md:text-base ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-primary-300 text-primary-700 hover:bg-primary-50'
            }`}>
              <Eye className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">View Examples</span>
              <span className="sm:hidden">Examples</span>
            </button>
            <button 
              onClick={() => {
                if (window.innerWidth < 768) {
                  setShowFormModal(true);
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="flex items-center px-3 py-2 md:px-4 md:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm md:text-base whitespace-nowrap"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Start Designing</span>
              <span className="sm:hidden">Design</span>
            </button>
          </div>
        </div>
        
        {/* Desktop Form (inline) */}
        {showForm && window.innerWidth >= 768 && (
          <div className={`mt-6 p-4 md:p-6 rounded-lg ${
            isDarkMode 
              ? 'bg-gray-700' 
              : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className={`font-medium text-base md:text-lg ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Create New Template
              </h4>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="My Custom Template"
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe your template..."
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-2 md:px-4 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="flex items-center px-3 py-2 md:px-4 md:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
              >
                <Save className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Save Template
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className={`p-3 md:p-4 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700' 
                  : 'bg-white'
              }`}>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-3 ${feature.color}`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h4 className={`font-medium text-sm md:text-base mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h4>
                <p className={`text-xs md:text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Modal for Form */}
      {showFormModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowFormModal(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              {/* Modal Header */}
              <div className={`p-4 md:p-6 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Create Custom Template
                  </h3>
                  <button
                    onClick={() => setShowFormModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 md:p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="My Custom Template"
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Description (Optional)
                  </label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    rows="3"
                    placeholder="Describe your template..."
                    className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`p-4 md:p-6 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowFormModal(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TemplateCustom;