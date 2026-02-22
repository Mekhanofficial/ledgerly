import api from './api';
import { resolveServerBaseUrl } from '../utils/apiConfig';

const normalizeDocument = (doc = {}) => ({
  id: doc.id || doc._id,
  name: doc.name || doc.originalName || doc.fileName || 'Untitled document',
  originalName: doc.originalName,
  fileName: doc.fileName,
  filePath: doc.filePath,
  mimeType: doc.mimeType,
  size: doc.size,
  type: doc.type || 'document',
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt
});

export const fetchDocuments = async () => {
  const response = await api.get('/documents');
  const data = response.data?.data || response.data || [];
  return Array.isArray(data) ? data.map(normalizeDocument) : [];
};

export const uploadDocument = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('document', file);
  if (options.name) formData.append('name', options.name);
  if (options.type) formData.append('type', options.type);
  const response = await api.post('/documents', formData);
  return normalizeDocument(response.data?.data || response.data);
};

export const deleteDocument = async (id) => {
  await api.delete(`/documents/${id}`);
};

export const buildDocumentUrl = (doc = {}) => {
  const serverBase = resolveServerBaseUrl();
  const filePath = doc.filePath || doc.path;
  if (!filePath) return '';
  return `${serverBase}/${String(filePath).replace(/^\/+/, '')}`;
};
