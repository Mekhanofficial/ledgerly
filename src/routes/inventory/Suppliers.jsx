import React, { useState } from 'react';
import { Truck, Plus, Search, Phone, Mail, CheckCircle, Clock, Edit, Star, Package, Users, Award } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Suppliers = () => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const suppliers = [
    {
      id: 1,
      name: 'Tech Distributors',
      contact: 'John Smith',
      email: 'john@techdist.com',
      phone: '(555) 123-4567',
      products: 45,
      status: 'Active',
      lastOrder: 'Dec 15, 2024',
      totalOrders: 28,
      rating: '4.8'
    },
    {
      id: 2,
      name: 'Audio Suppliers Inc',
      contact: 'Lisa Brown',
      email: 'lisa@audiosupply.com',
      phone: '(555) 987-6543',
      products: 28,
      status: 'Active',
      lastOrder: 'Dec 14, 2024',
      totalOrders: 15,
      rating: '4.5'
    },
    {
      id: 3,
      name: 'Office Supplies Co',
      contact: 'Robert Davis',
      email: 'robert@officesupply.com',
      phone: '(555) 456-7890',
      products: 32,
      status: 'Active',
      lastOrder: 'Dec 12, 2024',
      totalOrders: 22,
      rating: '4.2'
    },
    {
      id: 4,
      name: 'Furniture Express',
      contact: 'Emily Wilson',
      email: 'emily@furnitureexp.com',
      phone: '(555) 321-0987',
      products: 18,
      status: 'Pending',
      lastOrder: 'Dec 10, 2024',
      totalOrders: 8,
      rating: '4.0'
    },
    {
      id: 5,
      name: 'Writing Instruments Ltd',
      contact: 'Michael Chen',
      email: 'michael@writinginst.com',
      phone: '(555) 654-3210',
      products: 25,
      status: 'Active',
      lastOrder: 'Dec 8, 2024',
      totalOrders: 12,
      rating: '4.7'
    },
    {
      id: 6,
      name: 'Global Electronics',
      contact: 'Sarah Johnson',
      email: 'sarah@globalelec.com',
      phone: '(555) 789-0123',
      products: 38,
      status: 'Inactive',
      lastOrder: 'Nov 30, 2024',
      totalOrders: 5,
      rating: '3.8'
    }
  ];

  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return isDarkMode 
        ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>;
    }
    if (status === 'Pending') {
      return isDarkMode 
        ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-900/30 text-amber-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>;
    }
    return isDarkMode 
      ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
          Inactive
        </span>
      : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Inactive
        </span>;
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total Suppliers', value: suppliers.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Suppliers', value: suppliers.filter(s => s.status === 'Active').length, icon: CheckCircle, color: 'bg-emerald-500' },
    { label: 'Total Products', value: suppliers.reduce((sum, s) => sum + s.products, 0), icon: Package, color: 'bg-amber-500' },
    { label: 'Avg. Rating', value: '4.5', icon: Star, color: 'bg-purple-500' }
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
              Suppliers
            </h1>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage your product suppliers and vendors
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
              <Truck className="w-4 h-4 mr-2" />
              Inventory Dashboard
            </Link>
            <Link
              to="/inventory/suppliers/new"
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
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
                placeholder="Search suppliers by name, contact, or email..."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex flex-wrap gap-2">
                {['all', 'Active', 'Pending', 'Inactive'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
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
            </div>
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className={`border rounded-xl overflow-hidden hover:shadow-lg transition-shadow ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-primary-500' 
                : 'bg-white border-gray-200 hover:border-primary-300'
            }`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                      isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'
                    }`}>
                      <Truck className={`w-6 h-6 ${
                        isDarkMode ? 'text-amber-400' : 'text-amber-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {supplier.name}
                      </h3>
                      <div className="flex items-center mt-1">
                        {getStatusBadge(supplier.status)}
                        <span className={`ml-2 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Rating: {supplier.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className={`p-1.5 rounded-lg ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}>
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className={`w-4 h-4 mr-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>
                      {supplier.contact}
                    </span>
                    <span className={`mx-2 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-500'
                    }`}>
                      •
                    </span>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {supplier.email}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className={`w-4 h-4 mr-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>
                      {supplier.phone}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {supplier.products}
                    </div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Products
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {supplier.totalOrders}
                    </div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Orders
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {supplier.lastOrder}
                    </div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Last Order
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    to={`/inventory/products?supplier=${supplier.name}`}
                    className={`block text-center w-full py-2 border rounded-lg font-medium transition-colors ${
                      isDarkMode
                        ? 'border-primary-500 text-primary-400 hover:bg-primary-900/20'
                        : 'border-primary-600 text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    View Products
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Suppliers;