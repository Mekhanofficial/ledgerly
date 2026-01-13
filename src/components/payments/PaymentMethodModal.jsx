// src/components/payments/PaymentMethodModal.js
import React, { useState } from 'react';
import { X, CreditCard, Building, Smartphone, Wallet } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePayments } from '../../context/PaymentContext';

const PaymentMethodModal = ({ isOpen, onClose, methodToEdit = null }) => {
  const { isDarkMode } = useTheme();
  const { addPaymentMethod, updatePaymentMethod } = usePayments();
  
  const [methodType, setMethodType] = useState(methodToEdit?.type || 'credit_card');
  const [formData, setFormData] = useState({
    name: methodToEdit?.name || '',
    last4: methodToEdit?.last4 || '',
    expiryDate: methodToEdit?.expiryDate || '',
    email: methodToEdit?.email || '',
    isDefault: methodToEdit?.isDefault || false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const methodData = {
        type: methodType,
        ...formData,
        brand: methodType === 'credit_card' ? 'visa' : 
               methodType === 'bank_transfer' ? 'bank' :
               methodType === 'paypal' ? 'paypal' : 'other'
      };
      
      if (methodToEdit) {
        await updatePaymentMethod(methodToEdit.id, methodData);
      } else {
        await addPaymentMethod(methodData);
      }
      
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving payment method:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setMethodType('credit_card');
    setFormData({
      name: '',
      last4: '',
      expiryDate: '',
      email: '',
      isDefault: false
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const methodTypes = [
    { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
    { id: 'bank_transfer', label: 'Bank Transfer', icon: Building },
    { id: 'paypal', label: 'PayPal', icon: Wallet },
    { id: 'mobile_money', label: 'Mobile Money', icon: Smartphone }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={handleClose}
        >
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-500'} opacity-75`}></div>
        </div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {methodToEdit ? 'Edit Payment Method' : 'Add Payment Method'}
              </h3>
              <button
                onClick={handleClose}
                className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4">
              {/* Method Type Selection */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Payment Method Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {methodTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setMethodType(type.id)}
                        className={`flex flex-col items-center p-3 border rounded-lg transition-all ${
                          methodType === type.id
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : isDarkMode
                              ? 'border-gray-700 hover:bg-gray-700'
                              : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${
                          methodType === type.id 
                            ? 'text-primary-600 dark:text-primary-400' 
                            : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          methodType === type.id 
                            ? 'text-primary-600 dark:text-primary-400' 
                            : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {methodType === 'credit_card' ? 'Cardholder Name' : 'Account Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Last 4 Digits / Account Number */}
                {methodType === 'credit_card' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Card Number (Last 4 Digits)
                    </label>
                    <input
                      type="text"
                      value={formData.last4}
                      onChange={(e) => setFormData({ ...formData, last4: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                      }`}
                      placeholder="4242"
                      maxLength={4}
                      required
                    />
                  </div>
                )}

                {methodType === 'bank_transfer' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Account Number (Last 4 Digits)
                    </label>
                    <input
                      type="text"
                      value={formData.last4}
                      onChange={(e) => setFormData({ ...formData, last4: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                      }`}
                      placeholder="1234"
                      maxLength={4}
                      required
                    />
                  </div>
                )}

                {/* Expiry Date (Credit Card only) */}
                {methodType === 'credit_card' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Expiry Date (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={formData.expiryDate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          let formatted = value;
                          if (value.length > 2) {
                            formatted = value.slice(0, 2) + '/' + value.slice(2);
                          }
                          setFormData({ ...formData, expiryDate: formatted });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                      }`}
                      placeholder="12/25"
                      maxLength={5}
                      required
                    />
                  </div>
                )}

                {/* Email (PayPal only) */}
                {methodType === 'paypal' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      PayPal Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                      }`}
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                )}

                {/* Set as Default */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className={`h-4 w-4 text-primary-600 focus:ring-primary-500 rounded ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}
                  />
                  <label htmlFor="isDefault" className={`ml-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Set as default payment method
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : methodToEdit ? 'Update Method' : 'Add Method'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;