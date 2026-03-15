// Update Customers.js
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Plus, Download, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Added import
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import CustomerStats from '../../components/customers/CustomerStats';
import CustomerTable from '../../components/customers/CustomerTable';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  fetchCustomers,
  createCustomer as createCustomerThunk,
  deleteCustomer as deleteCustomerThunk,
  sendCustomerStatement as sendCustomerStatementThunk
} from '../../store/slices/customerSlice';
import { fetchInvoices } from '../../store/slices/invoiceSlice';
import { buildCustomerPayload, mapCustomerFromApi } from '../../utils/customerAdapter';
import { mapInvoiceFromApi } from '../../utils/invoiceAdapter';

const Customers = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const { customers: apiCustomers, error } = useSelector((state) => state.customers);
  const apiInvoices = useSelector((state) => state.invoices?.invoices || []);
  const { addToast } = useToast();
  const navigate = useNavigate(); // Added hook
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSendingStatements, setIsSendingStatements] = useState(false);
  const addCustomerNameRef = useRef(null);

  const customers = useMemo(
    () => (apiCustomers || []).map(mapCustomerFromApi),
    [apiCustomers]
  );

  const invoices = useMemo(
    () => (apiInvoices || []).map(mapInvoiceFromApi),
    [apiInvoices]
  );

  const parseDateValue = useCallback((value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, []);

  const isInvoiceOverdue = useCallback((invoice, referenceDate = new Date()) => {
    const status = String(invoice?.status || '').trim().toLowerCase();
    if (!status) return false;
    if (status === 'overdue') return true;
    if (['paid', 'draft', 'cancelled', 'void'].includes(status)) return false;
    if (!['sent', 'viewed', 'partial', 'pending'].includes(status)) return false;

    const dueDate = parseDateValue(invoice?.dueDate || invoice?.due);
    if (!dueDate) return false;
    return dueDate.getTime() < referenceDate.getTime();
  }, [parseDateValue]);

  const overdueCustomerIds = useMemo(() => {
    const now = new Date();
    const ids = new Set();
    invoices.forEach((invoice) => {
      if (!isInvoiceOverdue(invoice, now)) return;
      const resolvedCustomerId = String(
        invoice?.customerId
        || invoice?.customer?._id
        || invoice?.customer?.id
        || ''
      ).trim();
      if (resolvedCustomerId) {
        ids.add(resolvedCustomerId);
      }
    });
    return Array.from(ids);
  }, [invoices, isInvoiceOverdue]);

  useEffect(() => {
    if (showAddCustomerModal && addCustomerNameRef.current) {
      addCustomerNameRef.current.focus();
    }
  }, [showAddCustomerModal]);

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchInvoices());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      addToast(error, 'error');
    }
  }, [error, addToast]);

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    const normalizedQuery = String(searchTerm || '').trim().toLowerCase();
    if (!normalizedQuery) return customers;

    return customers.filter((customer) => {
      const name = String(customer?.name || '').toLowerCase();
      const email = String(customer?.email || '').toLowerCase();
      const phone = String(customer?.phone || '');
      return (
        name.includes(normalizedQuery)
        || email.includes(normalizedQuery)
        || phone.includes(normalizedQuery)
      );
    });
  }, [customers, searchTerm]);

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      addToast('Please fill in required fields', 'error');
      return;
    }
    
    try {
      const payload = buildCustomerPayload(newCustomer);
      const result = await dispatch(createCustomerThunk(payload));
      if (result.meta.requestStatus === 'fulfilled') {
        addToast(`Customer "${newCustomer.name}" added successfully!`, 'success');
        setNewCustomer({ name: '', email: '', phone: '', address: '' });
        setShowAddCustomerModal(false);
      } else {
        addToast(result.payload || 'Error adding customer', 'error');
      }
    } catch {
      addToast('Error adding customer', 'error');
    }
  };

  const handleSendStatement = async (customerIds) => {
    const ids = [...new Set((customerIds || []).filter(Boolean))];
    if (!ids.length) {
      addToast('Select at least one customer', 'warning');
      return;
    }

    setIsSendingStatements(true);

    try {
      const results = await Promise.allSettled(
        ids.map((id) => dispatch(sendCustomerStatementThunk(id)).unwrap())
      );

      const failed = [];
      let successCount = 0;
      let singleSuccessName = '';

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount += 1;
          if (!singleSuccessName) {
            singleSuccessName = result.value?.customerName || customers.find((c) => c.id === ids[index])?.name || '';
          }
          return;
        }

        const customerName = customers.find((c) => c.id === ids[index])?.name || 'Customer';
        const reason =
          typeof result.reason === 'string'
            ? result.reason
            : result.reason?.message || 'Failed to send statement';
        failed.push(`${customerName}: ${reason}`);
      });

      if (successCount > 0) {
        if (successCount === 1) {
          addToast(`Statement sent to ${singleSuccessName || 'customer'}`, 'success');
        } else {
          addToast(`Statements sent to ${successCount} customers`, 'success');
        }
      }

      if (failed.length > 0) {
        addToast(failed[0], 'error');
        if (failed.length > 1) {
          addToast(`${failed.length - 1} more statement(s) failed`, 'warning');
        }
      }
    } finally {
      setIsSendingStatements(false);
    }
  };

  const handleViewCustomer = (customerId) => {
    navigate(`/customers/${customerId}`); // Fixed: use navigate hook
  };

  const handleEditCustomer = (customerId) => {
    console.log('Edit customer:', customerId);
    // For now, navigate to view page. You can create an edit page later
    navigate(`/customers/${customerId}`, { state: { edit: true } });
  };

  const handleDeleteCustomer = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (window.confirm(`Are you sure you want to delete "${customer?.name}"? This action cannot be undone.`)) {
      dispatch(deleteCustomerThunk(customerId)).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          addToast(`Customer "${customer?.name}" deleted successfully!`, 'success');
        } else {
          addToast(result.payload || 'Failed to delete customer', 'error');
        }
      });
    }
  };

  const handleExportCustomers = () => {
    try {
      const dataStr = JSON.stringify(customers, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast(`Exported ${customers.length} customers successfully!`, 'success');
    } catch {
      addToast('Error exporting customers', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Customers
            </h1>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage customer relationships and outstanding balances
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button 
              onClick={handleExportCustomers}
              className={`flex items-center px-4 py-2 border rounded-lg ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button 
              onClick={() => setShowAddCustomerModal(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-400'
          }`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                : 'border-gray-300'
            }`}
          />
        </div>

        {/* Stats Component */}
        <CustomerStats customers={customers} />

        {/* Customer Table Component */}
        <CustomerTable
          customers={filteredCustomers}
          overdueCustomerIds={overdueCustomerIds}
          onSendStatement={handleSendStatement}
          onView={handleViewCustomer}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
          isSendingStatement={isSendingStatements}
        />

        {/* Add Customer Modal */}
        {showAddCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-xl p-6 max-w-md w-full ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Add New Customer
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    ref={addCustomerNameRef}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Customer name"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                    placeholder="customer@example.com"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Address
                  </label>
                  <textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                    rows="3"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Customer address"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddCustomerModal(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomer}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add Customer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Customers;
