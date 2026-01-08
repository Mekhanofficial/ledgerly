// src/components/reports/CreateReportModal.js
import React, { useState } from 'react';
import { X, Calendar, Filter, Save, Download } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const CreateReportModal = ({ isOpen, onClose, onSave }) => {
  const { isDarkMode } = useTheme();
  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    type: 'sales',
    dateRange: 'last-30-days',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'pdf',
    includeCharts: true,
    filters: {
      customers: [],
      products: [],
      categories: [],
      paymentMethods: [],
      status: []
    },
    sections: ['summary', 'charts', 'tables', 'details']
  });

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', description: 'Detailed sales analysis' },
    { id: 'revenue', name: 'Revenue Report', description: 'Revenue breakdown and trends' },
    { id: 'inventory', name: 'Inventory Report', description: 'Stock levels and turnover' },
    { id: 'customer', name: 'Customer Report', description: 'Customer acquisition and behavior' },
    { id: 'profit', name: 'Profit & Loss', description: 'Income statement analysis' },
    { id: 'expenses', name: 'Expenses Report', description: 'Operating costs breakdown' },
    { id: 'custom', name: 'Custom Report', description: 'Create your own report format' }
  ];

  const dateRanges = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last-7-days', label: 'Last 7 days' },
    { id: 'last-30-days', label: 'Last 30 days' },
    { id: 'this-month', label: 'This month' },
    { id: 'last-month', label: 'Last month' },
    { id: 'this-quarter', label: 'This quarter' },
    { id: 'this-year', label: 'This year' },
    { id: 'custom', label: 'Custom range' }
  ];

  const formats = [
    { id: 'pdf', label: 'PDF Document' },
    { id: 'excel', label: 'Excel Spreadsheet' },
    { id: 'csv', label: 'CSV File' },
    { id: 'html', label: 'Web Page' }
  ];

  const handleSave = () => {
    const newReport = {
      id: `REPORT-${Date.now()}`,
      ...reportData,
      createdAt: new Date().toISOString(),
      status: 'pending',
      progress: 0
    };
    onSave(newReport);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Create New Report
              </h3>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Configure and generate a custom report
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Report Title & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Report Title *
                </label>
                <input
                  type="text"
                  value={reportData.title}
                  onChange={(e) => setReportData({...reportData, title: e.target.value})}
                  placeholder="Monthly Sales Report"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Report Type
                </label>
                <select
                  value={reportData.type}
                  onChange={(e) => setReportData({...reportData, type: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  {reportTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Description
              </label>
              <textarea
                value={reportData.description}
                onChange={(e) => setReportData({...reportData, description: e.target.value})}
                rows="2"
                placeholder="Brief description of what this report contains..."
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
              />
            </div>

            {/* Date Range */}
            <div className="border-t pt-6">
              <h4 className={`text-sm font-medium mb-4 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Calendar className="inline w-4 h-4 mr-2" />
                Date Range
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Time Period
                  </label>
                  <select
                    value={reportData.dateRange}
                    onChange={(e) => setReportData({...reportData, dateRange: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    {dateRanges.map(range => (
                      <option key={range.id} value={range.id}>{range.label}</option>
                    ))}
                  </select>
                </div>
                
                {reportData.dateRange === 'custom' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={reportData.startDate}
                        onChange={(e) => setReportData({...reportData, startDate: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        End Date
                      </label>
                      <input
                        type="date"
                        value={reportData.endDate}
                        onChange={(e) => setReportData({...reportData, endDate: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Format & Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className={`text-sm font-medium mb-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Download className="inline w-4 h-4 mr-2" />
                  Export Format
                </h4>
                <div className="space-y-2">
                  {formats.map(format => (
                    <label key={format.id} className="flex items-center">
                      <input
                        type="radio"
                        name="format"
                        value={format.id}
                        checked={reportData.format === format.id}
                        onChange={(e) => setReportData({...reportData, format: e.target.value})}
                        className={`mr-3 ${
                          isDarkMode 
                            ? 'text-primary-400 border-gray-600 bg-gray-700' 
                            : 'text-primary-600 border-gray-300'
                        }`}
                      />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {format.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className={`text-sm font-medium mb-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Filter className="inline w-4 h-4 mr-2" />
                  Report Options
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportData.includeCharts}
                      onChange={(e) => setReportData({...reportData, includeCharts: e.target.checked})}
                      className={`mr-3 ${
                        isDarkMode 
                          ? 'text-primary-400 border-gray-600 bg-gray-700' 
                          : 'text-primary-600 border-gray-300'
                      }`}
                    />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Include Charts & Graphs
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportData.sections.includes('summary')}
                      onChange={(e) => {
                        const sections = e.target.checked
                          ? [...reportData.sections, 'summary']
                          : reportData.sections.filter(s => s !== 'summary');
                        setReportData({...reportData, sections});
                      }}
                      className={`mr-3 ${
                        isDarkMode 
                          ? 'text-primary-400 border-gray-600 bg-gray-700' 
                          : 'text-primary-600 border-gray-300'
                      }`}
                    />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Include Executive Summary
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportData.sections.includes('details')}
                      onChange={(e) => {
                        const sections = e.target.checked
                          ? [...reportData.sections, 'details']
                          : reportData.sections.filter(s => s !== 'details');
                        setReportData({...reportData, sections});
                      }}
                      className={`mr-3 ${
                        isDarkMode 
                          ? 'text-primary-400 border-gray-600 bg-gray-700' 
                          : 'text-primary-600 border-gray-300'
                      }`}
                    />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Include Detailed Breakdown
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className={`border rounded-lg p-4 ${
              isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Report Preview
              </h4>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <p>Type: {reportTypes.find(t => t.id === reportData.type)?.name}</p>
                <p>Date Range: {dateRanges.find(r => r.id === reportData.dateRange)?.label}</p>
                <p>Format: {formats.find(f => f.id === reportData.format)?.label}</p>
                <p>Includes: {reportData.includeCharts ? 'Charts, ' : ''} {reportData.sections.length} sections</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${
          isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 border rounded-lg ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!reportData.title.trim()}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              Create & Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReportModal;