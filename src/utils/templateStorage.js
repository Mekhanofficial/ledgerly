// src/utils/templateStorage.js

// Basic (Free) Templates
export const basicTemplates = {
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
      showFooter: true,
      hasAnimations: false,
      hasGradientEffects: false,
      hasMultiLanguage: false
    },
    category: 'basic',
    isPremium: false,
    isDefault: true,
    isFavorite: true,
    price: 0,
    features: ['Professional Layout', 'Basic Customization', 'Email Support'],
    previewColor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    popularity: 95,
    lastUpdated: '2024-01-15'
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
      showFooter: false,
      hasAnimations: false,
      hasGradientEffects: false,
      hasMultiLanguage: false
    },
    category: 'basic',
    isPremium: false,
    isDefault: false,
    isFavorite: false,
    price: 0,
    features: ['Clean Design', 'Focus on Content', 'Fast Loading'],
    previewColor: 'bg-gradient-to-br from-gray-700 to-gray-900',
    popularity: 85,
    lastUpdated: '2024-01-10'
  }
};

// Premium Templates
export const premiumTemplates = {
  luxury: {
    id: 'luxury',
    name: 'Luxury',
    description: 'Elegant design for high-end businesses with gold accents and premium effects',
    colors: {
      primary: [184, 134, 11], // Gold
      secondary: [160, 124, 44],
      accent: [244, 244, 244],
      text: [33, 33, 33]
    },
    fonts: {
      title: 'times-bold',
      body: 'helvetica',
      accent: 'helvetica-oblique'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'PREMIUM',
      showHeaderBorder: true,
      showFooter: true,
      hasAnimations: true,
      hasGradientEffects: true,
      hasMultiLanguage: false,
      hasBackgroundPattern: true
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    price: 9.99,
    features: [
      'Gold Accents & Effects',
      'Custom Watermark',
      'Premium Support',
      'Priority Updates',
      'Animated Elements',
      'Background Patterns'
    ],
    previewColor: 'bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600',
    popularity: 92,
    lastUpdated: '2024-02-01',
    tags: ['luxury', 'elegant', 'premium']
  },
  corporatePro: {
    id: 'corporatePro',
    name: 'Corporate Pro',
    description: 'Advanced corporate template with multiple language support and professional features',
    colors: {
      primary: [13, 71, 161], // Corporate Blue
      secondary: [21, 101, 192],
      accent: [250, 250, 250],
      text: [38, 50, 56]
    },
    fonts: {
      title: 'helvetica-bold',
      body: 'helvetica',
      accent: 'helvetica-light'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'PROFESSIONAL',
      showHeaderBorder: true,
      showFooter: true,
      hasAnimations: true,
      hasGradientEffects: true,
      hasMultiLanguage: true,
      hasDataTables: true
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: true,
    price: 14.99,
    features: [
      'Multi-language Support',
      'Advanced Tax Calculations',
      'Currency Converter',
      'Advanced Analytics',
      'Data Tables',
      'Professional Watermark'
    ],
    previewColor: 'bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800',
    popularity: 88,
    lastUpdated: '2024-02-05',
    tags: ['corporate', 'professional', 'multi-language']
  },
  creativeStudio: {
    id: 'creativeStudio',
    name: 'Creative Studio',
    description: 'Modern design with animations, interactive elements and creative layouts',
    colors: {
      primary: [233, 30, 99], // Pink
      secondary: [216, 27, 96],
      accent: [255, 255, 255],
      text: [33, 33, 33]
    },
    fonts: {
      title: 'helvetica-bold',
      body: 'courier',
      accent: 'helvetica'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'CREATIVE',
      showHeaderBorder: false,
      showFooter: true,
      hasAnimations: true,
      hasGradientEffects: true,
      hasMultiLanguage: false,
      hasInteractiveElements: true
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    price: 12.99,
    features: [
      'Animated Elements',
      'Interactive PDF',
      '3D Preview',
      'Color Customizer',
      'Creative Layouts',
      'Visual Effects'
    ],
    previewColor: 'bg-gradient-to-br from-pink-600 via-rose-500 to-pink-700',
    popularity: 95,
    lastUpdated: '2024-01-28',
    tags: ['creative', 'modern', 'animated']
  },
  techModern: {
    id: 'techModern',
    name: 'Tech Modern',
    description: 'Futuristic design for tech companies with gradient effects and dark mode',
    colors: {
      primary: [0, 188, 212], // Cyan
      secondary: [0, 151, 167],
      accent: [245, 248, 250],
      text: [38, 50, 56]
    },
    fonts: {
      title: 'helvetica-bold',
      body: 'roboto',
      accent: 'helvetica-light'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'TECH',
      showHeaderBorder: true,
      showFooter: true,
      hasAnimations: true,
      hasGradientEffects: true,
      hasMultiLanguage: false,
      hasDarkMode: true
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    price: 11.99,
    features: [
      'Gradient Effects',
      'Dark Mode',
      'Code Syntax Highlighting',
      'API Integration',
      'Tech Icons',
      'Modern Layout'
    ],
    previewColor: 'bg-gradient-to-br from-cyan-500 via-teal-500 to-green-500',
    popularity: 90,
    lastUpdated: '2024-02-03',
    tags: ['tech', 'modern', 'gradient']
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated design with subtle animations and premium typography',
    colors: {
      primary: [121, 85, 72], // Brown
      secondary: [141, 110, 99],
      accent: [250, 250, 249],
      text: [66, 66, 66]
    },
    fonts: {
      title: 'garamond',
      body: 'georgia',
      accent: 'helvetica-light'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'ELEGANT',
      showHeaderBorder: true,
      showFooter: true,
      hasAnimations: true,
      hasGradientEffects: false,
      hasMultiLanguage: false,
      hasPremiumTypography: true
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: true,
    price: 10.99,
    features: [
      'Premium Typography',
      'Subtle Animations',
      'Elegant Borders',
      'Custom Icons',
      'Refined Layout',
      'Print Optimized'
    ],
    previewColor: 'bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900',
    popularity: 87,
    lastUpdated: '2024-01-25',
    tags: ['elegant', 'sophisticated', 'print']
  },
  startup: {
    id: 'startup',
    name: 'Startup',
    description: 'Vibrant design for startups with modern elements and growth-focused features',
    colors: {
      primary: [76, 175, 80], // Green
      secondary: [56, 142, 60],
      accent: [232, 245, 233],
      text: [33, 33, 33]
    },
    fonts: {
      title: 'helvetica-bold',
      body: 'helvetica',
      accent: 'helvetica-light'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'STARTUP',
      showHeaderBorder: false,
      showFooter: true,
      hasAnimations: true,
      hasGradientEffects: true,
      hasMultiLanguage: false,
      hasGrowthMetrics: true
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    price: 13.99,
    features: [
      'Growth Metrics',
      'Progress Indicators',
      'Milestone Tracking',
      'Team Collaboration',
      'Vibrant Colors',
      'Modern Elements'
    ],
    previewColor: 'bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600',
    popularity: 84,
    lastUpdated: '2024-02-02',
    tags: ['startup', 'modern', 'growth']
  }
};

// Industry-specific Templates
export const industryTemplates = {
  medical: {
    id: 'medical',
    name: 'Medical',
    description: 'Professional template for healthcare and medical services',
    colors: {
      primary: [3, 155, 229], // Medical Blue
      secondary: [2, 136, 209],
      accent: [232, 244, 253],
      text: [33, 33, 33]
    },
    fonts: {
      title: 'helvetica',
      body: 'helvetica',
      accent: 'helvetica-light'
    },
    layout: {
      showLogo: true,
      showWatermark: false,
      showHeaderBorder: true,
      showFooter: true,
      hasAnimations: false,
      hasGradientEffects: false,
      hasMultiLanguage: false
    },
    category: 'industry',
    isPremium: false,
    isDefault: false,
    isFavorite: false,
    price: 0,
    features: ['Medical Icons', 'HIPAA Compliant', 'Patient Focused'],
    previewColor: 'bg-gradient-to-br from-blue-400 to-cyan-400',
    popularity: 78,
    lastUpdated: '2024-01-20'
  },
  legal: {
    id: 'legal',
    name: 'Legal',
    description: 'Formal template for law firms and legal services',
    colors: {
      primary: [56, 142, 60], // Legal Green
      secondary: [67, 160, 71],
      accent: [241, 248, 233],
      text: [33, 33, 33]
    },
    fonts: {
      title: 'times',
      body: 'times',
      accent: 'times-italic'
    },
    layout: {
      showLogo: true,
      showWatermark: false,
      showHeaderBorder: true,
      showFooter: true,
      hasAnimations: false,
      hasGradientEffects: false,
      hasMultiLanguage: false
    },
    category: 'industry',
    isPremium: false,
    isDefault: false,
    isFavorite: false,
    price: 0,
    features: ['Formal Layout', 'Legal Terminology', 'Document Numbering'],
    previewColor: 'bg-gradient-to-br from-emerald-400 to-green-400',
    popularity: 75,
    lastUpdated: '2024-01-18'
  }
};

// Merge all templates
export const allTemplates = {
  ...basicTemplates,
  ...premiumTemplates,
  ...industryTemplates
};

// Get all available templates
export const getAvailableTemplates = () => {
  return Object.values(allTemplates).map(template => ({
    ...template
  }));
};

// Get template by ID
export const getTemplateById = (templateId) => {
  return allTemplates[templateId] || basicTemplates.standard;
};

// Storage keys
const TEMPLATE_STORAGE_KEY = 'invoice_templates';
const USER_TEMPLATE_STORAGE_KEY = 'user_invoice_templates';
const PREMIUM_ACCESS_KEY = 'premium_templates_access';
const TEMPLATE_PURCHASES_KEY = 'template_purchases';

// Check premium access
export const checkPremiumAccess = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const subscription = JSON.parse(localStorage.getItem('subscription') || '{}');
    const premiumAccess = JSON.parse(localStorage.getItem(PREMIUM_ACCESS_KEY) || '{}');
    
    const isPremiumUser = user?.isPremium || subscription?.status === 'active';
    const hasLifetimeAccess = premiumAccess?.type === 'lifetime';
    const expirationDate = premiumAccess?.expiresAt || subscription?.expiresAt;
    const isExpired = expirationDate ? new Date(expirationDate) < new Date() : false;
    
    return {
      hasPremium: isPremiumUser || hasLifetimeAccess,
      hasLifetimeAccess,
      subscriptionType: subscription?.type || premiumAccess?.type,
      expiresAt: expirationDate,
      isExpired,
      accessibleTemplates: premiumAccess?.templates || []
    };
  } catch (error) {
    console.error('Error checking premium access:', error);
    return {
      hasPremium: false,
      hasLifetimeAccess: false,
      subscriptionType: null,
      expiresAt: null,
      isExpired: false,
      accessibleTemplates: []
    };
  }
};

// Check if user has access to specific template
export const hasTemplateAccess = (templateId) => {
  try {
    const template = allTemplates[templateId];
    if (!template) return false;
    
    // Non-premium templates are always accessible
    if (!template.isPremium) return true;
    
    const { hasPremium, accessibleTemplates } = checkPremiumAccess();
    
    // Check if user has premium subscription
    if (hasPremium) return true;
    
    // Check if user has purchased this specific template
    const purchases = JSON.parse(localStorage.getItem(TEMPLATE_PURCHASES_KEY) || '[]');
    const hasPurchased = purchases.some(purchase => 
      purchase.templateId === templateId && purchase.status === 'completed'
    );
    
    return hasPurchased || accessibleTemplates.includes(templateId);
  } catch (error) {
    console.error('Error checking template access:', error);
    return false;
  }
};

// Purchase premium template
export const purchaseTemplate = async (templateId, paymentMethod = 'stripe') => {
  try {
    const template = premiumTemplates[templateId];
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Check if already purchased
    if (hasTemplateAccess(templateId)) {
      throw new Error('You already have access to this template');
    }
    
    // In a real app, this would call your payment API
    const purchaseData = {
      templateId,
      templateName: template.name,
      price: template.price,
      paymentMethod,
      purchasedAt: new Date().toISOString(),
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
      licenseType: 'single',
      expiresAt: null // Lifetime access for individual purchases
    };
    
    // Save purchase
    const purchases = JSON.parse(localStorage.getItem(TEMPLATE_PURCHASES_KEY) || '[]');
    purchases.push(purchaseData);
    localStorage.setItem(TEMPLATE_PURCHASES_KEY, JSON.stringify(purchases));
    
    // Add to accessible templates
    const premiumAccess = JSON.parse(localStorage.getItem(PREMIUM_ACCESS_KEY) || '{}');
    const accessibleTemplates = premiumAccess.templates || [];
    if (!accessibleTemplates.includes(templateId)) {
      accessibleTemplates.push(templateId);
      premiumAccess.templates = accessibleTemplates;
      premiumAccess.lastUpdated = new Date().toISOString();
      localStorage.setItem(PREMIUM_ACCESS_KEY, JSON.stringify(premiumAccess));
    }
    
    // Record template usage
    recordTemplateUsage(templateId, 'purchase');
    
    return purchaseData;
  } catch (error) {
    console.error('Purchase error:', error);
    throw error;
  }
};

// Purchase subscription (multiple templates)
export const purchaseSubscription = async (planType) => {
  try {
    const plans = {
      pro: {
        price: 19.99,
        duration: 'monthly',
        templates: Object.keys(premiumTemplates).slice(0, 8) // First 8 premium templates
      },
      enterprise: {
        price: 49.99,
        duration: 'monthly',
        templates: Object.keys(premiumTemplates) // All premium templates
      }
    };
    
    const plan = plans[planType];
    if (!plan) {
      throw new Error('Invalid plan type');
    }
    
    const subscriptionData = {
      plan: planType,
      price: plan.price,
      duration: plan.duration,
      templates: plan.templates,
      subscribedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      transactionId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active'
    };
    
    // Save subscription
    localStorage.setItem('subscription', JSON.stringify(subscriptionData));
    
    // Update premium access
    const premiumAccess = {
      type: 'subscription',
      plan: planType,
      templates: plan.templates,
      subscribedAt: subscriptionData.subscribedAt,
      expiresAt: subscriptionData.expiresAt,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(PREMIUM_ACCESS_KEY, JSON.stringify(premiumAccess));
    
    return subscriptionData;
  } catch (error) {
    console.error('Subscription error:', error);
    throw error;
  }
};

// Record template usage for analytics
const recordTemplateUsage = (templateId, action = 'view') => {
  try {
    const usage = JSON.parse(localStorage.getItem('template_usage') || '{}');
    const today = new Date().toISOString().split('T')[0];
    
    if (!usage[today]) {
      usage[today] = {};
    }
    
    if (!usage[today][templateId]) {
      usage[today][templateId] = {
        views: 0,
        uses: 0,
        purchases: 0,
        lastUsed: null
      };
    }
    
    usage[today][templateId][action + 's']++;
    usage[today][templateId].lastUsed = new Date().toISOString();
    
    localStorage.setItem('template_usage', JSON.stringify(usage));
  } catch (error) {
    console.error('Error recording template usage:', error);
  }
};

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
    const builtInTemplates = Object.values(allTemplates);
    return [...builtInTemplates, ...userTemplates];
  },

  // Get accessible templates based on user's plan
  getAccessibleTemplates() {
    const allTemplatesList = this.getAllTemplates();
    const { hasPremium, accessibleTemplates } = checkPremiumAccess();
    
    return allTemplatesList.filter(template => {
      if (!template.isPremium) return true; // Always show free templates
      if (hasPremium) return true; // Show all if user has premium
      return accessibleTemplates.includes(template.id); // Show only purchased
    });
  },

  // Get a specific template by ID
  getTemplate(templateId) {
    // Check built-in templates first
    if (allTemplates[templateId]) {
      return allTemplates[templateId];
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
        category: templateData.category || 'custom',
        isPremium: false, // User templates are never premium
        isDefault: false,
        isFavorite: false,
        price: 0,
        previewColor: templateData.previewColor || 'bg-gradient-to-br from-primary-500 to-primary-600',
        createdAt: templateData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        features: templateData.features || ['Custom Design', 'User Created']
      };
      
      templates.push(completeTemplate);
      localStorage.setItem(USER_TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
      
      // Record creation
      recordTemplateUsage(completeTemplate.id, 'create');
      
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
      // For built-in templates
      if (allTemplates[templateId]) {
        // Save preference to localStorage
        const preferences = JSON.parse(localStorage.getItem('template_preferences') || '{}');
        preferences.defaultTemplate = templateId;
        localStorage.setItem('template_preferences', JSON.stringify(preferences));
        return true;
      }
      
      // For user templates
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
      if (allTemplates[templateId]) {
        const favorites = JSON.parse(localStorage.getItem('template_favorites') || '{}');
        favorites[templateId] = !favorites[templateId];
        localStorage.setItem('template_favorites', JSON.stringify(favorites));
        return favorites[templateId];
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
    try {
      // Check user preferences
      const preferences = JSON.parse(localStorage.getItem('template_preferences') || '{}');
      if (preferences.defaultTemplate) {
        const template = this.getTemplate(preferences.defaultTemplate);
        if (template) return template;
      }
      
      // Check user templates for default
      const userTemplates = this.getTemplates();
      const userDefault = userTemplates.find(t => t.isDefault);
      if (userDefault) return userDefault;
      
      // Return built-in default
      return Object.values(allTemplates).find(t => t.isDefault) || basicTemplates.standard;
    } catch (error) {
      console.error('Error getting default template:', error);
      return basicTemplates.standard;
    }
  },

  // Get templates by category
  getTemplatesByCategory(category) {
    const allTemplates = this.getAllTemplates();
    return allTemplates.filter(t => t.category === category);
  },

  // Get favorite templates
  getFavoriteTemplates() {
    const allTemplates = this.getAllTemplates();
    const favoriteIds = JSON.parse(localStorage.getItem('template_favorites') || '{}');
    
    return allTemplates.filter(template => {
      if (allTemplates[template.id]) {
        return favoriteIds[template.id] === true;
      }
      return template.isFavorite;
    });
  },

  // Get premium templates
  getPremiumTemplates() {
    return Object.values(premiumTemplates);
  },

  // Get basic (free) templates
  getBasicTemplates() {
    return Object.values(basicTemplates);
  },

  // Search templates
  searchTemplates(query) {
    const allTemplates = this.getAllTemplates();
    const searchTerm = query.toLowerCase();
    
    return allTemplates.filter(template => 
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.category.toLowerCase().includes(searchTerm) ||
      (template.tags && template.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
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
        category: template.category || 'custom',
        isPremium: false,
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
    const builtInTemplates = Object.values(allTemplates);
    const allTemplatesList = [...builtInTemplates, ...userTemplates];
    
    const stats = {
      total: allTemplatesList.length,
      builtIn: builtInTemplates.length,
      userCreated: userTemplates.length,
      favorites: this.getFavoriteTemplates().length,
      premium: builtInTemplates.filter(t => t.isPremium).length,
      accessiblePremium: builtInTemplates.filter(t => t.isPremium && hasTemplateAccess(t.id)).length,
      byCategory: allTemplatesList.reduce((acc, template) => {
        acc[template.category] = (acc[template.category] || 0) + 1;
        return acc;
      }, {}),
      defaultTemplate: this.getDefaultTemplate()?.name || 'Standard',
      mostPopular: this.getMostPopularTemplate(),
      recentlyUsed: this.getRecentlyUsedTemplates(5)
    };
    
    return stats;
  },

  // Get most popular template
  getMostPopularTemplate() {
    try {
      const usage = JSON.parse(localStorage.getItem('template_usage') || '{}');
      const templateUsage = {};
      
      // Aggregate usage across all days
      Object.values(usage).forEach(day => {
        Object.entries(day).forEach(([templateId, data]) => {
          if (!templateUsage[templateId]) {
            templateUsage[templateId] = 0;
          }
          templateUsage[templateId] += (data.views || 0) + (data.uses || 0);
        });
      });
      
      // Find most used template
      let mostPopularId = Object.keys(templateUsage)[0];
      let maxUsage = 0;
      
      Object.entries(templateUsage).forEach(([templateId, usageCount]) => {
        if (usageCount > maxUsage) {
          maxUsage = usageCount;
          mostPopularId = templateId;
        }
      });
      
      return this.getTemplate(mostPopularId);
    } catch (error) {
      console.error('Error getting most popular template:', error);
      return null;
    }
  },

  // Get recently used templates
  getRecentlyUsedTemplates(limit = 5) {
    try {
      const usage = JSON.parse(localStorage.getItem('template_usage') || '{}');
      const recentTemplates = [];
      
      // Get templates from last 7 days
      const days = Object.keys(usage).sort().reverse().slice(0, 7);
      
      days.forEach(day => {
        Object.entries(usage[day]).forEach(([templateId, data]) => {
          if (data.lastUsed) {
            recentTemplates.push({
              templateId,
              lastUsed: data.lastUsed,
              template: this.getTemplate(templateId)
            });
          }
        });
      });
      
      // Sort by last used and limit results
      return recentTemplates
        .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
        .slice(0, limit)
        .map(item => item.template)
        .filter(Boolean);
    } catch (error) {
      console.error('Error getting recently used templates:', error);
      return [];
    }
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
      
      // Remove ID if it's a built-in template copy
      delete newTemplate.id;
      
      return this.saveTemplate(newTemplate);
    } catch (error) {
      console.error('Error duplicating template:', error);
      throw error;
    }
  },

  // Rate a template
  rateTemplate(templateId, rating, review) {
    try {
      const ratings = JSON.parse(localStorage.getItem('template_ratings') || '{}');
      const userRatings = ratings[templateId] || [];
      
      userRatings.push({
        rating,
        review,
        ratedAt: new Date().toISOString(),
        userId: localStorage.getItem('userId') || 'anonymous'
      });
      
      ratings[templateId] = userRatings;
      localStorage.setItem('template_ratings', JSON.stringify(ratings));
      
      return true;
    } catch (error) {
      console.error('Error rating template:', error);
      return false;
    }
  },

  // Get template ratings
  getTemplateRatings(templateId) {
    try {
      const ratings = JSON.parse(localStorage.getItem('template_ratings') || '{}');
      return ratings[templateId] || [];
    } catch (error) {
      console.error('Error getting template ratings:', error);
      return [];
    }
  },

  // Get average rating for template
  getTemplateAverageRating(templateId) {
    const ratings = this.getTemplateRatings(templateId);
    if (ratings.length === 0) return 0;
    
    const sum = ratings.reduce((total, r) => total + r.rating, 0);
    return sum / ratings.length;
  },

  // Mark template as used
  markTemplateAsUsed(templateId) {
    recordTemplateUsage(templateId, 'use');
    return true;
  },

  // Get user's purchase history
  getPurchaseHistory() {
    try {
      const purchases = JSON.parse(localStorage.getItem(TEMPLATE_PURCHASES_KEY) || '[]');
      return purchases.sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));
    } catch (error) {
      console.error('Error getting purchase history:', error);
      return [];
    }
  },

  // Check if user can access premium features
  canAccessPremiumFeatures() {
    const { hasPremium, isExpired } = checkPremiumAccess();
    return hasPremium && !isExpired;
  },

  // Get recommended templates based on usage
  getRecommendedTemplates() {
    const accessibleTemplates = this.getAccessibleTemplates();
    const recentlyUsed = this.getRecentlyUsedTemplates(3);
    const recentlyUsedIds = recentlyUsed.map(t => t.id);
    
    // Recommend similar templates to recently used ones
    const recommendations = accessibleTemplates
      .filter(t => !recentlyUsedIds.includes(t.id))
      .sort((a, b) => {
        // Sort by popularity and category match
        const aScore = (a.popularity || 50) + (recentlyUsed.some(ru => ru.category === a.category) ? 20 : 0);
        const bScore = (b.popularity || 50) + (recentlyUsed.some(ru => ru.category === b.category) ? 20 : 0);
        return bScore - aScore;
      })
      .slice(0, 6);
    
    return recommendations;
  }
};

// Helper function to create a template from invoice data
export const createTemplateFromInvoice = (invoiceData, templateName) => {
  return {
    id: `template_${Date.now()}`,
    name: templateName || `Template from ${invoiceData.invoiceNumber}`,
    description: 'Custom template created from invoice',
    category: 'custom',
    isPremium: false,
    isDefault: false,
    isFavorite: false,
    price: 0,
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
    updatedAt: new Date().toISOString(),
    features: ['Created from Invoice', 'Custom Layout', 'User Defined']
  };
};

// Default export
export default templateStorage;