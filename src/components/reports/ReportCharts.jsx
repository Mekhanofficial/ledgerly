// src/components/reports/ReportCharts.js - COMPLETE FIXED VERSION
import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useInvoice } from '../../context/InvoiceContext';
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

const CustomChartTooltip = ({ active, payload, label, isDarkMode }) => {
  if (active && payload && payload.length) {
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
            {entry.dataKey === 'total' ? 'Revenue' : entry.dataKey}: ${entry.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ReportCharts = () => {
  const { isDarkMode } = useTheme();
  const { invoices, customers } = useInvoice();
  const [activeCustomer, setActiveCustomer] = useState(null);
  
  // Calculate real data for charts
  const calculateMonthlyRevenue = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthRevenue = invoices
        .filter(inv => {
          const invDate = new Date(inv.issueDate || inv.createdAt);
          return invDate.getMonth() === index && invDate.getFullYear() === currentYear;
        })
        .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
      
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.issueDate || inv.createdAt);
        return invDate.getMonth() === index && invDate.getFullYear() === currentYear;
      }).length;
      
      const monthPaid = invoices
        .filter(inv => {
          const invDate = new Date(inv.issueDate || inv.createdAt);
          return invDate.getMonth() === index && 
                 invDate.getFullYear() === currentYear && 
                 inv.status === 'paid';
        })
        .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
      
      return {
        month,
        revenue: monthRevenue,
        invoices: monthInvoices,
        paid: monthPaid,
        pending: monthRevenue - monthPaid
      };
    });
  };

  // Calculate top customers for pie chart
  const calculateTopCustomers = () => {
    const customerData = customers.map(customer => {
      const customerInvoices = invoices.filter(inv => 
        inv.customerId === customer.id || inv.customer === customer.name
      );
      const customerRevenue = customerInvoices.reduce(
        (sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 
        0
      );
      
      const customerPaid = customerInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
      
      const paymentRate = customerRevenue > 0 ? (customerPaid / customerRevenue * 100) : 0;
      
      return {
        id: customer.id || customer.name,
        name: customer.name,
        displayName: customer.name.length > 15 ? customer.name.substring(0, 12) + '...' : customer.name,
        total: customerRevenue,
        invoices: customerInvoices.length,
        paid: customerPaid,
        paymentRate: paymentRate.toFixed(0),
        lastInvoice: customerInvoices.length > 0 ? 
          new Date(Math.max(...customerInvoices.map(inv => new Date(inv.issueDate || inv.createdAt).getTime()))) 
          : null
      };
    })
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

    // Set active customer to the first one if not set
    if (customerData.length > 0 && !activeCustomer) {
      setActiveCustomer(customerData[0].id);
    }

    return customerData;
  };

  // Calculate insights
  const calculateInsights = () => {
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'pending');
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
    
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    const paidRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    const pendingRevenue = pendingInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    const overdueRevenue = overdueInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    
    const avgInvoiceValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;
    const collectionRate = totalRevenue > 0 ? (paidRevenue / totalRevenue * 100) : 0;
    
    return {
      bestMonth: () => {
        const monthlyData = calculateMonthlyRevenue();
        const bestMonth = monthlyData.reduce((max, month) => month.revenue > max.revenue ? month : max, { revenue: 0, month: 'None' });
        return { month: bestMonth.month, revenue: bestMonth.revenue };
      },
      avgDailySales: avgInvoiceValue > 0 ? (avgInvoiceValue * invoices.length / 30).toFixed(0) : 0,
      collectionRate: collectionRate.toFixed(1),
      pendingAmount: pendingRevenue,
      overdueAmount: overdueRevenue,
      paidCount: paidInvoices.length,
      pendingCount: pendingInvoices.length,
      totalRevenue: totalRevenue
    };
  };

  const monthlyData = calculateMonthlyRevenue();
  const topCustomers = calculateTopCustomers();
  const insights = calculateInsights();

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
          outerRadius={outerRadius + 8}
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
      <div className="h-[320px] md:h-[400px] w-full">
        <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-6">
          {/* Pie Chart - Larger and properly centered */}
          <div className="lg:w-2/3 h-2/3 lg:h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 0 })}`, 'Revenue']}
                  content={(props) => <CustomChartTooltip {...props} isDarkMode={isDarkMode} />}
                />
                <Pie
                  data={topCustomers}
                  dataKey="total"
                  nameKey="displayName"
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="75%"
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
                {/* Central text with proper positioning */}
                <text
                  x="50%"
                  y="45%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={isDarkMode ? 'fill-white' : 'fill-gray-900'}
                  style={{ 
                    fontSize: 'clamp(1.25rem, 4vw, 2rem)', 
                    fontWeight: 'bold',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  ${activeCustomerData?.total?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || 0}
                </text>
                <text
                  x="50%"
                  y="55%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={isDarkMode ? 'fill-gray-400' : 'fill-gray-600'}
                  style={{ 
                    fontSize: 'clamp(0.75rem, 2.5vw, 1rem)',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  {activeCustomerData?.displayName || 'No data'}
                </text>
                <text
                  x="50%"
                  y="65%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={parseFloat(activeCustomerData?.paymentRate || 0) > 70 
                    ? (isDarkMode ? 'fill-emerald-400' : 'fill-emerald-600') 
                    : (isDarkMode ? 'fill-amber-400' : 'fill-amber-600')}
                  style={{ 
                    fontSize: 'clamp(0.65rem, 2vw, 0.85rem)',
                    fontWeight: '600',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  {activeCustomerData?.paymentRate || '0'}% Paid
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Customer Legend - Responsive */}
          <div className="lg:w-1/3 h-1/3 lg:h-full">
            <div className={`h-full ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} rounded-lg md:rounded-xl p-3 md:p-4 flex flex-col`}>
              <h4 className={`font-semibold mb-2 md:mb-3 text-xs md:text-sm uppercase tracking-wider ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Top Customers
              </h4>
              
              {/* Compact scrollable list */}
              <div className="flex-1 overflow-y-auto pr-1 min-h-0">
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
                            ${customer.total.toLocaleString('en-US', { minimumFractionDigits: 0 })}
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
                    ${topCustomers.reduce((sum, c) => sum + c.total, 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    % of total
                  </div>
                  <div className={`text-xs font-medium whitespace-nowrap ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {((topCustomers.reduce((sum, c) => sum + c.total, 0) / insights.totalRevenue) * 100 || 0).toFixed(1)}%
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
              Monthly revenue for {new Date().getFullYear()}
            </p>
          </div>
          <div className={`flex items-center text-sm md:text-base ${
            monthlyData.length > 1 && monthlyData[monthlyData.length - 1].revenue > monthlyData[0].revenue
              ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
              : (isDarkMode ? 'text-red-400' : 'text-red-600')
          }`}>
            {monthlyData.length > 1 && monthlyData[monthlyData.length - 1].revenue > monthlyData[0].revenue ? (
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            )}
            <span className="font-medium">
              {monthlyData.length > 1 
                ? `${((monthlyData[monthlyData.length - 1].revenue - monthlyData[0].revenue) / monthlyData[0].revenue * 100).toFixed(1)}%` 
                : '0%'} growth
            </span>
          </div>
        </div>
        
        {/* Bar Chart with Recharts - Responsive */}
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
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
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
              />
              <Tooltip content={(props) => <CustomChartTooltip {...props} isDarkMode={isDarkMode} />} />
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
                    {insights.bestMonth().month} with ${insights.bestMonth().revenue.toLocaleString('en-US', { minimumFractionDigits: 0 })} revenue
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
                    ${insights.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })} across {insights.pendingCount} invoices
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
                    ${insights.overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })} needs attention
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