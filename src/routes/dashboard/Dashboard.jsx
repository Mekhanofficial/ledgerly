import React from 'react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatsCards from '../../components/dashboard/StatsCards';
import QuickActions from '../../components/dashboard/QuickActions';
import RecentInvoices from '../../components/dashboard/RecentInvoices';
import AlertsNotifications from '../../components/dashboard/AlertsNotifications';
import { useInvoice } from '../../context/InvoiceContext';

const Dashboard = () => {
  const { invoices, customers } = useInvoice();

  // Calculate real-time stats
  const calculateStats = () => {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'viewed').length;
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
    const draftInvoices = invoices.filter(inv => inv.status === 'draft').length;
    const activeCustomers = customers.filter(c => c.transactions > 0).length;

    // Calculate month-over-month changes (simplified)
    const currentMonth = new Date().getMonth();
    const lastMonthInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.createdAt || inv.issueDate);
      return invDate.getMonth() === (currentMonth - 1 + 12) % 12;
    });
    
    const lastMonthRevenue = lastMonthInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    const revenueChange = lastMonthRevenue > 0 
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : totalRevenue > 0 ? '100.0' : '0.0';
    
    const invoiceChange = lastMonthInvoices.length > 0
      ? ((totalInvoices - lastMonthInvoices.length) / lastMonthInvoices.length * 100).toFixed(1)
      : totalInvoices > 0 ? '100.0' : '0.0';

    return {
      totalRevenue: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      revenueChange: parseFloat(revenueChange) > 0 ? `+${revenueChange}%` : `${revenueChange}%`,
      totalInvoices: totalInvoices.toString(),
      invoiceChange: parseFloat(invoiceChange) > 0 ? `+${invoiceChange}%` : `${invoiceChange}%`,
      activeCustomers: activeCustomers.toString(),
      overdueInvoices: overdueInvoices.toString(),
      paidInvoices: paidInvoices.toString(),
      pendingInvoices: pendingInvoices.toString(),
      draftInvoices: draftInvoices.toString()
    };
  };

  return (
    <DashboardLayout>
      <DashboardHeader />
      <StatsCards statsData={calculateStats()} />
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - QuickActions */}
        <div className="lg:col-span-2 space-y-6">
          <QuickActions />
          <RecentInvoices />
        </div>
        
        {/* Right Column - Alerts & Notifications */}
        <div className="lg:col-span-1">
          <AlertsNotifications />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;