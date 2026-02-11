// src/utils/receiptPdfGenerator.js - FIXED VERSION
import jsPDF from 'jspdf';
import templateStorage, { getTemplateById } from './templateStorage';

const RECEIPT_TEMPLATE_STORAGE_KEY = 'receipt_template_preference';

export const getReceiptTemplatePreference = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(RECEIPT_TEMPLATE_STORAGE_KEY);
  } catch (error) {
    return null;
  }
};

export const setReceiptTemplatePreference = (templateId) => {
  if (typeof window === 'undefined') return;
  try {
    if (templateId) {
      localStorage.setItem(RECEIPT_TEMPLATE_STORAGE_KEY, templateId);
    } else {
      localStorage.removeItem(RECEIPT_TEMPLATE_STORAGE_KEY);
    }
  } catch (error) {
    // Ignore storage errors (private mode, etc.)
  }
};

const normalizeColor = (value, fallback) => {
  if (Array.isArray(value) && value.length === 3) {
    return value;
  }
  return fallback;
};

const resolveTemplateId = (receiptData, templateId) => {
  return (
    templateId ||
    receiptData?.templateStyle ||
    receiptData?.templateId ||
    receiptData?.metadata?.templateStyle ||
    getReceiptTemplatePreference() ||
    templateStorage.getDefaultTemplate()?.id ||
    'standard'
  );
};

const resolveTemplate = (receiptData, templateId) => {
  const resolvedId = resolveTemplateId(receiptData, templateId);
  return getTemplateById(resolvedId) || templateStorage.getDefaultTemplate() || {};
};

const resolveFont = (fontName) => {
  const normalized = (fontName || '').toLowerCase();
  if (normalized.includes('times') || normalized.includes('garamond') || normalized.includes('georgia')) {
    return 'times';
  }
  if (normalized.includes('courier')) {
    return 'courier';
  }
  return 'helvetica';
};

export const generateReceiptPDF = (receiptData, accountInfo = {}, options = {}) => {
  const resolvedOptions = typeof options === 'string' ? { templateId: options } : (options || {});
  const template = resolveTemplate(receiptData, resolvedOptions.templateId);
  const colors = template?.colors || {};
  const primaryColor = normalizeColor(colors.primary, [41, 128, 185]);
  const secondaryColor = normalizeColor(colors.secondary, primaryColor);
  const accentColor = normalizeColor(colors.accent, [236, 240, 241]);
  const textColor = normalizeColor(colors.text, [44, 62, 80]);
  const titleFont = resolveFont(template?.fonts?.title);
  const bodyFont = resolveFont(template?.fonts?.body);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPos = margin;

  // Store info
  const companyName = accountInfo?.companyName || 'Ledgerly';
  const contactLine = accountInfo?.contactName ? `Contact: ${accountInfo.contactName}` : '';
  const locationParts = [
    accountInfo?.city,
    accountInfo?.state,
    accountInfo?.zipCode
  ].filter(Boolean);
  if (accountInfo?.country && !locationParts.includes(accountInfo.country)) {
    locationParts.push(accountInfo.country);
  }
  const locationLine = locationParts.join(', ');
  const contactDetails = [
    accountInfo?.phone ? `Tel: ${accountInfo.phone}` : '',
    accountInfo?.email || '',
    accountInfo?.website || ''
  ].filter(Boolean);

  // Optional watermark for premium templates
  if (template?.layout?.showWatermark && template?.layout?.watermarkText) {
    doc.setFont(titleFont, 'bold');
    doc.setFontSize(40);
    doc.setTextColor(230, 230, 230);
    doc.text(template.layout.watermarkText, pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 35
    });
    doc.setTextColor(...textColor);
  }

  const headerHeight = template?.layout?.showHeaderBorder ? 18 : 0;

  if (headerHeight) {
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(titleFont, 'bold');
    doc.setFontSize(14);
    doc.text(companyName, pageWidth / 2, 12, { align: 'center' });
    yPos = headerHeight + 8;
  } else {
    doc.setTextColor(...primaryColor);
    doc.setFont(titleFont, 'bold');
    doc.setFontSize(24);
    doc.text(companyName, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
  }
  
  doc.setFontSize(11);
  doc.setFont(bodyFont, 'normal');
  doc.setTextColor(...textColor);
  const headerLines = [
    contactLine,
    accountInfo?.address,
    locationLine,
    ...contactDetails
  ].filter(Boolean);
  yPos += 8;
  headerLines.forEach((line) => {
    doc.text(line, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
  });

  // Separator
  yPos += 8;
  doc.setLineWidth(0.5);
  doc.setDrawColor(...secondaryColor);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Receipt info
  doc.setFont(bodyFont, 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(`Receipt #: ${receiptData.id}`, margin, yPos);
  doc.text(`Date: ${receiptData.date}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 8;
  
  // Customer info
  if (receiptData.customerName) {
    doc.setTextColor(...textColor);
    doc.text('Customer:', margin, yPos);
    doc.setFont(bodyFont, 'normal');
    doc.text(receiptData.customerName, margin + 25, yPos);
    yPos += 8;
  }
  
  // Email
  if (receiptData.customerEmail) {
    doc.setFont(bodyFont, 'bold');
    doc.setTextColor(...textColor);
    doc.text('Email:', margin, yPos);
    doc.setFont(bodyFont, 'normal');
    doc.text(receiptData.customerEmail, margin + 20, yPos);
    yPos += 8;
  }
  
  // Payment method
  doc.setFont(bodyFont, 'bold');
  doc.text('Payment Method:', margin, yPos);
  doc.setFont(bodyFont, 'normal');
  
  let paymentText = receiptData.paymentMethod || 'Cash';
  if (receiptData.paymentMethodDetails) {
    paymentText += ` (${receiptData.paymentMethodDetails})`;
  }
  
  const paymentLines = doc.splitTextToSize(paymentText, 70);
  if (paymentLines.length > 1) {
    doc.text(paymentLines[0], margin + 42, yPos);
    doc.text(paymentLines[1], margin + 42, yPos + 5);
    yPos += 13;
  } else {
    doc.text(paymentText, margin + 42, yPos);
    yPos += 8;
  }

  // Separator
  yPos += 8;
  doc.setLineWidth(0.5);
  doc.setDrawColor(...secondaryColor);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 12;

  // Items header
  doc.setFont(bodyFont, 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Description', margin, yPos);
  doc.text('Qty', margin + 110, yPos);
  doc.text('Price', margin + 130, yPos);
  doc.text('Amount', pageWidth - margin, yPos, { align: 'right' });
  
  // Items
  yPos += 8;
  doc.setFont(bodyFont, 'normal');
  doc.setTextColor(...textColor);
  doc.setLineWidth(0.1);
  
  const items = receiptData.items || [];
  const currency = receiptData.currency || accountInfo?.currency || 'USD';
  items.forEach((item, index) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
      
      // Redraw header on new page
      doc.setFont(bodyFont, 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Description', margin, yPos);
      doc.text('Qty', margin + 110, yPos);
      doc.text('Price', margin + 130, yPos);
      doc.text('Amount', pageWidth - margin, yPos, { align: 'right' });
      yPos += 8;
      doc.setFont(bodyFont, 'normal');
      doc.setTextColor(...textColor);
    }
    
    // Item description
    const description = item.name || 'Item';
    const descLines = doc.splitTextToSize(description, 60);
    
    let itemStartY = yPos;
    
    if (descLines.length > 1) {
      doc.text(descLines[0], margin, yPos);
      doc.text(descLines.slice(1).join(' '), margin, yPos + 5);
      yPos += 10; // Extra space for multi-line description
    } else {
      doc.text(description, margin, yPos);
      yPos += 8;
    }
    
    const quantity = item.quantity || 1;
    const price = item.price || 0;
    const amount = quantity * price;
    
    // Align quantity, price, and amount with the start of the item description
    doc.text(quantity.toString(), margin + 110, itemStartY);
    doc.text(`${currency} ${price.toFixed(2)}`, margin + 130, itemStartY);
    doc.text(`${currency} ${amount.toFixed(2)}`, pageWidth - margin, itemStartY, { align: 'right' });
    
    // Draw line between items
    if (index < items.length - 1) {
      yPos += 2;
      doc.setLineWidth(0.1);
      doc.setDrawColor(...accentColor);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 6;
    }
  });

  // Separator
  yPos += 10;
  doc.setLineWidth(0.5);
  doc.setDrawColor(...secondaryColor);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 12;

  // Totals
  doc.setFont(bodyFont, 'normal');
  doc.setTextColor(...textColor);
  const subtotal = receiptData.subtotal || 0;
  const tax = receiptData.tax || 0;
  const total = receiptData.total || 0;
  
  doc.text('Subtotal:', pageWidth - margin - 80, yPos);
  doc.text(`${currency} ${subtotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 8;
  doc.text('Tax (8.5%):', pageWidth - margin - 80, yPos);
  doc.text(`${currency} ${tax.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 12;
  doc.setFont(bodyFont, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text('TOTAL:', pageWidth - margin - 80, yPos);
  doc.text(`${currency} ${total.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });

  // Notes
  if (receiptData.notes) {
    yPos += 20;
    doc.setFontSize(10);
    doc.setFont(bodyFont, 'bold');
    doc.setTextColor(...textColor);
    doc.text('Notes:', margin, yPos);
    
    doc.setFont(bodyFont, 'normal');
    const notesLines = doc.splitTextToSize(receiptData.notes, pageWidth - 2 * margin);
    
    let notesY = yPos + 5;
    notesLines.forEach(line => {
      if (notesY > 280) {
        doc.addPage();
        notesY = margin;
      }
      doc.setTextColor(...textColor);
      doc.text(line, margin, notesY);
      notesY += 5;
    });
  }

  // Footer
  yPos = Math.max(yPos + 20, doc.internal.pageSize.height - 20);
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  
  if (yPos < doc.internal.pageSize.height - 30) {
    doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
    yPos += 3;
    doc.text('Thank you for your purchase!', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('Please retain this receipt for your records', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text(`Generated by ${companyName}`, pageWidth / 2, yPos, { align: 'center' });
    if (accountInfo?.website) {
      yPos += 5;
      doc.text(accountInfo.website, pageWidth / 2, yPos, { align: 'center' });
    }
  }

  return doc;
};
