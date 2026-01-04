import React from 'react';
import { Upload } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const InvoiceSummary = ({ 
  subtotal, 
  totalTax, 
  totalAmount,
  onSaveDraft,
  onSendInvoice,
  onPreview,
  attachments,
  setAttachments 
}) => {
  const { isDarkMode } = useTheme();

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setAttachments([...attachments, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className={`border rounded-xl p-6 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-lg font-semibold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Summary
        </h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Subtotal
            </span>
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Discount
            </span>
            <div className="flex items-center">
              <input
                type="number"
                className={`w-16 px-2 py-1 border rounded text-right ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300'
                }`}
                defaultValue="0.00"
                min="0"
              />
              <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                %
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Tax
            </span>
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ${totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Total
              </span>
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attachments Card */}
      <div className={`border rounded-xl p-6 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Attachments
        </h2>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDarkMode 
              ? 'border-gray-600 hover:border-primary-400' 
              : 'border-gray-300 hover:border-primary-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <Upload className={`w-8 h-8 mx-auto mb-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-400'
          }`} />
          <p className={`text-sm mb-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Drag & drop files here or click to browse
          </p>
          <p className={`text-xs ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Max file size: 10MB
          </p>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
        
        {attachments.length > 0 && (
          <div className="mt-4">
            <h3 className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Attached Files:
            </h3>
            <ul className="space-y-2">
              {attachments.map((file, index) => (
                <li key={index} className={`flex items-center justify-between text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <span>{file.name}</span>
                  <span className={`text-xs ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3">
        <button 
          onClick={onPreview}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            isDarkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Preview
        </button>
        <button 
          onClick={onSaveDraft}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Save as Draft
        </button>
        <button 
          onClick={onSendInvoice}
          className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
        >
          Send Invoice
        </button>
      </div>
    </div>
  );
};

export default InvoiceSummary;