// src/routes/inventory/Inventory.js
import React, { useState, useEffect, useMemo } from 'react';
import { Package, ArrowRight, TrendingUp, BarChart, AlertCircle, Layers, Users, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';
import { useAccount } from '../../context/AccountContext';
import { fetchProducts } from '../../store/slices/productSlide';
import { mapProductFromApi } from '../../utils/productAdapter';
import { getAdjustmentDate, getAdjustmentTimestamp } from '../../utils/adjustmentDate';

const Inventory = () => {
  const { isDarkMode } = useTheme();
  const { suppliers, categories } = useInventory();
  const dispatch = useDispatch();
  const { products: rawProducts, loading: productsLoading, stockAdjustments } = useSelector((state) => state.products);
  const { accountInfo } = useAccount();
  const products = useMemo(
    () => rawProducts.map((product) => mapProductFromApi(product)),
    [rawProducts]
  );
  const { addToast } = useToast();
  const currencyCode = (accountInfo?.currency || 'USD').toUpperCase();
  const formatCurrency = (amount) => {
    const value = Number.isFinite(amount) ? amount : 0;
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    } catch (error) {
      return `${currencyCode} ${value.toFixed(2)}`;
    }
  };
  
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts({ isActive: true }));
  }, [dispatch]);

  useEffect(() => {
    try {
      const sortedAdjustments = [...stockAdjustments]
        .sort((a, b) => getAdjustmentTimestamp(b) - getAdjustmentTimestamp(a))
        .slice(0, 5);

      const activity = sortedAdjustments.map((adj) => {
        const adjustmentDate = getAdjustmentDate(adj);
        const timeAgo = calculateTimeAgo(adjustmentDate);
        const product = products.find((p) => p.id === adj.productId);
        return {
          id: adj.id,
          action: getActionText(adj, product),
          quantity: adj.quantity > 0 ? `+${adj.quantity}` : adj.quantity.toString(),
          time: timeAgo,
          user: adj.user || 'System',
          details: adj.reason || adj.type,
          productName: product?.name || 'Unknown Product'
        };
      });

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading inventory data:', error);
      addToast('Error loading inventory data', 'error');
    }
  }, [stockAdjustments, products, addToast]);

  const calculateTimeAgo = (dateString) => {
    const date = dateString instanceof Date ? dateString : (dateString ? new Date(dateString) : null);
    if (!date || Number.isNaN(date.getTime())) {
      return 'Unknown date';
    }
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getActionText = (adjustment, product) => {
    const productName = product?.name || 'Product';
    switch (adjustment.type) {
      case 'Restock':
        return `Restocked ${productName}`;
      case 'Sale':
        return `Sold ${productName}`;
      case 'Return':
        return `Returned ${productName}`;
      case 'Damage':
        return `Damaged ${productName}`;
      case 'Adjustment':
        return `Adjusted ${productName} stock`;
      default:
        return `${adjustment.type}: ${productName}`;
    }
  };

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.stock || 0) * (product.price || 0), 0);
    const lowStockCount = products.filter((product) => {
      const stock = product.stock || 0;
      const reorderLevel = product.reorderLevel || 10;
      return stock > 0 && stock <= reorderLevel;
    }).length;
    const outOfStockCount = products.filter((product) => (product.stock || 0) === 0).length;
    const inStockCount = products.filter((product) => {
      const stock = product.stock || 0;
      const reorderLevel = product.reorderLevel || 10;
      return stock > reorderLevel;
    }).length;

    return {
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount,
      inStockCount
    };
  }, [products]);

  const quickStats = [
    {
      label: 'Total Products',
      value: stats?.totalProducts || 0,
      change: '+0%', // You can calculate this from historical data
      icon: Package,
      color: 'bg-blue-500',
      to: '/inventory/products'
    },
    {
      label: 'Total Value',
      value: formatCurrency(stats?.totalValue || 0),
      change: '+0%',
      icon: TrendingUp,
      color: 'bg-emerald-500',
      to: '/inventory'
    },
    {
      label: 'Low Stock Items',
      value: stats?.lowStockCount || 0,
      change: stats?.lowStockCount > 0 ? 'Needs attention' : 'All good',
      icon: AlertCircle,
      color: 'bg-amber-500',
      to: '/inventory/products?filter=low-stock'
    },
    {
      label: 'Categories',
      value: categories.length || 0,
      change: '+0',
      icon: Layers,
      color: 'bg-violet-500',
      to: '/inventory/categories'
    }
  ];

  const handleRefresh = () => {
    dispatch(fetchProducts({ isActive: true }))
      .unwrap()
      .then(() => {
        addToast('Inventory data refreshed', 'success');
      })
      .catch(() => {
        addToast('Failed to refresh inventory data', 'error');
      });
  };

  if (productsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Inventory Dashboard
            </h1>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Overview of your inventory management
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              className={`flex items-center px-4 py-2 border rounded-lg ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <Link
              to="/inventory/products"
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Manage Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                to={stat.to}
                className={`border rounded-xl p-5 hover:shadow-lg transition-shadow cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:border-primary-500' 
                    : 'bg-white border-gray-200 hover:border-primary-300'
                }`}
              >
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
                    <p className={`text-sm mt-2 ${
                      stat.change.includes('+') || stat.change === 'All good'
                        ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        : isDarkMode ? 'text-amber-400' : 'text-amber-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/inventory/products"
            className={`border rounded-xl p-6 hover:shadow-lg transition-shadow ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-primary-500' 
                : 'bg-white border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <Package className={`w-6 h-6 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Products
                </h3>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {products.length} products
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/inventory/categories"
            className={`border rounded-xl p-6 hover:shadow-lg transition-shadow ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-primary-500' 
                : 'bg-white border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-100'
              }`}>
                <Layers className={`w-6 h-6 ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Categories
                </h3>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {categories.length} categories
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/inventory/stock-adjustments"
            className={`border rounded-xl p-6 hover:shadow-lg transition-shadow ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-primary-500' 
                : 'bg-white border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'
              }`}>
                <BarChart className={`w-6 h-6 ${
                  isDarkMode ? 'text-amber-400' : 'text-amber-600'
                }`} />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Stock Adjustments
                </h3>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stockAdjustments.length} adjustments
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/inventory/suppliers"
            className={`border rounded-xl p-6 hover:shadow-lg transition-shadow ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-primary-500' 
                : 'bg-white border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                isDarkMode ? 'bg-violet-900/30' : 'bg-violet-100'
              }`}>
                <Users className={`w-6 h-6 ${
                  isDarkMode ? 'text-violet-400' : 'text-violet-600'
                }`} />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Suppliers
                </h3>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {suppliers.length} suppliers
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className={`border rounded-xl p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Recent Inventory Activity
            </h3>
            <Link
              to="/inventory/stock-adjustments"
              className={`text-sm ${
                isDarkMode ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'
              }`}
            >
              View All
            </Link>
          </div>
          
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <BarChart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No recent inventory activity
              </p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Add products or make stock adjustments to see activity here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className={`flex items-center justify-between py-3 border-b last:border-0 ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {activity.action}
                    </p>
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {activity.details && <span className="mr-2">{activity.details}</span>}
                      {activity.quantity && (
                        <span className={`font-medium ${
                          activity.quantity.startsWith('+') 
                            ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                            : isDarkMode ? 'text-red-400' : 'text-red-600'
                        }`}>
                          {activity.quantity}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {activity.time}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      by {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Summary */}
        <div className={`border rounded-xl p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Inventory Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
            }`}>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                  isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}>
                  <Package className={`w-5 h-5 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <div className={`text-lg font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stats?.inStockCount || 0}
                  </div>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    In Stock Products
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50'
            }`}>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                  isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'
                }`}>
                  <AlertCircle className={`w-5 h-5 ${
                    isDarkMode ? 'text-amber-400' : 'text-amber-600'
                  }`} />
                </div>
                <div>
                  <div className={`text-lg font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stats?.lowStockCount || 0}
                  </div>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Low Stock Items
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
            }`}>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                  isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
                }`}>
                  <Package className={`w-5 h-5 ${
                    isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <div className={`text-lg font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stats?.outOfStockCount || 0}
                  </div>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Out of Stock
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
