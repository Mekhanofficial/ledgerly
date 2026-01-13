// src/components/payments/PaymentProcessingModal.js
import React, { useState, useEffect } from 'react';
import { X, CreditCard, Building, Wallet, Smartphone, CheckCircle, Loader } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePayments } from '../../context/PaymentContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useToast } from '../../context/ToastContext';

const PaymentProcessingModal = ({ isOpen, onClose, invoice = null }) => {
  const { isDarkMode } = useTheme();
  const { paymentMethods, processPayment } = usePayments();
  const { invoices } = useInvoice();
  const { addToast } = useToast();
  
  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('selection');
  const [processingError, setProcessingError] = useState('');

  useEffect(() => {
    if (invoice) {
      const inv = invoices.find(i => i.id === invoice.id) || invoice;
      setAmount(inv.totalAmount || inv.amount || 0);
      
      // Set default payment method
      const defaultMethod = paymentMethods.find(m => m.isDefault);
      if (defaultMethod) {
        setSelectedMethod(defaultMethod.id);
      }
    }
  }, [invoice, invoices, paymentMethods]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMethod) {
      addToast('Please select a payment method', 'error');
      return;
    }

    if (!invoice) {
      addToast('Invoice not found', 'error');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('processing');
    setProcessingError('');

    try {
      await processPayment({
        invoiceId: invoice.id,
        amount,
        paymentMethodId: selectedMethod,
        customerId: invoice.customerId,
        notes
      });
      
      setProcessingStep('success');
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
      
    } catch (error) {
      setProcessingStep('error');
      setProcessingError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedMethod('');
    setAmount(0);
    setNotes('');
    setIsProcessing(false);
    setProcessingStep('selection');
    setProcessingError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getMethodIcon = (method) => {
    switch (method.type) {
      case 'credit_card': return CreditCard;
      case 'bank_transfer': return Building;
      case 'paypal': return Wallet;
      case 'mobile_money': return Smartphone;
      default: return CreditCard;
    }
  };

  const getMethodLabel = (method) => {
    switch (method.type) {
      case 'credit_card': return `Credit Card •••• ${method.last4}`;
      case 'bank_transfer': return `Bank Account •••• ${method.last4}`;
      case 'paypal': return `PayPal (${method.email})`;
      case 'mobile_money': return 'Mobile Money';
      default: return method.name;
    }
  };

  const selectedInvoice = invoice || invoices[0];

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
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Process Payment
              </h3>
              <button
                onClick={handleClose}
                className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                disabled={isProcessing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {processingStep === 'selection' && (
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4">
                {/* Invoice Details */}
                {selectedInvoice && (
                  <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedInvoice.number || selectedInvoice.invoiceNumber}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {selectedInvoice.customer}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${(selectedInvoice.totalAmount || selectedInvoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Total due
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Amount */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      className={`w-full pl-8 pr-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                      }`}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Payment Method
                  </label>
                  <div className="space-y-2">
                    {paymentMethods.length === 0 ? (
                      <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No payment methods available. Please add one first.
                      </div>
                    ) : (
                      paymentMethods.map((method) => {
                        const Icon = getMethodIcon(method);
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setSelectedMethod(method.id)}
                            className={`w-full flex items-center p-3 border rounded-lg transition-all ${
                              selectedMethod === method.id
                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                : isDarkMode
                                  ? 'border-gray-700 hover:bg-gray-700'
                                  : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className={`w-5 h-5 mr-3 ${
                              selectedMethod === method.id 
                                ? 'text-primary-600 dark:text-primary-400' 
                                : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            <div className="flex-1 text-left">
                              <div className={`font-medium ${
                                selectedMethod === method.id 
                                  ? 'text-primary-600 dark:text-primary-400' 
                                  : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {getMethodLabel(method)}
                              </div>
                              {method.isDefault && (
                                <div className="text-xs text-gray-500">Default</div>
                              )}
                            </div>
                            {selectedMethod === method.id && (
                              <CheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Add any notes about this payment..."
                  />
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
                    disabled={!selectedMethod || isProcessing}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Process Payment'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {processingStep === 'processing' && (
            <div className="px-6 py-8 text-center">
              <Loader className="w-12 h-12 mx-auto mb-4 text-primary-600 dark:text-primary-400 animate-spin" />
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Processing Payment...
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Please wait while we process your payment
              </p>
            </div>
          )}

          {processingStep === 'success' && (
            <div className="px-6 py-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Payment Successful!
              </h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Payment of ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been processed successfully.
              </p>
              <div className={`text-xs p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                You will be redirected shortly...
              </div>
            </div>
          )}

          {processingStep === 'error' && (
            <div className="px-6 py-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <X className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Payment Failed
              </h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {processingError || 'An error occurred while processing your payment.'}
              </p>
              <button
                onClick={() => setProcessingStep('selection')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessingModal;