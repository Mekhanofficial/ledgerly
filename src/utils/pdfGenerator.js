// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Font definitions for premium templates
const registerCustomFonts = (doc) => {
  // These would be actual font files in a production app
  // For now, we'll use built-in fonts but simulate premium fonts
  try {
    // Add custom font placeholder
    doc.addFont('https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.woff2', 'Roboto', 'normal');
    doc.addFont('https://fonts.gstatic.com/s/garamond/v16/ykokB-wEsa8lBmT7Y5S4yHk.woff2', 'Garamond', 'normal');
    doc.addFont('https://fonts.gstatic.com/s/georgia/v17/nuFkD-vsZ_5C5v7O1pFJxLc.woff2', 'Georgia', 'normal');
  } catch (error) {
    console.log('Custom fonts not available, using default fonts');
  }
};

// Premium template definitions with enhanced features
const premiumTemplates = {
  luxury: {
    id: 'luxury',
    name: 'Luxury',
    colors: {
      primary: [184, 134, 11], // Gold
      secondary: [160, 124, 44],
      accent: [255, 245, 230], // Ivory
      background: [253, 251, 247],
      text: [33, 33, 33],
      border: [212, 175, 55]
    },
    fonts: {
      title: 'times-bold',
      subtitle: 'times-italic',
      body: 'helvetica',
      accent: 'helvetica-oblique',
      numbers: 'courier-bold'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'PREMIUM',
      showHeaderBorder: true,
      showFooter: true,
      hasBackgroundPattern: true,
      pattern: 'diagonal',
      borderStyle: 'gold',
      headerStyle: 'gradient',
      hasGoldAccents: true
    },
    effects: {
      gradientHeader: true,
      shadowEffects: true,
      decorativeBorders: true,
      patternedBackground: true
    }
  },
  corporatePro: {
    id: 'corporatePro',
    name: 'Corporate Pro',
    colors: {
      primary: [13, 71, 161], // Corporate Blue
      secondary: [21, 101, 192],
      accent: [240, 248, 255], // Alice Blue
      background: [255, 255, 255],
      text: [38, 50, 56],
      border: [176, 190, 197]
    },
    fonts: {
      title: 'helvetica-bold',
      subtitle: 'helvetica',
      body: 'helvetica',
      accent: 'helvetica-light',
      numbers: 'courier'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'PROFESSIONAL',
      showHeaderBorder: true,
      showFooter: true,
      hasDataTables: true,
      hasMultiLanguage: true,
      headerStyle: 'corporate',
      showCompanySeal: true
    },
    effects: {
      dataTableStripes: true,
      corporateBorders: true,
      professionalSpacing: true,
      clearHierarchy: true
    }
  },
  creativeStudio: {
    id: 'creativeStudio',
    name: 'Creative Studio',
    colors: {
      primary: [233, 30, 99], // Pink
      secondary: [216, 27, 96],
      accent: [255, 245, 247],
      background: [255, 255, 255],
      text: [33, 33, 33],
      border: [255, 182, 193]
    },
    fonts: {
      title: 'helvetica-bold',
      subtitle: 'courier',
      body: 'helvetica',
      accent: 'helvetica-oblique',
      numbers: 'courier-bold'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'CREATIVE',
      showHeaderBorder: false,
      showFooter: true,
      hasInteractiveElements: true,
      asymmetricLayout: true,
      creativeSpacing: true
    },
    effects: {
      colorAccents: true,
      creativeBorders: true,
      dynamicLayout: true,
      visualInterest: true
    }
  },
  techModern: {
    id: 'techModern',
    name: 'Tech Modern',
    colors: {
      primary: [0, 188, 212], // Cyan
      secondary: [0, 151, 167],
      accent: [224, 247, 250],
      background: [250, 250, 250],
      text: [38, 50, 56],
      border: [128, 203, 196]
    },
    fonts: {
      title: 'helvetica-bold',
      subtitle: 'roboto',
      body: 'helvetica',
      accent: 'helvetica-light',
      numbers: 'courier'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'TECH',
      showHeaderBorder: true,
      showFooter: true,
      hasGradientEffects: true,
      hasDarkMode: true,
      modernLayout: true,
      techElements: true
    },
    effects: {
      gradientEffects: true,
      techPatterns: true,
      modernSpacing: true,
      cleanLines: true
    }
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    colors: {
      primary: [121, 85, 72], // Brown
      secondary: [141, 110, 99],
      accent: [250, 250, 249],
      background: [255, 253, 250],
      text: [66, 66, 66],
      border: [188, 170, 164]
    },
    fonts: {
      title: 'garamond',
      subtitle: 'georgia',
      body: 'georgia',
      accent: 'helvetica-light',
      numbers: 'times'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'ELEGANT',
      showHeaderBorder: true,
      showFooter: true,
      hasPremiumTypography: true,
      refinedSpacing: true,
      classicLayout: true
    },
    effects: {
      subtleShadows: true,
      elegantBorders: true,
      refinedTypography: true,
      classicDesign: true
    }
  },
  startup: {
    id: 'startup',
    name: 'Startup',
    colors: {
      primary: [76, 175, 80], // Green
      secondary: [56, 142, 60],
      accent: [232, 245, 233],
      background: [255, 255, 255],
      text: [33, 33, 33],
      border: [165, 214, 167]
    },
    fonts: {
      title: 'helvetica-bold',
      subtitle: 'helvetica',
      body: 'helvetica',
      accent: 'helvetica-light',
      numbers: 'courier'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'STARTUP',
      showHeaderBorder: false,
      showFooter: true,
      hasGrowthMetrics: true,
      modernLayout: true,
      vibrantDesign: true
    },
    effects: {
      vibrantColors: true,
      modernElements: true,
      dynamicLayout: true,
      growthVisuals: true
    }
  },
  consultant: {
    id: 'consultant',
    name: 'Consultant',
    colors: {
      primary: [45, 108, 223],
      secondary: [63, 123, 236],
      accent: [236, 244, 255],
      background: [255, 255, 255],
      text: [38, 50, 56],
      border: [191, 210, 245]
    },
    fonts: {
      title: 'helvetica-bold',
      subtitle: 'helvetica',
      body: 'helvetica',
      accent: 'helvetica-light',
      numbers: 'courier'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'CONSULTANT',
      showHeaderBorder: true,
      showFooter: true,
      hasDataTables: true,
      headerStyle: 'corporate'
    },
    effects: {
      professionalSpacing: true,
      cleanLines: true,
      dataTableStripes: true
    }
  },
  retail: {
    id: 'retail',
    name: 'Retail',
    colors: {
      primary: [244, 81, 30],
      secondary: [255, 152, 0],
      accent: [255, 248, 225],
      background: [255, 255, 255],
      text: [55, 71, 79],
      border: [255, 204, 128]
    },
    fonts: {
      title: 'helvetica-bold',
      subtitle: 'helvetica',
      body: 'helvetica',
      accent: 'helvetica-light',
      numbers: 'courier'
    },
    layout: {
      showLogo: true,
      showWatermark: true,
      watermarkText: 'RETAIL',
      showHeaderBorder: true,
      showFooter: true,
      hasGradientEffects: true,
      modernLayout: true
    },
    effects: {
      vibrantColors: true,
      modernElements: true,
      dynamicLayout: true
    }
  }
};

// Basic (Free) Templates
const basicTemplates = {
  standard: {
    id: 'standard',
    name: 'Standard',
    colors: {
      primary: [41, 128, 185], // Blue
      secondary: [52, 152, 219],
      accent: [236, 240, 241],
      background: [255, 255, 255],
      text: [44, 62, 80],
      border: [189, 195, 199]
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
    effects: {}
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      primary: [52, 73, 94], // Dark gray
      secondary: [127, 140, 141],
      accent: [236, 240, 241],
      background: [255, 255, 255],
      text: [44, 62, 80],
      border: [189, 195, 199]
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
    effects: {}
  }
};

// Industry Templates
const industryTemplates = {
  medical: {
    id: 'medical',
    name: 'Medical',
    colors: {
      primary: [3, 155, 229], // Medical Blue
      secondary: [2, 136, 209],
      accent: [232, 244, 253],
      background: [255, 255, 255],
      text: [33, 33, 33],
      border: [144, 202, 249]
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
      medicalIcons: true
    },
    effects: {
      cleanMedical: true
    }
  },
  legal: {
    id: 'legal',
    name: 'Legal',
    colors: {
      primary: [56, 142, 60], // Legal Green
      secondary: [67, 160, 71],
      accent: [241, 248, 233],
      background: [255, 255, 255],
      text: [33, 33, 33],
      border: [165, 214, 167]
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
      formalLayout: true
    },
    effects: {
      formalDesign: true
    }
  }
};

// Merge all templates
const allTemplates = {
  ...basicTemplates,
  ...premiumTemplates,
  ...industryTemplates
};

// Get template by ID
const getTemplate = (templateId) => {
  return allTemplates[templateId] || basicTemplates.standard;
};

// Draw premium header with effects
const drawPremiumHeader = (doc, template, pageWidth, yPos) => {
  const { colors, layout, effects, name } = template;
  const margin = 20;
  let currentY = yPos;

  // Premium header background
  if (effects.gradientHeader) {
    // Draw gradient background for premium templates
    const gradientHeight = 60;
    doc.setFillColor(...colors.primary);
    doc.rect(margin, currentY, pageWidth - 2 * margin, gradientHeight, 'F');
    
    // Add gradient effect (simulated)
    doc.setFillColor(...colors.secondary);
    doc.rect(margin, currentY + gradientHeight - 10, pageWidth - 2 * margin, 10, 'F');
    
    currentY += 5;
  }

  // Premium title styling
  doc.setFont(template.fonts.title || 'helvetica', 'bold');
  doc.setFontSize(template.id === 'luxury' ? 32 : 28);
  doc.setTextColor(255, 255, 255);
  
  // Center title for premium templates
  doc.text('INVOICE', pageWidth / 2, currentY + 20, { align: 'center' });
  
  // Add subtitle for premium templates
  doc.setFontSize(12);
  doc.setFont(template.fonts.subtitle || 'helvetica', 'italic');
  doc.text('Professional Invoice Document', pageWidth / 2, currentY + 30, { align: 'center' });
  
  currentY += 50;

  // Decorative border for premium templates
  if (effects.decorativeBorders) {
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(1);
    
    if (template.id === 'luxury') {
      // Gold border for luxury template
      doc.setLineWidth(2);
      doc.setDrawColor(212, 175, 55);
      doc.line(margin, currentY - 10, pageWidth - margin, currentY - 10);
      doc.setDrawColor(184, 134, 11);
      doc.setLineWidth(1);
      doc.line(margin, currentY - 8, pageWidth - margin, currentY - 8);
    } else if (template.id === 'corporatePro') {
      // Double border for corporate
      doc.line(margin, currentY - 10, pageWidth - margin, currentY - 10);
      doc.line(margin, currentY - 8, pageWidth - margin, currentY - 8);
    }
    
    currentY += 5;
  }

  return currentY;
};

// Draw premium company info
const drawPremiumCompanyInfo = (doc, template, pageWidth, yPos, companyData) => {
  const { colors, layout, effects } = template;
  const margin = 20;
  let currentY = yPos;

  // Premium logo area
  if (layout.showLogo) {
    // Draw logo placeholder with premium styling
    const logoSize = 40;
    
    if (template.id === 'luxury') {
      // Gold circle for luxury
      doc.setFillColor(255, 215, 0);
      doc.circle(margin + logoSize/2, currentY + logoSize/2, logoSize/2, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text('LOGO', margin + logoSize/2, currentY + logoSize/2, { align: 'center' });
    } else if (template.id === 'creativeStudio') {
      // Creative square
      doc.setFillColor(...colors.primary);
      doc.roundedRect(margin, currentY, logoSize, logoSize, 5, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('CS', margin + logoSize/2, currentY + logoSize/2, { align: 'center' });
    } else {
      // Standard logo
      doc.setFillColor(...colors.primary);
      doc.roundedRect(margin, currentY, logoSize, logoSize, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('LOGO', margin + logoSize/2, currentY + logoSize/2, { align: 'center' });
    }
    
    // Company info next to logo
    const infoX = margin + logoSize + 10;
    doc.setFont(template.fonts.body || 'helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...colors.text);
    doc.text(companyData.name || 'Your Company Name', infoX, currentY + 5);
    
    doc.setFont(template.fonts.body || 'helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(companyData.address || '123 Business Street', infoX, currentY + 12);
    doc.text(companyData.cityStateZip || 'City, State ZIP', infoX, currentY + 19);
    doc.text(companyData.email || 'contact@company.com', infoX, currentY + 26);
    doc.text(companyData.phone || '(123) 456-7890', infoX, currentY + 33);
    
    currentY += logoSize + 10;
  } else {
    // Simple company info without logo
    doc.setFont(template.fonts.body || 'helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...colors.text);
    doc.text(companyData.name || 'Your Company Name', margin, currentY);
    
    doc.setFont(template.fonts.body || 'helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(companyData.address || '123 Business Street', margin, currentY + 7);
    doc.text(companyData.cityStateZip || 'City, State ZIP', margin, currentY + 14);
    doc.text(companyData.email || 'contact@company.com', margin, currentY + 21);
    doc.text(companyData.phone || '(123) 456-7890', margin, currentY + 28);
    
    currentY += 35;
  }

  return currentY;
};

// Draw premium customer info
const drawPremiumCustomerInfo = (doc, template, invoiceData, pageWidth, yPos) => {
  const { colors, layout } = template;
  const margin = 20;
  let currentY = yPos;

  // Bill To section with premium styling
  doc.setFont(template.fonts.body || 'helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.primary);
  
  // Draw colored background for section header
  if (template.id === 'corporatePro' || template.id === 'luxury') {
    doc.setFillColor(...colors.accent);
    doc.roundedRect(margin, currentY, 200, 15, 3, 3, 'F');
    doc.setTextColor(...colors.primary);
    doc.text('BILL TO:', margin + 5, currentY + 10);
  } else {
    doc.text('BILL TO:', margin, currentY + 5);
  }
  
  currentY += 10;

  // Customer details
  doc.setFont(template.fonts.body || 'helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  
  const customer = invoiceData.customer || {};
  doc.text(customer.name || 'Customer Name', margin, currentY + 5);
  doc.text(customer.address || 'Customer Address', margin, currentY + 12);
  doc.text(customer.email || 'customer@email.com', margin, currentY + 19);
  doc.text(customer.phone || 'Phone: N/A', margin, currentY + 26);
  
  // Invoice details on the right with premium styling
  const detailsX = pageWidth - 120;
  
  if (template.id === 'corporatePro' || template.id === 'luxury') {
    doc.setFillColor(...colors.accent);
    doc.roundedRect(detailsX - 5, yPos, 125, 80, 3, 3, 'F');
  }
  
  doc.setFont(template.fonts.body || 'helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.primary);
  doc.text('INVOICE DETAILS', detailsX, yPos + 10);
  
  doc.setFont(template.fonts.body || 'helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  
  const details = [
    { label: 'Invoice #:', value: invoiceData.invoiceNumber || 'INV-001' },
    { label: 'Date:', value: new Date(invoiceData.issueDate || Date.now()).toLocaleDateString() },
    { label: 'Due Date:', value: new Date(invoiceData.dueDate || Date.now() + 30*24*60*60*1000).toLocaleDateString() },
    { label: 'Terms:', value: invoiceData.paymentTerms || 'Net 30' },
    { label: 'PO Number:', value: invoiceData.poNumber || 'N/A' }
  ];
  
  details.forEach((detail, index) => {
    doc.text(detail.label, detailsX, yPos + 20 + (index * 12));
    doc.text(detail.value, detailsX + 50, yPos + 20 + (index * 12));
  });

  return Math.max(currentY + 30, yPos + 85);
};

// Draw premium line items table
const drawPremiumLineItems = (doc, template, invoiceData, pageWidth, yPos) => {
  const { colors, layout, effects } = template;
  const margin = 20;
  const tableWidth = pageWidth - 2 * margin;
  let currentY = yPos;

  // Premium table header
  doc.setFillColor(...colors.primary);
  doc.roundedRect(margin, currentY, tableWidth, 15, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont(template.fonts.body || 'helvetica', 'bold');
  doc.setFontSize(10);

  // Column positions
  const columns = {
    description: margin + 5,
    quantity: margin + 130,
    rate: margin + 155,
    tax: margin + 185,
    amount: pageWidth - margin - 25
  };

  // Headers
  doc.text('Description', columns.description, currentY + 10);
  doc.text('Qty', columns.quantity, currentY + 10);
  doc.text('Rate', columns.rate, currentY + 10);
  doc.text('Tax %', columns.tax, currentY + 10);
  doc.text('Amount', columns.amount, currentY + 10, { align: 'right' });

  currentY += 15;

  // Line items with premium styling
  doc.setFont(template.fonts.body || 'helvetica', 'normal');
  doc.setFontSize(9);
  
  const lineItems = invoiceData.lineItems || [];
  lineItems.forEach((item, index) => {
    // Alternate row colors for premium templates
    if (effects.dataTableStripes && index % 2 === 0) {
      doc.setFillColor(...colors.accent);
      doc.rect(margin, currentY, tableWidth, 12, 'F');
    }
    
    // Set text color
    doc.setTextColor(...colors.text);
    
    // Item description (with multi-line support)
    const description = item.description || 'Item';
    const maxDescWidth = 100;
    let descLines = doc.splitTextToSize(description, maxDescWidth);
    
    if (descLines.length > 1) {
      doc.text(descLines[0], columns.description, currentY + 8);
      doc.text(descLines.slice(1).join(' '), columns.description, currentY + 15);
      currentY += 7;
    } else {
      doc.text(description, columns.description, currentY + 8);
    }
    
    // Quantity
    doc.text(item.quantity?.toString() || '1', columns.quantity, currentY + 8);
    
    // Rate with currency
    const rate = item.rate || 0;
    doc.text(`${invoiceData.currency || 'USD'} ${rate.toFixed(2)}`, columns.rate, currentY + 8);
    
    // Tax percentage
    const tax = item.tax || 0;
    doc.text(`${tax}%`, columns.tax, currentY + 8);
    
    // Amount with currency
    const amount = item.amount || rate * (item.quantity || 1);
    doc.text(`${invoiceData.currency || 'USD'} ${amount.toFixed(2)}`, columns.amount, currentY + 8, { align: 'right' });
    
    // Draw subtle border between rows for premium templates
    if (effects.cleanLines) {
      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.2);
      doc.line(margin, currentY + 12, pageWidth - margin, currentY + 12);
    }
    
    currentY += 12;
  });

  return currentY;
};

// Draw premium totals section
const drawPremiumTotals = (doc, template, invoiceData, pageWidth, yPos) => {
  const { colors, layout, effects } = template;
  const margin = 20;
  let currentY = yPos + 20;

  // Totals section with premium styling
  const totalsWidth = 200;
  const totalsX = pageWidth - margin - totalsWidth;

  // Background for totals section
  if (template.id === 'luxury' || template.id === 'corporatePro') {
    doc.setFillColor(...colors.accent);
    doc.roundedRect(totalsX - 10, currentY - 10, totalsWidth + 20, 120, 5, 5, 'F');
  }

  // Subtotal
  doc.setFont(template.fonts.body || 'helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  doc.text('Subtotal:', totalsX, currentY);
  doc.text(`${invoiceData.currency || 'USD'} ${(invoiceData.subtotal || 0).toFixed(2)}`, totalsX + 150, currentY, { align: 'right' });
  
  currentY += 10;

  // Discount
  if (invoiceData.discount && invoiceData.discount > 0) {
    doc.text('Discount:', totalsX, currentY);
    doc.text(`${invoiceData.currency || 'USD'} ${invoiceData.discount.toFixed(2)}`, totalsX + 150, currentY, { align: 'right' });
    currentY += 10;
  }

  // Tax
  doc.text('Tax:', totalsX, currentY);
  doc.text(`${invoiceData.currency || 'USD'} ${(invoiceData.totalTax || 0).toFixed(2)}`, totalsX + 150, currentY, { align: 'right' });
  
  currentY += 15;

  // Separator line with premium styling
  doc.setDrawColor(...colors.primary);
  if (template.id === 'luxury') {
    doc.setLineWidth(2);
    doc.line(totalsX, currentY, totalsX + totalsWidth, currentY);
    doc.setLineWidth(1);
    doc.setDrawColor(212, 175, 55);
    doc.line(totalsX, currentY + 1, totalsX + totalsWidth, currentY + 1);
  } else {
    doc.setLineWidth(1);
    doc.line(totalsX, currentY, totalsX + totalsWidth, currentY);
  }
  
  currentY += 10;

  // Total with premium styling
  doc.setFont(template.fonts.body || 'helvetica', 'bold');
  doc.setFontSize(template.id === 'luxury' ? 18 : 16);
  doc.setTextColor(...colors.primary);
  doc.text('TOTAL:', totalsX, currentY + 5);
  
  // Special styling for luxury template
  if (template.id === 'luxury') {
    doc.setFontSize(20);
    doc.setTextColor(184, 134, 11);
  }
  
  doc.text(`${invoiceData.currency || 'USD'} ${(invoiceData.totalAmount || 0).toFixed(2)}`, totalsX + 150, currentY + 5, { align: 'right' });

  return currentY + 20;
};

// Draw premium notes and terms
const drawPremiumNotesAndTerms = (doc, template, invoiceData, pageWidth, yPos) => {
  const { colors, layout } = template;
  const margin = 20;
  let currentY = yPos + 20;

  // Notes section with premium styling
  if (invoiceData.notes) {
    doc.setFont(template.fonts.accent || template.fonts.body, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    
    // Section header with background for premium
    if (template.id === 'corporatePro') {
      doc.setFillColor(...colors.accent);
      doc.roundedRect(margin, currentY - 5, 50, 8, 2, 2, 'F');
      doc.setTextColor(...colors.primary);
      doc.text('Notes:', margin + 5, currentY);
    } else {
      doc.text('Notes:', margin, currentY);
    }
    
    currentY += 10;
    
    doc.setFont(template.fonts.body || 'helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.text);
    
    const notesLines = doc.splitTextToSize(invoiceData.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, currentY);
    
    currentY += notesLines.length * 5 + 15;
  }

  // Terms section with premium styling
  if (invoiceData.terms) {
    doc.setFont(template.fonts.accent || template.fonts.body, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    
    // Section header with background for premium
    if (template.id === 'corporatePro') {
      doc.setFillColor(...colors.accent);
      doc.roundedRect(margin, currentY - 5, 120, 8, 2, 2, 'F');
      doc.setTextColor(...colors.primary);
      doc.text('Terms & Conditions:', margin + 5, currentY);
    } else {
      doc.text('Terms & Conditions:', margin, currentY);
    }
    
    currentY += 10;
    
    doc.setFont(template.fonts.body || 'helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.text);
    
    const termsLines = doc.splitTextToSize(invoiceData.terms, pageWidth - 2 * margin);
    doc.text(termsLines, margin, currentY);
    
    currentY += termsLines.length * 4 + 10;
  }

  // Payment instructions for premium templates
  if (template.id === 'corporatePro' || template.id === 'luxury') {
    currentY += 10;
    
    doc.setFont(template.fonts.accent || template.fonts.body, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.text('Payment Instructions:', margin, currentY);
    
    currentY += 8;
    
    doc.setFont(template.fonts.body || 'helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.text);
    
    const paymentInstructions = [
      'Bank Transfer: Account # 123456789',
      'PayPal: pay@company.com',
      'Credit Card: Visa/MasterCard/American Express',
      'Check: Payable to Your Company Name'
    ];
    
    paymentInstructions.forEach((instruction, index) => {
      doc.text(`• ${instruction}`, margin, currentY + (index * 6));
    });
    
    currentY += paymentInstructions.length * 6 + 10;
  }

  return currentY;
};

// Draw premium footer
const drawPremiumFooter = (doc, template, pageWidth, pageHeight, companyData) => {
  const { colors, layout, name } = template;
  const margin = 20;

  if (layout.showFooter) {
    // Decorative top border for footer
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);

    // Footer content
    doc.setFont(template.fonts.body || 'helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...colors.text);

    // Footer text varies by template
    let footerText = '';
    let contactText = '';
    let legalText = '';

    switch (template.id) {
      case 'luxury':
        footerText = 'Thank you for choosing our premium services';
        contactText = 'Premium Support: support@company.com | Phone: (123) 456-7890';
        legalText = '© 2024 Your Company Name. All rights reserved.';
        break;
      case 'corporatePro':
        footerText = 'Generated with Corporate Pro Invoice System';
        contactText = 'Accounts Department: accounts@company.com | Phone: (123) 456-7890';
        legalText = 'Confidential and Proprietary Information';
        break;
      case 'creativeStudio':
        footerText = '✨ Creative Invoice | Made with Passion ✨';
        contactText = 'hello@creative-studio.com | www.creative-studio.com';
        legalText = 'Creative Commons License';
        break;
      case 'techModern':
        footerText = 'Tech Invoice System v2.0 | Secure & Modern';
        contactText = 'tech@company.com | API Docs: api.company.com';
        legalText = 'Encrypted and Secure Transmission';
        break;
      case 'elegant':
        footerText = 'Elegant Solutions for Discerning Clients';
        contactText = 'By Appointment Only | enquiries@company.com';
        legalText = 'Established 2024';
        break;
      case 'startup':
        footerText = 'Innovating the Future of Business';
        contactText = 'hello@startup.com | www.ourstartup.com';
        legalText = 'Startup Invoice System Beta v1.0';
        break;
      default:
        footerText = 'Thank you for your business!';
        contactText = 'contact@company.com | (123) 456-7890';
        legalText = '© 2024 Your Company Name';
    }

    // Draw footer texts
    doc.text(footerText, pageWidth / 2, pageHeight - 30, { align: 'center' });
    doc.text(contactText, pageWidth / 2, pageHeight - 25, { align: 'center' });
    doc.text(legalText, pageWidth / 2, pageHeight - 20, { align: 'center' });

    // Add page number for premium templates
    if (['corporatePro', 'luxury', 'elegant'].includes(template.id)) {
      doc.text(`Page 1 of 1`, pageWidth - margin, pageHeight - 20, { align: 'right' });
      doc.text(template.name, margin, pageHeight - 20);
    }
  }
};

// Add premium watermark
const addPremiumWatermark = (doc, template, pageWidth, pageHeight) => {
  const { colors, layout } = template;

  if (layout.showWatermark && layout.watermarkText) {
    // Premium watermark styling
    doc.setTextColor(...colors.primary, 0.05); // Very subtle
    doc.setFontSize(40);
    
    // Different watermark styles based on template
    switch (template.id) {
      case 'luxury':
        doc.setFont('times-bold');
        doc.text(layout.watermarkText, pageWidth / 2, pageHeight / 2, {
          align: 'center',
          angle: 45
        });
        // Add secondary watermark
        doc.setTextColor(212, 175, 55, 0.03);
        doc.setFontSize(30);
        doc.text('PREMIUM', pageWidth / 2, pageHeight / 2 + 60, {
          align: 'center',
          angle: -45
        });
        break;
      case 'corporatePro':
        doc.setFont('helvetica-bold');
        doc.text(layout.watermarkText, pageWidth / 2, pageHeight / 2, {
          align: 'center',
          angle: 0
        });
        break;
      case 'creativeStudio':
        doc.setFont('helvetica-bold');
        for (let i = 0; i < 3; i++) {
          doc.text(layout.watermarkText, pageWidth / 2, pageHeight / 2 + (i * 40), {
            align: 'center',
            angle: i * 30
          });
        }
        break;
      case 'techModern':
        doc.setFont('helvetica-bold');
        // Create a grid of watermarks
        for (let x = 100; x < pageWidth; x += 200) {
          for (let y = 100; y < pageHeight; y += 150) {
            doc.text(layout.watermarkText, x, y, {
              align: 'center',
              angle: 30
            });
          }
        }
        break;
      default:
        doc.setFont('helvetica-bold');
        doc.text(layout.watermarkText, pageWidth / 2, pageHeight / 2, {
          align: 'center',
          angle: 45
        });
    }

    // Reset text color
    doc.setTextColor(0, 0, 0);
  }
};

// Add background pattern for premium templates
const addBackgroundPattern = (doc, template, pageWidth, pageHeight) => {
  const { colors, layout } = template;

  if (layout.hasBackgroundPattern) {
    // Save current state
    const originalDrawColor = doc.getDrawColor();
    
    // Set pattern color (very subtle)
    doc.setDrawColor(...colors.border, 0.02);
    doc.setLineWidth(0.1);

    switch (layout.pattern) {
      case 'diagonal':
        // Diagonal lines pattern
        for (let i = -pageHeight; i < pageWidth + pageHeight; i += 20) {
          doc.line(i, 0, i + pageHeight, pageHeight);
        }
        break;
      case 'grid':
        // Grid pattern
        for (let x = 0; x < pageWidth; x += 50) {
          doc.line(x, 0, x, pageHeight);
        }
        for (let y = 0; y < pageHeight; y += 50) {
          doc.line(0, y, pageWidth, y);
        }
        break;
      case 'dots':
        // Dots pattern
        for (let x = 20; x < pageWidth; x += 40) {
          for (let y = 20; y < pageHeight; y += 40) {
            doc.circle(x, y, 0.5, 'F');
          }
        }
        break;
    }

    // Restore original draw color
    doc.setDrawColor(originalDrawColor);
  }
};

// Generate QR code for premium templates (placeholder)
const addQRCode = (doc, template, pageWidth, pageHeight, invoiceData) => {
  if (['corporatePro', 'techModern', 'startup'].includes(template.id)) {
    const qrSize = 40;
    const qrX = pageWidth - 50;
    const qrY = pageHeight - 50;

    // Draw QR code placeholder
    doc.setFillColor(0, 0, 0);
    doc.rect(qrX, qrY, qrSize, qrSize, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.text('QR', qrX + qrSize/2, qrY + qrSize/2, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(6);
    doc.text('Scan for payment', qrX + qrSize/2, qrY + qrSize + 5, { align: 'center' });
  }
};

// Generate security features for premium templates
const addSecurityFeatures = (doc, template, pageWidth, pageHeight) => {
  if (template.id === 'luxury' || template.id === 'corporatePro') {
    // Add subtle security background pattern
    doc.setDrawColor(200, 200, 200, 0.03);
    doc.setLineWidth(0.1);
    
    // Micro-text border
    for (let i = 0; i < pageWidth; i += 5) {
      doc.line(i, 0, i, 3);
      doc.line(i, pageHeight - 3, i, pageHeight);
    }
    for (let i = 0; i < pageHeight; i += 5) {
      doc.line(0, i, 3, i);
      doc.line(pageWidth - 3, i, pageWidth, i);
    }
    
    // Add "SECURE DOCUMENT" text around borders
    doc.setTextColor(200, 200, 200, 0.1);
    doc.setFontSize(6);
    
    // Top border
    for (let x = 50; x < pageWidth; x += 100) {
      doc.text('SECURE', x, 10);
    }
    
    // Bottom border
    for (let x = 50; x < pageWidth; x += 100) {
      doc.text('DOCUMENT', x, pageHeight - 10);
    }
    
    doc.setTextColor(0, 0, 0);
  }
};

// Main PDF generator function with premium support
export const generateInvoicePDF = (invoiceData, templateId = 'standard', companyData = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Register custom fonts
  registerCustomFonts(doc);
  
  // Get template configuration
  const template = getTemplate(templateId);
  let yPos = 20;

  // Add background pattern for premium templates
  addBackgroundPattern(doc, template, pageWidth, pageHeight);
  
  // Add watermark for premium templates
  addPremiumWatermark(doc, template, pageWidth, pageHeight);
  
  // Add security features for premium templates
  addSecurityFeatures(doc, template, pageWidth, pageHeight);

  // Draw sections based on template type
  if (template.isPremium) {
    // Premium template flow
    yPos = drawPremiumHeader(doc, template, pageWidth, yPos);
    yPos = drawPremiumCompanyInfo(doc, template, pageWidth, yPos, companyData);
    yPos = drawPremiumCustomerInfo(doc, template, invoiceData, pageWidth, yPos);
    yPos = drawPremiumLineItems(doc, template, invoiceData, pageWidth, yPos);
    yPos = drawPremiumTotals(doc, template, invoiceData, pageWidth, yPos);
    yPos = drawPremiumNotesAndTerms(doc, template, invoiceData, pageWidth, yPos);
    drawPremiumFooter(doc, template, pageWidth, pageHeight, companyData);
    
    // Add QR code for modern templates
    addQRCode(doc, template, pageWidth, pageHeight, invoiceData);
  } else {
    // Basic template flow (simplified version)
    yPos = drawBasicHeader(doc, template, pageWidth, yPos);
    yPos = drawBasicCompanyInfo(doc, template, pageWidth, yPos, companyData);
    yPos = drawBasicCustomerInfo(doc, template, invoiceData, pageWidth, yPos);
    yPos = drawBasicLineItems(doc, template, invoiceData, pageWidth, yPos);
    yPos = drawBasicTotals(doc, template, invoiceData, pageWidth, yPos);
    yPos = drawBasicNotesAndTerms(doc, template, invoiceData, pageWidth, yPos);
    drawBasicFooter(doc, template, pageWidth, pageHeight);
  }

  return doc;
};

// Basic template drawing functions (simplified)
const drawBasicHeader = (doc, template, pageWidth, yPos) => {
  const margin = 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...template.colors.primary);
  doc.text('INVOICE', margin, yPos);
  return yPos + 15;
};

const drawBasicCompanyInfo = (doc, template, pageWidth, yPos, companyData) => {
  const margin = 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...template.colors.text);
  doc.text(companyData.name || 'Your Company Name', margin, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(companyData.address || '123 Business Street', margin, yPos + 7);
  doc.text(companyData.cityStateZip || 'City, State ZIP', margin, yPos + 14);
  doc.text(companyData.email || 'contact@company.com', margin, yPos + 21);
  
  return yPos + 28;
};

const drawBasicCustomerInfo = (doc, template, invoiceData, pageWidth, yPos) => {
  const margin = 20;
  const customer = invoiceData.customer || {};
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...template.colors.primary);
  doc.text('BILL TO:', margin, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...template.colors.text);
  doc.text(customer.name || 'Customer Name', margin, yPos + 7);
  doc.text(customer.address || 'Customer Address', margin, yPos + 14);
  
  // Invoice details
  const detailsX = pageWidth - 100;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...template.colors.primary);
  doc.text('INVOICE DETAILS', detailsX, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...template.colors.text);
  doc.text(`Invoice #: ${invoiceData.invoiceNumber || 'INV-001'}`, detailsX, yPos + 7);
  doc.text(`Date: ${new Date(invoiceData.issueDate || Date.now()).toLocaleDateString()}`, detailsX, yPos + 14);
  
  return yPos + 25;
};

const drawBasicLineItems = (doc, template, invoiceData, pageWidth, yPos) => {
  const margin = 20;
  const tableWidth = pageWidth - 2 * margin;
  
  // Table header
  doc.setFillColor(...template.colors.primary);
  doc.rect(margin, yPos, tableWidth, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  
  doc.text('Description', margin + 5, yPos + 7);
  doc.text('Amount', pageWidth - margin - 25, yPos + 7, { align: 'right' });
  
  yPos += 10;
  
  // Line items
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...template.colors.text);
  
  const lineItems = invoiceData.lineItems || [];
  lineItems.forEach((item) => {
    const description = item.description || 'Item';
    const amount = item.amount || 0;
    
    doc.text(description, margin + 5, yPos + 7);
    doc.text(`${invoiceData.currency || 'USD'} ${amount.toFixed(2)}`, pageWidth - margin - 5, yPos + 7, { align: 'right' });
    
    yPos += 10;
  });
  
  return yPos;
};

const drawBasicTotals = (doc, template, invoiceData, pageWidth, yPos) => {
  const margin = 20;
  const totalsX = pageWidth - margin - 150;
  
  yPos += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...template.colors.text);
  
  doc.text('Subtotal:', totalsX, yPos);
  doc.text(`${invoiceData.currency || 'USD'} ${(invoiceData.subtotal || 0).toFixed(2)}`, totalsX + 100, yPos, { align: 'right' });
  
  yPos += 8;
  
  doc.text('Tax:', totalsX, yPos);
  doc.text(`${invoiceData.currency || 'USD'} ${(invoiceData.totalTax || 0).toFixed(2)}`, totalsX + 100, yPos, { align: 'right' });
  
  yPos += 12;
  
  doc.setDrawColor(...template.colors.primary);
  doc.line(totalsX, yPos, totalsX + 100, yPos);
  
  yPos += 10;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...template.colors.primary);
  
  doc.text('TOTAL:', totalsX, yPos);
  doc.text(`${invoiceData.currency || 'USD'} ${(invoiceData.totalAmount || 0).toFixed(2)}`, totalsX + 100, yPos, { align: 'right' });
  
  return yPos + 20;
};

const drawBasicNotesAndTerms = (doc, template, invoiceData, pageWidth, yPos) => {
  const margin = 20;
  
  if (invoiceData.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...template.colors.primary);
    doc.text('Notes:', margin, yPos);
    
    yPos += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...template.colors.text);
    
    const notesLines = doc.splitTextToSize(invoiceData.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPos);
    
    yPos += notesLines.length * 5 + 15;
  }
  
  return yPos;
};

const drawBasicFooter = (doc, template, pageWidth, pageHeight) => {
  if (template.layout.showFooter) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...template.colors.text);
    doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 15, { align: 'center' });
  }
};

// Helper function to generate PDF with a specific template
export const generatePDFWithTemplate = (invoiceData, templateId, companyData) => {
  return generateInvoicePDF(invoiceData, templateId, companyData);
};

// Function to get template list
export const getAvailableTemplates = () => {
  return Object.values(allTemplates).map(template => ({
    id: template.id,
    name: template.name,
    colors: template.colors,
    description: template.description || `${template.name} template`,
    category: template.isPremium ? 'premium' : template.category || 'basic',
    isPremium: template.isPremium || false,
    price: template.price || 0,
    features: template.features || [],
    previewColor: getPreviewColor(template.id),
    layout: template.layout
  }));
};

// Get preview color for template
const getPreviewColor = (templateId) => {
  const colors = {
    standard: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    minimal: 'bg-gradient-to-br from-gray-700 to-gray-900',
    luxury: 'bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600',
    corporatePro: 'bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800',
    creativeStudio: 'bg-gradient-to-br from-pink-600 via-rose-500 to-pink-700',
    techModern: 'bg-gradient-to-br from-cyan-500 via-teal-500 to-green-500',
    elegant: 'bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900',
    startup: 'bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600',
    consultant: 'bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-700',
    retail: 'bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600',
    medical: 'bg-gradient-to-br from-blue-400 to-cyan-400',
    legal: 'bg-gradient-to-br from-emerald-400 to-green-400'
  };
  
  return colors[templateId] || 'bg-gradient-to-br from-primary-500 to-primary-600';
};

// Function to check if template requires premium access
export const isTemplatePremium = (templateId) => {
  const template = allTemplates[templateId];
  return template ? template.isPremium || false : false;
};

// Function to get template price
export const getTemplatePrice = (templateId) => {
  const template = allTemplates[templateId];
  return template ? template.price || 0 : 0;
};

// Function to generate template preview image (placeholder)
export const generateTemplatePreview = (templateId, size = 'medium') => {
  const template = getTemplate(templateId);
  const sizes = {
    small: { width: 200, height: 150 },
    medium: { width: 300, height: 225 },
    large: { width: 400, height: 300 }
  };
  
  const { width, height } = sizes[size] || sizes.medium;
  
  // In a real app, this would generate an actual preview image
  // For now, return a data URL with colored background
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `rgb(${template.colors.primary.join(',')})`);
  gradient.addColorStop(1, `rgb(${template.colors.secondary.join(',')})`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add template name
  ctx.fillStyle = 'white';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(template.name, width / 2, height / 2);
  
  if (template.isPremium) {
    ctx.font = '14px Arial';
    ctx.fillText('PREMIUM', width / 2, height / 2 + 30);
  }
  
  return canvas.toDataURL();
};

// Export templates for use in other files
export { allTemplates as templates, premiumTemplates, basicTemplates, industryTemplates };
