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
  },
  consultant: {
    id: 'consultant',
    name: 'Consultant',
    description: 'Polished, client-ready template for consultants and agencies',
    colors: {
      primary: [45, 108, 223],
      secondary: [63, 123, 236],
      accent: [236, 244, 255],
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
      watermarkText: 'CONSULTANT',
      showHeaderBorder: true,
      showFooter: true,
      hasAnimations: true,
      hasGradientEffects: true,
      hasMultiLanguage: false,
      hasDataTables: true
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    price: 9.99,
    features: [
      'Client-ready Layout',
      'Professional Accent Colors',
      'Detailed Line Items',
      'Priority Support',
      'Custom Watermark'
    ],
    previewColor: 'bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-700',
    popularity: 86,
    lastUpdated: '2024-02-06',
    tags: ['consulting', 'agency', 'professional']
  },
  retail: {
    id: 'retail',
    name: 'Retail',
    description: 'Bright retail template with item-forward layout for stores',
    colors: {
      primary: [244, 81, 30],
      secondary: [255, 152, 0],
      accent: [255, 248, 225],
      text: [55, 71, 79]
    },
    fonts: {
      title: 'helvetica-bold',
      body: 'helvetica',
      accent: 'helvetica-light'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'RETAIL',
      showHeaderBorder: true,
      showFooter: true,
      hasAnimations: true,
      hasGradientEffects: true,
      hasMultiLanguage: false
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    price: 8.99,
    features: [
      'Itemized Layout',
      'Retail-ready Styling',
      'Bold Highlights',
      'Priority Support'
    ],
    previewColor: 'bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600',
    popularity: 83,
    lastUpdated: '2024-02-06',
    tags: ['retail', 'store', 'point-of-sale']
  },
  // ========== 7 NEW PREMIUM TEMPLATES – Inspired by your images ==========

professionalClassic: {
  id: 'professionalClassic',
  name: 'Professional Classic',
  description: 'Traditional US‑style invoice with Bill‑To & Ship‑To addresses. Trusted and clean.',
  colors: {
    primary: [44, 62, 80],    // deep slate
    secondary: [52, 73, 94],  // muted blue‑gray
    accent: [245, 247, 250],  // near white
    text: [33, 37, 41],
    border: [206, 212, 218]
  },
  fonts: {
    title: 'helvetica-bold',
    body: 'helvetica',
    accent: 'helvetica-light'
  },
  layout: {
    showLogo: true,
    showWatermark: false,
    showHeaderBorder: true,
    showFooter: true,
    hasDualAddress: true,     // Bill to / Ship to columns
    headerStyle: 'letterhead'
  },
  category: 'premium',
  isPremium: true,
  isDefault: false,
  isFavorite: false,
  price: 7.99,
  features: [
    'Bill‑To & Ship‑To columns',
    'PO number field',
    '15‑day payment terms',
    'Classic letterhead style'
  ],
  previewColor: 'bg-gradient-to-br from-slate-700 to-slate-800',
  popularity: 92,
  lastUpdated: '2026-02-11',
  tags: ['classic', 'us‑style', 'trusted', 'repair']
},

modernCorporate: {
  id: 'modernCorporate',
  name: 'Modern Corporate',
  description: 'Bold branded header with tagline, colored table head, perfect for agencies.',
  colors: {
    primary: [0, 70, 140],    // deep corporate blue
    secondary: [0, 110, 200],
    accent: [240, 248, 255],  // alice blue
    text: [38, 50, 56],
    border: [200, 215, 230]
  },
  fonts: {
    title: 'helvetica-bold',
    body: 'helvetica',
    accent: 'helvetica-oblique'
  },
  layout: {
    showLogo: true,
    showWatermark: true,
    watermarkText: 'CORPORATE',
    showHeaderBorder: false,
    headerStyle: 'brand-bar',
    showFooter: true
  },
  category: 'premium',
  isPremium: true,
  isDefault: false,
  isFavorite: false,
  price: 9.99,
  features: [
    'Tagline placement',
    'Colored table header',
    'Thank‑you note',
    'Professional watermark'
  ],
  previewColor: 'bg-gradient-to-br from-blue-800 to-blue-600',
  popularity: 90,
  lastUpdated: '2026-02-11',
  tags: ['corporate', 'branded', 'bold', 'agency']
},

cleanBilling: {
  id: 'cleanBilling',
  name: 'Clean Billing',
  description: 'Airy, minimal design with subtle borders and soft gray background – from bo4.jpg.',
  colors: {
    primary: [100, 116, 139], // slate-500
    secondary: [148, 163, 184],
    accent: [248, 250, 252],  // slate-50
    text: [30, 41, 59],
    border: [203, 213, 225]
  },
  fonts: {
    title: 'helvetica-light',
    body: 'helvetica',
    accent: 'helvetica-light'
  },
  layout: {
    showLogo: false,
    showWatermark: false,
    showHeaderBorder: true,
    showFooter: true,
    headerStyle: 'thin-line'
  },
  category: 'premium',
  isPremium: true,
  isDefault: false,
  isFavorite: false,
  price: 6.99,
  features: [
    'Subtle borders',
    'Soft background',
    'Minimalist typography',
    'Focus on line items'
  ],
  previewColor: 'bg-gradient-to-br from-slate-400 to-slate-500',
  popularity: 85,
  lastUpdated: '2026-02-11',
  tags: ['minimal', 'airy', 'billing']
},

retailReceipt: {
  id: 'retailReceipt',
  name: 'Retail Receipt',
  description: 'Friendly, item‑heavy layout – perfect for stores, inspired by bo2.jpg.',
  colors: {
    primary: [13, 148, 136], // teal-600
    secondary: [20, 184, 166],
    accent: [240, 253, 250], // teal-50
    text: [31, 41, 55],
    border: [153, 246, 228]
  },
  fonts: {
    title: 'helvetica-bold',
    body: 'helvetica',
    accent: 'helvetica'
  },
  layout: {
    showLogo: true,
    showWatermark: false,
    showHeaderBorder: false,
    showFooter: true,
    headerStyle: 'simple'
  },
  category: 'premium',
  isPremium: true,
  isDefault: false,
  isFavorite: false,
  price: 8.99,
  features: [
    'Item‑focused table',
    'SKU / product codes',
    'Bright accents',
    'Thank you message'
  ],
  previewColor: 'bg-gradient-to-br from-teal-600 to-cyan-600',
  popularity: 88,
  lastUpdated: '2026-02-11',
  tags: ['retail', 'store', 'product']
},

simpleElegant: {
  id: 'simpleElegant',
  name: 'Simple Elegant',
  description: 'Understated, formal – centered title, thin rules, inspired by bo3.jpg.',
  colors: {
    primary: [55, 65, 81],   // gray-700
    secondary: [75, 85, 99],
    accent: [249, 250, 251], // gray-50
    text: [17, 24, 39],
    border: [229, 231, 235]
  },
  fonts: {
    title: 'times-bold',
    body: 'times',
    accent: 'times-italic'
  },
  layout: {
    showLogo: false,
    showWatermark: false,
    showHeaderBorder: true,
    showFooter: false,
    headerStyle: 'centered'
  },
  category: 'premium',
  isPremium: true,
  isDefault: false,
  isFavorite: false,
  price: 7.49,
  features: [
    'Centered title',
    'Thin horizontal rules',
    'Formal serif font',
    'Minimalist'
  ],
  previewColor: 'bg-gradient-to-br from-gray-600 to-gray-700',
  popularity: 82,
  lastUpdated: '2026-02-11',
  tags: ['elegant', 'formal', 'serif']
},

urbanEdge: {
  id: 'urbanEdge',
  name: 'Urban Edge',
  description: 'Contemporary, asymmetric color blocks with a signature field – bo6.avif style.',
  colors: {
    primary: [202, 138, 4],  // amber-600
    secondary: [217, 119, 6],
    accent: [255, 251, 235], // amber-50
    text: [28, 25, 23],
    border: [245, 158, 11]
  },
  fonts: {
    title: 'helvetica-bold',
    body: 'helvetica',
    accent: 'helvetica-bold'
  },
  layout: {
    showLogo: true,
    showWatermark: true,
    watermarkText: 'URBAN',
    showHeaderBorder: true,
    showFooter: true,
    hasSignature: true,
    headerStyle: 'asymmetric'
  },
  category: 'premium',
  isPremium: true,
  isDefault: false,
  isFavorite: false,
  price: 10.99,
  features: [
    'Asymmetric color blocks',
    'Signature line',
    'Bold typography',
    'Urban aesthetic'
  ],
  previewColor: 'bg-gradient-to-br from-amber-600 to-orange-600',
  popularity: 95,
  lastUpdated: '2026-02-11',
  tags: ['urban', 'edge', 'asymmetric', 'signature']
},

  creativeFlow: {
    id: 'creativeFlow',
    name: 'Creative Flow',
  description: 'Artistic, fluid design with wave separator and decorative footer – bo.avif.',
  colors: {
    primary: [147, 51, 234], // purple-600
    secondary: [168, 85, 247],
    accent: [250, 245, 255], // purple-50
    text: [31, 41, 55],
    border: [216, 180, 254]
  },
  fonts: {
    title: 'helvetica-bold',
    body: 'helvetica',
    accent: 'helvetica-light'
  },
  layout: {
    showLogo: true,
    showWatermark: true,
    watermarkText: 'CREATIVE',
    showHeaderBorder: false,
    showFooter: true,
    hasWave: true,
    headerStyle: 'flow'
  },
  category: 'premium',
  isPremium: true,
  isDefault: false,
  isFavorite: false,
  price: 11.99,
  features: [
    'Wave separator',
    'Decorative footer',
    'Artistic layout',
    'Creative watermark'
  ],
  previewColor: 'bg-gradient-to-br from-purple-600 to-fuchsia-600',
  popularity: 94,
  lastUpdated: '2026-02-11',
  tags: ['creative', 'flow', 'artistic', 'wave']
},

  // ========== 5 ULTRA-PREMIUM TEMPLATES - Next-gen design ==========
  glassmorphic: {
    id: 'glassmorphic',
    name: 'Glassmorphic',
    description: 'Translucent layers, blurred backgrounds, and subtle neon accents. Modern and ethereal.',
    colors: {
      primary: [88, 101, 242], // vibrant indigo
      secondary: [121, 134, 255],
      accent: [255, 255, 255],
      text: [15, 23, 42],
      border: [203, 213, 225]
    },
    fonts: {
      title: 'helvetica-bold',
      body: 'helvetica',
      accent: 'helvetica-light'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'GLASS',
      showHeaderBorder: false,
      showFooter: true,
      hasBackdropBlur: true,
      hasNeonGlow: true,
      headerStyle: 'floating'
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    price: 19.99,
    features: [
      'Glass-morphism effect',
      'Neon accent glow',
      'Floating card layout',
      'Adaptive to light/dark'
    ],
    previewColor: 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400',
    popularity: 97,
    lastUpdated: '2026-02-12',
    tags: ['glass', 'translucent', 'neon', 'modern']
  },

  neoBrutalist: {
    id: 'neoBrutalist',
    name: 'Neo-Brutalist',
    description: 'Bold, unapologetic, asymmetric. Sharp corners, oversized type, raw grid.',
    colors: {
      primary: [255, 89, 94], // vibrant red
      secondary: [54, 79, 107], // dark blue
      accent: [252, 196, 54], // mustard yellow
      text: [10, 10, 10],
      border: [0, 0, 0]
    },
    fonts: {
      title: 'helvetica-bold',
      body: 'courier',
      accent: 'helvetica-black'
    },
    layout: {
      showLogo: true,
      showWatermark: false,
      showHeaderBorder: false,
      showFooter: true,
      hasAsymmetricGrid: true,
      hasOversizedText: true,
      headerStyle: 'brutal'
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    price: 16.99,
    features: [
      'Asymmetric layout',
      'Oversized typography',
      'Raw, unpolished grid',
      'High-contrast palette'
    ],
    previewColor: 'bg-gradient-to-br from-red-600 to-amber-500',
    popularity: 91,
    lastUpdated: '2026-02-12',
    tags: ['brutalist', 'asymmetric', 'bold', 'raw']
  },

  holographic: {
    id: 'holographic',
    name: 'Holographic',
    description: 'Iridescent gradients, metallic foil effect, shifting colors - luxury redefined.',
    colors: {
      primary: [168, 85, 247], // purple
      secondary: [236, 72, 153], // pink
      accent: [251, 146, 60], // orange
      text: [255, 255, 255],
      border: [255, 255, 255]
    },
    fonts: {
      title: 'helvetica-bold',
      body: 'helvetica',
      accent: 'helvetica-light'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'HOLO',
      showHeaderBorder: false,
      showFooter: true,
      hasIridescentGradient: true,
      hasMetallicEdge: true,
      headerStyle: 'prism'
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    price: 18.99,
    features: [
      'Iridescent gradient',
      'Metallic foil accents',
      'Light-reflecting illusion',
      'Dark background'
    ],
    previewColor: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500',
    popularity: 99,
    lastUpdated: '2026-02-12',
    tags: ['holographic', 'iridescent', 'luxury', 'metallic']
  },

  minimalistDark: {
    id: 'minimalistDark',
    name: 'Minimalist Dark',
    description: 'Sleek, monospace, subtle glow. Perfect for tech startups and dev agencies.',
    colors: {
      primary: [0, 122, 255], // Apple blue
      secondary: [88, 86, 214], // iOS system indigo
      accent: [44, 44, 46], // dark gray
      text: [255, 255, 255],
      border: [72, 72, 74]
    },
    fonts: {
      title: 'courier-bold',
      body: 'courier',
      accent: 'helvetica-light'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'DARK',
      showHeaderBorder: true,
      showFooter: true,
      hasDarkMode: true,
      hasGlowEffect: true,
      headerStyle: 'terminal'
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    price: 14.99,
    features: [
      'True dark mode',
      'Monospace typography',
      'Subtle glow accents',
      'Terminal-inspired'
    ],
    previewColor: 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900',
    popularity: 94,
    lastUpdated: '2026-02-12',
    tags: ['dark', 'minimal', 'monospace', 'tech']
  },

  organicEco: {
    id: 'organicEco',
    name: 'Organic Eco',
    description: 'Soft curves, natural tones, fluid shapes, leaf motifs - sustainable and calm.',
    colors: {
      primary: [34, 197, 94], // green
      secondary: [74, 222, 128],
      accent: [254, 249, 195], // soft yellow
      text: [20, 83, 45],
      border: [187, 247, 208]
    },
    fonts: {
      title: 'georgia',
      body: 'georgia',
      accent: 'helvetica-light'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'ECO',
      showHeaderBorder: false,
      showFooter: true,
      hasWaveBorder: true,
      hasBotanicalIcon: true,
      headerStyle: 'rounded'
    },
    category: 'premium',
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    price: 15.99,
    features: [
      'Organic curves',
      'Botanical accents',
      'Soft color palette',
      'Fluid layout'
    ],
    previewColor: 'bg-gradient-to-br from-green-400 to-emerald-600',
    popularity: 89,
    lastUpdated: '2026-02-12',
    tags: ['organic', 'eco', 'curves', 'natural']
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
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    price: 7.99,
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
    isPremium: true,
    isDefault: false,
    isFavorite: false,
    price: 7.99,
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
