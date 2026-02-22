// src/components/invoices/create/InvoiceSummary.jsx
import React from 'react';

const InvoiceSummary = ({ subtotal, totalTax, totalAmount, currency, taxLabel = 'Tax', showTax = true }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Summary
      </h2>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {currency} {subtotal.toFixed(2)}
          </span>
        </div>
        {showTax && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">{taxLabel}:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {currency} {totalTax.toFixed(2)}
            </span>
          </div>
        )}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Total:
            </span>
            <span className="text-2xl font-bold text-primary-600">
              {currency} {totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;
