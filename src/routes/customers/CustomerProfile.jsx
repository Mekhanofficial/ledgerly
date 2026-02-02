// src/routes/customers/CustomerProfile.js
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, DollarSign, 
  FileText, ArrowLeft, Edit, Download, Send, MoreVertical,
  TrendingUp, Clock, CheckCircle, XCircle
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerById, updateCustomer as updateCustomerThunk, deleteCustomer as deleteCustomerThunk } from '../../store/slices/customerSlice';
import { fetchInvoices } from '../../store/slices/invoiceSlice';
import { buildCustomerPayload, mapCustomerFromApi } from '../../utils/customerAdapter';

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const dispatch = useDispatch();
  const { currentCustomer, loading: customerLoading, error: customerError } = useSelector((state) => state.customers);
  const { invoices, loading: invoicesLoading, error: invoicesError } = useSelector((state) => state.invoices);
  
  const [customer, setCustomer] = useState(null);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    dispatch(fetchCustomerById(id));
    dispatch(fetchInvoices({ customer: id, limit: 50 }));
  }, [dispatch, id]);

  const mappedCustomer = useMemo(() => {
    if (!currentCustomer) return null;
    return mapCustomerFromApi(currentCustomer);
  }, [currentCustomer]);

  useEffect(() => {
    if (mappedCustomer) {
      setCustomer(mappedCustomer);
      setEditForm({
        name: mappedCustomer.name || '',
        email: mappedCustomer.email || '',
        phone: mappedCustomer.phone || '',
        address: mappedCustomer.address || ''
      });
    }
  }, [mappedCustomer]);

  useEffect(() => {
    if (invoicesError) {
      addToast(invoicesError, 'error');
    }
  }, [invoicesError, addToast]);

  useEffect(() => {
    if (customerError) {
      addToast(customerError, 'error');
    }
  }, [customerError, addToast]);

  const isLoading = customerLoading || invoicesLoading;

  useEffect(() => {
    const customerInvs = (invoices || []).filter((invoice) => {
      const invoiceCustomerId = invoice.customerId || (typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?._id);
      return invoiceCustomerId === id;
    });
    setCustomerInvoices(customerInvs);
  }, [invoices, id]);

  const handleEditCustomer = async () => {
    if (!editForm.name || !editForm.email) {
      addToast('Name and email are required', 'error');
      return;
    }
    
    try {
      const payload = buildCustomerPayload(editForm);
      const result = await dispatch(updateCustomerThunk({ id, data: payload }));
      if (result.meta.requestStatus === 'fulfilled') {
        addToast('Customer updated successfully!', 'success');
        setShowEditModal(false);
      } else {
        addToast(result.payload || 'Failed to update customer', 'error');
      }
    } catch (error) {
      addToast('Failed to update customer', 'error');
    }
  };

  const handleDeleteCustomer = () => {
    dispatch(deleteCustomerThunk(id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        addToast('Customer deleted successfully!', 'success');
        navigate('/customers');
      } else {
        addToast(result.payload || 'Failed to delete customer', 'error');
      }
    });
  };

  const handleSendStatement = () => {
    // Implement send statement functionality
    addToast('Customer statement sent successfully!', 'success');
  };

  const handleExportData = () => {
    const customerData = {
      customer,
      invoices: customerInvoices,
      stats: getCustomerStats(),
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(customerData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customer-${customer.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addToast('Customer data exported successfully!', 'success');
  };

  const getCustomerStats = () => {
    if (!customer) return {};
    
    const totalInvoices = customerInvoices.length;
    const totalAmount = customerInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || inv.total || 0), 0);
    const paidAmount = customerInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || inv.total || 0), 0);
    const pendingAmount = customerInvoices
      .filter(inv => inv.status === 'sent' || inv.status === 'viewed')
      .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || inv.total || 0), 0);
    const overdueAmount = customerInvoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || inv.total || 0), 0);
    
    return {
      totalInvoices,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      avgInvoiceValue: totalInvoices > 0 ? totalAmount / totalInvoices : 0
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      viewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'Draft',
      sent: 'Sent',
      viewed: 'Viewed',
      paid: 'Paid',
      overdue: 'Overdue',
      pending: 'Pending'
    };
    return texts[status] || status;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Customer Not Found
          </h2>
          <button
            onClick={() => navigate('/customers')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Customers
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const stats = getCustomerStats();

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/customers')}
              className={`mr-4 p-2 rounded-lg ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Customer Profile
              </h1>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                View and manage customer details
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={handleSendStatement}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Statement
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6`}>
          {/* Left Column - Customer Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`border rounded-xl p-6 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mr-4 ${
                    isDarkMode 
                      ? 'bg-primary-900/30 text-primary-400' 
                      : 'bg-primary-100 text-primary-800'
                  }`}>
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {customer.name}
                    </h2>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Customer since {customer.joinedDate || formatDate(customer.createdAt)}
                    </p>
                  </div>
                </div>
                <div className={`text-sm px-3 py-1 rounded-full ${
                  customer.outstanding === 0
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                }`}>
                  {customer.outstanding === 0 ? 'No Balance' : `$${customer.outstanding.toLocaleString()} Outstanding`}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className={`w-4 h-4 mr-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>
                        {customer.email}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className={`w-4 h-4 mr-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>
                        {customer.phone || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className={`w-4 h-4 mr-3 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>
                        {customer.address || 'No address provided'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Transaction Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Spent:</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${customer.totalSpent?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Invoices:</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.totalInvoices}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Last Transaction:</span>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {customer.lastTransaction || 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Invoices */}
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
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recent Invoices
                </h3>
              </div>
              
              {customerInvoices.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No invoices found for this customer</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Invoice #
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Date
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Amount
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
                    <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                      {customerInvoices.slice(0, 5).map((invoice) => (
                        <tr key={invoice._id || invoice.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {invoice.number || invoice.invoiceNumber || invoice._id?.slice(-6)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-900'
                            }`}>
                              {formatDate(invoice.issueDate || invoice.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              ${(invoice.totalAmount || invoice.amount || invoice.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                              {getStatusText(invoice.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => navigate(`/invoices/view/${invoice._id || invoice.id}`)}
                              className={`text-sm font-medium ${
                                isDarkMode 
                                  ? 'text-primary-400 hover:text-primary-300' 
                                  : 'text-primary-600 hover:text-primary-700'
                              }`}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {customerInvoices.length > 5 && (
                <div className={`px-6 py-4 border-t ${
                  isDarkMode 
                    ? 'border-gray-700' 
                    : 'border-gray-200'
                }`}>
                  <button
                    onClick={() => navigate('/invoices', { state: { customerId: id } })}
                    className={`text-sm font-medium ${
                      isDarkMode 
                        ? 'text-primary-400 hover:text-primary-300' 
                        : 'text-primary-600 hover:text-primary-700'
                    }`}
                  >
                    View all {customerInvoices.length} invoices →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Stats */}
            <div className={`border rounded-xl p-6 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Customer Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Total Invoices</span>
                  </div>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalInvoices}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Total Value</span>
                  </div>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${stats.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Paid Amount</span>
                  </div>
                  <span className={`font-bold text-emerald-600 dark:text-emerald-400`}>
                    ${stats.paidAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Pending Amount</span>
                  </div>
                  <span className={`font-bold text-amber-600 dark:text-amber-400`}>
                    ${stats.pendingAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircle className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Overdue Amount</span>
                  </div>
                  <span className={`font-bold text-red-600 dark:text-red-400`}>
                    ${stats.overdueAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-primary-400' : 'text-primary-500'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Avg Invoice Value</span>
                  </div>
                  <span className={`font-bold text-primary-600 dark:text-primary-400`}>
                    ${stats.avgInvoiceValue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`border rounded-xl p-6 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/invoices/create', { state: { customerId: id } })}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'border-gray-600 text-white hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Create New Invoice
                </button>
                
                <button
                  onClick={handleSendStatement}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'border-gray-600 text-white hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Statement
                </button>
                
                <button
                  onClick={() => setShowEditModal(true)}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'border-gray-600 text-white hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Customer
                </button>
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg border text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20`}
                >
                  <MoreVertical className="w-4 h-4 mr-2" />
                  Delete Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl p-6 max-w-md w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Edit Customer
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
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
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
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
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
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Address
                </label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  rows="3"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleEditCustomer}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl p-6 max-w-md w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Delete Customer
            </h3>
            
            <p className={`mb-6 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Are you sure you want to delete <span className="font-semibold">{customer.name}</span>? 
              This action cannot be undone and will delete all associated data.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomerProfile;
