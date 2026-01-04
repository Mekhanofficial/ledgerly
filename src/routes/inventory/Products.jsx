import React, { useState } from 'react';
import { Package, Plus, Filter, Download, Search, Edit, PackagePlus, AlertCircle, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Products = () => {
  const { isDarkMode } = useTheme();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const products = [
    {
      id: 1,
      name: 'Wireless Headphones',
      sku: 'WH-001',
      category: 'Electronics',
      quantity: 45,
      price: 89.99,
      totalValue: 4049.55,
      status: 'In Stock',
      supplier: 'Audio Suppliers Inc'
    },
    {
      id: 2,
      name: 'Laptop Computer',
      sku: 'LP-002',
      category: 'Electronics',
      quantity: 8,
      price: 1299.00,
      totalValue: 10392.00,
      status: 'Low Stock',
      supplier: 'Tech Distributors'
    },
    {
      id: 3,
      name: 'Office Notebooks',
      sku: 'NB-003',
      category: 'Stationery',
      quantity: 120,
      price: 12.50,
      totalValue: 1500.00,
      status: 'In Stock',
      supplier: 'Office Supplies Co'
    },
    {
      id: 4,
      name: 'Office Chair',
      sku: 'CH-004',
      category: 'Furniture',
      quantity: 0,
      price: 225.00,
      totalValue: 0.00,
      status: 'Out of Stock',
      supplier: 'Furniture Express'
    },
    {
      id: 5,
      name: 'Ball Point Pens',
      sku: 'BP-005',
      category: 'Stationery',
      quantity: 5,
      price: 2.99,
      totalValue: 14.95,
      status: 'Low Stock',
      supplier: 'Writing Instruments Ltd'
    },
    {
      id: 6,
      name: 'Wireless Mouse',
      sku: 'MS-006',
      category: 'Electronics',
      quantity: 32,
      price: 29.99,
      totalValue: 959.68,
      status: 'In Stock',
      supplier: 'Tech Distributors'
    }
  ];

  const getStatusBadge = (status, quantity) => {
    if (status === 'Out of Stock' || quantity === 0) {
      return isDarkMode 
        ? <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-900/30 text-red-300 rounded-full">
            <AlertCircle className="w-3 h-3 mr-1" />
            Out of Stock
          </span>
        : <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            <AlertCircle className="w-3 h-3 mr-1" />
            Out of Stock
          </span>;
    }
    if (status === 'Low Stock' || quantity <= 10) {
      return isDarkMode 
        ? <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-900/30 text-amber-300 rounded-full">
            <AlertCircle className="w-3 h-3 mr-1" />
            Low Stock
          </span>
        : <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
            <AlertCircle className="w-3 h-3 mr-1" />
            Low Stock
          </span>;
    }
    return isDarkMode 
      ? <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-emerald-900/30 text-emerald-300 rounded-full">
          <CheckCircle className="w-3 h-3 mr-1" />
          In Stock
        </span>
      : <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
          <CheckCircle className="w-3 h-3 mr-1" />
          In Stock
        </span>;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'low-stock' && (product.status === 'Low Stock' || product.quantity <= 10)) ||
                         (filter === 'out-of-stock' && (product.status === 'Out of Stock' || product.quantity === 0)) ||
                         (filter === 'in-stock' && product.status === 'In Stock');
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Products
            </h1>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage your product inventory
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
              <Package className="w-4 h-4 mr-2" />
              Inventory Dashboard
            </Link>
            <Link
              to="/inventory/products/new"
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </div>
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
                placeholder="Search products by name or SKU..."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex flex-wrap gap-2">
                {['all', 'in-stock', 'low-stock', 'out-of-stock'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                      filter === status
                        ? 'bg-primary-600 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.replace('-', ' ')}
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

        {/* Products Table */}
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
                    Product
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    SKU
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Category
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Stock
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Unit Price
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Total Value
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Supplier
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
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <Package className={`w-5 h-5 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        </div>
                        <div>
                          <div className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-mono ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {product.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {product.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${product.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${product.totalValue.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(product.status, product.quantity)}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {product.supplier}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className={`p-1.5 rounded-lg ${
                          isDarkMode 
                            ? 'text-blue-400 hover:bg-blue-900/20' 
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}>
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className={`p-1.5 rounded-lg ${
                          isDarkMode 
                            ? 'text-emerald-400 hover:bg-emerald-900/20' 
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}>
                          <PackagePlus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`border rounded-xl p-4 ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-800' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-blue-300' : 'text-gray-600'
                }`}>
                  Total Products
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {products.length}
                </p>
              </div>
              <Package className={`w-8 h-8 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
          </div>
          <div className={`border rounded-xl p-4 ${
            isDarkMode 
              ? 'bg-amber-900/20 border-amber-800' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-amber-300' : 'text-gray-600'
                }`}>
                  Low Stock Items
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {products.filter(p => p.status === 'Low Stock').length}
                </p>
              </div>
              <AlertCircle className={`w-8 h-8 ${
                isDarkMode ? 'text-amber-400' : 'text-amber-600'
              }`} />
            </div>
          </div>
          <div className={`border rounded-xl p-4 ${
            isDarkMode 
              ? 'bg-emerald-900/20 border-emerald-800' 
              : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-emerald-300' : 'text-gray-600'
                }`}>
                  Total Value
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  ${products.reduce((sum, p) => sum + p.totalValue, 0).toFixed(2)}
                </p>
              </div>
              <Package className={`w-8 h-8 ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Products;