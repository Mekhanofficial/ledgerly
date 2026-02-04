import api from './api';

export const fetchTemplates = async () => {
  const response = await api.get('/templates');
  return response.data;
};

export const createCustomTemplate = async (payload) => {
  const response = await api.post('/templates/custom', payload);
  return response.data;
};

export const purchaseTemplate = async (templateId, payload = {}) => {
  const response = await api.post(`/templates/${templateId}/purchase`, payload);
  return response.data;
};

export const getTemplatePurchases = async () => {
  const response = await api.get('/templates/purchases');
  return response.data;
};
