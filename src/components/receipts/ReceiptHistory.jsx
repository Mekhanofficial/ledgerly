import React from 'react';
import { Eye, Printer, Mail, CreditCard, Wallet, Smartphone } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ReceiptHistory = ({ receipts }) => {
  const { isDarkMode } = useTheme();
  
  const recentReceipts = [
    {
      id: 'RCP-2024-098',
      date: 'Dec 16, 2024',
      customer: 'Walk-in Customer',
      amount: 89.50,
      paymentMethod: 'Card',
      status: 'completed',
      icon: CreditCard
    },
    {
      id: 'RCP-2024-097',
      date: 'Dec 16, 2024',
      customer: 'sarahj@email.com',
      amount: 156.25,
      paymentMethod: 'Cash',
      status: 'completed',
      icon: Wallet
    },
    {
      id: 'RCP-2024-096',
      date: 'Dec 15, 2024',
      customer: 'mike.chen@email.com',
      amount: 42.75,
      paymentMethod: 'Mobile Money',
      status: 'completed',
      icon: Smartphone
    }
  ];

  const getPaymentMethodColor = (method) => {
    const colors = {
      'Cash': isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800',
      'Card': isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800',
      'Mobile Money': isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'
    };
    return colors[method] || isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
  };

  const getPaymentIcon = (method) => {
    const icons = {
      'Cash': Wallet,
      'Card': CreditCard,
      'Mobile Money': Smartphone
    };
    return icons[method] || CreditCard;
  };

  return (
    <div className={`border rounded-xl overflow-hidden ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className={`px-6 py-4 border-b ${
        isDarkMode 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Recent Receipts
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Receipt #
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Date
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {recentReceipts.map((receipt) => {
              const PaymentIcon = getPaymentIcon(receipt.paymentMethod);
              return (
                <tr key={receipt.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {receipt.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {receipt.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {receipt.customer}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${receipt.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <PaymentIcon className={`w-4 h-4 mr-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(receipt.paymentMethod)}`}>
                        {receipt.paymentMethod}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        className={`flex items-center px-3 py-1 text-sm rounded-lg ${
                          isDarkMode 
                            ? 'text-gray-300 hover:bg-gray-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        title="View"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button 
                        className={`flex items-center px-3 py-1 text-sm rounded-lg ${
                          isDarkMode 
                            ? 'text-blue-400 hover:bg-blue-900/20' 
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Reprint"
                      >
                        <Printer className="w-4 h-4 mr-1" />
                        Reprint
                      </button>
                      <button 
                        className={`flex items-center px-3 py-1 text-sm rounded-lg ${
                          isDarkMode 
                            ? 'text-green-400 hover:bg-green-900/20' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title="Resend Email"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceiptHistory;