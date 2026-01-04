import React, { useState } from 'react';
import { MoreVertical, Eye, Mail } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import InvoiceFilters from '../../components/invoices/InvoiceFilters';
import { useTheme } from '../../context/ThemeContext';

const InvoiceList = () => {
  const { isDarkMode } = useTheme();
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  // Stats data
  const stats = [
    { label: 'Total Invoices', value: '156' },
    { label: 'Total Amount', value: '$287,450' },
    { label: 'Paid Amount', value: '$262,770' },
    { label: 'Overdue', value: '$24,680' }
  ];

  // Invoice data
  const invoices = [
    {
      id: 'INV-2024-001',
      number: 'INV-2024-001',
      customer: 'Acme Corp',
      customerEmail: 'billing@acmecorp.com',
      issueDate: 'Dec 15, 2024',
      dueDate: 'Jan 14, 2025',
      amount: 2450.00,
      status: 'paid',
      items: 3
    },
    {
      id: 'INV-2024-002',
      number: 'INV-2024-002',
      customer: 'TechStart Inc',
      customerEmail: 'finance@techstart.com',
      issueDate: 'Dec 14, 2024',
      dueDate: 'Jan 13, 2025',
      amount: 1825.00,
      status: 'sent',
      items: 2
    },
    {
      id: 'INV-2024-003',
      number: 'INV-2024-003',
      customer: 'Global Solutions',
      customerEmail: 'accounts@globalsol.com',
      issueDate: 'Dec 10, 2024',
      dueDate: 'Jan 9, 2025',
      amount: 3200.00,
      status: 'overdue',
      items: 5
    },
    {
      id: 'INV-2024-004',
      number: 'INV-2024-004',
      customer: 'BlueTech Industries',
      customerEmail: 'payments@bluetech.com',
      issueDate: 'Dec 12, 2024',
      dueDate: 'Jan 11, 2025',
      amount: 4875.00,
      status: 'viewed',
      items: 4
    },
    {
      id: 'INV-2024-005',
      number: 'INV-2024-005',
      customer: 'Innovate Labs',
      customerEmail: 'accounting@innovatelabs.com',
      issueDate: 'Dec 8, 2024',
      dueDate: 'Jan 7, 2025',
      amount: 1350.00,
      status: 'draft',
      items: 1
    }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      viewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'Draft',
      sent: 'Sent',
      viewed: 'Viewed',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const handleExport = () => {
    console.log('Exporting invoices...');
    alert('Exporting invoice data...');
  };

  const handleCreateInvoice = () => {
    window.location.href = '/invoices/create';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Invoices
            </h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage and track all your invoices
            </p>
          </div>
        </div>

        {/* Filters Component */}
        <InvoiceFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          amountRange={amountRange}
          setAmountRange={setAmountRange}
          onExport={handleExport}
          onCreateInvoice={handleCreateInvoice}
          stats={stats}
        />

        {/* Invoices Table */}
        <div className={`border rounded-xl overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Table Header */}
          <div className={`px-6 py-4 border-b ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className={`h-4 w-4 text-primary-600 focus:ring-primary-500 rounded ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedInvoices(invoices.map(inv => inv.id));
                    } else {
                      setSelectedInvoices([]);
                    }
                  }}
                />
                <span className={`ml-3 text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Select all invoices
                </span>
              </div>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Showing 1-5 of 156 invoices | Items per page: 10
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Invoice #
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Customer
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Issue Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Due Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Amount
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvoices([...selectedInvoices, invoice.id]);
                            } else {
                              setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id));
                            }
                          }}
                          className={`h-4 w-4 text-primary-600 focus:ring-primary-500 rounded ${
                            isDarkMode ? 'border-gray-600' : 'border-gray-300'
                          }`}
                        />
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {invoice.number}
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {invoice.items} items
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {invoice.customer}
                        </div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {invoice.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {invoice.issueDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {invoice.dueDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button className={`p-1 rounded ${
                          isDarkMode 
                            ? 'hover:bg-gray-700 text-gray-400' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`} title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className={`p-1 rounded ${
                          isDarkMode 
                            ? 'hover:bg-gray-700 text-gray-400' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`} title="Send">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className={`p-1 rounded ${
                          isDarkMode 
                            ? 'hover:bg-gray-700 text-gray-400' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}>
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={`px-6 py-4 border-t ${
            isDarkMode 
              ? 'border-gray-700' 
              : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Showing 1-5 of 156 invoices
              </div>
              <div className="flex items-center space-x-2">
                <button className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  Previous
                </button>
                <button className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceList;