import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const LineItemsTable = ({ lineItems, updateLineItem, removeLineItem, addLineItem }) => {
  const { isDarkMode } = useTheme();

  const calculateLineItem = (quantity, rate, tax) => {
    const subtotal = quantity * rate;
    const taxAmount = subtotal * (tax / 100);
    return subtotal + taxAmount;
  };

  const handleUpdateItem = (id, field, value) => {
    if (field === 'quantity' || field === 'rate' || field === 'tax') {
      const numValue = field === 'tax' ? parseFloat(value) || 0 : 
                      field === 'quantity' ? parseInt(value) || 0 : 
                      parseFloat(value) || 0;
      updateLineItem(id, field, numValue);
    } else {
      updateLineItem(id, field, value);
    }
  };

  return (
    <div className={`border rounded-xl p-6 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-md font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Line Items
        </h3>
        <button
          onClick={addLineItem}
          className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Another Line Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Item/Description
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Qty
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Rate
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Tax %
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Amount
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {lineItems.map((item) => (
              <tr key={item.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    className={`w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter description"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                    className={`w-20 px-2 py-1 border rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                    min="1"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleUpdateItem(item.id, 'rate', e.target.value)}
                    className={`w-24 px-2 py-1 border rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                    step="0.01"
                    min="0"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={item.tax}
                    onChange={(e) => handleUpdateItem(item.id, 'tax', e.target.value)}
                    className={`w-20 px-2 py-1 border rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                    min="0"
                    max="100"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => removeLineItem(item.id)}
                    className={`p-1 text-red-600 rounded ${
                      isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                    }`}
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