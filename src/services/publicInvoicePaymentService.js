import api from './api';

const requestPublic = (config) =>
  api.request({
    __skipAuth: true,
    ...config
  });

export const fetchPublicInvoice = async (slug) => {
  const response = await requestPublic({
    method: 'get',
    url: `/invoices/public/${slug}`
  });
  return response.data?.data ?? response.data;
};

export const initializePublicInvoicePayment = async (slug) => {
  const response = await requestPublic({
    method: 'post',
    url: `/invoices/public/${slug}/paystack/initialize`,
    data: {}
  });
  return response.data?.data ?? response.data;
};

export const verifyPublicInvoicePayment = async (reference, options = {}) => {
  const slug = String(options?.slug || '').trim();
  const invoiceId = String(options?.invoiceId || '').trim();
  const response = await requestPublic({
    method: 'get',
    url: '/payments/verify',
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
  const response = await requestPublic({
    method: 'post',
    url: '/payments/public-receipt/email',
    data: {
      reference,
      pdfAttachment,
      templateStyle
    }
  });
  return response.data?.data ?? response.data;
};
