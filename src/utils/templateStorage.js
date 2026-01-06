// src/utils/templateStorage.js

// Template definitions for PDF generation
export const templates = {
  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'Clean, professional design for all businesses',
    colors: {
      primary: [41, 128, 185], // Blue
      secondary: [52, 152, 219],
      accent: [236, 240, 241],
      text: [44, 62, 80]
    },
    fonts: {
      title: 'helvetica',
      body: 'helvetica',
      accent: 'helvetica'
    },
    layout: {
      showLogo: false,
      showWatermark: false,
      showHeaderBorder: true,
      showFooter: true
    },
    category: 'basic',
    isDefault: true,
    isFavorite: true,
    previewColor: 'bg-gradient-to-br from-blue-500 to-cyan-500'
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Sleek design with contemporary typography',
    colors: {
      primary: [46, 204, 113], // Green
      secondary: [39, 174, 96],
      accent: [255, 255, 255],
      text: [33, 47, 60]
    },
    fonts: {
      title: 'helvetica',
      body: 'courier',
      accent: 'times'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      showHeaderBorder: false,
      showFooter: true
    },
    category: 'premium',
    isDefault: false,
    isFavorite: true,
    previewColor: 'bg-gradient-to-br from-emerald-500 to-green-500'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant, focuses on content',
    colors: {
      primary: [52, 73, 94], // Dark gray
      secondary: [127, 140, 141],
      accent: [236, 240, 241],
      text: [44, 62, 80]
    },
    fonts: {
      title: 'helvetica',
      body: 'helvetica',
      accent: 'helvetica'
    },
    layout: {
      showLogo: false,
      showWatermark: false,
      showHeaderBorder: false,
      showFooter: false
    },
    category: 'basic',
    isDefault: false,
    isFavorite: false,
    previewColor: 'bg-gradient-to-br from-gray-700 to-gray-900'
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Formal design suitable for corporate use',
    colors: {
      primary: [142, 68, 173], // Purple
      secondary: [155, 89, 182],
      accent: [245, 245, 245],
      text: [52, 73, 94]
    },
    fonts: {
      title: 'times',
      body: 'helvetica',
      accent: 'times'
    },
    layout: {
      showLogo: true,
      showWatermark: false,
      showHeaderBorder: true,
      showFooter: true
    },
    category: 'premium',
    isDefault: false,
    isFavorite: false,
    previewColor: 'bg-gradient-to-br from-violet-500 to-purple-500'
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Colorful design for creative businesses',
    colors: {
      primary: [231, 76, 60], // Red
      secondary: [241, 148, 138],
      accent: [253, 227, 167],
      text: [44, 62, 80]
    },
    fonts: {
      title: 'helvetica',
      body: 'helvetica',
      accent: 'courier'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      showHeaderBorder: true,
      showFooter: true
    },
    category: 'premium',
    isDefault: false,
    isFavorite: false,
    previewColor: 'bg-gradient-to-br from-orange-500 to-amber-500'
  }
};

// Get available templates
export const getAvailableTemplates = () => {
  return Object.values(templates).map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    colors: template.colors,
    category: template.category,
    isDefault: template.isDefault,
    isFavorite: template.isFavorite,
    previewColor: template.previewColor
  }));
};

// Get template by ID
export const getTemplateById = (templateId) => {
  return templates[templateId] || templates.standard;
};

// Storage key for user templates
const TEMPLATE_STORAGE_KEY = 'invoice_templates';
const USER_TEMPLATE_STORAGE_KEY = 'user_invoice_templates';

// Template storage utility
export const templateStorage = {
  // Get all user templates
  getTemplates() {
    try {
      const templates = localStorage.getItem(USER_TEMPLATE_STORAGE_KEY);
      return templates ? JSON.parse(templates) : [];
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  },

  // Get all templates including built-in and user templates
  getAllTemplates() {
    const userTemplates = this.getTemplates();
    const builtInTemplates = Object.values(templates);
    return [...builtInTemplates, ...userTemplates];
  },

  // Get a specific template by ID
  getTemplate(templateId) {
    // Check built-in templates first
    if (templates[templateId]) {
      return templates[templateId];
    }
    
    // Check user templates
    const userTemplates = this.getTemplates();
    return userTemplates.find(t => t.id === templateId);
  },

  // Save a new user template
  saveTemplate(templateData) {
    try {
      const templates = this.getTemplates();
      
      // Ensure template has required fields
      const completeTemplate = {
        ...templateData,
        id: templateData.id || `template_${Date.now()}`,
        createdAt: templateData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      templates.push(completeTemplate);
      localStorage.setItem(USER_TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
      return completeTemplate;
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  },

  // Update an existing user template
  updateTemplate(templateId, updatedData) {
    try {
      const templates = this.getTemplates();
      const index = templates.findIndex(t => t.id === templateId);
      if (index !== -1) {
        templates[index] = { 
          ...templates[index], 
          ...updatedData,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(USER_TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating template:', error);
      return false;
    }
  },

  // Delete a user template
  deleteTemplate(templateId) {
    try {
      const templates = this.getTemplates();
      const filteredTemplates = templates.filter(t => t.id !== templateId);
      localStorage.setItem(USER_TEMPLATE_STORAGE_KEY, JSON.stringify(filteredTemplates));
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  },

  // Set default template
  setDefaultTemplate(templateId) {
    try {
      // For built-in templates, update the isDefault property
      if (templates[templateId]) {
        // Update all built-in templates
        Object.keys(templates).forEach(key => {
          templates[key].isDefault = key === templateId;
        });
        // Note: This won't persist for built-in templates across page refreshes
        // since they're hardcoded. For a production app, you'd want to save this preference.
        return true;
      }
      
      // For user templates, we need a different approach
      const userTemplates = this.getTemplates();
      const updatedUserTemplates = userTemplates.map(template => ({
        ...template,
        isDefault: template.id === templateId
      }));
      localStorage.setItem(USER_TEMPLATE_STORAGE_KEY, JSON.stringify(updatedUserTemplates));
      return true;
    } catch (error) {
      console.error('Error setting default template:', error);
      return false;
    }
  },

  // Toggle favorite status
  toggleFavorite(templateId) {
    try {
      // For built-in templates
      if (templates[templateId]) {
        templates[templateId].isFavorite = !templates[templateId].isFavorite;
        // Note: This won't persist across page refreshes for built-in templates
        return templates[templateId].isFavorite;
      }
      
      // For user templates
      const templatesList = this.getTemplates();
      const index = templatesList.findIndex(t => t.id === templateId);
      if (index !== -1) {
        templatesList[index].isFavorite = !templatesList[index].isFavorite;
        localStorage.setItem(USER_TEMPLATE_STORAGE_KEY, JSON.stringify(templatesList));
        return templatesList[index].isFavorite;
      }
      return false;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  },

  // Get default template
  getDefaultTemplate() {
    const userTemplates = this.getTemplates();
    const userDefault = userTemplates.find(t => t.isDefault);
    if (userDefault) return userDefault;
    
    // Return built-in default
    return Object.values(templates).find(t => t.isDefault) || templates.standard;
  },

  // Get templates by category
  getTemplatesByCategory(category) {
    const allTemplates = this.getAllTemplates();
    return allTemplates.filter(t => t.category === category);
  },

  // Get favorite templates
  getFavoriteTemplates() {
    const allTemplates = this.getAllTemplates();
    return allTemplates.filter(t => t.isFavorite);
  },

  // Search templates
  searchTemplates(query) {
    const allTemplates = this.getAllTemplates();
    const searchTerm = query.toLowerCase();
    return allTemplates.filter(template => 
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.category.toLowerCase().includes(searchTerm)
    );
  },

  // Import templates from JSON
  importTemplates(templatesData) {
    try {
      const existingTemplates = this.getTemplates();
      const newTemplates = Array.isArray(templatesData) ? templatesData : [templatesData];
      
      // Add unique IDs to new templates if missing
      const templatesWithIds = newTemplates.map(template => ({
        ...template,
        id: template.id || `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: template.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      const mergedTemplates = [...existingTemplates, ...templatesWithIds];
      localStorage.setItem(USER_TEMPLATE_STORAGE_KEY, JSON.stringify(mergedTemplates));
      return mergedTemplates;
    } catch (error) {
      console.error('Error importing templates:', error);
      throw error;
    }
  },

  // Export templates to JSON
  exportTemplates() {
    const templates = this.getTemplates();
    return JSON.stringify(templates, null, 2);
  },

  // Clear all user templates
  clearAllTemplates() {
    localStorage.removeItem(USER_TEMPLATE_STORAGE_KEY);
    return true;
  },

  // Get template statistics
  getTemplateStats() {
    const userTemplates = this.getTemplates();
    const builtInTemplates = Object.values(templates);
    const allTemplates = [...builtInTemplates, ...userTemplates];
    
    return {
      total: allTemplates.length,
      builtIn: builtInTemplates.length,
      userCreated: userTemplates.length,
      favorites: allTemplates.filter(t => t.isFavorite).length,
      byCategory: allTemplates.reduce((acc, template) => {
        acc[template.category] = (acc[template.category] || 0) + 1;
        return acc;
      }, {}),
      defaultTemplate: allTemplates.find(t => t.isDefault)?.name || 'Standard'
    };
  },

  // Duplicate a template
  duplicateTemplate(templateId) {
    try {
      const template = this.getTemplate(templateId);
      if (!template) throw new Error('Template not found');
      
      const newTemplate = {
        ...template,
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${template.name} (Copy)`,
        isDefault: false,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      delete newTemplate.id; // Remove ID if it's a built-in template copy
      
      return this.saveTemplate(newTemplate);
    } catch (error) {
      console.error('Error duplicating template:', error);
      throw error;
    }
  }
};

// Helper function to create a template from invoice data
export const createTemplateFromInvoice = (invoiceData, templateName) => {
  return {
    id: `template_${Date.now()}`,
    name: templateName || `Template from ${invoiceData.invoiceNumber}`,
    description: 'Custom template created from invoice',
    category: 'custom',
    isDefault: false,
    isFavorite: false,
    previewColor: 'bg-gradient-to-br from-primary-500 to-primary-600',
    lineItems: invoiceData.lineItems?.map(item => ({
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      tax: item.tax
    })) || [],
    notes: invoiceData.notes || '',
    terms: invoiceData.terms || '',
    emailSubject: invoiceData.emailSubject || 'Invoice for Services Rendered',
    emailMessage: invoiceData.emailMessage || 'Dear valued customer,\n\nPlease find attached your invoice for services rendered.\n\nThank you for your business.\n\nBest regards,',
    currency: invoiceData.currency || 'USD',
    paymentTerms: invoiceData.paymentTerms || 'net-30',
    templateStyle: invoiceData.templateStyle || 'standard',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Default export
export default templateStorage;