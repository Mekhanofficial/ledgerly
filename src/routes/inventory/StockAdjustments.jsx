import React, { useState } from 'react';
import { PackagePlus, Plus, Search, Filter, Download, TrendingUp, TrendingDown, BarChart, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const StockAdjustments = () => {
  const { isDarkMode } = useTheme();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const adjustments = [
    {
      id: 'ADJ-001',
      date: 'Dec 15, 2024',
      product: 'Wireless Headphones',
      sku: 'WH-001',
      type: 'Restock',
      quantity: '+25',
      reason: 'Supplier delivery',
      user: 'John Doe',
      previousStock: 20,
      newStock: 45
    },
    {
      id: 'ADJ-002',
      date: 'Dec 14, 2024',
      product: 'Laptop Computer',
      sku: 'LP-002',
      type: 'Sale',
      quantity: '-3',
      reason: 'Customer purchase',
      user: 'Jane Smith',
      previousStock: 11,
      newStock: 8
    },
    {
      id: 'ADJ-003',
      date: 'Dec 13, 2024',
      product: 'Office Chair',
      sku: 'CH-004',
      type: 'Return',
      quantity: '+1',
      reason: 'Customer return',
      user: 'Mike Johnson',
      previousStock: -1,
      newStock: 0
    },
    {
      id: 'ADJ-004',
      date: 'Dec 12, 2024',
      product: 'Ball Point Pens',
      sku: 'BP-005',
      type: 'Damage',
      quantity: '-5',
      reason: 'Damaged in storage',
      user: 'Sarah Wilson',
      previousStock: 10,
      newStock: 5
    },
    {
      id: 'ADJ-005',
      date: 'Dec 11, 2024',
      product: 'Wireless Mouse',
      sku: 'MS-006',
      type: 'Restock',
      quantity: '+50',
      reason: 'Bulk order',
      user: 'Robert Brown',
      previousStock: -18,
      newStock: 32
    },
    {
      id: 'ADJ-006',
      date: 'Dec 10, 2024',
      product: 'Office Notebooks',
      sku: 'NB-003',
      type: 'Sale',
      quantity: '-10',
      reason: 'Corporate order',
      user: 'Lisa Taylor',
      previousStock: 130,
      newStock: 120
    }
  ];

  const getTypeColor = (type) => {
    const colors = {
      Restock: isDarkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800',
      Sale: isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800',
      Return: isDarkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800',
      Damage: isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800',
      Transfer: isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'
    };
    return colors[type] || isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    const icons = {
      Restock: ArrowUp,
      Sale: ArrowDown,
      Return: RefreshCw,
      Damage: TrendingDown
    };
    return icons[type] || PackagePlus;
  };

  const filteredAdjustments = adjustments.filter(adj => {
    const matchesSearch = adj.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adj.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adj.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || adj.type.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Total Adjustments', value: adjustments.length, icon: PackagePlus, color: 'bg-blue-500' },
    { label: 'Restocks', value: adjustments.filter(a => a.type === 'Restock').length, icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Sales', value: adjustments.filter(a => a.type === 'Sale').length, icon: TrendingDown, color: 'bg-blue-500' },
    { label: 'This Month', value: '12', icon: BarChart, color: 'bg-purple-500' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Stock Adjustments
            </h1>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Track all inventory changes and adjustments
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Link
              to="/inventory"
              className={`flex items-center px-4 py-2 border rounded-lg ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <PackagePlus className="w-4 h-4 mr-2" />
              Inventory Dashboard
            </Link>
            <Link
              to="/inventory/stock-adjustments/new"
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Adjustment
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`border rounded-xl p-5 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className={`border rounded-xl p-4 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product, SKU, or adjustment ID..."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex flex-wrap gap-2">
                {['all', 'restock', 'sale', 'return', 'damage'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                      filter === type
                        ? 'bg-primary-600 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <button className={`flex items-center px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}>
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </button>
              <button className={`flex items-center px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Adjustments Table */}
        <div className={`border rounded-xl overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Adjustment ID
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Product
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Type
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Quantity Change
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Stock Before/After
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Reason
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    User
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                {filteredAdjustments.map((adj) => {
                  const TypeIcon = getTypeIcon(adj.type);
                  return (
                    <tr key={adj.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {adj.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                          {adj.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {adj.product}
                          </div>
                          <div className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {adj.sku}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(adj.type)}`}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {adj.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`font-bold ${
                          adj.quantity.startsWith('+') 
                            ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                            : isDarkMode ? 'text-red-400' : 'text-red-600'
                        }`}>
                          {adj.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{adj.previousStock} → </span>
                          <span className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {adj.newStock}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {adj.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {adj.user}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StockAdjustments;