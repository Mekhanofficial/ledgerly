import React, { useState } from 'react';
import { CreditCard, Plus, Filter, Download, BarChart3, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import PaymentStats from '../../components/payments/PaymentStats';
import PaymentTable from '../../components/payments/PaymentTable';

const Payments = () => {
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');

  const payments = [
    {
      id: 1,
      transactionId: 'TXN-001234',
      invoiceId: 'INV-2024-089',
      customer: 'Acme Corporation',
      customerEmail: 'sarah@acmecorp.com',
      amount: 2450.00,
      method: 'Credit Card',
      date: 'Dec 16, 2024',
      time: '10:30 AM',
      status: 'completed'
    },
    {
      id: 2,
      transactionId: 'TXN-001235',
      invoiceId: 'INV-2024-090',
      customer: 'TechStart Industries',
      customerEmail: 'john@techstart.com',
      amount: 1825.00,
      method: 'Bank Transfer',
      date: 'Dec 16, 2024',
      time: '11:45 AM',
      status: 'pending'
    },
    {
      id: 3,
      transactionId: 'TXN-001236',
      invoiceId: 'INV-2024-091',
      customer: 'Global Solutions Ltd',
      customerEmail: 'mike@globalsolutions.com',
      amount: 3200.00,
      method: 'PayPal',
      date: 'Dec 15, 2024',
      time: '02:15 PM',
      status: 'completed'
    },
    {
      id: 4,
      transactionId: 'TXN-001237',
      invoiceId: 'INV-2024-092',
      customer: 'BlueTech Innovations',
      customerEmail: 'lisa@bluetech.com',
      amount: 1250.00,
      method: 'Credit Card',
      date: 'Dec 15, 2024',
      time: '03:30 PM',
      status: 'failed'
    },
    {
      id: 5,
      transactionId: 'TXN-001238',
      invoiceId: 'INV-2024-093',
      customer: 'Peak Performance Group',
      customerEmail: 'alex@peakperformance.com',
      amount: 2100.00,
      method: 'Mobile Money',
      date: 'Dec 14, 2024',
      time: '09:15 AM',
      status: 'completed'
    },
    {
      id: 6,
      transactionId: 'TXN-001239',
      invoiceId: 'INV-2024-094',
      customer: 'Innovate Labs',
      customerEmail: 'emma@innovatelabs.com',
      amount: 4500.00,
      method: 'Bank Transfer',
      date: 'Dec 14, 2024',
      time: '04:45 PM',
      status: 'pending'
    },
    {
      id: 7,
      transactionId: 'TXN-001240',
      invoiceId: 'INV-2024-095',
      customer: 'Digital Dynamics',
      customerEmail: 'david@digitaldynamics.com',
      amount: 1800.00,
      method: 'Credit Card',
      date: 'Dec 13, 2024',
      time: '01:30 PM',
      status: 'refunded'
    },
    {
      id: 8,
      transactionId: 'TXN-001241',
      invoiceId: 'INV-2024-096',
      customer: 'Future Tech Systems',
      customerEmail: 'sophia@futuretech.com',
      amount: 1250.00,
      method: 'PayPal',
      date: 'Dec 12, 2024',
      time: '10:00 AM',
      status: 'completed'
    }
  ];

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.status === filter);

  const handleViewDetails = (paymentId) => {
    console.log('View payment details:', paymentId);
    // Implement view details logic
  };

  const handleProcessPayment = (paymentId) => {
    console.log('Process payment:', paymentId);
    // Implement process payment logic
  };

  const handleRefund = (paymentId) => {
    console.log('Refund payment:', paymentId);
    // Implement refund logic
  };

  const handleSyncPayments = () => {
    console.log('Syncing payments...');
    // Implement sync logic
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-1">Manage and track customer payments</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button 
              onClick={handleSyncPayments}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Payments
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </button>
          </div>
        </div>

        {/* Stats Component */}
        <PaymentStats />

        {/* Date Range and Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['today', 'yesterday', 'this-week', 'this-month', 'last-month'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                    dateRange === range
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.replace('-', ' ')}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex flex-wrap gap-2">
                {['all', 'completed', 'pending', 'failed', 'refunded'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                      filter === status
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </button>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Payment Table Component */}
        <PaymentTable
          payments={filteredPayments}
          onViewDetails={handleViewDetails}
          onProcess={handleProcessPayment}
          onRefund={handleRefund}
        />

        {/* Payment Methods Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-3">
              {[
                { method: 'Credit Card', percentage: 45, amount: '$40,158', color: 'bg-blue-500' },
                { method: 'Bank Transfer', percentage: 28, amount: '$24,987', color: 'bg-emerald-500' },
                { method: 'PayPal', percentage: 15, amount: '$13,386', color: 'bg-blue-400' },
                { method: 'Mobile Money', percentage: 8, amount: '$7,139', color: 'bg-purple-500' },
                { method: 'Cash', percentage: 4, amount: '$3,570', color: 'bg-gray-500' }
              ].map((item) => (
                <div key={item.method} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${item.color} rounded-full mr-3`}></div>
                    <span className="text-sm text-gray-700">{item.method}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{item.percentage}%</div>
                    <div className="text-xs text-gray-500">{item.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-900">Process Pending Payments</span>
                </div>
                <span className="text-sm text-gray-500">15 pending</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <Download className="w-5 h-5 text-emerald-600 mr-3" />
                  <span className="font-medium text-gray-900">Export Payment Report</span>
                </div>
                <span className="text-sm text-gray-500">PDF/Excel</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="font-medium text-gray-900">View Payment Analytics</span>
                </div>
                <span className="text-sm text-gray-500">→</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-gray-900">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium text-gray-900">12%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Failed/Refunded</span>
                  <span className="font-medium text-gray-900">3%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '3%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payments;