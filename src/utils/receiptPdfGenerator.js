// src/utils/receiptPdfGenerator.js - FIXED VERSION
import jsPDF from 'jspdf';
import templateStorage, { getTemplateById } from './templateStorage';
import { resolveTemplateStyleVariant } from './templateStyleVariants';

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

const drawRoundedRect = (doc, x, y, width, height, radius, style) => {
  if (typeof doc.roundedRect === 'function') {
    doc.roundedRect(x, y, width, height, radius, radius, style);
    return;
  }
  if (typeof doc.roundRect === 'function') {
    doc.roundRect(x, y, width, height, radius, radius, style);
    return;
  }
  doc.rect(x, y, width, height, style);
};

const formatMoney = (amount, currency) => {
  const value = Number(amount || 0);
  const safeCurrency = currency || 'USD';
  return `${safeCurrency} ${value.toFixed(2)}`;
};

const toTitleCase = (value) => {
  if (!value) return '';
  return value
    .toString()
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1));
};

const applyReceiptDecorations = (doc, variant, palette, pageWidth, pageHeight) => {
  const primary = palette.primary;
  const secondary = palette.secondary;
  const accent = palette.accent;

  if (variant === 'classic') {
    return;
  }

  if (variant === 'panel') {
    doc.setFillColor(...primary);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setFillColor(...secondary);
    doc.rect(0, 28, pageWidth, 6, 'F');
    doc.setFillColor(...primary);
    doc.rect(0, pageHeight - 18, pageWidth * 0.42, 18, 'F');
    return;
  }

  if (variant === 'stripe') {
    const stripeWidth = 12;
    const stripeHeight = 24;
    let usePrimary = true;
    for (let x = -stripeWidth; x < pageWidth + stripeWidth; x += stripeWidth) {
      doc.setFillColor(...(usePrimary ? primary : secondary));
      doc.rect(x, 0, stripeWidth, stripeHeight, 'F');
      usePrimary = !usePrimary;
    }
    doc.setFillColor(...primary);
    doc.rect(0, pageHeight - 14, pageWidth, 14, 'F');
    doc.setFillColor(...secondary);
    doc.rect(pageWidth * 0.55, pageHeight - 28, pageWidth * 0.45, 14, 'F');
    return;
  }

  if (variant === 'angled') {
    doc.setFillColor(...primary);
    doc.triangle(0, 0, pageWidth * 0.65, 0, 0, 30, 'F');
    doc.setFillColor(...secondary);
    doc.triangle(pageWidth * 0.35, 0, pageWidth, 0, pageWidth, 22, 'F');
    doc.setFillColor(...primary);
    doc.triangle(pageWidth * 0.4, pageHeight, pageWidth, pageHeight, pageWidth, pageHeight - 24, 'F');
    return;
  }

  doc.setFillColor(...primary);
  doc.rect(0, 0, pageWidth, 26, 'F');
  doc.setFillColor(...secondary);
  doc.rect(0, 26, pageWidth, 6, 'F');
  doc.setFillColor(...accent);
  doc.circle(pageWidth * 0.75, 26, 24, 'F');
  doc.setFillColor(...primary);
  doc.rect(0, pageHeight - 18, pageWidth, 18, 'F');
  doc.setFillColor(...secondary);
  doc.rect(0, pageHeight - 26, pageWidth, 8, 'F');
  doc.setFillColor(...accent);
  doc.circle(pageWidth * 0.25, pageHeight - 18, 24, 'F');
};

export const generateReceiptPDF = (receiptData, accountInfo = {}, options = {}) => {
  const resolvedOptions = typeof options === 'string' ? { templateId: options } : (options || {});
  const resolvedTemplateId = resolveTemplateId(receiptData, resolvedOptions.templateId);
  const template = getTemplateById(resolvedTemplateId) || templateStorage.getDefaultTemplate() || {};
  const colors = template?.colors || {};
  const primaryColor = normalizeColor(colors.primary, [41, 128, 185]);
  const secondaryColor = normalizeColor(colors.secondary, primaryColor);
  const accentColor = normalizeColor(colors.accent, [236, 240, 241]);
  const textColor = normalizeColor(colors.text, [44, 62, 80]);
  const titleFont = resolveFont(template?.fonts?.title);
  const bodyFont = resolveFont(template?.fonts?.body);
  const templateVariant = resolveTemplateStyleVariant(resolvedTemplateId, template);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const headerOffset = templateVariant === 'classic' ? 0 : 12;
  let yPos = margin + headerOffset;

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

  applyReceiptDecorations(
    doc,
    templateVariant,
    {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor
    },
    pageWidth,
    pageHeight
  );

  const headerHeight = template?.layout?.showHeaderBorder ? 18 : 0;
  const contentWidth = pageWidth - margin * 2;
  const currency = receiptData.currency || accountInfo?.currency || 'USD';
  const receiptId = receiptData.receiptNumber || receiptData.id || '---';
  const receiptDate = receiptData.date || '';

  if (headerHeight) {
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(titleFont, 'bold');
    doc.setFontSize(12);
    doc.text(companyName, margin, 12);
    doc.text('RECEIPT', pageWidth - margin, 12, { align: 'right' });
    yPos = headerHeight + 10;
  } else {
    doc.setTextColor(...primaryColor);
    doc.setFont(titleFont, 'bold');
    doc.setFontSize(20);
    doc.text(companyName, margin, yPos);
    doc.setFontSize(16);
    doc.setTextColor(...secondaryColor);
    doc.text('RECEIPT', pageWidth - margin, yPos, { align: 'right' });
    yPos += 8;
  }

  doc.setFontSize(10);
  doc.setFont(bodyFont, 'normal');
  doc.setTextColor(...textColor);
  const headerLines = [
    contactLine,
    accountInfo?.address,
    locationLine,
    ...contactDetails
  ].filter(Boolean);
  headerLines.forEach((line) => {
    doc.text(line, margin, yPos);
    yPos += 5;
  });

  yPos += 2;
  const infoBarHeight = 10;
  doc.setFillColor(...accentColor);
  drawRoundedRect(doc, margin, yPos, contentWidth, infoBarHeight, 2, 'F');
  doc.setFont(bodyFont, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('Receipt #', margin + 4, yPos + 6);
  doc.setFont(bodyFont, 'normal');
  doc.setTextColor(...textColor);
  doc.text(String(receiptId), margin + 32, yPos + 6);
  doc.setFont(bodyFont, 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Date', pageWidth - margin - 48, yPos + 6);
  doc.setFont(bodyFont, 'normal');
  doc.setTextColor(...textColor);
  doc.text(receiptDate, pageWidth - margin - 4, yPos + 6, { align: 'right' });

  yPos += infoBarHeight + 8;

  const infoGap = 8;
  const boxWidth = (contentWidth - infoGap) / 2;
  const boxPaddingX = 6;
  const boxHeaderHeight = 6;
  const boxLineHeight = 5;

  const customerLines = [
    receiptData.customerName ? `Name: ${receiptData.customerName}` : '',
    receiptData.customerEmail ? `Email: ${receiptData.customerEmail}` : '',
    receiptData.customerPhone ? `Phone: ${receiptData.customerPhone}` : ''
  ].filter(Boolean);

  const paymentMethodLabel = toTitleCase(receiptData.paymentMethod || 'Cash');
  const paymentDetailsLine = receiptData.paymentMethodDetails ? `Details: ${receiptData.paymentMethodDetails}` : '';
  const paymentRefLine = receiptData.paymentReference ? `Reference: ${receiptData.paymentReference}` : '';
  const statusLine = receiptData.status ? `Status: ${toTitleCase(receiptData.status)}` : '';
  const amountPaidLine = receiptData.amountPaid != null ? `Paid: ${formatMoney(receiptData.amountPaid, currency)}` : '';
  const changeLine = Number(receiptData.change || 0) > 0 ? `Change: ${formatMoney(receiptData.change, currency)}` : '';
  const paymentLines = [
    `Method: ${paymentMethodLabel}`,
    paymentDetailsLine,
    paymentRefLine,
    statusLine,
    amountPaidLine,
    changeLine
  ].filter(Boolean);

  const buildBoxLines = (lines, maxWidth) => {
    const output = [];
    lines.forEach((line) => {
      const split = doc.splitTextToSize(line, maxWidth);
      output.push(...split);
    });
    return output;
  };

  const leftLines = buildBoxLines(
    customerLines.length ? customerLines : ['Walk-in Customer'],
    boxWidth - boxPaddingX * 2
  );
  const rightLines = buildBoxLines(paymentLines, boxWidth - boxPaddingX * 2);
  const maxLines = Math.max(leftLines.length, rightLines.length, 1);
  const boxHeight = boxHeaderHeight + 8 + maxLines * boxLineHeight;

  const drawInfoBox = (title, lines, x, y, width) => {
    doc.setFillColor(...accentColor);
    drawRoundedRect(doc, x, y, width, boxHeight, 3, 'F');
    doc.setFont(bodyFont, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text(title, x + boxPaddingX, y + 6);
    doc.setFont(bodyFont, 'normal');
    doc.setTextColor(...textColor);
    let lineY = y + boxHeaderHeight + 6;
    lines.forEach((line) => {
      doc.text(line, x + boxPaddingX, lineY);
      lineY += boxLineHeight;
    });
  };

  drawInfoBox('Customer', leftLines, margin, yPos, boxWidth);
  drawInfoBox('Payment', rightLines, margin + boxWidth + infoGap, yPos, boxWidth);

  yPos += boxHeight + 12;

  const ensureSpace = (requiredHeight) => {
    if (yPos + requiredHeight > pageHeight - margin - 18) {
      doc.addPage();
      yPos = margin + headerOffset;
    }
  };

  const tableX = margin;
  const tableWidth = contentWidth;
  const colQty = 16;
  const colPrice = 28;
  const colTotal = 30;
  const colDesc = tableWidth - (colQty + colPrice + colTotal);
  const headerRowHeight = 9;
  const rowPadding = 4;

  const drawTableHeader = () => {
    doc.setFillColor(...primaryColor);
    doc.rect(tableX, yPos, tableWidth, headerRowHeight, 'F');
    doc.setFont(bodyFont, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Description', tableX + rowPadding, yPos + 6);
    doc.text('Qty', tableX + colDesc + colQty / 2, yPos + 6, { align: 'center' });
    doc.text('Price', tableX + colDesc + colQty + colPrice / 2, yPos + 6, { align: 'center' });
    doc.text('Total', tableX + tableWidth - rowPadding, yPos + 6, { align: 'right' });
    yPos += headerRowHeight + 2;
    doc.setFont(bodyFont, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
  };

  drawTableHeader();

  const items = receiptData.items || [];
  items.forEach((item, index) => {
    const description = item.name || 'Item';
    const descLines = doc.splitTextToSize(description, colDesc - rowPadding * 2);
    const rowHeight = Math.max(8, descLines.length * 5 + 4);

    if (yPos + rowHeight > pageHeight - margin - 18) {
      doc.addPage();
      yPos = margin + headerOffset;
      drawTableHeader();
    }

    const rowFill = index % 2 === 0 ? [255, 255, 255] : accentColor;
    doc.setFillColor(...rowFill);
    doc.rect(tableX, yPos, tableWidth, rowHeight, 'F');

    const textY = yPos + 5;
    descLines.forEach((line, lineIndex) => {
      doc.text(line, tableX + rowPadding, textY + lineIndex * 5);
    });

    const quantity = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    const amount = quantity * price;
    doc.text(quantity.toString(), tableX + colDesc + colQty / 2, textY, { align: 'center' });
    doc.text(formatMoney(price, currency), tableX + colDesc + colQty + colPrice / 2, textY, { align: 'center' });
    doc.text(formatMoney(amount, currency), tableX + tableWidth - rowPadding, textY, { align: 'right' });

    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.2);
    doc.line(tableX, yPos + rowHeight, tableX + tableWidth, yPos + rowHeight);
    yPos += rowHeight;
  });

  yPos += 6;
  const subtotal = receiptData.subtotal || 0;
  const tax = receiptData.tax || 0;
  const total = receiptData.total || 0;

  const totalsLines = [
    { label: 'Subtotal', value: formatMoney(subtotal, currency) },
    { label: 'Tax', value: formatMoney(tax, currency) }
  ];
  if (receiptData.amountPaid != null) {
    totalsLines.push({ label: 'Paid', value: formatMoney(receiptData.amountPaid, currency) });
  }
  if (Number(receiptData.change || 0) > 0) {
    totalsLines.push({ label: 'Change', value: formatMoney(receiptData.change, currency) });
  }

  const totalsWidth = Math.min(92, tableWidth * 0.45);
  const totalsPadding = 6;
  const totalsLineHeight = 6;
  const totalRowHeight = 10;
  const totalsHeight = totalsPadding * 2 + totalsLines.length * totalsLineHeight + totalRowHeight;
  const totalsX = tableX + tableWidth - totalsWidth;

  ensureSpace(totalsHeight + 10);

  doc.setFillColor(...accentColor);
  drawRoundedRect(doc, totalsX, yPos, totalsWidth, totalsHeight, 3, 'F');
  doc.setFont(bodyFont, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textColor);

  let lineY = yPos + totalsPadding + 4;
  totalsLines.forEach((line) => {
    doc.text(line.label, totalsX + totalsPadding, lineY);
    doc.text(line.value, totalsX + totalsWidth - totalsPadding, lineY, { align: 'right' });
    lineY += totalsLineHeight;
  });

  const totalRowY = yPos + totalsHeight - totalRowHeight;
  doc.setFillColor(...primaryColor);
  doc.rect(totalsX, totalRowY, totalsWidth, totalRowHeight, 'F');
  doc.setFont(bodyFont, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Total', totalsX + totalsPadding, totalRowY + 6);
  doc.text(formatMoney(total, currency), totalsX + totalsWidth - totalsPadding, totalRowY + 6, { align: 'right' });

  yPos += totalsHeight + 10;

  // Notes
  if (receiptData.notes) {
    const notesPadding = 6;
    const notesWidth = contentWidth;
    const notesLines = doc.splitTextToSize(receiptData.notes, notesWidth - notesPadding * 2);
    const notesHeight = notesPadding * 2 + notesLines.length * 5 + 6;
    ensureSpace(notesHeight + 8);

    doc.setFillColor(...accentColor);
    drawRoundedRect(doc, margin, yPos, notesWidth, notesHeight, 3, 'F');
    doc.setFont(bodyFont, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text('Notes', margin + notesPadding, yPos + 6);

    doc.setFont(bodyFont, 'normal');
    doc.setTextColor(...textColor);
    let notesY = yPos + 12;
    notesLines.forEach((line) => {
      doc.text(line, margin + notesPadding, notesY);
      notesY += 5;
    });

    yPos += notesHeight + 12;
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
