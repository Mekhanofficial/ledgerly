import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ShieldCheck, RefreshCw, KeyRound, RotateCcw, Copy } from 'lucide-react';
import api from '../../services/api';
import { getUserRoleLabel } from '../../utils/userDisplay';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import CountUpNumber from '../../components/ui/CountUpNumber';

const roleOptions = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'staff', label: 'Staff' },
  { value: 'client', label: 'Client' },
  { value: 'viewer', label: 'Viewer' }
];

const partnerScopeOptions = [
  { value: 'templates:read', label: 'Templates Read' },
  { value: 'invoices:create', label: 'Invoices Create' },
  { value: 'invoices:read', label: 'Invoices Read' },
  { value: 'invoices:pdf', label: 'Invoices PDF' },
  { value: 'invoices:send', label: 'Invoices Send' }
];

const createPartnerFormState = (businessId = '') => ({
  businessId,
  name: '',
  description: '',
  webhookUrl: '',
  rateLimitPerMinute: 120,
  isActive: true,
  allowAllTemplates: false,
  allowedTemplateIds: ['standard'],
  defaultTemplateId: 'standard',
  scopes: ['templates:read', 'invoices:create', 'invoices:read']
});

const TABLE_PAGE_SIZE = 10;

const paginateRows = (rows, page, pageSize = TABLE_PAGE_SIZE) => {
  const total = Array.isArray(rows) ? rows.length : 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page || 1, 1), pageCount);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  return {
    rows: (rows || []).slice(startIndex, endIndex),
    total,
    pageCount,
    page: safePage,
    start: total === 0 ? 0 : startIndex + 1,
    end: endIndex
  };
};

const TablePagination = ({ pageData, onPageChange }) => {
  if (!pageData || pageData.total <= TABLE_PAGE_SIZE) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-500">
      <p>
        Showing {pageData.start}-{pageData.end} of {pageData.total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(pageData.page - 1)}
          disabled={pageData.page <= 1}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <span className="text-gray-600 dark:text-gray-300">
          Page {pageData.page} of {pageData.pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(pageData.page + 1)}
          disabled={pageData.page >= pageData.pageCount}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

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
  const [searchPartners, setSearchPartners] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [partnerBusinessFilter, setPartnerBusinessFilter] = useState('');
  const [partnerTemplateOptions, setPartnerTemplateOptions] = useState([]);
  const [partnerForm, setPartnerForm] = useState(createPartnerFormState());
  const [editingPartnerId, setEditingPartnerId] = useState('');
  const [savingPartner, setSavingPartner] = useState(false);
  const [generatedPartnerKey, setGeneratedPartnerKey] = useState('');
  const [partnerError, setPartnerError] = useState('');
  const [tablePages, setTablePages] = useState({
    users: 1,
    businesses: 1,
    invoices: 1,
    payments: 1,
    customers: 1,
    products: 1,
    receipts: 1,
    partners: 1
  });

  const setTablePage = (table, nextPage) => {
    setTablePages((prev) => ({
      ...prev,
      [table]: Math.max(1, Number(nextPage) || 1)
    }));
  };

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
      const nextBusinesses = bizRes.data.data || [];
      setBusinesses(nextBusinesses);
      if (!partnerBusinessFilter && nextBusinesses.length > 0) {
        setPartnerBusinessFilter(nextBusinesses[0]._id);
      }
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

  const fetchPartnerTemplateOptions = async (businessId) => {
    if (!businessId) {
      setPartnerTemplateOptions([]);
      return [];
    }

    try {
      const response = await api.get('/super-admin/partner-template-options', {
        params: { businessId }
      });
      const templates = response?.data?.data?.templates || [];
      setPartnerTemplateOptions(templates);
      return templates;
    } catch (error) {
      console.error('Failed to load partner template options', error);
      setPartnerTemplateOptions([]);
      return [];
    }
  };

  const loadPartners = async (businessIdOverride = undefined) => {
    setLoadingPartners(true);
    setPartnerError('');
    try {
      const businessId = businessIdOverride !== undefined
        ? businessIdOverride
        : partnerBusinessFilter;
      const params = { limit: 200 };
      if (businessId) {
        params.businessId = businessId;
      }
      const response = await api.get('/super-admin/partners', { params });
      setPartners(response.data.data || []);
    } catch (error) {
      console.error('Failed to load partner integrations', error);
      setPartnerError(error?.response?.data?.error || 'Failed to load partner integrations');
    } finally {
      setLoadingPartners(false);
    }
  };

  const resetPartnerForm = async (businessId = '') => {
    setEditingPartnerId('');
    setGeneratedPartnerKey('');
    setPartnerError('');
    setPartnerForm(createPartnerFormState(businessId));
    await fetchPartnerTemplateOptions(businessId);
  };

  const openPartnerEditor = async (partner) => {
    const businessId = partner.business?._id || partner.business || '';
    setEditingPartnerId(partner._id);
    setGeneratedPartnerKey('');
    setPartnerError('');
    setPartnerForm({
      businessId,
      name: partner.name || '',
      description: partner.description || '',
      webhookUrl: partner.webhookUrl || '',
      rateLimitPerMinute: partner.rateLimitPerMinute || 120,
      isActive: partner.isActive !== false,
      allowAllTemplates: Boolean(partner.allowAllTemplates),
      allowedTemplateIds: Array.isArray(partner.allowedTemplateIds)
        ? partner.allowedTemplateIds
        : ['standard'],
      defaultTemplateId: partner.defaultTemplateId || 'standard',
      scopes: Array.isArray(partner.scopes)
        ? partner.scopes
        : ['templates:read', 'invoices:create', 'invoices:read']
    });
    await fetchPartnerTemplateOptions(businessId);
  };

  const submitPartnerForm = async (event) => {
    event.preventDefault();
    setSavingPartner(true);
    setPartnerError('');

    const payload = {
      businessId: partnerForm.businessId,
      name: partnerForm.name,
      description: partnerForm.description,
      webhookUrl: partnerForm.webhookUrl,
      rateLimitPerMinute: Number(partnerForm.rateLimitPerMinute) || 120,
      isActive: partnerForm.isActive,
      allowAllTemplates: partnerForm.allowAllTemplates,
      allowedTemplateIds: partnerForm.allowAllTemplates ? [] : partnerForm.allowedTemplateIds,
      defaultTemplateId: partnerForm.defaultTemplateId,
      scopes: partnerForm.scopes
    };

    try {
      if (editingPartnerId) {
        await api.put(`/super-admin/partners/${editingPartnerId}`, payload);
      } else {
        const response = await api.post('/super-admin/partners', payload);
        setGeneratedPartnerKey(response?.data?.apiKey || '');
      }

      await loadPartners();
      await fetchOverview();

      if (!editingPartnerId) {
        setEditingPartnerId('');
        setPartnerError('');
        setPartnerForm(createPartnerFormState(payload.businessId));
        await fetchPartnerTemplateOptions(payload.businessId);
      }
    } catch (error) {
      console.error('Failed to save partner integration', error);
      setPartnerError(error?.response?.data?.error || 'Failed to save partner integration');
    } finally {
      setSavingPartner(false);
    }
  };

  const togglePartnerActive = async (partner) => {
    try {
      await api.put(`/super-admin/partners/${partner._id}`, { isActive: !partner.isActive });
      await loadPartners();
      await fetchOverview();
    } catch (error) {
      console.error('Failed to update partner status', error);
      setPartnerError(error?.response?.data?.error || 'Failed to update partner status');
    }
  };

  const rotatePartnerApiKey = async (partner) => {
    try {
      const response = await api.post(`/super-admin/partners/${partner._id}/rotate-key`);
      setGeneratedPartnerKey(response?.data?.apiKey || '');
      await loadPartners();
    } catch (error) {
      console.error('Failed to rotate partner key', error);
      setPartnerError(error?.response?.data?.error || 'Failed to rotate partner key');
    }
  };

  const copyGeneratedKey = async () => {
    if (!generatedPartnerKey) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(generatedPartnerKey);
      }
    } catch (error) {
      console.error('Failed to copy generated API key', error);
    }
  };

  const onPartnerBusinessChange = async (businessId) => {
    setPartnerForm((prev) => ({
      ...prev,
      businessId,
      allowedTemplateIds: ['standard'],
      defaultTemplateId: 'standard'
    }));
    await fetchPartnerTemplateOptions(businessId);
  };

  const togglePartnerScope = (scope) => {
    setPartnerForm((prev) => {
      const nextScopes = prev.scopes.includes(scope)
        ? prev.scopes.filter((value) => value !== scope)
        : [...prev.scopes, scope];
      return {
        ...prev,
        scopes: nextScopes.length ? nextScopes : ['templates:read']
      };
    });
  };

  const togglePartnerTemplate = (templateId) => {
    setPartnerForm((prev) => {
      const exists = prev.allowedTemplateIds.includes(templateId);
      const nextAllowedTemplateIds = exists
        ? prev.allowedTemplateIds.filter((id) => id !== templateId)
        : [...prev.allowedTemplateIds, templateId];
      return {
        ...prev,
        allowedTemplateIds: nextAllowedTemplateIds,
        defaultTemplateId: nextAllowedTemplateIds.includes(prev.defaultTemplateId)
          ? prev.defaultTemplateId
          : (nextAllowedTemplateIds[0] || 'standard')
      };
    });
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
    if (activeTab === 'partners' && partners.length === 0) {
      loadPartners();
    }
  }, [activeTab, isSuperAdmin, partnerBusinessFilter]);

  useEffect(() => {
    if (!isSuperAdmin || activeTab !== 'partners') return;
    loadPartners();
  }, [partnerBusinessFilter]);

  useEffect(() => {
    if (!businesses.length || partnerForm.businessId || editingPartnerId) return;
    const firstBusinessId = businesses[0]._id;
    setPartnerForm((prev) => ({ ...prev, businessId: firstBusinessId }));
    fetchPartnerTemplateOptions(firstBusinessId);
  }, [businesses, partnerForm.businessId, editingPartnerId]);

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

  const filteredPartners = useMemo(() => {
    if (!searchPartners) return partners;
    const term = searchPartners.toLowerCase();
    return partners.filter((partner) => {
      const businessName = partner.business?.name || '';
      return (
        partner.name?.toLowerCase().includes(term)
        || partner.description?.toLowerCase().includes(term)
        || businessName.toLowerCase().includes(term)
        || partner.keyPrefix?.toLowerCase().includes(term)
      );
    });
  }, [partners, searchPartners]);

  const filteredInvoices = useMemo(() => {
    if (!searchInvoices) return invoices;
    const term = searchInvoices.toLowerCase();
    return invoices.filter((invoice) =>
      `${invoice.invoiceNumber || ''} ${invoice.status || ''}`.toLowerCase().includes(term)
    );
  }, [invoices, searchInvoices]);

  const filteredPayments = useMemo(() => {
    if (!searchPayments) return payments;
    const term = searchPayments.toLowerCase();
    return payments.filter((payment) =>
      `${payment.paymentMethod || ''} ${payment.status || ''}`.toLowerCase().includes(term)
    );
  }, [payments, searchPayments]);

  const filteredCustomers = useMemo(() => {
    if (!searchCustomers) return customers;
    const term = searchCustomers.toLowerCase();
    return customers.filter((customer) =>
      `${customer.name || ''} ${customer.email || ''}`.toLowerCase().includes(term)
    );
  }, [customers, searchCustomers]);

  const filteredProducts = useMemo(() => {
    if (!searchProducts) return products;
    const term = searchProducts.toLowerCase();
    return products.filter((product) =>
      `${product.name || ''} ${product.sku || ''}`.toLowerCase().includes(term)
    );
  }, [products, searchProducts]);

  const filteredReceipts = useMemo(() => {
    if (!searchReceipts) return receipts;
    const term = searchReceipts.toLowerCase();
    return receipts.filter((receipt) =>
      `${receipt.receiptNumber || ''} ${receipt.paymentMethod || ''}`.toLowerCase().includes(term)
    );
  }, [receipts, searchReceipts]);

  const paginatedUsers = useMemo(
    () => paginateRows(filteredUsers, tablePages.users),
    [filteredUsers, tablePages.users]
  );
  const paginatedBusinesses = useMemo(
    () => paginateRows(filteredBusinesses, tablePages.businesses),
    [filteredBusinesses, tablePages.businesses]
  );
  const paginatedInvoices = useMemo(
    () => paginateRows(filteredInvoices, tablePages.invoices),
    [filteredInvoices, tablePages.invoices]
  );
  const paginatedPayments = useMemo(
    () => paginateRows(filteredPayments, tablePages.payments),
    [filteredPayments, tablePages.payments]
  );
  const paginatedCustomers = useMemo(
    () => paginateRows(filteredCustomers, tablePages.customers),
    [filteredCustomers, tablePages.customers]
  );
  const paginatedProducts = useMemo(
    () => paginateRows(filteredProducts, tablePages.products),
    [filteredProducts, tablePages.products]
  );
  const paginatedReceipts = useMemo(
    () => paginateRows(filteredReceipts, tablePages.receipts),
    [filteredReceipts, tablePages.receipts]
  );
  const paginatedPartners = useMemo(
    () => paginateRows(filteredPartners, tablePages.partners),
    [filteredPartners, tablePages.partners]
  );

  useEffect(() => {
    const pageCounts = {
      users: paginatedUsers.pageCount,
      businesses: paginatedBusinesses.pageCount,
      invoices: paginatedInvoices.pageCount,
      payments: paginatedPayments.pageCount,
      customers: paginatedCustomers.pageCount,
      products: paginatedProducts.pageCount,
      receipts: paginatedReceipts.pageCount,
      partners: paginatedPartners.pageCount
    };

    setTablePages((prev) => {
      let changed = false;
      const next = { ...prev };
      Object.entries(pageCounts).forEach(([table, pageCount]) => {
        const currentPage = Math.max(1, Number(prev[table]) || 1);
        const boundedPage = Math.min(currentPage, pageCount);
        if (boundedPage !== currentPage) {
          next[table] = boundedPage;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [
    paginatedUsers.pageCount,
    paginatedBusinesses.pageCount,
    paginatedInvoices.pageCount,
    paginatedPayments.pageCount,
    paginatedCustomers.pageCount,
    paginatedProducts.pageCount,
    paginatedReceipts.pageCount,
    paginatedPartners.pageCount
  ]);

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
          { id: 'receipts', label: 'Receipts' },
          { id: 'partners', label: 'Partners/API' }
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
            { label: 'Receipts', value: overview?.receipts ?? '-' },
            { label: 'Partners', value: overview?.partners ?? '-' }
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4"
            >
              <p className="text-sm uppercase text-gray-500">{stat.label}</p>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white stat-value-safe">
                <CountUpNumber value={stat.value} />
              </p>
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
              onChange={(event) => {
                setSearchUsers(event.target.value);
                setTablePage('users', 1);
              }}
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
                  paginatedUsers.rows.map((user) => (
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
                      <td className="py-2 px-3 text-gray-500">{user.business?.name || '-'}</td>
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
          <TablePagination
            pageData={paginatedUsers}
            onPageChange={(page) => setTablePage('users', page)}
          />
        </div>
      )}

      {activeTab === 'businesses' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Businesses</h2>
            <input
              value={searchBusinesses}
              onChange={(event) => {
                setSearchBusinesses(event.target.value);
                setTablePage('businesses', 1);
              }}
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
                  paginatedBusinesses.rows.map((biz) => (
                    <tr key={biz._id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="py-2 px-3 text-gray-900 dark:text-white">{biz.name}</td>
                      <td className="py-2 px-3 text-gray-500">{biz.email}</td>
                      <td className="py-2 px-3 text-gray-500">
                        {biz.owner?.name || biz.owner?.email || '-'}
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
          <TablePagination
            pageData={paginatedBusinesses}
            onPageChange={(page) => setTablePage('businesses', page)}
          />
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
              onChange={(event) => {
                setSearchInvoices(event.target.value);
                setTablePage('invoices', 1);
              }}
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
                  paginatedInvoices.rows.map((invoice) => (
                      <tr key={invoice._id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-3 text-gray-900 dark:text-white">{invoice.invoiceNumber}</td>
                        <td className="py-2 px-3 text-gray-500">{invoice.business?.name || '-'}</td>
                        <td className="py-2 px-3 text-gray-500">{invoice.customer?.name || '-'}</td>
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
          <TablePagination
            pageData={paginatedInvoices}
            onPageChange={(page) => setTablePage('invoices', page)}
          />
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payments</h2>
            <input
              value={searchPayments}
              onChange={(event) => {
                setSearchPayments(event.target.value);
                setTablePage('payments', 1);
              }}
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
                  paginatedPayments.rows.map((payment) => (
                      <tr key={payment._id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-3 text-gray-900 dark:text-white">
                          {payment.invoice?.invoiceNumber || '-'}
                        </td>
                        <td className="py-2 px-3 text-gray-500">{payment.business?.name || '-'}</td>
                        <td className="py-2 px-3 text-gray-500">{payment.customer?.name || '-'}</td>
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
          <TablePagination
            pageData={paginatedPayments}
            onPageChange={(page) => setTablePage('payments', page)}
          />
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customers</h2>
            <input
              value={searchCustomers}
              onChange={(event) => {
                setSearchCustomers(event.target.value);
                setTablePage('customers', 1);
              }}
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
                  paginatedCustomers.rows.map((customer) => (
                      <tr key={customer._id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-3 text-gray-900 dark:text-white">{customer.name}</td>
                        <td className="py-2 px-3 text-gray-500">{customer.email || '-'}</td>
                        <td className="py-2 px-3 text-gray-500">{customer.business?.name || '-'}</td>
                        <td className="py-2 px-3 text-gray-500">
                          {customer.isActive === false ? 'Inactive' : 'Active'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            pageData={paginatedCustomers}
            onPageChange={(page) => setTablePage('customers', page)}
          />
        </div>
      )}

      {activeTab === 'products' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Products</h2>
            <input
              value={searchProducts}
              onChange={(event) => {
                setSearchProducts(event.target.value);
                setTablePage('products', 1);
              }}
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
                  paginatedProducts.rows.map((product) => (
                      <tr key={product._id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-3 text-gray-900 dark:text-white">{product.name}</td>
                        <td className="py-2 px-3 text-gray-500">{product.sku || '-'}</td>
                        <td className="py-2 px-3 text-gray-500">{product.business?.name || '-'}</td>
                        <td className="py-2 px-3 text-gray-500">
                          {product.sellingPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            pageData={paginatedProducts}
            onPageChange={(page) => setTablePage('products', page)}
          />
        </div>
      )}

      {activeTab === 'receipts' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Receipts</h2>
            <input
              value={searchReceipts}
              onChange={(event) => {
                setSearchReceipts(event.target.value);
                setTablePage('receipts', 1);
              }}
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
                  paginatedReceipts.rows.map((receipt) => (
                      <tr key={receipt._id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-3 text-gray-900 dark:text-white">{receipt.receiptNumber}</td>
                        <td className="py-2 px-3 text-gray-500">{receipt.business?.name || '-'}</td>
                        <td className="py-2 px-3 text-gray-500">{receipt.customer?.name || '-'}</td>
                        <td className="py-2 px-3 text-gray-500">
                          {receipt.total?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            pageData={paginatedReceipts}
            onPageChange={(page) => setTablePage('receipts', page)}
          />
        </div>
      )}

      {activeTab === 'partners' && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingPartnerId ? 'Edit Partner API' : 'Create Partner API'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => resetPartnerForm(partnerBusinessFilter || businesses[0]?._id || '')}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold"
              >
                New
              </button>
            </div>

            <form onSubmit={submitPartnerForm} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Business</label>
                <select
                  value={partnerForm.businessId}
                  onChange={(event) => onPartnerBusinessChange(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
                  disabled={Boolean(editingPartnerId)}
                >
                  <option value="">Select business</option>
                  {businesses.map((business) => (
                    <option key={business._id} value={business._id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                <input
                  value={partnerForm.name}
                  onChange={(event) => setPartnerForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Marketplace API Key"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <textarea
                  value={partnerForm.description}
                  onChange={(event) => setPartnerForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Used by external marketplace checkout flow"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm min-h-[72px]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Webhook URL (optional)</label>
                <input
                  value={partnerForm.webhookUrl}
                  onChange={(event) => setPartnerForm((prev) => ({ ...prev, webhookUrl: event.target.value }))}
                  placeholder="https://partner.com/webhooks/ledgerly"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Rate Limit / Min</label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={partnerForm.rateLimitPerMinute}
                    onChange={(event) => setPartnerForm((prev) => ({
                      ...prev,
                      rateLimitPerMinute: event.target.value
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mt-6">
                  <input
                    type="checkbox"
                    checked={partnerForm.isActive}
                    onChange={(event) => setPartnerForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  />
                  Active
                </label>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Scopes</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {partnerScopeOptions.map((scope) => (
                    <label
                      key={scope.value}
                      className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300"
                    >
                      <input
                        type="checkbox"
                        checked={partnerForm.scopes.includes(scope.value)}
                        onChange={() => togglePartnerScope(scope.value)}
                      />
                      {scope.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={partnerForm.allowAllTemplates}
                    onChange={(event) => setPartnerForm((prev) => ({
                      ...prev,
                      allowAllTemplates: event.target.checked
                    }))}
                  />
                  Allow all business templates
                </label>
              </div>

              {!partnerForm.allowAllTemplates && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Template Access</p>
                  <div className="max-h-44 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1">
                    {partnerTemplateOptions.map((template) => (
                      <label
                        key={template.id}
                        className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300"
                      >
                        <input
                          type="checkbox"
                          checked={partnerForm.allowedTemplateIds.includes(template.id)}
                          onChange={() => togglePartnerTemplate(template.id)}
                        />
                        <span>{template.name}</span>
                        <span className="text-[10px] uppercase text-gray-400">{template.category}</span>
                      </label>
                    ))}
                    {!partnerTemplateOptions.length && (
                      <p className="text-xs text-gray-400">No templates available for this business.</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-500 mb-1">Default Template</label>
                <select
                  value={partnerForm.defaultTemplateId}
                  onChange={(event) => setPartnerForm((prev) => ({
                    ...prev,
                    defaultTemplateId: event.target.value
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
                >
                  {(partnerForm.allowAllTemplates
                    ? partnerTemplateOptions
                    : partnerTemplateOptions.filter((template) => partnerForm.allowedTemplateIds.includes(template.id))
                  ).map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={savingPartner || !partnerForm.businessId}
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60"
                >
                  {savingPartner ? 'Saving...' : (editingPartnerId ? 'Update Partner' : 'Create Partner')}
                </button>
                {editingPartnerId && (
                  <button
                    type="button"
                    onClick={() => resetPartnerForm(partnerBusinessFilter || businesses[0]?._id || '')}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {generatedPartnerKey && (
              <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  One-time API key
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                  Copy and store this now. It will not be shown again.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[11px] px-2 py-1 rounded bg-white dark:bg-gray-900 border border-amber-200 overflow-x-auto">
                    {generatedPartnerKey}
                  </code>
                  <button
                    type="button"
                    onClick={copyGeneratedKey}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-amber-300 text-amber-900 dark:text-amber-200 text-xs"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
              </div>
            )}

            {partnerError && (
              <p className="text-xs text-red-600 mt-3">{partnerError}</p>
            )}
          </div>

          <div className="xl:col-span-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Partner Integrations</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={partnerBusinessFilter}
                  onChange={(event) => {
                    setPartnerBusinessFilter(event.target.value);
                    setTablePage('partners', 1);
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
                >
                  <option value="">All businesses</option>
                  {businesses.map((business) => (
                    <option key={business._id} value={business._id}>
                      {business.name}
                    </option>
                  ))}
                </select>
                <input
                  value={searchPartners}
                  onChange={(event) => {
                    setSearchPartners(event.target.value);
                    setTablePage('partners', 1);
                  }}
                  placeholder="Search partners"
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-gray-500">
                  <tr>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Business</th>
                    <th className="py-2 px-3">Scopes</th>
                    <th className="py-2 px-3">Templates</th>
                    <th className="py-2 px-3">Key</th>
                    <th className="py-2 px-3">Last Used</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPartners ? (
                    <tr>
                      <td colSpan="8" className="py-6 text-center text-gray-500">
                        Loading partner integrations...
                      </td>
                    </tr>
                  ) : (
                    paginatedPartners.rows.map((partner) => (
                      <tr key={partner._id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-3">
                          <p className="text-gray-900 dark:text-white font-medium">{partner.name}</p>
                          <p className="text-xs text-gray-400">{partner.description || '-'}</p>
                        </td>
                        <td className="py-2 px-3 text-gray-500">{partner.business?.name || '-'}</td>
                        <td className="py-2 px-3 text-gray-500 text-xs">
                          {(partner.scopes || []).join(', ') || '-'}
                        </td>
                        <td className="py-2 px-3 text-gray-500 text-xs">
                          {partner.allowAllTemplates
                            ? 'All'
                            : `${partner.allowedTemplateIds?.length || 0} selected`}
                        </td>
                        <td className="py-2 px-3 text-gray-500 text-xs font-mono">
                          {partner.apiKeyMasked || `${partner.keyPrefix || ''}********${partner.keyLast4 || ''}`}
                        </td>
                        <td className="py-2 px-3 text-gray-500 text-xs">
                          {partner.lastUsedAt ? new Date(partner.lastUsedAt).toLocaleString() : '-'}
                        </td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => togglePartnerActive(partner)}
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              partner.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {partner.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openPartnerEditor(partner)}
                              className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => rotatePartnerApiKey(partner)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-xs"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Rotate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination
              pageData={paginatedPartners}
              onPageChange={(page) => setTablePage('partners', page)}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SuperAdmin;
