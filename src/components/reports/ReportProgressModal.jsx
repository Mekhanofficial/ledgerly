// src/components/reports/ReportProgressModal.js
import React from 'react';
import { X, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ReportProgressModal = ({ isOpen, onClose, report, reports }) => {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  const processingReports = reports || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl max-w-md w-full ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Report Generation
            </h3>
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
        <div className="p-6">
          {processingReports.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h4 className={`text-lg font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                All reports generated
              </h4>
              <p className={`mt-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Your reports are ready for download
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <Loader className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                <h4 className={`text-lg font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Generating Reports
                </h4>
                <p className={`mt-2 text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {processingReports.length} report(s) being processed
                </p>
              </div>

              <div className="space-y-4">
                {processingReports.map((rep) => (
                  <div key={rep.id} className={`border rounded-lg p-4 ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {rep.title}
                      </span>
                      <span className={`text-sm font-medium ${
                        rep.status === 'completed' 
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-primary-600 dark:text-primary-400'
                      }`}>
                        {rep.progress || 0}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div 
                        className="h-full bg-primary-500 transition-all duration-300"
                        style={{ width: `${rep.progress || 0}%` }}
                      />
                    </div>
                    <div className={`text-xs mt-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {rep.status === 'processing' ? 'Processing...' : 'Ready for download'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="text-center">
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Reports will be available in your "Generated Reports" list
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportProgressModal;