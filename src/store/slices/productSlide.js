import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
  async ({ id, quantity, reason, notes, location }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/products/${id}/adjust-stock`, {
        quantity,
        reason,
        notes,
        location
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to adjust stock');
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
        const args = action.meta?.arg || {};
        const existing = state.products.find(p => p._id === action.payload?._id);
        const previousStock = existing?.stock?.quantity ?? existing?.quantity ?? existing?.stock ?? 0;
        const newStock = action.payload?.stock?.quantity ?? action.payload?.quantity ?? (previousStock + (args.quantity || 0));
        const adjustmentEntry = {
          id: `adj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          productId: action.payload?._id || args.id,
          type: args.type || 'Adjustment',
          quantity: args.quantity,
          reason: args.reason,
          notes: args.notes,
          user: args.user || 'System',
          date: args.date ? new Date(args.date).toISOString() : new Date().toISOString(),
          previousStock,
          newStock
        };
        state.stockAdjustments.unshift(adjustmentEntry);
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?._id === action.payload._id) {
          state.currentProduct = action.payload;
        }
      });
  },
});

export const { clearProductError, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
