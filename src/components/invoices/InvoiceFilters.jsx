// src/components/invoices/InvoiceFilters.js
import React from 'react';
import { Search, Filter, Download, FileText, DollarSign, Calendar, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useAccount } from '../../context/AccountContext';
import { formatCurrency } from '../../utils/currency';

const InvoiceFilters = ({ 
  statusFilter = 'all', 
  setStatusFilter, 
  dateRange = 'all', 
  setDateRange,
  amountRange = { min: '', max: '' },
  setAmountRange,
  onExport,
  onCreateInvoice,
  onApplyFilters,
  selectedCount = 0,
  totalCount = 0,
  stats = []
}) => {
  const { isDarkMode } = useTheme();
  const { invoices } = useInvoice();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  
  // Calculate real counts based on actual invoices
  const calculateStatusCounts = () => {
    const counts = {
      all: invoices.length,
      draft: invoices.filter(inv => inv.status === 'draft').length,
      sent: invoices.filter(inv => inv.status === 'sent').length,
      viewed: invoices.filter(inv => inv.status === 'viewed').length,
      paid: invoices.filter(inv => inv.status === 'paid').length,
      overdue: invoices.filter(inv => inv.status === 'overdue').length,
      cancelled: invoices.filter(inv => inv.status === 'cancelled').length
    };
    
    return [
      { id: 'all', label: 'All', count: counts.all },
      { id: 'draft', label: 'Draft', count: counts.draft },
      { id: 'sent', label: 'Sent', count: counts.sent },
      { id: 'viewed', label: 'Viewed', count: counts.viewed },
      { id: 'paid', label: 'Paid', count: counts.paid },
      { id: 'overdue', label: 'Overdue', count: counts.overdue },
      { id: 'cancelled', label: 'Cancelled', count: counts.cancelled }
    ];
  };

  const statusOptions = calculateStatusCounts();

  const statIcons = {
    'Total Invoices': FileText,
    'Total Amount': DollarSign,
    'Paid Amount': DollarSign,
    'Overdue': Calendar,
    'Drafts': FileText,
    'Sent': Calendar,
    'Total Invoices': FileText,
    'Drafts': FileText,
    'Total Amount': DollarSign,
    'Paid Amount': DollarSign,
    'Overdue': Calendar,
    'Sent': Calendar
  };

  const defaultStats = [
    { label: 'Total Invoices', value: '0' },
    { label: 'Drafts', value: '0' },
    { label: 'Total Amount', value: formatCurrency(0, baseCurrency) },
    { label: 'Paid Amount', value: formatCurrency(0, baseCurrency) },
    { label: 'Overdue', value: formatCurrency(0, baseCurrency) },
    { label: 'Sent', value: '0' }
  ];

  const displayStats = stats && stats.length > 0 ? stats : defaultStats;

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters();
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setDateRange('all');
    setAmountRange({ min: '', max: '' });
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  const handleCreateInvoice = () => {
    if (onCreateInvoice) {
      onCreateInvoice();
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards - Only show if stats are provided */}
      {displayStats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayStats.map((stat, index) => {
            const Icon = statIcons[stat.label] || FileText;
            const iconBgColor = stat.label.includes('Total') ? 'bg-blue-500' :
                               stat.label.includes('Draft') ? 'bg-gray-500' :
                               stat.label.includes('Paid') ? 'bg-emerald-500' :
                               stat.label.includes('Overdue') ? 'bg-red-500' :
                               stat.label.includes('Sent') ? 'bg-blue-500' :
                               'bg-green-500';
            
            return (
              <div key={index} className={`border rounded-xl p-4 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="stat-content-safe">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {stat.label}
                    </p>
                    <p className={`text-xl font-bold mt-1 stat-value-safe ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgColor}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className={`border rounded-xl p-6 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border border-gray-300'
              }`}
            >
              {statusOptions.map(status => (
                <option key={status.id} value={status.id}>
                  {status.label} ({status.count})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border border-gray-300'
              }`}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="this-year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Amount Range */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Amount Range
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Min"
                value={amountRange.min}
                onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })}
                className={`w-1/2 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border border-gray-300'
                }`}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Max"
                value={amountRange.max}
                onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })}
                className={`w-1/2 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button 
            onClick={handleApplyFilters}
            className={`flex items-center px-4 py-2 border rounded-lg ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </button>
          <button 
            onClick={handleClearFilters}
            className={`flex items-center px-4 py-2 border rounded-lg ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Clear Filters
          </button>
          <button 
            onClick={handleExport}
            className={`flex items-center px-4 py-2 border rounded-lg ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button 
            onClick={handleCreateInvoice}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </button>
        </div>

        {/* Selection Info */}
        {selectedCount > 0 && (
          <div className={`mt-4 p-3 rounded-lg ${
            isDarkMode 
              ? 'bg-gray-700' 
              : 'bg-blue-50'
          }`}>
            <p className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-blue-700'
            }`}>
              {selectedCount} of {totalCount} invoices selected
            </p>
          </div>
        )}
      </div>

      {/* Status Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((status) => (
          <button
            key={status.id}
            onClick={() => setStatusFilter(status.id)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status.id
                ? 'bg-primary-600 text-white'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              statusFilter === status.id
                ? 'bg-white/30 text-white'
                : isDarkMode
                  ? 'bg-gray-600 text-gray-300'
                  : 'bg-gray-300 text-gray-700'
            }`}>
              {status.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InvoiceFilters;
