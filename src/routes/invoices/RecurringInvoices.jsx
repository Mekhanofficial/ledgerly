import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import RecurringStats from '../../components/invoices/recurring/RecurringStats';
import RecurringTable from '../../components/invoices/recurring/RecurringTable';
import HowItWorks from '../../components/invoices/recurring/HowItWorks';
import { useTheme } from '../../context/ThemeContext';

const RecurringInvoices = () => {
  const { isDarkMode } = useTheme();
  const [statusFilter, setStatusFilter] = useState('all');

  const recurringInvoices = [
    {
      id: 'RINV-001',
      name: 'Monthly Web Hosting',
      customer: 'Acme Corp',
      amount: 299.00,
      frequency: 'Monthly',
      nextRun: 'Jan 1, 2025',
      status: 'active',
      startDate: 'Dec 1, 2024',
      endDate: 'Dec 1, 2025',
      totalCycles: 12,
      cyclesCompleted: 1
    },
    {
      id: 'RINV-002',
      name: 'Quarterly Maintenance',
      customer: 'TechStart Inc',
      amount: 1250.00,
      frequency: 'Quarterly',
      nextRun: 'Mar 1, 2025',
      status: 'active',
      startDate: 'Dec 1, 2024',
      endDate: 'Dec 1, 2026',
      totalCycles: 8,
      cyclesCompleted: 1
    },
    {
      id: 'RINV-003',
      name: 'Weekly Consulting',
      customer: 'Global Solutions',
      amount: 850.00,
      frequency: 'Weekly',
      nextRun: 'Dec 23, 2024',
      status: 'active',
      startDate: 'Dec 1, 2024',
      endDate: 'Mar 1, 2025',
      totalCycles: 13,
      cyclesCompleted: 3
    },
    {
      id: 'RINV-004',
      name: 'Annual Subscription',
      customer: 'BlueTech Industries',
      amount: 4999.00,
      frequency: 'Yearly',
      nextRun: 'Dec 1, 2025',
      status: 'paused',
      startDate: 'Dec 1, 2024',
      endDate: 'Dec 1, 2027',
      totalCycles: 3,
      cyclesCompleted: 1
    },
    {
      id: 'RINV-005',
      name: 'Bi-weekly Services',
      customer: 'Innovate Labs',
      amount: 1800.00,
      frequency: 'Bi-weekly',
      nextRun: 'Dec 22, 2024',
      status: 'completed',
      startDate: 'Dec 1, 2024',
      endDate: 'Feb 1, 2025',
      totalCycles: 5,
      cyclesCompleted: 5
    }
  ];

  const handlePauseResume = (invoiceId) => {
    console.log('Pause/Resume invoice:', invoiceId);
  };

  const handleEdit = (invoiceId) => {
    console.log('Edit invoice:', invoiceId);
  };

  const handleDelete = (invoiceId) => {
    console.log('Delete invoice:', invoiceId);
  };

  const filteredInvoices = statusFilter === 'all' 
    ? recurringInvoices 
    : recurringInvoices.filter(invoice => invoice.status === statusFilter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Recurring Invoices
            </h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Automate your regular billing with recurring invoice profiles
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button className={`flex items-center px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </button>
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              New Recurring Profile
            </button>
          </div>
        </div>

        {/* Stats Component */}
        <RecurringStats />

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'active', 'paused', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-primary-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Table Component */}
        <RecurringTable
          invoices={filteredInvoices}
          onPauseResume={handlePauseResume}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* How It Works Component */}
        <HowItWorks />
      </div>
    </DashboardLayout>
  );
};

export default RecurringInvoices;