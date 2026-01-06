// src/context/ToastContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const newToast = { 
      id, 
      message, 
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success': 
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': 
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': 
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info': 
      default: 
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success': 
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error': 
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning': 
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info': 
      default: 
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success': 
        return 'text-green-800 dark:text-green-300';
      case 'error': 
        return 'text-red-800 dark:text-red-300';
      case 'warning': 
        return 'text-yellow-800 dark:text-yellow-300';
      case 'info': 
      default: 
        return 'text-blue-800 dark:text-blue-300';
    }
  };

  // Add CSS styles dynamically
  const toastStyles = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .toast-enter {
      animation: slideInRight 0.3s ease-out;
    }
    
    .toast-exit {
      animation: slideOutRight 0.3s ease-out;
    }
    
    .toast-progress {
      animation: shrink linear forwards;
      animation-duration: 5s;
    }
    
    @keyframes shrink {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
  `;

  return (
    <ToastContext.Provider value={{ 
      addToast, 
      removeToast, 
      clearAllToasts,
      toasts 
    }}>
      <style>{toastStyles}</style>
      {children}
      
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[1000] space-y-3">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`toast-enter relative min-w-[320px] max-w-md rounded-lg border shadow-lg ${getBgColor(toast.type)}`}
            >
              {/* Progress Bar */}
              <div className={`absolute top-0 left-0 h-1 ${getBgColor(toast.type).replace('bg-', 'bg-').replace('/20', '')}`}>
                <div className={`h-full ${getBgColor(toast.type).replace('bg-', 'bg-').replace('/20', '')} toast-progress`}></div>
              </div>
              
              {/* Toast Content */}
              <div className="flex items-start p-4">
                <div className="flex-shrink-0 mr-3">
                  {getIcon(toast.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${getTextColor(toast.type)}`}>
                    {toast.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {toast.timestamp}
                  </p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {/* Clear All Button */}
          {toasts.length > 1 && (
            <button
              onClick={clearAllToasts}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ml-auto block"
            >
              Clear all ({toasts.length})
            </button>
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
};

// Export a hook for quick toast usage
export const useQuickToast = () => {
  const { addToast } = useToast();
  
  return {
    success: (message, duration = 5000) => addToast(message, 'success', duration),
    error: (message, duration = 5000) => addToast(message, 'error', duration),
    warning: (message, duration = 5000) => addToast(message, 'warning', duration),
    info: (message, duration = 5000) => addToast(message, 'info', duration),
  };
};