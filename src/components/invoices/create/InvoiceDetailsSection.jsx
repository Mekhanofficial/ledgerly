// src/components/invoices/create/InvoiceDetailsSection.jsx
import React from 'react';
import { Calendar } from 'lucide-react';
import { getCurrencySymbol } from '../../../utils/currency';

const buildCurrencyOption = (currencyCode) => {
  const code = String(currencyCode || '').trim().toUpperCase();
  if (!code) return null;

  return {
    value: code,
    label: `${code} (${getCurrencySymbol(code)})`
  };
};

const normalizeCurrencyOption = (option) => {
  if (!option) return null;

  const code = String(option.value || '').trim().toUpperCase();
  if (!code) return null;

  return {
    value: code,
    label: option.label || `${code} (${getCurrencySymbol(code)})`
  };
};

const InvoiceDetailsSection = ({
  invoiceNumber,
  setInvoiceNumber,
  currency,
  setCurrency,
  isMultiCurrencyAllowed = true,
  baseCurrency = 'USD',
  currencyOptions: customCurrencyOptions,
  issueDate,
  setIssueDate,
  dueDate,
  setDueDate,
  paymentTerms,
  setPaymentTerms
}) => {
  const paymentTermsOptions = [
    { id: 'net-15', label: 'Net 15' },
    { id: 'net-30', label: 'Net 30' },
    { id: 'net-45', label: 'Net 45' },
    { id: 'net-60', label: 'Net 60' },
    { id: 'due-on-receipt', label: 'Due on Receipt' }
  ];

  const defaultCurrencyOptions = ['USD', 'NGN', 'EUR', 'GBP', 'CAD', 'AUD']
    .map(buildCurrencyOption)
    .filter(Boolean);

  const resolvedCurrencyOptions = (customCurrencyOptions && customCurrencyOptions.length > 0)
    ? customCurrencyOptions.map(normalizeCurrencyOption).filter(Boolean)
    : defaultCurrencyOptions;

  const mergedCurrencyOptionsMap = new Map();

  [baseCurrency, currency].forEach((currencyCode) => {
    const option = buildCurrencyOption(currencyCode);
    if (option) {
      mergedCurrencyOptionsMap.set(option.value, option);
    }
  });

  resolvedCurrencyOptions.forEach((option) => {
    if (option?.value) {
      mergedCurrencyOptionsMap.set(option.value, option);
    }
  });

  const availableCurrencyOptions = isMultiCurrencyAllowed
    ? Array.from(mergedCurrencyOptionsMap.values())
    : [buildCurrencyOption(baseCurrency)].filter(Boolean);

  const inputClassName = 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white';

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Invoice Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Invoice Number
          </label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Currency
          </label>
          <select
            value={String(currency || '').toUpperCase()}
            onChange={(e) => setCurrency(e.target.value)}
            disabled={!isMultiCurrencyAllowed}
            className={inputClassName}
          >
            {availableCurrencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {!isMultiCurrencyAllowed && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              Multi-currency is available on Professional and Enterprise plans.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Issue Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className={`${inputClassName} pl-10`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Due Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`${inputClassName} pl-10`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Payment Terms
          </label>
          <select
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className={inputClassName}
          >
            {paymentTermsOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsSection;
