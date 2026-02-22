// src/routes/inventory/EditProduct.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Save, X, Hash, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useInventory } from '../../context/InventoryContext';
import { useAccount } from '../../context/AccountContext';
import { fetchProductById, updateProduct } from '../../store/slices/productSlide';
import { buildProductPayload, mapProductFromApi } from '../../utils/productAdapter';

const EditProduct = () => {
  const { id } = useParams();
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const { categories, suppliers } = useInventory();
  const { accountInfo } = useAccount();
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: 0,
    quantity: 0,
    categoryId: '',
    supplierId: '',
    costPrice: 0,
    reorderLevel: 10,
    unit: 'pcs',
    image: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    dispatch(fetchProductById(id))
      .unwrap()
      .then((payload) => {
        const productData = payload?.product ?? payload;
        const product = mapProductFromApi(productData || {});

        if (!product.id) {
          throw new Error('Product not found');
        }

        if (isMounted) {
          setFormData({
            name: product.name || '',
            sku: product.sku || '',
            description: product.description || '',
            price: product.price || 0,
            quantity: product.quantity || product.stock || 0,
            categoryId: product.categoryId || '',
            supplierId: product.supplierId || '',
            costPrice: product.costPrice || 0,
            reorderLevel: product.reorderLevel || 10,
            unit: product.unit || 'pcs',
            image: product.image || null
          });
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          addToast('Product not found', 'error');
          navigate('/inventory/products');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, dispatch, addToast, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' || name === 'costPrice' || name === 'reorderLevel'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('Image size should be less than 2MB', 'error');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        addToast('Please select an image file', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        if (base64String.length > 500000) {
          addToast('Image is too large, please use a smaller image', 'error');
          return;
        }
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      addToast('Product name is required', 'error');
      return;
    }
    
    if (formData.price <= 0) {
      addToast('Price must be greater than 0', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updates = buildProductPayload(formData);
      await dispatch(updateProduct({ id, data: updates })).unwrap();
      
      addToast('Product updated successfully!', 'success');
      navigate('/inventory/products');
      
    } catch (error) {
      console.error('Error updating product:', error);
      addToast('Failed to update product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Edit Product
              </h1>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Update product information
              </p>
            </div>
            <button
              onClick={() => navigate('/inventory/products')}
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
              Product Information
            </h2>
            
            {/* Name and SKU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., Wireless Headphones"
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  SKU (Stock Keeping Unit)
                </label>
                <div className="relative">
                  <Hash className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter SKU"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
                placeholder="Product description..."
              />
            </div>

            {/* Price and Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Selling Price *
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-xs font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {currencyCode}
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    className={`w-full pl-14 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Category and Supplier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Supplier
                </label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cost Price and Reorder Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cost Price
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-xs font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {currencyCode}
                  </span>
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full pl-14 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Price you paid for this product
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Reorder Level
                </label>
                <div className="relative">
                  <AlertCircle className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                  <input
                    type="number"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleChange}
                    min="0"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                    placeholder="10"
                  />
                </div>
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  System will alert when stock reaches this level
                </p>
              </div>
            </div>

            {/* Unit and Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Unit of Measurement
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="l">Liters (l)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="m">Meters (m)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="box">Boxes</option>
                  <option value="pack">Packs</option>
                  <option value="set">Sets</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Product Image
                </label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="product-image"
                  />
                  <label
                    htmlFor="product-image"
                    className="cursor-pointer block"
                  >
                    {formData.image ? (
                      <div className="flex flex-col items-center justify-center">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="h-32 w-32 object-cover rounded-lg mb-2"
                        />
                        <div className="flex space-x-2 mt-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Click to change image
                          </span>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Package className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Click to upload product image
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          PNG, JPG up to 2MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className={`border rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Product Preview
            </h3>
            <div className={`flex items-start p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center mr-4 ${
                isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
              }`}>
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Package className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formData.name || 'Product Name'}
                </h4>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formData.description || 'Product description...'}
                </p>
                <div className="flex items-center mt-3 space-x-4">
                  <div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>SKU:</span>
                    <span className="font-mono ml-2">{formData.sku || 'No SKU'}</span>
                  </div>
                  <div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Price:</span>
                    <span className="font-bold ml-2">{formatCurrency(formData.price)}</span>
                  </div>
                  <div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Stock:</span>
                    <span className={`font-bold ml-2 ${
                      formData.quantity <= formData.reorderLevel ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {formData.quantity} {formData.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/products')}
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
              disabled={isSubmitting}
              className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EditProduct;
