import React, { useState } from 'react';
import { Search, Filter, Mail, Phone, MoreVertical, Send, Eye, Edit, ChevronDown, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAccount } from '../../context/AccountContext';
import TablePagination from '../ui/TablePagination';
import { useTablePagination } from '../../hooks/usePagination';

const CustomerTable = ({ customers, onSendStatement, onView, onEdit, onDelete }) => {
  const { isDarkMode } = useTheme();
  const { accountInfo } = useAccount();
  const currencyCode = accountInfo?.currency || 'USD';
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter customers based on search and status
  const filteredCustomers = customers.filter(customer => {
    const email = customer.email || '';
    const phone = customer.phone || '';
    const name = customer.name || '';
    // Search filter
    const matchesSearch = !searchTerm || 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm);
    
    // Status filter
    let matchesStatus = true;
    switch (statusFilter) {
      case 'no-balance':
        matchesStatus = customer.outstanding === 0;
        break;
      case 'has-balance':
        matchesStatus = customer.outstanding > 0 && customer.outstanding <= 2000;
        break;
      case 'overdue':
        matchesStatus = customer.outstanding > 2000;
        break;
      default:
        matchesStatus = true;
    }
    
    return matchesSearch && matchesStatus;
  });

  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    paginatedItems: paginatedCustomers
  } = useTablePagination(filteredCustomers, { initialRowsPerPage: 10 });

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const getOutstandingColor = (amount) => {
    if (amount === 0) return isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
    if (amount <= 2000) return isDarkMode ? 'text-amber-400' : 'text-amber-600';
    return isDarkMode ? 'text-red-400' : 'text-red-600';
  };

  const getOutstandingBackground = (amount) => {
    if (amount === 0) return isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50';
    if (amount <= 2000) return isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50';
    return isDarkMode ? 'bg-red-900/20' : 'bg-red-50';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getFilteredCustomerCount = () => {
    return {
      all: customers.length,
      'no-balance': customers.filter(c => c.outstanding === 0).length,
      'has-balance': customers.filter(c => c.outstanding > 0 && c.outstanding <= 2000).length,
      overdue: customers.filter(c => c.outstanding > 2000).length
    };
  };

  const filterCounts = getFilteredCustomerCount();

  return (
    <div className={`border rounded-xl overflow-hidden ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header with Search and Actions */}
      <div className={`px-6 py-4 border-b ${
        isDarkMode 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'border-gray-300'
              }`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Sort by:{' '}
              <select className={`ml-2 border-none bg-transparent focus:ring-0 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <option>Name</option>
                <option>Total Spent</option>
                <option>Last Transaction</option>
                <option>Outstanding</option>
              </select>
            </div>
            <button className={`flex items-center px-4 py-2 border rounded-lg ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
            {selectedCustomers.length > 0 && (
              <button
                onClick={() => onSendStatement(selectedCustomers)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Statements ({selectedCustomers.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer Filters */}
      <div className={`px-6 py-3 border-b ${
        isDarkMode 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-wrap gap-2">
          {[
    { id: 'all', label: 'All', count: filterCounts.all },
            { id: 'no-balance', label: 'No Balance', count: filterCounts['no-balance'] },
            { id: 'has-balance', label: 'Has Balance', count: filterCounts['has-balance'] },
            { id: 'overdue', label: 'Overdue', count: filterCounts.overdue }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                statusFilter === filter.id
                  ? 'bg-primary-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                statusFilter === filter.id
                  ? 'bg-white/20'
                  : isDarkMode
                    ? 'bg-gray-500 text-gray-200'
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className={`rounded focus:ring-primary-500 ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500 text-primary-400' 
                      : 'border-gray-300 text-primary-600'
                  }`}
                />
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Customer Name
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Email
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Phone
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Transactions
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Total Spent
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Outstanding
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Last Transaction
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
            {paginatedCustomers.map((customer) => (
              <tr key={customer.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => handleSelectCustomer(customer.id)}
                    className={`rounded focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-primary-400' 
                        : 'border-gray-300 text-primary-600'
                    }`}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-semibold mr-3 ${
                      isDarkMode 
                        ? 'bg-primary-900/30 text-primary-400' 
                        : 'bg-primary-100 text-primary-800'
                    }`}>
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {customer.name}
                      </div>
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Customer since {customer.joinedDate}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <Mail className={`w-4 h-4 mr-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                    {customer.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <Phone className={`w-4 h-4 mr-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                    {customer.phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm text-center font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {customer.transactions}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(customer.totalSpent)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-bold px-2 py-1 rounded-lg ${getOutstandingColor(customer.outstanding)} ${getOutstandingBackground(customer.outstanding)}`}>
                    {formatCurrency(customer.outstanding)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {customer.lastTransaction}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {/* View Profile Button */}
                    <button
                      onClick={() => onView(customer.id)}
                      className={`p-1.5 rounded-lg ${
                        isDarkMode 
                          ? 'text-blue-400 hover:bg-blue-900/20' 
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {/* Edit Button */}
                    <button
                      onClick={() => onEdit(customer.id)}
                      className={`p-1.5 rounded-lg ${
                        isDarkMode 
                          ? 'text-emerald-400 hover:bg-emerald-900/20' 
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {/* Send Statement Button */}
                    <button
                      onClick={() => onSendStatement([customer.id])}
                      className={`p-1.5 rounded-lg ${
                        isDarkMode 
                          ? 'text-primary-400 hover:bg-primary-900/20' 
                          : 'text-primary-600 hover:bg-primary-50'
                      }`}
                      title="Send Statement"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => onDelete(customer.id)}
                      className={`p-1.5 rounded-lg ${
                        isDarkMode 
                          ? 'text-red-400 hover:bg-red-900/20' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <TablePagination
        page={page}
        totalItems={filteredCustomers.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default CustomerTable;
