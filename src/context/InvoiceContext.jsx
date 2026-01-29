import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { useNotifications } from './NotificationContext'; // Add this import
import { useInventory } from './InventoryContext';
import templateStorage from '../utils/templateStorage';

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
  const { addNotification } = useNotifications(); // Add notifications context
  const { updateStockOnPayment: inventoryStockUpdate } = useInventory();
  
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [recurringInvoices, setRecurringInvoices] = useState([]);
  const [products, setProducts] = useState([]); // Add products for inventory integration
  const [categories, setCategories] = useState([]); // Add categories
  const [loading, setLoading] = useState(true);

  // Load all data from localStorage on initial load
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    try {
      // Load invoices
      const savedInvoices = JSON.parse(localStorage.getItem('ledgerly_invoices')) || [];
      setInvoices(savedInvoices);

      // Load customers
      const savedCustomers = JSON.parse(localStorage.getItem('ledgerly_customers')) || [
        {
          id: 'nextgen',
          name: 'NextGen Technologies',
          email: 'contact@nextgentech.com',
          phone: '+1 (555) 123-4567',
          address: '123 Innovation Drive, Tech Valley, CA 94025',
          joinedDate: 'Jan 2024',
          totalSpent: 5250,
          outstanding: 1250,
          transactions: 5,
          lastTransaction: '2 days ago',
          createdAt: '2024-01-15T10:30:00.000Z'
        },
        {
          id: 'acme',
          name: 'Acme Corp',
          email: 'billing@acmecorp.com',
          phone: '+1 (555) 987-6543',
          address: '456 Business Ave, Suite 100, New York, NY 10001',
          joinedDate: 'Dec 2023',
          totalSpent: 8900,
          outstanding: 0,
          transactions: 8,
          lastTransaction: '1 week ago',
          createdAt: '2023-12-10T14:20:00.000Z'
        },
        {
          id: 'techstart',
          name: 'TechStart Inc',
          email: 'finance@techstart.com',
          phone: '+1 (555) 456-7890',
          address: '789 Startup Blvd, San Francisco, CA 94107',
          joinedDate: 'Feb 2024',
          totalSpent: 3200,
          outstanding: 3200,
          transactions: 2,
          lastTransaction: 'Today',
          createdAt: '2024-02-01T09:15:00.000Z'
        }
      ];
      
      const customersWithTimestamp = savedCustomers.map(customer => ({
        ...customer,
        createdAt: customer.createdAt || new Date().toISOString()
      }));
      
      setCustomers(customersWithTimestamp);

      // Load drafts
      const savedDrafts = JSON.parse(localStorage.getItem('ledgerly_drafts')) || [];
      setDrafts(savedDrafts);

      // Load templates
      const savedTemplates = JSON.parse(localStorage.getItem('ledgerly_templates')) || [];
      setTemplates(savedTemplates.length > 0 ? savedTemplates : getDefaultTemplates());

      // Load recurring invoices
      const savedRecurring = JSON.parse(localStorage.getItem('ledgerly_recurring')) || [];
      setRecurringInvoices(savedRecurring);

      // Load products from inventory
      const savedProducts = JSON.parse(localStorage.getItem('ledgerly_products')) || [];
      setProducts(savedProducts);

      // Load categories
      const savedCategories = JSON.parse(localStorage.getItem('ledgerly_categories')) || [];
      setCategories(savedCategories);

    } catch (error) {
      console.error('Error loading data:', error);
      addToast('Error loading data from storage', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTemplates = () => {
    return [
      {
        id: 'standard',
        name: 'Standard Template',
        description: 'Clean and professional design',
        category: 'professional',
        isDefault: true,
        colors: { primary: [41, 128, 185], secondary: [52, 152, 219] },
        lineItems: [
          { description: 'Web Development Services', quantity: 1, rate: 125.00, tax: 10 },
          { description: 'UI/UX Design', quantity: 1, rate: 150.00, tax: 10 }
        ],
        notes: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
        terms: 'All services are subject to our terms and conditions. For any questions, please contact our billing department.',
        emailSubject: 'Invoice for Services Rendered',
        emailMessage: 'Dear valued customer,\n\nPlease find attached your invoice for services rendered.\n\nThank you for your business.\n\nBest regards,',
        currency: 'USD',
        paymentTerms: 'net-30',
        templateStyle: 'standard'
      },
      {
        id: 'modern',
        name: 'Modern Template',
        description: 'Minimal and contemporary design',
        category: 'modern',
        isDefault: false,
        colors: { primary: [46, 204, 113], secondary: [39, 174, 96] },
        lineItems: [
          { description: 'Consulting Services', quantity: 1, rate: 200.00, tax: 10 }
        ],
        notes: 'Thank you for your business!',
        terms: 'Terms and conditions apply.',
        emailSubject: 'Your Invoice',
        emailMessage: 'Hello,\n\nPlease find your invoice attached.\n\nBest regards,',
        currency: 'USD',
        paymentTerms: 'net-15',
        templateStyle: 'modern'
      },
      // ... rest of templates remain the same
    ];
  };

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ledgerly_invoices', JSON.stringify(invoices));
    }
  }, [invoices, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ledgerly_customers', JSON.stringify(customers));
    }
  }, [customers, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ledgerly_drafts', JSON.stringify(drafts));
    }
  }, [drafts, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ledgerly_templates', JSON.stringify(templates));
    }
  }, [templates, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ledgerly_recurring', JSON.stringify(recurringInvoices));
    }
  }, [recurringInvoices, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ledgerly_products', JSON.stringify(products));
    }
  }, [products, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ledgerly_categories', JSON.stringify(categories));
    }
  }, [categories, loading]);

  // NEW: Get approved invoices ready for payment
  const getInvoicesForPayment = useCallback((status = 'sent') => {
    return invoices.filter(invoice => 
      (invoice.status === status || invoice.status === 'pending_payment') && 
      (invoice.totalAmount || invoice.amount) > 0 &&
      !invoice.paidAt
    );
  }, [invoices]);

  // NEW: Mark invoice as approved for payment
  const markInvoiceAsApproved = useCallback((invoiceId) => {
    try {
      const updated = invoices.map(inv => 
        inv.id === invoiceId ? { 
          ...inv, 
          status: 'pending_payment', 
          approvedAt: new Date().toISOString(),
          paymentStatus: 'pending'
        } : inv
      );
      setInvoices(updated);
      
      // Add notification
      const invoice = updated.find(inv => inv.id === invoiceId);
      if (invoice) {
        addNotification({
          type: 'invoice_approved',
          title: 'Invoice Ready for Payment',
          description: `Invoice #${invoice.invoiceNumber || invoice.number} is now available for payment processing`,
          time: 'Just now',
          action: 'Process Payment',
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
          link: `/payments?invoice=${invoiceId}`,
          icon: 'DollarSign',
          invoiceId: invoiceId
        });
      }
      
      return updated.find(inv => inv.id === invoiceId);
    } catch (error) {
      addToast('Error approving invoice for payment', 'error');
      throw error;
    }
  }, [invoices, addNotification, addToast]);

  // NEW: Get products from inventory for invoice creation
  const getProductsFromInventory = useCallback((category = 'all') => {
    if (category === 'all') {
      return products;
    }
    return products.filter(product => product.category === category);
  }, [products]);

  // NEW: Update stock when invoice is sent or paid
  const updateStockOnPayment = useCallback((invoiceId, invoiceOverride = null) => {
    try {
      const targetInvoice = invoiceOverride || invoices.find(inv => inv.id === invoiceId);
      if (!targetInvoice || !targetInvoice.lineItems) return;
      if (targetInvoice.inventoryAdjusted) return;

      if (typeof inventoryStockUpdate === 'function') {
        inventoryStockUpdate(targetInvoice);
      }

      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceId 
          ? { ...inv, inventoryAdjusted: true } 
          : inv
      ));
    } catch (error) {
      console.error('Error updating stock on payment:', error);
    }
  }, [invoices, inventoryStockUpdate]);

  // Invoice Functions - UPDATED with inventory integration
  const addInvoice = (invoiceData) => {
    try {
      const newInvoice = {
        id: `inv_${Date.now()}`,
        ...invoiceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentStatus: 'pending',
        inventoryAdjusted: false
      };
      
      // Link products from inventory if available
      if (invoiceData.lineItems && products.length > 0) {
        const updatedLineItems = invoiceData.lineItems.map(item => {
          const product = products.find(p => p.name === item.description);
          if (product) {
            return {
              ...item,
              productId: product.id,
              sku: product.sku,
              stockQuantity: product.quantity
            };
          }
          return item;
        });
        newInvoice.lineItems = updatedLineItems;
      }
      
      const updatedInvoices = [...invoices, newInvoice];
      setInvoices(updatedInvoices);

      if (newInvoice.status === 'sent') {
        updateStockOnPayment(newInvoice.id, newInvoice);
      }
      
      // Add notification for new invoice
      addNotification({
        type: 'new-invoice',
        title: 'New Invoice Created',
        description: `Invoice #${newInvoice.invoiceNumber || newInvoice.number} created`,
        details: `Amount: $${(newInvoice.totalAmount || newInvoice.amount || 0).toLocaleString()}`,
        time: 'Just now',
        action: 'View Invoice',
        color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
        link: `/invoices/view/${newInvoice.id}`,
        icon: 'FileText',
        invoiceId: newInvoice.id
      });
      
      // Update customer stats
      if (invoiceData.customerId) {
        updateCustomerStats(invoiceData.customerId, invoiceData.totalAmount || invoiceData.amount || 0);
      }
      
      // Check if invoice should be auto-approved for payment
      if (invoiceData.status === 'sent') {
        addToPaymentQueue(newInvoice.id);
      }
      
      return newInvoice;
    } catch (error) {
      addToast('Error creating invoice', 'error');
      throw error;
    }
  };

  // NEW: Add invoice to payment queue
  const addToPaymentQueue = (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      const pendingPayments = JSON.parse(localStorage.getItem('pending_payments') || '[]');
      
      if (!pendingPayments.find(p => p.invoiceId === invoiceId)) {
        const paymentItem = {
          id: `pay_${Date.now()}`,
          invoiceId: invoiceId,
          invoiceNumber: invoice.invoiceNumber || invoice.number,
          customerId: invoice.customerId || (invoice.customer?.id || ''),
          customerName: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.name || 'Customer',
          amount: invoice.totalAmount || invoice.amount,
          originalAmount: invoice.totalAmount || invoice.amount,
          status: 'pending',
          createdFromInvoice: true,
          invoiceData: {
            items: invoice.items || invoice.lineItems,
            subtotal: invoice.subtotal || invoice.totalAmount,
            tax: invoice.tax || 0,
            total: invoice.totalAmount || invoice.amount,
            notes: invoice.notes,
            terms: invoice.terms
          }
        };
        
        pendingPayments.push(paymentItem);
        localStorage.setItem('pending_payments', JSON.stringify(pendingPayments));
      }
    }
  };

  const updateCustomerStats = (customerId, amount) => {
    setCustomers(prevCustomers => 
      prevCustomers.map(customer => {
        if (customer.id === customerId) {
          return {
            ...customer,
            totalSpent: (customer.totalSpent || 0) + amount,
            transactions: (customer.transactions || 0) + 1,
            lastTransaction: new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })
          };
        }
        return customer;
      })
    );
  };

  const updateInvoice = (id, updates) => {
    try {
      const existingInvoice = invoices.find(inv => inv.id === id);
      const updatedInvoices = invoices.map(invoice => 
        invoice.id === id 
          ? { ...invoice, ...updates, updatedAt: new Date().toISOString() }
          : invoice
      );
      setInvoices(updatedInvoices);
      
      const shouldAdjustStock = updates.status === 'sent' && existingInvoice?.status !== 'sent';
      if (shouldAdjustStock) {
        updateStockOnPayment(id);
      }
      
      return updatedInvoices.find(inv => inv.id === id);
    } catch (error) {
      addToast('Error updating invoice', 'error');
      throw error;
    }
  };

  const deleteInvoice = (id) => {
    try {
      const invoiceToDelete = invoices.find(inv => inv.id === id);
      const updatedInvoices = invoices.filter(invoice => invoice.id !== id);
      setInvoices(updatedInvoices);
      
      addToast(`Invoice ${invoiceToDelete?.invoiceNumber || invoiceToDelete?.number || ''} deleted successfully!`, 'success');
      return true;
    } catch (error) {
      addToast('Error deleting invoice', 'error');
      return false;
    }
  };

  const sendInvoice = (id) => {
    try {
      const updatedInvoice = updateInvoice(id, { 
        status: 'sent',
        sentAt: new Date().toISOString(),
        paymentStatus: 'pending'
      });
      
      // Add to payment queue
      addToPaymentQueue(id);
      
      return updatedInvoice;
    } catch (error) {
      addToast('Error sending invoice', 'error');
      throw error;
    }
  };

  const markAsPaid = (id) => {
    try {
      const updatedInvoice = updateInvoice(id, { 
        status: 'paid',
        paymentStatus: 'completed',
        paidAt: new Date().toISOString()
      });
      
      return updatedInvoice;
    } catch (error) {
      addToast('Error marking invoice as paid', 'error');
      throw error;
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
      inv.status === 'sent' || inv.status === 'pending_payment'
    );
    const pendingAmount = pendingPayments.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    
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
        (invoice.customer && invoice.customer.toLowerCase().includes(searchLower)) ||
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
        
        switch(dateRange) {
          case 'today':
            return invoiceDate.toDateString() === now.toDateString();
          case 'this-week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            return invoiceDate >= weekStart;
          case 'this-month':
            return invoiceDate.getMonth() === now.getMonth() && 
                   invoiceDate.getFullYear() === now.getFullYear();
          case 'this-quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
            return invoiceDate >= quarterStart;
          case 'this-year':
            return invoiceDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  // Customer Functions
  const addCustomer = (customerData, options = {}) => {
    try {
      const newCustomer = {
        id: `cust_${Date.now()}`,
        ...customerData,
        createdAt: new Date().toISOString(),
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        totalSpent: 0,
        outstanding: 0,
        transactions: 0,
        lastTransaction: 'Never'
      };
      const updatedCustomers = [...customers, newCustomer];
      setCustomers(updatedCustomers);
      
      // Add notification for new customer
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
      addToast('Error adding customer', 'error');
      throw error;
    }
  };

  const updateCustomer = (id, updates) => {
    try {
      const updatedCustomers = customers.map(customer => 
        customer.id === id 
          ? { ...customer, ...updates, updatedAt: new Date().toISOString() }
          : customer
      );
      setCustomers(updatedCustomers);
      
      return updatedCustomers.find(cust => cust.id === id);
    } catch (error) {
      addToast('Error updating customer', 'error');
      throw error;
    }
  };

  const deleteCustomer = (id) => {
    try {
      const customerToDelete = customers.find(c => c.id === id);
      const updatedCustomers = customers.filter(customer => customer.id !== id);
      setCustomers(updatedCustomers);
      
      addToast(`Customer "${customerToDelete?.name || ''}" deleted successfully!`, 'success');
      return true;
    } catch (error) {
      addToast('Error deleting customer', 'error');
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
  const addProduct = (productData) => {
    try {
      const newProduct = {
        id: `prod_${Date.now()}`,
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      
      return newProduct;
    } catch (error) {
      addToast('Error adding product', 'error');
      throw error;
    }
  };

  const updateProduct = (id, updates) => {
    try {
      const updatedProducts = products.map(product => 
        product.id === id 
          ? { ...product, ...updates, updatedAt: new Date().toISOString() }
          : product
      );
      setProducts(updatedProducts);
      
      return updatedProducts.find(prod => prod.id === id);
    } catch (error) {
      addToast('Error updating product', 'error');
      throw error;
    }
  };

  const deleteProduct = (id) => {
    try {
      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);
      
      addToast('Product deleted successfully!', 'success');
      return true;
    } catch (error) {
      addToast('Error deleting product', 'error');
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

  const convertDraftToInvoice = (draftId) => {
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
      
      const newInvoice = addInvoice(invoiceData);
      deleteDraft(draftId);

      return newInvoice;
    } catch (error) {
      addToast('Error converting draft to invoice', 'error');
      throw error;
    }
  };

  // Template Functions
  const getAvailableTemplates = useCallback(() => {
    return templateStorage.getAllTemplates();
  }, []);

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

  const contextValue = {
    // State
    invoices,
    customers,
    drafts,
    templates,
    recurringInvoices,
    products,
    categories,
    loading,
    
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
    
    // Recurring Functions
    saveRecurringInvoice
  };

  return (
    <InvoiceContext.Provider value={contextValue}>
      {children}
    </InvoiceContext.Provider>
  );
};
