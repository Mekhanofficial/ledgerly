import React from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReportCards = ({ onGenerateReport }) => {
  const reports = [
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Daily, weekly, and monthly sales performance',
      icon: BarChart3,
      color: 'bg-blue-500',
      lastGenerated: 'Today, 9:00 AM'
    },
    {
      id: 'revenue',
      title: 'Revenue Report',
      description: 'Revenue breakdown by product and category',
      icon: BarChart3,
      color: 'bg-emerald-500',
      lastGenerated: 'Yesterday, 8:30 AM'
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Stock levels, turnover, and restocking needs',
      icon: BarChart3,
      color: 'bg-amber-500',
      lastGenerated: 'Dec 15, 2024'
    },
    {
      id: 'customer',
      title: 'Customer Report',
      description: 'Customer acquisition, retention, and behavior',
      icon: BarChart3,
      color: 'bg-purple-500',
      lastGenerated: 'Dec 14, 2024'
    },
    {
      id: 'profit',
      title: 'Profit & Loss',
      description: 'Income statement and profitability analysis',
      icon: TrendingUp,
      color: 'bg-green-500',
      lastGenerated: 'Dec 13, 2024'
    },
    {
      id: 'expenses',
      title: 'Expenses Report',
      description: 'Operating costs and expense breakdown',
      icon: PieChart,
      color: 'bg-red-500',
      lastGenerated: 'Dec 12, 2024'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Generate Custom Report</h3>
            <p className="text-gray-600 mt-1">Create a custom report with specific filters and date ranges</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="flex items-center px-4 py-2 border border-gray-300 rounded-lg">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <select className="border-none focus:ring-0 text-sm">
                <option>Last 30 days</option>
                <option>This month</option>
                <option>Last month</option>
                <option>Custom range</option>
              </select>
            </div>
            <button
              onClick={() => onGenerateReport('custom')}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-2 ${report.color}`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`${report.color} w-10 h-10 rounded-lg flex items-center justify-center mr-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last generated: {report.lastGenerated}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => onGenerateReport(report.id)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                  >
                    Generate Now
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportCards;