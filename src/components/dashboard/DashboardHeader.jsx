import React, { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';

const DashboardHeader = () => {
  const [activeFilter, setActiveFilter] = useState('this-month');
  const [customRangeOpen, setCustomRangeOpen] = useState(false);

  const dateFilters = [
    { id: 'today', label: 'Today' },
    { id: 'this-week', label: 'This Week' },
    { id: 'this-month', label: 'This Month' },
    { id: 'custom', label: 'Custom', icon: ChevronDown }
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Welcome back, John! Here's what's happening today.</p>
        </div>
        
        <div className="flex items-center gap-2 mt-3 md:mt-0">
          {/* Date Filter Buttons */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {dateFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  setActiveFilter(filter.id);
                  if (filter.id === 'custom') {
                    setCustomRangeOpen(!customRangeOpen);
                  }
                }}
                className={`flex items-center px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-xs">{filter.label}</span>
                {filter.icon && <filter.icon className="w-3 h-3 ml-1" />}
              </button>
            ))}
          </div>

          {/* Export Button - Right End */}
          <button className="flex items-center px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow transition-shadow whitespace-nowrap">
            <Download className="w-3 h-3 mr-1.5" />
            <span className="text-xs">Export</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker (Conditional) */}
      {customRangeOpen && (
        <div className="mt-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">Custom Date Range</h3>
            <button
              onClick={() => setCustomRangeOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
              <input
                type="date"
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                defaultValue="2024-12-01"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
              <input
                type="date"
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                defaultValue="2024-12-31"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => setCustomRangeOpen(false)}
              className="px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setActiveFilter('custom');
                setCustomRangeOpen(false);
              }}
              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium"
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;