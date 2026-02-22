import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const normalizeListPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const fetchAllPages = async (path, params = {}, pageSize = 200) => {
  const limit = params.limit ?? pageSize;
  let page = params.page ?? 1;
  let combined = [];
  let lastPayload = null;
  let resolvedPages = 1;

  for (let guard = 0; guard < 200; guard += 1) {
    const response = await api.get(path, { params: { ...params, page, limit } });
    const payload = response.data;
    lastPayload = payload;
    const data = normalizeListPayload(payload);

    combined = combined.concat(data);

    const hasPagination = payload?.pages !== undefined || payload?.total !== undefined;
    if (!hasPagination) {
      return payload;
    }

    resolvedPages = payload?.pages ?? Math.ceil((payload?.total ?? combined.length) / limit);

    if (data.length === 0 || page >= resolvedPages) {
      return {
        ...payload,
        data: combined,
        count: combined.length,
        total: payload?.total ?? combined.length,
        pages: resolvedPages
      };
    }

    page += 1;
  }

  return {
    ...lastPayload,
    data: combined,
    count: combined.length,
    total: lastPayload?.total ?? combined.length,
    pages: resolvedPages
  };
};

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const payload = await fetchAllPages('/customers', params, 200);
      return payload;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch customers');
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch customer');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/create',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await api.post('/customers', customerData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/customers/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/customers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete customer');
    }
  }
);

const initialState = {
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
  total: 0,
  pages: 1,
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearCustomerError: (state) => {
      state.error = null;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        const data = normalizeListPayload(payload);
        state.customers = data;
        state.total = payload?.total ?? data.length;
        state.pages = payload?.pages ?? 1;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update customer
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.currentCustomer?._id === action.payload._id) {
          state.currentCustomer = action.payload;
        }
      })
      
      // Delete customer
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(c => c._id !== action.payload);
        state.total -= 1;
      });
  },
});

export const { clearCustomerError, clearCurrentCustomer } = customerSlice.actions;
export default customerSlice.reducer;
