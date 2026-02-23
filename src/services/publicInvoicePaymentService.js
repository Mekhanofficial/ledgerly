import api from './api';

export const fetchPublicInvoice = async (slug) => {
  const response = await api.get(`/invoices/public/${slug}`);
  return response.data?.data ?? response.data;
};

export const initializePublicInvoicePayment = async (slug) => {
  const response = await api.post(`/invoices/public/${slug}/paystack/initialize`, {});
  return response.data?.data ?? response.data;
};

export const verifyPublicInvoicePayment = async (reference) => {
  const response = await api.get('/payments/verify', {
    params: {
      reference,
      mode: 'json'
    }
  });
  return response.data?.data ?? response.data;
};
