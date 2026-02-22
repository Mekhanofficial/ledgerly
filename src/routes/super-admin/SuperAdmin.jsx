import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { getUserRoleLabel } from '../../utils/userDisplay';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';

const roleOptions = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'staff', label: 'Staff' },
  { value: 'client', label: 'Client' },
  { value: 'viewer', label: 'Viewer' }
];

const SuperAdmin = () => {
  const authUser = useSelector((state) => state.auth.user);
  const isSuperAdmin = authUser?.role === 'super_admin';
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUsers, setSearchUsers] = useState('');
  const [searchBusinesses, setSearchBusinesses] = useState('');
  const [searchInvoices, setSearchInvoices] = useState('');
  const [searchPayments, setSearchPayments] = useState('');
  const [searchCustomers, setSearchCustomers] = useState('');
  const [searchProducts, setSearchProducts] = useState('');
  const [searchReceipts, setSearchReceipts] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchOverview = async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const [overviewRes, usersRes, bizRes] = await Promise.all([
        api.get('/super-admin/overview'),
        api.get('/super-admin/users', { params: { limit: 200 } }),
        api.get('/super-admin/businesses', { params: { limit: 200 } })
      ]);
      setOverview(overviewRes.data.data);
      setUsers(usersRes.data.data || []);
      setBusinesses(bizRes.data.data || []);
    } catch (error) {
      console.error('Failed to load super admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await api.get('/super-admin/invoices', { params: { limit: 200 } });
      setInvoices(response.data.data || []);
    } catch (error) {
      console.error('Failed to load invoices', error);
    }
  };

  const loadPayments = async () => {
    try {
      const response = await api.get('/super-admin/payments', { params: { limit: 200 } });
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Failed to load payments', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get('/super-admin/customers', { params: { limit: 200 } });
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error('Failed to load customers', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/super-admin/products', { params: { limit: 200 } });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to load products', error);
    }
  };

  const loadReceipts = async () => {
    try {
      const response = await api.get('/super-admin/receipts', { params: { limit: 200 } });
      setReceipts(response.data.data || []);
    } catch (error) {
      console.error('Failed to load receipts', error);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    if (activeTab === 'invoices' && invoices.length === 0) {
      loadInvoices();
    }
    if (activeTab === 'payments' && payments.length === 0) {
      loadPayments();
    }
    if (activeTab === 'customers' && customers.length === 0) {
      loadCustomers();
    }
    if (activeTab === 'products' && products.length === 0) {
      loadProducts();
    }
    if (activeTab === 'receipts' && receipts.length === 0) {
      loadReceipts();
    }
  }, [activeTab, isSuperAdmin]);

  const filteredUsers = useMemo(() => {
    if (!searchUsers) return users;
    const term = searchUsers.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.role?.toLowerCase().includes(term)
    );
  }, [users, searchUsers]);

  const filteredBusinesses = useMemo(() => {
    if (!searchBusinesses) return businesses;
    const term = searchBusinesses.toLowerCase();
    return businesses.filter(
      (biz) =>
        biz.name?.toLowerCase().includes(term) ||
        biz.email?.toLowerCase().includes(term) ||
        biz.phone?.toLowerCase().includes(term)
    );
  }, [businesses, searchBusinesses]);

  const updateUser = async (userId, payload) => {
    try {
      await api.put(`/super-admin/users/${userId}`, payload);
      await fetchOverview();
    } catch (error) {
      console.error('Failed to update user', error);
    }
  };

  const updateBusiness = async (businessId, payload) => {
    try {
      await api.put(`/super-admin/businesses/${businessId}`, payload);
      await fetchOverview();
    } catch (error) {
      console.error('Failed to update business', error);
    }
  };

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center">
          <div className="max-w-md text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow">
            <ShieldCheck className="w-10 h-10 text-primary-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Super Admin Only</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              This page is restricted to the Ledgerly owner account.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
            Super Admin Console
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and manage all data across Ledgerly businesses.
          </p>
        </div>
        <button
          onClick={fetchOverview}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'Users' },
          { id: 'businesses', label: 'Businesses' },
          { id: 'invoices', label: 'Invoices' },
          { id: 'payments', label: 'Payments' },
          { id: 'customers', label: 'Customers' },
          { id: 'products', label: 'Products' },
          { id: 'receipts', label: 'Receipts' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Users', value: overview?.users ?? '-' },
            { label: 'Businesses', value: overview?.businesses ?? '-' },
            { label: 'Invoices', value: overview?.invoices ?? '-' },
            { label: 'Payments', value: overview?.payments ?? '-' },
            { label: 'Customers', value: overview?.customers ?? '-' },
            { label: 'Products', value: overview?.products ?? '-' },
            { label: 'Receipts', value: overview?.receipts ?? '-' }
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4"
            >
              <p className="text-sm uppercase text-gray-500">{stat.label}</p>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Users</h2>
            <input
              value={searchUsers}
              onChange={(event) => setSearchUsers(event.target.value)}
              placeholder="Search users"
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3">Business</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="py-2 px-3 text-gray-900 dark:text-white">{user.name}</td>
                      <td className="py-2 px-3 text-gray-500">{user.email}</td>
                      <td className="py-2 px-3">
                        <select
                          value={user.role}
                          onChange={(event) => updateUser(user._id, { role: event.target.value })}
                          className="border rounded-lg px-2 py-1 text-sm bg-transparent"
                        >
                          {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3 text-gray-500">{user.business?.name || '—'}</td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => updateUser(user._id, { isActive: !user.isActive })}
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'businesses' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Businesses</h2>
            <input
              value={searchBusinesses}
              onChange={(event) => setSearchBusinesses(event.target.value)}
              placeholder="Search businesses"
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Owner</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-gray-500">
                      Loading businesses...
                    </td>
                  </tr>
                ) : (
                  filteredBusinesses.map((biz) => (
                    <tr key={biz._id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="py-2 px-3 text-gray-900 dark:text-white">{biz.name}</td>
                      <td className="py-2 px-3 text-gray-500">{biz.email}</td>
                      <td className="py-2 px-3 text-gray-500">
                        {biz.owner?.name || biz.owner?.email || '—'}
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => updateBusiness(biz._id, { isActive: !biz.isActive })}
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            biz.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {biz.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Owner role: {getUserRoleLabel(authUser)}
          </p>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoices</h2>
            <input
              value={searchInvoices}
              onChange={(event) => setSearchInvoices(event.target.value)}
              placeholder="Search invoices"
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="py-2 px-3">Invoice #</th>
                  <th className="py-2 px-3">Business</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500">
                      Loading invoices...
                    </td>
                  </tr>
                ) : (
                  invoices
                    .filter((invoice) =>
                      searchInvoices
                        ? `${invoice.invoiceNumber} ${invoice.status}`
                            .toLowerCase()
                            .includes(searchInvoices.toLowerCase())
                        : true
                    )
                    .map((invoice) => (
                      <tr key={invoice._id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-3 text-gray-900 dark:text-white">{invoice.invoiceNumber}</td>
                        <td className="py-2 px-3 text-gray-500">{invoice.business?.name || '—'}</td>
                        <td className="py-2 px-3 text-gray-500">{invoice.customer?.name || '—'}</td>
                        <td className="py-2 px-3 text-gray-500">{invoice.status}</td>
                        <td className="py-2 px-3 text-gray-500">
                          {invoice.total?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payments</h2>
            <input
              value={searchPayments}
              onChange={(event) => setSearchPayments(event.target.value)}
              placeholder="Search payments"
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="py-2 px-3">Invoice</th>
                  <th className="py-2 px-3">Business</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">Method</th>
                  <th className="py-2 px-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500">
                      Loading payments...
                    </td>
                  </tr>
                ) : (
                  payments
                    .filter((payment) =>
                      searchPayments
                        ? `${payment.paymentMethod} ${payment.status}`
                            .toLowerCase()
                            .includes(searchPayments.toLowerCase())
                        : true
                    )
                    .map((payment) => (
                      <tr key={payment._id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-3 text-gray-900 dark:text-white">
                          {payment.invoice?.invoiceNumber || '—'}
                        </td>
                        <td className="py-2 px-3 text-gray-500">{payment.business?.name || '—'}</td>
                        <td className="py-2 px-3 text-gray-500">{payment.customer?.name || '—'}</td>
                        <td className="py-2 px-3 text-gray-500">{payment.paymentMethod}</td>
                        <td className="py-2 px-3 text-gray-500">
                          {payment.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customers</h2>
            <input
              value={searchCustomers}
              onChange={(event) => setSearchCustomers(event.target.value)}
              placeholder="Search customers"
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Business</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-gray-500">
                      Loading customers...
                    </td>
                  </tr>
                ) : (
                  customers
                    .filter((customer) =>
                      searchCustomers
                        ? `${customer.name} ${customer.email || ''}`
                            .toLowerCase()
                            .includes(searchCustomers.toLowerCase())
                        : true
                    )
                    .map((customer) => (
                      <tr key={customer._id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-3 text-gray-900 dark:text-white">{customer.name}</td>
                        <td className="py-2 px-3 text-gray-500">{customer.email || '—'}</td>
                        <td className="py-2 px-3 text-gray-500">{customer.business?.name || '—'}</td>
                        <td className="py-2 px-3 text-gray-500">
                          {customer.isActive === false ? 'Inactive' : 'Active'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Products</h2>
            <input
              value={searchProducts}
              onChange={(event) => setSearchProducts(event.target.value)}
              placeholder="Search products"
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">SKU</th>
                  <th className="py-2 px-3">Business</th>
                  <th className="py-2 px-3">Price</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-gray-500">
                      Loading products...
                    </td>
                  </tr>
                ) : (
                  products
                    .filter((product) =>
                      searchProducts
                        ? `${product.name} ${product.sku || ''}`
                            .toLowerCase()
                            .includes(searchProducts.toLowerCase())
                        : true
                    )
                    .map((product) => (
                      <tr key={product._id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-3 text-gray-900 dark:text-white">{product.name}</td>
                        <td className="py-2 px-3 text-gray-500">{product.sku || '—'}</td>
                        <td className="py-2 px-3 text-gray-500">{product.business?.name || '—'}</td>
                        <td className="py-2 px-3 text-gray-500">
                          {product.sellingPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'receipts' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Receipts</h2>
            <input
              value={searchReceipts}
              onChange={(event) => setSearchReceipts(event.target.value)}
              placeholder="Search receipts"
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="py-2 px-3">Receipt #</th>
                  <th className="py-2 px-3">Business</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-gray-500">
                      Loading receipts...
                    </td>
                  </tr>
                ) : (
                  receipts
                    .filter((receipt) =>
                      searchReceipts
                        ? `${receipt.receiptNumber} ${receipt.paymentMethod || ''}`
                            .toLowerCase()
                            .includes(searchReceipts.toLowerCase())
                        : true
                    )
                    .map((receipt) => (
                      <tr key={receipt._id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-3 text-gray-900 dark:text-white">{receipt.receiptNumber}</td>
                        <td className="py-2 px-3 text-gray-500">{receipt.business?.name || '—'}</td>
                        <td className="py-2 px-3 text-gray-500">{receipt.customer?.name || '—'}</td>
                        <td className="py-2 px-3 text-gray-500">
                          {receipt.total?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SuperAdmin;
