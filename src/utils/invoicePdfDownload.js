import templateStorage from './templateStorage';
import { buildInvoiceEmailPdfAttachment } from './invoiceEmailPdf';

const sanitizeFileName = (value, fallback = 'invoice.pdf') => {
  const trimmed = String(value || '')
    .trim()
    .replace(/[<>:"/\\|?*]/g, '');
  const cleaned = Array.from(trimmed)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join('');
  if (!cleaned) return fallback;
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned}.pdf`;
};

const normalizeTemplateStyle = (value) => String(value || '').trim().toLowerCase();

const resolveTemplateId = (templateId, invoice = {}) => {
  const candidates = [
    templateId,
    invoice?.templateStyle,
    invoice?.templateId,
    invoice?.metadata?.templateStyle,
    templateStorage.getDefaultTemplate()?.id,
    'standard'
  ].filter(Boolean);

  const allTemplates = typeof templateStorage.getAllTemplates === 'function'
    ? templateStorage.getAllTemplates()
    : [];

  for (const candidate of candidates) {
    const trimmed = String(candidate || '').trim();
    if (!trimmed) continue;

    if (templateStorage.getTemplate(trimmed)) {
      return trimmed;
    }

    const normalizedCandidate = normalizeTemplateStyle(trimmed);
    const matched = allTemplates.find((template) =>
      normalizeTemplateStyle(template?.id) === normalizedCandidate
      || normalizeTemplateStyle(template?.templateStyle) === normalizedCandidate
    );
    if (matched?.id) {
      return matched.id;
    }
  }

  return 'standard';
};

const base64ToBlob = (base64, contentType = 'application/pdf') => {
  const binaryString = window.atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: contentType });
};

const triggerBlobDownload = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadInvoicePdfWithTemplate = async ({
  invoice = {},
  templateId = 'standard',
  companyData = {}
} = {}) => {
  const resolvedTemplate = resolveTemplateId(templateId, invoice);
  const invoiceRef = invoice?.invoiceNumber || invoice?.number || invoice?.id || invoice?._id || 'invoice';
  const fallbackFileName = sanitizeFileName(`invoice-${invoiceRef}.pdf`);

  const attachment = await buildInvoiceEmailPdfAttachment({
    invoiceData: {
      ...invoice,
      templateStyle: resolvedTemplate
    },
    templateStyle: resolvedTemplate,
    companyData: companyData || {},
    fallbackInvoiceId: invoiceRef
  });

  if (!attachment?.data) {
    throw new Error('Unable to generate invoice PDF');
  }

  const fileName = sanitizeFileName(attachment.fileName || fallbackFileName, fallbackFileName);
  const blob = base64ToBlob(attachment.data, attachment.contentType || 'application/pdf');
  triggerBlobDownload(blob, fileName);

  return {
    fileName,
    templateId: resolvedTemplate,
    source: attachment.source || 'frontend-html2canvas'
  };
};
