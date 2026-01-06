// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';

// Template definitions
const templates = {
  standard: {
    id: 'standard',
    name: 'Standard',
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
      showWatermark: false, // Disabled watermark
      showHeaderBorder: true,
      showFooter: true
    }
  },
  modern: {
    id: 'modern',
    name: 'Modern',
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
      showWatermark: false, // Disabled watermark
      showHeaderBorder: false,
      showFooter: true
    }
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
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
      showWatermark: false, // Disabled watermark
      showHeaderBorder: false,
      showFooter: false
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
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
      showWatermark: false, // Disabled watermark
      showHeaderBorder: true,
      showFooter: true
    }
  },
  creative: {
    id: 'creative',
    name: 'Creative',
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
      showWatermark: false, // Disabled watermark
      showHeaderBorder: true,
      showFooter: true
    }
  }
};

// Get template by name or ID
const getTemplate = (templateId) => {
  return templates[templateId] || templates.standard;
};

// Draw header with template styling
const drawHeader = (doc, template, invoiceData, pageWidth, yPos) => {
  const { colors, fonts, layout } = template;
  const margin = 20;
  
  // Template-specific styling
  doc.setFont(fonts.title, 'bold');
  doc.setFontSize(template.id === 'modern' ? 28 : 24);
  doc.setTextColor(...colors.primary);
  
  // Center-aligned title for modern and creative templates
  if (['modern', 'creative'].includes(template.id)) {
    doc.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });
    yPos += template.id === 'modern' ? 20 : 15;
  } else {
    doc.text('INVOICE', margin, yPos);
    yPos += 15;
  }
  
  // Draw border for certain templates
  if (layout.showHeaderBorder) {
    doc.setDrawColor(...colors.primary);
    doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
    yPos += 10;
  }
  
  return yPos;
};

// Draw company info with template styling
const drawCompanyInfo = (doc, template, pageWidth, yPos) => {
  const { colors, fonts } = template;
  const margin = 20;
  
  doc.setFont(fonts.body, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  
  if (template.layout.showLogo) {
    // Draw a simple logo placeholder
    doc.setFillColor(...colors.primary);
    doc.roundedRect(margin, yPos, 40, 15, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('LOGO', margin + 20, yPos + 9, { align: 'center' });
    doc.setTextColor(...colors.text);
    
    // Company info next to logo
    doc.text('Your Company Name', margin + 50, yPos + 5);
    doc.text('123 Business Street', margin + 50, yPos + 10);
    doc.text('City, State ZIP', margin + 50, yPos + 15);
    doc.text('contact@company.com', margin + 50, yPos + 20);
    yPos += 25;
  } else {
    // Simple company info
    doc.setFont(fonts.body, 'bold');
    doc.text('Your Company Name', margin, yPos);
    doc.setFont(fonts.body, 'normal');
    doc.text('123 Business Street, City, State ZIP', margin, yPos + 5);
    doc.text('contact@company.com | (123) 456-7890', margin, yPos + 10);
    yPos += 15;
  }
  
  return yPos;
};

// Draw customer info with template styling
const drawCustomerInfo = (doc, template, invoiceData, pageWidth, yPos) => {
  const { colors, fonts } = template;
  const margin = 20;
  
  // Bill To section
  doc.setFont(fonts.body, 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('BILL TO:', margin, yPos);
  
  doc.setFont(fonts.body, 'normal');
  doc.setTextColor(...colors.text);
  doc.text(invoiceData.customer?.name || 'Customer Name', margin, yPos + 5);
  doc.text(invoiceData.customer?.address || 'Customer Address', margin, yPos + 10);
  doc.text(invoiceData.customer?.email || 'customer@email.com', margin, yPos + 15);
  doc.text(invoiceData.customer?.phone || 'Phone: N/A', margin, yPos + 20);
  
  // Invoice details on the right
  const detailsX = pageWidth - 100;
  doc.setFont(fonts.body, 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('INVOICE DETAILS', detailsX, yPos);
  
  doc.setFont(fonts.body, 'normal');
  doc.setTextColor(...colors.text);
  doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, detailsX, yPos + 5);
  doc.text(`Date: ${new Date(invoiceData.issueDate).toLocaleDateString()}`, detailsX, yPos + 10);
  doc.text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`, detailsX, yPos + 15);
  doc.text(`Terms: ${invoiceData.paymentTerms || 'Net 30'}`, detailsX, yPos + 20);
  
  return yPos + 25;
};

// Draw line items table with template styling
const drawLineItems = (doc, template, invoiceData, pageWidth, yPos) => {
  const { colors, fonts, layout } = template;
  const margin = 20;
  const tableWidth = pageWidth - 2 * margin;
  
  // Table header
  doc.setFillColor(...colors.primary);
  doc.roundedRect(margin, yPos, tableWidth, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont(fonts.body, 'bold');
  doc.setFontSize(10);
  
  // Column positions
  const col1 = margin + 5;
  const col2 = margin + 110;
  const col3 = margin + 130;
  const col4 = margin + 155;
  const col5 = pageWidth - margin - 25;
  
  doc.text('Description', col1, yPos + 7);
  doc.text('Qty', col2, yPos + 7);
  doc.text('Rate', col3, yPos + 7);
  doc.text('Tax', col4, yPos + 7);
  doc.text('Amount', col5, yPos + 7, { align: 'right' });
  
  yPos += 10;
  
  // Line items
  doc.setFont(fonts.body, 'normal');
  doc.setFontSize(9);
  
  invoiceData.lineItems.forEach((item, index) => {
    // Alternate row colors for certain templates
    if (['standard', 'professional'].includes(template.id) && index % 2 === 0) {
      doc.setFillColor(...colors.accent);
      doc.rect(margin, yPos, tableWidth, 10, 'F');
    }
    
    // Set text color based on template
    if (template.id === 'creative') {
      doc.setTextColor(...colors.text);
    } else {
      doc.setTextColor(0, 0, 0);
    }
    
    // Draw row border for certain templates
    if (['standard', 'professional'].includes(template.id)) {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos + 10, pageWidth - margin, yPos + 10);
    }
    
    // Item description
    const description = item.description || 'Item';
    const maxDescWidth = 80;
    let descLines = doc.splitTextToSize(description, maxDescWidth);
    
    if (descLines.length > 1) {
      doc.text(descLines[0], col1, yPos + 7);
      doc.text(descLines.slice(1).join(' '), col1, yPos + 14);
      yPos += 7;
    } else {
      doc.text(description, col1, yPos + 7);
    }
    
    // Quantity
    doc.text(item.quantity.toString(), col2, yPos + 7);
    
    // Rate
    doc.text(`${invoiceData.currency} ${item.rate.toFixed(2)}`, col3, yPos + 7);
    
    // Tax
    doc.text(`${item.tax}%`, col4, yPos + 7);
    
    // Amount
    doc.text(`${invoiceData.currency} ${item.amount.toFixed(2)}`, col5, yPos + 7, { align: 'right' });
    
    yPos += 10;
  });
  
  return yPos;
};

// Draw totals section with template styling
const drawTotals = (doc, template, invoiceData, pageWidth, yPos) => {
  const { colors, fonts } = template;
  const margin = 20;
  
  // Totals section
  yPos += 10;
  
  // Subtotal
  doc.setFont(fonts.body, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  doc.text('Subtotal:', pageWidth - margin - 100, yPos);
  doc.text(`${invoiceData.currency} ${invoiceData.subtotal.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });
  
  yPos += 8;
  
  // Tax
  doc.text('Tax:', pageWidth - margin - 100, yPos);
  doc.text(`${invoiceData.currency} ${invoiceData.totalTax.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });
  
  yPos += 12;
  
  // Total separator
  doc.setDrawColor(...colors.primary);
  doc.line(pageWidth - margin - 100, yPos - 2, pageWidth - margin, yPos - 2);
  
  // Total
  doc.setFont(fonts.body, 'bold');
  doc.setFontSize(template.id === 'creative' ? 16 : 14);
  doc.setTextColor(...colors.primary);
  doc.text('TOTAL:', pageWidth - margin - 100, yPos + 5);
  doc.text(`${invoiceData.currency} ${invoiceData.totalAmount.toFixed(2)}`, pageWidth - margin - 5, yPos + 5, { align: 'right' });
  
  return yPos + 10;
};

// Draw notes and terms with template styling
const drawNotesAndTerms = (doc, template, invoiceData, pageWidth, yPos) => {
  const { colors, fonts } = template;
  const margin = 20;
  
  // Notes
  if (invoiceData.notes) {
    yPos += 20;
    doc.setFont(fonts.accent, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.text('Notes:', margin, yPos);
    
    doc.setFont(fonts.body, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.text);
    const notesLines = doc.splitTextToSize(invoiceData.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPos + 6);
    yPos += notesLines.length * 5 + 10;
  }
  
  // Terms
  if (invoiceData.terms) {
    yPos += 10;
    doc.setFont(fonts.accent, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.text('Terms & Conditions:', margin, yPos);
    
    doc.setFont(fonts.body, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.text);
    const termsLines = doc.splitTextToSize(invoiceData.terms, pageWidth - 2 * margin);
    doc.text(termsLines, margin, yPos + 6);
  }
  
  return yPos;
};

// Draw footer with template styling
const drawFooter = (doc, template, pageWidth, pageHeight) => {
  const { colors, fonts, layout } = template;
  
  if (layout.showFooter) {
    doc.setFont(fonts.body, 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...colors.text);
    
    // Footer text varies by template
    let footerText = 'Thank you for your business!';
    if (template.id === 'modern') {
      footerText = 'Generated with Ledgerly Invoice System';
    } else if (template.id === 'creative') {
      footerText = '✨ Thank you for choosing us! ✨';
    } else if (template.id === 'professional') {
      footerText = 'Professional Invoice | Ledgerly';
    }
    
    doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
    
    // Add page number for certain templates
    if (['professional', 'standard'].includes(template.id)) {
      doc.text(`Page 1 of 1`, pageWidth - 20, pageHeight - 15, { align: 'right' });
    }
  }
};

// Add watermark for specific templates (disabled by default)
const addWatermark = (doc, template, pageWidth, pageHeight) => {
  const { colors, layout } = template;
  
  if (layout.showWatermark) {
    // Only add if explicitly enabled and make it very subtle
    doc.setTextColor(...colors.primary, 0.03); // Very, very transparent (almost invisible)
    doc.setFontSize(40); // Smaller size
    doc.setFont('helvetica', 'bold');
    doc.text(template.name.toUpperCase(), pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45
    });
    doc.setTextColor(0, 0, 0); // Reset text color
  }
  // If showWatermark is false, don't add any watermark
};

// Main PDF generator function
export const generateInvoicePDF = (invoiceData, templateId = 'standard') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPos = margin;
  
  // Get template configuration
  const template = getTemplate(templateId);
  
  // Draw all sections with template styling (skip watermark)
  yPos = drawHeader(doc, template, invoiceData, pageWidth, yPos);
  yPos = drawCompanyInfo(doc, template, pageWidth, yPos);
  yPos = drawCustomerInfo(doc, template, invoiceData, pageWidth, yPos);
  yPos = drawLineItems(doc, template, invoiceData, pageWidth, yPos);
  yPos = drawTotals(doc, template, invoiceData, pageWidth, yPos);
  yPos = drawNotesAndTerms(doc, template, invoiceData, pageWidth, yPos);
  
  // Draw footer
  drawFooter(doc, template, pageWidth, pageHeight);
  
  return doc;
};

// Helper function to generate PDF with a specific template
export const generatePDFWithTemplate = (invoiceData, templateName) => {
  return generateInvoicePDF(invoiceData, templateName);
};

// Function to get template list
export const getAvailableTemplates = () => {
  return Object.keys(templates).map(templateId => ({
    id: templateId,
    name: templates[templateId].name,
    colors: templates[templateId].colors,
    description: `${templates[templateId].name} template`,
    isDefault: templateId === 'standard'
  }));
};

// Export templates for use in other files
export { templates };