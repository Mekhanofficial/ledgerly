import React from 'react';
import { CreditCard, Wallet, Smartphone, Building, Banknote } from 'lucide-react';

const PaymentMethodDisplay = ({ method, details, isDarkMode, compact = false }) => {
  const getMethodIcon = (methodType) => {
    switch(methodType) {
      case 'credit_card':
        return CreditCard;
      case 'bank_transfer':
        return Building;
      case 'paypal':
        return Wallet;
      case 'mobile_money':
        return Smartphone;
      case 'cash':
        return Banknote;
      default:
        return Wallet;
    }
  };

  const getMethodLabel = (methodType) => {
    switch(methodType) {
      case 'credit_card':
        return 'Credit Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'paypal':
        return 'PayPal';
      case 'mobile_money':
        return 'Mobile Money';
      case 'cash':
        return 'Cash';
      default:
        return methodType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const Icon = getMethodIcon(method);

  if (compact) {
    return (
      <div className={`flex items-center p-2 rounded-lg ${isDarkMode 
        ? 'bg-gray-800/50 border border-gray-700' 
        : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className={`p-1.5 rounded ${isDarkMode 
          ? 'bg-gray-700 text-gray-300' 
          : 'bg-white text-gray-600 shadow-sm'
        }`}>
          <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>
        <div className="ml-2 flex-1 min-w-0">
          <div className={`font-medium truncate text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {getMethodLabel(method)}
          </div>
          {details && (
            <div className={`text-[10px] sm:text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {details}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center p-3 sm:p-4 rounded-xl border ${isDarkMode 
      ? 'border-gray-700 bg-gray-800/50' 
      : 'border-gray-200 bg-gray-50 shadow-sm'
    }`}>
      <div className={`p-2 sm:p-3 rounded-lg ${isDarkMode 
        ? 'bg-gray-700 text-gray-300' 
        : 'bg-white text-gray-600 shadow-sm'
      }`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
        <div className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {getMethodLabel(method)}
        </div>
        {details && (
          <div className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {details}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodDisplay;