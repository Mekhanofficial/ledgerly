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
import { generateReceiptPDF, getReceiptTemplatePreference, setReceiptTemplatePreference } from '../../utils/receiptPdfGenerator';
import { useAccount } from '../../context/AccountContext';
import { hasTemplateAccess } from '../../utils/templateStorage';
import { formatCurrency } from '../../utils/currency';
import { emailReceipt as emailReceiptService } from '../../services/receiptService';

const Receipts = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const { addNotification } = useNotifications();
  const { recordTransaction, paymentMethods, receipts, refreshReceipts } = usePayments();
  const { customers, getAvailableTemplates } = useInvoice();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  const formatMoney = (value, currencyCode) => formatCurrency(value, currencyCode || baseCurrency);
  
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
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const resolveTemplateAccess = (template) => {
    if (typeof template?.hasAccess === 'boolean') {
      return template.hasAccess;
    }
    if (!template?.id) {
      return false;
    }
    return hasTemplateAccess(template.id);
  };

  // Load receipts on component mount
  useEffect(() => {
    refreshReceipts();
  }, [refreshReceipts]);

  useEffect(() => {
    if (!getAvailableTemplates) return;
    const templates = getAvailableTemplates() || [];
    const accessibleTemplates = templates.filter(t => resolveTemplateAccess(t));
    const templatesToUse = accessibleTemplates.length > 0 ? accessibleTemplates : templates;
    setAvailableTemplates(templatesToUse);

    const savedTemplateId = getReceiptTemplatePreference();
    const resolvedTemplate = templatesToUse.find(t => t.id === savedTemplateId)
      || templatesToUse.find(t => t.isDefault)
      || templatesToUse.find(t => t.id === 'standard')
      || templatesToUse[0];

    const fallbackTemplate = templatesToUse.find(t => t.id === 'standard')
      || templatesToUse.find(t => resolveTemplateAccess(t))
      || templatesToUse[0];

    const finalTemplate = resolvedTemplate || fallbackTemplate;

    if (finalTemplate?.id) {
      setSelectedTemplateId(finalTemplate.id);
    }
  }, [getAvailableTemplates]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Changed from 1024 to 768 for better mobile detection
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

  const sendReceiptEmail = async (receiptData, fallbackEmail = '') => {
    const receiptId = receiptData?.recordId || receiptData?.metadata?._id || receiptData?.id;
    if (!receiptId) {
      throw new Error('Unable to send receipt email: missing receipt reference');
    }
    const resolvedEmail = String(fallbackEmail || receiptData?.customerEmail || '').trim();
    const payload = resolvedEmail ? { customerEmail: resolvedEmail } : {};
    const response = await emailReceiptService(receiptId, payload);
    return response;
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

  const handleSelectTemplate = (templateId) => {
    const template = availableTemplates.find(t => t.id === templateId);
    if (template && !resolveTemplateAccess(template)) {
      const requiredPlan = template.requiredPlan ? `Upgrade to ${template.requiredPlan}` : 'Upgrade your plan';
      addToast(`"${template.name}" is locked. ${requiredPlan} or purchase to use it.`, 'warning');
      return;
    }
    setSelectedTemplateId(templateId);
    setReceiptTemplatePreference(templateId);
    if (template?.name) {
      addToast(`Receipt template set to ${template.name}`, 'success');
    }
  };

  const handlePrintReceipt = async () => {
    if (cartItems.length === 0) {
      addToast('Add items to cart before printing receipt', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const { subtotal, tax, total } = calculateTotals();

      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedPaymentMethodId);
      const paymentDetails = selectedPaymentMethod
        ? `${selectedPaymentMethod.type} ending in ${selectedPaymentMethod.last4 || 'N/A'}`
        : 'Cash';

      const receiptPayload = {
        customerId: selectedCustomerId || undefined,
        customerEmail: customerEmail || selectedCustomer?.email || '',
        customerName: customerName || selectedCustomer?.name || 'Walk-in Customer',
        items: [...cartItems],
        paymentMethod,
        amountPaid: total,
        subtotal,
        tax,
        notes,
        paymentReference: paymentDetails,
        templateStyle: selectedTemplateId
      };

      const createdReceipt = await recordTransaction({
        customerId: selectedCustomerId || 'walk-in',
        customerName: customerName || 'Walk-in Customer',
        amount: total,
        paymentMethod: paymentMethod.toLowerCase().replace(' ', '_'),
        status: 'completed',
        type: 'receipt',
        notes: notes || 'Point of Sale Receipt',
        metadata: {
          itemsCount: cartItems.length,
          subtotal,
          tax,
          total
        },
        receiptPayload
      });

      if (!createdReceipt) {
        throw new Error('Failed to create receipt');
      }

      const pdfDoc = generateReceiptPDF(createdReceipt, accountInfo, selectedTemplateId);
      pdfDoc.save(`${createdReceipt.id}.pdf`);

      addNotification({
        type: 'receipt',
        title: 'Receipt Generated',
        description: `Receipt #${createdReceipt.id} for ${createdReceipt.customerName || 'Walk-in Customer'}`,
        details: `Total: ${formatMoney(createdReceipt.total || total, baseCurrency)} | Payment: ${createdReceipt.paymentMethod || paymentMethod}`,
        time: 'Just now',
        action: 'View Receipt',
        color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        link: '#',
        icon: 'Receipt'
      }, { showToast: false });

      addToast(`Receipt printed successfully (${createdReceipt.id})`, 'success');
      
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
      const { subtotal, tax, total } = calculateTotals();

      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedPaymentMethodId);
      const paymentDetails = selectedPaymentMethod
        ? `${selectedPaymentMethod.type} ending in ${selectedPaymentMethod.last4 || 'N/A'}`
        : 'Cash';

      const receiptPayload = {
        customerId: selectedCustomerId || undefined,
        customerEmail: customerEmail || selectedCustomer?.email || '',
        customerName: customerName || selectedCustomer?.name || 'Walk-in Customer',
        items: [...cartItems],
        paymentMethod,
        amountPaid: total,
        subtotal,
        tax,
        notes,
        paymentReference: paymentDetails,
        templateStyle: selectedTemplateId
      };

      const createdReceipt = await recordTransaction({
        customerId: selectedCustomerId || 'walk-in',
        customerName: customerName || 'Walk-in Customer',
        amount: total,
        paymentMethod: paymentMethod.toLowerCase().replace(' ', '_'),
        status: 'completed',
        type: 'receipt',
        notes: notes || 'Point of Sale Receipt',
        metadata: {
          itemsCount: cartItems.length,
          subtotal,
          tax,
          total
        },
        receiptPayload
      });

      if (!createdReceipt) {
        throw new Error('Failed to create receipt');
      }

      const pdfDoc = generateReceiptPDF(createdReceipt, accountInfo, selectedTemplateId);
      pdfDoc.save(`${createdReceipt.id}.pdf`);
      const receiptCurrency = createdReceipt.currency || baseCurrency;
      const emailTo = customerEmail || selectedCustomer?.email || createdReceipt.customerEmail;
      await sendReceiptEmail(createdReceipt, emailTo);

      addNotification({
        type: 'receipt',
        title: 'Receipt Sent',
        description: `Receipt #${createdReceipt.id} sent to ${emailTo}`,
        details: `Total: ${formatMoney(createdReceipt.total || total, receiptCurrency)} | Payment: ${createdReceipt.paymentMethod || paymentMethod}`,
        time: 'Just now',
        action: 'View Receipt',
        color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        link: '#',
        icon: 'Receipt'
      });

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

  const handleEmailOnly = async () => {
    if (!customerEmail && !selectedCustomerId) {
      addToast('Please select a customer or enter email', 'warning');
      return;
    }

    if (cartItems.length === 0) {
      addToast('Add items to cart before sending email', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const { subtotal, tax, total } = calculateTotals();

      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedPaymentMethodId);
      const paymentDetails = selectedPaymentMethod
        ? `${selectedPaymentMethod.type} ending in ${selectedPaymentMethod.last4 || 'N/A'}`
        : 'Cash';

      const receiptPayload = {
        customerId: selectedCustomerId || undefined,
        customerEmail: customerEmail || selectedCustomer?.email || '',
        customerName: customerName || selectedCustomer?.name || 'Walk-in Customer',
        items: [...cartItems],
        paymentMethod,
        amountPaid: total,
        subtotal,
        tax,
        notes,
        paymentReference: paymentDetails,
        templateStyle: selectedTemplateId
      };

      const createdReceipt = await recordTransaction({
        customerId: selectedCustomerId || 'walk-in',
        customerName: customerName || 'Walk-in Customer',
        amount: total,
        paymentMethod: paymentMethod.toLowerCase().replace(' ', '_'),
        status: 'completed',
        type: 'receipt',
        notes: notes || 'Point of Sale Receipt',
        metadata: {
          itemsCount: cartItems.length,
          subtotal,
          tax,
          total
        },
        receiptPayload
      });

      if (!createdReceipt) {
        throw new Error('Failed to create receipt');
      }

      const receiptCurrency = createdReceipt.currency || baseCurrency;
      const emailTo = customerEmail || selectedCustomer?.email || createdReceipt.customerEmail;
      await sendReceiptEmail(createdReceipt, emailTo);
      addNotification({
        type: 'receipt',
        title: 'Receipt Emailed',
        description: `Receipt #${createdReceipt.id} emailed to ${emailTo}`,
        details: `Total: ${formatMoney(createdReceipt.total || total, receiptCurrency)} | Payment: ${createdReceipt.paymentMethod || paymentMethod}`,
        time: 'Just now',
        action: 'View Receipt',
        color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
        link: '#',
        icon: 'Receipt'
      }, { showToast: false });
      addToast(`Receipt sent to ${emailTo} successfully!`, 'success');
    } catch (error) {
      addToast('Error sending receipt email: ' + error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefreshHistory = async () => {
    await refreshReceipts();
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

  const cartSummary = calculateTotals();
  const selectedCustomer = getSelectedCustomer();
  const selectedStoredPaymentMethod = getSelectedPaymentMethod();
  const paymentLabel = selectedStoredPaymentMethod?.name || paymentMethod || 'Cash';
  const todayReceiptsCount = (receipts || []).filter((receipt) => {
    const timestamp = receipt?.savedAt || receipt?.createdAt || receipt?.date;
    if (!timestamp) return false;
    const receiptDate = new Date(timestamp);
    const now = new Date();
    return (
      receiptDate.getFullYear() === now.getFullYear() &&
      receiptDate.getMonth() === now.getMonth() &&
      receiptDate.getDate() === now.getDate()
    );
  }).length;

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="mx-auto max-w-[1800px] space-y-6 p-4 md:p-6">
          {/* Workspace Header */}
          <section className={`relative overflow-hidden rounded-2xl border ${
            isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
          }`}>
            <div className="pointer-events-none absolute inset-0 opacity-70">
              <div className={`absolute -top-16 right-12 h-40 w-40 rounded-full blur-3xl ${
                isDarkMode ? 'bg-primary-500/20' : 'bg-primary-200/60'
              }`} />
              <div className={`absolute -bottom-12 left-8 h-32 w-32 rounded-full blur-2xl ${
                isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-100/80'
              }`} />
            </div>

            <div className="relative p-5 md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    <Receipt className="h-3.5 w-3.5" />
                    Point of Sale
                  </div>
                  <h1 className={`mt-3 text-2xl md:text-3xl font-semibold tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Receipts Workspace
                  </h1>
                  <p className={`mt-2 max-w-2xl text-sm md:text-base ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Add products fast, verify the order in a focused checkout panel, and issue polished receipts without fighting the layout.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleNewReceipt}
                    className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Receipt
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className={`rounded-xl border p-3 ${
                  isDarkMode ? 'border-gray-800 bg-gray-800/80' : 'border-gray-200 bg-gray-50'
                }`}>
                  <p className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cart Items</p>
                  <p className={`mt-1 text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cartItems.length}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)} total units
                  </p>
                </div>
                <div className={`rounded-xl border p-3 ${
                  isDarkMode ? 'border-gray-800 bg-gray-800/80' : 'border-gray-200 bg-gray-50'
                }`}>
                  <p className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Checkout Total</p>
                  <p className={`mt-1 text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatMoney(cartSummary.total, baseCurrency)}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {formatMoney(cartSummary.subtotal, baseCurrency)} subtotal + tax
                  </p>
                </div>
                <div className={`rounded-xl border p-3 ${
                  isDarkMode ? 'border-gray-800 bg-gray-800/80' : 'border-gray-200 bg-gray-50'
                }`}>
                  <p className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Customer</p>
                  <p className={`mt-1 truncate text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedCustomer?.name || customerName || 'Walk-in Customer'}
                  </p>
                  <p className={`truncate text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {selectedCustomer?.email || customerEmail || 'No email provided'}
                  </p>
                </div>
                <div className={`rounded-xl border p-3 ${
                  isDarkMode ? 'border-gray-800 bg-gray-800/80' : 'border-gray-200 bg-gray-50'
                }`}>
                  <p className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payment</p>
                  <p className={`mt-1 text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {paymentLabel}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {todayReceiptsCount} receipt{todayReceiptsCount === 1 ? '' : 's'} today
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Mobile Workspace Switcher */}
          {isMobile && (
            <div className={`rounded-2xl border p-2 ${
              isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
            }`}>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowMobileReceipt(false)}
                  className={`rounded-xl px-4 py-3 text-left transition ${
                    !showMobileReceipt
                      ? 'bg-primary-600 text-white shadow-sm'
                      : isDarkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider opacity-80">Catalog</div>
                  <div className="mt-1 text-sm font-semibold">Products</div>
                  <div className="text-xs opacity-80">{cartItems.length} in cart</div>
                </button>
                <button
                  onClick={() => setShowMobileReceipt(true)}
                  className={`rounded-xl px-4 py-3 text-left transition ${
                    showMobileReceipt
                      ? 'bg-primary-600 text-white shadow-sm'
                      : isDarkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider opacity-80">Checkout</div>
                  <div className="mt-1 text-sm font-semibold">Receipt</div>
                  <div className="text-xs opacity-80">{formatMoney(cartSummary.total, baseCurrency)}</div>
                </button>
              </div>
              {showMobileReceipt && (
                <button
                  onClick={() => setShowMobileReceipt(false)}
                  className={`mt-2 inline-flex items-center px-2 py-1 text-xs ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                  Back to product catalog
                </button>
              )}
            </div>
          )}

          {/* Main POS Workspace */}
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,0.95fr)]'}`}>
            <section className={`${isMobile && showMobileReceipt ? 'hidden' : 'block'}`}>
              <div className={`rounded-2xl border ${
                isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
              }`}>
                <div className={`flex flex-col gap-2 border-b px-5 py-4 md:flex-row md:items-center md:justify-between ${
                  isDarkMode ? 'border-gray-800' : 'border-gray-200'
                }`}>
                  <div>
                    <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Product Catalog
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Search inventory, compare stock status, and add items to the receipt.
                    </p>
                  </div>
                  <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    isDarkMode ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {cartItems.length} selected item{cartItems.length === 1 ? '' : 's'}
                  </div>
                </div>
                <div className="p-4 md:p-5">
                  <ProductGrid
                    onAddToCart={handleAddToCart}
                    cartItems={cartItems}
                  />
                </div>
              </div>
            </section>

            <section className={`${isMobile && !showMobileReceipt ? 'hidden' : 'block'}`}>
              <div className={`${isMobile ? '' : 'sticky top-24'} space-y-4`}>
                <div className={`rounded-2xl border px-5 py-4 ${
                  isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Checkout & Receipt
                      </h2>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Confirm customer, payment method, and issue the receipt.
                      </p>
                    </div>
                    <div className={`rounded-xl px-3 py-2 text-right ${
                      isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className={`text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Total</div>
                      <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatMoney(cartSummary.total, baseCurrency)}
                      </div>
                    </div>
                  </div>
                </div>

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
                  selectedCustomer={selectedCustomer}
                  customers={customers}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  selectedPaymentMethodId={selectedPaymentMethodId}
                  onSelectPaymentMethod={() => setShowPaymentMethodModal(true)}
                  selectedPaymentMethod={selectedStoredPaymentMethod}
                  paymentMethods={paymentMethods}
                  notes={notes}
                  setNotes={setNotes}
                  isProcessing={isProcessing}
                  availableTemplates={availableTemplates}
                  selectedTemplateId={selectedTemplateId}
                  onSelectTemplate={handleSelectTemplate}
                />
              </div>
            </section>
          </div>

          {/* History */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Receipt Activity
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Reprint, resend, or review recent receipts from the same workspace.
                </p>
              </div>
            </div>
            <ReceiptHistory
              receipts={receipts}
              onRefresh={handleRefreshHistory}
              onReceiptDeleted={refreshReceipts}
              defaultTemplateId={selectedTemplateId}
            />
          </section>
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
                  {formatMoney(calculateTotals().total, baseCurrency)}
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
