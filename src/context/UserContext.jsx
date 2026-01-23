/* eslint-disable react-refresh/only-export-components */
// src/context/UserContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as authServices from '../services/authServices';

// Create context
export const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize user from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      const currentUser = authServices.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function using authServices with specific error handling
  const loginUser = useCallback(async (email, password) => {
    setLoading(true);
    
    const result = authServices.loginUser(email, password);
    
    if (!result.success) {
      // Pass through the specific error message from authServices
      setLoading(false);
      throw new Error(result.message);
    }

    setUser(result.user);
    setIsAuthenticated(true);
    setLoading(false);
    
    toast.success('Login successful!');
    return result.user;
  }, []);

  // Register function using authServices (NO auto-login)
  const registerUser = useCallback(async (userData) => {
    setLoading(true);

    const result = authServices.registerUser(userData);
    
    if (!result.success) {
      // Pass through the specific error message from authServices
      setLoading(false);
      throw new Error(result.message);
    }

    // DO NOT auto login - just return success
    setLoading(false);
    return result.user;
  }, []);

  // Logout function using authServices
  const logoutUser = useCallback(() => {
    authServices.logoutUser();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const result = authServices.updateUserProfile(user.id, updates);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      setUser(result.user);
      toast.success('Profile updated successfully');
      return result.user;
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  }, [user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return authServices.isAdmin();
  }, []);

  // Check if user is authenticated
  const checkAuth = useCallback(() => {
    return authServices.isAuthenticated();
  }, []);

  // Context value
  const value = {
    user,
    loading,
    isAuthenticated,
    loginUser,
    logoutUser,
    registerUser,
    updateProfile,
    isAdmin,
    checkAuth,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Higher Order Component for protecting routes
export const withAuth = (Component) => {
  const WrappedComponent = (props) => {
    const { isAuthenticated, loading } = useUser();
    
    React.useEffect(() => {
      if (!loading && !isAuthenticated) {
        window.location.href = '/login';
      }
    }, [isAuthenticated, loading]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950/20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };

  // Add display name for better debugging
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
};

// Hook for checking auth state in components
export const useAuth = () => {
  const { isAuthenticated, loading } = useUser();
  
  return {
    isAuthenticated,
    isLoading: loading,
  };
};

// Hook for checking admin status
export const useAdmin = () => {
  const { isAdmin: isAdminFunc, user, loading } = useUser();
  
  return {
    isAdmin: isAdminFunc(),
    user,
    isLoading: loading,
  };
};