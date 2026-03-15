import api from './api';
import { resolveServerBaseUrl } from '../utils/apiConfig';

const normalizeDocumentFilePath = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      const uploadsMatch = parsed.pathname.match(/\/uploads\/.+$/i);
      if (uploadsMatch?.[0]) {
        return uploadsMatch[0].replace(/^\/+/, '');
      }
    } catch {
      return raw;
    }
  }

  const normalized = raw
    .replace(/\\/g, '/')
    .replace(/^\.?\//, '')
    .replace(/^\/+/, '');

  const uploadsMatch = normalized.match(/(?:^|\/)(uploads\/.+)$/i);
  if (uploadsMatch?.[1]) {
    return uploadsMatch[1];
  }

  const apiUploadsMatch = normalized.match(/(?:^|\/)api\/v\d+\/(uploads\/.+)$/i);
  if (apiUploadsMatch?.[1]) {
    return apiUploadsMatch[1];
  }

  return normalized;
};

const normalizeDocument = (doc = {}) => ({
  id: doc.id || doc._id,
  name: doc.name || doc.originalName || doc.fileName || 'Untitled document',
  originalName: doc.originalName,
  fileName: doc.fileName,
  filePath: normalizeDocumentFilePath(doc.filePath),
  fileUrl: doc.fileUrl || '',
  mimeType: doc.mimeType,
  size: doc.size,
  type: doc.type || 'document',
  folder: doc.folder || '',
  tags: Array.isArray(doc.tags) ? doc.tags : [],
  isArchived: Boolean(doc.isArchived),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt
});

export const fetchDocuments = async (options = {}) => {
  const params = {};
  if (options.includeArchived) params.includeArchived = true;
  if (options.search) params.search = options.search;
  if (options.folder) params.folder = options.folder;
  if (options.tag) params.tag = options.tag;

  const response = await api.get('/documents', { params });
  const data = response.data?.data || response.data || [];
  return Array.isArray(data) ? data.map(normalizeDocument) : [];
};

export const uploadDocument = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('document', file);
  if (options.name) formData.append('name', options.name);
  if (options.type) formData.append('type', options.type);
  if (options.folder) formData.append('folder', options.folder);
  if (options.tags) formData.append('tags', options.tags);
  const response = await api.post('/documents', formData);
  return normalizeDocument(response.data?.data || response.data);
};

export const deleteDocument = async (id) => {
  await api.delete(`/documents/${id}`);
};

export const updateDocument = async (id, payload = {}) => {
  const response = await api.put(`/documents/${id}`, payload);
  return normalizeDocument(response.data?.data || response.data);
};

export const fetchDocumentBlob = async (id) => {
  const response = await api.get(`/documents/${id}/content`, {
    responseType: 'blob'
  });
  return response.data;
};

export const buildDocumentUrl = (doc = {}) => {
  if (doc.fileUrl && /^https?:\/\//i.test(String(doc.fileUrl))) {
    return String(doc.fileUrl);
  }

  const serverBase = resolveServerBaseUrl();
  const filePath = normalizeDocumentFilePath(doc.filePath || doc.path);
  if (!filePath) return '';
  if (/^https?:\/\//i.test(String(filePath))) {
    return String(filePath);
  }
  return `${serverBase}/${String(filePath).replace(/^\/+/, '')}`;
};
