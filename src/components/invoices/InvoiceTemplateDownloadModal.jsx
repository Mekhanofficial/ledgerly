import React, { useEffect, useMemo, useState } from 'react';
import { Download, X } from 'lucide-react';
import { hasTemplateAccess } from '../../utils/templateStorage';

const resolveTemplateAccess = (template) => {
  if (typeof template?.hasAccess === 'boolean') {
    return template.hasAccess;
  }
  if (!template?.id) {
    return false;
  }
  return hasTemplateAccess(template.id);
};

const getCategoryLabel = (template) => {
  const raw = String(template?.category || '').trim().toUpperCase();
  if (raw === 'PREMIUM') return 'Premium';
  if (raw === 'ELITE') return 'Elite';
  if (raw === 'CUSTOM') return 'Custom';
  return 'Standard';
};

const InvoiceTemplateDownloadModal = ({
  isOpen,
  onClose,
  onDownload,
  invoice,
  templates = [],
  isDarkMode = false,
  isDownloading = false
}) => {
  const accessibleTemplates = useMemo(() => {
    const source = Array.isArray(templates) ? templates : [];
    const unlocked = source.filter((template) => resolveTemplateAccess(template));
    return unlocked.length > 0 ? unlocked : source;
  }, [templates]);

  const [selectedTemplateId, setSelectedTemplateId] = useState('standard');

  useEffect(() => {
    if (!isOpen) return;
    const source = accessibleTemplates;
    const invoiceTemplateId = invoice?.templateStyle || invoice?.templateId || 'standard';
    const hasInvoiceTemplate = source.some((template) => template.id === invoiceTemplateId);
    const fallbackTemplate = source.find((template) => template.id === 'standard') || source[0];
    setSelectedTemplateId(hasInvoiceTemplate ? invoiceTemplateId : (fallbackTemplate?.id || 'standard'));
  }, [isOpen, invoice, accessibleTemplates]);

  if (!isOpen) return null;

  const invoiceLabel = invoice?.invoiceNumber || invoice?.number || invoice?.id || 'Invoice';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className={`w-full max-w-xl rounded-2xl border p-6 shadow-2xl ${
          isDarkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-900'
        }`}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">Download Invoice PDF</h3>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Select a template for <span className="font-medium">{invoiceLabel}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-2 ${
              isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
            aria-label="Close download template modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {accessibleTemplates.map((template) => {
            const isSelected = selectedTemplateId === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplateId(template.id)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  isSelected
                    ? isDarkMode
                      ? 'border-primary-500 bg-primary-900/30'
                      : 'border-primary-400 bg-primary-50'
                    : isDarkMode
                      ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{template.name || template.id}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {getCategoryLabel(template)}
                    </p>
                  </div>
                  {isSelected && (
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        isDarkMode ? 'bg-primary-500/20 text-primary-300' : 'bg-primary-100 text-primary-700'
                      }`}
                    >
                      Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDownloading}
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
              isDarkMode
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onDownload(selectedTemplateId)}
            disabled={isDownloading || !selectedTemplateId}
            className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplateDownloadModal;

