import React from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ReportCharts = () => {
  const { isDarkMode } = useTheme();
  
  // Mock data for charts
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: [45000, 52000, 48000, 61000, 58000, 72000, 68000, 75000, 82000, 78000, 85000, 92000]
  };

  const topProducts = [
    { name: 'Wireless Headphones', sales: 245, revenue: 22050 },
    { name: 'Laptop Computers', sales: 89, revenue: 115610 },
    { name: 'Office Chairs', sales: 156, revenue: 35100 },
    { name: 'Wireless Mouse', sales: 324, revenue: 9716 },
    { name: 'Desk Lamps', sales: 187, revenue: 9345 }
  ];

  return (
    <div className="space-y-6">
      {/* Sales Chart */}
      <div className={`border rounded-xl p-6 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Sales Performance
            </h3>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Monthly revenue for the current year
            </p>
          </div>
          <div className={`flex items-center ${
            isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="font-medium">+24.5% growth</span>
          </div>
        </div>
        
        {/* Simple bar chart visualization */}
        <div className="h-64 flex items-end space-x-1">
          {salesData.data.map((value, index) => {
            const percentage = (value / Math.max(...salesData.data)) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-lg"
                  style={{ height: `${percentage}%` }}
                ></div>
                <div className={`mt-2 text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {salesData.labels[index]}
                </div>
                <div className={`text-xs font-medium mt-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  ${(value / 1000).toFixed(0)}k
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`border rounded-xl p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Top Selling Products
          </h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <span className={`font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {product.name}
                    </div>
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {product.sales} units sold
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    ${product.revenue.toLocaleString()}
                  </div>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                    +12.5%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`border rounded-xl p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Quick Insights
          </h3>
          <div className="space-y-4">
            <div className={`p-4 border rounded-lg ${
              isDarkMode 
                ? 'bg-emerald-900/20 border-emerald-800' 
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex items-center">
                <TrendingUp className={`w-5 h-5 mr-3 ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
                <div>
                  <div className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Best Performing Month
                  </div>
                  <div className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    December with $92,000 revenue
                  </div>
                </div>
              </div>
            </div>
            <div className={`p-4 border rounded-lg ${
              isDarkMode 
                ? 'bg-blue-900/20 border-blue-800' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center">
                <BarChart3 className={`w-5 h-5 mr-3 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div>
                  <div className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Avg. Daily Sales
                  </div>
                  <div className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    $2,847 across all products
                  </div>
                </div>
              </div>
            </div>
            <div className={`p-4 border rounded-lg ${
              isDarkMode 
                ? 'bg-amber-900/20 border-amber-800' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center">
                <TrendingDown className={`w-5 h-5 mr-3 ${
                  isDarkMode ? 'text-amber-400' : 'text-amber-600'
                }`} />
                <div>
                  <div className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Low Stock Alert
                  </div>
                  <div className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    5 products need immediate restocking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCharts;