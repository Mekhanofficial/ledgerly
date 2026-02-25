// src/components/receipts/ProductGrid.js - FIXED VERSION (Vertical Layout)
import React, { useState, useEffect, useMemo } from 'react';
import { Package, Search, Filter, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useAccount } from '../../context/AccountContext';
import { mapProductFromApi } from '../../utils/productAdapter';
import { fetchProducts } from '../../store/slices/productSlide';
import { formatCurrency } from '../../utils/currency';

const ProductGrid = ({ onAddToCart, cartItems = [] }) => {
  const { isDarkMode } = useTheme();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  const formatMoney = (value, currencyCode) => formatCurrency(value, currencyCode || baseCurrency);
  const dispatch = useDispatch();
  const { products: rawProducts } = useSelector((state) => state.products);
  const posProducts = useMemo(() => {
    return rawProducts.map((product) => {
      const mapped = mapProductFromApi(product);
      return {
        ...mapped,
        category: mapped.categoryName || 'Uncategorized'
      };
    });
  }, [rawProducts]);
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Load products from inventory
  useEffect(() => {
    if (!rawProducts.length) {
      dispatch(fetchProducts({ isActive: true }));
    }
    setProducts(posProducts);
    setFilteredProducts(posProducts);
  }, [dispatch, posProducts, rawProducts.length]);

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

  const getStockStatus = (stock, reorderLevel = 10) => {
    if (stock === 0) return { 
      label: 'Out of Stock', 
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    if (stock <= reorderLevel) return { 
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
  )];

  const cartUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = products.filter((p) => {
    const stock = p.stock || p.quantity || 0;
    const reorderLevel = p.reorderLevel || 10;
    return stock > 0 && stock <= reorderLevel;
  }).length;
  const outOfStockCount = products.filter((p) => (p.stock || p.quantity || 0) === 0).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className={`rounded-2xl border p-4 ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Product Catalog
            </h3>
            <p className={`mt-1 text-xs sm:text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'} from {products.length} inventory items
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Cart Units', value: cartUnits },
              { label: 'Low Stock', value: lowStockCount },
              { label: 'Categories', value: Math.max(0, productCategories.length - 1) }
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-xl border px-3 py-2 ${
                  isDarkMode ? 'border-gray-600 bg-gray-900/60' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`text-[11px] uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {stat.label}
                </div>
                <div className={`text-sm font-semibold stat-value-safe ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product, SKU, or category"
              className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div>
            <label className={`mb-1 flex items-center gap-1 text-xs font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Filter className="h-3.5 w-3.5" />
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm ${
                isDarkMode ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="all">All Categories</option>
              {productCategories
                .filter((cat) => cat !== 'all')
                .map((category) => (
                  <option key={category} value={category}>
                    {typeof category === 'object' ? category.name : category}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className={`mb-1 block text-xs font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Sort
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm ${
                isDarkMode ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock">Stock: High to Low</option>
            </select>
          </div>
        </div>

        {productCategories.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {productCategories.map((category) => {
              const value = category === 'all' ? 'all' : category;
              const label = category === 'all' ? 'All' : String(category);
              const active = selectedCategory === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedCategory(value)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'bg-primary-600 text-white'
                      : isDarkMode
                        ? 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Catalog */}
      <div>
        {filteredProducts.length === 0 ? (
          <div className={`rounded-2xl border border-dashed p-8 text-center ${
            isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-300 bg-white'
          }`}>
            <Package className={`mx-auto mb-3 h-10 w-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {products.length === 0 ? 'No products available' : 'No products match your filters'}
            </h3>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {products.length === 0
                ? 'Add products to inventory to start generating receipts.'
                : 'Adjust your search term, category, or sort order.'}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => { window.location.href = '/inventory/products/new'; }}
                className="mt-4 inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <Package className="mr-2 h-4 w-4" />
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredProducts.map((product) => {
              const stock = product.stock || product.quantity || 0;
              const cartQuantity = getCartQuantity(product.id);
              const stockStatus = getStockStatus(stock, product.reorderLevel || 10);
              const categoryName = product.category || 'Uncategorized';
              const isOutOfStock = stock === 0;
              const stockAccent = isOutOfStock
                ? 'from-red-500/15 to-transparent'
                : stock <= (product.reorderLevel || 10)
                  ? 'from-amber-500/15 to-transparent'
                  : 'from-emerald-500/15 to-transparent';

              return (
                <article
                  key={product.id}
                  className={`group relative overflow-hidden rounded-2xl border transition-all ${
                    isDarkMode
                      ? 'border-gray-700 bg-gray-800 hover:border-gray-500'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  } ${isOutOfStock ? 'opacity-85' : ''}`}
                >
                  <div className={`pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${stockAccent}`} />

                  <div className="relative p-4">
                    <div className="flex gap-3">
                      <div className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border ${
                        isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
                      }`}>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className={`h-7 w-7 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className={`truncate text-sm font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {product.name}
                            </h3>
                            <p className={`mt-0.5 truncate text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {categoryName}
                            </p>
                          </div>
                          <span className={`rounded-lg px-2 py-1 text-[11px] font-medium ${
                            isDarkMode ? 'bg-gray-900 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {product.sku || 'SKU'}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Stock: {stock}
                          </span>
                          {cartQuantity > 0 && (
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isDarkMode ? 'bg-primary-900/40 text-primary-300' : 'bg-primary-100 text-primary-700'
                            }`}>
                              In cart: {cartQuantity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`mt-4 flex items-center justify-between border-t pt-4 ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <div>
                        <div className={`text-[11px] uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Unit Price
                        </div>
                        <div className={`text-base font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatMoney(product.price || 0, baseCurrency)}
                        </div>
                      </div>

                      <button
                        onClick={() => !isOutOfStock && onAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium transition ${
                          isOutOfStock
                            ? 'cursor-not-allowed bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {isOutOfStock ? (
                          <>
                            <AlertCircle className="mr-1.5 h-4 w-4" />
                            Out of stock
                          </>
                        ) : (
                          <>
                            <Package className="mr-1.5 h-4 w-4" />
                            {cartQuantity > 0 ? `Add More (${cartQuantity})` : 'Add to Cart'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {products.length > 0 && (
        <div className={`rounded-2xl border p-4 ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-900/60' : 'bg-gray-50'}`}>
              <div className={`text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Total Items</div>
              <div className={`mt-1 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{products.length}</div>
            </div>
            <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-900/60' : 'bg-gray-50'}`}>
              <div className={`text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Visible</div>
              <div className={`mt-1 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{filteredProducts.length}</div>
            </div>
            <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-900/60' : 'bg-gray-50'}`}>
              <div className={`text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Low Stock</div>
              <div className={`mt-1 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{lowStockCount}</div>
            </div>
            <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-900/60' : 'bg-gray-50'}`}>
              <div className={`text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Out of Stock</div>
              <div className={`mt-1 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{outOfStockCount}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
