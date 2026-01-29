// src/components/reports/ReportCards.js
import React from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Trash2, Eye } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ReportCards = ({ onGenerateReport, reports = [], onDeleteReport, onViewReport, onExport }) => {
  const { isDarkMode } = useTheme();
  
  const reportTemplates = [
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Daily, weekly, and monthly sales performance',
      icon: BarChart3,
      color: 'bg-blue-500',
      category: 'sales'
    },
    {
      id: 'revenue',
      title: 'Revenue Report',
      description: 'Revenue breakdown by product and category',
      icon: BarChart3,
      color: 'bg-emerald-500',
      category: 'revenue'
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Stock levels, turnover, and restocking needs',
      icon: BarChart3,
      color: 'bg-amber-500',
      category: 'inventory'
    },
    {
      id: 'customer',
      title: 'Customer Report',
      description: 'Customer acquisition, retention, and behavior',
      icon: BarChart3,
      color: 'bg-purple-500',
      category: 'customer'
    },
    {
      id: 'profit',
      title: 'Profit & Loss',
      description: 'Income statement and profitability analysis',
      icon: TrendingUp,
      color: 'bg-green-500',
      category: 'profit'
    },
    {
      id: 'expenses',
      title: 'Expenses Report',
      description: 'Operating costs and expense breakdown',
      icon: PieChart,
      color: 'bg-red-500',
      category: 'expenses'
    },
    {
      id: 'quick-summary',
      title: 'Quick Summary',
      description: 'Executive summary with key metrics',
      icon: BarChart3,
      color: 'bg-indigo-500',
      category: 'summary'
    },
    {
      id: 'monthly-performance',
      title: 'Monthly Performance',
      description: 'Month-over-month performance comparison',
      icon: TrendingUp,
      color: 'bg-pink-500',
      category: 'performance'
    }
  ];

  const getGeneratedReport = (templateId) => {
    return reports
      .filter(r => r.type === templateId && r.status === 'completed')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleViewReport = (templateId, generatedReport) => {
    if (onViewReport && generatedReport) {
      onViewReport(generatedReport);
    } else {
      onGenerateReport(templateId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Report Templates
        </h3>
        <div className={`text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {reports.filter(r => r.status === 'completed').length} generated • {reports.filter(r => r.status === 'processing').length} processing
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`border rounded-xl p-6 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Generate Custom Report
            </h3>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Create a custom report with specific filters and date ranges
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className={`flex items-center px-4 py-2 border rounded-lg ${
              isDarkMode
                ? 'border-gray-600 bg-gray-700'
                : 'border-gray-300 bg-white'
            }`}>
              <Calendar className={`w-4 h-4 mr-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <select className={`border-none focus:ring-0 text-sm bg-transparent ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`} defaultValue="last-30-days">
                <option value="last-7-days">Last 7 days</option>
                <option value="last-30-days">Last 30 days</option>
                <option value="this-month">This month</option>
                <option value="last-month">Last month</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            <button
              onClick={() => onGenerateReport('custom')}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Create Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTemplates.map((template) => {
          const Icon = template.icon;
          const generatedReport = getGeneratedReport(template.id);
          const isProcessing = reports.some(r => r.type === template.id && r.status === 'processing');
          
          return (
            <div key={template.id} className={`border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-primary-500 hover:shadow-primary-900/20' 
                : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-lg'
            }`}>
              {/* Color Bar */}
              <div className={`h-1.5 ${template.color}`}></div>
              
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`${template.color} w-10 h-10 rounded-lg flex items-center justify-center mr-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold line-clamp-1 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {template.title}
                      </h3>
                      <p className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {template.category}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  {isProcessing && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isDarkMode 
                        ? 'bg-blue-900/30 text-blue-400' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      Processing
                    </span>
                  )}
                </div>
                
                {/* Description */}
                <p className={`text-sm mb-4 line-clamp-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {template.description}
                </p>
                
                {/* Last Generated Info */}
                <div className={`text-xs mb-4 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  <div className="flex items-center">
                    <Calendar className={`w-3 h-3 mr-1.5 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    Last: {generatedReport ? formatDate(generatedReport.createdAt) : 'Never generated'}
                  </div>
                  {generatedReport && (
                    <div className="mt-1">
                      Format: <span className={`font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {generatedReport.format?.toUpperCase() || 'PDF'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-2">
                    {/* Generate/View Button */}
                    <button
                      onClick={() => handleViewReport(template.id, generatedReport)}
                      disabled={isProcessing}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isProcessing
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : generatedReport
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      {isProcessing ? 'Processing...' : 
                       generatedReport ? 'View' : 'Generate'}
                    </button>
                    
                    {/* View Details Button */}
                    {generatedReport && (
                      <button
                        onClick={() => onViewReport && onViewReport(generatedReport)}
                        className={`p-1.5 rounded-lg ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {/* Download Button */}
                    {generatedReport && onExport && (
                      <button
                        onClick={() => onExport('pdf', generatedReport.id)}
                        className={`p-1.5 rounded-lg ${
                          isDarkMode
                            ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20'
                            : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                        }`}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Delete Button */}
                    {generatedReport && (
                      <button
                        onClick={() => onDeleteReport && onDeleteReport(generatedReport.id)}
                        className={`p-1.5 rounded-lg ${
                          isDarkMode
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                        }`}
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar for Processing Reports */}
                {isProcessing && (
                  <div className="mt-3">
                    <div className={`h-1 rounded-full overflow-hidden ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div 
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-300 transition-all duration-500"
                        style={{ 
                          width: `${reports.find(r => r.type === template.id && r.status === 'processing')?.progress || 0}%` 
                        }}
                      />
                    </div>
                    <div className={`text-xs text-center mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {reports.find(r => r.type === template.id && r.status === 'processing')?.progress || 0}% complete
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* No Reports Message */}
      {reports.length === 0 && (
        <div className={`text-center py-12 rounded-xl border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${
            isDarkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-lg font-medium ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No reports generated yet
          </h3>
          <p className={`mt-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Generate your first report to see it here
          </p>
          <button
            onClick={() => onGenerateReport('quick-summary')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Generate Quick Summary
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportCards;
