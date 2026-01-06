// src/components/receipts/ReceiptPreview.js
import React from 'react';
import { Printer, Mail, Trash2, Plus, Minus, CreditCard, Wallet, Smartphone } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ReceiptPreview = ({ 
  items, 
  onUpdateQuantity, 
  onClearAll,
  onPrint,
  onPrintAndEmail,
  onEmailOnly,
  customerEmail,
  setCustomerEmail,
  notes,
  setNotes,
  paymentMethod,
  setPaymentMethod,
  isProcessing
}) => {
  const { isDarkMode } = useTheme();
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.085;
  const total = subtotal + tax;

  const paymentMethods = [
    { name: 'Cash', icon: Wallet, value: 'Cash' },
    { name: 'Card', icon: CreditCard, value: 'Card' },
    { name: 'Mobile Money', icon: Smartphone, value: 'Mobile Money' }
  ];

  return (
    <div className={`border rounded-xl p-6 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className={`text-2xl font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Legends
        </div>
        <div className={`text-sm mt-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          123 Business Street<br />
          City, State 12345<br />
          Tel: (555) 123-4567
        </div>
      </div>

      {/* Receipt Info */}
      <div className={`flex justify-between text-sm mb-6 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <div>
          <div>Receipt #:</div>
          <div className={`font-medium mt-1 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            RCP-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}
          </div>
        </div>
        <div className="text-right">
          <div>Date & Time:</div>
          <div className={`font-medium mt-1 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className={`border-t border-b py-4 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className={`text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-500'
        }`}>
          Selected Items ({items.length})
        </div>
        {items.length === 0 ? (
          <div className={`text-center py-8 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            No items added to receipt
            <div className="text-sm mt-2">
              Add products from the left panel
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className={`flex items-center justify-between py-3 border-b last:border-0 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-100'
            }`}>
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.name}
                </div>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  ${item.price.toFixed(2)} each • SKU: {item.sku || item.id}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                    className={`p-1 rounded transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                    disabled={isProcessing}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className={`font-medium min-w-[20px] text-center ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className={`p-1 rounded transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                    disabled={isProcessing}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className={`font-medium text-right w-20 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="py-4">
        <div className="flex justify-between py-2">
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Subtotal:</span>
          <span className={`font-medium ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Tax (8.5%):</span>
          <span className={`font-medium ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            ${tax.toFixed(2)}
          </span>
        </div>
        <div className={`flex justify-between py-2 border-t mt-2 pt-2 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <span className={`font-bold text-lg ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Total:
          </span>
          <span className={`font-bold text-lg ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <div className={`text-sm font-medium mb-3 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-500'
        }`}>
          Payment Method
        </div>
        <div className="grid grid-cols-3 gap-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = paymentMethod === method.value;
            return (
              <button
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                disabled={isProcessing}
                className={`flex flex-col items-center py-2 border rounded-lg transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:border-primary-500 hover:bg-primary-900/20'
                      : 'border-gray-300 text-gray-700 hover:border-primary-500 hover:bg-primary-50'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-sm">{method.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Email Input */}
      <div className="mb-6">
        <div className={`text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-500'
        }`}>
          Customer Email (Optional)
        </div>
        <input
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="customer@email.com"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'border-gray-300'
          }`}
          disabled={isProcessing}
        />
      </div>

      {/* Notes */}
      <div className="mb-6">
        <div className={`text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-500'
        }`}>
          Notes (Optional)
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes..."
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-20 resize-none ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'border-gray-300'
          }`}
          disabled={isProcessing}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <button 
          onClick={onPrintAndEmail}
          disabled={isProcessing || items.length === 0}
          className="flex items-center justify-center py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="w-4 h-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Print & Email'}
        </button>
        
        <button 
          onClick={onPrint}
          disabled={isProcessing || items.length === 0}
          className={`flex items-center justify-center py-2.5 border rounded-lg transition-colors ${
            isDarkMode
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Printer className="w-4 h-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Print Only'}
        </button>
        
        <button 
          onClick={onEmailOnly}
          disabled={isProcessing || items.length === 0 || !customerEmail}
          className={`flex items-center justify-center py-2.5 border rounded-lg transition-colors ${
            isDarkMode
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Mail className="w-4 h-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Email Only'}
        </button>
        
        <button 
          onClick={onClearAll}
          disabled={isProcessing || items.length === 0}
          className={`flex items-center justify-center py-2.5 border rounded-lg transition-colors ${
            isDarkMode
              ? 'border-gray-600 text-red-400 hover:bg-red-900/20'
              : 'border-gray-300 text-red-600 hover:bg-red-50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </button>
      </div>

      {/* Cart Summary */}
      {items.length > 0 && (
        <div className={`mt-4 text-center text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {items.length} item{items.length !== 1 ? 's' : ''} • Total: ${total.toFixed(2)}
        </div>
      )}
    </div>
  );
};

export default ReceiptPreview;