import React from 'react';
import { Eye, Download, Mail, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecentInvoices = () => {
  const invoices = [
    {
      id: 'INV-2024-001',
      customer: 'Acme Corp',
      amount: '$2,450.00',
      status: 'Paid',
      date: 'Dec 15, 2024',
      dueDate: 'Dec 30, 2024',
      items: 3
    },
    {
      id: 'INV-2024-002',
      customer: 'TechStart Inc',
      amount: '$1,825.00',
      status: 'Pending',
      date: 'Dec 14, 2024',
      dueDate: 'Dec 29, 2024',
      items: 2
    },
    {
      id: 'INV-2024-003',
      customer: 'Global Solutions',
      amount: '$3,200.00',
      status: 'Overdue',
      date: 'Dec 10, 2024',
      dueDate: 'Dec 25, 2024',
      items: 5
    },
    {
      id: 'INV-2024-004',
      customer: 'Digital Wave',
      amount: '$1,250.00',
      status: 'Paid',
      date: 'Dec 12, 2024',
      dueDate: 'Dec 27, 2024',
      items: 1
    },
    {
      id: 'INV-2024-005',
      customer: 'Creative Minds',
      amount: '$4,750.00',
      status: 'Pending',
      date: 'Dec 13, 2024',
      dueDate: 'Dec 28, 2024',
      items: 4
    }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      Paid: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
      Pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
      Overdue: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      Draft: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    };
    return styles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  return (
    <div className="card mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Invoices</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Latest 5 invoices from your business</p>
        </div>
        <Link to="/invoices" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
          View all invoices →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Invoice #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date Issued
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.id}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{invoice.items} items</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.customer}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Due {invoice.dueDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{invoice.amount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {invoice.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="View">
                      <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Download">
                      <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Send">
                      <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing 5 of 248 total invoices
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              Previous
            </button>
            <button className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentInvoices;