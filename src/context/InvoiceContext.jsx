// src/context/InvoiceContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';

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
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [recurringInvoices, setRecurringInvoices] = useState([]);
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

      // Load customers - add createdAt to existing customers if missing
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
      
      // Ensure all customers have createdAt
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
      {
        id: 'professional',
        name: 'Professional Template',
        description: 'Formal business template',
        category: 'professional',
        isDefault: false,
        colors: { primary: [142, 68, 173], secondary: [155, 89, 182] },
        lineItems: [
          { description: 'Professional Services', quantity: 1, rate: 300.00, tax: 15 }
        ],
        notes: 'Please make payment within the specified terms.',
        terms: 'All payments are due upon receipt.',
        emailSubject: 'Professional Invoice',
        emailMessage: 'Dear Sir/Madam,\n\nPlease find attached the invoice for professional services rendered.\n\nSincerely,',
        currency: 'USD',
        paymentTerms: 'net-30',
        templateStyle: 'professional'
      },
      {
        id: 'minimal',
        name: 'Minimal Template',
        description: 'Simple and clean design',
        category: 'minimal',
        isDefault: false,
        colors: { primary: [52, 73, 94], secondary: [44, 62, 80] },
        lineItems: [
          { description: 'Service Fee', quantity: 1, rate: 100.00, tax: 0 }
        ],
        notes: 'Simple and straightforward billing',
        terms: 'Standard terms apply',
        emailSubject: 'Invoice',
        emailMessage: 'Hi,\n\nHere is your invoice.\n\nThanks,',
        currency: 'USD',
        paymentTerms: 'net-7',
        templateStyle: 'minimal'
      },
      {
        id: 'creative',
        name: 'Creative Template',
        description: 'Colorful and creative design',
        category: 'creative',
        isDefault: false,
        colors: { primary: [231, 76, 60], secondary: [241, 148, 138] },
        lineItems: [
          { description: 'Creative Services', quantity: 1, rate: 250.00, tax: 8 }
        ],
        notes: 'Creative solutions for your business',
        terms: 'Creative terms with flexible options',
        emailSubject: 'Creative Services Invoice',
        emailMessage: 'Hello Creative Partner,\n\nPlease find your invoice for creative services.\n\nCreatively yours,',
        currency: 'USD',
        paymentTerms: 'net-21',
        templateStyle: 'creative'
      }
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

  // Invoice Functions
  const addInvoice = (invoiceData) => {
    try {
      const newInvoice = {
        id: `inv_${Date.now()}`,
        ...invoiceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedInvoices = [...invoices, newInvoice];
      setInvoices(updatedInvoices);
      
      // Update customer stats
      if (invoiceData.customerId) {
        updateCustomerStats(invoiceData.customerId, invoiceData.totalAmount || invoiceData.amount || 0);
      }
      
      // Let the NotificationContext handle the success notification
      // Removed: addToast('Invoice created successfully!', 'success');
      
      return newInvoice;
    } catch (error) {
      addToast('Error creating invoice', 'error');
      throw error;
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
      const updatedInvoices = invoices.map(invoice => 
        invoice.id === id 
          ? { ...invoice, ...updates, updatedAt: new Date().toISOString() }
          : invoice
      );
      setInvoices(updatedInvoices);
      
      // Let the NotificationContext handle the success notification
      // Removed: addToast('Invoice updated successfully!', 'success');
      
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
      
      // Show toast for delete action (this is not duplicated elsewhere)
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
        sentAt: new Date().toISOString()
      });
      
      // Let the NotificationContext handle the success notification
      // Removed: addToast('Invoice sent successfully!', 'success');
      
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
        paidAt: new Date().toISOString()
      });
      
      // Let the NotificationContext handle the success notification
      // Removed: addToast('Invoice marked as paid!', 'success');
      
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
    
    // Calculate sent, draft, and viewed counts
    const sentInvoices = invoices.filter(inv => inv.status === 'sent').length;
    const draftInvoices = invoices.filter(inv => inv.status === 'draft').length;
    const viewedInvoices = invoices.filter(inv => inv.status === 'viewed').length;
    const cancelledInvoices = invoices.filter(inv => inv.status === 'cancelled').length;

    return {
      totalInvoices: totalInvoices.toString(),
      totalAmount: `$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      paidAmount: `$${paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      overdueAmount: `$${overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
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
  const addCustomer = (customerData) => {
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
      
      // Let the NotificationContext handle the success notification
      // Removed: addToast(`Customer "${customerData.name}" added successfully!`, 'success');
      
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
      
      // Let the NotificationContext handle the success notification
      // Removed: addToast('Customer updated successfully!', 'success');
      
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
      
      // Show toast for delete action (this is not duplicated elsewhere)
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

    // Calculate percentage changes (simplified)
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
      
      // Show toast for draft save (this is a user action)
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
      
      // Show toast for delete action
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
        status: 'sent'
      };

      // Remove draft-specific fields
      delete invoiceData.savedAt;
      
      const newInvoice = addInvoice(invoiceData);
      deleteDraft(draftId);

      // Let the NotificationContext handle the success notification
      // Removed: addToast(`Draft converted to invoice: ${newInvoice.invoiceNumber}`, 'success');

      return newInvoice;
    } catch (error) {
      addToast('Error converting draft to invoice', 'error');
      throw error;
    }
  };

  // Template Functions
  const getAvailableTemplates = () => {
    return templates;
  };

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
      
      // Show toast for export action
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
      
      // Show toast for export action
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
      
      // Let the NotificationContext handle the success notification
      // Removed: addToast('Recurring invoice created successfully!', 'success');
      
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
    
    // Customer Functions
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerStats,
    
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