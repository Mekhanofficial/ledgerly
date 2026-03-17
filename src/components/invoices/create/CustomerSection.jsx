// src/components/invoices/create/CustomerSection.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const CustomerSection = ({
  selectedCustomer,
  setSelectedCustomer,
  customers,
  newCustomer,
  setNewCustomer,
  onAddCustomer,
  getSelectedCustomer,
  isAddingCustomer
}) => {
  const resolveCustomerId = (customer) => String(
    customer?.id
    || customer?._id
    || customer?.raw?._id
    || customer?.raw?.id
    || ''
  ).trim();

  const selectedCustomerData = getSelectedCustomer();
  const inputClassName = 'w-full min-h-[44px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white';
  const customerPickerRef = useRef(null);
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  const customerOptions = useMemo(() => (
    customers
      .map((customer) => {
        const customerId = resolveCustomerId(customer);
        if (!customerId) return null;
        return {
          id: customerId,
          name: customer?.name || '',
          email: customer?.email || '',
          phone: customer?.phone || '',
          address: customer?.address || ''
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name))
  ), [customers]);

  const filteredCustomerOptions = useMemo(() => {
    const normalizedSearch = String(customerSearch || '').trim().toLowerCase();
    if (!normalizedSearch) return customerOptions;

    return customerOptions.filter((customer) => {
      const name = String(customer.name || '').toLowerCase();
      const email = String(customer.email || '').toLowerCase();
      const phone = String(customer.phone || '').toLowerCase();
      const address = String(customer.address || '').toLowerCase();

      return (
        name.includes(normalizedSearch)
        || email.includes(normalizedSearch)
        || phone.includes(normalizedSearch)
        || address.includes(normalizedSearch)
      );
    });
  }, [customerOptions, customerSearch]);

  useEffect(() => {
    setCustomerSearch(selectedCustomerData?.name || '');
  }, [selectedCustomerData?.id, selectedCustomerData?.name]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerPickerRef.current && !customerPickerRef.current.contains(event.target)) {
        setIsCustomerPickerOpen(false);
        setCustomerSearch(selectedCustomerData?.name || '');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCustomerData?.name]);

  const handleCustomerSearchFocus = () => {
    setIsCustomerPickerOpen(true);
    setCustomerSearch((currentValue) => currentValue || selectedCustomerData?.name || '');
  };

  const handleCustomerSearchChange = (event) => {
    const nextValue = event.target.value;
    setCustomerSearch(nextValue);
    setIsCustomerPickerOpen(true);

    if (!nextValue.trim()) {
      setSelectedCustomer('');
    }
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomer(customerId);
    const matchedCustomer = customerOptions.find((customer) => customer.id === customerId);
    setCustomerSearch(matchedCustomer?.name || '');
    setIsCustomerPickerOpen(false);
  };

  const handleCustomerClear = () => {
    setSelectedCustomer('');
    setCustomerSearch('');
    setIsCustomerPickerOpen(false);
  };

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

          <div className="relative" ref={customerPickerRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={customerSearch}
              onFocus={handleCustomerSearchFocus}
              onChange={handleCustomerSearchChange}
              placeholder="Search customer by name, email, phone..."
              className={`${inputClassName} pl-10 pr-10`}
            />
            <button
              type="button"
              onClick={() => setIsCustomerPickerOpen((currentValue) => !currentValue)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
              aria-label="Toggle customer list"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isCustomerPickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCustomerPickerOpen && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={handleCustomerClear}
                  className="w-full border-b border-gray-100 px-4 py-3 text-left text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Select a customer
                </button>

                <div className="max-h-64 overflow-y-auto">
                  {filteredCustomerOptions.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      No customers found for "{customerSearch}"
                    </div>
                  ) : (
                    filteredCustomerOptions.map((customer) => {
                      const isSelected = customer.id === String(selectedCustomer || '').trim();

                      return (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => handleCustomerSelect(customer.id)}
                          className={`w-full px-4 py-3 text-left transition-colors ${
                            isSelected
                              ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                              : 'hover:bg-gray-50 text-gray-900 dark:text-white dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="font-medium">{customer.name}</div>
                          {(customer.email || customer.phone) && (
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {[customer.email, customer.phone].filter(Boolean).join(' • ')}
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
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
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className={inputClassName}
            />
            <input
              type="email"
              placeholder="Email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              className={inputClassName}
            />
            <input
              type="text"
              placeholder="Phone"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              className={inputClassName}
            />
            <input
              type="text"
              placeholder="Address"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
              className={inputClassName}
            />
          </div>

          <button
            type="button"
            onClick={onAddCustomer}
            disabled={isAddingCustomer}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-400 disabled:cursor-not-allowed"
          >
            {isAddingCustomer ? 'Adding customer...' : 'Add Customer'}
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
            <div className="text-sm text-gray-600 dark:text-gray-300 break-words">
              {selectedCustomerData.phone} - {selectedCustomerData.address}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSection;
