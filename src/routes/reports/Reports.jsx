import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Filter } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import ReportStats from '../../components/reports/ReportStats';
import ReportCards from '../../components/reports/ReportCards';
import ReportCharts from '../../components/reports/ReportCharts';
import { useTheme } from '../../context/ThemeContext';

const Reports = () => {
  const { isDarkMode } = useTheme();
  const [dateRange, setDateRange] = useState('last-30-days');
  const [reportType, setReportType] = useState('all');

  const handleGenerateReport = (reportId) => {
    console.log('Generating report:', reportId);
  };

  const handleExport = (format) => {
    console.log('Exporting report as:', format);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Reports & Analytics
            </h1>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Comprehensive insights into your business performance
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className={`flex items-center px-4 py-2 border rounded-lg ${
              isDarkMode
                ? 'border-gray-600 bg-gray-800'
                : 'border-gray-300 bg-white'
            }`}>
              <Calendar className={`w-4 h-4 mr-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`border-none focus:ring-0 text-sm bg-transparent ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
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
            <button className={`flex items-center px-4 py-2 border rounded-lg ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button 
              onClick={() => handleExport('pdf')}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Component */}
        <ReportStats />

        {/* Report Type Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'sales', 'revenue', 'inventory', 'customer', 'profit', 'expenses'].map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
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

        {/* Report Cards Component */}
        <ReportCards onGenerateReport={handleGenerateReport} />

        {/* Charts Component */}
        <ReportCharts />

        {/* Recent Reports */}
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
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Recent Reports
            </h3>
          </div>
          <div className={`divide-y ${
            isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
          }`}>
            {[
              { id: 'RPT-001', name: 'Monthly Sales Summary', date: 'Dec 16, 2024', type: 'Sales', size: '2.4 MB' },
              { id: 'RPT-002', name: 'Inventory Analysis', date: 'Dec 15, 2024', type: 'Inventory', size: '1.8 MB' },
              { id: 'RPT-003', name: 'Customer Acquisition', date: 'Dec 14, 2024', type: 'Customer', size: '3.1 MB' },
              { id: 'RPT-004', name: 'Q4 Financial Review', date: 'Dec 10, 2024', type: 'Financial', size: '4.2 MB' }
            ].map((report) => (
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
                      {report.name}
                    </div>
                    <div className={`text-sm mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {report.date} • {report.type} • {report.size}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className={`px-3 py-1 text-sm font-medium ${
                    isDarkMode 
                      ? 'text-primary-400 hover:text-primary-300' 
                      : 'text-primary-600 hover:text-primary-700'
                  }`}>
                    View
                  </button>
                  <button className={`px-3 py-1 border rounded-lg text-sm ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;