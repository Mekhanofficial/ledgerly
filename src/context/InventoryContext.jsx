// src/context/InventoryContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useNotifications } from './NotificationContext';

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
  
  // State - EMPTY BY DEFAULT
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stockAdjustments, setStockAdjustments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage
  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = () => {
    try {
      // Load products - EMPTY BY DEFAULT
      const savedProducts = JSON.parse(localStorage.getItem('inventory_products')) || [];
      setProducts(savedProducts);
      
      // Load categories - EMPTY BY DEFAULT
      const savedCategories = JSON.parse(localStorage.getItem('inventory_categories')) || [];
      setCategories(savedCategories);
      
      // Load stock adjustments
      const savedAdjustments = JSON.parse(localStorage.getItem('inventory_adjustments')) || [];
      setStockAdjustments(savedAdjustments);
      
      // Load suppliers
      const savedSuppliers = JSON.parse(localStorage.getItem('inventory_suppliers')) || [];
      setSuppliers(savedSuppliers);
      
    } catch (error) {
      console.error('Error loading inventory data:', error);
      addToast('Error loading inventory data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Optimize product data by compressing images
  const optimizeProductForStorage = (product) => {
    const optimizedProduct = { ...product };
    
    // If there's a large base64 image, store only a reference or compress it
    if (optimizedProduct.image && optimizedProduct.image.startsWith('data:image')) {
      // For production, you would upload to a server and store URL
      // For now, we'll compress large base64 strings or remove them
      if (optimizedProduct.image.length > 100000) { // More than 100KB
        console.warn('Large image detected, storing only reference');
        optimizedProduct.image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjRkZGIi8+PHBhdGggZD0iTTIwIDI2QzIzLjMxMzcgMjYgMjYgMjMuMzEzNyAyNiAyMEMyNiAxNi42ODYzIDIzLjMxMzcgMTQgMjAgMTRDMTYuNjg2MyAxNCAxNCAxNi42ODYzIDE0IDIwQzE0IDIzLjMxMzcgMTYuNjg2MyAyNiAyMCAyNloiIGZpbGw9IiNFRUVFRUUiLz48cGF0aCBkPSJNMjYgMjZIMTRWMjJIMjZWMjZaIiBmaWxsPSIjRUVFRUVFIi8+PC9zdmc+'; // Tiny placeholder
      }
    }
    
    return optimizedProduct;
  };

  // Save data to localStorage with error handling
  const saveToLocalStorage = (key, data) => {
    try {
      // Optimize data if it's products with images
      let optimizedData = data;
      if (key === 'inventory_products') {
        optimizedData = data.map(product => optimizeProductForStorage(product));
      }
      
      const dataString = JSON.stringify(optimizedData);
      
      // Check if data is too large
      if (dataString.length > 4500000) { // Approx 4.5MB
        console.warn(`Data for ${key} is too large (${(dataString.length / 1024 / 1024).toFixed(2)}MB)`);
        
        if (key === 'inventory_products') {
          // Remove images from products to save space
          optimizedData = data.map(({ image, ...rest }) => rest);
          localStorage.setItem(key, JSON.stringify(optimizedData));
          addToast('Large image data removed to save space', 'warning');
        } else {
          // Try to save a subset of data
          localStorage.setItem(key, JSON.stringify(data.slice(0, 50)));
          addToast(`Too much data for ${key}, only storing first 50 items`, 'warning');
        }
      } else {
        localStorage.setItem(key, dataString);
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
      addToast(`Error saving ${key} data`, 'error');
      
      // Clear some space if quota exceeded
      if (error.name === 'QuotaExceededError') {
        handleStorageQuotaError(key, data);
      }
    }
  };

  // Handle storage quota errors
  const handleStorageQuotaError = (key, data) => {
    console.log('Storage quota exceeded, clearing old data');
    
    // Clear oldest data or reduce data size
    if (key === 'inventory_products') {
      // Keep only recent 100 products
      const recentProducts = data.slice(0, 100);
      const productsWithoutImages = recentProducts.map(({ image, ...rest }) => rest);
      localStorage.setItem(key, JSON.stringify(productsWithoutImages));
      addToast('Cleared old products to save space', 'warning');
    } else if (key === 'inventory_adjustments') {
      // Keep only recent 200 adjustments
      const recentAdjustments = data.slice(0, 200);
      localStorage.setItem(key, JSON.stringify(recentAdjustments));
      addToast('Cleared old stock adjustments to save space', 'warning');
    }
  };

  // Save data to localStorage with optimizations
  useEffect(() => {
    if (!loading) {
      saveToLocalStorage('inventory_products', products);
    }
  }, [products, loading]);

  useEffect(() => {
    if (!loading) {
      saveToLocalStorage('inventory_categories', categories);
    }
  }, [categories, loading]);

  useEffect(() => {
    if (!loading) {
      saveToLocalStorage('inventory_adjustments', stockAdjustments);
    }
  }, [stockAdjustments, loading]);

  useEffect(() => {
    if (!loading) {
      saveToLocalStorage('inventory_suppliers', suppliers);
    }
  }, [suppliers, loading]);

  // Helper function to calculate product total value
  const calculateProductTotalValue = (product) => {
    const quantity = parseFloat(product.quantity) || 0;
    const price = parseFloat(product.price) || 0;
    const total = quantity * price;
    return isNaN(total) ? 0 : total;
  };

  // Helper function to parse numeric values safely
  const parseNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Get default categories (used when creating first product)
  const getDefaultCategories = () => {
    return [
      {
        id: 'cat_1',
        name: 'Electronics',
        description: 'Computers, phones, and accessories',
        productCount: 0,
        totalValue: 0,
        color: '#3B82F6',
        icon: '💻',
        createdBy: 'system',
        createdAt: new Date().toISOString()
      },
      {
        id: 'cat_2',
        name: 'Stationery',
        description: 'Office supplies and writing materials',
        productCount: 0,
        totalValue: 0,
        color: '#10B981',
        icon: '📝',
        createdBy: 'system',
        createdAt: new Date().toISOString()
      },
      {
        id: 'cat_3',
        name: 'Furniture',
        description: 'Office furniture and equipment',
        productCount: 0,
        totalValue: 0,
        color: '#F59E0B',
        icon: '🪑',
        createdBy: 'system',
        createdAt: new Date().toISOString()
      },
      {
        id: 'cat_4',
        name: 'Clothing',
        description: 'Apparel and accessories',
        productCount: 0,
        totalValue: 0,
        color: '#8B5CF6',
        icon: '👕',
        createdBy: 'system',
        createdAt: new Date().toISOString()
      },
      {
        id: 'cat_5',
        name: 'Accessories',
        description: 'Miscellaneous accessories',
        productCount: 0,
        totalValue: 0,
        color: '#EC4899',
        icon: '🎒',
        createdBy: 'system',
        createdAt: new Date().toISOString()
      }
    ];
  };

  // Get default suppliers (used when creating first product)
  const getDefaultSuppliers = () => {
    return [
      {
        id: 'sup_1',
        name: 'Tech Distributors',
        contact: 'John Smith',
        email: 'john@techdist.com',
        phone: '(555) 123-4567',
        address: '123 Tech Street, Silicon Valley, CA',
        products: [],
        status: 'Active',
        rating: 4.8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'sup_2',
        name: 'Office Supplies Co',
        contact: 'Sarah Wilson',
        email: 'sarah@officesupply.com',
        phone: '(555) 987-6543',
        address: '456 Office Lane, Business Park, NY',
        products: [],
        status: 'Active',
        rating: 4.5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  };

  // Initialize default data when first product is added
  const initializeDefaultData = () => {
    if (categories.length === 0) {
      const defaultCategories = getDefaultCategories();
      setCategories(defaultCategories);
      saveToLocalStorage('inventory_categories', defaultCategories);
    }
    
    if (suppliers.length === 0) {
      const defaultSuppliers = getDefaultSuppliers();
      setSuppliers(defaultSuppliers);
      saveToLocalStorage('inventory_suppliers', defaultSuppliers);
    }
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
      // Initialize default data if this is the first product
      if (products.length === 0) {
        initializeDefaultData();
      }

      const quantity = parseNumber(productData.quantity);
      const price = parseNumber(productData.price);
      const costPrice = parseNumber(productData.costPrice);
      const reorderLevel = parseInt(productData.reorderLevel) || 10;
      
      // Compress image if it exists and is large
      let optimizedImage = productData.image;
      if (productData.image && productData.image.startsWith('data:image')) {
        if (productData.image.length > 50000) { // More than 50KB
          try {
            optimizedImage = await compressImage(productData.image, 400, 0.7);
            console.log('Image compressed:', {
              original: (productData.image.length / 1024).toFixed(2) + 'KB',
              compressed: (optimizedImage.length / 1024).toFixed(2) + 'KB'
            });
          } catch (error) {
            console.error('Error compressing image:', error);
          }
        }
      }
      
      const newProduct = {
        id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...productData,
        image: optimizedImage,
        quantity: quantity,
        price: price,
        costPrice: costPrice,
        reorderLevel: reorderLevel,
        stock: quantity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: quantity > 10 ? 'In Stock' : quantity > 0 ? 'Low Stock' : 'Out of Stock',
        totalValue: quantity * price
      };

      // Add to products
      const updatedProducts = [newProduct, ...products];
      setProducts(updatedProducts);

      // Update category product count
      if (productData.categoryId) {
        updateCategoryProductCount(productData.categoryId, 1);
      }

      // Update supplier product list
      if (productData.supplierId) {
        updateSupplierProducts(productData.supplierId, newProduct.id);
      }

      // Add stock adjustment for new product
      const adjustment = {
        id: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        type: 'New Product',
        quantity: newProduct.quantity,
        previousStock: 0,
        newStock: newProduct.quantity,
        reason: 'New product added to inventory',
        date: new Date().toISOString(),
        user: 'System'
      };
      
      setStockAdjustments(prev => [adjustment, ...prev]);

      addToast(`Product "${newProduct.name}" added successfully!`, 'success');
      
      addNotification({
        type: 'inventory',
        title: 'New Product Added',
        description: `${newProduct.name} (${newProduct.sku})`,
        details: `Quantity: ${newProduct.quantity} | Price: $${newProduct.price.toFixed(2)}`,
        time: 'Just now',
        action: 'View Product',
        color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        link: '/inventory/products',
        icon: 'Package'
      });

      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      addToast('Error adding product', 'error');
      throw error;
    }
  };

  // Update product
  const updateProduct = async (id, updates) => {
    try {
      const oldProduct = products.find(p => p.id === id);
      if (!oldProduct) throw new Error('Product not found');

      const quantity = parseNumber(updates.quantity ?? oldProduct.quantity, 0);
      const price = parseNumber(updates.price ?? oldProduct.price, 0);
      
      // Compress image if provided
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
      
      const updatedProduct = {
        ...oldProduct,
        ...updates,
        image: optimizedImage || oldProduct.image,
        quantity: quantity,
        price: price,
        stock: quantity,
        updatedAt: new Date().toISOString(),
        totalValue: quantity * price,
        status: quantity > 10 ? 'In Stock' : quantity > 0 ? 'Low Stock' : 'Out of Stock'
      };

      const updatedProducts = products.map(p => 
        p.id === id ? updatedProduct : p
      );
      setProducts(updatedProducts);

      // If category changed, update category counts
      if (updates.categoryId && updates.categoryId !== oldProduct.categoryId) {
        if (oldProduct.categoryId) {
          updateCategoryProductCount(oldProduct.categoryId, -1);
        }
        updateCategoryProductCount(updates.categoryId, 1);
      }

      addToast(`Product "${updatedProduct.name}" updated successfully!`, 'success');
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      addToast('Error updating product', 'error');
      throw error;
    }
  };

  // Delete product
  const deleteProduct = (id) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) throw new Error('Product not found');

      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);

      // Update category product count
      if (product.categoryId) {
        updateCategoryProductCount(product.categoryId, -1);
      }

      addToast(`Product "${product.name}" deleted successfully!`, 'success');
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      addToast('Error deleting product', 'error');
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
  const addCategory = (categoryData) => {
    try {
      const newCategory = {
        id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...categoryData,
        productCount: 0,
        totalValue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedCategories = [newCategory, ...categories];
      setCategories(updatedCategories);

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
      });

      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      addToast('Error creating category', 'error');
      throw error;
    }
  };

  // Update category
  const updateCategory = (id, updates) => {
    try {
      const updatedCategories = categories.map(cat =>
        cat.id === id ? { 
          ...cat, 
          ...updates,
          updatedAt: new Date().toISOString()
        } : cat
      );
      setCategories(updatedCategories);
      addToast('Category updated successfully!', 'success');
      return updatedCategories.find(cat => cat.id === id);
    } catch (error) {
      console.error('Error updating category:', error);
      addToast('Error updating category', 'error');
      throw error;
    }
  };

  // Delete category
  const deleteCategory = (id) => {
    try {
      const category = categories.find(c => c.id === id);
      if (!category) throw new Error('Category not found');

      // Check if category has products
      const categoryProducts = products.filter(p => p.categoryId === id);
      if (categoryProducts.length > 0) {
        addToast('Cannot delete category with products. Move products first.', 'warning');
        return false;
      }

      const updatedCategories = categories.filter(c => c.id !== id);
      setCategories(updatedCategories);

      addToast(`Category "${category.name}" deleted successfully!`, 'success');
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      addToast('Error deleting category', 'error');
      return false;
    }
  };

  // Add stock adjustment
  const addStockAdjustment = (adjustmentData) => {
    try {
      const product = products.find(p => p.id === adjustmentData.productId);
      if (!product) throw new Error('Product not found');

      const oldQuantity = parseNumber(product.quantity);
      const adjustmentQuantity = parseNumber(adjustmentData.quantity);
      
      let newQuantity;
      switch (adjustmentData.type) {
        case 'Restock':
        case 'Return':
        case 'Adjustment (Increase)':
          newQuantity = oldQuantity + adjustmentQuantity;
          break;
        case 'Sale':
        case 'Damage':
        case 'Adjustment (Decrease)':
          newQuantity = oldQuantity - adjustmentQuantity;
          break;
        default:
          newQuantity = oldQuantity;
      }

      // Ensure quantity doesn't go negative
      newQuantity = Math.max(0, newQuantity);

      const newAdjustment = {
        id: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...adjustmentData,
        quantity: adjustmentData.type.includes('Decrease') || adjustmentData.type === 'Sale' || adjustmentData.type === 'Damage' 
          ? -Math.abs(adjustmentQuantity) 
          : Math.abs(adjustmentQuantity),
        date: new Date().toISOString(),
        previousStock: oldQuantity,
        newStock: newQuantity,
        user: adjustmentData.user || 'System'
      };

      // Update product quantity
      const updatedProducts = products.map(p =>
        p.id === product.id
          ? {
              ...p,
              quantity: newQuantity,
              stock: newQuantity,
              status: newQuantity > 10 ? 'In Stock' : newQuantity > 0 ? 'Low Stock' : 'Out of Stock',
              totalValue: newQuantity * (p.price || 0),
              updatedAt: new Date().toISOString()
            }
          : p
      );
      setProducts(updatedProducts);

      // Add to adjustments
      setStockAdjustments(prev => [newAdjustment, ...prev]);

      // Send notification for low stock
      const reorderLevel = product.reorderLevel || 10;
      if (newQuantity <= reorderLevel && newQuantity > 0) {
        addNotification({
          type: 'inventory',
          title: 'Low Stock Alert',
          description: `${product.name} (${product.sku})`,
          details: `Only ${newQuantity} items left in stock (reorder level: ${reorderLevel})`,
          time: 'Just now',
          action: 'Restock',
          color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
          link: '/inventory/products',
          icon: 'AlertCircle'
        });
      }

      addToast(`Stock adjustment recorded for "${product.name}"`, 'success');
      return newAdjustment;
    } catch (error) {
      console.error('Error recording stock adjustment:', error);
      addToast('Error recording stock adjustment', 'error');
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
  const updateStockOnPayment = (invoice) => {
    try {
      if (!invoice.lineItems || !Array.isArray(invoice.lineItems)) {
        return;
      }

      const adjustments = [];
      
      invoice.lineItems.forEach(item => {
        const product = products.find(p => 
          p.id === item.productId || 
          p.name === item.description || 
          p.sku === item.sku
        );
        
        if (product) {
          const oldQuantity = parseNumber(product.quantity);
          const soldQuantity = parseNumber(item.quantity);
          
          if (oldQuantity >= soldQuantity) {
            // Reduce stock for sold items
            const newQuantity = oldQuantity - soldQuantity;
            
            const updatedProducts = products.map(p =>
              p.id === product.id
                ? {
                    ...p,
                    quantity: newQuantity,
                    stock: newQuantity,
                    status: newQuantity > 10 ? 'In Stock' : newQuantity > 0 ? 'Low Stock' : 'Out of Stock',
                    totalValue: newQuantity * (p.price || 0),
                    updatedAt: new Date().toISOString()
                  }
                : p
            );
            setProducts(updatedProducts);

            // Record adjustment
            const adjustment = {
              id: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              type: 'Sale',
              quantity: -soldQuantity,
              previousStock: oldQuantity,
              newStock: newQuantity,
              reason: `Invoice #${invoice.invoiceNumber || invoice.id}`,
              date: new Date().toISOString(),
              user: 'System'
            };
            
            adjustments.push(adjustment);
          }
        }
      });

      // Add all adjustments
      if (adjustments.length > 0) {
        setStockAdjustments(prev => [...adjustments, ...prev]);
        
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
  const bulkUpdateProducts = (productIds, updates) => {
    const updatedProducts = products.map(p =>
      productIds.includes(p.id) ? { 
        ...p, 
        ...updates,
        updatedAt: new Date().toISOString()
      } : p
    );
    setProducts(updatedProducts);
    addToast(`${productIds.length} products updated`, 'success');
  };

  // Clear all inventory data (for testing/debugging)
  const clearInventoryData = () => {
    if (window.confirm('Are you sure you want to clear ALL inventory data? This cannot be undone.')) {
      setProducts([]);
      setCategories([]);
      setStockAdjustments([]);
      setSuppliers([]);
      localStorage.removeItem('inventory_products');
      localStorage.removeItem('inventory_categories');
      localStorage.removeItem('inventory_adjustments');
      localStorage.removeItem('inventory_suppliers');
      addToast('All inventory data cleared', 'success');
    }
  };

  // Clear localStorage and reset
  const clearLocalStorageAndReset = () => {
    try {
      // Clear all inventory related localStorage
      localStorage.removeItem('inventory_products');
      localStorage.removeItem('inventory_categories');
      localStorage.removeItem('inventory_adjustments');
      localStorage.removeItem('inventory_suppliers');
      
      // Reset state
      setProducts([]);
      setCategories([]);
      setStockAdjustments([]);
      setSuppliers([]);
      
      addToast('LocalStorage cleared and reset successfully', 'success');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      addToast('Error clearing localStorage', 'error');
    }
  };

  const addSupplier = (supplierData) => {
  try {
    const newSupplier = {
      id: `sup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...supplierData,
      products: [],
      orderCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedSuppliers = [newSupplier, ...suppliers];
    setSuppliers(updatedSuppliers);

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
    });

    return newSupplier;
  } catch (error) {
    console.error('Error creating supplier:', error);
    addToast('Error creating supplier', 'error');
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