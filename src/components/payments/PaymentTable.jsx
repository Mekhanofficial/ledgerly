import React, { useState } from 'react';
import { CreditCard, DollarSign, Clock, CheckCircle, XCircle, MoreVertical, Download, Filter } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAccount } from '../../context/AccountContext';
import { formatCurrency } from '../../utils/currency';
import TablePagination from '../ui/TablePagination';
import { useTablePagination } from '../../hooks/usePagination';

const PaymentTable = ({ payments, onViewDetails, onProcess, onRefund, readOnly = false }) => {
  const { isDarkMode } = useTheme();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  const formatMoney = (value, currencyCode) => formatCurrency(value, currencyCode || baseCurrency);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    paginatedItems: paginatedPayments
  } = useTablePagination(payments, { initialRowsPerPage: 10 });

  const getStatusBadge = (status) => {
    const styles = {
      completed: isDarkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800',
      pending: isDarkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800',
      failed: isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800',
      refunded: isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
    };
    return styles[status] || (isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800');
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: CheckCircle,
      pending: Clock,
      failed: XCircle,
      refunded: DollarSign
    };
    return icons[status] || Clock;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'Credit Card': CreditCard,
      'Bank Transfer': DollarSign,
      'PayPal': CreditCard,
      'Cash': DollarSign,
      'Mobile Money': CreditCard
    };
    return icons[method] || CreditCard;
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === payments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(payments.map(p => p.id));
    }
  };

  const handleSelectPayment = (paymentId) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId)
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  return (
    <div className={`border rounded-xl overflow-hidden ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        isDarkMode 
          ? 'border-gray-700 bg-gray-800' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {selectedPayments.length > 0 ? (
              <span>{selectedPayments.length} payments selected</span>
            ) : (
              <span>Recent Payments</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {!readOnly && selectedPayments.length > 0 && (
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                Bulk Process ({selectedPayments.length})
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={`${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {!readOnly && (
                  <input
                    type="checkbox"
                    checked={selectedPayments.length === payments.length}
                    onChange={handleSelectAll}
                    className={`rounded focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-primary-500' 
                        : 'border-gray-300 text-primary-600'
                    }`}
                  />
                )}
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Transaction ID
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Customer
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Amount
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Payment Method
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Date
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Status
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDarkMode 
              ? 'divide-gray-700 bg-gray-800' 
              : 'divide-gray-200 bg-white'
          }`}>
            {paginatedPayments.map((payment) => {
              const StatusIcon = getStatusIcon(payment.status);
              const MethodIcon = getPaymentMethodIcon(payment.method);
              return (
                <tr key={payment.id} className={isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {!readOnly && (
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={() => handleSelectPayment(payment.id)}
                        className={`rounded focus:ring-primary-500 ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-primary-500' 
                            : 'border-gray-300 text-primary-600'
                        }`}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {payment.transactionId}
                    </div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Invoice #{payment.invoiceId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {payment.customer}
                    </div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {payment.customerEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatMoney(payment.amount, payment.currency || baseCurrency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MethodIcon className={`w-4 h-4 mr-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {payment.method}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {payment.date}
                    </div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {payment.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StatusIcon className={`w-4 h-4 mr-2 ${
                        isDarkMode 
                          ? {
                              completed: 'text-emerald-400',
                              pending: 'text-amber-400',
                              failed: 'text-red-400',
                              refunded: 'text-blue-400'
                            }[payment.status] || 'text-gray-400'
                          : ''
                      }`} />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewDetails(payment.id)}
                        className={`px-3 py-1 text-sm rounded-lg ${
                          isDarkMode 
                            ? 'text-blue-400 hover:bg-blue-900/30' 
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        View
                      </button>
                      {!readOnly && onProcess && payment.status === 'pending' && (
                        <button
                          onClick={() => onProcess(payment.id)}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            isDarkMode 
                              ? 'text-emerald-400 hover:bg-emerald-900/30' 
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          Process
                        </button>
                      )}
                      {!readOnly && onRefund && payment.status === 'completed' && (
                        <button
                          onClick={() => onRefund(payment.id)}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            isDarkMode 
                              ? 'text-amber-400 hover:bg-amber-900/30' 
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                        >
                          Refund
                        </button>
                      )}
                      {!readOnly && (
                        <button className={`p-1 rounded-lg ${
                          isDarkMode 
                            ? 'text-gray-400 hover:bg-gray-700' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}>
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <TablePagination
        page={page}
        totalItems={payments.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default PaymentTable;
