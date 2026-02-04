// src/utils/premiumTemplates.js

export const premiumTemplates = {
  luxury: {
    id: 'luxury',
    name: 'Luxury',
    description: 'Elegant design for high-end businesses with gold accents',
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
      hasBackgroundPattern: true
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    previewColor: 'bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600',
    price: 9.99,
    features: ['Gold Accents', 'Custom Watermark', 'Premium Support', 'Priority Updates']
  },
  corporatePro: {
    id: 'corporatePro',
    name: 'Corporate Pro',
    description: 'Advanced corporate template with multiple language support',
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
      hasMultiLanguage: true
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    previewColor: 'bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800',
    price: 14.99,
    features: ['Multi-language', 'Tax Calculations', 'Currency Converter', 'Advanced Analytics']
  },
  creativeStudio: {
    id: 'creativeStudio',
    name: 'Creative Studio',
    description: 'Modern design with animations and interactive elements',
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
      hasAnimations: true
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    previewColor: 'bg-gradient-to-br from-pink-600 via-rose-500 to-pink-700',
    price: 12.99,
    features: ['Animated Elements', 'Interactive PDF', '3D Preview', 'Color Customizer']
  },
  techModern: {
    id: 'techModern',
    name: 'Tech Modern',
    description: 'Futuristic design for tech companies with gradient effects',
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
      hasGradientEffects: true
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    previewColor: 'bg-gradient-to-br from-cyan-500 via-teal-500 to-green-500',
    price: 11.99,
    features: ['Gradient Effects', 'Dark Mode', 'Code Syntax', 'API Integration']
  }
};

// Check if user has access to premium templates
export const checkPremiumAccess = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const subscription = JSON.parse(localStorage.getItem('subscription') || '{}');
  
  return {
    hasPremium: user?.isPremium || subscription?.status === 'active',
    subscriptionType: subscription?.type,
    expiresAt: subscription?.expiresAt
  };
};

// Purchase premium template
export const purchaseTemplate = async (templateId, paymentMethod) => {
  try {
    const template = premiumTemplates[templateId];
    if (!template) throw new Error('Template not found');
    
    // In a real app, this would call your payment API
    const purchaseData = {
      templateId,
      templateName: template.name,
      price: template.price,
      purchasedAt: new Date().toISOString(),
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Save purchase to localStorage (in real app, save to backend)
    const purchases = JSON.parse(localStorage.getItem('templatePurchases') || '[]');
    purchases.push(purchaseData);
    localStorage.setItem('templatePurchases', JSON.stringify(purchases));
    
    // Add to user's accessible templates
    const accessibleTemplates = JSON.parse(localStorage.getItem('accessibleTemplates') || '[]');
    if (!accessibleTemplates.includes(templateId)) {
      accessibleTemplates.push(templateId);
      localStorage.setItem('accessibleTemplates', JSON.stringify(accessibleTemplates));
    }
    
    return purchaseData;
  } catch (error) {
    console.error('Purchase error:', error);
    throw error;
  }
};

// Check if user has access to specific template
export const hasTemplateAccess = (templateId) => {
  const { hasPremium } = checkPremiumAccess();
  const accessibleTemplates = JSON.parse(localStorage.getItem('accessibleTemplates') || '[]');
  
  // If template is premium, check access
  if (premiumTemplates[templateId]) {
    return hasPremium || accessibleTemplates.includes(templateId);
  }
  
  // Non-premium templates are always accessible
  return true;
};

// Get all premium templates
export const getAllPremiumTemplates = () => {
  return Object.values(premiumTemplates);
};

// Get user's purchased templates
export const getPurchasedTemplates = () => {
  const purchases = JSON.parse(localStorage.getItem('templatePurchases') || '[]');
  const accessibleTemplates = JSON.parse(localStorage.getItem('accessibleTemplates') || '[]');
  
  return accessibleTemplates.map(templateId => premiumTemplates[templateId]).filter(Boolean);
};