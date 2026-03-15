import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FileText,
  UploadCloud,
  Camera,
  Trash2,
  Eye,
  HardDrive,
  Files,
  Archive
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useToast } from '../../context/ToastContext';
import { useAccount } from '../../context/AccountContext';
import { useTheme } from '../../context/ThemeContext';
import { normalizePlanId } from '../../utils/subscription';
import {
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  updateDocument,
  fetchDocumentBlob,
  buildDocumentUrl
} from '../../services/documentService';
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
    allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp', '.gif'],
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ],
    allowAnyImageMime: true,
    acceptedInput: '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.ppt,.pptx,image/*',
    supportedTypesLabel: 'PDF, Office docs, text files, and images',
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
  if (!planConfig.allowedExtensions.includes(extension)) return false;

  const mimeType = String(file?.type || '').toLowerCase();
  if (!mimeType) return true;
  if (planConfig.allowAnyImageMime && mimeType.startsWith('image/')) return true;
  return planConfig.allowedMimeTypes.includes(mimeType);
};

const normalizeUploadTags = (value = '') =>
  Array.from(new Set(
    String(value || '')
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
      .map((entry) => entry.replace(/\s+/g, '-').slice(0, 32))
      .filter(Boolean)
  )).slice(0, 20);

const resolveErrorMessage = (error, fallback = 'Request failed') =>
  error?.response?.data?.error || error?.message || fallback;

const Documents = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const { accountInfo } = useAccount();

  const planId = useMemo(() => {
    const normalizedPlan = normalizePlanId(accountInfo?.plan);
    const subscriptionStatus = String(accountInfo?.subscriptionStatus || 'active').toLowerCase();
    if (subscriptionStatus === 'expired') return 'starter';
    return normalizedPlan;
  }, [accountInfo?.plan, accountInfo?.subscriptionStatus]);

  const planConfig = DOCUMENT_PLAN_CONFIG[planId] || DOCUMENT_PLAN_CONFIG.starter;
  const isStarterPlan = planId === 'starter';
  const isEnterprisePlan = planId === 'enterprise';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openingDocumentId, setOpeningDocumentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [folderFilter, setFolderFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [uploadFolder, setUploadFolder] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const uploadInputRef = useRef(null);
  const bulkUploadInputRef = useRef(null);
  const scanInputRef = useRef(null);
  const selectPageCheckboxRef = useRef(null);

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const normalizedFolder = folderFilter.trim().toLowerCase();
    const normalizedTag = tagFilter.trim().toLowerCase();

    return documents.filter((doc) => {
      if (!showArchived && doc.isArchived) return false;

      if (normalizedSearch) {
        const haystack = [
          doc.name,
          doc.originalName,
          doc.fileName,
          doc.folder,
          ...(Array.isArray(doc.tags) ? doc.tags : [])
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(normalizedSearch)) return false;
      }

      if (isEnterprisePlan && normalizedFolder) {
        if (String(doc.folder || '').trim().toLowerCase() !== normalizedFolder) return false;
      }

      if (isEnterprisePlan && normalizedTag) {
        const tags = Array.isArray(doc.tags) ? doc.tags : [];
        if (!tags.some((tag) => String(tag).toLowerCase().includes(normalizedTag))) return false;
      }

      return true;
    });
  }, [documents, folderFilter, isEnterprisePlan, searchTerm, showArchived, tagFilter]);

  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    paginatedItems: paginatedDocuments
  } = useTablePagination(filteredDocuments, { initialRowsPerPage: 10 });

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
  const selectedDocumentIdSet = useMemo(
    () => new Set(selectedDocumentIds.map((id) => String(id))),
    [selectedDocumentIds]
  );
  const visibleDocumentIds = useMemo(
    () => paginatedDocuments.map((doc) => String(doc.id)).filter(Boolean),
    [paginatedDocuments]
  );
  const selectedVisibleCount = useMemo(
    () => visibleDocumentIds.filter((id) => selectedDocumentIdSet.has(id)).length,
    [visibleDocumentIds, selectedDocumentIdSet]
  );
  const isAllVisibleSelected = visibleDocumentIds.length > 0 && selectedVisibleCount === visibleDocumentIds.length;
  const isSomeVisibleSelected = selectedVisibleCount > 0 && !isAllVisibleSelected;

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDocuments({ includeArchived: isEnterprisePlan });
      setDocuments(data);
    } catch (error) {
      addToast(resolveErrorMessage(error, 'Failed to load documents'), 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, isEnterprisePlan]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    const availableIds = new Set(filteredDocuments.map((doc) => String(doc.id)).filter(Boolean));
    setSelectedDocumentIds((prev) => {
      const next = prev.filter((id) => availableIds.has(String(id)));
      return next.length === prev.length ? prev : next;
    });
  }, [filteredDocuments]);

  useEffect(() => {
    if (!selectPageCheckboxRef.current) return;
    selectPageCheckboxRef.current.indeterminate = isSomeVisibleSelected;
  }, [isSomeVisibleSelected]);

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
      if (skippedFiles.length) addToast(`Skipped: ${skippedFiles.slice(0, 2).join(', ')}`, 'warning');
      clearInputs();
      return;
    }

    setUploading(true);
    try {
      const uploadedFiles = [];
      const failedFiles = [];
      const tagPayload = normalizeUploadTags(uploadTags).join(',');

      for (const file of uploadQueue) {
        try {
          const uploaded = await uploadDocument(file, {
            type,
            folder: isEnterprisePlan ? uploadFolder.trim() : '',
            tags: isEnterprisePlan ? tagPayload : ''
          });
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

      if (failedFiles.length > 0) addToast(`Failed uploads: ${failedFiles.slice(0, 2).join(', ')}`, 'error');
      if (skippedFiles.length > 0) addToast(`Skipped: ${skippedFiles.slice(0, 2).join(', ')}`, 'warning');
    } catch (error) {
      addToast(resolveErrorMessage(error, 'Failed to upload document'), 'error');
    } finally {
      setUploading(false);
      clearInputs();
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((doc) => String(doc.id) !== String(docId)));
      setSelectedDocumentIds((prev) => prev.filter((id) => String(id) !== String(docId)));
      addToast('Document deleted', 'success');
    } catch (error) {
      addToast(resolveErrorMessage(error, 'Failed to delete document'), 'error');
    }
  };

  const handleSelectDocument = (docId, shouldSelect) => {
    const normalizedId = String(docId || '');
    if (!normalizedId) return;

    setSelectedDocumentIds((prev) => {
      const alreadySelected = prev.some((id) => String(id) === normalizedId);
      if (shouldSelect && !alreadySelected) return [...prev, normalizedId];
      if (!shouldSelect && alreadySelected) return prev.filter((id) => String(id) !== normalizedId);
      return prev;
    });
  };

  const handleSelectVisible = (shouldSelect) => {
    if (!visibleDocumentIds.length) return;

    setSelectedDocumentIds((prev) => {
      if (shouldSelect) {
        const next = new Set(prev.map((id) => String(id)));
        visibleDocumentIds.forEach((id) => next.add(id));
        return Array.from(next);
      }

      const visibleSet = new Set(visibleDocumentIds);
      return prev.filter((id) => !visibleSet.has(String(id)));
    });
  };

  const handleDeleteSelected = async () => {
    if (!selectedDocumentIds.length || bulkDeleting) return;

    const selectedSet = new Set(selectedDocumentIds.map((id) => String(id)));
    const targetIds = documents
      .map((doc) => String(doc.id))
      .filter((id) => selectedSet.has(id));

    if (!targetIds.length) return;
    if (!window.confirm(`Delete ${targetIds.length} selected document${targetIds.length > 1 ? 's' : ''}?`)) return;

    setBulkDeleting(true);
    try {
      const results = await Promise.allSettled(targetIds.map((id) => deleteDocument(id)));
      const deletedIds = [];
      let failedCount = 0;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          deletedIds.push(targetIds[index]);
          return;
        }
        failedCount += 1;
      });

      if (deletedIds.length) {
        const deletedSet = new Set(deletedIds);
        setDocuments((prev) => prev.filter((doc) => !deletedSet.has(String(doc.id))));
        setSelectedDocumentIds((prev) => prev.filter((id) => !deletedSet.has(String(id))));
        addToast(
          deletedIds.length === 1 ? '1 document deleted' : `${deletedIds.length} documents deleted`,
          'success'
        );
      }

      if (failedCount > 0) {
        addToast(
          failedCount === 1 ? '1 document failed to delete' : `${failedCount} documents failed to delete`,
          'error'
        );
      }
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleArchiveToggle = async (doc) => {
    if (!planConfig.allowExportArchiveTools) return;

    try {
      const updated = await updateDocument(doc.id, { isArchived: !doc.isArchived });
      setDocuments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      addToast(updated.isArchived ? 'Document archived' : 'Document restored', 'success');
    } catch (error) {
      addToast(resolveErrorMessage(error, 'Failed to update archive status'), 'error');
    }
  };

  const openUrlInNewTab = useCallback((url) => {
    if (!url) return false;

    const openedWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (openedWindow) return true;

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }, []);

  const handleView = useCallback(async (doc) => {
    const documentId = String(doc?.id || '').trim();
    if (!documentId) {
      addToast('Unable to open document', 'warning');
      return;
    }

    if (openingDocumentId && openingDocumentId === documentId) return;

    setOpeningDocumentId(documentId);
    try {
      const blob = await fetchDocumentBlob(documentId);
      const objectUrl = URL.createObjectURL(blob);
      openUrlInNewTab(objectUrl);
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      const fallbackUrl = buildDocumentUrl(doc || {});
      if (/^https?:\/\//i.test(String(fallbackUrl || ''))) {
        openUrlInNewTab(fallbackUrl);
      } else {
        addToast(resolveErrorMessage(error, 'Failed to open document'), 'error');
      }
    } finally {
      setOpeningDocumentId((current) => (current === documentId ? null : current));
    }
  }, [addToast, openingDocumentId, openUrlInNewTab]);

  const handleExportMetadata = () => {
    if (!planConfig.allowExportArchiveTools) return;
    if (!documents.length) {
      addToast('No documents available to export', 'warning');
      return;
    }

    const headers = ['ID', 'Name', 'Type', 'Mime Type', 'Size (Bytes)', 'Folder', 'Tags', 'Archived', 'Created At'];
    const rows = documents.map((doc) => [
      doc.id || '',
      (doc.name || '').replaceAll('"', '""'),
      doc.type || '',
      doc.mimeType || '',
      String(Number(doc.size) || 0),
      doc.folder || '',
      Array.isArray(doc.tags) ? doc.tags.join('|') : '',
      doc.isArchived ? 'yes' : 'no',
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
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
            {isEnterprisePlan && planConfig.enterpriseStorageNote && (
              <p className="text-sm text-primary-600 dark:text-primary-300 mt-2">{planConfig.enterpriseStorageNote}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={uploadInputRef}
              type="file"
              accept={planConfig.acceptedInput}
              className="hidden"
              onChange={(event) => handleUpload(event.target.files, 'document')}
            />
            <input
              ref={bulkUploadInputRef}
              type="file"
              multiple
              accept={planConfig.acceptedInput}
              className="hidden"
              onChange={(event) => handleUpload(event.target.files, 'document')}
            />
            <input
              ref={scanInputRef}
              type="file"
              accept={isStarterPlan ? '.jpg,.jpeg,.png' : 'image/*'}
              capture="environment"
              className="hidden"
              onChange={(event) => handleUpload(event.target.files, 'scan')}
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

        {isEnterprisePlan && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={uploadFolder}
              onChange={(event) => setUploadFolder(event.target.value)}
              placeholder="Upload folder (enterprise)"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              value={uploadTags}
              onChange={(event) => setUploadTags(event.target.value)}
              placeholder="Upload tags, comma separated (enterprise)"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search documents"
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
          />
          {isEnterprisePlan && (
            <input
              type="text"
              value={folderFilter}
              onChange={(event) => setFolderFilter(event.target.value)}
              placeholder="Filter by folder"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
            />
          )}
          {isEnterprisePlan && (
            <input
              type="text"
              value={tagFilter}
              onChange={(event) => setTagFilter(event.target.value)}
              placeholder="Filter by tag"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
            />
          )}
          {isEnterprisePlan && (
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(event) => setShowArchived(event.target.checked)}
                className="h-4 w-4"
              />
              Show archived
            </label>
          )}
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
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Documents</h2>
            <div className="flex items-center gap-3 flex-wrap">
              {filteredDocuments.length > 0 && (
                <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <input
                    ref={selectPageCheckboxRef}
                    type="checkbox"
                    checked={isAllVisibleSelected}
                    onChange={(event) => handleSelectVisible(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                  />
                  Select page ({selectedVisibleCount}/{visibleDocumentIds.length})
                </label>
              )}
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={!selectedDocumentIds.length || bulkDeleting}
                className="inline-flex items-center px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {bulkDeleting ? 'Deleting...' : `Delete Selected${selectedDocumentIds.length ? ` (${selectedDocumentIds.length})` : ''}`}
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredDocuments.length.toLocaleString()} shown / {documents.length.toLocaleString()} total
              </span>
            </div>
          </div>
          {loading ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
              No documents uploaded yet.
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
              No documents match the current filters.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedDocumentIdSet.has(String(doc.id))}
                      onChange={(event) => handleSelectDocument(doc.id, event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                      aria-label={`Select ${doc.name}`}
                    />
                    <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-600 dark:text-primary-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{doc.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {doc.type === 'scan' ? 'Scan' : 'Document'} | {formatFileSize(doc.size)} |{' '}
                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Unknown'}
                        {doc.isArchived ? ' | Archived' : ''}
                      </p>
                      {isEnterprisePlan && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Folder: {doc.folder || 'None'} | Tags: {(doc.tags || []).join(', ') || 'None'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleView(doc)}
                      disabled={openingDocumentId === String(doc.id)}
                      className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {openingDocumentId === String(doc.id) ? 'Opening...' : 'Open'}
                    </button>
                    {planConfig.allowExportArchiveTools && (
                      <button
                        onClick={() => handleArchiveToggle(doc)}
                        className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Archive className="w-4 h-4 mr-1" />
                        {doc.isArchived ? 'Restore' : 'Archive'}
                      </button>
                    )}
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
          {!loading && filteredDocuments.length > 0 && (
            <TablePagination
              page={page}
              totalItems={filteredDocuments.length}
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
