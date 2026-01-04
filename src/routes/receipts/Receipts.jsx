import React, { useState, useEffect } from 'react';
import { Receipt, Plus, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import ProductGrid from '../../components/receipts/ProductGrid';
import ReceiptHistory from '../../components/receipts/ReceiptHistory';
import { useTheme } from '../../context/ThemeContext';
import ReceiptPreview from '../../components/receipts/ReceiptPreview';

const Receipts = () => {
  const { isDarkMode } = useTheme();
  const [cartItems, setCartItems] = useState([
    {
      id: 'SUL WH-001',
      name: 'Wireless Headphones',
      price: 79.99,
      quantity: 1
    },
    {
      id: 'SUL UH-002',
      name: 'Leather Notebook',
      price: 24.99,
      quantity: 2
    }
  ]);

  const [showMobileReceipt, setShowMobileReceipt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
    
    if (isMobile) {
      setShowMobileReceipt(true);
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(prev => prev.filter(item => item.id !== productId));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const handleClearAll = () => {
    setCartItems([]);
  };

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="space-y-6 p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Generate Receipt
              </h1>
              <p className={`mt-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Create and manage customer receipts
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button className={`flex items-center px-4 py-2 border rounded-lg ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}>
                <Receipt className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Receipt History</span>
                <span className="md:hidden">History</span>
              </button>
              <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">New Receipt</span>
                <span className="md:hidden">New</span>
              </button>
            </div>
          </div>

          {/* Mobile Toggle for Receipt Preview */}
          {isMobile && (
            <div className="lg:hidden">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {showMobileReceipt ? 'Receipt Preview' : 'Select Products'}
                </h2>
                {showMobileReceipt && (
                  <button
                    onClick={() => setShowMobileReceipt(false)}
                    className={`flex items-center px-3 py-2 text-sm ${
                      isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Products
                  </button>
                )}
              </div>
              
              <div className="mb-4">
                <div className={`flex border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <button
                    onClick={() => setShowMobileReceipt(false)}
                    className={`flex-1 py-3 text-center font-medium ${
                      !showMobileReceipt
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : isDarkMode
                          ? 'text-gray-500 hover:text-gray-400'
                          : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Products ({cartItems.length})
                  </button>
                  <button
                    onClick={() => setShowMobileReceipt(true)}
                    className={`flex-1 py-3 text-center font-medium ${
                      showMobileReceipt
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : isDarkMode
                          ? 'text-gray-500 hover:text-gray-400'
                          : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Receipt
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area - Responsive Layout */}
          <div className={`${isMobile ? 'block' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'}`}>
            {/* Left Column - Products (Hidden on mobile when showing receipt) */}
            <div className={`
              ${isMobile && showMobileReceipt ? 'hidden' : 'block'}
              ${!isMobile ? 'h-[calc(100vh-250px)] overflow-y-auto' : ''}
            `}>
              <div className="hidden lg:block mb-4">
                <h2 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Select Products
                </h2>
              </div>
              <div className={`
                ${!isMobile ? 'h-[calc(100vh-300px)]' : ''}
                ${!isMobile ? 'overflow-y-auto pr-2' : ''}
              `}>
                <ProductGrid onAddToCart={handleAddToCart} />
              </div>
            </div>

            {/* Right Column - Receipt Preview */}
            <div className={`
              ${isMobile && !showMobileReceipt ? 'hidden' : 'block'}
              ${!isMobile ? 'h-[calc(100vh-250px)]' : ''}
            `}>
              {!isMobile && (
                <div className="mb-4">
                  <h2 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Receipt Preview
                  </h2>
                </div>
              )}
              <div className={`
                ${!isMobile ? 'h-[calc(100vh-300px)] overflow-y-auto' : ''}
                sticky top-6
              `}>
                <ReceiptPreview
                  items={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onClearAll={handleClearAll}
                />
              </div>
            </div>
          </div>

          {/* Receipt History - Always visible but with responsive height */}
          <div className="mt-6">
            <div className="mb-4">
              <h2 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Recent Receipts
              </h2>
            </div>
            <div className={`
              ${!isMobile ? 'max-h-[400px] overflow-y-auto' : ''}
            `}>
              <ReceiptHistory />
            </div>
          </div>
        </div>

        {/* Mobile Floating Cart Button */}
        {isMobile && !showMobileReceipt && cartItems.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setShowMobileReceipt(true)}
              className="flex items-center px-4 py-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 shadow-black/20"
            >
              <Receipt className="w-5 h-5 mr-2" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">View Receipt</span>
                <span className="text-xs opacity-90">
                  ${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                  <span className="ml-1">({cartItems.length} items)</span>
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Receipts;