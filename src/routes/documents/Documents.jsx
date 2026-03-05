import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileText, UploadCloud, Camera, Trash2, Eye, HardDrive, Files, Archive } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useToast } from '../../context/ToastContext';
import { useAccount } from '../../context/AccountContext';
import { useTheme } from '../../context/ThemeContext';
import { normalizePlanId } from '../../utils/subscription';
import { fetchDocuments, uploadDocument, deleteDocument, buildDocumentUrl } from '../../services/documentService';
import TablePagination from '../../components/ui/TablePagination';
import { useTablePagination } from '../../hooks/usePagination';

const MB = 1024 * 1024;
const GB = 1024 * MB;

const DOCUMENT_PLAN_CONFIG = {
  starter: {
    label: 'Starter (Free)',
    maxDocuments: 50,
    maxStorageBytes: 250 * MB,
    allowBulkUpload: false,
    allowFolderOrganization: false,
    allowAdvancedTagging: false,
    allowExportArchiveTools: false,
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    allowAnyImageMime: false,
    acceptedInput: '.pdf,.jpg,.jpeg,.png',
    supportedTypesLabel: 'PDF, JPG, PNG'
  },
  professional: {
    label: 'Professional',
    maxDocuments: 1000,
    maxStorageBytes: 5 * GB,
    allowBulkUpload: true,
    allowFolderOrganization: false,
    allowAdvancedTagging: false,
    allowExportArchiveTools: false,
    allowedExtensions: ['.pdf', '.docx', '.xlsx', '.csv', '.jpg', '.jpeg', '.png', '.webp', '.gif'],
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ],
    allowAnyImageMime: true,
    acceptedInput: '.pdf,.docx,.xlsx,.csv,image/*',
    supportedTypesLabel: 'PDF, DOCX, XLSX, CSV, images'
  },
  enterprise: {
    label: 'Enterprise',
    maxDocuments: 10000,
    maxStorageBytes: 50 * GB,
    allowBulkUpload: true,
    allowFolderOrganization: true,
    allowAdvancedTagging: true,
    allowExportArchiveTools: true,
    allowedExtensions: ['.pdf', '.docx', '.xlsx', '.csv', '.jpg', '.jpeg', '.png', '.webp', '.gif'],
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ],
    allowAnyImageMime: true,
    acceptedInput: '.pdf,.docx,.xlsx,.csv,image/*',
    supportedTypesLabel: 'PDF, DOCX, XLSX, CSV, images',
    enterpriseStorageNote: 'Up to 50GB storage included. Need more? Contact sales.'
  }
};

const formatFileSize = (bytes = 0) => {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const getFileExtension = (fileName = '') => {
  const value = String(fileName || '').trim().toLowerCase();
  const dotIndex = value.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return value.slice(dotIndex);
};

const isAllowedFileForPlan = (file, planConfig) => {
  const extension = getFileExtension(file?.name);
  if (!planConfig.allowedExtensions.includes(extension)) {
    return false;
  }

  const mimeType = String(file?.type || '').toLowerCase();
  if (!mimeType) {
    return true;
  }
  if (planConfig.allowAnyImageMime && mimeType.startsWith('image/')) {
    return true;
  }
  return planConfig.allowedMimeTypes.includes(mimeType);
};

const Documents = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const { accountInfo } = useAccount();
  const planId = useMemo(() => {
    const normalizedPlan = normalizePlanId(accountInfo?.plan);
    const subscriptionStatus = String(accountInfo?.subscriptionStatus || 'active').toLowerCase();
    if (subscriptionStatus === 'expired') {
      return 'starter';
    }
    return normalizedPlan;
  }, [accountInfo?.plan, accountInfo?.subscriptionStatus]);
  const planConfig = DOCUMENT_PLAN_CONFIG[planId] || DOCUMENT_PLAN_CONFIG.starter;
  const isStarterPlan = planId === 'starter';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const uploadInputRef = useRef(null);
  const bulkUploadInputRef = useRef(null);
  const scanInputRef = useRef(null);
  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    paginatedItems: paginatedDocuments
  } = useTablePagination(documents, { initialRowsPerPage: 10 });

  const totalStorageUsed = useMemo(
    () => documents.reduce((sum, doc) => sum + (Number(doc?.size) || 0), 0),
    [documents]
  );

  const remainingDocuments = useMemo(
    () => Math.max(0, planConfig.maxDocuments - documents.length),
    [planConfig.maxDocuments, documents.length]
  );

  const remainingStorage = useMemo(
    () => Math.max(0, planConfig.maxStorageBytes - totalStorageUsed),
    [planConfig.maxStorageBytes, totalStorageUsed]
  );

  const canUploadMore = remainingDocuments > 0 && remainingStorage > 0;

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (error) {
      addToast(error?.message || 'Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const clearInputs = () => {
    if (uploadInputRef.current) uploadInputRef.current.value = '';
    if (bulkUploadInputRef.current) bulkUploadInputRef.current.value = '';
    if (scanInputRef.current) scanInputRef.current.value = '';
  };

  const handleUpload = async (files, type = 'document') => {
    const selectedFiles = Array.from(files || []).filter(Boolean);
    if (!selectedFiles.length) return;

    if (selectedFiles.length > 1 && !planConfig.allowBulkUpload) {
      addToast('Bulk upload is not available on Starter. Upgrade to Professional or Enterprise.', 'warning');
      clearInputs();
      return;
    }

    if (!canUploadMore) {
      addToast('Document limit reached for your current plan. Upgrade to continue uploading.', 'warning');
      clearInputs();
      return;
    }

    const uploadQueue = [];
    const skippedFiles = [];
    let projectedCount = documents.length;
    let projectedStorage = totalStorageUsed;

    selectedFiles.forEach((file) => {
      const fileSize = Number(file?.size) || 0;
      const fileName = String(file?.name || 'Unnamed file');

      if (!isAllowedFileForPlan(file, planConfig)) {
        skippedFiles.push(`${fileName} (unsupported file type)`);
        return;
      }

      if (projectedCount + 1 > planConfig.maxDocuments) {
        skippedFiles.push(`${fileName} (document limit reached)`);
        return;
      }

      if (projectedStorage + fileSize > planConfig.maxStorageBytes) {
        skippedFiles.push(`${fileName} (storage limit reached)`);
        return;
      }

      uploadQueue.push(file);
      projectedCount += 1;
      projectedStorage += fileSize;
    });

    if (!uploadQueue.length) {
      addToast('No files were uploaded. Check file type, plan limits, and remaining storage.', 'warning');
      if (skippedFiles.length) {
        addToast(`Skipped: ${skippedFiles.slice(0, 2).join(', ')}`, 'warning');
      }
      clearInputs();
      return;
    }

    setUploading(true);
    try {
      const uploadedFiles = [];
      const failedFiles = [];

      for (const file of uploadQueue) {
        try {
          const uploaded = await uploadDocument(file, { type });
          uploadedFiles.push(uploaded);
        } catch {
          failedFiles.push(file.name || 'Unnamed file');
        }
      }

      if (uploadedFiles.length > 0) {
        setDocuments((prev) => [...uploadedFiles, ...prev]);
        addToast(
          uploadedFiles.length === 1
            ? 'Document uploaded successfully'
            : `${uploadedFiles.length} documents uploaded successfully`,
          'success'
        );
      }

      if (failedFiles.length > 0) {
        addToast(`Failed uploads: ${failedFiles.slice(0, 2).join(', ')}`, 'error');
      }

      if (skippedFiles.length > 0) {
        addToast(`Skipped: ${skippedFiles.slice(0, 2).join(', ')}`, 'warning');
      }
    } catch (error) {
      addToast(error?.message || 'Failed to upload document', 'error');
    } finally {
      setUploading(false);
      clearInputs();
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      addToast('Document deleted', 'success');
    } catch (error) {
      addToast(error?.message || 'Failed to delete document', 'error');
    }
  };

  const handleView = (doc) => {
    const url = buildDocumentUrl(doc);
    if (!url) {
      addToast('Unable to open document', 'warning');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleExportMetadata = () => {
    if (!planConfig.allowExportArchiveTools) return;
    if (!documents.length) {
      addToast('No documents available to export', 'warning');
      return;
    }

    const headers = ['ID', 'Name', 'Type', 'Mime Type', 'Size (Bytes)', 'Created At'];
    const rows = documents.map((doc) => [
      doc.id || '',
      (doc.name || '').replaceAll('"', '""'),
      doc.type || '',
      doc.mimeType || '',
      String(Number(doc.size) || 0),
      doc.createdAt || ''
    ]);
    const csv = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `documents-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Document metadata exported', 'success');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Documents
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Upload PDFs, scans, and business documents for quick access.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Plan: {planConfig.label} | Max documents: {planConfig.maxDocuments.toLocaleString()} | Supported: {planConfig.supportedTypesLabel}
            </p>
            {isStarterPlan && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                Starter limits: {remainingDocuments} documents left and {formatFileSize(remainingStorage)} storage left.
              </p>
            )}
            {planId === 'enterprise' && planConfig.enterpriseStorageNote && (
              <p className="text-sm text-primary-600 dark:text-primary-300 mt-2">
                {planConfig.enterpriseStorageNote}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={uploadInputRef}
              type="file"
              accept={planConfig.acceptedInput}
              className="hidden"
              onChange={(e) => handleUpload(e.target.files, 'document')}
            />
            <input
              ref={bulkUploadInputRef}
              type="file"
              multiple
              accept={planConfig.acceptedInput}
              className="hidden"
              onChange={(e) => handleUpload(e.target.files, 'document')}
            />
            <input
              ref={scanInputRef}
              type="file"
              accept={isStarterPlan ? '.jpg,.jpeg,.png' : 'image/*'}
              capture="environment"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files, 'scan')}
            />
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              disabled={uploading || !canUploadMore}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              Upload Document
            </button>
            {planConfig.allowBulkUpload && (
              <button
                type="button"
                onClick={() => bulkUploadInputRef.current?.click()}
                disabled={uploading || !canUploadMore}
                className="inline-flex items-center px-4 py-2 border border-primary-600 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-60"
              >
                <Files className="w-4 h-4 mr-2" />
                Bulk Upload
              </button>
            )}
            <button
              type="button"
              onClick={() => scanInputRef.current?.click()}
              disabled={uploading || !canUploadMore}
              className="inline-flex items-center px-4 py-2 border border-primary-600 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-60"
            >
              <Camera className="w-4 h-4 mr-2" />
              Scan
            </button>
            {planConfig.allowExportArchiveTools && (
              <button
                type="button"
                onClick={handleExportMetadata}
                disabled={loading || !documents.length}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
              >
                <Archive className="w-4 h-4 mr-2" />
                Export Metadata
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Document Usage</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
              {documents.length.toLocaleString()} / {planConfig.maxDocuments.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {remainingDocuments.toLocaleString()} remaining
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <HardDrive className="w-4 h-4" />
              Storage Usage
            </div>
            <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
              {formatFileSize(totalStorageUsed)} / {formatFileSize(planConfig.maxStorageBytes)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatFileSize(remainingStorage)} remaining
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Plan Features</p>
            <div className="mt-2 space-y-1 text-sm">
              <p className={planConfig.allowBulkUpload ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}>
                Bulk upload: {planConfig.allowBulkUpload ? 'Enabled' : 'Locked'}
              </p>
              <p className={planConfig.allowFolderOrganization ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}>
                Folder organization: {planConfig.allowFolderOrganization ? 'Enabled' : 'Enterprise only'}
              </p>
              <p className={planConfig.allowAdvancedTagging ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}>
                Advanced tagging: {planConfig.allowAdvancedTagging ? 'Enabled' : 'Enterprise only'}
              </p>
              <p className={planConfig.allowExportArchiveTools ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}>
                Export and archive tools: {planConfig.allowExportArchiveTools ? 'Enabled' : 'Enterprise only'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Documents</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {documents.length.toLocaleString()} total
            </span>
          </div>
          {loading ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
              No documents uploaded yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-600 dark:text-primary-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{doc.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {doc.type === 'scan' ? 'Scan' : 'Document'} | {formatFileSize(doc.size)} |{' '}
                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleView(doc)}
                      className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="inline-flex items-center px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && documents.length > 0 && (
            <TablePagination
              page={page}
              totalItems={documents.length}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
              isDarkMode={isDarkMode}
              itemLabel="documents"
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documents;
