// src/components/invoices/InvoicePreviewModal.js
import React from 'react';
import { X, Mail, Download, Printer } from 'lucide-react';

const InvoicePreviewModal = ({ invoiceData, onClose, onSend }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoiceData.currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Invoice Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">INVOICE</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  #{invoiceData.invoiceNumber}<br />
                  Issue Date: {new Date(invoiceData.issueDate).toLocaleDateString()}<br />
                  Due Date: {new Date(invoiceData.dueDate).toLocaleDateString()}<br />
                  Payment Terms: {invoiceData.paymentTerms}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">ledgerly</div>
                <div className="text-gray-600 dark:text-gray-300">
                  123 Business Street<br />
                  City, State 12345<br />
                  contact@ledgerly.com
                </div>
              </div>
            </div>
            
            {/* Customer Info */}
            {invoiceData.customer && (
              <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white mb-2">Bill To:</div>
                <div className="text-gray-600 dark:text-gray-300">
                  <div className="font-medium">{invoiceData.customer.name}</div>
                  <div>{invoiceData.customer.address}</div>
                  <div>{invoiceData.customer.email}</div>
                  <div>{invoiceData.customer.phone}</div>
                </div>
              </div>
            )}
            
            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-3 text-left text-gray-700 dark:text-gray-300">Description</th>
                    <th className="py-3 text-left text-gray-700 dark:text-gray-300">Qty</th>
                    <th className="py-3 text-left text-gray-700 dark:text-gray-300">Rate</th>
                    <th className="py-3 text-left text-gray-700 dark:text-gray-300">Tax</th>
                    <th className="py-3 text-left text-gray-700 dark:text-gray-300">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 text-gray-900 dark:text-white">{item.description}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-300">{item.quantity}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-300">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-300">{item.tax}%</td>
                      <td className="py-3 text-gray-900 dark:text-white font-medium">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Totals */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(invoiceData.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Tax:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(invoiceData.totalTax)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-primary-600">
                    {formatCurrency(invoiceData.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Notes */}
            {invoiceData.notes && (
              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white mb-1">Notes:</div>
                <div className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {invoiceData.notes}
                </div>
              </div>
            )}
            
            {/* Terms */}
            {invoiceData.terms && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white mb-1">Terms & Conditions:</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">
                  {invoiceData.terms}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Close
            </button>
            <button
              onClick={() => {
                onSend();
                onClose();
              }}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewModal;