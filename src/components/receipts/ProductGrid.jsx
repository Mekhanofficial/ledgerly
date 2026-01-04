import React, { useState } from 'react';
import { Search, Barcode, ShoppingCart, Filter, Grid, List, Smartphone, Home, Book, Shirt, Package as PackageIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ProductGrid = ({ onAddToCart }) => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');

  const categories = [
    { id: 'all', name: 'All Products', count: 24, icon: PackageIcon },
    { id: 'electronics', name: 'Electronics', count: 8, icon: Smartphone },
    { id: 'clothing', name: 'Clothing', count: 6, icon: Shirt },
    { id: 'home', name: 'Home & Garden', count: 7, icon: Home },
    { id: 'books', name: 'Books', count: 3, icon: Book },
  ];

  const productsData = [
    {
      id: 'SUL WH-001',
      name: 'Wireless Headphones',
      price: 79.99,
      category: 'electronics',
      inStock: 24,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      description: 'Noise-cancelling over-ear headphones',
      sku: 'ELEC-001',
      brand: 'AudioPro'
    },
    {
      id: 'SUL UH-002',
      name: 'Leather Notebook',
      price: 24.99,
      category: 'home',
      inStock: 15,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w-400&h=300&fit=crop',
      description: 'Genuine leather cover with premium paper',
      sku: 'OFF-002',
      brand: 'Stationary Co.'
    },
    {
      id: 'SUL SWB-003',
      name: 'Steel Water Bottle',
      price: 19.99,
      category: 'home',
      inStock: 32,
      image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop',
      description: 'Insulated stainless steel bottle',
      sku: 'HOM-003',
      brand: 'HydroLife'
    },
    {
      id: 'SUL WM-004',
      name: 'Wireless Mouse',
      price: 34.99,
      category: 'electronics',
      inStock: 18,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',
      description: 'Ergonomic wireless mouse with Bluetooth',
      sku: 'ELEC-004',
      brand: 'TechWorks'
    },
    {
      id: 'SUL DL-005',
      name: 'LED Desk Lamp',
      price: 49.99,
      category: 'electronics',
      inStock: 12,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
      description: 'Adjustable desk lamp with USB charging',
      sku: 'ELEC-005',
      brand: 'LightWorks'
    },
    {
      id: 'SUL CM-006',
      name: 'Ceramic Mug',
      price: 12.99,
      category: 'home',
      inStock: 45,
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=300&fit=crop',
      description: 'Handcrafted ceramic coffee mug',
      sku: 'HOM-006',
      brand: 'Artisan Goods'
    },
    {
      id: 'SUL JP-007',
      name: 'Denim Jacket',
      price: 89.99,
      category: 'clothing',
      inStock: 8,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
      description: 'Classic denim jacket, medium wash',
      sku: 'CLO-007',
      brand: 'Denim & Co'
    },
    {
      id: 'SUL BR-008',
      name: 'Business Book',
      price: 29.99,
      category: 'books',
      inStock: 25,
      image: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=400&h=300&fit=crop',
      description: 'Best-selling business strategy book',
      sku: 'BOK-008',
      brand: 'SmartReads'
    }
  ];

  const filteredProducts = productsData
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      return matchesSearch && matchesCategory;
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

  const getStockColor = (stock) => {
    if (stock > 20) return isDarkMode ? 'text-emerald-400 bg-emerald-900/20' : 'text-emerald-600 bg-emerald-50';
    if (stock > 10) return isDarkMode ? 'text-amber-400 bg-amber-900/20' : 'text-amber-600 bg-amber-50';
    return isDarkMode ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50';
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
              placeholder="Search products by name, SKU, or description..."
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'border-gray-300'
              }`}
            />
            <button className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400 hover:text-primary-400' : 'text-gray-400 hover:text-primary-600'
            }`}>
              <Barcode className="w-5 h-5" />
            </button>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-3">
            <div className={`hidden md:flex items-center space-x-2 p-1 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' 
                    ? isDarkMode ? 'bg-gray-600 shadow-sm' : 'bg-white shadow-sm'
                    : isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                <Grid className={`w-4 h-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' 
                    ? isDarkMode ? 'bg-gray-600 shadow-sm' : 'bg-white shadow-sm'
                    : isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                <List className={`w-4 h-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
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

        {/* Categories */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
          <Filter className={`w-4 h-4 flex-shrink-0 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-400'
          }`} />
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
      </div>

      {/* Products Display */}
      <div className="p-6">
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
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
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
                    {product.inStock} in stock
                  </div>
                  {/* Category Badge */}
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm ${
                    isDarkMode 
                      ? 'bg-gray-800/90 text-gray-300' 
                      : 'bg-white/90 text-gray-700'
                  }`}>
                    {product.category.toUpperCase()}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="mb-2">
                    <h3 className={`font-semibold line-clamp-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {product.name}
                    </h3>
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {product.sku} • {product.brand}
                    </p>
                  </div>
                  
                  <p className={`text-sm mb-4 line-clamp-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-2xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${product.price.toFixed(2)}
                      </span>
                      <div className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        each
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onAddToCart(product)}
                      className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors group/btn"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className={`flex items-center border rounded-xl p-4 transition-colors group ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {/* Product Image */}
                <div className={`relative w-16 h-16 flex-shrink-0 mr-4 ${
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
                      <p className={`text-sm mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {product.sku} • {product.brand}
                      </p>
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockColor(product.inStock)}`}>
                      {product.inStock} in stock
                    </span>
                    
                    <button
                      onClick={() => onAddToCart(product)}
                      className="flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1.5" />
                      Add to Receipt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className={`flex items-center justify-between mt-6 pt-6 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Showing <span className={`font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-700'
            }`}>{filteredProducts.length}</span> of{' '}
            <span className={`font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-700'
            }`}>{productsData.length}</span> products
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
    </div>
  );
};

export default ProductGrid;