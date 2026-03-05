// src/components/reports/ReportStats.js
import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users, BarChart3 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useAccount } from '../../context/AccountContext';
import { formatCurrency } from '../../utils/currency';

const DATE_RANGE_LABELS = {
  'last-7-days': 'Last 7 days',
  'last-30-days': 'Last 30 days',
  'this-month': 'This month',
  'last-month': 'Last month',
  'this-quarter': 'This quarter',
  'this-year': 'This year',
  custom: 'Custom range'
};

const ReportStats = ({ dateRange = 'last-30-days' }) => {
  const { isDarkMode } = useTheme();
  const { invoices, customers } = useInvoice();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  const formatMoney = (value, options = {}) =>
    formatCurrency(value, baseCurrency, options);

  const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const parseDateValue = (value) => {
    if (!value) return null;
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (dateOnlyMatch) {
        const year = Number(dateOnlyMatch[1]);
        const month = Number(dateOnlyMatch[2]) - 1;
        const day = Number(dateOnlyMatch[3]);
        const localDate = new Date(year, month, day);
        return Number.isNaN(localDate.getTime()) ? null : localDate;
      }
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const resolveDateRange = (rangeId) => {
    const now = new Date();
    const startOfDay = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };
    const endOfDay = (date) => {
      const d = new Date(date);
      d.setHours(23, 59, 59, 999);
      return d;
    };

    let start = null;
    let end = endOfDay(now);

    switch (rangeId) {
      case 'last-7-days':
        start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
        break;
      case 'this-month':
        start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        break;
      case 'last-month':
        start = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
        break;
      case 'this-quarter': {
        const quarter = Math.floor(now.getMonth() / 3);
        start = startOfDay(new Date(now.getFullYear(), quarter * 3, 1));
        break;
      }
      case 'this-year':
        start = startOfDay(new Date(now.getFullYear(), 0, 1));
        break;
      case 'custom':
        start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        break;
      case 'last-30-days':
      default:
        start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29));
        break;
    }

    const duration = Math.max(0, end.getTime() - start.getTime());
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration);

    return {
      start,
      end,
      previousStart,
      previousEnd,
      label: DATE_RANGE_LABELS[rangeId] || DATE_RANGE_LABELS['last-30-days']
    };
  };

  const range = useMemo(() => resolveDateRange(dateRange), [dateRange]);

  const resolveInvoiceTimestamp = (invoice) => {
    const raw = invoice?.issueDate || invoice?.date || invoice?.sentDate || invoice?.createdAt;
    const parsed = parseDateValue(raw);
    return parsed ? parsed.getTime() : null;
  };

  const resolveCustomerTimestamp = (customer) => {
    const raw = customer?.createdAt || customer?.joinedDate || customer?.date;
    const parsed = parseDateValue(raw);
    return parsed ? parsed.getTime() : null;
  };

  const inRange = (timestamp, start, end) =>
    timestamp != null && timestamp >= start.getTime() && timestamp <= end.getTime();

  const currentInvoices = useMemo(
    () => invoices.filter((inv) => inRange(resolveInvoiceTimestamp(inv), range.start, range.end)),
    [invoices, range]
  );

  const previousInvoices = useMemo(
    () => invoices.filter((inv) => inRange(resolveInvoiceTimestamp(inv), range.previousStart, range.previousEnd)),
    [invoices, range]
  );

  const currentCustomers = useMemo(
    () => customers.filter((customer) => inRange(resolveCustomerTimestamp(customer), range.start, range.end)),
    [customers, range]
  );

  const previousCustomers = useMemo(
    () => customers.filter((customer) => inRange(resolveCustomerTimestamp(customer), range.previousStart, range.previousEnd)),
    [customers, range]
  );

  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100.0%' : '0.0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const totalRevenue = currentInvoices.reduce((sum, inv) => sum + toNumber(inv.totalAmount || inv.amount || inv.total), 0);
  const previousRevenue = previousInvoices.reduce((sum, inv) => sum + toNumber(inv.totalAmount || inv.amount || inv.total), 0);
  const totalSales = currentInvoices.length;
  const previousSales = previousInvoices.length;
  const newCustomers = currentCustomers.length;
  const previousNewCustomers = previousCustomers.length;
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  const previousAvgOrder = previousSales > 0 ? previousRevenue / previousSales : 0;

  const statsData = {
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
      change: calculateChange(newCustomers, previousNewCustomers),
      raw: newCustomers
    },
    avgOrderValue: {
      value: formatMoney(avgOrderValue),
      change: calculateChange(avgOrderValue, previousAvgOrder),
      raw: avgOrderValue
    }
  };

  const paidInvoices = currentInvoices.filter(
    (inv) => String(inv.status || '').toLowerCase() === 'paid'
  );
  const overdueInvoices = currentInvoices.filter(
    (inv) => String(inv.status || '').toLowerCase() === 'overdue'
  );
  const customerIdsInRange = new Set(
    currentInvoices
      .map((inv) => {
        if (typeof inv.customer === 'object' && inv.customer) {
          return inv.customer._id || inv.customer.id || null;
        }
        return inv.customerId || inv.customer || null;
      })
      .filter(Boolean)
  );

  const insights = {
    paidInvoices: paidInvoices.length,
    overdueInvoices: overdueInvoices.length,
    collectionRate: statsData.totalSales.raw > 0
      ? ((paidInvoices.length / statsData.totalSales.raw) * 100).toFixed(1)
      : 0,
    totalCustomers: customers.length,
    activeCustomers: customerIdsInRange.size
  };
  
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
      description: `Highest: ${formatMoney(Math.max(...currentInvoices.map((inv) => toNumber(inv.totalAmount || inv.amount || inv.total)), 0))}`,
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
                      {range.label}
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
              {formatMoney(currentInvoices
                .filter((inv) => String(inv.status || '').toLowerCase() === 'overdue')
                .reduce((sum, inv) => sum + toNumber(inv.totalAmount || inv.amount || inv.total), 0)
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
              Draft: {currentInvoices.filter((inv) => String(inv.status || '').toLowerCase() === 'draft').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportStats;
