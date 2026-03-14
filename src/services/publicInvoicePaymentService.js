import api from './api';

export const fetchPublicInvoice = async (slug) => {
  const response = await api.get(`/invoices/public/${slug}`);
  return response.data?.data ?? response.data;
};

export const initializePublicInvoicePayment = async (slug) => {
  const response = await api.post(`/invoices/public/${slug}/paystack/initialize`, {});
  return response.data?.data ?? response.data;
};

export const verifyPublicInvoicePayment = async (reference, options = {}) => {
  const slug = String(options?.slug || '').trim();
  const invoiceId = String(options?.invoiceId || '').trim();
  const response = await api.get('/payments/verify', {
    params: {
      reference,
      ...(slug ? { slug } : {}),
      ...(invoiceId ? { invoiceId } : {}),
      mode: 'json'
    }
  });
  return response.data?.data ?? response.data;
};

export const sendPublicInvoiceReceiptEmail = async ({
  reference,
  pdfAttachment,
  templateStyle
} = {}) => {
  const response = await api.post('/payments/public-receipt/email', {
    reference,
    pdfAttachment,
    templateStyle
  });
  return response.data?.data ?? response.data;
};
