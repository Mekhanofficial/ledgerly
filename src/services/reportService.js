import api from './api';

const mapReportResponse = (report) => ({
  ...report,
  id: report.id || report._id || report._id?.toString()
});

export const fetchReports = async () => {
  const response = await api.get('/reports/history');
  return response.data.data.map(mapReportResponse);
};

export const createReport = async (payload) => {
  const response = await api.post('/reports/history', payload);
  return mapReportResponse(response.data.data);
};

export const updateReport = async (id, updates) => {
  const response = await api.patch(`/reports/history/${id}`, updates);
  return mapReportResponse(response.data.data);
};

export const deleteReport = async (id) => {
  const response = await api.delete(`/reports/history/${id}`);
  return response.data;
};

export const recordDownload = async (id) => {
  const response = await api.post(`/reports/history/${id}/download`);
  return mapReportResponse(response.data.data);
};
