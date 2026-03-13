import { generateReceiptPDF } from './receiptPdfGenerator';

const DEFAULT_CONTENT_TYPE = 'application/pdf';
const DEFAULT_ENCODING = 'base64';
const BASE64_CHUNK_SIZE = 0x8000;

const toSafeString = (value) => String(value || '').trim();

const sanitizeFileName = (value, fallback = 'receipt.pdf') => {
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

const resolveReceiptFileName = (receiptData = {}, fallbackId = '') => {
  const receiptNumber = toSafeString(receiptData.receiptNumber || receiptData.id);
  const id = toSafeString(receiptData.recordId || receiptData._id || fallbackId);
  if (receiptNumber) return `receipt-${receiptNumber}.pdf`;
  if (id) return `receipt-${id}.pdf`;
  return 'receipt.pdf';
};

export const buildReceiptEmailPdfAttachment = async ({
  receiptData,
  accountInfo = {},
  templateId,
  fallbackReceiptId = ''
} = {}) => {
  if (!receiptData || typeof receiptData !== 'object') return null;

  const resolvedTemplateId = templateId
    || receiptData.templateStyle
    || receiptData.templateId
    || accountInfo?.defaultTemplate
    || 'standard';

  try {
    const doc = await generateReceiptPDF(receiptData, accountInfo, { templateId: resolvedTemplateId });
    const buffer = doc.output('arraybuffer');
    if (!(buffer instanceof ArrayBuffer) || buffer.byteLength <= 0) {
      return null;
    }

    const base64 = arrayBufferToBase64(buffer);
    if (!base64) return null;

    return {
      fileName: sanitizeFileName(resolveReceiptFileName(receiptData, fallbackReceiptId), 'receipt.pdf'),
      contentType: DEFAULT_CONTENT_TYPE,
      encoding: DEFAULT_ENCODING,
      data: base64,
      source: 'frontend-receipt-jspdf'
    };
  } catch {
    return null;
  }
};
