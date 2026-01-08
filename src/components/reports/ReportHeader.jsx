// src/components/reports/ReportHeader.js
import React from 'react';
import { Calendar, Plus, Download } from 'lucide-react';

const ReportHeader = ({ dateRange, onDateRangeChange, onCreateReport, onExport }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Reports & Analytics
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-300">
          Comprehensive insights into your business performance
        </p>
      </div>
      <div className="flex items-center space-x-3 mt-4 md:mt-0">
        <div className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <select 
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="border-none focus:ring-0 text-sm bg-transparent text-gray-900 dark:text-white"
          >
            <option value="last-7-days">Last 7 days</option>
            <option value="last-30-days">Last 30 days</option>
            <option value="this-month">This month</option>
            <option value="last-month">Last month</option>
            <option value="this-quarter">This quarter</option>
            <option value="this-year">This year</option>
            <option value="custom">Custom range</option>
          </select>
        </div>
        <button 
          onClick={onCreateReport}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Report
        </button>
        <button 
          onClick={onExport}
          className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Download className="w-4 h-4 mr-2" />
          Export All
        </button>
      </div>
    </div>
  );
};

export default ReportHeader;