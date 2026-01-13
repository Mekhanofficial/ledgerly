// src/utils/recurringStorage.js
export const recurringStorage = {
  // Get all recurring invoices
  getRecurringInvoices: () => {
    try {
      const invoices = JSON.parse(localStorage.getItem('ledgerly_recurring')) || [];
      return invoices;
    } catch (error) {
      console.error('Error getting recurring invoices:', error);
      return [];
    }
  },

  // Save a recurring invoice
  saveRecurring: (invoice) => {
    try {
      const invoices = recurringStorage.getRecurringInvoices();
      const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
      
      if (existingIndex >= 0) {
        invoices[existingIndex] = invoice;
      } else {
        invoices.push(invoice);
      }
      
      localStorage.setItem('ledgerly_recurring', JSON.stringify(invoices));
      return invoice;
    } catch (error) {
      console.error('Error saving recurring invoice:', error);
      throw error;
    }
  },

  // Update a recurring invoice
  updateRecurring: (id, updates) => {
    try {
      const invoices = recurringStorage.getRecurringInvoices();
      const invoiceIndex = invoices.findIndex(inv => inv.id === id);
      
      if (invoiceIndex >= 0) {
        invoices[invoiceIndex] = { ...invoices[invoiceIndex], ...updates };
        localStorage.setItem('ledgerly_recurring', JSON.stringify(invoices));
        return invoices[invoiceIndex];
      }
      return null;
    } catch (error) {
      console.error('Error updating recurring invoice:', error);
      throw error;
    }
  },

  // Delete a recurring invoice
  deleteRecurring: (id) => {
    try {
      let invoices = recurringStorage.getRecurringInvoices();
      const invoiceToDelete = invoices.find(inv => inv.id === id);
      
      if (invoiceToDelete) {
        invoices = invoices.filter(inv => inv.id !== id);
        localStorage.setItem('ledgerly_recurring', JSON.stringify(invoices));
        return invoiceToDelete;
      }
      return null;
    } catch (error) {
      console.error('Error deleting recurring invoice:', error);
      throw error;
    }
  },

  // Delete multiple recurring invoices
  deleteMultipleRecurring: (ids) => {
    try {
      let invoices = recurringStorage.getRecurringInvoices();
      const deletedInvoices = invoices.filter(inv => ids.includes(inv.id));
      
      if (deletedInvoices.length > 0) {
        invoices = invoices.filter(inv => !ids.includes(inv.id));
        localStorage.setItem('ledgerly_recurring', JSON.stringify(invoices));
        return deletedInvoices;
      }
      return [];
    } catch (error) {
      console.error('Error deleting multiple recurring invoices:', error);
      throw error;
    }
  },

  // Delete ALL recurring invoices
  deleteAllRecurring: () => {
    try {
      const allInvoices = recurringStorage.getRecurringInvoices();
      localStorage.removeItem('ledgerly_recurring');
      return allInvoices;
    } catch (error) {
      console.error('Error deleting all recurring invoices:', error);
      throw error;
    }
  },

  // Pause a recurring invoice
  pauseRecurring: (id) => {
    return recurringStorage.updateRecurring(id, { status: 'paused' });
  },

  // Resume a recurring invoice
  resumeRecurring: (id) => {
    return recurringStorage.updateRecurring(id, { status: 'active' });
  },

  // Get active recurring invoices
  getActiveRecurring: () => {
    const invoices = recurringStorage.getRecurringInvoices();
    return invoices.filter(inv => inv.status === 'active');
  },

  // Get recurring invoices by customer
  getRecurringByCustomer: (customerId) => {
    const invoices = recurringStorage.getRecurringInvoices();
    return invoices.filter(inv => inv.customerId === customerId);
  }
};