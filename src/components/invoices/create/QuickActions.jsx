// src/components/invoices/create/QuickActions.jsx
import React from 'react';
import { Download, Save, Printer } from 'lucide-react';

const QuickActions = ({ 
  onDownloadPDF, 
  onSaveDraft, 
  onPrint
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Quick Actions
      </h2>
      
      <div className="space-y-3">
        <button
          onClick={onDownloadPDF}
          className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </button>
        
        <button
          onClick={onSaveDraft}
          className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </button>
        
        {onPrint && (
          <button
            onClick={onPrint}
            className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickActions;