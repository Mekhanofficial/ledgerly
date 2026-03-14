import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const normalizeListPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const extractApiError = (error, fallbackMessage) => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const normalizedResponseMessage =
    typeof data === 'string'
      ? data
      : data?.error || data?.message || data?.details;
  const message = normalizedResponseMessage
    || error?.message
    || fallbackMessage;
  return {
    message,
    status,
    data
  };
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const resolveInvoiceId = (invoice) => String(invoice?._id || invoice?.id || '').trim();

const upsertInvoiceInState = (state, payload, { prepend = false } = {}) => {
  const payloadId = resolveInvoiceId(payload);
  if (!payloadId) return false;

  const index = state.invoices.findIndex((invoice) => resolveInvoiceId(invoice) === payloadId);
  if (index !== -1) {
    state.invoices[index] = payload;
    return false;
  }

  if (prepend) {
    state.invoices.unshift(payload);
  } else {
    state.invoices.push(payload);
  }
  return true;
};

const INVOICE_SEND_TIMEOUT_MS = parsePositiveInt(
  import.meta.env.VITE_INVOICE_SEND_TIMEOUT_MS,
  parsePositiveInt(import.meta.env.VITE_API_TIMEOUT_MS, 120000)
);

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

// Async thunks for invoices
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const payload = await fetchAllPages('/invoices', params, 200);
      return payload;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch invoices');
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  'invoices/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch invoice');
    }
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/create',
  async (invoiceData, { rejectWithValue }) => {
    try {
      const response = await api.post('/invoices', invoiceData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Failed to create invoice'));
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/invoices/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update invoice');
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/invoices/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete invoice');
    }
  }
);

export const sendInvoice = createAsyncThunk(
  'invoices/send',
  async (payload, { rejectWithValue }) => {
    try {
      const id = typeof payload === 'string' ? payload : payload?.id;
      if (!id) {
        return rejectWithValue('Invoice id is required');
      }
      const data = typeof payload === 'object' ? payload?.data : undefined;
      const response = await api.post(
        `/invoices/${id}/send`,
        data && Object.keys(data).length ? data : undefined,
        { timeout: INVOICE_SEND_TIMEOUT_MS }
      );
      return response.data.data;
    } catch (error) {
      const apiError = extractApiError(error, 'Failed to send invoice');
      return rejectWithValue(apiError.message);
    }
  }
);

export const recordPayment = createAsyncThunk(
  'invoices/recordPayment',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/invoices/${id}/payment`, paymentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to record payment');
    }
  }
);

export const fetchOutstandingInvoices = createAsyncThunk(
  'invoices/fetchOutstanding',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/invoices/outstanding', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch outstanding invoices');
    }
  }
);

const initialState = {
  invoices: [],
  currentInvoice: null,
  outstandingInvoices: [],
  loading: false,
  error: null,
  total: 0,
  pages: 1,
  summary: {
    totalAmount: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    count: 0,
  },
};

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearInvoiceError: (state) => {
      state.error = null;
    },
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        const data = normalizeListPayload(payload);
        state.invoices = data;
        state.total = payload?.total ?? data.length;
        state.pages = payload?.pages ?? 1;
        state.summary = payload?.summary || state.summary;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch invoice by ID
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create invoice
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const inserted = upsertInvoiceInState(state, action.payload, { prepend: true });
        if (inserted) {
          state.total += 1;
        }
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update invoice
      .addCase(updateInvoice.fulfilled, (state, action) => {
        upsertInvoiceInState(state, action.payload);
        if (resolveInvoiceId(state.currentInvoice) === resolveInvoiceId(action.payload)) {
          state.currentInvoice = action.payload;
        }
      })
      
      // Delete invoice
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        const targetId = String(action.payload || '').trim();
        const previousLength = state.invoices.length;
        state.invoices = state.invoices.filter((invoice) => resolveInvoiceId(invoice) !== targetId);
        if (state.invoices.length < previousLength) {
          state.total = Math.max(0, state.total - 1);
        }
      })
      
      // Send invoice
      .addCase(sendInvoice.fulfilled, (state, action) => {
        upsertInvoiceInState(state, action.payload, { prepend: true });
        if (resolveInvoiceId(state.currentInvoice) === resolveInvoiceId(action.payload)) {
          state.currentInvoice = action.payload;
        }
      })
      
      // Record payment
      .addCase(recordPayment.fulfilled, (state, action) => {
        const invoicePayload = action.payload?.invoice;
        upsertInvoiceInState(state, invoicePayload);
        if (resolveInvoiceId(state.currentInvoice) === resolveInvoiceId(invoicePayload)) {
          state.currentInvoice = invoicePayload;
        }
      })
      
      // Fetch outstanding invoices
      .addCase(fetchOutstandingInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOutstandingInvoices.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.outstandingInvoices = normalizeListPayload(payload);
      })
      .addCase(fetchOutstandingInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInvoiceError, clearCurrentInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
