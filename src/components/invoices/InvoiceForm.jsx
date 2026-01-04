import React from 'react';
import { Calendar } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const InvoiceForm = ({ 
  invoiceNumber, 
  setInvoiceNumber, 
  issueDate, 
  setIssueDate, 
  dueDate, 
  setDueDate, 
  paymentTerms, 
  setPaymentTerms,
  selectedCustomer,
  setSelectedCustomer,
  customers,
  notes,
  setNotes,
  template,
  setTemplate,
  isRecurring,
  setIsRecurring,
  recurringFrequency,
  setRecurringFrequency
}) => {
  const { isDarkMode } = useTheme();
  
  const templates = [
    { id: 'standard', name: 'Standard Template' },
    { id: 'modern', name: 'Modern Template' },
    { id: 'minimal', name: 'Minimal Template' },
    { id: 'professional', name: 'Professional Template' }
  ];

  const paymentTermsOptions = [
    { id: 'net-15', label: 'Net 15' },
    { id: 'net-30', label: 'Net 30' },
    { id: 'net-45', label: 'Net 45' },
    { id: 'net-60', label: 'Net 60' },
    { id: 'due-on-receipt', label: 'Due on Receipt' }
  ];

  const recurringOptions = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'quarterly', label: 'Quarterly' },
    { id: 'yearly', label: 'Yearly' }
  ];

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  return (
    <div className={`border rounded-xl p-6 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <h2 className={`text-lg font-semibold mb-6 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Invoice Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Invoice Number
          </label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'border border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Payment Terms
          </label>
          <select
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'border border-gray-300'
            }`}
          >
            {paymentTermsOptions.map(term => (
              <option key={term.id} value={term.id}>{term.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Issue Date
          </label>
          <div className="relative">
            <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className={`w-full pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border border-gray-300'
              }`}
            />
          </div>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Due Date
          </label>
          <div className="relative">
            <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border border-gray-300'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-6">
        <h3 className={`text-md font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Customer Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Select Customer
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border border-gray-300'
              }`}
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
              <option value="new">+ Add New Customer</option>
            </select>
          </div>
          
          {selectedCustomerData && (
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedCustomerData.name}
              </div>
              <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedCustomerData.email}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedCustomerData.address}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Notes/Terms
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'border border-gray-300'
            }`}
            placeholder="Additional notes or payment terms..."
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Template
          </label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'border border-gray-300'
            }`}
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className={`h-4 w-4 text-primary-600 focus:ring-primary-500 rounded ${
                isDarkMode ? 'border-gray-600' : 'border-gray-300'
              }`}
            />
            <label htmlFor="recurring" className={`ml-2 text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Make this a recurring invoice
            </label>
          </div>
          
          {isRecurring && (
            <div>
              <select
                value={recurringFrequency}
                onChange={(e) => setRecurringFrequency(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border border-gray-300'
                }`}
              >
                {recurringOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;