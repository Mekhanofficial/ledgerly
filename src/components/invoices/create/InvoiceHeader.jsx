// src/components/invoices/create/InvoiceHeader.jsx
import React from 'react';
import { Eye, Mail, Download } from 'lucide-react';

const InvoiceHeader = ({ onPreview, onSaveDraft, onSend, isSending }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Create Invoice
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Create and send professional invoices to your customers
        </p>
      </div>
      <div className="flex items-center space-x-3 mt-4 md:mt-0">
        <button 
          onClick={onPreview}
          className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </button>
        <button 
          onClick={onSaveDraft}
          className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Save Draft
        </button>
        <button 
          onClick={onSend}
          disabled={isSending}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Mail className="w-4 h-4 mr-2" />
          {isSending ? 'Sending...' : 'Send Invoice'}
        </button>
      </div>
    </div>
  );
};

export default InvoiceHeader;