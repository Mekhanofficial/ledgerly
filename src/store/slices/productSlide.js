import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for products
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch product');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post('/products', productData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${id}`, { isActive: false });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete product');
    }
  }
);

export const adjustStock = createAsyncThunk(
  'products/adjustStock',
  async ({ id, quantity, reason, notes, location, type, user, date }, { rejectWithValue }) => {
    try {
      const payload = {
        quantity,
        reason,
        notes,
        location
      };
      if (type) payload.type = type;
      if (user) payload.user = user;
      if (date) payload.date = date;

      const response = await api.post(`/products/${id}/adjust-stock`, payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to adjust stock');
    }
  }
);

export const fetchStockAdjustments = createAsyncThunk(
  'products/fetchAdjustments',
  async (params = { limit: 50 }, { rejectWithValue }) => {
    try {
      const response = await api.get('/inventory/stock-adjustments', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch stock adjustments');
    }
  }
);

const initialState = {
  products: [],
  currentProduct: null,
  currentProductTransactions: [],
  stockAdjustments: [],
  loading: false,
  error: null,
  total: 0,
  pages: 1,
  adjustmentsLoading: false,
  adjustmentsError: null,
  adjustmentsTotal: 0,
  adjustmentsPages: 1
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.currentProductTransactions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        const payload = action.payload || {};
        const product = payload.product ?? payload;
        state.loading = false;
        state.currentProduct = product;
        state.currentProductTransactions = payload.transactions || [];
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?._id === action.payload._id) {
          state.currentProduct = action.payload;
        }
      })
      
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const deletedId = action.payload?._id || action.payload?.id || action.payload;
        state.products = state.products.filter(p => p._id !== deletedId && p.id !== deletedId);
        state.total = Math.max(0, state.total - 1);
      })
      
      // Adjust stock
      .addCase(adjustStock.fulfilled, (state, action) => {
        const payload = action.payload || {};
        const adjustedProduct = payload.product || payload;
        const transaction = payload.transaction;
        const adjustmentEntry = transaction
          ? {
              id: transaction._id || transaction.id || `adj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              productId: transaction.product || adjustedProduct?._id,
              type: transaction.type,
              quantity: transaction.quantity,
              reason: transaction.reason,
              notes: transaction.notes,
              user: transaction.user,
              date: transaction.createdAt || new Date().toISOString(),
              previousStock: transaction.previousStock,
              newStock: transaction.newStock
            }
          : {
              id: `adj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              productId: adjustedProduct?._id,
              type: action.meta?.arg?.type || 'Adjustment',
              quantity: action.meta?.arg?.quantity,
              reason: action.meta?.arg?.reason,
              notes: action.meta?.arg?.notes,
              user: action.meta?.arg?.user,
              date: action.meta?.arg?.date ? new Date(action.meta.arg.date).toISOString() : new Date().toISOString(),
              previousStock: transaction?.previousStock ?? 0,
              newStock: transaction?.newStock ?? adjustedProduct?.stock?.quantity ?? 0
            };

        state.stockAdjustments = [adjustmentEntry, ...state.stockAdjustments].slice(0, 200);

        const index = state.products.findIndex(p => p._id === adjustedProduct?._id);
        if (index !== -1 && adjustedProduct) {
          state.products[index] = adjustedProduct;
        }
        if (state.currentProduct?._id === adjustedProduct?._id) {
          state.currentProduct = adjustedProduct;
        }
      })
      .addCase(fetchStockAdjustments.pending, (state) => {
        state.adjustmentsLoading = true;
        state.adjustmentsError = null;
      })
      .addCase(fetchStockAdjustments.fulfilled, (state, action) => {
        state.adjustmentsLoading = false;
        state.stockAdjustments = action.payload?.data || [];
        state.adjustmentsTotal = action.payload?.total || state.stockAdjustments.length;
        state.adjustmentsPages = action.payload?.pages || 1;
      })
      .addCase(fetchStockAdjustments.rejected, (state, action) => {
        state.adjustmentsLoading = false;
        state.adjustmentsError = action.payload;
      });
  },
});

export const { clearProductError, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
