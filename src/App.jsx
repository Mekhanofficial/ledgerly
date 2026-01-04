import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { registerUser, loginUser, checkAuthStatus, logoutUser } from "./services/authServices";

// Components
import AuthForm from "./components/auth/AuthForm";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Products from "./components/products/Products";
import Cart from "./pages/cart/Cart";
import Checkout from "./pages/checkout/Checkout";
import AdminPanel from "./components/admin/AdminPanel";
import NotFound from "./components/NotFound";
import UserLayout from "./components/layout";

export default function App() {
  const [user, setUser] = useState(checkAuthStatus());
  const [isLoading, setIsLoading] = useState(false);

  // Listen to storage changes to sync user state across tabs/windows
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'loggedInUser' || event.key === null) {
        const updatedUser = checkAuthStatus();
        setUser(updatedUser);
      }
    };

    // Check auth status on mount and periodically
    const checkAuth = () => {
      const updatedUser = checkAuthStatus();
      if (JSON.stringify(updatedUser) !== JSON.stringify(user)) {
        setUser(updatedUser);
      }
    };

    // Initial check
    checkAuth();
    
    // Set up listeners
    window.addEventListener('storage', handleStorageChange);
    
    // Check every second (helps with logout detection)
    const intervalId = setInterval(checkAuth, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [user]);

  const handleLogin = (email, password) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const u = loginUser(email, password);
      if (!u) {
        alert("Invalid credentials");
        setIsLoading(false);
        return;
      }
      setUser(u);
      setIsLoading(false);
      
      // Force refresh to update all components
      window.dispatchEvent(new Event('storage'));
    }, 500);
  };

  const handleRegister = (formData) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const success = registerUser({ 
        fname: formData.fname, 
        email: formData.email, 
        password: formData.password, 
        role: "user" 
      });
      
      if (success) {
        alert("Registration successful! Please login.");
        setIsLoading(false);
        // Auto-login after successful registration
        const u = loginUser(formData.email, formData.password);
        if (u) {
          setUser(u);
          window.dispatchEvent(new Event('storage'));
        }
      } else {
        alert("Email already exists.");
        setIsLoading(false);
      }
    }, 500);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Routes>
      {/* Auth Route - Always accessible */}
      <Route 
        path="/auth" 
        element={
          user ? (
            <Navigate to={user.role === "admin" ? "/admin" : "/products"} replace />
          ) : (
            <AuthForm 
              onLogin={handleLogin} 
              onRegister={handleRegister}
              isLoading={isLoading}
            />
          )
        } 
      />

      {/* Root - Redirect to auth or products based on login status */}
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to={user.role === "admin" ? "/admin" : "/products"} replace />
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />

      {/* User Routes - Protected */}
      <Route 
        path="/products" 
        element={
          <ProtectedRoute user={user} onLogout={handleLogout}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Products />} />
      </Route>

      <Route 
        path="/cart" 
        element={
          <ProtectedRoute user={user} onLogout={handleLogout}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Cart />} />
      </Route>

      <Route 
        path="/checkout" 
        element={
          <ProtectedRoute user={user} onLogout={handleLogout}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Checkout />} />
      </Route>

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute user={user} adminOnly={true} onLogout={handleLogout}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute user={user} adminOnly={true} onLogout={handleLogout}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
      
      {/* 404 Route - Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}