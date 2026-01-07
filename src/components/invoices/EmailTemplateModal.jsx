// src/components/invoices/EmailTemplateModal.js
import React, { useState } from 'react';
import { X, Save, Mail } from 'lucide-react';

const EmailTemplateModal = ({ subject, message, onSave, onClose }) => {
  const [customSubject, setCustomSubject] = useState(subject);
  const [customMessage, setCustomMessage] = useState(message);
  const [variables] = useState([
    { label: 'Customer Name', value: '{customerName}' },
    { label: 'Invoice Number', value: '{invoiceNumber}' },
    { label: 'Invoice Date', value: '{invoiceDate}' },
    { label: 'Due Date', value: '{dueDate}' },
    { label: 'Total Amount', value: '{totalAmount}' },
    { label: 'Company Name', value: '{companyName}' },
  ]);

  const insertVariable = (variable) => {
    const textarea = document.querySelector('#emailMessage');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = customMessage.substring(0, start) + variable + customMessage.substring(end);
    setCustomMessage(newMessage);
    textarea.focus();
    textarea.setSelectionRange(start + variable.length, start + variable.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <Mail className="w-5 h-5 mr-2 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customize Email Template</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
          {/* Variables */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Insert Variables</h3>
            <div className="flex flex-wrap gap-2">
              {variables.map((variable, index) => (
                <button
                  key={index}
                  onClick={() => insertVariable(variable.value)}
                  className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm hover:bg-primary-200 dark:hover:bg-primary-900/50"
                >
                  {variable.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Email Subject
            </label>
            <input
              type="text"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Invoice for Services Rendered"
            />
          </div>
          
          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Email Message
            </label>
            <textarea
              id="emailMessage"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows="8"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              placeholder="Dear {customerName},..."
            />
          </div>
          
          {/* Preview */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Preview</h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
              <div className="text-sm text-gray-600 dark:text-gray-400">Subject: {customSubject}</div>
              <div className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {customMessage.replace(/\{.*?\}/g, match => (
                  <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-1 rounded">
                    {match}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(customSubject, customMessage)}
            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateModal;