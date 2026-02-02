import api from './api';

export const getPayments = async (params = {}) => {
  const response = await api.get('/payments', { params });
  return response.data;
};

export const getPayment = async (id) => {
  const response = await api.get(`/payments/${id}`);
  return response.data;
};

export const createPayment = async (payload) => {
  const response = await api.post('/payments', payload);
  return response.data;
};

export const refundPayment = async (id, payload) => {
  const response = await api.post(`/payments/${id}/refund`, payload);
  return response.data;
};
