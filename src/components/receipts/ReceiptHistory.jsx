import React, { useState, useEffect } from 'react';
import { Eye, Printer, Mail, CreditCard, Wallet, Smartphone, Download, Trash2, RefreshCw, User, MoreVertical } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useAccount } from '../../context/AccountContext';
import { generateReceiptPDF } from '../../utils/receiptPdfGenerator';

const ReceiptHistory = ({ receipts = [], onRefresh, onReceiptDeleted }) => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const { accountInfo } = useAccount();
  const [loading, setLoading] = useState(false);
  const [expandedReceipt, setExpandedReceipt] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'Ledgerly_receipts' || e.type === 'receiptsUpdated') {
        if (onRefresh) {
          onRefresh();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('receiptsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('receiptsUpdated', handleStorageChange);
    };
  }, [onRefresh]);

  const handleReprint = (receipt) => {
    try {
    const pdfDoc = generateReceiptPDF(receipt, accountInfo);
      pdfDoc.save(`${receipt.id}-reprint.pdf`);
      addToast(`Receipt ${receipt.id} reprinted`, 'success');
      setActionMenu(null);
    } catch (error) {
      addToast('Error reprinting receipt', 'error');
    }
  };

  const handleResendEmail = (receipt) => {
    if (!receipt.customerEmail) {
      addToast('No email address found for this receipt', 'warning');
      return;
    }

    const emailBody = `
Receipt Reprint: ${receipt.id}

Original Purchase Date: ${receipt.date}
Customer: ${receipt.customerName || 'N/A'}
Payment Method: ${receipt.paymentMethod || 'Cash'}
${receipt.paymentMethodDetails ? `Payment Details: ${receipt.paymentMethodDetails}` : ''}

Items:
${receipt.items?.map(item => 
  `- ${item.name}: ${item.quantity} × $${item.price?.toFixed(2) || '0.00'} = $${((item.price || 0) * item.quantity).toFixed(2)}`
).join('\n') || 'No items found'}

Subtotal: $${receipt.subtotal?.toFixed(2) || '0.00'}
Tax (8.5%): $${receipt.tax?.toFixed(2) || '0.00'}
Total: $${receipt.total?.toFixed(2) || '0.00'}

${receipt.notes ? `\nNotes: ${receipt.notes}` : ''}

Thank you for shopping with us!
    `;

    const subject = encodeURIComponent(`Receipt Reprint: ${receipt.id}`);
    const body = encodeURIComponent(emailBody);
    const mailtoLink = `mailto:${receipt.customerEmail}?subject=${subject}&body=${body}`;
    
    window.open(mailtoLink, '_blank');
    addToast(`Email opened for ${receipt.id}`, 'success');
    setActionMenu(null);
  };

  const handleDownloadPDF = (receipt) => {
    try {
      const pdfDoc = generateReceiptPDF(receipt, accountInfo);
      pdfDoc.save(`${receipt.id}.pdf`);
      addToast(`Receipt ${receipt.id} downloaded`, 'success');
      setActionMenu(null);
    } catch (error) {
      addToast('Error downloading receipt', 'error');
    }
  };

  const handleDeleteReceipt = (receiptId) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      try {
        const currentReceipts = JSON.parse(localStorage.getItem('Ledgerly_receipts') || '[]');
        const updatedReceipts = currentReceipts.filter(receipt => receipt.id !== receiptId);
        localStorage.setItem('Ledgerly_receipts', JSON.stringify(updatedReceipts));
        
        window.dispatchEvent(new CustomEvent('receiptsUpdated'));
        
        if (onReceiptDeleted) {
          onReceiptDeleted();
        }
        
        addToast('Receipt deleted successfully', 'success');
        setActionMenu(null);
      } catch (error) {
        addToast('Error deleting receipt', 'error');
      }
    }
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      'Cash': isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800',
      'Card': isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800',
      'Mobile Money': isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800',
      'credit_card': isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800',
      'bank_transfer': isDarkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800',
      'paypal': isDarkMode ? 'bg-blue-400/30 text-blue-300' : 'bg-blue-100 text-blue-800'
    };
    return colors[method] || (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800');
  };

  const getPaymentIcon = (method) => {
    const icons = {
      'Cash': Wallet,
      'Card': CreditCard,
      'Mobile Money': Smartphone,
      'credit_card': CreditCard,
      'bank_transfer': Wallet,
      'paypal': CreditCard
    };
    return icons[method] || CreditCard;
  };

  const handleRefresh = () => {
    if (onRefresh) {
      setLoading(true);
      onRefresh();
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleViewReceipt = (receipt) => {
    try {
      const pdfDoc = generateReceiptPDF(receipt, accountInfo);
      const pdfBlob = pdfDoc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      addToast(`Opening receipt ${receipt.id}`, 'info');
      setActionMenu(null);
    } catch (error) {
      addToast('Error viewing receipt', 'error');
    }
  };

  const toggleReceiptExpand = (receiptId) => {
    setExpandedReceipt(expandedReceipt === receiptId ? null : receiptId);
  };

  const toggleActionMenu = (receiptId) => {
    setActionMenu(actionMenu === receiptId ? null : receiptId);
  };

  const formatReceiptDetails = (receipt) => {
    const method = receipt.paymentMethod || 'Cash';
    const details = receipt.paymentMethodDetails || '';
    const customer = receipt.customerName || 'Walk-in';
    
    return `${customer} • ${method}${details ? ` (${details})` : ''}`;
  };

  return (
    <div className={`border rounded-xl overflow-hidden ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className={`px-4 sm:px-6 py-4 border-b ${
        isDarkMode 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Recent Receipts ({receipts.length})
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              } ${loading ? 'animate-spin' : ''}`}
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {receipts.length === 0 ? (
        <div className="p-6 text-center">
          <div className={`text-lg font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            No receipt history
          </div>
          <div className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Generate receipts to see them here
          </div>
        </div>
      ) : isMobile ? (
        /* Mobile View */
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {receipts.slice(0, 10).map((receipt) => {
            const paymentMethod = receipt.paymentMethod || 'Cash';
            const PaymentIcon = getPaymentIcon(paymentMethod);
            const receiptDate = receipt.savedAt 
              ? new Date(receipt.savedAt).toLocaleDateString()
              : new Date().toLocaleDateString();
            
            return (
              <div key={receipt.id} className={`p-4 ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className={`font-semibold cursor-pointer hover:text-primary-600 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`} onClick={() => handleViewReceipt(receipt)}>
                      {receipt.id}
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {receiptDate} • {receipt.items?.length || 0} items
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => toggleActionMenu(receipt.id)}
                      className={`p-1 rounded ${
                        isDarkMode
                          ? 'hover:bg-gray-600 text-gray-400'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {actionMenu === receipt.id && (
                      <div className={`absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg z-10 border ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-white border-gray-200'
                      }`}>
                        <div className="py-1">
                          <button 
                            onClick={() => handleViewReceipt(receipt)}
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              isDarkMode 
                                ? 'text-gray-300 hover:bg-gray-700' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Eye className="w-4 h-4 mr-3" />
                            View
                          </button>
                          <button 
                            onClick={() => handleDownloadPDF(receipt)}
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              isDarkMode 
                                ? 'text-gray-300 hover:bg-gray-700' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Download className="w-4 h-4 mr-3" />
                            Download
                          </button>
                          <button 
                            onClick={() => handleReprint(receipt)}
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              isDarkMode 
                                ? 'text-blue-400 hover:bg-gray-700' 
                                : 'text-blue-600 hover:bg-gray-100'
                            }`}
                          >
                            <Printer className="w-4 h-4 mr-3" />
                            Reprint
                          </button>
                          <button 
                            onClick={() => handleResendEmail(receipt)}
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              isDarkMode 
                                ? 'text-green-400 hover:bg-gray-700' 
                                : 'text-green-600 hover:bg-gray-100'
                            }`}
                          >
                            <Mail className="w-4 h-4 mr-3" />
                            Email
                          </button>
                          <button 
                            onClick={() => handleDeleteReceipt(receipt.id)}
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              isDarkMode 
                                ? 'text-red-400 hover:bg-gray-700' 
                                : 'text-red-600 hover:bg-gray-100'
                            }`}
                          >
                            <Trash2 className="w-4 h-4 mr-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {receipt.customerName || 'Walk-in Customer'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <PaymentIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span className={`text-xs ${getPaymentMethodColor(paymentMethod)} px-2 py-1 rounded-full`}>
                      {paymentMethod}
                      {receipt.paymentMethodDetails && ` • ${receipt.paymentMethodDetails}`}
                    </span>
                  </div>
                </div>
                
                <div className={`font-bold text-lg mb-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  ${receipt.total?.toFixed(2) || '0.00'}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ${receipt.subtotal?.toFixed(2) || '0.00'} + ${receipt.tax?.toFixed(2) || '0.00'} tax
                </div>
                
                {expandedReceipt === receipt.id && receipt.items && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className={`text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Items:
                    </div>
                    {receipt.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm py-1">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {item.quantity} × {item.name}
                        </span>
                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <button
                  onClick={() => toggleReceiptExpand(receipt.id)}
                  className={`w-full mt-3 text-sm ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {expandedReceipt === receipt.id ? 'Show Less' : 'Show Items'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Receipt #
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Customer & Payment
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Items
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {receipts.slice(0, 10).map((receipt) => {
                const paymentMethod = receipt.paymentMethod || 'Cash';
                const PaymentIcon = getPaymentIcon(paymentMethod);
                const receiptDate = receipt.savedAt 
                  ? new Date(receipt.savedAt).toLocaleDateString()
                  : new Date().toLocaleDateString();
                  
                return (
                  <tr key={receipt.id} className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                    <td className="px-4 sm:px-6 py-4">
                      <div className={`font-medium cursor-pointer hover:text-primary-600 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`} onClick={() => handleViewReceipt(receipt)}>
                        {receipt.id}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1 text-gray-400" />
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {receipt.customerName || 'Walk-in Customer'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <PaymentIcon className="w-3 h-3 mr-1 text-gray-400" />
                          <span className={`text-xs ${getPaymentMethodColor(paymentMethod)} px-2 py-0.5 rounded-full`}>
                            {paymentMethod}
                            {receipt.paymentMethodDetails && ` • ${receipt.paymentMethodDetails}`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {receipt.items?.length || 0} items
                        {receipt.customerEmail && (
                          <div className="text-xs truncate max-w-[150px]" title={receipt.customerEmail}>
                            📧 {receipt.customerEmail}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className={`font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${receipt.total?.toFixed(2) || '0.00'}
                      </div>
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        ${receipt.subtotal?.toFixed(2) || '0.00'} + ${receipt.tax?.toFixed(2) || '0.00'} tax
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {receiptDate}
                        <div className="text-xs">
                          {receipt.date?.split(',')[1]?.trim() || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewReceipt(receipt)}
                          className={`p-2 rounded transition-colors ${
                            isDarkMode 
                              ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDownloadPDF(receipt)}
                          className={`p-2 rounded transition-colors ${
                            isDarkMode 
                              ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleReprint(receipt)}
                          className={`p-2 rounded transition-colors ${
                            isDarkMode 
                              ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                              : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                          }`}
                          title="Reprint"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleResendEmail(receipt)}
                          className={`p-2 rounded transition-colors ${
                            isDarkMode 
                              ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20' 
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          }`}
                          title="Resend Email"
                          disabled={!receipt.customerEmail}
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteReceipt(receipt.id)}
                          className={`p-2 rounded transition-colors ${
                            isDarkMode 
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                              : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                          }`}
                          title="Delete Receipt"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination and Summary */}
      {receipts.length > 0 && (
        <div className={`px-4 sm:px-6 py-4 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Showing {Math.min(10, receipts.length)} of {receipts.length} receipts
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Total Revenue: $
              {receipts.reduce((sum, receipt) => sum + (receipt.total || 0), 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptHistory;
