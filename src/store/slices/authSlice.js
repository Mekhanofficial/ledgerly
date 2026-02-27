import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Registering user:', userData);
      const response = await api.post('/auth/register', userData);
      const payload = response.data || {};
      const verificationData = payload.data || {};
      return {
        message: payload.message,
        pendingVerification: {
          email: verificationData.email || userData.email,
          expiresInMinutes: verificationData.expiresInMinutes
        }
      };
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      return rejectWithValue(error.response?.data?.error || error.message || 'Registration failed');
    }
  }
);

export const verifyEmailOtp = createAsyncThunk(
  'auth/verifyEmailOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-email-otp', { email, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Email verification failed');
    }
  }
);

export const resendEmailOtp = createAsyncThunk(
  'auth/resendEmailOtp',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/resend-email-otp', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to resend verification code');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Logging in:', credentials.email);
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      console.error('Login error:', error.response?.data);
      return rejectWithValue(error.response?.data?.error || error.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.get('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('premium_templates_access');
      localStorage.removeItem('template_purchases');
      localStorage.removeItem('template_access_owner');
      localStorage.removeItem('subscription');
      return null;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage anyway
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('premium_templates_access');
      localStorage.removeItem('template_purchases');
      localStorage.removeItem('template_access_owner');
      localStorage.removeItem('subscription');
      return rejectWithValue(error.message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (error) {
      console.error('Get current user error:', error);
      // If token is invalid, clear it
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return rejectWithValue(error.response?.data?.error || 'Failed to get user');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/updatedetails', userData);
      const user = response.data.data;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Update failed');
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/updatepassword', passwordData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Password update failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/forgotpassword', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/auth/resetpassword/${token}`, { password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Password reset failed');
    }
  }
);

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  pendingVerification: null,
  verificationMessage: null
};

// Create slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPendingVerification: (state) => {
      state.pendingVerification = null;
      state.verificationMessage = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.pendingVerification = action.payload.pendingVerification;
        state.verificationMessage = action.payload.message || null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify email OTP
      .addCase(verifyEmailOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmailOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingVerification = null;
        state.verificationMessage = action.payload?.message || 'Email verified successfully';
      })
      .addCase(verifyEmailOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Resend email OTP
      .addCase(resendEmailOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendEmailOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingVerification = {
          email: action.payload?.data?.email || state.pendingVerification?.email || null,
          expiresInMinutes: action.payload?.data?.expiresInMinutes || state.pendingVerification?.expiresInMinutes
        };
        state.verificationMessage = action.payload?.message || 'Verification code sent';
      })
      .addCase(resendEmailOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.pendingVerification = null;
        state.verificationMessage = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, clearPendingVerification, setUser } = authSlice.actions;
export default authSlice.reducer;
