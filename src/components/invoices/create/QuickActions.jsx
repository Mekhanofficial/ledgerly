// src/components/invoices/create/QuickActions.jsx
import React from 'react';
import { Download, Save, Palette, Printer } from 'lucide-react';

const QuickActions = ({ 
  onDownloadPDF, 
  onSaveDraft, 
  onSaveTemplate, 
  onPrint,
  isSavingTemplate = false 
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
        
        <button
          onClick={onSaveTemplate}
          disabled={isSavingTemplate}
          className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-200 ${
            isSavingTemplate 
              ? 'opacity-50 cursor-not-allowed text-gray-500' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Palette className="w-4 h-4 mr-2" />
          {isSavingTemplate ? 'Saving Template...' : 'Save as Template'}
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
      
      {/* Template Usage Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>Tip:</strong> Save this invoice as a template to reuse it later for similar invoices.
        </p>
      </div>
    </div>
  );
};

export default QuickActions;