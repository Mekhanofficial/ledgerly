import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import templateStorage from './templateStorage';
import { resolveTemplateStyleVariant } from './templateStyleVariants';
import { getBusinessLogoUrl, getWatermarkFooterText, shouldShowWatermark } from './brandingPlan';

const RECEIPT_TEMPLATE_STORAGE_KEY = 'receipt_template_preference';
const HTML2CANVAS_SCALE = 1.5;
const MIN_BREAK_MARGIN_PX = 14;
const MIN_SEGMENT_HEIGHT_PX = 120;

const TEMPLATE_COLOR_FALLBACK = {
  primary: '#2980b9',
  secondary: '#3498db',
  accent: '#f8f9fa',
  text: '#2c3e50'
};

const toSafeString = (value) => String(value || '').trim();
const normalizeTemplateValue = (value) => toSafeString(value).toLowerCase();

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

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const toTitleCase = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\w\S*/g, (chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase());
};

const formatDisplayDate = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString();
};

export const getReceiptTemplatePreference = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(RECEIPT_TEMPLATE_STORAGE_KEY);
  } catch {
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
  } catch {
    // Ignore storage failures in restricted environments.
  }
};

const resolveTemplateId = (receiptData = {}, templateId) => {
  const candidate = toSafeString(
    templateId
    || receiptData?.templateStyle
    || receiptData?.templateId
    || receiptData?.metadata?.templateStyle
    || getReceiptTemplatePreference()
    || templateStorage.getDefaultTemplate()?.id
    || 'standard'
  );

  if (!candidate) return 'standard';
  if (templateStorage.getTemplate(candidate)) return candidate;

  const allTemplates = typeof templateStorage.getAllTemplates === 'function'
    ? templateStorage.getAllTemplates()
    : [];
  const normalizedCandidate = normalizeTemplateValue(candidate);
  const matched = allTemplates.find((template) =>
    normalizeTemplateValue(template?.id) === normalizedCandidate
    || normalizeTemplateValue(template?.templateStyle) === normalizedCandidate
  );
  return matched?.id || candidate;
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

const normalizeReceiptItems = (receiptData = {}) => {
  const source = Array.isArray(receiptData.items)
    ? receiptData.items
    : Array.isArray(receiptData.lineItems)
      ? receiptData.lineItems
      : [];

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

const resolveCompanyInfo = (accountInfo = {}) => {
  const locationPieces = [
    accountInfo?.city,
    accountInfo?.state,
    accountInfo?.zipCode
  ].filter(Boolean);
  const cityLine = locationPieces.length > 0 ? locationPieces.join(', ') : '';
  const companyLines = [
    accountInfo?.address,
    cityLine,
    accountInfo?.country
  ].filter(Boolean);
  const contactDetailsList = [
    accountInfo?.email,
    accountInfo?.phone,
    accountInfo?.website
  ].filter(Boolean);

  return {
    companyName: accountInfo?.companyName || accountInfo?.name || 'Your Business',
    contactTitle: accountInfo?.contactName ? `Attn: ${accountInfo.contactName}` : '',
    logoUrl: getBusinessLogoUrl(accountInfo),
    companyLinesHtml: companyLines.map((line) => `<div>${escapeHtml(line)}</div>`).join(''),
    contactDetailsHtml: contactDetailsList.map((line) => `<div>${escapeHtml(line)}</div>`).join('')
  };
};

const resolveCustomerInfo = (receiptData = {}) => {
  if (receiptData.customer && typeof receiptData.customer === 'object') {
    return receiptData.customer;
  }

  return {
    name: receiptData.customerName || '',
    email: receiptData.customerEmail || '',
    phone: receiptData.customerPhone || '',
    address: receiptData.customerAddress || ''
  };
};

const buildPaymentDetailsText = (receiptData, currency) => {
  const details = [];
  const paymentMethod = toSafeString(receiptData?.paymentMethod || receiptData?.method);
  const paymentDetails = toSafeString(receiptData?.paymentMethodDetails);
  const paymentReference = toSafeString(receiptData?.paymentReference || receiptData?.reference);
  const status = toSafeString(receiptData?.status);
  const hasAmountPaid = receiptData?.amountPaid !== undefined && receiptData?.amountPaid !== null;
  const hasChange = toFiniteNumber(receiptData?.change, 0) > 0;

  if (paymentMethod) details.push(`Method: ${toTitleCase(paymentMethod)}`);
  if (paymentDetails) details.push(`Details: ${paymentDetails}`);
  if (paymentReference) details.push(`Reference: ${paymentReference}`);
  if (status) details.push(`Status: ${toTitleCase(status)}`);
  if (hasAmountPaid) details.push(`Paid: ${currency} ${toFiniteNumber(receiptData.amountPaid, 0).toFixed(2)}`);
  if (hasChange) details.push(`Change: ${currency} ${toFiniteNumber(receiptData.change, 0).toFixed(2)}`);

  return details.join('\n');
};

const buildReceiptHtml = ({ receiptData, templateId, accountInfo }) => {
  const templateMeta = templateStorage.getTemplate(templateId) || templateStorage.getTemplate('standard');
  const templateVariant = resolveTemplateStyleVariant(templateId, templateMeta);
  const colors = resolveTemplateColors(templateId);
  const { headerHtml, footerHtml, paddingTop, paddingBottom } = buildTemplateDecorations(templateVariant, colors);
  const company = resolveCompanyInfo(accountInfo);
  const customer = resolveCustomerInfo(receiptData);
  const items = normalizeReceiptItems(receiptData);
  const logoMarkup = company.logoUrl
    ? `<img src="${escapeHtml(company.logoUrl)}" alt="${escapeHtml(company.companyName)} logo" crossorigin="anonymous" style="display:block;max-width:140px;max-height:60px;width:auto;height:auto;object-fit:contain;margin:0 0 12px auto;" />`
    : '';

  const currency = toSafeString(receiptData?.currency || accountInfo?.currency || 'USD') || 'USD';
  const subtotal = toFiniteNumber(
    receiptData?.subtotal,
    items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  );
  const totalTax = toFiniteNumber(
    receiptData?.tax ?? receiptData?.totalTax ?? receiptData?.taxAmount,
    0
  );
  const totalAmount = toFiniteNumber(receiptData?.total ?? receiptData?.totalAmount, subtotal + totalTax);
  const hasAmountPaid = receiptData?.amountPaid !== undefined && receiptData?.amountPaid !== null;
  const amountPaid = toFiniteNumber(receiptData?.amountPaid, totalAmount);
  const changeAmount = toFiniteNumber(receiptData?.change, 0);
  const paymentMethod = toSafeString(receiptData?.paymentMethod || receiptData?.method);
  const paymentReference = toSafeString(receiptData?.paymentReference || receiptData?.reference);
  const receiptNumber = toSafeString(
    receiptData?.receiptNumber
    || receiptData?.id
    || receiptData?.recordId
    || receiptData?._id
    || 'RCP'
  );
  const receiptDate = formatDisplayDate(
    receiptData?.date
    || receiptData?.savedAt
    || receiptData?.createdAt
    || new Date().toISOString()
  );
  const notes = toSafeString(receiptData?.notes);
  const paymentDetailsText = buildPaymentDetailsText(receiptData, currency);
  const watermarkEnabled = shouldShowWatermark(accountInfo);
  const watermarkFooterText = getWatermarkFooterText(accountInfo);

  const rowsHtml = items.map((item, index) => `
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

  const taxHtml = totalTax > 0
    ? `
      <div style="margin-bottom: 12px;">
        <span style="color: #6c757d; font-size: 14px;">Tax:</span>
        <span style="font-weight: bold; color: #495057; margin-left: 20px; font-size: 16px;">${escapeHtml(currency)} ${totalTax.toFixed(2)}</span>
      </div>
    `
    : '';

  const paidHtml = hasAmountPaid
    ? `
      <div style="margin-bottom: 12px;">
        <span style="color: #6c757d; font-size: 14px;">Paid:</span>
        <span style="font-weight: bold; color: #495057; margin-left: 20px; font-size: 16px;">${escapeHtml(currency)} ${amountPaid.toFixed(2)}</span>
      </div>
    `
    : '';

  const changeHtml = changeAmount > 0
    ? `
      <div style="margin-bottom: 12px;">
        <span style="color: #6c757d; font-size: 14px;">Change:</span>
        <span style="font-weight: bold; color: #495057; margin-left: 20px; font-size: 16px;">${escapeHtml(currency)} ${changeAmount.toFixed(2)}</span>
      </div>
    `
    : '';

  return `
    <div id="receipt-content" style="max-width: 800px; margin: 0 auto; position: relative; overflow: hidden; background: white; border-radius: 12px;">
      ${headerHtml}
      ${footerHtml}
      <div style="position: relative; z-index: 2; padding: ${paddingTop}px 40px ${paddingBottom}px 40px;">
        <div style="border-bottom: 3px solid ${colors.primary}; padding-bottom: 30px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h1 style="font-size: 32px; font-weight: bold; color: ${colors.primary}; margin: 0 0 10px 0;">RECEIPT</h1>
              <div style="color: #6c757d; font-size: 14px; margin-top: 15px;">
                <div><strong>Receipt #:</strong> ${escapeHtml(receiptNumber)}</div>
                <div><strong>Date:</strong> ${escapeHtml(receiptDate)}</div>
                ${paymentMethod ? `<div><strong>Payment Method:</strong> ${escapeHtml(toTitleCase(paymentMethod))}</div>` : ''}
                ${paymentReference ? `<div><strong>Reference:</strong> ${escapeHtml(paymentReference)}</div>` : ''}
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
          <div style="margin-bottom: 12px;">
            <span style="color: #6c757d; font-size: 14px;">Subtotal:</span>
            <span style="font-weight: bold; color: #495057; margin-left: 20px; font-size: 16px;">${escapeHtml(currency)} ${subtotal.toFixed(2)}</span>
          </div>
          ${taxHtml}
          ${paidHtml}
          ${changeHtml}
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

        ${paymentDetailsText ? `
          <div style="margin-top: 20px; padding: 20px; background: ${colors.accent}; border-radius: 8px;">
            <div style="color: ${colors.primary}; font-weight: bold; margin-bottom: 15px; font-size: 14px;">Payment Details</div>
            <div style="color: #495057; line-height: 1.6; font-size: 13px; white-space: pre-line;">${escapeHtml(paymentDetailsText)}</div>
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

const collectRowBreaks = ({ rootElement, scale, canvasHeight, pageHeightPx }) => {
  const rows = Array.from(rootElement.querySelectorAll('tbody tr'));
  if (!rows.length) return [];

  const rootRect = rootElement.getBoundingClientRect();
  const sortedRowBottoms = Array.from(
    new Set(
      rows
        .map((row) => {
          const rowRect = row.getBoundingClientRect();
          return Math.round((rowRect.bottom - rootRect.top) * scale);
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
    throw new Error('Unable to render receipt PDF segment');
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

const renderReceiptHtmlToPdf = async (htmlContent) => {
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
    const receiptElement = pdfContainer.querySelector('#receipt-content') || pdfContainer;

    const canvas = await html2canvas(receiptElement, {
      scale: HTML2CANVAS_SCALE,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageHeightPx = Math.floor((canvas.width * pageHeight) / pageWidth);

    const breakPoints = [
      ...collectRowBreaks({
        rootElement: receiptElement,
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
        doc.addPage();
      }
      const renderedHeight = (pageCanvas.height * pageWidth) / pageCanvas.width;
      const imageData = pageCanvas.toDataURL('image/jpeg', 0.92);
      doc.addImage(imageData, 'JPEG', 0, 0, pageWidth, renderedHeight);
      renderedPages += 1;
      currentStart = endY;
    });

    if (renderedPages === 0) {
      const imageData = canvas.toDataURL('image/jpeg', 0.92);
      const renderedHeight = (canvas.height * pageWidth) / canvas.width;
      doc.addImage(imageData, 'JPEG', 0, 0, pageWidth, renderedHeight);
    }

    return doc;
  } finally {
    if (pdfContainer.parentNode) {
      pdfContainer.parentNode.removeChild(pdfContainer);
    }
  }
};

export const generateReceiptPDF = async (receiptData, accountInfo = {}, options = {}) => {
  if (!receiptData || typeof receiptData !== 'object') {
    throw new Error('Invalid receipt data');
  }

  const resolvedOptions = typeof options === 'string' ? { templateId: options } : (options || {});
  const resolvedTemplateId = resolveTemplateId(receiptData, resolvedOptions.templateId);
  const html = buildReceiptHtml({
    receiptData,
    templateId: resolvedTemplateId,
    accountInfo: accountInfo || {}
  });

  return renderReceiptHtmlToPdf(html);
};
