// src/components/reports/ReportStats.js
import React from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users, BarChart3 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useAccount } from '../../context/AccountContext';
import { formatCurrency } from '../../utils/currency';

const ReportStats = () => {
  const { isDarkMode } = useTheme();
  const { invoices, customers } = useInvoice();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  const formatMoney = (value, options = {}) =>
    formatCurrency(value, baseCurrency, options);
  
  // Calculate real stats from invoices and customers
  const calculateStats = () => {
    // Total Revenue
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    
    // Total Sales (number of invoices)
    const totalSales = invoices.length;
    
    // New Customers (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newCustomers = customers.filter(c => {
      const customerDate = new Date(c.createdAt || c.joinedDate);
      return customerDate > thirtyDaysAgo;
    }).length;
    
    // Average Order Value
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Calculate changes from previous period (using simple calculations)
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100.0%' : '0.0%';
      const change = ((current - previous) / previous * 100);
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };
    
    // For demo purposes, calculate "previous period" stats
    // In a real app, you'd compare with actual historical data
    const previousRevenue = totalRevenue * 0.85; // Simulated 15% less
    const previousSales = Math.floor(totalSales * 0.92); // Simulated 8% less
    const previousCustomers = Math.floor(newCustomers * 0.8); // Simulated 20% less
    const previousAvgOrder = avgOrderValue * 0.94; // Simulated 6% less
    
    return {
      totalRevenue: {
        value: formatMoney(totalRevenue),
        change: calculateChange(totalRevenue, previousRevenue),
        raw: totalRevenue
      },
      totalSales: {
        value: totalSales.toLocaleString(),
        change: calculateChange(totalSales, previousSales),
        raw: totalSales
      },
      newCustomers: {
        value: newCustomers.toString(),
        change: calculateChange(newCustomers, previousCustomers),
        raw: newCustomers
      },
      avgOrderValue: {
        value: formatMoney(avgOrderValue),
        change: calculateChange(avgOrderValue, previousAvgOrder),
        raw: avgOrderValue
      }
    };
  };
  
  const statsData = calculateStats();
  
  // Additional insights - moved this BEFORE it's used in stats array
  const getInsights = () => {
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
    const collectionRate = statsData.totalSales.raw > 0 ? (paidInvoices / statsData.totalSales.raw * 100).toFixed(1) : 0;
    
    return {
      paidInvoices,
      overdueInvoices,
      collectionRate,
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => (c.transactions || 0) > 0).length
    };
  };

  const insights = getInsights();
  
  const stats = [
    {
      label: 'Total Revenue',
      value: statsData.totalRevenue.value,
      change: statsData.totalRevenue.change,
      icon: DollarSign,
      color: 'bg-emerald-500',
      description: `From ${statsData.totalSales.raw} invoices`,
      rawValue: statsData.totalRevenue.raw
    },
    {
      label: 'Total Invoices',
      value: statsData.totalSales.value,
      change: statsData.totalSales.change,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      description: `Paid: ${insights.paidInvoices}`,
      rawValue: statsData.totalSales.raw
    },
    {
      label: 'New Customers',
      value: statsData.newCustomers.value,
      change: statsData.newCustomers.change,
      icon: Users,
      color: 'bg-purple-500',
      description: `Total: ${customers.length} customers`,
      rawValue: statsData.newCustomers.raw
    },
    {
      label: 'Avg. Invoice Value',
      value: statsData.avgOrderValue.value,
      change: statsData.avgOrderValue.change,
      icon: TrendingUp,
      color: 'bg-amber-500',
      description: `Highest: ${formatMoney(Math.max(...invoices.map(inv => inv.totalAmount || inv.amount || 0), 0))}`,
      rawValue: statsData.avgOrderValue.raw
    }
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith('+');
          
          return (
            <div key={index} className={`border rounded-xl p-5 hover:shadow-lg transition-all duration-200 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-primary-500 hover:shadow-primary-900/20' 
                : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-md'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="stat-content-safe">
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {stat.label}
                    </p>
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      isPositive
                        ? isDarkMode 
                          ? 'bg-emerald-900/30 text-emerald-400' 
                          : 'bg-emerald-100 text-emerald-800'
                        : isDarkMode
                          ? 'bg-red-900/30 text-red-400'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                  
                  <p className={`text-2xl font-bold stat-value-safe ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </p>
                  
                  <p className={`text-xs mt-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {stat.description}
                  </p>
                </div>
                
                <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center ml-3 flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              
              {/* Progress bar for revenue and avg order value */}
              {(stat.label === 'Total Revenue' || stat.label === 'Avg. Invoice Value') && stat.rawValue > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      This month
                    </span>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {stat.label === 'Total Revenue'
                        ? `Target: ${formatMoney(150000, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                        : `Target: ${formatMoney(300, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    </span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div 
                      className={`h-full ${stat.color.replace('bg-', 'bg-')} transition-all duration-500`}
                      style={{ 
                        width: stat.label === 'Total Revenue' 
                          ? `${Math.min((stat.rawValue / 150000) * 100, 100)}%`
                          : `${Math.min((stat.rawValue / 300) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Additional Insights */}
      <div className={`border rounded-xl p-5 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center mr-3`}>
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Business Insights
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Key metrics from your invoicing data
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Collection Rate
            </div>
            <div className={`text-xl font-bold mt-1 stat-value-safe ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {insights.collectionRate}%
            </div>
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {insights.paidInvoices} of {statsData.totalSales.raw} paid
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Overdue Invoices
            </div>
            <div className={`text-xl font-bold mt-1 stat-value-safe ${
              isDarkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              {insights.overdueInvoices}
            </div>
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {formatMoney(invoices
                .filter(inv => inv.status === 'overdue')
                .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0)
              )}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Active Customers
            </div>
            <div className={`text-xl font-bold mt-1 stat-value-safe ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {insights.activeCustomers}
            </div>
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {((insights.activeCustomers / insights.totalCustomers) * 100 || 0).toFixed(0)}% of total
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Invoice Types
            </div>
            <div className={`text-xl font-bold mt-1 stat-value-safe ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {statsData.totalSales.raw}
            </div>
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Draft: {invoices.filter(inv => inv.status === 'draft').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportStats;
