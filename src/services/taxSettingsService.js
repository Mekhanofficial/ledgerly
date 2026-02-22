import api from './api';

export const fetchTaxSettings = async () => {
  const response = await api.get('/tax-settings');
  return response.data.data;
};

export const updateTaxSettings = async (payload) => {
  const response = await api.put('/tax-settings', payload);
  return response.data.data;
};
