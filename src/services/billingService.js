import api from './api';

export const fetchBillingSummary = async () => {
  const response = await api.get('/billing/summary');
  return response.data;
};

export const updateSubscription = async (payload) => {
  const response = await api.put('/billing/subscription', payload);
  return response.data;
};

export const updateAddOns = async (payload) => {
  const response = await api.put('/billing/addons', payload);
  return response.data;
};

export const initializeSubscriptionPayment = async (payload) => {
  const response = await api.post('/payments/initialize-subscription', payload);
  return response.data;
};

export const initializeTemplatePayment = async (payload) => {
  const response = await api.post('/payments/initialize-template', payload);
  return response.data;
};

export const verifyPayment = async (reference) => {
  const response = await api.get(`/payments/verify/${reference}`);
  return response.data;
};
