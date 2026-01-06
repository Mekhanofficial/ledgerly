// src/components/invoices/templates/TemplateCustom.jsx
import React, { useState } from 'react';
import { Eye, Plus, Palette, Layout, FileText, Save } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useToast } from '../../../context/ToastContext';
import { templateStorage } from '../../../utils/templateStorage';

const TemplateCustom = ({ onTemplateCreated }) => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  
  const features = [
    {
      icon: Palette,
      title: 'Brand Colors',
      description: 'Match your brand with custom colors and logos',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Layout,
      title: 'Layout Control',
      description: 'Drag and drop elements to create perfect layout',
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      icon: FileText,
      title: 'Save & Reuse',
      description: 'Save templates for future use across all invoices',
      color: 'text-violet-600 bg-violet-100'
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
      
      if (onTemplateCreated) {
        onTemplateCreated();
      }
    } catch (error) {
      addToast('Error creating template: ' + error.message, 'error');
    }
  };

  return (
    <div className={`border rounded-xl p-6 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Create Custom Template
          </h3>
          <p className={`mt-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Design your own invoice template with our drag-and-drop editor
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button className={`flex items-center px-4 py-2 rounded-lg ${
            isDarkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-primary-300 text-primary-700 hover:bg-primary-50'
          }`}>
            <Eye className="w-4 h-4 mr-2" />
            View Examples
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start Designing
          </button>
        </div>
      </div>
      
      {/* Template Creation Form */}
      {showForm && (
        <div className={`mt-6 p-6 rounded-lg ${
          isDarkMode 
            ? 'bg-gray-700' 
            : 'bg-white'
        }`}>
          <h4 className={`font-medium mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Create New Template
          </h4>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="My Custom Template"
                className={`w-full px-3 py-2 rounded-lg border ${
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
              <textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows="2"
                placeholder="Describe your template..."
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'border-gray-300'
                }`}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className={`p-4 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-700' 
                : 'bg-white'
            }`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${feature.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className={`font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {feature.title}
              </h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateCustom;