import React from 'react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatsCards from '../../components/dashboard/StatsCards';
import QuickActions from '../../components/dashboard/QuickActions';
import RecentInvoices from '../../components/dashboard/RecentInvoices';
import AlertsNotifications from '../../components/dashboard/AlertsNotifications';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <DashboardHeader />
      <StatsCards />
      
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