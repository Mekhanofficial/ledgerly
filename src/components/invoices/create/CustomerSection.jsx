// src/components/invoices/create/CustomerSection.jsx
import React from 'react';

const CustomerSection = ({
  selectedCustomer,
  setSelectedCustomer,
  customers,
  newCustomer,
  setNewCustomer,
  onAddCustomer,
  getSelectedCustomer
}) => {
  const selectedCustomerData = getSelectedCustomer();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Customer Information
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Select Customer
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Quick Add Customer */}
        <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Quick Add Customer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Customer Name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="email"
              placeholder="Email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Phone"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Address"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={onAddCustomer}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add Customer
          </button>
        </div>
        
        {/* Selected Customer Info */}
        {selectedCustomerData && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="font-medium text-gray-900 dark:text-white">
              {selectedCustomerData.name}
            </div>
            <div className="text-sm mt-1 text-gray-600 dark:text-gray-300">
              {selectedCustomerData.email}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {selectedCustomerData.phone} • {selectedCustomerData.address}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSection;