// src/components/receipts/ProductGrid.js
import React, { useState } from 'react';
import { Search, Barcode, ShoppingCart, Filter, Grid, List, Smartphone, Home, Book, Shirt, Package as PackageIcon, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ProductGrid = ({ onAddToCart, cartItems = [] }) => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [selectedBrand, setSelectedBrand] = useState('all');

  const categories = [
    { id: 'all', name: 'All Products', count: 24, icon: PackageIcon },
    { id: 'electronics', name: 'Electronics', count: 8, icon: Smartphone },
    { id: 'clothing', name: 'Clothing', count: 6, icon: Shirt },
    { id: 'home', name: 'Home & Garden', count: 7, icon: Home },
    { id: 'books', name: 'Books', count: 3, icon: Book },
  ];

  const brands = ['All', 'AudioPro', 'Stationary Co.', 'HydroLife', 'TechWorks', 'LightWorks', 'Artisan Goods', 'Denim & Co', 'SmartReads'];

  const productsData = [
    {
      id: 'SUL WH-001',
      name: 'Wireless Headphones',
      price: 79.99,
      category: 'electronics',
      brand: 'AudioPro',
      inStock: 24,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      description: 'Noise-cancelling over-ear headphones with Bluetooth 5.0',
      sku: 'ELEC-001',
      color: 'Black',
      weight: '0.5kg'
    },
    {
      id: 'SUL UH-002',
      name: 'Leather Notebook',
      price: 24.99,
      category: 'home',
      brand: 'Stationary Co.',
      inStock: 15,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
      description: 'Genuine leather cover with 200 premium paper pages',
      sku: 'OFF-002',
      color: 'Brown',
      weight: '0.3kg'
    },
    {
      id: 'SUL SWB-003',
      name: 'Steel Water Bottle',
      price: 19.99,
      category: 'home',
      brand: 'HydroLife',
      inStock: 32,
      image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop',
      description: 'Insulated stainless steel bottle, 750ml capacity',
      sku: 'HOM-003',
      color: 'Silver',
      weight: '0.4kg'
    },
    {
      id: 'SUL WM-004',
      name: 'Wireless Mouse',
      price: 34.99,
      category: 'electronics',
      brand: 'TechWorks',
      inStock: 18,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',
      description: 'Ergonomic wireless mouse with Bluetooth and USB receiver',
      sku: 'ELEC-004',
      color: 'Black',
      weight: '0.2kg'
    },
    {
      id: 'SUL DL-005',
      name: 'LED Desk Lamp',
      price: 49.99,
      category: 'electronics',
      brand: 'LightWorks',
      inStock: 12,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
      description: 'Adjustable desk lamp with USB charging ports, 3 color temperatures',
      sku: 'ELEC-005',
      color: 'White',
      weight: '1.2kg'
    },
    {
      id: 'SUL CM-006',
      name: 'Ceramic Mug',
      price: 12.99,
      category: 'home',
      brand: 'Artisan Goods',
      inStock: 45,
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=300&fit=crop',
      description: 'Handcrafted ceramic coffee mug, dishwasher safe',
      sku: 'HOM-006',
      color: 'White',
      weight: '0.3kg'
    },
    {
      id: 'SUL JP-007',
      name: 'Denim Jacket',
      price: 89.99,
      category: 'clothing',
      brand: 'Denim & Co',
      inStock: 8,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
      description: 'Classic denim jacket, medium wash, available in sizes S-XXL',
      sku: 'CLO-007',
      color: 'Blue',
      weight: '0.8kg'
    },
    {
      id: 'SUL BR-008',
      name: 'Business Book',
      price: 29.99,
      category: 'books',
      brand: 'SmartReads',
      inStock: 25,
      image: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=400&h=300&fit=crop',
      description: 'Best-selling business strategy book, 300 pages',
      sku: 'BOK-008',
      color: 'Multiple',
      weight: '0.5kg'
    },
    {
      id: 'SUL KB-009',
      name: 'Mechanical Keyboard',
      price: 129.99,
      category: 'electronics',
      brand: 'TechWorks',
      inStock: 6,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
      description: 'RGB mechanical keyboard with customizable keys',
      sku: 'ELEC-009',
      color: 'Black',
      weight: '1.1kg'
    },
    {
      id: 'SUL BP-010',
      name: 'Backpack',
      price: 59.99,
      category: 'home',
      brand: 'HydroLife',
      inStock: 20,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
      description: 'Water-resistant backpack with laptop compartment',
      sku: 'HOM-010',
      color: 'Gray',
      weight: '0.7kg'
    },
    {
      id: 'SUL WT-011',
      name: 'Smart Watch',
      price: 199.99,
      category: 'electronics',
      brand: 'AudioPro',
      inStock: 10,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      description: 'Fitness tracker with heart rate monitor and GPS',
      sku: 'ELEC-011',
      color: 'Black',
      weight: '0.1kg'
    },
    {
      id: 'SUL PL-012',
      name: 'Indoor Plant',
      price: 34.99,
      category: 'home',
      brand: 'Artisan Goods',
      inStock: 28,
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop',
      description: 'Low maintenance indoor plant in ceramic pot',
      sku: 'HOM-012',
      color: 'Green',
      weight: '2.5kg'
    }
  ];

  // Check if product is in cart and get quantity
  const getItemQuantity = (productId) => {
    const itemInCart = cartItems.find(item => item.id === productId);
    return itemInCart ? itemInCart.quantity : 0;
  };

  const getStockColor = (stock) => {
    if (stock > 20) return isDarkMode ? 'text-emerald-400 bg-emerald-900/20' : 'text-emerald-600 bg-emerald-50';
    if (stock > 10) return isDarkMode ? 'text-amber-400 bg-amber-900/20' : 'text-amber-600 bg-amber-50';
    return isDarkMode ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50';
  };

  const getStockText = (stock) => {
    if (stock > 20) return 'In Stock';
    if (stock > 10) return 'Low Stock';
    return 'Last Few';
  };

  const filteredProducts = productsData
    .filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
      
      return matchesSearch && matchesCategory && matchesBrand;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        case 'stock': return b.inStock - a.inStock;
        default: return 0;
      }
    });

  const clearFilters = () => {
    setSearchTerm('');
    setActiveCategory('all');
    setSelectedBrand('all');
    setSortBy('name');
  };

  const getFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (activeCategory !== 'all') count++;
    if (selectedBrand !== 'all') count++;
    if (sortBy !== 'name') count++;
    return count;
  };

  const handleAddToCartWithFeedback = (product) => {
    onAddToCart(product);
    // Visual feedback could be added here
  };

  return (
    <div className={`rounded-xl border ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header with Search and Controls */}
      <div className={`p-6 border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name, SKU, brand, or description..."
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'border-gray-300'
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          {/* </button> */}
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-3">
            <div className={`hidden md:flex items-center space-x-2 p-1 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? isDarkMode ? 'bg-gray-600 shadow-sm' : 'bg-white shadow-sm'
                    : isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
                title="Grid View"
              >
                <Grid className={`w-4 h-4 ${
                  viewMode === 'grid' 
                    ? 'text-primary-600' 
                    : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? isDarkMode ? 'bg-gray-600 shadow-sm' : 'bg-white shadow-sm'
                    : isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
                title="List View"
              >
                <List className={`w-4 h-4 ${
                  viewMode === 'list' 
                    ? 'text-primary-600' 
                    : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`} />
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300'
              }`}
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock">Stock: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-4">
          {/* Active Filters Bar */}
          {getFilterCount() > 0 && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Filter className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Active filters ({getFilterCount()})
                </span>
              </div>
              <button
                onClick={clearFilters}
                className={`text-sm px-3 py-1 rounded ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-primary-600 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {cat.name}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeCategory === cat.id
                      ? 'bg-white/30'
                      : isDarkMode
                        ? 'bg-gray-600 text-gray-300'
                        : 'bg-gray-300 text-gray-700'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Brand Filters */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2">
            <span className={`text-sm font-medium whitespace-nowrap ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Brand:
            </span>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedBrand === brand
                    ? 'bg-primary-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Display */}
      <div className="p-6">
        {/* Results Info */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between mb-6 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <div>
            Showing <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {filteredProducts.length}
            </span> of{' '}
            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {productsData.length}
            </span> products
            {searchTerm && (
              <span className="ml-2">
                for "<span className="font-medium">{searchTerm}</span>"
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Items in cart: <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {cartItems.length}
              </span>
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Products per page: 
              <select className={`ml-2 px-2 py-1 border rounded text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300'
              }`}>
                <option>12</option>
                <option>24</option>
                <option>48</option>
                <option>All</option>
              </select>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <Search className={`w-8 h-8 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              No products found
            </h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={clearFilters}
              className={`mt-4 px-4 py-2 rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const inCartQuantity = getItemQuantity(product.id);
              return (
                <div 
                  key={product.id}
                  className={`group border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 hover:shadow-gray-900/50' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Product Image */}
                  <div className={`relative h-48 overflow-hidden ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400x300/${isDarkMode ? '374151' : 'f3f4f6'}/${
                          isDarkMode ? '9ca3af' : '6b7280'
                        }?text=${encodeURIComponent(product.name)}`;
                      }}
                    />
                    {/* Stock Badge */}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStockColor(product.inStock)}`}>
                      {getStockText(product.inStock)}
                    </div>
                    {/* In Cart Badge */}
                    {inCartQuantity > 0 && (
                      <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                        isDarkMode 
                          ? 'bg-green-900/80 text-green-300 backdrop-blur-sm' 
                          : 'bg-green-100 text-green-800 backdrop-blur-sm'
                      }`}>
                        {inCartQuantity} in cart
                      </div>
                    )}
                    {/* Category Badge */}
                    <div className={`absolute bottom-3 left-3 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm ${
                      isDarkMode 
                        ? 'bg-gray-800/90 text-gray-300' 
                        : 'bg-white/90 text-gray-700'
                    }`}>
                      {product.category.toUpperCase()}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <div className="mb-3">
                      <div className="flex items-start justify-between">
                        <h3 className={`font-semibold line-clamp-1 flex-1 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {product.name}
                        </h3>
                        <span className={`text-xs ml-2 px-2 py-1 rounded ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {product.inStock} left
                        </span>
                      </div>
                      <div className="flex items-center mt-2">
                        <p className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {product.sku} • {product.brand}
                        </p>
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-4 line-clamp-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className={`text-2xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${product.price.toFixed(2)}
                        </span>
                        <div className={`text-xs mt-1 flex items-center ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <span className="mr-2">Color: {product.color}</span>
                          <span>Weight: {product.weight}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleAddToCartWithFeedback(product)}
                        className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors min-w-[100px] ${
                          inCartQuantity > 0
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        } group/btn`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                        {inCartQuantity > 0 ? 'Add More' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const inCartQuantity = getItemQuantity(product.id);
              return (
                <div 
                  key={product.id}
                  className={`flex items-center border rounded-xl p-4 transition-colors group ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {/* Product Image */}
                  <div className={`relative w-20 h-20 flex-shrink-0 mr-4 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/100x100/${isDarkMode ? '374151' : 'f3f4f6'}/${
                          isDarkMode ? '9ca3af' : '6b7280'
                        }?text=${encodeURIComponent(product.name)}`;
                      }}
                    />
                    {inCartQuantity > 0 && (
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDarkMode 
                          ? 'bg-green-600 text-white' 
                          : 'bg-green-500 text-white'
                      }`}>
                        {inCartQuantity}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {product.name}
                        </h3>
                        <div className="flex items-center mt-1">
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {product.sku} • {product.brand}
                          </p>
                          <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-medium ${getStockColor(product.inStock)}`}>
                            {product.inStock} in stock
                          </span>
                        </div>
                      </div>
                      <span className={`text-xl font-bold ml-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <p className={`text-sm mt-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Color: {product.color} • Weight: {product.weight}
                      </div>
                      
                      <button
                        onClick={() => handleAddToCartWithFeedback(product)}
                        className={`flex items-center px-4 py-1.5 rounded-lg transition-colors ${
                          inCartQuantity > 0
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1.5" />
                        {inCartQuantity > 0 ? `${inCartQuantity} in cart • Add More` : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className={`flex items-center justify-between mt-8 pt-6 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Page 1 of 1
            </div>
            <div className="flex items-center space-x-2">
              <button className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`} disabled>
                Previous
              </button>
              <button className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`} disabled>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;