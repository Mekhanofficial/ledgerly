import api from './api';

const extractErrorMessage = (error) => {
  return (
    error?.response?.data?.error
    || error?.response?.data?.message
    || error?.message
    || 'Live chat request failed'
  );
};

export const getLiveChatEligibility = async () => {
  const response = await api.get('/livechat/eligibility');
  return response?.data?.data || {};
};

export const getLiveChatStatus = async () => {
  const response = await api.get('/livechat/status');
  return response?.data?.data || {};
};

export const sendLiveChatMessage = async (message) => {
  const response = await api.post('/livechat/message', { message });
  return response?.data?.data || {};
};

export const getLiveChatErrorMessage = (error) => extractErrorMessage(error);
