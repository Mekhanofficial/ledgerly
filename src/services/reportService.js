import api from './api';
import { isAccessDeniedError } from '../utils/accessControl';

const LOCAL_REPORTS_KEY = 'ledgerly_reports';
const LOCAL_REPORT_ID_PREFIX = 'LOCAL-REPORT-';

const mapReportResponse = (report = {}) => ({
  ...report,
  id: report.id || report._id || report._id?.toString()
});

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const readLocalReports = () => {
  if (!canUseStorage()) return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_REPORTS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Unable to read local reports:', error);
    return [];
  }
};

const sortReports = (reports = []) => {
  return [...reports].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || a.generatedAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || b.generatedAt || 0).getTime();
    return bTime - aTime;
  });
};

const writeLocalReports = (reports = []) => {
  if (!canUseStorage()) return;
  const normalized = sortReports(reports);

  try {
    window.localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event('reportsUpdated'));
  } catch (error) {
    console.error('Unable to write local reports:', error);
  }
};

const upsertLocalReport = (report) => {
  const mapped = mapReportResponse(report);
  const reports = readLocalReports();
  const index = reports.findIndex((item) => String(item.id) === String(mapped.id));

  if (index >= 0) {
    reports[index] = {
      ...reports[index],
      ...mapped
    };
  } else {
    reports.unshift(mapped);
  }

  writeLocalReports(reports);
  return mapped;
};

const removeLocalReport = (id) => {
  const reports = readLocalReports();
  const nextReports = reports.filter((item) => String(item.id) !== String(id));
  writeLocalReports(nextReports);
};

const shouldFallbackToLocal = (error) => {
  if (isAccessDeniedError(error)) return true;

  const status = error?.response?.status;
  if ([401, 402, 403, 404].includes(status)) return true;

  const message =
    error?.response?.data?.error
    || error?.response?.data?.message
    || error?.message
    || '';

  return /plan|subscription|upgrade|starter|billing|payment required/i.test(String(message));
};

const isLocalReportId = (id) => String(id || '').startsWith(LOCAL_REPORT_ID_PREFIX);

export const fetchReports = async () => {
  try {
    const response = await api.get('/reports/history');
    const reports = (response?.data?.data || []).map(mapReportResponse);
    if (reports.length > 0) {
      writeLocalReports(reports);
    }
    return reports;
  } catch (error) {
    if (!shouldFallbackToLocal(error)) throw error;
    return readLocalReports().map(mapReportResponse);
  }
};

export const createReport = async (payload) => {
  try {
    const response = await api.post('/reports/history', payload);
    const report = mapReportResponse(response?.data?.data);
    upsertLocalReport(report);
    return report;
  } catch (error) {
    if (!shouldFallbackToLocal(error)) throw error;

    const now = new Date().toISOString();
    const localReport = {
      ...payload,
      id: payload?.id || `LOCAL-REPORT-${Date.now()}`,
      createdAt: payload?.createdAt || now,
      updatedAt: payload?.updatedAt || now,
      status: payload?.status || 'processing',
      progress: Number.isFinite(Number(payload?.progress)) ? Number(payload.progress) : 0,
      localOnly: true
    };

    return upsertLocalReport(localReport);
  }
};

export const updateReport = async (id, updates) => {
  if (isLocalReportId(id)) {
    const reports = readLocalReports();
    const index = reports.findIndex((item) => String(item.id) === String(id));
    const now = new Date().toISOString();

    if (index === -1) {
      const fallback = upsertLocalReport({
        id,
        ...updates,
        updatedAt: now,
        localOnly: true
      });
      return fallback;
    }

    const next = {
      ...reports[index],
      ...updates,
      updatedAt: now,
      localOnly: true
    };

    reports[index] = next;
    writeLocalReports(reports);
    return mapReportResponse(next);
  }

  try {
    const response = await api.patch(`/reports/history/${id}`, updates);
    const report = mapReportResponse(response?.data?.data);
    upsertLocalReport(report);
    return report;
  } catch (error) {
    if (!shouldFallbackToLocal(error)) throw error;

    const reports = readLocalReports();
    const index = reports.findIndex((item) => String(item.id) === String(id));
    const now = new Date().toISOString();

    if (index === -1) {
      const fallback = upsertLocalReport({
        id,
        ...updates,
        updatedAt: now,
        localOnly: true
      });
      return fallback;
    }

    const next = {
      ...reports[index],
      ...updates,
      updatedAt: now,
      localOnly: true
    };

    reports[index] = next;
    writeLocalReports(reports);
    return mapReportResponse(next);
  }
};

export const deleteReport = async (id) => {
  if (isLocalReportId(id)) {
    removeLocalReport(id);
    return { success: true, localOnly: true };
  }

  try {
    const response = await api.delete(`/reports/history/${id}`);
    removeLocalReport(id);
    return response.data;
  } catch (error) {
    if (!shouldFallbackToLocal(error)) throw error;
    removeLocalReport(id);
    return { success: true, localOnly: true };
  }
};

export const recordDownload = async (id) => {
  if (isLocalReportId(id)) {
    const reports = readLocalReports();
    const index = reports.findIndex((item) => String(item.id) === String(id));
    if (index === -1) {
      return mapReportResponse({ id, localOnly: true });
    }

    const current = reports[index];
    const next = {
      ...current,
      downloadCount: (Number(current.downloadCount) || 0) + 1,
      downloadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      localOnly: true
    };

    reports[index] = next;
    writeLocalReports(reports);
    return mapReportResponse(next);
  }

  try {
    const response = await api.post(`/reports/history/${id}/download`);
    const report = mapReportResponse(response?.data?.data);
    upsertLocalReport(report);
    return report;
  } catch (error) {
    if (!shouldFallbackToLocal(error)) throw error;

    const reports = readLocalReports();
    const index = reports.findIndex((item) => String(item.id) === String(id));
    if (index === -1) {
      return mapReportResponse({ id, localOnly: true });
    }

    const current = reports[index];
    const next = {
      ...current,
      downloadCount: (Number(current.downloadCount) || 0) + 1,
      downloadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      localOnly: true
    };

    reports[index] = next;
    writeLocalReports(reports);
    return mapReportResponse(next);
  }
};
