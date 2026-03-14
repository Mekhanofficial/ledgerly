import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from './ToastContext';
import { useNotifications } from './NotificationContext';
import { useAccount } from './AccountContext';
import templateStorage, { enrichTemplateAccess, ensureTemplateAccessOwner } from '../utils/templateStorage';
import { fetchTemplates } from '../services/templateService';
import {
  buildBrandedEmailMessage,
  getEmailSenderConfig,
  resolveInvoiceBaseUrl,
  shouldHideLedgerlyBrandingEverywhere
} from '../utils/brandingPlan';
import {
  fetchInvoices,
  fetchInvoiceById,
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
import { recurringStorage } from '../utils/recurringStorage';
import { formatCurrency } from '../utils/currency';

const dedupeTemplates = (templates = []) => {
  const map = new Map();
  templates.forEach((template) => {
    if (template?.id && !map.has(template.id)) {
      map.set(template.id, template);
    }
  });
  return Array.from(map.values());
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const MAX_FRONTEND_EMAIL_PDF_ATTACHMENT_BYTES = parsePositiveInt(
  import.meta.env.VITE_MAX_FRONTEND_EMAIL_PDF_ATTACHMENT_BYTES,
  15 * 1024 * 1024
);

const getBase64ByteSize = (value) => {
  const normalized = String(value || '').replace(/\s/g, '');
  if (!normalized) return 0;
  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((normalized.length * 3) / 4) - padding);
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
  const { accountInfo } = useAccount();
  const dispatch = useDispatch();
  const { invoices: rawInvoices, loading: invoicesLoading } = useSelector((state) => state.invoices);
  const { customers: rawCustomers } = useSelector((state) => state.customers);
  const { products: rawProducts } = useSelector((state) => state.products);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const authUser = useSelector((state) => state.auth?.user);
  const recurringUserId = useMemo(() => authUser?.id || authUser?._id || null, [authUser]);
  const baseCurrency = accountInfo?.currency || 'USD';
  const formatMoney = useCallback(
    (value, currencyCode) => formatCurrency(value, currencyCode || baseCurrency),
    [baseCurrency]
  );

  useEffect(() => {
    const ownerId = authUser?.id || authUser?._id;
    if (ownerId) {
      ensureTemplateAccessOwner(ownerId);
    }
  }, [authUser]);

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

  const normalizedRole = useMemo(() => {
    return String(authUser?.role || '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');
  }, [authUser]);

  const canRecordPayment = useMemo(() => {
    return ['admin', 'accountant', 'client', 'super_admin'].includes(normalizedRole);
  }, [normalizedRole]);
  const canAccessCustomers = useMemo(() => {
    return ['admin', 'accountant', 'staff', 'viewer', 'super_admin'].includes(normalizedRole);
  }, [normalizedRole]);
  const canAccessProducts = useMemo(() => {
    return ['admin', 'accountant', 'staff', 'viewer', 'super_admin'].includes(normalizedRole);
  }, [normalizedRole]);
  const canAccessTemplates = useMemo(() => {
    return ['admin', 'accountant', 'staff', 'viewer', 'super_admin'].includes(normalizedRole);
  }, [normalizedRole]);

  const [templates, setTemplates] = useState([]);
  const [recurringInvoices, setRecurringInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const drafts = useMemo(() => {
    return invoices
      .filter((invoice) => invoice?.status === 'draft')
      .map((invoice) => ({
        ...invoice,
        savedAt: invoice.raw?.updatedAt || invoice.raw?.createdAt || invoice.updatedAt || invoice.createdAt || new Date().toISOString()
      }))
      .sort((a, b) => {
        const aTime = new Date(a.savedAt || a.updatedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.savedAt || b.updatedAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      });
  }, [invoices]);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchInvoices());
    if (canAccessCustomers) {
      dispatch(fetchCustomers());
    }
    if (canAccessProducts) {
      dispatch(fetchProducts({ isActive: true }));
    }
  }, [dispatch, isAuthenticated, canAccessCustomers, canAccessProducts]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const refreshInvoices = () => {
      dispatch(fetchInvoices());
    };

    const intervalId = setInterval(refreshInvoices, 60000);
    window.addEventListener('focus', refreshInvoices);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', refreshInvoices);
    };
  }, [dispatch, isAuthenticated]);

  const refreshTemplates = useCallback(async () => {
    if (!canAccessTemplates) {
      const fallback = dedupeTemplates(templateStorage.getAllTemplates());
      const resolvedFallback = fallback.map((template) => {
        const local = enrichTemplateAccess(template);
        const hasAccess = typeof template?.hasAccess === 'boolean' ? template.hasAccess : local?.hasAccess;
        const requiredPlan = template?.requiredPlan || local?.requiredPlan;
        const accessSource = template?.accessSource || local?.accessSource;
        const canPurchase = typeof template?.canPurchase === 'boolean' ? template.canPurchase : local?.canPurchase;
        return {
          ...local,
          ...template,
          hasAccess: Boolean(hasAccess),
          isUnlocked: Boolean(hasAccess),
          requiredPlan,
          accessSource,
          canPurchase
        };
      });
      setTemplates(resolvedFallback);
      return resolvedFallback;
    }
    try {
      const payload = await fetchTemplates();
      const data = Array.isArray(payload?.data) ? payload.data : [];
      const fallback = dedupeTemplates(templateStorage.getAllTemplates());
      const uniqueTemplates = dedupeTemplates([...data, ...fallback]);
      const resolvedTemplates = uniqueTemplates.map((template) => {
        const local = enrichTemplateAccess(template);
        const apiAccess = typeof template?.hasAccess === 'boolean' ? template.hasAccess : undefined;
        const hasAccess = apiAccess !== undefined ? apiAccess : local?.hasAccess;
        const requiredPlan = template?.requiredPlan || local?.requiredPlan;
        const accessSource = template?.accessSource || local?.accessSource;
        const canPurchase = typeof template?.canPurchase === 'boolean' ? template.canPurchase : local?.canPurchase;
        return {
          ...local,
          ...template,
          hasAccess: Boolean(hasAccess),
          isUnlocked: Boolean(hasAccess),
          requiredPlan,
          accessSource,
          canPurchase
        };
      });
      setTemplates(resolvedTemplates);
      return resolvedTemplates;
    } catch (error) {
      console.error('Error loading templates from backend:', error);
      const fallback = dedupeTemplates(templateStorage.getAllTemplates());
      const resolvedFallback = fallback.map((template) => {
        const local = enrichTemplateAccess(template);
        const hasAccess = typeof template?.hasAccess === 'boolean' ? template.hasAccess : local?.hasAccess;
        const requiredPlan = template?.requiredPlan || local?.requiredPlan;
        const accessSource = template?.accessSource || local?.accessSource;
        const canPurchase = typeof template?.canPurchase === 'boolean' ? template.canPurchase : local?.canPurchase;
        return {
          ...local,
          ...template,
          hasAccess: Boolean(hasAccess),
          isUnlocked: Boolean(hasAccess),
          requiredPlan,
          accessSource,
          canPurchase
        };
      });
      setTemplates(resolvedFallback);
      return resolvedFallback;
    }
  }, [canAccessTemplates]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setRecurringInvoices(recurringStorage.getRecurringInvoices(recurringUserId));

        if (isAuthenticated) {
          await refreshTemplates();
        } else {
          const fallbackTemplates = dedupeTemplates(templateStorage.getAllTemplates()).map((template) => {
            const local = enrichTemplateAccess(template);
            const hasAccess = typeof template?.hasAccess === 'boolean' ? template.hasAccess : local?.hasAccess;
            const requiredPlan = template?.requiredPlan || local?.requiredPlan;
            const accessSource = template?.accessSource || local?.accessSource;
            const canPurchase = typeof template?.canPurchase === 'boolean' ? template.canPurchase : local?.canPurchase;
            return {
              ...local,
              ...template,
              hasAccess: Boolean(hasAccess),
              isUnlocked: Boolean(hasAccess),
              requiredPlan,
              accessSource,
              canPurchase
            };
          });
          setTemplates(fallbackTemplates);
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
  }, [addToast, refreshTemplates, isAuthenticated, recurringUserId]);

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
        details: `Amount: ${formatMoney(mappedInvoice.totalAmount || 0, mappedInvoice.currency || baseCurrency)}`,
        time: 'Just now',
        action: 'View Invoice',
        color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
        link: `/invoices/view/${mappedInvoice.id}`,
        icon: 'FileText',
        invoiceId: mappedInvoice.id
      });

      dispatch(fetchInvoices());

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

  const resolveInvoiceForEmailPdf = useCallback(async (id, candidateInvoice = null) => {
    const normalizeCandidate = (value) => {
      if (!value || typeof value !== 'object') return null;
      const normalizedId = value.id || value._id || id;
      return mapInvoiceFromApi({
        ...value,
        id: normalizedId,
        _id: normalizedId
      });
    };

    const isRenderable = (value) => {
      if (!value || typeof value !== 'object') return false;
      const hasItems = (Array.isArray(value.lineItems) && value.lineItems.length > 0)
        || (Array.isArray(value.items) && value.items.length > 0);
      return hasItems
        || Boolean(value.invoiceNumber)
        || Boolean(value.totalAmount)
        || Boolean(value.subtotal);
    };

    const fromCandidate = normalizeCandidate(candidateInvoice);
    if (isRenderable(fromCandidate)) {
      return fromCandidate;
    }

    const local = invoices.find((invoice) => String(invoice.id) === String(id));
    if (isRenderable(local)) {
      return local;
    }

    try {
      const fetched = await dispatch(fetchInvoiceById(id)).unwrap();
      const mapped = mapInvoiceFromApi(fetched);
      return isRenderable(mapped) ? mapped : null;
    } catch {
      return null;
    }
  }, [dispatch, invoices]);

  const sendInvoice = async (id, emailOptions = null, options = {}) => {
    const throwOnError = options?.throwOnError === true;
    try {
      const senderConfig = getEmailSenderConfig(accountInfo);
      const hideLedgerlyBranding = shouldHideLedgerlyBrandingEverywhere(accountInfo);
      const invoiceBaseUrl = resolveInvoiceBaseUrl(accountInfo, 'https://ledgerly.com');
      const hasEmailOptions = emailOptions && typeof emailOptions === 'object';
      const {
        invoiceData: explicitInvoiceData,
        ...emailOptionPayload
      } = hasEmailOptions ? emailOptions : {};

      let normalizedEmailOptions = hasEmailOptions
        ? {
            ...emailOptionPayload,
            emailMessage: emailOptionPayload.emailMessage != null
              ? buildBrandedEmailMessage(emailOptionPayload.emailMessage, accountInfo)
              : emailOptionPayload.emailMessage,
            emailFrom: emailOptionPayload.emailFrom || senderConfig.fromAddress,
            emailFooterText: emailOptionPayload.emailFooterText ?? senderConfig.footerText,
            hideLedgerlyBrandingEverywhere: emailOptionPayload.hideLedgerlyBrandingEverywhere ?? hideLedgerlyBranding,
            invoiceBaseUrl: emailOptionPayload.invoiceBaseUrl || invoiceBaseUrl
          }
        : null;

      const invoiceForPdf = await resolveInvoiceForEmailPdf(id, explicitInvoiceData);
      if (!invoiceForPdf) {
        throw new Error('Unable to load invoice data for frontend PDF generation.');
      }

      const resolvedTemplateStyle = normalizedEmailOptions?.templateStyle || invoiceForPdf?.templateStyle || 'standard';
      const { buildInvoiceEmailPdfAttachment } = await import('../utils/invoiceEmailPdf');
      const pdfAttachment = await buildInvoiceEmailPdfAttachment({
        invoiceData: {
          ...invoiceForPdf,
          templateStyle: resolvedTemplateStyle
        },
        templateStyle: resolvedTemplateStyle,
        companyData: accountInfo,
        fallbackInvoiceId: id
      });

      if (!pdfAttachment) {
        throw new Error('Unable to generate frontend invoice PDF attachment.');
      }

      const attachmentByteSize = getBase64ByteSize(pdfAttachment.data);
      if (attachmentByteSize > MAX_FRONTEND_EMAIL_PDF_ATTACHMENT_BYTES) {
        const maxMb = Math.round(MAX_FRONTEND_EMAIL_PDF_ATTACHMENT_BYTES / (1024 * 1024));
        throw new Error(
          `Invoice PDF is too large to email with this template. Max allowed is ${maxMb}MB.`
        );
      }

      normalizedEmailOptions = {
        ...(normalizedEmailOptions || {}),
        templateStyle: normalizedEmailOptions?.templateStyle || resolvedTemplateStyle,
        pdfAttachment
      };

      const buildPayload = (optionsPayload) =>
        optionsPayload && Object.keys(optionsPayload).length > 0
          ? { id, data: optionsPayload }
          : id;

      const updated = await dispatch(sendInvoiceThunk(buildPayload(normalizedEmailOptions))).unwrap();
      // Keep list views in sync with canonical backend ordering/populates.
      dispatch(fetchInvoices());

      const mapped = mapInvoiceFromApi(updated);
      addToast('Invoice sent successfully', 'success');
      return mapped;
    } catch (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || 'Error sending invoice';
      addToast(errorMessage, 'error');
      if (throwOnError) {
        throw new Error(errorMessage);
      }
      return null;
    }
  };

  const markAsPaid = async (id, paymentData = {}, options = {}) => {
    const showToast = options.showToast ?? true;
    try {
      if (!canRecordPayment) {
        return null;
      }
      const invoice = invoices.find(inv => inv.id === id);
      const defaultAmount = invoice?.balance ?? invoice?.totalAmount ?? invoice?.amount ?? 0;
      const amount = paymentData.amount ?? defaultAmount;
      const resolvedTemplateStyle = paymentData.templateStyle || invoice?.templateStyle || 'standard';

      if (!amount || amount <= 0) {
        if (showToast) {
          addToast('Invalid payment amount', 'error');
        }
        return null;
      }

      let receiptPdfAttachment = null;
      if (invoice) {
        try {
          const { buildReceiptEmailPdfAttachment } = await import('../utils/receiptEmailPdf');
          const normalizedItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
          const subtotal = Number(invoice.subtotal)
            || normalizedItems.reduce(
              (sum, item) => sum + (Number(item.quantity || 0) * Number(item.rate || 0)),
              0
            );
          const totalTax = Number(invoice.totalTax ?? invoice.taxAmount ?? 0) || 0;
          const total = Number(invoice.totalAmount ?? invoice.amount ?? (subtotal + totalTax)) || 0;
          const amountPaid = Number(amount) || total;
          const change = Math.max(0, amountPaid - total);
          const customerName = typeof invoice.customer === 'string'
            ? invoice.customer
            : (invoice.customer?.name || invoice.customerName || 'Customer');
          const customerEmail = invoice.customerEmail || invoice.customer?.email || '';
          const customerPhone = invoice.customerPhone || invoice.customer?.phone || '';

          const receiptPreviewData = {
            id: `receipt-${invoice.invoiceNumber || invoice.number || id}`,
            receiptNumber: invoice.invoiceNumber || invoice.number || String(id),
            date: new Date().toLocaleDateString(),
            customerName,
            customerEmail,
            customerPhone,
            items: normalizedItems.map((item) => ({
              name: item.description || 'Item',
              quantity: Number(item.quantity || 0),
              price: Number(item.rate || 0)
            })),
            subtotal,
            tax: totalTax,
            total,
            amountPaid,
            change,
            paymentMethod: paymentData.paymentMethod || 'manual',
            paymentReference: paymentData.paymentReference || '',
            status: 'completed',
            currency: invoice.currency || baseCurrency,
            templateStyle: resolvedTemplateStyle,
            notes: paymentData.notes || invoice.notes || ''
          };

          receiptPdfAttachment = await buildReceiptEmailPdfAttachment({
            receiptData: receiptPreviewData,
            accountInfo,
            templateId: resolvedTemplateStyle,
            fallbackReceiptId: String(id)
          });
        } catch (attachmentError) {
          console.warn('Unable to prepare frontend receipt PDF attachment for auto-email:', attachmentError);
          if (showToast) {
            addToast('Payment will be recorded, but receipt email will be skipped because PDF generation failed.', 'warning');
          }
        }
      }

      const result = await dispatch(recordPayment({
        id,
        paymentData: {
          amount,
          paymentMethod: paymentData.paymentMethod || 'manual',
          paymentReference: paymentData.paymentReference,
          paymentGateway: paymentData.paymentGateway,
          notes: paymentData.notes,
          templateStyle: resolvedTemplateStyle,
          ...(receiptPdfAttachment ? { receiptPdfAttachment } : {})
        }
      })).unwrap();

      const updatedInvoice = mapInvoiceFromApi(result?.invoice || result);
      dispatch(fetchInvoices());
      if (canAccessCustomers) {
        dispatch(fetchCustomers());
      }
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
          const message = typeof error === 'string'
            ? error
            : (error?.response?.data?.error || error?.message);
          addToast(message || 'Error recording payment', 'error');
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
      totalAmount: formatMoney(totalAmount, baseCurrency),
      paidAmount: formatMoney(paidAmount, baseCurrency),
      overdueAmount: formatMoney(overdueAmount, baseCurrency),
      pendingAmount: formatMoney(pendingAmount, baseCurrency),
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
      const resolvedCustomerId = String(
        newCustomer.id
        || newCustomer.raw?._id
        || newCustomer.raw?.id
        || ''
      ).trim();

      // Refresh to ensure the selector list has the canonical backend record.
      await dispatch(fetchCustomers());

      const showNotificationToast = options.showNotificationToast ?? true;
      addNotification({
        type: 'new-customer',
        title: 'New Customer Added',
        description: `${newCustomer.name} has been added`,
        details: newCustomer.email || 'No email provided',
        time: 'Just now',
        action: 'View Profile',
        color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        link: resolvedCustomerId ? `/customers/${resolvedCustomerId}` : '/customers',
        icon: 'UserPlus',
        customerId: resolvedCustomerId || undefined
      }, { showToast: showNotificationToast });

      return {
        ...newCustomer,
        id: resolvedCustomerId || newCustomer.id
      };
    } catch (error) {
      addToast(error?.message || 'Error adding customer', 'error');
      throw error;
    }
  };

  const refreshCustomers = useCallback(() => {
    return dispatch(fetchCustomers());
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
        value: formatMoney(totalOutstanding, baseCurrency),
        description: `Across ${outstandingCustomers} customers`
      },
      { 
        label: 'Avg Transaction Value', 
        value: formatMoney(avgTransactionValue, baseCurrency),
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
      totalValue: formatMoney(totalValue, baseCurrency),
      lowStock,
      outOfStock,
      inStock: totalProducts - outOfStock
    };
  };

  // Draft Functions
  const saveDraft = async (draftData) => {
    try {
      const resolvedCustomerId = draftData?.customerId
        || draftData?.customer?._id
        || draftData?.customer?.id
        || '';
      const normalizedLineItems = Array.isArray(draftData?.lineItems)
        ? draftData.lineItems.filter((item) => item && String(item.description || '').trim())
        : [];

      if (!resolvedCustomerId) {
        const message = 'Please select a customer before saving draft.';
        addToast(message, 'error');
        throw new Error(message);
      }

      if (normalizedLineItems.length === 0) {
        const message = 'Please add at least one line item before saving draft.';
        addToast(message, 'error');
        throw new Error(message);
      }

      const created = await dispatch(createInvoiceThunk(buildInvoicePayload({
        ...draftData,
        customerId: resolvedCustomerId,
        lineItems: normalizedLineItems,
        status: 'draft'
      }))).unwrap();
      const mappedDraft = mapInvoiceFromApi(created);
      addToast('Draft saved successfully!', 'success');
      return {
        ...mappedDraft,
        savedAt: created?.updatedAt || created?.createdAt || new Date().toISOString()
      };
    } catch (error) {
      if (!(error instanceof Error) || !/Please (select|add)/i.test(error.message)) {
        addToast(error?.message || 'Error saving draft', 'error');
      }
      throw error;
    }
  };

  const deleteDraft = async (id) => {
    try {
      const backendDraft = invoices.find((invoice) => invoice.id === id && invoice.status === 'draft');
      if (!backendDraft) {
        addToast('Draft not found or already removed', 'warning');
        return false;
      }

      await dispatch(deleteInvoiceThunk(id)).unwrap();
      addToast(`Draft ${backendDraft.invoiceNumber || ''} deleted successfully!`, 'success');
      return true;
    } catch (error) {
      addToast(error?.message || 'Error deleting draft', 'error');
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

      const updatedDraft = await updateInvoice(draftId, {
        status: 'sent',
        sentAt: new Date().toISOString()
      });
      if (!updatedDraft) {
        throw new Error('Unable to convert draft');
      }
      return updatedDraft;
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
        formatMoney(inv.totalAmount || inv.amount || 0, inv.currency || baseCurrency),
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
    } catch {
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
    } catch {
      addToast('Error exporting invoices', 'error');
      return false;
    }
  };

  // Recurring invoice functions
  const saveRecurringInvoice = (recurringData) => {
    try {
      const resolvedUserId = recurringUserId;
      const newRecurring = {
        id: `rec_${Date.now()}`,
        ...recurringData,
        created: new Date().toISOString(),
        status: 'active',
        ownerId: resolvedUserId || recurringData?.ownerId || undefined
      };
      recurringStorage.saveRecurring(newRecurring, resolvedUserId);
      setRecurringInvoices((prev) => {
        const filtered = prev.filter((inv) => inv.id !== newRecurring.id);
        return [...filtered, newRecurring];
      });
      
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

