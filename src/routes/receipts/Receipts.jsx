// src/pages/receipts/Receipts.js - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { Receipt, Plus, ArrowLeft, CreditCard, User, Wallet, Smartphone } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import ProductGrid from '../../components/receipts/ProductGrid';
import ReceiptHistory from '../../components/receipts/ReceiptHistory';
import ReceiptPreview from '../../components/receipts/ReceiptPreview';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationContext';
import { usePayments } from '../../context/PaymentContext';
import { useInvoice } from '../../context/InvoiceContext';
import { generateReceiptPDF } from '../../utils/receiptPdfGenerator';
import { useAccount } from '../../context/AccountContext';

const Receipts = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const { addNotification } = useNotifications();
  const { recordTransaction, paymentMethods } = usePayments();
  const { customers } = useInvoice();
  const { accountInfo } = useAccount();
  
  const [cartItems, setCartItems] = useState([]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [showMobileReceipt, setShowMobileReceipt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);

  // Load receipts on component mount
  useEffect(() => {
    loadReceipts();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Changed from 1024 to 768 for better mobile detection
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadReceipts = () => {
    try {
      const savedReceipts = JSON.parse(localStorage.getItem('Ledgerly_receipts') || '[]');
      setReceipts(savedReceipts);
    } catch (error) {
      console.error('Error loading receipts:', error);
    }
  };

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
        return [...prev, { 
          id: product.id,
          name: product.name,
          price: product.price,
          sku: product.sku,
          quantity: 1 
        }];
      }
    });
    
    if (isMobile) {
      setShowMobileReceipt(true);
    }
    
    addToast(`${product.name} added to cart`, 'success');
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(prev => prev.filter(item => item.id !== productId));
      addToast('Item removed from cart', 'warning');
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
    if (cartItems.length === 0) {
      addToast('Cart is already empty', 'warning');
      return;
    }
    
    if (window.confirm('Clear all items from cart?')) {
      setCartItems([]);
      setCustomerEmail('');
      setCustomerName('');
      setSelectedCustomerId('');
      setSelectedPaymentMethodId('');
      setPaymentMethod('Cash');
      addToast('Cart cleared', 'success');
    }
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.085; // 8.5% tax
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const saveReceiptToHistory = (receiptData) => {
    try {
      const receipts = JSON.parse(localStorage.getItem('Ledgerly_receipts') || '[]');
      const newReceipt = {
        ...receiptData,
        savedAt: new Date().toISOString(),
        status: 'completed'
      };
      
      receipts.unshift(newReceipt);
      const updatedReceipts = receipts.slice(0, 50);
      localStorage.setItem('Ledgerly_receipts', JSON.stringify(updatedReceipts));
      
      setReceipts(updatedReceipts);
      
      window.dispatchEvent(new CustomEvent('receiptsUpdated'));
      
      return true;
    } catch (error) {
      console.error('Error saving receipt:', error);
      return false;
    }
  };

  const handleSelectCustomer = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomerId(customerId);
      setCustomerName(customer.name);
      setCustomerEmail(customer.email || '');
      setShowCustomerModal(false);
      addToast(`Customer ${customer.name} selected`, 'success');
    }
  };

  const handleSelectPaymentMethod = (methodId) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method) {
      setSelectedPaymentMethodId(methodId);
      setPaymentMethod(method.name || method.type);
      setShowPaymentMethodModal(false);
      addToast(`Payment method ${method.name || method.type} selected`, 'success');
    }
  };

  const handlePrintReceipt = async () => {
    if (cartItems.length === 0) {
      addToast('Add items to cart before printing receipt', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const receiptId = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { subtotal, tax, total } = calculateTotals();
      
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedPaymentMethodId);
      
      const receiptData = {
        id: receiptId,
        date: new Date().toLocaleString(),
        items: [...cartItems],
        subtotal,
        tax,
        total,
        customerName: customerName || (selectedCustomer?.name || 'Walk-in Customer'),
        customerEmail: customerEmail || (selectedCustomer?.email || ''),
        customerId: selectedCustomerId,
        paymentMethod: paymentMethod,
        paymentMethodId: selectedPaymentMethodId,
        paymentMethodDetails: selectedPaymentMethod ? 
          `${selectedPaymentMethod.type} ending in ${selectedPaymentMethod.last4 || 'N/A'}` : 
          'Cash',
        notes
      };

      // Save to receipt history
      const saved = saveReceiptToHistory(receiptData);
      
      if (!saved) {
        throw new Error('Failed to save receipt');
      }

      // Record transaction in PaymentContext
      await recordTransaction({
        id: `txn_${receiptId}`,
        invoiceId: receiptId,
        invoiceNumber: receiptId,
        customerId: selectedCustomerId || 'walk-in',
        customerName: customerName || 'Walk-in Customer',
        amount: total,
        paymentMethod: paymentMethod.toLowerCase().replace(' ', '_'),
        paymentMethodDetails: selectedPaymentMethod ? 
          `${selectedPaymentMethod.type} ending in ${selectedPaymentMethod.last4}` : 
          'Cash',
        paymentMethodId: selectedPaymentMethodId,
        status: 'completed',
        type: 'receipt',
        notes: notes || 'Point of Sale Receipt',
        metadata: {
          itemsCount: cartItems.length,
          subtotal,
          tax,
          total,
          receiptId
        },
        receiptPayload: receiptData
      });

      // Generate PDF
      const pdfDoc = generateReceiptPDF(receiptData, accountInfo);
      
      // Save PDF locally
      pdfDoc.save(`${receiptData.id}.pdf`);
      
      // Add notification
      addNotification({
        type: 'receipt',
        title: 'Receipt Generated',
        description: `Receipt #${receiptId} for ${customerName || 'Walk-in Customer'}`,
        details: `Total: $${total.toFixed(2)} | Payment: ${paymentMethod}`,
        time: 'Just now',
        action: 'View Receipt',
        color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        link: '#',
        icon: 'Receipt'
      }, { showToast: false });
      
      addToast(`Receipt printed successfully (${receiptData.id})`, 'success');
      
      // Clear cart after successful print
      setCartItems([]);
      setCustomerEmail('');
      setCustomerName('');
      setSelectedCustomerId('');
      setSelectedPaymentMethodId('');
      setPaymentMethod('Cash');
      setNotes('');
      
    } catch (error) {
      addToast('Error printing receipt: ' + error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintAndEmail = async () => {
    if (cartItems.length === 0) {
      addToast('Add items to cart before sending receipt', 'warning');
      return;
    }

    if (!customerEmail && !selectedCustomerId) {
      addToast('Please select a customer or enter email to send receipt', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const receiptId = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { subtotal, tax, total } = calculateTotals();
      
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedPaymentMethodId);
      
      const receiptData = {
        id: receiptId,
        date: new Date().toLocaleString(),
        items: [...cartItems],
        subtotal,
        tax,
        total,
        customerName: customerName || (selectedCustomer?.name || 'Walk-in Customer'),
        customerEmail: customerEmail || (selectedCustomer?.email || ''),
        customerId: selectedCustomerId,
        paymentMethod: paymentMethod,
        paymentMethodId: selectedPaymentMethodId,
        paymentMethodDetails: selectedPaymentMethod ? 
          `${selectedPaymentMethod.type} ending in ${selectedPaymentMethod.last4 || 'N/A'}` : 
          'Cash',
        notes
      };

      // Save to receipt history
      const saved = saveReceiptToHistory(receiptData);
      
      if (!saved) {
        throw new Error('Failed to save receipt');
      }

      // Record transaction in PaymentContext
      await recordTransaction({
        id: `txn_${receiptId}`,
        invoiceId: receiptId,
        invoiceNumber: receiptId,
        customerId: selectedCustomerId || 'walk-in',
        customerName: customerName || 'Walk-in Customer',
        amount: total,
        paymentMethod: paymentMethod.toLowerCase().replace(' ', '_'),
        paymentMethodDetails: selectedPaymentMethod ? 
          `${selectedPaymentMethod.type} ending in ${selectedPaymentMethod.last4}` : 
          'Cash',
        paymentMethodId: selectedPaymentMethodId,
        status: 'completed',
        type: 'receipt',
        notes: notes || 'Point of Sale Receipt',
        metadata: {
          itemsCount: cartItems.length,
          subtotal,
          tax,
          total,
          receiptId
        },
        receiptPayload: receiptData
      });

      // Generate PDF
      const pdfDoc = generateReceiptPDF(receiptData, accountInfo);
      
      // Save PDF locally
      pdfDoc.save(`${receiptData.id}.pdf`);
      
      // Add notification
      addNotification({
        type: 'receipt',
        title: 'Receipt Sent',
        description: `Receipt #${receiptId} sent to ${customerEmail || selectedCustomer?.email}`,
        details: `Total: $${total.toFixed(2)} | Payment: ${paymentMethod}`,
        time: 'Just now',
        action: 'View Receipt',
        color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        link: '#',
        icon: 'Receipt'
      });

      // Create email body
      const emailBody = `
Thank you for your purchase!

Receipt Details:
Receipt #: ${receiptData.id}
Date: ${receiptData.date}
Customer: ${receiptData.customerName}
Payment Method: ${receiptData.paymentMethod}
${receiptData.paymentMethodDetails ? `Payment Details: ${receiptData.paymentMethodDetails}` : ''}

Items Purchased:
${cartItems.map(item => 
  `- ${item.name}: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

Subtotal: $${receiptData.subtotal.toFixed(2)}
Tax (8.5%): $${receiptData.tax.toFixed(2)}
Total: $${receiptData.total.toFixed(2)}

${notes ? `\nNotes: ${notes}` : ''}

Thank you for shopping with us!
      `;
      
      // Create mailto link
      const subject = encodeURIComponent(`Your Receipt ${receiptData.id} from Legends`);
      const body = encodeURIComponent(emailBody);
      const emailTo = customerEmail || selectedCustomer?.email;
      const mailtoLink = `mailto:${emailTo}?subject=${subject}&body=${body}`;
      
      // Open email client
      window.open(mailtoLink, '_blank');
      
      addToast(`Receipt sent to ${emailTo} successfully!`, 'success');
      
      // Clear cart after successful send
      setCartItems([]);
      setCustomerEmail('');
      setCustomerName('');
      setSelectedCustomerId('');
      setSelectedPaymentMethodId('');
      setPaymentMethod('Cash');
      setNotes('');
      
    } catch (error) {
      addToast('Error sending receipt: ' + error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailOnly = () => {
    if (!customerEmail && !selectedCustomerId) {
      addToast('Please select a customer or enter email', 'warning');
      return;
    }

    if (cartItems.length === 0) {
      addToast('Add items to cart before sending email', 'warning');
      return;
    }

    const receiptId = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const { subtotal, tax, total } = calculateTotals();
    
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedPaymentMethodId);
    
    const receiptData = {
      id: receiptId,
      date: new Date().toLocaleString(),
      items: [...cartItems],
      subtotal,
      tax,
      total,
      customerName: customerName || (selectedCustomer?.name || 'Walk-in Customer'),
      customerEmail: customerEmail || (selectedCustomer?.email || ''),
      customerId: selectedCustomerId,
      paymentMethod: paymentMethod,
      paymentMethodId: selectedPaymentMethodId,
      paymentMethodDetails: selectedPaymentMethod ? 
        `${selectedPaymentMethod.type} ending in ${selectedPaymentMethod.last4 || 'N/A'}` : 
        'Cash',
      notes,
      savedAt: new Date().toISOString(),
      status: 'completed'
    };

    // Save receipt to history
    saveReceiptToHistory(receiptData);

    // Record transaction in PaymentContext
    await recordTransaction({
      id: `txn_${receiptId}`,
      invoiceId: receiptId,
      invoiceNumber: receiptId,
      customerId: selectedCustomerId || 'walk-in',
      customerName: customerName || 'Walk-in Customer',
      amount: total,
      paymentMethod: paymentMethod.toLowerCase().replace(' ', '_'),
      paymentMethodDetails: selectedPaymentMethod ? 
        `${selectedPaymentMethod.type} ending in ${selectedPaymentMethod.last4}` : 
        'Cash',
      paymentMethodId: selectedPaymentMethodId,
      status: 'completed',
      type: 'receipt',
      notes: notes || 'Point of Sale Receipt',
      metadata: {
        itemsCount: cartItems.length,
        subtotal,
        tax,
        total,
        receiptId
      },
      receiptPayload: receiptData
    });

    // Add notification
    addNotification({
      type: 'receipt',
      title: 'Receipt Emailed',
      description: `Receipt #${receiptId} emailed to ${customerEmail || selectedCustomer?.email}`,
      details: `Total: $${total.toFixed(2)} | Payment: ${paymentMethod}`,
      time: 'Just now',
      action: 'View Receipt',
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      link: '#',
      icon: 'Receipt'
    }, { showToast: false });

    const emailBody = `
Thank you for your purchase!

Receipt Details:
Receipt #: ${receiptData.id}
Date: ${receiptData.date}
Customer: ${receiptData.customerName}
Payment Method: ${receiptData.paymentMethod}
${receiptData.paymentMethodDetails ? `Payment Details: ${receiptData.paymentMethodDetails}` : ''}

Items Purchased:
${cartItems.map(item => 
  `- ${item.name}: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

Subtotal: $${receiptData.subtotal.toFixed(2)}
Tax (8.5%): $${receiptData.tax.toFixed(2)}
Total: $${receiptData.total.toFixed(2)}

${notes ? `\nNotes: ${notes}` : ''}

Thank you for shopping with us!
    `;

    const subject = encodeURIComponent(`Your Receipt ${receiptData.id} from Legends`);
    const body = encodeURIComponent(emailBody);
    const emailTo = customerEmail || selectedCustomer?.email;
    const mailtoLink = `mailto:${emailTo}?subject=${subject}&body=${body}`;
    
    window.open(mailtoLink, '_blank');
    addToast('Email opened with receipt details', 'success');
  };

  const handleRefreshHistory = () => {
    loadReceipts();
    addToast('Receipt history refreshed', 'success');
  };

  const handleNewReceipt = () => {
    if (cartItems.length > 0) {
      if (window.confirm('Clear current cart and start new receipt?')) {
        setCartItems([]);
        setCustomerEmail('');
        setCustomerName('');
        setSelectedCustomerId('');
        setSelectedPaymentMethodId('');
        setPaymentMethod('Cash');
        setNotes('');
        addToast('New receipt started', 'info');
      }
    } else {
      addToast('New receipt started', 'info');
    }
  };

  const getSelectedPaymentMethod = () => {
    return paymentMethods.find(m => m.id === selectedPaymentMethodId);
  };

  const getSelectedCustomer = () => {
    return customers.find(c => c.id === selectedCustomerId);
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
              <button 
                onClick={handleNewReceipt}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
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
            {/* Left Column - Products */}
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
                <ProductGrid 
                  onAddToCart={handleAddToCart} 
                  cartItems={cartItems}
                />
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
                  onPrint={handlePrintReceipt}
                  onPrintAndEmail={handlePrintAndEmail}
                  onEmailOnly={handleEmailOnly}
                  customerEmail={customerEmail}
                  setCustomerEmail={setCustomerEmail}
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  selectedCustomerId={selectedCustomerId}
                  onSelectCustomer={() => setShowCustomerModal(true)}
                  selectedCustomer={getSelectedCustomer()}
                  customers={customers}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  selectedPaymentMethodId={selectedPaymentMethodId}
                  onSelectPaymentMethod={() => setShowPaymentMethodModal(true)}
                  selectedPaymentMethod={getSelectedPaymentMethod()}
                  paymentMethods={paymentMethods}
                  notes={notes}
                  setNotes={setNotes}
                  isProcessing={isProcessing}
                />
              </div>
            </div>
          </div>

          {/* Receipt History */}
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
              <ReceiptHistory 
                receipts={receipts}
                onRefresh={handleRefreshHistory}
                onReceiptDeleted={loadReceipts}
              />
            </div>
          </div>
        </div>

        {/* Customer Selection Modal */}
        {showCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Select Customer
              </h3>
              <div className="space-y-3 mb-4">
                {customers.map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer.id)}
                    className={`w-full text-left p-3 border rounded-lg transition-colors ${
                      selectedCustomerId === customer.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : isDarkMode
                          ? 'border-gray-700 hover:bg-gray-700'
                          : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <User className={`w-5 h-5 mr-3 ${
                        selectedCustomerId === customer.id
                          ? 'text-primary-600 dark:text-primary-400'
                          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <div>
                        <div className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {customer.name}
                        </div>
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setCustomerEmail('');
                    setCustomerName('');
                    setSelectedCustomerId('');
                    setShowCustomerModal(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method Selection Modal */}
        {showPaymentMethodModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Select Payment Method
              </h3>
              <div className="space-y-3 mb-4">
                <button
                  onClick={() => {
                    setSelectedPaymentMethodId('');
                    setPaymentMethod('Cash');
                    setShowPaymentMethodModal(false);
                  }}
                  className={`w-full text-left p-3 border rounded-lg transition-colors ${
                    !selectedPaymentMethodId
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : isDarkMode
                        ? 'border-gray-700 hover:bg-gray-700'
                        : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Wallet className={`w-5 h-5 mr-3 ${
                      !selectedPaymentMethodId
                        ? 'text-primary-600 dark:text-primary-400'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <div>
                      <div className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Cash
                      </div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Pay with cash
                      </div>
                    </div>
                  </div>
                </button>

                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => handleSelectPaymentMethod(method.id)}
                    className={`w-full text-left p-3 border rounded-lg transition-colors ${
                      selectedPaymentMethodId === method.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : isDarkMode
                          ? 'border-gray-700 hover:bg-gray-700'
                          : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      {method.type === 'credit_card' && <CreditCard className={`w-5 h-5 mr-3 ${
                        selectedPaymentMethodId === method.id
                          ? 'text-primary-600 dark:text-primary-400'
                          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />}
                      {method.type === 'paypal' && <Wallet className={`w-5 h-5 mr-3 ${
                        selectedPaymentMethodId === method.id
                          ? 'text-primary-600 dark:text-primary-400'
                          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />}
                      {method.type === 'mobile_money' && <Smartphone className={`w-5 h-5 mr-3 ${
                        selectedPaymentMethodId === method.id
                          ? 'text-primary-600 dark:text-primary-400'
                          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />}
                      <div>
                        <div className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {method.name}
                        </div>
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {method.type === 'credit_card' ? `•••• ${method.last4}` : 
                           method.type === 'paypal' ? method.email :
                           method.type}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPaymentMethodModal(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSelectedPaymentMethodId('');
                    setPaymentMethod('Cash');
                    setShowPaymentMethodModal(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

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
                  ${calculateTotals().total.toFixed(2)}
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
