// src/components/reports/ReportCharts.js - COMPLETE FIXED VERSION
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useAccount } from '../../context/AccountContext';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Sector
} from 'recharts';
import { Select, SelectItem } from '../../components/ui/Select';

const CustomChartContainer = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

const CustomChartTooltip = ({ active, payload, label, isDarkMode, formatValue }) => {
  if (active && payload && payload.length) {
    const formatDisplay = formatValue || ((value) => value);
    return (
      <div className={`p-3 rounded-lg shadow-lg border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <p className={`font-medium mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey === 'total' ? 'Revenue' : entry.dataKey}: {formatDisplay(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DATE_RANGE_LABELS = {
  'last-7-days': 'Last 7 days',
  'last-30-days': 'Last 30 days',
  'this-month': 'This month',
  'last-month': 'Last month',
  'this-quarter': 'This quarter',
  'this-year': 'This year',
  custom: 'Custom range'
};

const ReportCharts = ({ dateRange = 'last-30-days' }) => {
  const { isDarkMode } = useTheme();
  const { invoices, customers } = useInvoice();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(baseCurrency);
  const formatMoney = (value, options = {}) => formatCurrency(value, baseCurrency, options);
  const formatMoneyNoDecimals = (value) =>
    formatMoney(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatCompactCurrency = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return `${currencySymbol}0`;
    if (Math.abs(numeric) >= 1000) {
      return `${currencySymbol}${(numeric / 1000).toFixed(0)}k`;
    }
    return `${currencySymbol}${numeric.toFixed(0)}`;
  };
  const [activeCustomer, setActiveCustomer] = useState(null);
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

    return {
      start,
      end,
      label: DATE_RANGE_LABELS[rangeId] || DATE_RANGE_LABELS['last-30-days']
    };
  };

  const selectedRange = useMemo(() => resolveDateRange(dateRange), [dateRange]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const parsed = parseDateValue(invoice?.issueDate || invoice?.date || invoice?.createdAt);
      if (!parsed) return false;
      const timestamp = parsed.getTime();
      return timestamp >= selectedRange.start.getTime() && timestamp <= selectedRange.end.getTime();
    });
  }, [invoices, selectedRange]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    return months.map((month, index) => {
      const monthInvoices = filteredInvoices.filter((invoice) => {
        const invDate = parseDateValue(invoice?.issueDate || invoice?.date || invoice?.createdAt);
        return invDate && invDate.getMonth() === index && invDate.getFullYear() === currentYear;
      });

      const monthRevenue = monthInvoices.reduce(
        (sum, invoice) => sum + toNumber(invoice.totalAmount || invoice.amount || invoice.total),
        0
      );
      const monthPaid = monthInvoices
        .filter((invoice) => String(invoice.status || '').toLowerCase() === 'paid')
        .reduce((sum, invoice) => sum + toNumber(invoice.totalAmount || invoice.amount || invoice.total), 0);

      return {
        month,
        revenue: monthRevenue,
        invoices: monthInvoices.length,
        paid: monthPaid,
        pending: Math.max(0, monthRevenue - monthPaid)
      };
    });
  }, [filteredInvoices]);

  const topCustomers = useMemo(() => {
    const customerData = customers
      .map((customer) => {
        const customerId = String(customer.id || customer._id || '');
        const customerName = String(customer.name || '').trim().toLowerCase();
        const customerInvoices = filteredInvoices.filter((invoice) => {
          const invoiceCustomerId = String(
            invoice.customerId || invoice.customer?._id || invoice.customer?.id || ''
          );
          const invoiceCustomerName = String(
            (typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.name)
            || invoice.customerName
            || ''
          ).trim().toLowerCase();

          if (customerId && invoiceCustomerId) {
            return customerId === invoiceCustomerId;
          }
          return customerName && invoiceCustomerName && customerName === invoiceCustomerName;
        });

        const customerRevenue = customerInvoices.reduce(
          (sum, invoice) => sum + toNumber(invoice.totalAmount || invoice.amount || invoice.total),
          0
        );

        const customerPaid = customerInvoices
          .filter((invoice) => String(invoice.status || '').toLowerCase() === 'paid')
          .reduce((sum, invoice) => sum + toNumber(invoice.totalAmount || invoice.amount || invoice.total), 0);

        const paymentRate = customerRevenue > 0 ? (customerPaid / customerRevenue) * 100 : 0;

        return {
          id: customer.id || customer._id || customer.name,
          name: customer.name,
          displayName: customer.name.length > 15 ? `${customer.name.substring(0, 12)}...` : customer.name,
          total: customerRevenue,
          invoices: customerInvoices.length,
          paid: customerPaid,
          paymentRate: paymentRate.toFixed(0),
          lastInvoice: customerInvoices.length > 0
            ? new Date(Math.max(...customerInvoices.map((invoice) => {
                const value = parseDateValue(invoice?.issueDate || invoice?.date || invoice?.createdAt);
                return value ? value.getTime() : 0;
              })))
            : null
        };
      })
      .filter((customer) => customer.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return customerData;
  }, [customers, filteredInvoices]);

  useEffect(() => {
    if (!topCustomers.length) {
      setActiveCustomer(null);
      return;
    }
    const exists = topCustomers.some((customer) => customer.id === activeCustomer);
    if (!exists) {
      setActiveCustomer(topCustomers[0].id);
    }
  }, [topCustomers, activeCustomer]);

  const insights = useMemo(() => {
    const paidInvoices = filteredInvoices.filter(
      (invoice) => String(invoice.status || '').toLowerCase() === 'paid'
    );
    const pendingInvoices = filteredInvoices.filter((invoice) => {
      const status = String(invoice.status || '').toLowerCase();
      return status === 'sent' || status === 'pending';
    });
    const overdueInvoices = filteredInvoices.filter(
      (invoice) => String(invoice.status || '').toLowerCase() === 'overdue'
    );

    const totalRevenue = filteredInvoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.totalAmount || invoice.amount || invoice.total),
      0
    );
    const paidRevenue = paidInvoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.totalAmount || invoice.amount || invoice.total),
      0
    );
    const pendingRevenue = pendingInvoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.totalAmount || invoice.amount || invoice.total),
      0
    );
    const overdueRevenue = overdueInvoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.totalAmount || invoice.amount || invoice.total),
      0
    );

    const avgInvoiceValue = filteredInvoices.length > 0 ? totalRevenue / filteredInvoices.length : 0;
    const collectionRate = totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0;
    const rangeDays = Math.max(1, Math.ceil((selectedRange.end.getTime() - selectedRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const bestMonth = monthlyData.reduce(
      (max, month) => (month.revenue > max.revenue ? month : max),
      { revenue: 0, month: 'None' }
    );

    return {
      bestMonth: () => ({ month: bestMonth.month, revenue: bestMonth.revenue }),
      avgDailySales: avgInvoiceValue > 0 ? (totalRevenue / rangeDays).toFixed(0) : 0,
      collectionRate: collectionRate.toFixed(1),
      pendingAmount: pendingRevenue,
      overdueAmount: overdueRevenue,
      paidCount: paidInvoices.length,
      pendingCount: pendingInvoices.length,
      totalRevenue
    };
  }, [filteredInvoices, monthlyData, selectedRange]);

  const growthSummary = useMemo(() => {
    if (monthlyData.length < 2) {
      return { isUp: false, value: '0.0%' };
    }

    const firstRevenue = toNumber(monthlyData[0]?.revenue);
    const lastRevenue = toNumber(monthlyData[monthlyData.length - 1]?.revenue);

    if (firstRevenue <= 0) {
      if (lastRevenue > 0) return { isUp: true, value: '+100.0%' };
      return { isUp: false, value: '0.0%' };
    }

    const change = ((lastRevenue - firstRevenue) / firstRevenue) * 100;
    return {
      isUp: change >= 0,
      value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
    };
  }, [monthlyData]);

  const topCustomersTotal = useMemo(
    () => topCustomers.reduce((sum, customer) => sum + toNumber(customer.total), 0),
    [topCustomers]
  );
  const topCustomersShare = insights.totalRevenue > 0
    ? ((topCustomersTotal / insights.totalRevenue) * 100).toFixed(1)
    : '0.0';

  // Find active customer data
  const activeCustomerData = useMemo(() => {
    return topCustomers.find(c => c.id === activeCustomer) || topCustomers[0];
  }, [activeCustomer, topCustomers]);

  // Active index for pie chart
  const activeIndex = useMemo(() => {
    return topCustomers.findIndex(c => c.id === activeCustomer);
  }, [activeCustomer, topCustomers]);

  // Pie chart configuration
  const pieChartConfig = {
    colors: [
      isDarkMode ? "#3b82f6" : "#2563eb",  // Blue
      isDarkMode ? "#10b981" : "#059669",  // Green
      isDarkMode ? "#f59e0b" : "#d97706",  // Amber
      isDarkMode ? "#8b5cf6" : "#7c3aed",  // Violet
      isDarkMode ? "#ec4899" : "#db2777",  // Pink
    ]
  };

  // Chart configuration
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: isDarkMode ? "#3b82f6" : "#2563eb",
    },
    paid: {
      label: "Paid",
      color: isDarkMode ? "#10b981" : "#059669",
    },
    pending: {
      label: "Pending",
      color: isDarkMode ? "#f59e0b" : "#d97706",
    }
  };

  // Active shape for pie chart
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.9}
        />
      </g>
    );
  };

  // Enhanced PieChart component with proper centering
  const EnhancedPieChart = () => {
    if (topCustomers.length === 0) {
      return (
        <div className={`h-[320px] md:h-[400px] flex flex-col items-center justify-center ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Users className={`w-12 h-12 md:w-16 md:h-16 mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <div className={`text-base md:text-lg font-medium text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            No customer data available
          </div>
          <div className={`text-xs md:text-sm mt-2 text-center px-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            Add invoices for customers to see revenue distribution
          </div>
        </div>
      );
    }

    return (
      <div className="h-[420px] md:h-[520px] w-full">
        <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-6">
          {/* Pie Chart - Larger, centered and with overlay labels */}
          <div className="relative lg:w-2/3 h-[260px] md:h-[340px] lg:h-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <PieChart>
                <Tooltip 
                  formatter={(value) => [formatMoneyNoDecimals(value), 'Revenue']}
                  content={(props) => (
                    <CustomChartTooltip
                      {...props}
                      isDarkMode={isDarkMode}
                      formatValue={formatMoneyNoDecimals}
                    />
                  )}
                />
                <Pie
                  data={topCustomers}
                  dataKey="total"
                  nameKey="displayName"
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="90%"
                  paddingAngle={3}
                  strokeWidth={2}
                  stroke={isDarkMode ? '#1f2937' : '#f9fafb'}
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                >
                  {topCustomers.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={pieChartConfig.colors[index % pieChartConfig.colors.length]}
                      stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="max-w-[64%] px-2 text-center">
                <div className={`font-bold leading-tight break-words ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`} style={{ fontSize: 'clamp(1rem, 2.1vw, 1.9rem)' }}>
                  {formatMoneyNoDecimals(activeCustomerData?.total || 0)}
                </div>
                <div className={`mt-1 text-xs md:text-sm truncate ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {activeCustomerData?.displayName || 'No data'}
                </div>
                <div className={`mt-1 text-[11px] md:text-xs font-semibold ${
                  parseFloat(activeCustomerData?.paymentRate || 0) > 70
                    ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
                    : (isDarkMode ? 'text-amber-400' : 'text-amber-600')
                }`}>
                  {activeCustomerData?.paymentRate || '0'}% Paid
                </div>
              </div>
            </div>
          </div>

          {/* Customer Legend - Responsive */}
          <div className="lg:w-1/3 h-[160px] md:h-[170px] lg:h-full">
            <div className={`h-full ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} rounded-lg md:rounded-xl p-3 md:p-4 flex flex-col`}>
              <h4 className={`font-semibold mb-2 md:mb-3 text-xs md:text-sm uppercase tracking-wider ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Top Customers
              </h4>
              
              {/* Compact scrollable list */}
              <div className="flex-1 overflow-y-auto pr-1 md:pr-2 min-h-0">
                <div className="space-y-1 md:space-y-2">
                  {topCustomers.map((customer, index) => (
                    <div 
                      key={customer.id}
                      className={`flex items-center p-2 md:p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                        activeCustomer === customer.id
                          ? isDarkMode 
                            ? 'bg-gray-700 border-l-2 border-primary-500' 
                            : 'bg-white border-l-2 border-primary-500 shadow-sm'
                          : isDarkMode 
                            ? 'hover:bg-gray-700/50' 
                            : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveCustomer(customer.id)}
                    >
                      <div 
                        className="w-2 h-2 md:w-3 md:h-3 rounded-full mr-2 flex-shrink-0"
                        style={{ backgroundColor: pieChartConfig.colors[index % pieChartConfig.colors.length] }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <div className={`text-xs md:text-sm font-medium truncate ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {customer.displayName}
                          </div>
                          <div className={`text-xs font-semibold ml-2 whitespace-nowrap ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {formatMoneyNoDecimals(customer.total)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {customer.invoices} inv
                          </div>
                          <div className={`text-xs font-medium ${
                            parseFloat(customer.paymentRate) > 70 
                              ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
                              : (isDarkMode ? 'text-amber-400' : 'text-amber-600')
                          }`}>
                            {customer.paymentRate}% paid
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Simple summary */}
              <div className={`mt-2 md:mt-3 pt-2 md:pt-3 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex justify-between items-center">
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total shown
                  </div>
                  <div className={`text-sm font-bold whitespace-nowrap ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatMoneyNoDecimals(topCustomers.reduce((sum, c) => sum + c.total, 0))}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    % of total
                  </div>
                  <div className={`text-xs font-medium whitespace-nowrap ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {topCustomersShare}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Sales Performance Chart */}
      <div className={`border rounded-lg md:rounded-xl p-4 md:p-6 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6">
          <div className="mb-2 sm:mb-0">
            <h3 className={`text-base md:text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Sales Performance
            </h3>
            <p className={`mt-1 text-xs md:text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Revenue trend for {selectedRange.label}
            </p>
          </div>
          <div className={`flex items-center text-sm md:text-base ${
            growthSummary.isUp
              ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
              : (isDarkMode ? 'text-red-400' : 'text-red-600')
          }`}>
            {growthSummary.isUp ? (
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            )}
            <span className="font-medium">
              {growthSummary.value} growth
            </span>
          </div>
        </div>
        
        {/* Bar Chart with Recharts - Responsive */}
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                fontSize={11}
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
              />
              <YAxis 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                fontSize={11}
                tickFormatter={(value) => formatCompactCurrency(value)}
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
              />
              <Tooltip content={(props) => (
                <CustomChartTooltip
                  {...props}
                  isDarkMode={isDarkMode}
                  formatValue={formatMoneyNoDecimals}
                />
              )} />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '12px',
                  paddingTop: '10px'
                }}
              />
              <Bar 
                dataKey="revenue" 
                name="Total Revenue" 
                fill={chartConfig.revenue.color}
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="paid" 
                name="Paid Amount" 
                fill={chartConfig.paid.color}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Customers and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top Customers Pie Chart */}
        <div className={`border rounded-lg md:rounded-xl p-4 md:p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6">
            <div className="mb-2 sm:mb-0">
              <h3 className={`text-base md:text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Top Customers
              </h3>
              <p className={`mt-1 text-xs md:text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Revenue distribution
              </p>
            </div>
            
            {topCustomers.length > 0 && (
              <div className="w-full sm:w-auto">
                <Select 
                  value={activeCustomer} 
                  onValueChange={setActiveCustomer}
                  className="w-full sm:w-[160px] md:w-[180px]"
                  triggerClassName={`h-8 md:h-9 text-xs md:text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  contentClassName={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}
                  placeholder="Select customer"
                >
                  {topCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 md:w-3 md:h-3 rounded-full shrink-0"
                          style={{
                            backgroundColor: pieChartConfig.colors[topCustomers.findIndex(c => c.id === customer.id) % pieChartConfig.colors.length]
                          }}
                        />
                        <span className="truncate text-xs md:text-sm">{customer.displayName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}
          </div>

          <EnhancedPieChart />
        </div>

        {/* Quick Insights */}
        <div className={`border rounded-lg md:rounded-xl p-4 md:p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-base md:text-lg font-semibold mb-4 md:mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Quick Insights
          </h3>
          <div className="space-y-3 md:space-y-4">
            {/* Best Performing Month */}
            <div className={`p-3 md:p-4 border rounded-lg ${
              isDarkMode 
                ? 'bg-emerald-900/20 border-emerald-800' 
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex items-center">
                <TrendingUp className={`w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
                <div>
                  <div className={`text-sm md:text-base font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Best Performing Month
                  </div>
                  <div className={`text-xs md:text-sm mt-0.5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {`${insights.bestMonth().month} with ${formatMoneyNoDecimals(insights.bestMonth().revenue)} revenue`}
                  </div>
                </div>
              </div>
            </div>

            {/* Collection Rate */}
            <div className={`p-3 md:p-4 border rounded-lg ${
              isDarkMode 
                ? 'bg-blue-900/20 border-blue-800' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center">
                <BarChart3 className={`w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div>
                  <div className={`text-sm md:text-base font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Collection Rate
                  </div>
                  <div className={`text-xs md:text-sm mt-0.5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {insights.collectionRate}% of invoices collected ({insights.paidCount} paid)
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Amount */}
            <div className={`p-3 md:p-4 border rounded-lg ${
              isDarkMode 
                ? 'bg-amber-900/20 border-amber-800' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center">
                <DollarSign className={`w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 ${
                  isDarkMode ? 'text-amber-400' : 'text-amber-600'
                }`} />
                <div>
                  <div className={`text-sm md:text-base font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Pending Collection
                  </div>
                  <div className={`text-xs md:text-sm mt-0.5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {formatMoneyNoDecimals(insights.pendingAmount)} across {insights.pendingCount} invoices
                  </div>
                </div>
              </div>
            </div>

            {/* Overdue Alert */}
            <div className={`p-3 md:p-4 border rounded-lg ${
              isDarkMode 
                ? 'bg-red-900/20 border-red-800' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center">
                <TrendingDown className={`w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 ${
                  isDarkMode ? 'text-red-400' : 'text-red-600'
                }`} />
                <div>
                  <div className={`text-sm md:text-base font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Overdue Amount
                  </div>
                  <div className={`text-xs md:text-sm mt-0.5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {formatMoneyNoDecimals(insights.overdueAmount)} needs attention
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

