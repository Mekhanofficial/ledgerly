import React, { useState, useEffect } from 'react';
import { Package, Plus, Filter, Download, Search, Edit, Trash2, MoreVertical, Eye, AlertCircle, CheckCircle, X, ChevronDown } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';

const Products = () => {
  const { isDarkMode } = useTheme();
  const { products, categories, suppliers, deleteProduct } = useInventory();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(null);

  // Calculate product statistics
  const calculateProductStats = () => {
    let filteredProducts = [...products];

    // Filter by search term
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (filter !== 'all') {
      filteredProducts = filteredProducts.filter(product => {
        const stock = product.stock || product.quantity || 0;
        switch (filter) {
          case 'in-stock':
            return stock > 10;
          case 'low-stock':
            return stock > 0 && stock <= 10;
          case 'out-of-stock':
            return stock === 0;
          default:
            return true;
        }
      });
    }

    return filteredProducts;
  };

  const filteredProducts = calculateProductStats();

  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const getStatusBadge = (product) => {
    const stock = product.stock || product.quantity || 0;
    
    if (stock === 0) {
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
    
    if (stock <= (product.reorderLevel || 10)) {
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

  const calculateTotalValue = () => {
    return filteredProducts.reduce((total, product) => {
      const stock = product.stock || product.quantity || 0;
      const price = product.price || 0;
      return total + (stock * price);
    }, 0);
  };

  const calculateLowStockCount = () => {
    return filteredProducts.filter(product => {
      const stock = product.stock || product.quantity || 0;
      return stock > 0 && stock <= (product.reorderLevel || 10);
    }).length;
  };

  const handleDeleteClick = (product, e) => {
    e.stopPropagation();
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      const success = await deleteProduct(productToDelete.id);
      if (success) {
        addToast(`Product "${productToDelete.name}" deleted successfully`, 'success');
      }
    }
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length > 0) {
      setProductToDelete({ name: `${selectedProducts.length} products` });
      setShowDeleteModal(true);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedProducts.length > 0) {
      let successCount = 0;
      for (const productId of selectedProducts) {
        const success = await deleteProduct(productId);
        if (success) successCount++;
      }
      
      addToast(`${successCount} product(s) deleted successfully`, 'success');
      setSelectedProducts([]);
    }
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const toggleActionsMenu = (productId, e) => {
    e.stopPropagation();
    setShowMobileActions(showMobileActions === productId ? null : productId);
  };

  const handleViewProduct = (productId) => {
    navigate(`/inventory/products/view/${productId}`);
  };

  const handleEditProduct = (productId) => {
    navigate(`/inventory/products/edit/${productId}`);
  };

  // Mobile product card component
  const MobileProductCard = ({ product }) => {
    const stock = product.stock || product.quantity || 0;
    const totalValue = stock * (product.price || 0);
    const isActionsOpen = showMobileActions === product.id;

    return (
      <div className={`p-4 border rounded-lg mb-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center flex-1 min-w-0">
            <input
              type="checkbox"
              checked={selectedProducts.includes(product.id)}
              onChange={() => handleSelectProduct(product.id)}
              className={`h-4 w-4 text-primary-600 focus:ring-primary-500 rounded flex-shrink-0 ${
                isDarkMode ? 'border-gray-600' : 'border-gray-300'
              }`}
            />
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ml-3 flex-shrink-0 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <Package className={`w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              )}
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <div className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {product.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                SKU: {product.sku}
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={(e) => toggleActionsMenu(product.id, e)}
              className={`p-1.5 rounded-lg ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {isActionsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMobileActions(null)}
                />
                <div className={`absolute right-0 mt-1 w-48 rounded-lg shadow-lg py-1 z-20 ${
                  isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <button
                    onClick={() => handleViewProduct(product.id)}
                    className={`w-full px-4 py-2 text-sm text-left flex items-center ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleEditProduct(product.id)}
                    className={`w-full px-4 py-2 text-sm text-left flex items-center ${
                      isDarkMode 
                        ? 'text-blue-400 hover:bg-gray-700' 
                        : 'text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Product
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(product, e)}
                    className={`w-full px-4 py-2 text-sm text-left flex items-center ${
                      isDarkMode 
                        ? 'text-red-400 hover:bg-gray-700' 
                        : 'text-red-600 hover:bg-gray-100'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Product
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</div>
            <div className="text-sm truncate">{getCategoryName(product.categoryId)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stock</div>
            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stock}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unit Price</div>
            <div className="text-sm font-medium">
              ${(product.price || 0).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Value</div>
            <div className="text-sm font-bold">
              ${totalValue.toFixed(2)}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3">
          <div>
            {getStatusBadge(product)}
          </div>
          <button
            onClick={() => handleEditProduct(product.id)}
            className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
          >
            Edit
          </button>
        </div>
      </div>
    );
  };

  // Get active filter label for mobile
  const getActiveFilterLabel = () => {
    const filters = {
      'all': 'All Products',
      'in-stock': 'In Stock',
      'low-stock': 'Low Stock',
      'out-of-stock': 'Out of Stock'
    };
    return filters[filter] || 'All Products';
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
              Products
            </h1>
            <p className={`mt-1 text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage your product inventory
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
              <Package className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Inventory</span>
              <span className="sm:hidden">Inventory</span>
            </Link>
            <Link
              to="/inventory/products/new"
              className="flex items-center px-3 py-2 md:px-4 md:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm md:text-base whitespace-nowrap"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedProducts.length > 0 && (
          <div className={`border rounded-lg p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-800' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center">
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedProducts.length} product(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="flex items-center px-3 py-1.5 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className={`border rounded-lg p-3 md:p-4 ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-800' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className={`text-xs md:text-sm truncate ${
                  isDarkMode ? 'text-blue-300' : 'text-gray-600'
                }`}>
                  Total Products
                </p>
                <p className={`text-lg md:text-xl font-bold mt-1 truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {filteredProducts.length}
                </p>
              </div>
              <Package className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </div>
          <div className={`border rounded-lg p-3 md:p-4 ${
            isDarkMode 
              ? 'bg-amber-900/20 border-amber-800' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className={`text-xs md:text-sm truncate ${
                  isDarkMode ? 'text-amber-300' : 'text-gray-600'
                }`}>
                  Low Stock Items
                </p>
                <p className={`text-lg md:text-xl font-bold mt-1 truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {calculateLowStockCount()}
                </p>
              </div>
              <AlertCircle className={`w-8 h-8 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
          </div>
          <div className={`border rounded-lg p-3 md:p-4 ${
            isDarkMode 
              ? 'bg-emerald-900/20 border-emerald-800' 
              : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className={`text-xs md:text-sm truncate ${
                  isDarkMode ? 'text-emerald-300' : 'text-gray-600'
                }`}>
                  Total Value
                </p>
                <p className={`text-lg md:text-xl font-bold mt-1 truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  ${calculateTotalValue().toFixed(2)}
                </p>
              </div>
              <Package className={`w-8 h-8 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
          </div>
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
                placeholder="Search products..."
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
                  {getActiveFilterLabel()}
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
                </button>
                
                <div className="hidden lg:flex flex-wrap gap-2">
                  {['all', 'in-stock', 'low-stock', 'out-of-stock'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize whitespace-nowrap ${
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
                {['all', 'in-stock', 'low-stock', 'out-of-stock'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilter(status);
                      setShowMobileFilters(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
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
            </div>
          )}
        </div>

        {/* Count Display */}
        <div className={`text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Showing {filteredProducts.length} of {products.length} products
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
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                      onChange={handleSelectAll}
                      className={`w-4 h-4 rounded border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-primary-400' 
                          : 'border-gray-300 text-primary-600'
                      }`}
                    />
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Product
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    SKU
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Category
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Stock
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Unit Price
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Total Value
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 md:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>{products.length === 0 ? 'No products added yet' : 'No products match your search'}</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const stock = product.stock || product.quantity || 0;
                    const totalValue = stock * (product.price || 0);
                    
                    return (
                      <tr 
                        key={product.id} 
                        className={`
                          ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                          ${selectedProducts.includes(product.id) ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''}
                        `}
                      >
                        <td className="px-4 md:px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className={`w-4 h-4 rounded border ${
                              isDarkMode 
                                ? 'bg-gray-600 border-gray-500 text-primary-400' 
                                : 'border-gray-300 text-primary-600'
                            }`}
                          />
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${
                              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="h-full w-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className={`w-5 h-5 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className={`font-medium truncate ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {product.name}
                              </div>
                              {product.description && (
                                <div className={`text-xs mt-0.5 truncate ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className={`text-sm font-mono truncate max-w-xs ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-900'
                          }`}>
                            {product.sku}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            isDarkMode 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getCategoryName(product.categoryId)}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {stock}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            ${(product.price || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className={`font-bold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            ${totalValue.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          {getStatusBadge(product)}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center space-x-1 md:space-x-2">
                            <button
                              onClick={() => handleEditProduct(product.id)}
                              className={`p-1.5 rounded ${
                                isDarkMode 
                                  ? 'text-blue-400 hover:bg-blue-900/20' 
                                  : 'text-blue-600 hover:bg-blue-50'
                              }`}
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(product, e)}
                              className={`p-1.5 rounded ${
                                isDarkMode 
                                  ? 'text-red-400 hover:bg-red-900/20' 
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
          {filteredProducts.length === 0 ? (
            <div className={`border rounded-lg p-8 text-center ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {products.length === 0 ? 'No products added yet' : 'No products match your search'}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <MobileProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowDeleteModal(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`rounded-xl w-full max-w-md ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`p-4 md:p-6 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Delete Product
                  </h3>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-4 md:p-6">
                <p className={`mb-6 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Are you sure you want to delete {productToDelete.name}? 
                  {selectedProducts.length > 1 && ' This will delete all selected products.'}
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setProductToDelete(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={selectedProducts.length > 0 ? handleConfirmBulkDelete : handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Products;