import React from 'react';
import { Printer, Mail, Trash2, Plus, Minus, CreditCard, Wallet, Smartphone, User, ShoppingCart } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import PaymentMethodDisplay from './PaymentMethodDisplay';

const ReceiptPreview = ({ 
  items, 
  onUpdateQuantity, 
  onClearAll,
  onPrint,
  onPrintAndEmail,
  onEmailOnly,
  customerEmail,
  setCustomerEmail,
  customerName,
  setCustomerName,
  selectedCustomerId,
  onSelectCustomer,
  selectedCustomer,
  customers,
  paymentMethod,
  setPaymentMethod,
  selectedPaymentMethodId,
  onSelectPaymentMethod,
  selectedPaymentMethod,
  paymentMethods,
  notes,
  setNotes,
  isProcessing
}) => {
  const { isDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.085;
  const total = subtotal + tax;

  // Check if mobile
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get payment method details
  const getPaymentMethodDetails = () => {
    if (selectedPaymentMethod) {
      if (selectedPaymentMethod.type === 'credit_card') {
        return `•••• ${selectedPaymentMethod.last4 || '1234'}`;
      } else if (selectedPaymentMethod.type === 'paypal') {
        return selectedPaymentMethod.email || 'paypal@example.com';
      }
    }
    return paymentMethod === 'Card' ? 'Card payment' : 'Cash payment';
  };

  return (
    <div className={`border rounded-xl p-4 sm:p-6 h-full flex flex-col ${isDarkMode 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-gray-200'
    }`}>
      {/* Collapsible Header for Mobile */}
      {isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center justify-between w-full p-3 rounded-lg mb-3 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}
        >
          <div className="flex items-center">
            <ShoppingCart className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            <div className="text-left">
              <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Receipt Preview
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {items.length} items • ${total.toFixed(2)}
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-4 sm:mb-6">
        <div className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Legends
        </div>
        <div className={`text-xs sm:text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          123 Business Street<br />
          City, State 12345<br />
          Tel: (555) 123-4567
        </div>
      </div>

      {/* Customer and Payment Method Summary */}
      <div className={`mb-4 p-3 sm:p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-blue-50/30'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Customer Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Customer
              </div>
              <button
                onClick={onSelectCustomer}
                disabled={isProcessing}
                className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {selectedCustomerId ? 'Change' : 'Select'}
              </button>
            </div>
            
            {selectedCustomerId ? (
              <div className="flex items-center">
                <User className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <div>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedCustomer?.name || customerName}
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedCustomer?.email || customerEmail}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer Name"
                  className={`w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                  disabled={isProcessing}
                />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@email.com"
                  className={`w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                  disabled={isProcessing}
                />
              </div>
            )}
          </div>

          {/* Payment Method Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Payment Method
              </div>
              <button
                onClick={onSelectPaymentMethod}
                disabled={isProcessing}
                className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {selectedPaymentMethodId ? 'Change' : 'Select'}
              </button>
            </div>
            
            {selectedPaymentMethodId ? (
              <div className="flex items-center">
                <PaymentMethodDisplay 
                  method={selectedPaymentMethod?.type || paymentMethod}
                  details={getPaymentMethodDetails()}
                  isDarkMode={isDarkMode}
                  compact={false}
                />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {['Cash', 'Card', 'Mobile Money'].map((method) => {
                  const Icon = method === 'Cash' ? Wallet : method === 'Card' ? CreditCard : Smartphone;
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      disabled={isProcessing}
                      className={`flex flex-col items-center py-2 border rounded-lg transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : isDarkMode
                            ? 'border-gray-600 text-gray-300 hover:border-primary-500 hover:bg-primary-900/20'
                            : 'border-gray-300 text-gray-700 hover:border-primary-500 hover:bg-primary-50'
                      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-xs">{method}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Info */}
      <div className={`flex justify-between text-xs sm:text-sm mb-4 sm:mb-6 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <div>
          <div>Receipt #:</div>
          <div className={`font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            RCP-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}
          </div>
        </div>
        <div className="text-right">
          <div>Date & Time:</div>
          <div className={`font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>
      </div>

      {/* Items List - Scrollable */}
      <div className="flex-1 overflow-y-auto mb-4">
        <div className={`border-t border-b py-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`text-sm font-medium mb-2 flex justify-between items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            <span>Selected Items ({items.length})</span>
            {items.length > 0 && (
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ${subtotal.toFixed(2)} subtotal
              </span>
            )}
          </div>
          {items.length === 0 ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No items added to receipt
              <div className="text-xs sm:text-sm mt-2">
                Add products from the left panel
              </div>
            </div>
          ) : (
            <div className="space-y-3 pr-2">
              {items.map((item) => (
                <div key={item.id} className={`flex items-center justify-between py-3 border-b last:border-0 ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <div className="flex-1 min-w-0 mr-2">
                    <div className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ${item.price.toFixed(2)} each • SKU: {item.sku || item.id}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className={`p-1 rounded transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                        }`}
                        disabled={isProcessing}
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <span className={`font-medium min-w-[20px] text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    <div className={`font-medium text-right w-14 sm:w-20 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Totals */}
      <div className="py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between py-2">
          <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Subtotal:</span>
          <span className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tax (8.5%):</span>
          <span className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${tax.toFixed(2)}
          </span>
        </div>
        <div className={`flex justify-between py-2 border-t mt-2 pt-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <span className={`font-bold text-lg sm:text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Total:
          </span>
          <span className={`font-bold text-lg sm:text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          Notes (Optional)
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes..."
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-20 resize-none text-sm ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'border-gray-300'
          }`}
          disabled={isProcessing}
        />
      </div>

      {/* Action Buttons */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 md:grid-cols-4 gap-3'}`}>
        <button 
          onClick={onPrintAndEmail}
          disabled={isProcessing || items.length === 0 || (!customerEmail && !selectedCustomerId)}
          className="flex items-center justify-center py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          <Printer className="w-4 h-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Print & Email'}
        </button>
        
        <button 
          onClick={onPrint}
          disabled={isProcessing || items.length === 0}
          className={`flex items-center justify-center py-2.5 sm:py-3 border rounded-lg transition-colors text-sm sm:text-base ${
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
          disabled={isProcessing || items.length === 0 || (!customerEmail && !selectedCustomerId)}
          className={`flex items-center justify-center py-2.5 sm:py-3 border rounded-lg transition-colors text-sm sm:text-base ${
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
          className={`flex items-center justify-center py-2.5 sm:py-3 border rounded-lg transition-colors text-sm sm:text-base ${
            isDarkMode
              ? 'border-gray-600 text-red-400 hover:bg-red-900/20'
              : 'border-gray-300 text-red-600 hover:bg-red-50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </button>
      </div>
    </div>
  );
};

export default ReceiptPreview;