// src/components/invoices/recurring/RecurringTable.jsx
import React from 'react';
import { Pause, Play, Edit, Trash2, MoreVertical, PlayCircle, Download } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useAccount } from '../../../context/AccountContext';
import { formatCurrency } from '../../../utils/currency';

const RecurringTable = ({ invoices, onPauseResume, onEdit, onDelete, onGenerateNow }) => {
  const { isDarkMode } = useTheme();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  const formatMoney = (value, currencyCode) =>
    formatCurrency(value, currencyCode || baseCurrency);

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      paused: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getFrequencyColor = (frequency) => {
    const colors = {
      'Weekly': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Bi-weekly': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      'Monthly': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Quarterly': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
      'Yearly': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'Daily': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    };
    return colors[frequency] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className={`border rounded-xl overflow-hidden ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Table Header */}
      <div className={`px-6 py-4 border-b ${
        isDarkMode 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Recurring Invoice Profiles ({invoices.length})
          </div>
          <div className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {invoices.filter(inv => inv.status === 'active').length} active
          </div>
        </div>
      </div>

      {/* Table */}
      {invoices.length === 0 ? (
        <div className="p-12 text-center">
          <div className={`text-lg font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            No recurring invoices found
          </div>
          <div className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Create your first recurring invoice profile
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Profile
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Customer
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Amount & Frequency
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Next Run
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Progress
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4">
                    <div>
                      <div className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {invoice.name}
                      </div>
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {invoice.id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {invoice.customer}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatMoney(invoice.amount || 0, invoice.currency)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(invoice.frequency)}`}>
                        {invoice.frequency}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {invoice.nextRun}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {invoice.cyclesCompleted || 0} of {invoice.totalCycles || 1}
                        </span>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {Math.round(((invoice.cyclesCompleted || 0) / (invoice.totalCycles || 1)) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-primary-600 h-1.5 rounded-full" 
                          style={{ 
                            width: `${((invoice.cyclesCompleted || 0) / (invoice.totalCycles || 1)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {invoice.status === 'active' && (
                        <button 
                          onClick={() => onGenerateNow && onGenerateNow(invoice.id)}
                          className={`p-1 rounded ${
                            isDarkMode ? 'hover:bg-gray-700 text-emerald-400' : 'hover:bg-gray-100 text-emerald-600'
                          }`}
                          title="Generate Now"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </button>
                      )}
                      {invoice.status === 'active' ? (
                        <button 
                          onClick={() => onPauseResume(invoice.id)}
                          className={`p-1 rounded ${
                            isDarkMode ? 'hover:bg-gray-700 text-amber-400' : 'hover:bg-gray-100 text-amber-600'
                          }`}
                          title="Pause"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : invoice.status === 'paused' ? (
                        <button 
                          onClick={() => onPauseResume(invoice.id)}
                          className={`p-1 rounded ${
                            isDarkMode ? 'hover:bg-gray-700 text-emerald-400' : 'hover:bg-gray-100 text-emerald-600'
                          }`}
                          title="Resume"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      ) : null}
                      <button 
                        onClick={() => onEdit(invoice.id)}
                        className={`p-1 rounded ${
                          isDarkMode ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-100 text-blue-600'
                        }`}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(invoice.id)}
                        className={`p-1 rounded ${
                          isDarkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'
                        }`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className={`p-1 rounded ${
                        isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                      }`}>
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecurringTable;
