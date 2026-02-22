import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  CreditCard, 
  Wallet, 
  Smartphone, 
  Receipt, 
  ArrowLeft, 
  FileText, 
  User, 
  DollarSign,
  Calendar,
  Clock,
  Package,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useInvoice } from '../../context/InvoiceContext';
import { usePayments } from '../../context/PaymentContext';
import { useAccount } from '../../context/AccountContext';
import { generateReceiptPDF, getReceiptTemplatePreference } from '../../utils/receiptPdfGenerator';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';

const ProcessPayment = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const { invoices, customers, products, getInvoicesForPayment } = useInvoice();
  const { accountInfo } = useAccount();
  const { processPayment, paymentMethods, addPendingPayment, removePendingPayment } = usePayments();
  const baseCurrency = accountInfo?.currency || 'USD';
  const formatMoney = (value, currencyCode) => formatCurrency(value, currencyCode || baseCurrency);
  const resolveInvoiceCurrency = (invoice) => invoice?.currency || baseCurrency;
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const invoiceId = searchParams.get('invoice');
  
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState([]);

  useEffect(() => {
    // Load invoices that are ready for payment
    const pending = getInvoicesForPayment();
    setPendingInvoices(pending);
    
    // If an invoice ID is provided in URL, select it
    if (invoiceId) {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        setShowInvoiceDetails(true);
        loadInvoiceItems(invoice);
        addPendingPayment(invoiceId);
      }
    }
  }, [invoices, invoiceId, getInvoicesForPayment, addPendingPayment]);

  const loadInvoiceItems = (invoice) => {
    const items = invoice.lineItems || invoice.items || [];
    const enhancedItems = items.map(item => {
      // Try to find matching product in inventory
      const product = products.find(p => 
        p.name === item.description || 
        p.id === item.productId ||
        p.sku === item.sku
      );
      
      return {
        ...item,
        productId: product?.id,
        currentStock: product?.quantity,
        stockStatus: getStockStatus(product?.quantity),
        product: product
      };
    });
    
    setInvoiceItems(enhancedItems);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 10) return 'Low Stock';
    return 'In Stock';
  };

  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setNotes(invoice.notes || '');
    setShowInvoiceDetails(true);
    loadInvoiceItems(invoice);
    addPendingPayment(invoice.id);
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoice || !paymentMethodId) {
      addToast('Please select an invoice and payment method', 'error');
      return;
    }

    setProcessing(true);
    try {
      const paymentMethod = paymentMethods.find(m => m.id === paymentMethodId);
      const customer = customers.find(c => c.id === selectedInvoice.customerId);
      
      if (!customer) {
        throw new Error('Customer not found for this invoice');
      }

      // Process payment through PaymentContext
      const paymentResult = await processPayment({
        invoiceId: selectedInvoice.id,
        amount: selectedInvoice.totalAmount || selectedInvoice.amount,
        paymentMethodId: paymentMethodId,
        customerId: selectedInvoice.customerId,
        notes: notes,
        generateReceipt: true
      });

      // Generate receipt PDF
      if (paymentResult.receipt) {
        const receiptTemplateId = getReceiptTemplatePreference();
        const pdfDoc = generateReceiptPDF(paymentResult.receipt, accountInfo, receiptTemplateId);
        pdfDoc.save(`${paymentResult.receipt.id}.pdf`);
      }

      addToast(`Payment processed and receipt generated for ${customer.name}`, 'success');

      // Clear selection and navigate back
      setTimeout(() => {
        setSelectedInvoice(null);
        setPaymentMethodId('');
        setNotes('');
        setShowInvoiceDetails(false);
        setInvoiceItems([]);
        removePendingPayment(selectedInvoice.id);
        navigate('/payments');
      }, 1500);

    } catch (error) {
      addToast(`Payment failed: ${error.message}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleBack = () => {
    if (selectedInvoice) {
      removePendingPayment(selectedInvoice.id);
    }
    setSelectedInvoice(null);
    setShowInvoiceDetails(false);
    setInvoiceItems([]);
  };

  const getCustomerName = (invoice) => {
    if (invoice.customerId) {
      const customer = customers.find(c => c.id === invoice.customerId);
      return customer?.name || 'Unknown Customer';
    }
    return typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.name || 'Customer';
  };

  const getCustomerEmail = (invoice) => {
    if (invoice.customerId) {
      const customer = customers.find(c => c.id === invoice.customerId);
      return customer?.email || '';
    }
    return invoice.customerEmail || '';
  };

  const getTotalItems = (invoice) => {
    const items = invoice.lineItems || invoice.items || [];
    return items.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const getDefaultPaymentMethod = () => {
    return paymentMethods.find(m => m.isDefault) || paymentMethods[0];
  };

  const selectedCurrency = resolveInvoiceCurrency(selectedInvoice);
  const currencySymbol = getCurrencySymbol(selectedCurrency);

  return (
    <DashboardLayout>
      <div className={`min-h-screen p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {showInvoiceDetails ? 'Process Payment' : 'Pending Payments'}
              </h1>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {showInvoiceDetails 
                  ? 'Review and process payment for selected invoice'
                  : 'Select an invoice to process payment'
                }
              </p>
            </div>
            
            {showInvoiceDetails && (
              <button
                onClick={handleBack}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to List
              </button>
            )}
          </div>

          {!showInvoiceDetails ? (
            /* Invoice Selection View */
            <div className={`border rounded-xl overflow-hidden ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className={`px-6 py-4 border-b ${
                isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Invoices Ready for Payment ({pendingInvoices.length})
                  </h3>
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Total: {formatMoney(
                        pendingInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount), 0),
                        baseCurrency
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {pendingInvoices.length === 0 ? (
                <div className="p-8 text-center">
                  <div className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    No pending invoices
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    All invoices have been processed or no invoices are pending payment
                  </div>
                  <button
                    onClick={() => navigate('/invoices')}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Go to Invoices
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {pendingInvoices.map((invoice) => (
                    <div 
                      key={invoice.id}
                      className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                        selectedInvoice?.id === invoice.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                          : ''
                      }`}
                      onClick={() => handleSelectInvoice(invoice)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <FileText className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {invoice.invoiceNumber || invoice.number}
                                </h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  isDarkMode 
                                    ? 'bg-yellow-900/30 text-yellow-300' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  Pending Payment
                                </span>
                              </div>
                              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {formatMoney(invoice.totalAmount || invoice.amount, resolveInvoiceCurrency(invoice))}
                              </div>
                            </div>
                            
                            <div className="flex items-center mt-4 space-x-6">
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {getCustomerName(invoice)}
                                </span>
                              </div>
                              
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Due: {new Date(invoice.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <div className="flex items-center">
                                <Package className="w-4 h-4 mr-2 text-gray-400" />
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {getTotalItems(invoice)} items
                                </span>
                              </div>
                              
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {new Date(invoice.issueDate || invoice.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            {invoice.notes && (
                              <div className="mt-3">
                                <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {invoice.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Payment Processing View */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Invoice Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className={`border rounded-xl p-6 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Invoice Details
                      </h3>
                      <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        #{selectedInvoice.invoiceNumber || selectedInvoice.number}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatMoney(selectedInvoice.totalAmount || selectedInvoice.amount, selectedCurrency)}
                      </div>
                      <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total Amount
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-6">
                    <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Customer Information
                    </div>
                    <div className={`p-4 rounded-lg border ${
                      isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <User className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <div>
                            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {getCustomerName(selectedInvoice)}
                            </div>
                            <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {getCustomerEmail(selectedInvoice)}
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Customer ID: {selectedInvoice.customerId?.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Items */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Invoice Items ({invoiceItems.length})
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Stock levels shown from inventory
                      </div>
                    </div>
                    <div className={`border rounded-lg overflow-hidden ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <table className="min-w-full">
                        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                          <tr>
                            <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Description
                            </th>
                            <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Qty
                            </th>
                            <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Rate
                            </th>
                            <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Stock
                            </th>
                            <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {invoiceItems.map((item, index) => (
                            <tr key={index} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                              <td className="px-4 py-3">
                                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {item.description}
                                </div>
                                {item.sku && (
                                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    SKU: {item.sku}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {item.quantity || 1}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {formatMoney(item.rate || 0, selectedCurrency)}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                  item.stockStatus === 'Out of Stock' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    : item.stockStatus === 'Low Stock'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                }`}>
                                  {item.currentStock !== undefined ? `${item.currentStock} units` : 'N/A'}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {formatMoney((item.rate || 0) * (item.quantity || 1), selectedCurrency)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Invoice Totals */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Subtotal:</span>
                          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatMoney(selectedInvoice.subtotal ?? selectedInvoice.amount ?? 0, selectedCurrency)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Tax:</span>
                          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatMoney(selectedInvoice.tax || 0, selectedCurrency)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                          <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Total Amount:
                          </span>
                          <span className={`text-2xl font-bold ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            {formatMoney(selectedInvoice.totalAmount || selectedInvoice.amount, selectedCurrency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Payment Processing */}
              <div className="space-y-6">
                <div className={`border rounded-xl p-6 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Process Payment
                  </h3>

                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Select Payment Method
                    </div>
                    {paymentMethods.length === 0 ? (
                      <div className={`p-4 text-center border rounded-lg ${
                        isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          No payment methods configured
                        </div>
                        <button
                          onClick={() => navigate('/payments/settings')}
                          className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                        >
                          Add Payment Methods
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {paymentMethods.map((method) => (
                          <label 
                            key={method.id}
                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                              paymentMethodId === method.id
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                : isDarkMode
                                  ? 'border-gray-600 hover:bg-gray-700'
                                  : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.id}
                              checked={paymentMethodId === method.id}
                              onChange={(e) => setPaymentMethodId(e.target.value)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="ml-3 flex items-center justify-between flex-1">
                              <div className="flex items-center">
                                {method.type === 'credit_card' && <CreditCard className="w-5 h-5 mr-3" />}
                                {method.type === 'bank_transfer' && <Wallet className="w-5 h-5 mr-3" />}
                                {method.type === 'paypal' && <Wallet className="w-5 h-5 mr-3" />}
                                {method.type === 'mobile_money' && <Smartphone className="w-5 h-5 mr-3" />}
                                {method.type === 'cash' && <DollarSign className="w-5 h-5 mr-3" />}
                                <div>
                                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {method.name}
                                  </div>
                                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {method.type === 'credit_card' ? `•••• ${method.last4}` : 
                                     method.type === 'paypal' ? method.email : 
                                     method.type === 'mobile_money' ? method.phone :
                                     method.type === 'cash' ? 'Cash Payment' :
                                     method.type}
                                  </div>
                                </div>
                              </div>
                              {method.isDefault && (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  isDarkMode 
                                    ? 'bg-blue-900/30 text-blue-300' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  Default
                                </span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Payment Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'border-gray-300'
                      }`}
                      placeholder="Add any payment notes..."
                    />
                  </div>

                  {/* Process Button */}
                  <button
                    onClick={handleProcessPayment}
                    disabled={processing || !paymentMethodId || paymentMethods.length === 0}
                    className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Process Payment & Generate Receipt
                      </>
                    )}
                  </button>

                  <div className={`mt-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex items-center justify-center">
                      <Receipt className="w-4 h-4 mr-1" />
                      A receipt will be automatically generated and saved
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className={`border rounded-xl p-6 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Payment Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Invoice:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        #{selectedInvoice.invoiceNumber || selectedInvoice.number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Customer:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {getCustomerName(selectedInvoice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Issue Date:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(selectedInvoice.issueDate || selectedInvoice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Due Date:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between">
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total to Pay:</span>
                        <span className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {formatMoney(selectedInvoice.totalAmount || selectedInvoice.amount, selectedCurrency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className={`border rounded-xl p-6 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Payment Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-3 text-gray-400" />
                        <div>
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Invoice Items
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Products/Services
                          </div>
                        </div>
                      </div>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {invoiceItems.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 mr-3 text-gray-400" />
                        <div>
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Subtotal
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Before tax
                          </div>
                        </div>
                      </div>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatMoney(selectedInvoice.subtotal ?? selectedInvoice.amount ?? 0, selectedCurrency)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <Receipt className="w-5 h-5 mr-3 text-gray-400" />
                        <div>
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Tax
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Tax amount
                          </div>
                        </div>
                      </div>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatMoney(selectedInvoice.tax || 0, selectedCurrency)}
                      </span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" />
                          <div>
                            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Total Payment
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-primary-300' : 'text-primary-500'}`}>
                              Amount to be paid
                            </div>
                          </div>
                        </div>
                        <span className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {formatMoney(selectedInvoice.totalAmount || selectedInvoice.amount, selectedCurrency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProcessPayment;
