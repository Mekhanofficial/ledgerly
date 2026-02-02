import React, { useState, useEffect, useMemo } from 'react';
import { PackagePlus, Plus, Search, Filter, Download, TrendingUp, TrendingDown, BarChart, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { mapProductFromApi } from '../../utils/productAdapter';
import { fetchProducts, fetchStockAdjustments } from '../../store/slices/productSlide';

const StockAdjustments = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const { products: rawProducts, stockAdjustments } = useSelector((state) => state.products);
  const products = useMemo(
    () => rawProducts.map((product) => mapProductFromApi(product)),
    [rawProducts]
  );
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const adjustments = stockAdjustments;

  useEffect(() => {
    dispatch(fetchProducts({ isActive: true }));
    dispatch(fetchStockAdjustments({ limit: 200 }));
  }, [dispatch]);

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getProductSku = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.sku : 'N/A';
  };

  const getTypeColor = (type) => {
    const colors = {
      Restock: isDarkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800',
      Sale: isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800',
      Return: isDarkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800',
      Damage: isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800',
      Adjustment: isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'
    };
    return colors[type] || (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800');
  };

  const getTypeIcon = (type) => {
    if (type?.startsWith('Adjustment')) {
      return PackagePlus;
    }
    const icons = {
      Restock: ArrowUp,
      Sale: ArrowDown,
      Return: RefreshCw,
      Damage: TrendingDown,
      Adjustment: PackagePlus
    };
    return icons[type] || PackagePlus;
  };

  const filteredAdjustments = adjustments.filter(adj => {
    const productName = getProductName(adj.productId);
    const productSku = getProductSku(adj.productId);
    const adjustmentId = (adj.id || adj._id || '').toString();
    const normalizedType = adj.type?.startsWith('Adjustment') ? 'Adjustment' : adj.type;
    
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adjustmentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || normalizedType?.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { 
      label: 'Total Adjustments', 
      value: adjustments.length, 
      icon: PackagePlus, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Restocks', 
      value: adjustments.filter(a => a.type === 'Restock').length, 
      icon: TrendingUp, 
      color: 'bg-emerald-500' 
    },
    { 
      label: 'Sales', 
      value: adjustments.filter(a => a.type === 'Sale').length, 
      icon: TrendingDown, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'This Month', 
      value: adjustments.filter(a => {
        const adjDate = new Date(a.date);
        const now = new Date();
        return adjDate.getMonth() === now.getMonth() && adjDate.getFullYear() === now.getFullYear();
      }).length, 
      icon: BarChart, 
      color: 'bg-purple-500' 
    }
  ];

  // Mobile adjustment card component
  const MobileAdjustmentCard = ({ adj }) => {
    const TypeIcon = getTypeIcon(adj.type);
    const productName = getProductName(adj.productId);
    const productSku = getProductSku(adj.productId);
    const adjustmentId = adj.id || adj._id || 'N/A';
    const formattedDate = new Date(adj.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return (
      <div className={`p-4 border rounded-lg mb-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <div className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {adjustmentId}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {formattedDate}
            </div>
          </div>
          <div className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTypeColor(adj.type)}`}>
            <TypeIcon className="w-3 h-3 inline mr-1" />
            {adj.type}
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Product</div>
            <div className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {productName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              SKU: {productSku}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Quantity Change</div>
              <div className={`font-bold ${adj.quantity > 0 ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600' : isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                {adj.quantity > 0 ? `+${adj.quantity}` : adj.quantity}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stock</div>
              <div className="text-sm truncate">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {adj.previousStock || 0} → 
                </span>
                <span className={`font-medium ml-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {adj.newStock || 0}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reason</div>
            <div className="text-sm truncate">
              {adj.reason || adj.type}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
              Stock Adjustments
            </h1>
            <p className={`mt-1 text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Track all inventory changes and adjustments
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              to="/inventory"
              className={`flex items-center px-3 py-2 border rounded-lg text-sm ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <PackagePlus className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Inventory</span>
              <span className="sm:hidden">Inventory</span>
            </Link>
            <Link
              to="/inventory/stock-adjustments/new"
              className="flex items-center px-3 py-2 md:px-4 md:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm md:text-base whitespace-nowrap"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">New Adjustment</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`border rounded-lg md:rounded-xl p-3 md:p-4 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs md:text-sm truncate ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {stat.label}
                    </p>
                    <p className={`text-lg md:text-xl lg:text-2xl font-bold mt-1 truncate ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl flex items-center justify-center ml-2 flex-shrink-0`}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className={`border rounded-lg md:rounded-xl p-4 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search adjustments..."
                className={`w-full pl-10 pr-4 py-2.5 md:py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm md:text-base ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border border-gray-300'
                }`}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
                
                <div className="hidden lg:flex flex-wrap gap-2">
                  {['all', 'Restock', 'Sale', 'Return', 'Damage', 'Adjustment'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                        filter === type
                          ? 'bg-primary-600 text-white'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'all' ? 'All' : type}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className={`flex items-center px-3 py-2 border rounded-lg text-sm ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  <Download className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Filters Panel */}
          {showMobileFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {['all', 'Restock', 'Sale', 'Return', 'Damage', 'Adjustment'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilter(type);
                      setShowMobileFilters(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      filter === type
                        ? 'bg-primary-600 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'all' ? 'All' : type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Count Display */}
        <div className={`text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Showing {filteredAdjustments.length} of {adjustments.length} adjustments
        </div>

        {/* Desktop Table */}
        <div className={`hidden lg:block border rounded-lg md:rounded-xl overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Adjustment ID
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Date
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Product
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Type
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Quantity Change
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Stock Before/After
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                {filteredAdjustments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 md:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      <PackagePlus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No stock adjustments found</p>
                      <p className="text-sm mt-1">
                        Create your first stock adjustment to see it here
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAdjustments.map((adj) => {
                    const TypeIcon = getTypeIcon(adj.type);
                    const productName = getProductName(adj.productId);
                    const productSku = getProductSku(adj.productId);
                    const formattedDate = new Date(adj.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });

                    return (
                      <tr key={adj.id || adj._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {adj.id || adj._id || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-900'
                          }`}>
                            {formattedDate}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div>
                            <div className={`font-medium truncate max-w-xs ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {productName}
                            </div>
                            <div className={`text-xs truncate max-w-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              SKU: {productSku}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(adj.type)}`}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {adj.type}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className={`font-bold ${
                            adj.quantity > 0 
                              ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                              : isDarkMode ? 'text-red-400' : 'text-red-600'
                          }`}>
                            {adj.quantity > 0 ? `+${adj.quantity}` : adj.quantity}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                              {adj.previousStock || 0} → 
                            </span>
                            <span className={`font-medium ml-1 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {adj.newStock || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className={`text-sm truncate max-w-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {adj.reason || adj.type}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {filteredAdjustments.length === 0 ? (
            <div className={`border rounded-lg p-8 text-center ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <PackagePlus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                No stock adjustments found
              </p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Create your first stock adjustment to see it here
              </p>
            </div>
          ) : (
            filteredAdjustments.map((adj) => (
              <MobileAdjustmentCard key={adj.id || adj._id} adj={adj} />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StockAdjustments;
