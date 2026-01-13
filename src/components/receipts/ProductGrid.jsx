// src/components/receipts/ProductGrid.js - FIXED VERSION (Vertical Layout)
import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useInventory } from '../../context/InventoryContext';

const ProductGrid = ({ onAddToCart, cartItems = [] }) => {
  const { isDarkMode } = useTheme();
  const { getProductsForPOS, categories } = useInventory();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Load products from inventory
  useEffect(() => {
    const loadedProducts = getProductsForPOS();
    setProducts(loadedProducts);
    setFilteredProducts(loadedProducts);
  }, [getProductsForPOS]);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Sort products
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'stock':
          return b.stock - a.stock;
        default:
          return 0;
      }
    });

    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, sortBy, products]);

  const getCartQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { 
      label: 'Out of Stock', 
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    if (stock <= 10) return { 
      label: 'Low Stock', 
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    };
    return { 
      label: 'In Stock', 
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    };
  };

  // Get unique categories from products
  const productCategories = ['all', ...new Set(products
    .map(p => p.category)
    .filter(Boolean)
    .filter(category => categories.some(c => c.id === category || c.name === category))
  )];

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Search and Filters - Optimized for Mobile */}
      <div className={`border rounded-xl p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* Search */}
        <div className="relative mb-3">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'border-gray-300 placeholder-gray-500'
            }`}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Category Filter */}
          <div className="flex-1 min-w-[120px]">
            <div className="flex items-center mb-1">
              <Filter className={`w-3 h-3 mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Category
              </label>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full px-2 py-1.5 rounded-lg border text-xs ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300'
              }`}
            >
              <option value="all">All Categories</option>
              {productCategories
                .filter(cat => cat !== 'all')
                .map(category => (
                  <option key={category} value={category}>
                    {typeof category === 'object' ? category.name : category}
                  </option>
                ))
              }
            </select>
          </div>

          {/* Sort */}
          <div className="flex-1 min-w-[120px]">
            <div className="flex items-center mb-1">
              <label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Sort by
              </label>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full px-2 py-1.5 rounded-lg border text-xs ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300'
              }`}
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock">Stock: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid - VERTICAL LIST */}
      <div className="flex-1 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className={`border rounded-xl p-6 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <Package className={`w-10 h-10 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {products.length === 0 ? 'No Products Available' : 'No Products Found'}
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {products.length === 0 
                ? 'Add products to inventory to start selling.' 
                : 'Try a different search term or category.'}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => window.location.href = '/inventory/products/new'}
                className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-xs mt-3"
              >
                <Package className="w-3 h-3 mr-1.5" />
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 pr-1">
            {filteredProducts.map((product) => {
              const cartQuantity = getCartQuantity(product.id);
              const stockStatus = getStockStatus(product.stock || product.quantity || 0);
              const categoryObj = categories.find(c => c.id === product.categoryId || c.name === product.category);
              const categoryName = categoryObj?.name || product.category || 'Uncategorized';
              const isOutOfStock = (product.stock || product.quantity || 0) === 0;
              
              return (
                <div
                  key={product.id}
                  className={`border rounded-lg overflow-hidden transition-all ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 hover:border-primary-500' 
                      : 'bg-white border-gray-200 hover:border-primary-300'
                  } ${isOutOfStock ? 'opacity-75' : ''}`}
                >
                  <div className="flex">
                    {/* Product Image/Icon - Fixed width for mobile */}
                    <div className={`w-16 sm:w-20 flex-shrink-0 flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className={`w-8 h-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 p-3">
                      {/* Header with Name and SKU */}
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {product.name}
                          </h3>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {categoryName}
                          </p>
                        </div>
                        <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 whitespace-nowrap flex-shrink-0">
                          {product.sku}
                        </span>
                      </div>

                      {/* Price and Stock Status */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-baseline">
                          <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </div>

                      {/* Stock and Cart Info */}
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Stock: {product.stock || product.quantity || 0}
                        </span>
                        {cartQuantity > 0 && (
                          <span className={`font-medium ${isDarkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                            In cart: {cartQuantity}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => !isOutOfStock && onAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`w-full py-1.5 px-3 rounded-lg font-medium transition-colors flex items-center justify-center text-sm ${
                          isOutOfStock
                            ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {isOutOfStock ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                            Out of Stock
                          </>
                        ) : cartQuantity > 0 ? (
                          <>
                            <Package className="w-3.5 h-3.5 mr-1.5" />
                            Add More ({cartQuantity})
                          </>
                        ) : (
                          <>
                            <Package className="w-3.5 h-3.5 mr-1.5" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Statistics - Optimized for Mobile */}
      {products.length > 0 && (
        <div className={`border rounded-xl p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center">
              <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {products.length}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total
              </div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {products.filter(p => (p.stock || p.quantity || 0) <= 10 && (p.stock || p.quantity || 0) > 0).length}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Low Stock
              </div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {products.filter(p => (p.stock || p.quantity || 0) === 0).length}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Out of Stock
              </div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {productCategories.length - 1}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Categories
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;