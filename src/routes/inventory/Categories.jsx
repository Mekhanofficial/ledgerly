import React, { useState } from 'react';
import { Tag, Plus, Search, Package, DollarSign, Edit, ArrowRight, Folder, BarChart, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Categories = () => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      id: 1,
      name: 'Electronics',
      description: 'Computers, phones, and accessories',
      productCount: 12,
      totalValue: 15400.00,
      color: 'bg-blue-500',
      icon: '💻'
    },
    {
      id: 2,
      name: 'Stationery',
      description: 'Office supplies and writing materials',
      productCount: 8,
      totalValue: 2850.00,
      color: 'bg-emerald-500',
      icon: '📝'
    },
    {
      id: 3,
      name: 'Furniture',
      description: 'Office furniture and equipment',
      productCount: 5,
      totalValue: 4200.00,
      color: 'bg-amber-500',
      icon: '🪑'
    },
    {
      id: 4,
      name: 'Clothing',
      description: 'Apparel and accessories',
      productCount: 15,
      totalValue: 8750.00,
      color: 'bg-purple-500',
      icon: '👕'
    },
    {
      id: 5,
      name: 'Accessories',
      description: 'Miscellaneous accessories',
      productCount: 10,
      totalValue: 3150.00,
      color: 'bg-pink-500',
      icon: '🎒'
    }
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Categories
            </h1>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Organize your products into categories
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
              to="/inventory/categories/new"
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className={`border rounded-xl p-4 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'border-gray-300'
              }`}
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className={`border rounded-xl overflow-hidden hover:shadow-lg transition-shadow ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-primary-500' 
                : 'bg-white border-gray-200 hover:border-primary-300'
            }`}>
              <div className={`h-2 ${category.color}`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center mr-3`}>
                      <span className="text-lg">{category.icon}</span>
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {category.name}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {category.description}
                      </p>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Package className={`w-4 h-4 mr-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`} />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                        Products
                      </span>
                    </div>
                    <span className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {category.productCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <DollarSign className={`w-4 h-4 mr-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`} />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                        Total Value
                      </span>
                    </div>
                    <span className={`font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${category.totalValue.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className={`mt-6 pt-6 border-t ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <Link
                    to={`/inventory/products?category=${category.name.toLowerCase()}`}
                    className={`flex items-center justify-center w-full py-2 font-medium rounded-lg transition-colors ${
                      isDarkMode
                        ? 'text-primary-400 hover:text-primary-300 hover:bg-primary-900/20'
                        : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'
                    }`}
                  >
                    View Products
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className={`border rounded-xl p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Category Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`text-center p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {categories.length}
              </div>
              <div className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Categories
              </div>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
              </div>
              <div className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Products
              </div>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                ${categories.reduce((sum, cat) => sum + cat.totalValue, 0).toFixed(2)}
              </div>
              <div className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Value
              </div>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {(categories.reduce((sum, cat) => sum + cat.productCount, 0) / categories.length).toFixed(1)}
              </div>
              <div className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Avg Products/Category
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Categories;