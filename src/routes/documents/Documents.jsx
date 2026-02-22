import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, UploadCloud, Camera, Trash2, Eye } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useToast } from '../../context/ToastContext';
import { useAccount } from '../../context/AccountContext';
import { normalizePlanId } from '../../utils/subscription';
import { fetchDocuments, uploadDocument, deleteDocument, buildDocumentUrl } from '../../services/documentService';

const FREE_DOCUMENT_LIMIT = 5;

const formatFileSize = (bytes = 0) => {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const Documents = () => {
  const { addToast } = useToast();
  const { accountInfo } = useAccount();
  const planId = normalizePlanId(accountInfo?.plan);
  const isFreePlan = planId === 'starter';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const uploadInputRef = useRef(null);
  const scanInputRef = useRef(null);

  const remainingUploads = useMemo(() => {
    if (!isFreePlan) return null;
    return Math.max(0, FREE_DOCUMENT_LIMIT - documents.length);
  }, [documents.length, isFreePlan]);

  const canUploadMore = !isFreePlan || documents.length < FREE_DOCUMENT_LIMIT;

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (error) {
      addToast(error?.message || 'Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (file, type) => {
    if (!file) return;
    if (!canUploadMore) {
      addToast('Free plan limit reached. Upgrade to upload more documents.', 'warning');
      return;
    }
    setUploading(true);
    try {
      const uploaded = await uploadDocument(file, { type });
      setDocuments((prev) => [uploaded, ...prev]);
      addToast('Document uploaded successfully', 'success');
    } catch (error) {
      addToast(error?.message || 'Failed to upload document', 'error');
    } finally {
      setUploading(false);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
      if (scanInputRef.current) scanInputRef.current.value = '';
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
            {isFreePlan && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                Free plan includes {FREE_DOCUMENT_LIMIT} documents. {remainingUploads} remaining.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={uploadInputRef}
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files?.[0], 'document')}
            />
            <input
              ref={scanInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files?.[0], 'scan')}
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
            <button
              type="button"
              onClick={() => scanInputRef.current?.click()}
              disabled={uploading || !canUploadMore}
              className="inline-flex items-center px-4 py-2 border border-primary-600 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-60"
            >
              <Camera className="w-4 h-4 mr-2" />
              Scan
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Documents</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{documents.length} total</span>
          </div>
          {loading ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
              No documents uploaded yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {documents.map((doc) => (
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
                        {doc.type === 'scan' ? 'Scan' : 'Document'} • {formatFileSize(doc.size)} •{' '}
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documents;
