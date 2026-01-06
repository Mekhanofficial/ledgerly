// src/components/invoices/create/LineItemsTable.jsx
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const LineItemsTable = ({
  lineItems,
  updateLineItem,
  removeLineItem,
  addLineItem,
  currency
}) => {
  const handleUpdate = (id, field, value) => {
    if (field === 'quantity' || field === 'rate' || field === 'tax') {
      const numValue = parseFloat(value) || 0;
      updateLineItem(id, field, numValue);
    } else {
      updateLineItem(id, field, value);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold text-gray-900 dark:text-white">
          Line Items
        </h3>
        <button
          onClick={addLineItem}
          className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Item
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Qty
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Tax %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {lineItems.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Item description"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdate(item.id, 'quantity', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleUpdate(item.id, 'rate', e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    step="0.01"
                    min="0"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={item.tax}
                    onChange={(e) => handleUpdate(item.id, 'tax', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="0"
                    max="100"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currency} {item.amount.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => removeLineItem(item.id)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    disabled={lineItems.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LineItemsTable;