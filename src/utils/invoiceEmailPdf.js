import { generateInvoicePDF } from './pdfGenerator';

const DEFAULT_CONTENT_TYPE = 'application/pdf';
const DEFAULT_ENCODING = 'base64';
const BASE64_CHUNK_SIZE = 0x8000;

const toSafeString = (value) => String(value || '').trim();

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

export const buildInvoiceEmailPdfAttachment = ({
  invoiceData,
  templateStyle = 'standard',
  companyData = {},
  fallbackInvoiceId = ''
} = {}) => {
  if (!invoiceData || typeof invoiceData !== 'object') return null;

  const doc = generateInvoicePDF(invoiceData, templateStyle || 'standard', companyData || {});
  const buffer = doc.output('arraybuffer');
  if (!(buffer instanceof ArrayBuffer) || buffer.byteLength === 0) {
    return null;
  }

  const base64 = arrayBufferToBase64(buffer);
  if (!base64) {
    return null;
  }

  return {
    fileName: sanitizeFileName(resolveInvoiceFileName(invoiceData, fallbackInvoiceId), 'invoice.pdf'),
    contentType: DEFAULT_CONTENT_TYPE,
    encoding: DEFAULT_ENCODING,
    data: base64,
    source: 'frontend-jspdf'
  };
};
