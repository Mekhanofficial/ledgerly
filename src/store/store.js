import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerReducer from './slices/customerSlice';
import productReducer from './slices/productSlide';
import invoiceReducer from './slices/invoiceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    products: productReducer,
    invoices: invoiceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});