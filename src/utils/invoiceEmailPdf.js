import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import templateStorage from './templateStorage';
import { resolveTemplateStyleVariant } from './templateStyleVariants';
import { getBusinessLogoUrl, getWatermarkFooterText, shouldShowWatermark } from './brandingPlan';

const DEFAULT_CONTENT_TYPE = 'application/pdf';
const DEFAULT_ENCODING = 'base64';
const BASE64_CHUNK_SIZE = 0x8000;
const MIN_MEANINGFUL_PDF_BYTES = 2048;
const HTML2CANVAS_SCALE = 1.5;
const HTML_RENDER_TIMEOUT_MS = 15000;
const MIN_BREAK_MARGIN_PX = 14;
const MIN_SEGMENT_HEIGHT_PX = 120;

const TEMPLATE_COLOR_FALLBACK = {
  primary: '#2980b9',
  secondary: '#3498db',
  accent: '#f8f9fa',
  text: '#2c3e50'
};

const toSafeString = (value) => String(value || '').trim();
const normalizeTemplateStyle = (value) => toSafeString(value).toLowerCase();

const toFiniteNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toCssColor = (colorValue, fallback) => {
  if (Array.isArray(colorValue) && colorValue.length === 3) {
    return `rgb(${colorValue[0]}, ${colorValue[1]}, ${colorValue[2]})`;
  }
  return colorValue || fallback;
};

const sanitizeFileName = (value, fallback = 'invoice.pdf') => {
  const candidate = toSafeString(value).replace(/[<>:"/\\|?*]/g, '');
  if (!candidate) return fallback;
  return candidate.toLowerCase().endsWith('.pdf') ? candidate : `${candidate}.pdf`;
};

const withTimeout = (promise, timeoutMs, label) => {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return promise;

  let timerId;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = window.setTimeout(() => {
      reject(new Error(label || 'Operation timed out'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timerId) {
      window.clearTimeout(timerId);
    }
  });
};

const isMobileBrowser = () => {
  if (typeof navigator === 'undefined') return false;
  const userAgent = String(navigator.userAgent || '').toLowerCase();
  return /android|iphone|ipad|ipod|mobile|iemobile|opera mini/.test(userAgent);
};

const arrayBufferToBase64 = (buffer) => {
  if (!(buffer instanceof ArrayBuffer)) return '';
  if (typeof window === 'undefined' || typeof window.btoa !== 'function') return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += BASE64_CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + BASE64_CHUNK_SIZE);
    binary += String.fromCharCode(...chunk);
  }
  return window.btoa(binary);
};

const resolveInvoiceFileName = (invoiceData = {}, fallbackId = '') => {
  const invoiceNumber = toSafeString(invoiceData.invoiceNumber || invoiceData.number);
  const id = toSafeString(invoiceData.id || invoiceData._id || fallbackId);
  if (invoiceNumber) return `invoice-${invoiceNumber}.pdf`;
  if (id) return `invoice-${id}.pdf`;
  return 'invoice.pdf';
};

const resolveTemplateColors = (templateId) => {
  const template = templateStorage.getTemplate(templateId) || templateStorage.getTemplate('standard');
  const palette = template?.colors || {};
  return {
    primary: toCssColor(palette.primary, TEMPLATE_COLOR_FALLBACK.primary),
    secondary: toCssColor(palette.secondary, TEMPLATE_COLOR_FALLBACK.secondary),
    accent: toCssColor(palette.accent, TEMPLATE_COLOR_FALLBACK.accent),
    text: toCssColor(palette.text, TEMPLATE_COLOR_FALLBACK.text)
  };
};

const resolveTemplateId = (value) => {
  const candidate = toSafeString(value);
  if (!candidate) return 'standard';
  if (templateStorage.getTemplate(candidate)) return candidate;

  const allTemplates = typeof templateStorage.getAllTemplates === 'function'
    ? templateStorage.getAllTemplates()
    : [];
  const normalizedCandidate = normalizeTemplateStyle(candidate);
  const matched = allTemplates.find((template) =>
    normalizeTemplateStyle(template?.id) === normalizedCandidate
    || normalizeTemplateStyle(template?.templateStyle) === normalizedCandidate
  );
  return matched?.id || candidate;
};

const buildTemplateDecorations = (variant, colors) => {
  const primary = colors.primary;
  const secondary = colors.secondary;
  const accent = colors.accent;

  if (variant === 'classic') {
    return { headerHtml: '', footerHtml: '', paddingTop: 40, paddingBottom: 40 };
  }

  if (variant === 'panel') {
    const headerHeight = 120;
    const footerHeight = 70;
    const headerHtml = `
      <div style="position:absolute; top:0; left:0; width:100%; height:${headerHeight}px; background: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%); z-index:1;"></div>
      <svg viewBox="0 0 100 25" preserveAspectRatio="none" style="position:absolute; top:${headerHeight - 35}px; left:0; width:100%; height:35px; z-index:1;">
        <path d="M0,0 H100 V12 Q70,25 0,18 Z" fill="${accent}" />
      </svg>
    `;
    const footerHtml = `
      <div style="position:absolute; bottom:0; left:0; width:42%; height:${footerHeight}px; background:${primary}; z-index:1;"></div>
    `;
    return { headerHtml, footerHtml, paddingTop: 110, paddingBottom: 70 };
  }

  if (variant === 'stripe') {
    const headerHeight = 95;
    const footerHeight = 60;
    const headerHtml = `
      <div style="position:absolute; top:0; left:0; width:100%; height:${headerHeight}px; background: repeating-linear-gradient(135deg, ${primary} 0, ${primary} 14px, ${secondary} 14px, ${secondary} 28px); z-index:1;"></div>
    `;
    const footerHtml = `
      <div style="position:absolute; bottom:0; right:0; width:70%; height:${footerHeight}px; background: linear-gradient(135deg, ${secondary} 0%, ${primary} 100%); z-index:1;"></div>
      <div style="position:absolute; bottom:0; left:0; width:30%; height:${footerHeight - 12}px; background:${primary}; transform: skewX(-18deg); transform-origin: left bottom; z-index:1;"></div>
    `;
    return { headerHtml, footerHtml, paddingTop: 100, paddingBottom: 65 };
  }

  if (variant === 'angled') {
    const headerHeight = 105;
    const footerHeight = 70;
    const headerHtml = `
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" style="position:absolute; top:0; left:0; width:100%; height:${headerHeight}px; z-index:1;">
        <polygon points="0,0 100,0 68,30 0,30" fill="${primary}" />
        <polygon points="36,0 100,0 100,22 62,22" fill="${secondary}" />
      </svg>
    `;
    const footerHtml = `
      <svg viewBox="0 0 100 24" preserveAspectRatio="none" style="position:absolute; bottom:0; left:0; width:100%; height:${footerHeight}px; z-index:1;">
        <polygon points="0,24 100,24 100,0 48,24" fill="${primary}" />
        <polygon points="0,24 70,0 0,0" fill="${secondary}" opacity="0.9" />
      </svg>
    `;
    return { headerHtml, footerHtml, paddingTop: 95, paddingBottom: 70 };
  }

  const headerHeight = 110;
  const footerHeight = 80;
  const headerHtml = `
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" style="position:absolute; top:0; left:0; width:100%; height:${headerHeight}px; z-index:1;">
      <path d="M0,0 H100 V18 Q70,30 0,22 Z" fill="${primary}" />
      <path d="M0,0 H100 V14 Q70,26 0,20 Z" fill="${secondary}" opacity="0.9" />
    </svg>
  `;
  const footerHtml = `
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" style="position:absolute; bottom:0; left:0; width:100%; height:${footerHeight}px; z-index:1;">
      <path d="M0,30 H100 V12 Q70,2 0,10 Z" fill="${primary}" opacity="0.95" />
      <path d="M0,30 H100 V18 Q70,8 0,14 Z" fill="${secondary}" opacity="0.85" />
    </svg>
  `;
  return { headerHtml, footerHtml, paddingTop: 95, paddingBottom: 70 };
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatDisplayDate = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString();
};

const normalizeLineItems = (invoiceData = {}) => {
  const fromLineItems = Array.isArray(invoiceData.lineItems) ? invoiceData.lineItems : [];
  const fromItems = Array.isArray(invoiceData.items) ? invoiceData.items : [];
  const source = fromLineItems.length > 0 ? fromLineItems : fromItems;

  return source.map((item, index) => {
    const quantity = toFiniteNumber(item.quantity ?? item.qty, 1);
    const rate = toFiniteNumber(item.rate ?? item.unitPrice ?? item.price, 0);
    const amount = toFiniteNumber(item.amount ?? item.total, quantity * rate);
    const tax = toFiniteNumber(item.tax ?? item.taxRate, 0);
    return {
      id: item.id || item._id || index,
      description: toSafeString(item.description || item.name || 'Item'),
      quantity,
      rate,
      tax,
      amount,
      sku: toSafeString(item.sku)
    };
  });
};

const resolveCompanyInfo = (companyData = {}) => {
  const locationPieces = [
    companyData?.city,
    companyData?.state,
    companyData?.zipCode
  ].filter(Boolean);
  const cityLine = locationPieces.length > 0 ? locationPieces.join(', ') : '';
  const companyLines = [
    companyData?.address,
    cityLine,
    companyData?.country
  ].filter(Boolean);
  const contactDetailsList = [
    companyData?.email,
    companyData?.phone,
    companyData?.website
  ].filter(Boolean);

  return {
    companyName: companyData?.companyName || companyData?.name || 'Your Business',
    contactTitle: companyData?.contactName ? `Attn: ${companyData.contactName}` : '',
    logoUrl: getBusinessLogoUrl(companyData),
    companyLinesHtml: companyLines.map((line) => `<div>${escapeHtml(line)}</div>`).join(''),
    contactDetailsHtml: contactDetailsList.map((line) => `<div>${escapeHtml(line)}</div>`).join('')
  };
};

const resolveCustomerInfo = (invoiceData = {}) => {
  if (invoiceData.customer && typeof invoiceData.customer === 'object') {
    return invoiceData.customer;
  }

  return {
    name: invoiceData.customerName || '',
    email: invoiceData.customerEmail || '',
    phone: invoiceData.customerPhone || '',
    address: invoiceData.customerAddress || ''
  };
};

const parseHexColor = (value) => {
  const hex = String(value || '').trim().replace('#', '');
  if (!hex) return null;
  if (hex.length === 3) {
    const expanded = hex.split('').map((char) => `${char}${char}`).join('');
    return [
      Number.parseInt(expanded.slice(0, 2), 16),
      Number.parseInt(expanded.slice(2, 4), 16),
      Number.parseInt(expanded.slice(4, 6), 16)
    ];
  }
  if (hex.length === 6) {
    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16)
    ];
  }
  return null;
};

const parseRgbColor = (value) => {
  const normalized = String(value || '').trim();
  const match = normalized.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (!match) return null;
  return [
    Math.max(0, Math.min(255, Number(match[1]))),
    Math.max(0, Math.min(255, Number(match[2]))),
    Math.max(0, Math.min(255, Number(match[3])))
  ];
};

const toRgbTriplet = (value, fallback = [41, 128, 185]) => {
  const parsedFromRgb = parseRgbColor(value);
  if (Array.isArray(parsedFromRgb)) return parsedFromRgb;
  const parsedFromHex = parseHexColor(value);
  if (Array.isArray(parsedFromHex)) return parsedFromHex;
  return fallback;
};

const formatMoney = (currency, value) => `${currency} ${toFiniteNumber(value, 0).toFixed(2)}`;

const toArrayOrEmpty = (value) => (Array.isArray(value) ? value : []);

const withPageSpace = (doc, y, requiredHeight, topMargin = 14, bottomMargin = 20) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + requiredHeight <= pageHeight - bottomMargin) return y;
  doc.addPage();
  return topMargin;
};

const drawWrappedBlock = ({
  doc,
  title,
  text,
  y,
  marginX,
  contentWidth,
  accentRgb,
  primaryRgb,
  textRgb
}) => {
  const normalizedText = toSafeString(text);
  if (!normalizedText) return y;

  const lines = toArrayOrEmpty(doc.splitTextToSize(normalizedText, contentWidth - 10));
  const lineHeight = 4.5;
  const bodyHeight = Math.max(lineHeight, lines.length * lineHeight);
  const blockHeight = 11 + bodyHeight + 4;

  let nextY = withPageSpace(doc, y, blockHeight);
  doc.setFillColor(...accentRgb);
  doc.roundedRect(marginX, nextY, contentWidth, blockHeight, 1.6, 1.6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryRgb);
  doc.text(title, marginX + 4, nextY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textRgb);
  doc.text(lines, marginX + 4, nextY + 11);

  nextY += blockHeight + 6;
  return nextY;
};

const addPdfFooter = (doc, { watermarkEnabled, watermarkFooterText }) => {
  const totalPages = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 124, 132);
    doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 7, { align: 'center' });

    if (watermarkEnabled && watermarkFooterText) {
      doc.setFontSize(7.5);
      doc.setTextColor(156, 163, 175);
      doc.text(String(watermarkFooterText), pageWidth / 2, pageHeight - 3.4, { align: 'center' });
    }
  }
};

const LEGACY_generateInvoicePdfDocument = async ({
  invoiceData = {},
  templateStyle = 'standard',
  companyData = {}
} = {}) => {
  const resolvedTemplateStyle = resolveTemplateId(
    templateStyle || invoiceData?.templateStyle || 'standard'
  );
  const colors = resolveTemplateColors(resolvedTemplateStyle);
  const company = resolveCompanyInfo(companyData);
  const customer = resolveCustomerInfo(invoiceData);
  const lineItems = normalizeLineItems(invoiceData);

  const currency = toSafeString(invoiceData?.currency || companyData?.currency || 'USD') || 'USD';
  const subtotal = toFiniteNumber(
    invoiceData?.subtotal,
    lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  );
  const totalTax = toFiniteNumber(
    invoiceData?.totalTax ?? invoiceData?.taxAmount ?? invoiceData?.tax?.amount,
    0
  );
  const totalAmount = toFiniteNumber(invoiceData?.totalAmount ?? invoiceData?.total, subtotal + totalTax);
  const taxRateUsed = toFiniteNumber(invoiceData?.taxRateUsed ?? invoiceData?.tax?.percentage, 0);
  const taxName = toSafeString(invoiceData?.taxName || invoiceData?.tax?.description || 'Tax') || 'Tax';
  const showTax = totalTax > 0 || taxRateUsed > 0;
  const watermarkEnabled = shouldShowWatermark(companyData);
  const watermarkFooterText = getWatermarkFooterText(companyData);

  const companyLines = [
    companyData?.address,
    [companyData?.city, companyData?.state, companyData?.zipCode].filter(Boolean).join(', '),
    companyData?.country,
    companyData?.email,
    companyData?.phone,
    companyData?.website
  ].map((line) => toSafeString(line)).filter(Boolean);

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  const contentWidth = pageWidth - (marginX * 2);

  const primaryRgb = toRgbTriplet(colors.primary, [41, 128, 185]);
  const accentRgb = toRgbTriplet(colors.accent, [248, 249, 250]);
  const textRgb = toRgbTriplet(colors.text, [44, 62, 80]);

  doc.setFillColor(...primaryRgb);
  doc.rect(0, 0, pageWidth, 10, 'F');

  let y = 17;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.setTextColor(...primaryRgb);
  doc.text('INVOICE', marginX, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...textRgb);
  doc.text(toSafeString(company.companyName) || 'Your Business', pageWidth - marginX, y, { align: 'right' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 96, 106);
  doc.text(`Invoice #: ${toSafeString(invoiceData?.invoiceNumber || invoiceData?.number || 'INV')}`, marginX, y);
  doc.text(`Issue Date: ${formatDisplayDate(invoiceData?.issueDate || invoiceData?.date || invoiceData?.createdAt)}`, marginX, y + 4.8);
  doc.text(`Due Date: ${formatDisplayDate(invoiceData?.dueDate || invoiceData?.due)}`, marginX, y + 9.6);
  if (toSafeString(invoiceData?.paymentTerms)) {
    doc.text(`Payment Terms: ${toSafeString(invoiceData?.paymentTerms)}`, marginX, y + 14.4);
  }

  let companyY = y;
  if (toSafeString(company.contactTitle)) {
    doc.text(company.contactTitle, pageWidth - marginX, companyY, { align: 'right' });
    companyY += 4.4;
  }
  companyLines.forEach((line) => {
    doc.text(line, pageWidth - marginX, companyY, { align: 'right' });
    companyY += 4.4;
  });

  y = Math.max(y + 18, companyY + 1);

  if (toSafeString(customer?.name)) {
    y = withPageSpace(doc, y, 24);
    doc.setFillColor(...accentRgb);
    doc.roundedRect(marginX, y, contentWidth, 22, 1.6, 1.6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryRgb);
    doc.text('Bill To', marginX + 4, y + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...textRgb);
    doc.text(toSafeString(customer.name), marginX + 4, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const customerMeta = [
      toSafeString(customer.address),
      toSafeString(customer.email),
      toSafeString(customer.phone)
    ].filter(Boolean).join(' • ');
    if (customerMeta) {
      const customerLines = toArrayOrEmpty(doc.splitTextToSize(customerMeta, contentWidth - 8));
      doc.text(customerLines, marginX + 4, y + 16.5);
    }
    y += 28;
  }

  const tableRows = (lineItems.length > 0 ? lineItems : [{ description: 'Item', quantity: 1, rate: 0, tax: 0, amount: 0 }])
    .map((item) => [
      `${item.description || 'Item'}${item.sku ? `\nSKU: ${item.sku}` : ''}`,
      String(item.quantity ?? 0),
      formatMoney(currency, item.rate),
      `${toFiniteNumber(item.tax, 0).toFixed(2)}%`,
      formatMoney(currency, item.amount)
    ]);

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [['Description', 'Qty', 'Rate', 'Tax', 'Amount']],
    body: tableRows,
    theme: 'grid',
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 2.2,
      lineColor: [225, 229, 235],
      lineWidth: 0.1,
      overflow: 'linebreak',
      textColor: textRgb
    },
    headStyles: {
      fillColor: primaryRgb,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: accentRgb
    },
    columnStyles: {
      0: { cellWidth: 88 },
      1: { cellWidth: 16, halign: 'right' },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 18, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' }
    }
  });

  const tableEndY = (doc.lastAutoTable?.finalY || y) + 8;
  y = withPageSpace(doc, tableEndY, 28);

  const totalsWidth = 74;
  const totalsX = pageWidth - marginX - totalsWidth;
  doc.setDrawColor(...primaryRgb);
  doc.setLineWidth(0.35);
  doc.roundedRect(totalsX, y, totalsWidth, showTax ? 26 : 20, 1.6, 1.6, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(90, 96, 106);
  doc.text('Subtotal:', totalsX + 4, y + 6);
  doc.text(formatMoney(currency, subtotal), totalsX + totalsWidth - 4, y + 6, { align: 'right' });

  let totalsLineY = y + 12;
  if (showTax) {
    doc.text(`${taxName} (${taxRateUsed.toFixed(2)}%):`, totalsX + 4, totalsLineY);
    doc.text(formatMoney(currency, totalTax), totalsX + totalsWidth - 4, totalsLineY, { align: 'right' });
    totalsLineY += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryRgb);
  doc.text('Total:', totalsX + 4, totalsLineY);
  doc.text(formatMoney(currency, totalAmount), totalsX + totalsWidth - 4, totalsLineY, { align: 'right' });
  y = totalsLineY + 8;

  y = drawWrappedBlock({
    doc,
    title: 'Notes',
    text: invoiceData?.notes,
    y,
    marginX,
    contentWidth,
    accentRgb,
    primaryRgb,
    textRgb
  });

  y = drawWrappedBlock({
    doc,
    title: 'Terms & Conditions',
    text: invoiceData?.terms,
    y,
    marginX,
    contentWidth,
    accentRgb,
    primaryRgb,
    textRgb
  });

  y = withPageSpace(doc, y, 6);
  doc.setDrawColor(222, 226, 230);
  doc.setLineWidth(0.25);
  doc.line(marginX, y, pageWidth - marginX, y);

  addPdfFooter(doc, { watermarkEnabled, watermarkFooterText });
  return doc;
};

const buildInvoiceHtml = ({ invoiceData, templateStyle, companyData }) => {
  const normalizedTemplate = templateStyle || invoiceData?.templateStyle || 'standard';
  const templateMeta = templateStorage.getTemplate(normalizedTemplate) || templateStorage.getTemplate('standard');
  const templateVariant = resolveTemplateStyleVariant(normalizedTemplate, templateMeta);
  const colors = resolveTemplateColors(normalizedTemplate);
  const { headerHtml, footerHtml, paddingTop, paddingBottom } = buildTemplateDecorations(templateVariant, colors);
  const company = resolveCompanyInfo(companyData);
  const customer = resolveCustomerInfo(invoiceData);
  const lineItems = normalizeLineItems(invoiceData);
  const logoMarkup = company.logoUrl
    ? `<img src="${escapeHtml(company.logoUrl)}" alt="${escapeHtml(company.companyName)} logo" crossorigin="anonymous" style="display:block;max-width:140px;max-height:60px;width:auto;height:auto;object-fit:contain;margin:0 0 12px auto;" />`
    : '';

  const currency = toSafeString(invoiceData?.currency || companyData?.currency || 'USD') || 'USD';
  const subtotal = toFiniteNumber(
    invoiceData?.subtotal,
    lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  );
  const totalTax = toFiniteNumber(
    invoiceData?.totalTax ?? invoiceData?.taxAmount ?? invoiceData?.tax?.amount,
    0
  );
  const totalAmount = toFiniteNumber(invoiceData?.totalAmount ?? invoiceData?.total, subtotal + totalTax);
  const taxRateUsed = toFiniteNumber(invoiceData?.taxRateUsed ?? invoiceData?.tax?.percentage, 0);
  const taxName = toSafeString(invoiceData?.taxName || invoiceData?.tax?.description || 'Tax') || 'Tax';
  const showTax = totalTax > 0 || taxRateUsed > 0;
  const notes = toSafeString(invoiceData?.notes);
  const terms = toSafeString(invoiceData?.terms);
  const watermarkEnabled = shouldShowWatermark(companyData);
  const watermarkFooterText = getWatermarkFooterText(companyData);

  const rowsHtml = lineItems.map((item, index) => `
    <tr style="${index % 2 === 0 ? `background: ${colors.accent};` : ''} border-bottom: 1px solid #e9ecef;">
      <td style="padding: 15px; font-size: 14px; color: #495057;">
        ${escapeHtml(item.description || 'Item')}
        ${item.sku ? `<div style="font-size: 12px; color: #6c757d;">SKU: ${escapeHtml(item.sku)}</div>` : ''}
      </td>
      <td style="padding: 15px; font-size: 14px; color: #495057;">${item.quantity}</td>
      <td style="padding: 15px; font-size: 14px; color: #495057;">${escapeHtml(currency)} ${item.rate.toFixed(2)}</td>
      <td style="padding: 15px; font-size: 14px; color: #495057;">${item.tax}%</td>
      <td style="padding: 15px; font-size: 14px; font-weight: bold; color: #495057;">${escapeHtml(currency)} ${item.amount.toFixed(2)}</td>
    </tr>
  `).join('');

  const taxHtml = showTax
    ? `
      <div style="margin-bottom: 20px;">
        <span style="color: #6c757d; font-size: 14px;">${escapeHtml(taxName)} (${taxRateUsed}%):</span>
        <span style="font-weight: bold; color: #495057; margin-left: 20px; font-size: 16px;">${escapeHtml(currency)} ${totalTax.toFixed(2)}</span>
      </div>
    `
    : '';

  return `
    <div id="invoice-content" style="max-width: 800px; margin: 0 auto; position: relative; overflow: hidden; background: white; border-radius: 12px;">
      ${headerHtml}
      ${footerHtml}
      <div style="position: relative; z-index: 2; padding: ${paddingTop}px 40px ${paddingBottom}px 40px;">
        <div style="border-bottom: 3px solid ${colors.primary}; padding-bottom: 30px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h1 style="font-size: 32px; font-weight: bold; color: ${colors.primary}; margin: 0 0 10px 0;">INVOICE</h1>
              <div style="color: #6c757d; font-size: 14px; margin-top: 15px;">
                <div><strong>Invoice #:</strong> ${escapeHtml(invoiceData?.invoiceNumber || invoiceData?.number || 'INV')}</div>
                <div><strong>Issue Date:</strong> ${escapeHtml(formatDisplayDate(invoiceData?.issueDate || invoiceData?.date || invoiceData?.createdAt))}</div>
                <div><strong>Due Date:</strong> ${escapeHtml(formatDisplayDate(invoiceData?.dueDate || invoiceData?.due))}</div>
                <div><strong>Payment Terms:</strong> ${escapeHtml(invoiceData?.paymentTerms || '')}</div>
              </div>
            </div>
            <div style="text-align: right;">
              ${logoMarkup}
              <div style="font-size: 18px; font-weight: bold; color: ${colors.primary}; margin-bottom: 10px;">
                ${escapeHtml(company.companyName)}
              </div>
              <div style="color: #6c757d; font-size: 13px; line-height: 1.4;">
                ${company.contactTitle ? `<div>${escapeHtml(company.contactTitle)}</div>` : ''}
                ${company.companyLinesHtml}
                ${company.contactDetailsHtml}
              </div>
            </div>
          </div>
        </div>

        ${customer?.name ? `
          <div style="background: ${colors.accent}; padding: 25px; margin: 20px 0 30px 0; border-radius: 8px; border-left: 4px solid ${colors.primary};">
            <div style="font-weight: bold; margin-bottom: 15px; color: ${colors.primary}; font-size: 16px;">Bill To:</div>
            <div style="color: #495057;">
              <div style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">${escapeHtml(customer.name)}</div>
              ${customer.address ? `<div style="margin-bottom: 5px;">${escapeHtml(customer.address)}</div>` : ''}
              ${customer.email ? `<div style="margin-bottom: 5px;">${escapeHtml(customer.email)}</div>` : ''}
              ${customer.phone ? `<div>${escapeHtml(customer.phone)}</div>` : ''}
            </div>
          </div>
        ` : ''}

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0 30px 0;">
          <thead>
            <tr style="background: ${colors.primary}; color: white;">
              <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Description</th>
              <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Qty</th>
              <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Rate</th>
              <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Tax</th>
              <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Amount</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid ${colors.primary}; text-align: right;">
          <div style="margin-bottom: 10px;">
            <span style="color: #6c757d; font-size: 14px;">Subtotal:</span>
            <span style="font-weight: bold; color: #495057; margin-left: 20px; font-size: 16px;">${escapeHtml(currency)} ${subtotal.toFixed(2)}</span>
          </div>
          ${taxHtml}
          <div>
            <span style="color: ${colors.primary}; font-weight: bold; font-size: 20px;">Total:</span>
            <span style="color: ${colors.primary}; font-weight: bold; margin-left: 20px; font-size: 24px;">${escapeHtml(currency)} ${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        ${notes ? `
          <div style="margin-top: 30px; padding: 20px; background: ${colors.accent}; border-radius: 8px;">
            <div style="color: ${colors.primary}; font-weight: bold; margin-bottom: 15px; font-size: 14px;">Notes</div>
            <div style="color: #495057; line-height: 1.6; font-size: 14px; white-space: pre-line;">${escapeHtml(notes)}</div>
          </div>
        ` : ''}

        ${terms ? `
          <div style="margin-top: 20px; padding: 20px; background: ${colors.accent}; border-radius: 8px;">
            <div style="color: ${colors.primary}; font-weight: bold; margin-bottom: 15px; font-size: 14px;">Terms & Conditions</div>
            <div style="color: #495057; line-height: 1.6; font-size: 13px; white-space: pre-line;">${escapeHtml(terms)}</div>
          </div>
        ` : ''}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 12px;">
          <div>Thank you for your business!</div>
          ${watermarkEnabled && watermarkFooterText
            ? `<div style="margin-top: 8px; font-size: 11px; color: #9ca3af; opacity: 0.6;">${escapeHtml(watermarkFooterText)}</div>`
            : ''}
        </div>
      </div>
    </div>
  `;
};

const collectInvoiceRowBreaks = ({
  invoiceElement,
  scale,
  canvasHeight,
  pageHeightPx
}) => {
  const rows = Array.from(invoiceElement.querySelectorAll('tbody tr'));
  if (!rows.length) return [];

  const invoiceRect = invoiceElement.getBoundingClientRect();
  const sortedRowBottoms = Array.from(
    new Set(
      rows
        .map((row) => {
          const rowRect = row.getBoundingClientRect();
          return Math.round((rowRect.bottom - invoiceRect.top) * scale);
        })
        .filter((value) => Number.isFinite(value) && value > 0 && value < canvasHeight)
    )
  ).sort((a, b) => a - b);

  if (!sortedRowBottoms.length) return [];

  const breaks = [];
  let segmentStart = 0;

  while (segmentStart + pageHeightPx < canvasHeight) {
    const naturalBreak = segmentStart + pageHeightPx;
    const latestAllowedBreak = naturalBreak - MIN_BREAK_MARGIN_PX;
    const rowBreak = [...sortedRowBottoms]
      .reverse()
      .find(
        (value) => value <= latestAllowedBreak && value > segmentStart + MIN_SEGMENT_HEIGHT_PX
      );

    const nextBreak = rowBreak && rowBreak > segmentStart ? rowBreak : naturalBreak;
    if (nextBreak <= segmentStart || nextBreak >= canvasHeight) break;

    breaks.push(nextBreak);
    segmentStart = nextBreak;
  }

  return breaks;
};

const buildCanvasSlice = (sourceCanvas, startY, endY) => {
  const sliceHeight = Math.max(0, endY - startY);
  const pageCanvas = document.createElement('canvas');
  pageCanvas.width = sourceCanvas.width;
  pageCanvas.height = sliceHeight;
  const context = pageCanvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to render invoice PDF segment');
  }
  context.drawImage(
    sourceCanvas,
    0,
    startY,
    sourceCanvas.width,
    sliceHeight,
    0,
    0,
    sourceCanvas.width,
    sliceHeight
  );
  return pageCanvas;
};

const renderInvoiceHtmlToPdf = async (htmlContent) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Frontend renderer is not available in this environment');
  }

  const pdfContainer = document.createElement('div');
  pdfContainer.style.position = 'absolute';
  pdfContainer.style.left = '-9999px';
  pdfContainer.style.top = '-9999px';
  pdfContainer.style.width = '800px';
  pdfContainer.style.backgroundColor = 'white';
  pdfContainer.style.padding = '0';
  pdfContainer.style.fontFamily = 'Arial, sans-serif';
  pdfContainer.innerHTML = htmlContent;

  document.body.appendChild(pdfContainer);

  try {
    await new Promise((resolve) => setTimeout(resolve, 120));

    const invoiceElement = pdfContainer.querySelector('#invoice-content') || pdfContainer;

    const canvas = await withTimeout(
      html2canvas(invoiceElement, {
        scale: HTML2CANVAS_SCALE,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      }),
      HTML_RENDER_TIMEOUT_MS,
      `Invoice HTML renderer timed out after ${Math.round(HTML_RENDER_TIMEOUT_MS / 1000)}s`
    );

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageHeightPx = Math.floor((canvas.width * pageHeight) / pageWidth);
    const breakPoints = [
      ...collectInvoiceRowBreaks({
        invoiceElement,
        scale: HTML2CANVAS_SCALE,
        canvasHeight: canvas.height,
        pageHeightPx
      }),
      canvas.height
    ];

    let currentStart = 0;
    let renderedPages = 0;

    breakPoints.forEach((endY) => {
      if (endY <= currentStart) return;
      const pageCanvas = buildCanvasSlice(canvas, currentStart, endY);
      if (renderedPages > 0) {
        pdf.addPage();
      }
      const renderedHeight = (pageCanvas.height * pageWidth) / pageCanvas.width;
      const imageData = pageCanvas.toDataURL('image/jpeg', 0.92);
      pdf.addImage(imageData, 'JPEG', 0, 0, pageWidth, renderedHeight);
      renderedPages += 1;
      currentStart = endY;
    });

    if (renderedPages === 0) {
      const imageData = canvas.toDataURL('image/jpeg', 0.92);
      const renderedHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imageData, 'JPEG', 0, 0, pageWidth, renderedHeight);
    }

    return pdf;
  } finally {
    if (pdfContainer.parentNode) {
      pdfContainer.parentNode.removeChild(pdfContainer);
    }
  }
};

const buildAttachmentFromArrayBuffer = (buffer, fileName, source) => {
  if (
    !(buffer instanceof ArrayBuffer)
    || buffer.byteLength === 0
    || buffer.byteLength < MIN_MEANINGFUL_PDF_BYTES
  ) {
    return null;
  }

  const base64 = arrayBufferToBase64(buffer);
  if (!base64) return null;

  return {
    fileName,
    contentType: DEFAULT_CONTENT_TYPE,
    encoding: DEFAULT_ENCODING,
    data: base64,
    source
  };
};

const logPdfRendererFailure = (label, error) => {
  const message = error instanceof Error ? error.message : String(error || 'unknown error');
  console.warn(`${label}: ${message}`);
};

export const buildInvoiceEmailPdfAttachment = async ({
  invoiceData,
  templateStyle = 'standard',
  companyData = {},
  fallbackInvoiceId = ''
} = {}) => {
  if (!invoiceData || typeof invoiceData !== 'object') return null;

  const resolvedTemplateStyle = resolveTemplateId(
    templateStyle || invoiceData.templateStyle || 'standard'
  );
  const fileName = sanitizeFileName(
    resolveInvoiceFileName(invoiceData, fallbackInvoiceId),
    'invoice.pdf'
  );
  const mobileBrowser = isMobileBrowser();

  const buildHtmlAttachment = async () => {
    const html = buildInvoiceHtml({
      invoiceData,
      templateStyle: resolvedTemplateStyle,
      companyData: companyData || {}
    });
    const pdfDoc = await renderInvoiceHtmlToPdf(html);
    const htmlBuffer = pdfDoc.output('arraybuffer');
    return buildAttachmentFromArrayBuffer(htmlBuffer, fileName, 'frontend-html2canvas');
  };

  const buildLegacyAttachment = async () => {
    const legacyPdfDoc = await LEGACY_generateInvoicePdfDocument({
      invoiceData,
      templateStyle: resolvedTemplateStyle,
      companyData: companyData || {}
    });
    const legacyBuffer = legacyPdfDoc.output('arraybuffer');
    return buildAttachmentFromArrayBuffer(legacyBuffer, fileName, 'frontend-jspdf-legacy');
  };

  if (mobileBrowser) {
    try {
      const legacyAttachment = await buildLegacyAttachment();
      if (legacyAttachment) {
        return legacyAttachment;
      }
    } catch (error) {
      logPdfRendererFailure('Legacy renderer failed for invoice email PDF', error);
    }
  }

  try {
    const htmlAttachment = await buildHtmlAttachment();
    if (htmlAttachment) {
      return htmlAttachment;
    }
  } catch (error) {
    logPdfRendererFailure('HTML renderer failed for invoice email PDF', error);
  }

  try {
    const legacyAttachment = await buildLegacyAttachment();
    if (legacyAttachment) {
      return legacyAttachment;
    }
  } catch (error) {
    logPdfRendererFailure('Legacy renderer failed for invoice email PDF', error);
  }

  return null;
};
