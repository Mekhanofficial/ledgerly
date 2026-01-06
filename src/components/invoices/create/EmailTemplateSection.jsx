// src/components/invoices/create/EmailTemplateSection.jsx
import React from 'react';

const EmailTemplateSection = ({
  emailSubject,
  setEmailSubject,
  emailMessage,
  setEmailMessage,
  onCustomize
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Email Template
      </h2>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Subject
          </label>
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Message
          </label>
          <textarea
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
            rows="4"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={onCustomize}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Customize Email Template
        </button>
      </div>
    </div>
  );
};

export default EmailTemplateSection;