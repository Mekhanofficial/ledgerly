import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import templateStorage from './templateStorage';
import { resolveTemplateStyleVariant } from './templateStyleVariants';
import { getWatermarkFooterText, shouldShowWatermark } from './brandingPlan';

const DEFAULT_CONTENT_TYPE = 'application/pdf';
const DEFAULT_ENCODING = 'base64';
const BASE64_CHUNK_SIZE = 0x8000;
const MIN_MEANINGFUL_PDF_BYTES = 2048;

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

const buildInvoiceHtml = ({ invoiceData, templateStyle, companyData }) => {
  const normalizedTemplate = templateStyle || invoiceData?.templateStyle || 'standard';
  const templateMeta = templateStorage.getTemplate(normalizedTemplate) || templateStorage.getTemplate('standard');
  const templateVariant = resolveTemplateStyleVariant(normalizedTemplate, templateMeta);
  const colors = resolveTemplateColors(normalizedTemplate);
  const { headerHtml, footerHtml, paddingTop, paddingBottom } = buildTemplateDecorations(templateVariant, colors);
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

    const canvas = await html2canvas(pdfContainer, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
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

  try {
    const html = buildInvoiceHtml({
      invoiceData,
      templateStyle: resolvedTemplateStyle,
      companyData: companyData || {}
    });
    const pdfDoc = await renderInvoiceHtmlToPdf(html);
    const htmlBuffer = pdfDoc.output('arraybuffer');
    const htmlAttachment = buildAttachmentFromArrayBuffer(htmlBuffer, fileName, 'frontend-html2canvas');
    if (htmlAttachment) {
      return htmlAttachment;
    }
  } catch (error) {
    console.warn('HTML renderer failed for invoice email PDF:', error);
  }

  return null;
};
