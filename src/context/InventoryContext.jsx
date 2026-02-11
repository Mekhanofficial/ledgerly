// src/context/InventoryContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from './ToastContext';
import { useNotifications } from './NotificationContext';
import api from '../services/api';
import {
  fetchProducts,
  createProduct as createProductThunk,
  updateProduct as updateProductThunk,
  deleteProduct as deleteProductThunk,
  adjustStock as adjustStockThunk,
  fetchStockAdjustments
} from '../store/slices/productSlide';
import { mapProductFromApi, buildProductPayload } from '../utils/productAdapter';

export const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  const { addToast } = useToast();
  const { addNotification } = useNotifications();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { products: rawProducts, stockAdjustments: storeAdjustments } = useSelector((state) => state.products);
  
  // State - EMPTY BY DEFAULT
  const products = useMemo(() => {
    const source = Array.isArray(rawProducts) ? rawProducts : [];
    return source.map((product) => mapProductFromApi(product));
  }, [rawProducts]);
  const stockAdjustments = storeAdjustments;
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      addToast('Failed to load categories', 'error');
    }
  }, [addToast]);

  const loadSuppliers = useCallback(async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data.data || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      addToast('Failed to load suppliers', 'error');
    }
  }, [addToast]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setCategories([]);
      setSuppliers([]);
      return;
    }

    const initialize = async () => {
      setLoading(true);
      try {
        await Promise.all([
          dispatch(fetchProducts({ isActive: true })),
          dispatch(fetchStockAdjustments({ limit: 200 })),
          loadCategories(),
          loadSuppliers()
        ]);
      } catch (error) {
        console.error('Error initializing inventory state:', error);
        addToast('Error loading inventory data', 'error');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [dispatch, loadCategories, loadSuppliers, addToast, isAuthenticated]);

  // Helper function to parse numeric values safely
  const parseNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Compress image to reduce size
  const compressImage = (base64Image, maxWidth = 400, quality = 0.7) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.onerror = () => {
        // Return original if compression fails
        resolve(base64Image);
      };
      
      img.src = base64Image;
    });
  };

  // Add a new product
  const addProduct = async (productData) => {
    try {
      const quantity = parseNumber(productData.quantity);
      const price = parseNumber(productData.price);
      let optimizedImage = productData.image;

      if (productData.image && productData.image.startsWith('data:image')) {
        if (productData.image.length > 50000) {
          try {
            optimizedImage = await compressImage(productData.image, 400, 0.7);
          } catch (error) {
            console.error('Error compressing image:', error);
          }
        }
      }

      const payload = buildProductPayload({
        ...productData,
        image: optimizedImage,
        price,
        costPrice: parseNumber(productData.costPrice),
        quantity,
        reorderLevel: parseNumber(productData.reorderLevel, 10)
      });

      const created = await dispatch(createProductThunk(payload)).unwrap();
      const newProduct = mapProductFromApi(created);

      if (productData.categoryId) {
        updateCategoryProductCount(productData.categoryId, 1);
      }

      addToast(`Product "${newProduct.name}" added successfully!`, 'success');
      addNotification({
        type: 'inventory',
        title: 'New Product Added',
        description: `${newProduct.name} (${newProduct.sku})`,
        details: `Quantity: ${newProduct.stock} | Price: $${newProduct.price}`,
        time: 'Just now',
        action: 'View Product',
        color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        link: '/inventory/products',
        icon: 'Package'
      }, { showToast: false });

      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      addToast(error?.message || 'Error adding product', 'error');
      throw error;
    }
  };

  // Update product
  const updateProduct = async (id, updates) => {
    try {
      const quantity = parseNumber(updates.quantity, 0);
      let optimizedImage = updates.image;

      if (updates.image && updates.image.startsWith('data:image')) {
        if (updates.image.length > 50000) {
          try {
            optimizedImage = await compressImage(updates.image, 400, 0.7);
          } catch (error) {
            console.error('Error compressing image:', error);
          }
        }
      }

      const payload = buildProductPayload({
        ...updates,
        image: optimizedImage,
        price: parseNumber(updates.price),
        costPrice: parseNumber(updates.costPrice),
        quantity,
        reorderLevel: parseNumber(updates.reorderLevel, 10)
      });

      const updated = await dispatch(updateProductThunk({ id, data: payload })).unwrap();
      const mapped = mapProductFromApi(updated);

      addToast(`Product "${mapped.name}" updated successfully!`, 'success');
      await loadCategories();
      return mapped;
    } catch (error) {
      console.error('Error updating product:', error);
      addToast(error?.message || 'Error updating product', 'error');
      throw error;
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    try {
      await dispatch(deleteProductThunk(id)).unwrap();
      addToast('Product deleted successfully!', 'success');
      await loadCategories();
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      addToast(error?.message || 'Error deleting product', 'error');
      return false;
    }
  };

  // Update category product count
  const updateCategoryProductCount = (categoryId, change) => {
    if (!categoryId) return;
    
    setCategories(prevCategories => 
      prevCategories.map(cat => {
        if (cat.id === categoryId) {
          const newCount = Math.max(0, (cat.productCount || 0) + change);
          return {
            ...cat,
            productCount: newCount,
            updatedAt: new Date().toISOString()
          };
        }
        return cat;
      })
    );
  };

  // Update supplier products
  const updateSupplierProducts = (supplierId, productId) => {
    setSuppliers(prevSuppliers => 
      prevSuppliers.map(sup => {
        if (sup.id === supplierId) {
          const productIds = sup.products || [];
          if (!productIds.includes(productId)) {
            return {
              ...sup,
              products: [...productIds, productId],
              updatedAt: new Date().toISOString()
            };
          }
        }
        return sup;
      })
    );
  };

  // Add a new category
  const addCategory = async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      const newCategory = response.data.data;
      setCategories(prev => [newCategory, ...prev]);
      addToast(`Category "${newCategory.name}" created successfully!`, 'success');
      addNotification({
        type: 'inventory',
        title: 'New Category Added',
        description: newCategory.name,
        details: newCategory.description || 'No description',
        time: 'Just now',
        action: 'View Category',
        color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
        link: '/inventory/categories',
        icon: 'Folder'
      }, { showToast: false });
      await loadCategories();
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      addToast(error?.message || 'Error creating category', 'error');
      throw error;
    }
  };

  // Update category
  const updateCategory = async (id, updates) => {
    try {
      const response = await api.put(`/categories/${id}`, updates);
      const updatedCategory = response.data.data;
      setCategories(prev => prev.map(cat => (cat._id === updatedCategory._id ? updatedCategory : cat)));
      addToast('Category updated successfully!', 'success');
      await loadCategories();
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      addToast(error?.message || 'Error updating category', 'error');
      throw error;
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    try {
      const categoryProducts = products.filter(p => p.categoryId === id);
      if (categoryProducts.length > 0) {
        addToast('Cannot delete category with products. Move products first.', 'warning');
        return false;
      }

      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
      addToast('Category deleted successfully!', 'success');
      await loadCategories();
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      addToast(error?.message || 'Error deleting category', 'error');
      return false;
    }
  };

  // Add stock adjustment
  const addStockAdjustment = async (adjustmentData) => {
    try {
      const payload = {
        id: adjustmentData.productId,
        quantity: adjustmentData.quantity,
        reason: adjustmentData.reason,
        notes: adjustmentData.notes,
        location: adjustmentData.location,
        type: adjustmentData.type,
        user: adjustmentData.user,
        date: adjustmentData.date
      };

      const result = await dispatch(adjustStockThunk(payload)).unwrap();
      await dispatch(fetchStockAdjustments({ limit: 200 }));

      const product = result.product;
      const newStock = result.transaction?.newStock ?? product?.stock ?? 0;
      const reorderLevel = product?.reorderLevel ?? 10;

      if (newStock <= reorderLevel && newStock > 0) {
        addNotification({
          type: 'inventory',
          title: 'Low Stock Alert',
          description: `${product?.name || 'Product'} (${product?.sku || ''})`,
          details: `Only ${newStock} items left in stock (reorder level: ${reorderLevel})`,
          time: 'Just now',
          action: 'Restock',
          color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
          link: '/inventory/products',
          icon: 'AlertCircle'
        });
      }

      addToast(`Stock adjustment recorded for "${product?.name || 'product'}"`, 'success');
      return result;
    } catch (error) {
      console.error('Error recording stock adjustment:', error);
      addToast(error?.message || 'Error recording stock adjustment', 'error');
      throw error;
    }
  };

  // Get product by ID
  const getProductById = (productId) => {
    return products.find(p => p.id === productId);
  };

  // Get products for receipt/pos
  const getProductsForPOS = () => {
    return products.map(product => ({
      id: product.id,
      name: product.name,
      price: parseNumber(product.price),
      sku: product.sku,
      category: product.categoryId ? 
        categories.find(c => c.id === product.categoryId)?.name : 'Uncategorized',
      stock: parseNumber(product.quantity),
      status: product.status,
      image: product.image,
      description: product.description
    }));
  };

  // Get products for invoice creation (dropdown)
  const getProductsForInvoice = () => {
    return products.map(product => ({
      id: product.id,
      name: product.name,
      price: parseNumber(product.price),
      description: product.description,
      sku: product.sku,
      stock: parseNumber(product.quantity)
    }));
  };

  // Update stock when invoice is paid
  const updateStockOnPayment = async (invoice) => {
    try {
      if (!invoice?.lineItems || !Array.isArray(invoice.lineItems)) {
        return;
      }

      const adjustments = [];

      for (const item of invoice.lineItems) {
        const quantity = parseNumber(item.quantity);
        if (!quantity) continue;

        try {
          await dispatch(adjustStockThunk({
            id: item.productId,
            quantity: -Math.abs(quantity),
            type: 'Sale',
            reason: `Invoice #${invoice.invoiceNumber || invoice.id}`,
            notes: 'Sale',
            user: item.soldBy || 'System'
          })).unwrap();
          adjustments.push(item.productId);
        } catch (itemError) {
          console.error('Error adjusting stock for invoice item:', itemError);
        }
      }

      if (adjustments.length > 0) {
        await dispatch(fetchStockAdjustments({ limit: 200 }));
        addNotification({
          type: 'inventory',
          title: 'Stock Updated',
          description: `${adjustments.length} products updated from invoice`,
          details: `Invoice #${invoice.invoiceNumber || invoice.id} was paid`,
          time: 'Just now',
          action: 'View Adjustments',
          color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          link: '/inventory/stock-adjustments',
          icon: 'Package'
        });
      }
    } catch (error) {
      console.error('Error updating stock on payment:', error);
    }
  };

  // Get inventory stats
  const getInventoryStats = () => {
    const totalProducts = products.length;
    
    // Calculate total value correctly
    const totalValue = products.reduce((sum, p) => {
      const quantity = parseNumber(p.quantity);
      const price = parseNumber(p.price);
      const productValue = quantity * price;
      return sum + productValue;
    }, 0);
    
    const lowStockCount = products.filter(p => {
      const quantity = parseNumber(p.quantity);
      const reorderLevel = parseNumber(p.reorderLevel, 10);
      return quantity > 0 && quantity <= reorderLevel;
    }).length;
    
    const outOfStockCount = products.filter(p => {
      const quantity = parseNumber(p.quantity);
      return quantity === 0;
    }).length;
    
    const inStockCount = products.filter(p => {
      const quantity = parseNumber(p.quantity);
      const reorderLevel = parseNumber(p.reorderLevel, 10);
      return quantity > reorderLevel;
    }).length;
    
    // Get recent adjustments
    const recentAdjustments = [...stockAdjustments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    return {
      totalProducts,
      totalValue: parseFloat(totalValue.toFixed(2)),
      lowStockCount,
      outOfStockCount,
      inStockCount,
      totalCategories: categories.length,
      totalSuppliers: suppliers.length,
      recentAdjustments
    };
  };

  // Get products by category
  const getProductsByCategory = (categoryId) => {
    return products.filter(p => p.categoryId === categoryId);
  };

  // Search products
  const searchProducts = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  };

  // Bulk operations
  const bulkUpdateProducts = async (productIds, updates) => {
    try {
      await Promise.all(productIds.map(id =>
        dispatch(updateProductThunk({ id, data: updates })).unwrap()
      ));
      dispatch(fetchProducts({ isActive: true }));
      addToast(`${productIds.length} products updated`, 'success');
    } catch (error) {
      console.error('Error updating products in bulk:', error);
      addToast(error?.message || 'Error updating products', 'error');
      throw error;
    }
  };

  // Clear all inventory data (for testing/debugging)
  const clearInventoryData = () => {
    if (window.confirm('Are you sure you want to clear ALL inventory data? This cannot be undone.')) {
      setCategories([]);
      setSuppliers([]);
      dispatch(fetchProducts({ isActive: true }));
      dispatch(fetchStockAdjustments({ limit: 0 }));
      addToast('All inventory data cleared', 'success');
    }
  };

  // Clear inventory state and reset
  const clearLocalStorageAndReset = () => {
    try {
      // Reset state
      setCategories([]);
      setSuppliers([]);
      dispatch(fetchProducts({ isActive: true }));
      dispatch(fetchStockAdjustments({ limit: 100 }));
      
      addToast('Inventory state reset successfully', 'success');
    } catch (error) {
      console.error('Error clearing inventory state:', error);
      addToast('Error clearing inventory state', 'error');
    }
  };

  const addSupplier = async (supplierData) => {
    try {
      const response = await api.post('/suppliers', supplierData);
      const newSupplier = response.data.data;
      setSuppliers(prev => [newSupplier, ...prev]);
      addToast(`Supplier "${newSupplier.name}" created successfully!`, 'success');
      addNotification({
        type: 'inventory',
        title: 'New Supplier Added',
        description: newSupplier.name,
        details: newSupplier.email || 'No email provided',
        time: 'Just now',
        action: 'View Supplier',
        color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        link: '/inventory/suppliers',
        icon: 'Truck'
      }, { showToast: false });
      await loadSuppliers();
      return newSupplier;
    } catch (error) {
      console.error('Error creating supplier:', error);
      addToast(error?.message || 'Error creating supplier', 'error');
      throw error;
    }
  };

  const contextValue = {
    // State
    products,
    categories,
    stockAdjustments,
    suppliers,
    loading,
    
    // Product Methods
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductsForPOS,
    getProductsForInvoice,
    
    // Category Methods
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Stock Methods
    addStockAdjustment,
    updateStockOnPayment,

     // Supplier Methods
    addSupplier,
    
    // Query Methods
    getInventoryStats,
    getProductsByCategory,
    searchProducts,
    bulkUpdateProducts,
    
    // Debug/Utility
    clearInventoryData,
    clearLocalStorageAndReset
  };

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};

