import api from './api';

export const getReceipts = async (params = {}) => {
  const response = await api.get('/receipts', { params });
  return response.data;
};

export const getReceipt = async (id) => {
  const response = await api.get(`/receipts/${id}`);
  return response.data;
};

export const createReceipt = async (payload) => {
  const response = await api.post('/receipts', payload);
  return response.data;
};

export const createReceiptFromInvoice = async (invoiceId, payload = {}) => {
  const response = await api.post(`/receipts/from-invoice/${invoiceId}`, payload);
  return response.data;
};

export const voidReceipt = async (id, payload = {}) => {
  const response = await api.post(`/receipts/${id}/void`, payload);
  return response.data;
};
