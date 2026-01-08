// src/utils/reportGenerator.js
export const generateReportData = (invoices, customers, report) => {
  // Calculate invoice statistics
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending' || inv.status === 'sent').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
  const draftInvoices = invoices.filter(inv => inv.status === 'draft').length;
  
  // Calculate customer statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => (c.transactions || 0) > 0).length;
  const newCustomersLast30Days = customers.filter(c => {
    const customerDate = new Date(c.createdAt || c.joinedDate);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return customerDate > thirtyDaysAgo;
  }).length;
  
  // Get top customers
  const topCustomers = customers.map(customer => {
    const customerInvoices = invoices.filter(inv => inv.customerId === customer.id || inv.customer === customer.name);
    const customerRevenue = customerInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    
    return {
      name: customer.name,
      totalInvoices: customerInvoices.length,
      totalAmount: customerRevenue,
      lastPurchase: customer.lastTransaction || 'Never',
      email: customer.email
    };
  })
  .filter(c => c.totalInvoices > 0)
  .sort((a, b) => b.totalAmount - a.totalAmount)
  .slice(0, 10);

  // Generate monthly trend data
  const generateMonthlyTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    
    return months.map((month, index) => {
      // Calculate revenue for each month
      const monthRevenue = invoices
        .filter(inv => {
          const invDate = new Date(inv.issueDate || inv.createdAt);
          return invDate.getMonth() === index && invDate.getFullYear() === currentDate.getFullYear();
        })
        .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
      
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.issueDate || inv.createdAt);
        return invDate.getMonth() === index && invDate.getFullYear() === currentDate.getFullYear();
      }).length;
      
      return {
        month,
        revenue: monthRevenue,
        invoices: monthInvoices
      };
    });
  };

  const data = {
    metadata: {
      title: report?.title || 'Business Report',
      generated: new Date().toISOString(),
      type: report?.type || 'general',
      format: report?.format || 'pdf',
      dateRange: report?.dateRange || 'last-30-days'
    },
    summary: {
      totalInvoices,
      totalCustomers,
      totalRevenue,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      draftInvoices,
      activeCustomers,
      newCustomersLast30Days
    },
    breakdown: {
      byStatus: {
        draft: draftInvoices,
        sent: invoices.filter(inv => inv.status === 'sent').length,
        paid: paidInvoices,
        overdue: overdueInvoices,
        pending: pendingInvoices,
        cancelled: invoices.filter(inv => inv.status === 'cancelled').length
      },
      byCustomer: topCustomers,
      monthlyTrend: generateMonthlyTrendData(),
      revenueByStatus: {
        paid: invoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0),
        pending: invoices
          .filter(inv => inv.status === 'pending' || inv.status === 'sent')
          .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0),
        overdue: invoices
          .filter(inv => inv.status === 'overdue')
          .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0)
      }
    }
  };

  return data;
};