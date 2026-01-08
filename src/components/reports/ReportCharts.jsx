// src/components/reports/ReportCharts.js
import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
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
      
      return {
        id: customer.id || customer.name, // Use name as ID if no id exists
        name: customer.name,
        displayName: customer.name.length > 15 ? customer.name.substring(0, 12) + '...' : customer.name,
        total: customerRevenue,
        invoices: customerInvoices.length,
        paid: customerInvoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0)
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
      pendingCount: pendingInvoices.length
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
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 25}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.3}
        />
      </g>
    );
  };

  // Custom label for pie chart center
  const renderCenterLabel = ({ viewBox, activeCustomerData, isDarkMode }) => {
    if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
      return null;
    }
    
    return (
      <g>
        <text
          x={viewBox.cx}
          y={viewBox.cy}
          textAnchor="middle"
          dominantBaseline="middle"
          className={isDarkMode ? 'fill-white' : 'fill-gray-900'}
          style={{ fontSize: '1.75rem', fontWeight: 'bold' }}
        >
          ${activeCustomerData?.total?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || 0}
        </text>
        <text
          x={viewBox.cx}
          y={viewBox.cy + 28}
          textAnchor="middle"
          dominantBaseline="middle"
          className={isDarkMode ? 'fill-gray-400' : 'fill-gray-600'}
          style={{ fontSize: '0.875rem' }}
        >
          {activeCustomerData?.displayName || 'No data'}
        </text>
      </g>
    );
  };

  // Simplified PieChart component to debug
  const SimplePieChart = () => {
    if (topCustomers.length === 0) {
      return (
        <div className={`h-[300px] flex items-center justify-center ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          No customer data available
        </div>
      );
    }

    return (
      <div className="h-[300px] flex items-center justify-center">
        <CustomChartContainer className="aspect-square w-full max-w-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 0 })}`, '']}
                content={(props) => <CustomChartTooltip {...props} isDarkMode={isDarkMode} />}
              />
              <Pie
                data={topCustomers}
                dataKey="total"
                nameKey="displayName"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                strokeWidth={3}
                stroke={isDarkMode ? '#374151' : '#ffffff'}
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
              >
                {topCustomers.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={pieChartConfig.colors[index % pieChartConfig.colors.length]}
                  />
                ))}
              </Pie>
              {renderCenterLabel({ 
                viewBox: { cx: 150, cy: 150 }, 
                activeCustomerData, 
                isDarkMode 
              })}
            </PieChart>
          </ResponsiveContainer>
        </CustomChartContainer>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sales Performance Chart */}
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
            <p className={`mt-1 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Monthly revenue for {new Date().getFullYear()}
            </p>
          </div>
          <div className={`flex items-center ${
            monthlyData.length > 1 && monthlyData[monthlyData.length - 1].revenue > monthlyData[0].revenue
              ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
              : (isDarkMode ? 'text-red-400' : 'text-red-600')
          }`}>
            {monthlyData.length > 1 && monthlyData[monthlyData.length - 1].revenue > monthlyData[0].revenue ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span className="font-medium">
              {monthlyData.length > 1 
                ? `${((monthlyData[monthlyData.length - 1].revenue - monthlyData[0].revenue) / monthlyData[0].revenue * 100).toFixed(1)}%` 
                : '0%'} growth
            </span>
          </div>
        </div>
        
        {/* Bar Chart with Recharts */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <YAxis 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={(props) => <CustomChartTooltip {...props} isDarkMode={isDarkMode} />} />
              <Legend />
              <Bar 
                dataKey="revenue" 
                name="Total Revenue" 
                fill={chartConfig.revenue.color}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="paid" 
                name="Paid Amount" 
                fill={chartConfig.paid.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Customers and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers Pie Chart */}
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
                Top Customers
              </h3>
              <p className={`mt-1 text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Revenue distribution
              </p>
            </div>
            
            {topCustomers.length > 0 && (
              <Select 
                value={activeCustomer} 
                onValueChange={setActiveCustomer}
                className="w-[180px]"
                triggerClassName={`h-9 ${
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
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: pieChartConfig.colors[topCustomers.findIndex(c => c.id === customer.id) % pieChartConfig.colors.length]
                        }}
                      />
                      <span className="truncate">{customer.displayName}</span>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            )}
          </div>

          <SimplePieChart />

          {topCustomers.length > 0 && activeCustomerData && (
            <>
              {/* Customer Details */}
              <div className={`p-4 border rounded-lg mt-4 ${
                isDarkMode 
                  ? 'bg-gray-700/50 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Invoices
                    </div>
                    <div className={`text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {activeCustomerData.invoices}
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Paid Amount
                    </div>
                    <div className={`text-lg font-semibold ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>
                      ${activeCustomerData.paid?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer List */}
              <div className="space-y-2 mt-4">
                {topCustomers.map((customer, index) => (
                  <div 
                    key={customer.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      activeCustomer === customer.id
                        ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')
                        : (isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50')
                    }`}
                    onClick={() => setActiveCustomer(customer.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: pieChartConfig.colors[index % pieChartConfig.colors.length] }}
                      />
                      <div>
                        <div className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {customer.displayName}
                        </div>
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {customer.invoices} invoice{customer.invoices !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${customer.total.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Insights */}
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
            {/* Best Performing Month */}
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
                    {insights.bestMonth().month} with ${insights.bestMonth().revenue.toLocaleString('en-US', { minimumFractionDigits: 0 })} revenue
                  </div>
                </div>
              </div>
            </div>

            {/* Collection Rate */}
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
                    Collection Rate
                  </div>
                  <div className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {insights.collectionRate}% of invoices collected ({insights.paidCount} paid)
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Amount */}
            <div className={`p-4 border rounded-lg ${
              isDarkMode 
                ? 'bg-amber-900/20 border-amber-800' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center">
                <DollarSign className={`w-5 h-5 mr-3 ${
                  isDarkMode ? 'text-amber-400' : 'text-amber-600'
                }`} />
                <div>
                  <div className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Pending Collection
                  </div>
                  <div className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    ${insights.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })} across {insights.pendingCount} invoices
                  </div>
                </div>
              </div>
            </div>

            {/* Overdue Alert */}
            <div className={`p-4 border rounded-lg ${
              isDarkMode 
                ? 'bg-red-900/20 border-red-800' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center">
                <TrendingDown className={`w-5 h-5 mr-3 ${
                  isDarkMode ? 'text-red-400' : 'text-red-600'
                }`} />
                <div>
                  <div className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Overdue Amount
                  </div>
                  <div className={`text-sm mt-1 ${
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