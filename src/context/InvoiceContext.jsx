import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from './ToastContext';
import { useNotifications } from './NotificationContext';
import templateStorage from '../utils/templateStorage';
import { fetchTemplates } from '../services/templateService';
import {
  fetchInvoices,
  createInvoice as createInvoiceThunk,
  updateInvoice as updateInvoiceThunk,
  deleteInvoice as deleteInvoiceThunk,
  sendInvoice as sendInvoiceThunk,
  recordPayment
} from '../store/slices/invoiceSlice';
import {
  fetchCustomers,
  createCustomer as createCustomerThunk,
  updateCustomer as updateCustomerThunk,
  deleteCustomer as deleteCustomerThunk
} from '../store/slices/customerSlice';
import {
  fetchProducts,
  createProduct as createProductThunk,
  updateProduct as updateProductThunk,
  deleteProduct as deleteProductThunk
} from '../store/slices/productSlide';
import { mapInvoiceFromApi, buildInvoicePayload } from '../utils/invoiceAdapter';
import { mapCustomerFromApi, buildCustomerPayload } from '../utils/customerAdapter';
import { mapProductFromApi, buildProductPayload } from '../utils/productAdapter';
import { draftStorage } from '../utils/draftStorage';
import { recurringStorage } from '../utils/recurringStorage';

const dedupeTemplates = (templates = []) => {
  const map = new Map();
  templates.forEach((template) => {
    if (template?.id && !map.has(template.id)) {
      map.set(template.id, template);
    }
  });
  return Array.from(map.values());
};

export const InvoiceContext = createContext();

export const useInvoice = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoice must be used within InvoiceProvider');
  }
  return context;
};

export const InvoiceProvider = ({ children }) => {
  const { addToast } = useToast();
  const { addNotification } = useNotifications();
  const dispatch = useDispatch();
  const { invoices: rawInvoices, loading: invoicesLoading } = useSelector((state) => state.invoices);
  const { customers: rawCustomers } = useSelector((state) => state.customers);
  const { products: rawProducts } = useSelector((state) => state.products);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const invoices = useMemo(() => {
    const source = Array.isArray(rawInvoices) ? rawInvoices : [];
    return source.map((invoice) => mapInvoiceFromApi(invoice));
  }, [rawInvoices]);
  const customers = useMemo(() => {
    const source = Array.isArray(rawCustomers) ? rawCustomers : [];
    return source.map((customer) => mapCustomerFromApi(customer));
  }, [rawCustomers]);
  const products = useMemo(() => {
    const source = Array.isArray(rawProducts) ? rawProducts : [];
    return source.map((product) => mapProductFromApi(product));
  }, [rawProducts]);

  const [drafts, setDrafts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [recurringInvoices, setRecurringInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchInvoices());
    dispatch(fetchCustomers());
    dispatch(fetchProducts({ isActive: true }));
  }, [dispatch, isAuthenticated]);

  const refreshTemplates = useCallback(async () => {
    try {
      const payload = await fetchTemplates();
      const data = Array.isArray(payload?.data) ? payload.data : [];
      const uniqueTemplates = dedupeTemplates(data);
      setTemplates(uniqueTemplates);
      return uniqueTemplates;
    } catch (error) {
      console.error('Error loading templates from backend:', error);
      const fallback = dedupeTemplates(templateStorage.getAllTemplates());
      setTemplates(fallback);
      return fallback;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setDrafts(draftStorage.getDrafts());
        setRecurringInvoices(recurringStorage.getRecurringInvoices());

        if (isAuthenticated) {
          await refreshTemplates();
        } else {
          setTemplates(dedupeTemplates(templateStorage.getAllTemplates()));
        }
      } catch (error) {
        console.error('Error loading invoice context data:', error);
        addToast('Error loading invoice data', 'error');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [addToast, refreshTemplates, isAuthenticated]);

  const allowedInvoiceStatuses = useMemo(
    () => new Set(['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'void']),
    []
  );

  const normalizeInvoiceUpdate = useCallback((updates = {}) => {
    const payload = { ...updates };

    if (payload.issueDate) {
      payload.date = new Date(payload.issueDate);
      delete payload.issueDate;
    }

    if (payload.due && !payload.dueDate) {
      payload.dueDate = payload.due;
      delete payload.due;
    }

    if (payload.sentAt && !payload.sentDate) {
      payload.sentDate = payload.sentAt;
    }
    delete payload.sentAt;

    if (payload.customerId && !payload.customer) {
      payload.customer = payload.customerId;
    } else if (payload.customer && typeof payload.customer === 'object') {
      payload.customer = payload.customer._id || payload.customer.id || payload.customer.value || '';
    }
    delete payload.customerId;

    if (payload.totalAmount != null && payload.total == null) {
      payload.total = payload.totalAmount;
    }
    delete payload.totalAmount;

    if (payload.totalTax != null && payload.tax == null) {
      payload.tax = { amount: payload.totalTax };
    }
    delete payload.totalTax;

    delete payload.lineItems;
    delete payload.amount;

    return payload;
  }, []);

  const normalizeProductUpdate = useCallback((updates = {}) => {
    const payload = {};

    if (updates.name !== undefined) {
      payload.name = updates.name?.trim();
    }

    if (updates.description !== undefined) {
      payload.description = updates.description?.trim();
    }

    if (updates.sku !== undefined) {
      payload.sku = updates.sku?.trim();
    }

    if (updates.price !== undefined || updates.sellingPrice !== undefined) {
      const priceValue = updates.sellingPrice ?? updates.price;
      const parsedPrice = Number(priceValue);
      if (Number.isFinite(parsedPrice)) {
        payload.sellingPrice = parsedPrice;
      }
    }

    if (updates.costPrice !== undefined) {
      const parsedCost = Number(updates.costPrice);
      if (Number.isFinite(parsedCost)) {
        payload.costPrice = parsedCost;
      }
    }

    if (updates.unit !== undefined) {
      payload.unit = updates.unit || 'pcs';
    }

    if (updates.isActive !== undefined) {
      payload.isActive = updates.isActive;
    }

    if (updates.categoryId) {
      payload.category = updates.categoryId;
    }

    if (updates.supplierId) {
      payload.supplier = updates.supplierId;
    }

    if (updates.quantity !== undefined || updates.reorderLevel !== undefined) {
      const quantityValue = updates.quantity;
      const reorderValue = updates.reorderLevel;
      const stockPayload = {};

      if (quantityValue !== undefined) {
        const parsedQty = Number(quantityValue);
        if (Number.isFinite(parsedQty)) {
          stockPayload.quantity = parsedQty;
        }
      }

      if (reorderValue !== undefined) {
        const parsedReorder = Number(reorderValue);
        if (Number.isFinite(parsedReorder)) {
          stockPayload.lowStockThreshold = parsedReorder;
        }
      }

      if (Object.keys(stockPayload).length > 0) {
        payload.stock = stockPayload;
      }
    }

    if (updates.image) {
      payload.images = [{ url: updates.image, isPrimary: true }];
    }

    return payload;
  }, []);

  // Get invoices ready for payment
  const getInvoicesForPayment = useCallback((status) => {
    const validStatuses = status
      ? new Set([status])
      : new Set(['sent', 'partial', 'overdue', 'viewed']);

    return invoices.filter(invoice =>
      validStatuses.has(invoice.status) &&
      (invoice.balance ?? invoice.totalAmount ?? invoice.amount ?? 0) > 0 &&
      !invoice.paidAt
    );
  }, [invoices]);

  // Keep for compatibility; backend controls status
  const markInvoiceAsApproved = useCallback((invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return null;

    addNotification({
      type: 'invoice_approved',
      title: 'Invoice Ready for Payment',
      description: `Invoice #${invoice.invoiceNumber || invoice.number} is now available for payment processing`,
      time: 'Just now',
      action: 'Process Payment',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      link: `/payments?invoice=${invoiceId}`,
      icon: 'DollarSign',
      invoiceId
    });

    return invoice;
  }, [invoices, addNotification]);

  // NEW: Get products from inventory for invoice creation
  const getProductsFromInventory = useCallback((category = 'all') => {
    if (category === 'all') {
      return products;
    }
    return products.filter(product => product.categoryId === category || product.category === category);
  }, [products]);

  // Inventory updates happen on the backend when payments are recorded
  const updateStockOnPayment = useCallback(() => {}, []);

  // Invoice Functions - backend powered
  const addInvoice = async (invoiceData) => {
    try {
      const payload = buildInvoicePayload(invoiceData);
      const created = await dispatch(createInvoiceThunk(payload)).unwrap();
      const mappedInvoice = mapInvoiceFromApi(created);

      addNotification({
        type: 'new-invoice',
        title: 'New Invoice Created',
        description: `Invoice #${mappedInvoice.invoiceNumber || mappedInvoice.number} created`,
        details: `Amount: $${(mappedInvoice.totalAmount || 0).toLocaleString()}`,
        time: 'Just now',
        action: 'View Invoice',
        color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
        link: `/invoices/view/${mappedInvoice.id}`,
        icon: 'FileText',
        invoiceId: mappedInvoice.id
      });

      return mappedInvoice;
    } catch (error) {
      addToast(error?.message || 'Error creating invoice', 'error');
      throw error;
    }
  };

  const updateInvoice = async (id, updates = {}) => {
    const existingInvoice = invoices.find(inv => inv.id === id);
    if (!existingInvoice) {
      addToast('Invoice not found', 'error');
      return null;
    }

    if (updates.status && !allowedInvoiceStatuses.has(updates.status)) {
      addToast('Unsupported invoice status update', 'warning');
      return null;
    }

    const hasLineItems = Array.isArray(updates.lineItems) || Array.isArray(updates.items);
    let payload;

    if (hasLineItems) {
      payload = buildInvoicePayload({
        ...existingInvoice,
        ...updates,
        status: updates.status || existingInvoice.status,
        customerId: updates.customerId || existingInvoice.customerId || existingInvoice.customer?._id || existingInvoice.customer,
        issueDate: updates.issueDate || existingInvoice.issueDate,
        dueDate: updates.dueDate || existingInvoice.dueDate,
        paymentTerms: updates.paymentTerms || existingInvoice.paymentTerms,
        currency: updates.currency || existingInvoice.currency,
        notes: updates.notes ?? existingInvoice.notes,
        terms: updates.terms ?? existingInvoice.terms
      });

      if (updates.sentAt || updates.sentDate) {
        payload.sentDate = updates.sentAt || updates.sentDate;
      }
    } else {
      payload = normalizeInvoiceUpdate(updates);
      if (updates.status === 'sent' && !payload.sentDate) {
        payload.sentDate = new Date();
      }
    }

    try {
      const updated = await dispatch(updateInvoiceThunk({ id, data: payload })).unwrap();
      return mapInvoiceFromApi(updated);
    } catch (error) {
      addToast(error?.message || 'Error updating invoice', 'error');
      return null;
    }
  };

  const deleteInvoice = async (id) => {
    try {
      const invoiceToDelete = invoices.find(inv => inv.id === id);
      await dispatch(deleteInvoiceThunk(id)).unwrap();

      addToast(`Invoice ${invoiceToDelete?.invoiceNumber || invoiceToDelete?.number || ''} deleted successfully!`, 'success');
      return true;
    } catch (error) {
      addToast(error?.message || 'Error deleting invoice', 'error');
      return false;
    }
  };

  const sendInvoice = async (id) => {
    try {
      const updated = await dispatch(sendInvoiceThunk(id)).unwrap();
      const mapped = mapInvoiceFromApi(updated);
      addToast('Invoice sent successfully', 'success');
      return mapped;
    } catch (error) {
      addToast(error?.message || 'Error sending invoice', 'error');
      return null;
    }
  };

  const markAsPaid = async (id, paymentData = {}, options = {}) => {
    const showToast = options.showToast ?? true;
    try {
      const invoice = invoices.find(inv => inv.id === id);
      const defaultAmount = invoice?.balance ?? invoice?.totalAmount ?? invoice?.amount ?? 0;
      const amount = paymentData.amount ?? defaultAmount;

      if (!amount || amount <= 0) {
        if (showToast) {
          addToast('Invalid payment amount', 'error');
        }
        return null;
      }

      const result = await dispatch(recordPayment({
        id,
        paymentData: {
          amount,
          paymentMethod: paymentData.paymentMethod || 'manual',
          paymentReference: paymentData.paymentReference,
          paymentGateway: paymentData.paymentGateway,
          notes: paymentData.notes
        }
      })).unwrap();

      const updatedInvoice = mapInvoiceFromApi(result?.invoice || result);
      if (showToast) {
        addToast('Payment recorded successfully', 'success');
      }
      return {
        invoice: updatedInvoice,
        payment: result?.payment,
        receipt: result?.receipt
      };
    } catch (error) {
      if (showToast) {
        addToast(error?.message || 'Error recording payment', 'error');
      }
      return null;
    }
  };

  // Calculate real-time stats
  const getInvoiceStats = () => {
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    
    // Calculate pending payments
    const pendingPayments = invoices.filter(inv => 
      ['sent', 'partial', 'overdue', 'viewed'].includes(inv.status)
    );
    const pendingAmount = pendingPayments.reduce(
      (sum, inv) => sum + (inv.balance ?? inv.totalAmount ?? inv.amount ?? 0),
      0
    );
    
    const sentInvoices = invoices.filter(inv => inv.status === 'sent').length;
    const draftInvoices = invoices.filter(inv => inv.status === 'draft').length;
    const viewedInvoices = invoices.filter(inv => inv.status === 'viewed').length;
    const cancelledInvoices = invoices.filter(inv => inv.status === 'cancelled').length;

    return {
      totalInvoices: totalInvoices.toString(),
      totalAmount: `$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      paidAmount: `$${paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      overdueAmount: `$${overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      pendingAmount: `$${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      pendingCount: pendingPayments.length,
      sentInvoices,
      draftInvoices,
      viewedInvoices,
      cancelledInvoices
    };
  };

  // Filter invoices
  const filterInvoices = ({ status = 'all', dateRange = 'all', minAmount = null, maxAmount = null, search = '' }) => {
    let filtered = [...invoices];

    // Status filter
    if (status !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === status);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(invoice => 
        (invoice.number && invoice.number.toLowerCase().includes(searchLower)) ||
        (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchLower)) ||
        ((typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.name || invoice.customerName || '').toLowerCase().includes(searchLower)) ||
        (invoice.customerEmail && invoice.customerEmail.toLowerCase().includes(searchLower))
      );
    }

    // Amount filter
    if (minAmount !== null) {
      filtered = filtered.filter(invoice => 
        (invoice.totalAmount || invoice.amount || 0) >= minAmount
      );
    }
    if (maxAmount !== null) {
      filtered = filtered.filter(invoice => 
        (invoice.totalAmount || invoice.amount || 0) <= maxAmount
      );
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(invoice => {
        const invoiceDate = new Date(invoice.issueDate || invoice.createdAt);

        switch (dateRange) {
          case 'today':
            return invoiceDate.toDateString() === now.toDateString();
          case 'this-week':
          case 'week': {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            return invoiceDate >= weekStart;
          }
          case 'this-month':
          case 'month':
            return invoiceDate.getMonth() === now.getMonth() &&
                   invoiceDate.getFullYear() === now.getFullYear();
          case 'this-quarter': {
            const quarter = Math.floor(now.getMonth() / 3);
            const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
            return invoiceDate >= quarterStart;
          }
          case 'this-year':
          case 'year':
            return invoiceDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  // Customer Functions
  const addCustomer = async (customerData, options = {}) => {
    try {
      const payload = buildCustomerPayload(customerData);
      const created = await dispatch(createCustomerThunk(payload)).unwrap();
      const newCustomer = mapCustomerFromApi(created);

      const showNotificationToast = options.showNotificationToast ?? true;
      addNotification({
        type: 'new-customer',
        title: 'New Customer Added',
        description: `${newCustomer.name} has been added`,
        details: newCustomer.email || 'No email provided',
        time: 'Just now',
        action: 'View Profile',
        color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        link: `/customers/${newCustomer.id}`,
        icon: 'UserPlus',
        customerId: newCustomer.id
      }, { showToast: showNotificationToast });

      return newCustomer;
    } catch (error) {
      addToast(error?.message || 'Error adding customer', 'error');
      throw error;
    }
  };

  const refreshCustomers = useCallback(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const updateCustomer = async (id, updates) => {
    try {
      const payload = { ...updates };
      if (payload.address && typeof payload.address === 'string') {
        payload.address = { street: payload.address };
      }

      const updated = await dispatch(updateCustomerThunk({ id, data: payload })).unwrap();
      return mapCustomerFromApi(updated);
    } catch (error) {
      addToast(error?.message || 'Error updating customer', 'error');
      return null;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      const customerToDelete = customers.find(c => c.id === id);
      await dispatch(deleteCustomerThunk(id)).unwrap();

      addToast(`Customer "${customerToDelete?.name || ''}" deleted successfully!`, 'success');
      return true;
    } catch (error) {
      addToast(error?.message || 'Error deleting customer', 'error');
      return false;
    }
  };

  const getCustomerStats = () => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.transactions > 0).length;
    const totalOutstanding = customers.reduce((sum, cust) => sum + (cust.outstanding || 0), 0);
    const totalSpent = customers.reduce((sum, cust) => sum + (cust.totalSpent || 0), 0);
    const avgTransactionValue = activeCustomers > 0 
      ? totalSpent / activeCustomers 
      : 0;

    const newCustomersThisMonth = customers.filter(c => {
      const customerDate = new Date(c.createdAt || c.joinedDate);
      const now = new Date();
      return customerDate.getMonth() === now.getMonth() && 
             customerDate.getFullYear() === now.getFullYear();
    }).length;

    const newCustomersLastMonth = customers.filter(c => {
      const customerDate = new Date(c.createdAt || c.joinedDate);
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return customerDate.getMonth() === lastMonth.getMonth() && 
             customerDate.getFullYear() === lastMonth.getFullYear();
    }).length;

    const customerChange = newCustomersLastMonth > 0 
      ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth * 100).toFixed(1)
      : newCustomersThisMonth > 0 ? '100.0' : '0.0';

    const outstandingCustomers = customers.filter(c => (c.outstanding || 0) > 0).length;

    return [
      { 
        label: 'Total Customers', 
        value: totalCustomers.toString(),
        description: `+${customerChange}% vs last month`
      },
      { 
        label: 'Active Customers', 
        value: activeCustomers.toString(),
        description: 'Transactions in last 90 days'
      },
      { 
        label: 'Total Outstanding', 
        value: `$${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        description: `Across ${outstandingCustomers} customers`
      },
      { 
        label: 'Avg Transaction Value', 
        value: `$${avgTransactionValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        description: '+4.2% vs last month'
      }
    ];
  };

  // NEW: Inventory functions
  const addProduct = async (productData) => {
    try {
      const payload = buildProductPayload(productData);
      const created = await dispatch(createProductThunk(payload)).unwrap();
      return mapProductFromApi(created);
    } catch (error) {
      addToast(error?.message || 'Error adding product', 'error');
      throw error;
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      const payload = normalizeProductUpdate(updates);
      const updated = await dispatch(updateProductThunk({ id, data: payload })).unwrap();
      return mapProductFromApi(updated);
    } catch (error) {
      addToast(error?.message || 'Error updating product', 'error');
      return null;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await dispatch(deleteProductThunk(id)).unwrap();
      addToast('Product deleted successfully!', 'success');
      return true;
    } catch (error) {
      addToast(error?.message || 'Error deleting product', 'error');
      return false;
    }
  };

  const getProductStats = () => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, prod) => sum + (prod.price * (prod.quantity || 0)), 0);
    const lowStock = products.filter(p => p.quantity <= 10 && p.quantity > 0).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    
    return {
      totalProducts,
      totalValue: `$${totalValue.toFixed(2)}`,
      lowStock,
      outOfStock,
      inStock: totalProducts - outOfStock
    };
  };

  // Draft Functions
  const saveDraft = (draftData) => {
    try {
      const newDraft = {
        id: `draft_${Date.now()}`,
        ...draftData,
        savedAt: new Date().toISOString(),
        status: 'draft'
      };
      const updatedDrafts = [...drafts, newDraft];
      setDrafts(updatedDrafts);
      
      addToast('Draft saved successfully!', 'success');
      return newDraft;
    } catch (error) {
      addToast('Error saving draft', 'error');
      throw error;
    }
  };

  const deleteDraft = (id) => {
    try {
      const draftToDelete = drafts.find(d => d.id === id);
      const updatedDrafts = drafts.filter(draft => draft.id !== id);
      setDrafts(updatedDrafts);
      
      addToast(`Draft ${draftToDelete?.invoiceNumber || ''} deleted successfully!`, 'success');
      return true;
    } catch (error) {
      addToast('Error deleting draft', 'error');
      return false;
    }
  };

  const getDraft = (id) => {
    return drafts.find(draft => draft.id === id);
  };

  const convertDraftToInvoice = async (draftId) => {
    try {
      const draft = getDraft(draftId);
      if (!draft) {
        throw new Error('Draft not found');
      }

      const invoiceData = {
        ...draft,
        id: `inv_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'sent',
        paymentStatus: 'pending'
      };

      delete invoiceData.savedAt;
      
      const newInvoice = await addInvoice(invoiceData);
      deleteDraft(draftId);

      return newInvoice;
    } catch (error) {
      addToast('Error converting draft to invoice', 'error');
      throw error;
    }
  };

  // Template Functions
  const getAvailableTemplates = useCallback(() => {
    if (templates.length > 0) {
      return dedupeTemplates(templates);
    }
    return dedupeTemplates(templateStorage.getAllTemplates());
  }, [templates]);

  // Export functions
  const exportInvoicesAsCSV = (invoiceIds = []) => {
    try {
      const invoicesToExport = invoiceIds.length > 0 
        ? invoices.filter(inv => invoiceIds.includes(inv.id))
        : invoices;
      
      if (invoicesToExport.length === 0) {
        addToast('No invoices to export', 'warning');
        return false;
      }
      
      const headers = ['Invoice Number', 'Customer', 'Customer Email', 'Issue Date', 'Due Date', 'Amount', 'Status', 'Created At'];
      const rows = invoicesToExport.map(inv => [
        inv.number || inv.invoiceNumber || '',
        inv.customer || '',
        inv.customerEmail || '',
        inv.issueDate || new Date(inv.createdAt).toLocaleDateString(),
        inv.dueDate || '',
        `$${(inv.totalAmount || inv.amount || 0).toFixed(2)}`,
        inv.status || '',
        new Date(inv.createdAt).toLocaleDateString()
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      addToast(`Exported ${invoicesToExport.length} invoices as CSV!`, 'success');
      return true;
    } catch (error) {
      addToast('Error exporting CSV', 'error');
      return false;
    }
  };

  const exportInvoices = (invoiceIds = []) => {
    try {
      const invoicesToExport = invoiceIds.length > 0 
        ? invoices.filter(inv => invoiceIds.includes(inv.id))
        : invoices;
      
      if (invoicesToExport.length === 0) {
        addToast('No invoices to export', 'warning');
        return false;
      }
      
      const data = {
        exportedAt: new Date().toISOString(),
        totalInvoices: invoicesToExport.length,
        totalAmount: invoicesToExport.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0),
        invoices: invoicesToExport
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoices-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      addToast(`Exported ${invoicesToExport.length} invoices successfully!`, 'success');
      return true;
    } catch (error) {
      addToast('Error exporting invoices', 'error');
      return false;
    }
  };

  // Recurring invoice functions
  const saveRecurringInvoice = (recurringData) => {
    try {
      const newRecurring = {
        id: `rec_${Date.now()}`,
        ...recurringData,
        created: new Date().toISOString(),
        status: 'active'
      };
      const updatedRecurring = [...recurringInvoices, newRecurring];
      setRecurringInvoices(updatedRecurring);
      
      return newRecurring;
    } catch (error) {
      addToast('Error creating recurring invoice', 'error');
      throw error;
    }
  };

  const combinedLoading = loading || invoicesLoading;

  const contextValue = {
    // State
    invoices,
    customers,
    drafts,
    templates,
    recurringInvoices,
    products,
    loading: combinedLoading,
    
    // Invoice Functions
    addInvoice,
    updateInvoice,
    deleteInvoice,
    sendInvoice,
    markAsPaid,
    getInvoiceStats,
    filterInvoices,
    exportInvoices,
    exportInvoicesAsCSV,
    getInvoicesForPayment, // NEW
    markInvoiceAsApproved, // NEW
    
    // Customer Functions
    addCustomer,
    refreshCustomers,
    updateCustomer,
    deleteCustomer,
    getCustomerStats,
    
    // Product/Inventory Functions
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsFromInventory, // NEW
    getProductStats,
    updateStockOnPayment, // NEW
    
    // Draft Functions
    saveDraft,
    deleteDraft,
    getDraft,
    convertDraftToInvoice,
    
    // Template Functions
    getAvailableTemplates,
    refreshTemplates,
    
    // Recurring Functions
    saveRecurringInvoice
  };

  return (
    <InvoiceContext.Provider value={contextValue}>
      {children}
    </InvoiceContext.Provider>
  );
};

