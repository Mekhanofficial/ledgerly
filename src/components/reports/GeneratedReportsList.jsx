// src/components/reports/GeneratedReportsList.js - FIXED VERSION
import React, { memo } from 'react';
import { BarChart3 } from 'lucide-react';

const GeneratedReportsList = memo(({ 
  reports = [], 
  onLoadReports, 
  onExport, 
  onViewReport, 
  onDeleteReport, 
  isDarkMode = false 
}) => {
  const getStatusColor = (status) => {
    switch(status?.toLowerCase?.()) {
      case 'completed': 
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'processing': 
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'failed': 
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Safely format date
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid Date';
    }
  };

  // Safely handle report type
  const getReportType = (type) => {
    if (!type) return 'custom';
    return typeof type === 'string' ? type.toLowerCase() : 'custom';
  };

  // Safely handle report format
  const getReportFormat = (format) => {
    if (!format) return 'PDF';
    return typeof format === 'string' ? format.toUpperCase() : 'PDF';
  };

  return (
    <div className={`border rounded-xl overflow-hidden ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className={`px-6 py-4 border-b ${
        isDarkMode 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Generated Reports ({reports?.length || 0})
          </h3>
          {typeof onLoadReports === 'function' && (
            <button 
              onClick={onLoadReports}
              className={`text-sm ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-300' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Refresh
            </button>
          )}
        </div>
      </div>
      
      {!reports || reports.length === 0 ? (
        <div className="p-12 text-center">
          <BarChart3 className={`w-12 h-12 mx-auto mb-4 ${
            isDarkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <p className={`text-lg font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            No reports generated yet
          </p>
          <p className={`mt-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Create your first report to see it here
          </p>
        </div>
      ) : (
        <div className={`divide-y ${
          isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
        }`}>
          {reports.map((report) => {
            if (!report || !report.id) {
              console.warn('Invalid report found:', report);
              return null;
            }
            
            return (
              <div key={report.id} className={`px-6 py-4 flex items-center justify-between ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                    isDarkMode ? 'bg-primary-900/30' : 'bg-primary-100'
                  }`}>
                    <BarChart3 className={`w-5 h-5 ${
                      isDarkMode ? 'text-primary-400' : 'text-primary-600'
                    }`} />
                  </div>
                  <div>
                    <div className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {report.title || 'Untitled Report'}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatDate(report.createdAt)} | 
                        {getReportType(report.type)} | 
                        {getReportFormat(report.format)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status === 'processing' 
                          ? `${report.progress || 0}% Complete` 
                          : (report.status || 'unknown')?.charAt(0).toUpperCase() + (report.status || '')?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {report.status === 'completed' && (
                    <>
                      {typeof onExport === 'function' && (
                        <button 
                          onClick={() => onExport(report.format || 'pdf', report.id)}
                          className={`px-3 py-1 text-sm font-medium ${
                            isDarkMode 
                              ? 'text-primary-400 hover:text-primary-300 hover:bg-primary-900/20 rounded-lg' 
                              : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg'
                          }`}
                        >
                          Download
                        </button>
                      )}
                      {typeof onViewReport === 'function' && (
                        <button 
                          onClick={() => onViewReport(report)}
                          className={`px-3 py-1 border rounded-lg text-sm ${
                            isDarkMode
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          View
                        </button>
                      )}
                      {typeof onDeleteReport === 'function' && (
                        <button 
                          onClick={() => onDeleteReport(report.id)}
                          className={`px-3 py-1 border rounded-lg text-sm ${
                            isDarkMode
                              ? 'border-gray-600 text-red-400 hover:bg-red-900/20'
                              : 'border-gray-300 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          Delete
                        </button>
                      )}
                    </>
                  )}
                  {report.status === 'processing' && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Generating... {report.progress || 0}%
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

GeneratedReportsList.displayName = 'GeneratedReportsList';

export default GeneratedReportsList;
