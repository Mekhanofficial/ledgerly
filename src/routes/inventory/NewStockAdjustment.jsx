// src/routes/inventory/NewStockAdjustment.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, Save, X, Search, Package, AlertCircle, ArrowUp, ArrowDown, Calendar, User } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useInventory } from '../../context/InventoryContext';

const NewStockAdjustment = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const { addStockAdjustment, products, getProductById } = useInventory();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    productId: '',
    type: 'Restock',
    quantity: 0,
    reason: '',
    date: new Date().toISOString().split('T')[0],
    user: 'System'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Filter products based on search
  useEffect(() => {
    if (productSearch.trim() === '') {
      setFilteredProducts([]);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearch.toLowerCase())
      );
      setFilteredProducts(filtered.slice(0, 5)); // Limit to 5 results
    }
  }, [productSearch, products]);

  // Update selected product when productId changes
  useEffect(() => {
    if (formData.productId) {
      const product = getProductById(formData.productId);
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }
  }, [formData.productId, getProductById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseFloat(value) || 0 : value
    }));
  };

  const handleProductSelect = (product) => {
    setFormData(prev => ({ ...prev, productId: product.id }));
    setSelectedProduct(product);
    setProductSearch('');
    setFilteredProducts([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productId) {
      addToast('Please select a product', 'error');
      return;
    }
    
    if (formData.quantity <= 0) {
      addToast('Quantity must be greater than 0', 'error');
      return;
    }
    
    if (!formData.reason.trim()) {
      addToast('Please provide a reason for the adjustment', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addStockAdjustment({
        productId: formData.productId,
        type: formData.type,
        quantity: formData.quantity,
        reason: formData.reason.trim(),
        date: formData.date,
        user: formData.user.trim()
      });
      
      addToast('Stock adjustment recorded successfully!', 'success');
      navigate('/inventory/stock-adjustments');
      
    } catch (error) {
      console.error('Error recording stock adjustment:', error);
      addToast('Failed to record stock adjustment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const adjustmentTypes = [
    { value: 'Restock', label: 'Restock', icon: ArrowUp, color: 'text-emerald-600 bg-emerald-100' },
    { value: 'Sale', label: 'Sale', icon: ArrowDown, color: 'text-blue-600 bg-blue-100' },
    { value: 'Return', label: 'Return', icon: ArrowUp, color: 'text-amber-600 bg-amber-100' },
    { value: 'Damage', label: 'Damage', icon: AlertCircle, color: 'text-red-600 bg-red-100' },
    { value: 'Adjustment (Increase)', label: 'Adjustment (Increase)', icon: ArrowUp, color: 'text-purple-600 bg-purple-100' },
    { value: 'Adjustment (Decrease)', label: 'Adjustment (Decrease)', icon: ArrowDown, color: 'text-rose-600 bg-rose-100' }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                New Stock Adjustment
              </h1>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Record stock changes and adjustments
              </p>
            </div>
            <button
              onClick={() => navigate('/inventory/stock-adjustments')}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`border rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Adjustment Details
            </h2>
            
            {/* Product Selection */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Product *
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name or SKU..."
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
                
                {/* Product dropdown */}
                {filteredProducts.length > 0 && (
                  <div className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg border ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="py-1 max-h-60 overflow-auto">
                      {filteredProducts.map(product => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleProductSelect(product)}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-900'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                SKU: {product.sku} | Stock: {product.stock || product.quantity || 0}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Selected Product Preview */}
              {selectedProduct && (
                <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                        isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}>
                        {selectedProduct.image ? (
                          <img 
                            src={selectedProduct.image} 
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                      </div>
                      <div>
                        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedProduct.name}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          SKU: {selectedProduct.sku} | Current Stock: {selectedProduct.stock || selectedProduct.quantity || 0}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, productId: '' }));
                        setSelectedProduct(null);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Adjustment Type */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Adjustment Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {adjustmentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        formData.type === type.value
                          ? isDarkMode
                            ? 'border-primary-500 bg-primary-900/20'
                            : 'border-primary-500 bg-primary-50'
                          : isDarkMode
                            ? 'border-gray-600 hover:bg-gray-700'
                            : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${type.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {type.label}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter quantity"
                  required
                />
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formData.type.includes('Decrease') || formData.type === 'Sale' || formData.type === 'Damage'
                    ? 'Quantity to remove from stock'
                    : 'Quantity to add to stock'}
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date *
                </label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Reason and User */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Reason *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Explain why this adjustment is needed..."
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Recorded By
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    name="user"
                    value={formData.user}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          {selectedProduct && (
            <div className={`border rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Adjustment Preview
              </h3>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Product Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Product:</span>
                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedProduct.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>SKU:</span>
                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedProduct.sku}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Current Stock:</span>
                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedProduct.stock || selectedProduct.quantity || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Adjustment Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Type:</span>
                        <span className={`font-medium ${
                          formData.type.includes('Decrease') || formData.type === 'Sale' || formData.type === 'Damage'
                            ? isDarkMode ? 'text-red-400' : 'text-red-600'
                            : isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        }`}>
                          {formData.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Quantity:</span>
                        <span className={`font-bold ${
                          formData.type.includes('Decrease') || formData.type === 'Sale' || formData.type === 'Damage'
                            ? isDarkMode ? 'text-red-400' : 'text-red-600'
                            : isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        }`}>
                          {formData.type.includes('Decrease') || formData.type === 'Sale' || formData.type === 'Damage'
                            ? `-${formData.quantity}`
                            : `+${formData.quantity}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>New Stock:</span>
                        <span className="font-bold">
                          {selectedProduct.stock || selectedProduct.quantity || 0}
                          {formData.type.includes('Decrease') || formData.type === 'Sale' || formData.type === 'Damage'
                            ? ` - ${formData.quantity} = ${(selectedProduct.stock || selectedProduct.quantity || 0) - formData.quantity}`
                            : ` + ${formData.quantity} = ${(selectedProduct.stock || selectedProduct.quantity || 0) + formData.quantity}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Reason:</span>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>{formData.reason || 'No reason provided'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/stock-adjustments')}
              className={`px-6 py-3 rounded-lg font-medium ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedProduct}
              className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Recording...' : 'Record Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewStockAdjustment;