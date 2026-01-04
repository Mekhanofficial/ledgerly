import React from 'react';
import { Search, Filter, Download, FileText, DollarSign, Calendar } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const InvoiceFilters = ({ 
  statusFilter, 
  setStatusFilter, 
  dateRange, 
  setDateRange,
  amountRange,
  setAmountRange,
  onExport,
  onCreateInvoice,
  stats
}) => {
  const { isDarkMode } = useTheme();
  
  const statusOptions = [
    { id: 'all', label: 'All', count: 156 },
    { id: 'draft', label: 'Draft', count: 12 },
    { id: 'sent', label: 'Sent', count: 45 },
    { id: 'viewed', label: 'Viewed', count: 38 },
    { id: 'paid', label: 'Paid', count: 48 },
    { id: 'overdue', label: 'Overdue', count: 8 },
    { id: 'cancelled', label: 'Cancelled', count: 5 }
  ];

  const statIcons = {
    'Total Invoices': FileText,
    'Total Amount': DollarSign,
    'Paid Amount': DollarSign,
    'Overdue': Calendar
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
        <input
          type="search"
          placeholder="Search by invoice number or customer name..."
          className={`w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
              : 'border border-gray-300'
          }`}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = statIcons[stat.label];
          return (
            <div key={index} className={`border rounded-xl p-5 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  index === 0 ? 'bg-blue-500' :
                  index === 1 ? 'bg-emerald-500' :
                  index === 2 ? 'bg-green-500' :
                  'bg-red-500'
                }`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
                <option key={status.id} value={status.id}>{status.label}</option>
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
          <button className={`flex items-center px-4 py-2 rounded-lg ${
            isDarkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}>
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </button>
          <button 
            onClick={onExport}
            className={`flex items-center px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button 
            onClick={onCreateInvoice}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            New Invoice
          </button>
        </div>
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