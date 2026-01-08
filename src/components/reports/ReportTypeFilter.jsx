// src/components/reports/ReportTypeFilter.js
import React from 'react';

const ReportTypeFilter = ({ reportType, onReportTypeChange, isDarkMode }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {['all', 'sales', 'revenue', 'inventory', 'customer', 'profit', 'expenses'].map((type) => (
        <button
          key={type}
          onClick={() => onReportTypeChange(type)}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
            reportType === type
              ? 'bg-primary-600 text-white'
              : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {type.replace('-', ' ')}
        </button>
      ))}
    </div>
  );
};

export default ReportTypeFilter;