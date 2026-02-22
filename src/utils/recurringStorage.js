// src/utils/recurringStorage.js
const STORAGE_PREFIX = 'ledgerly_recurring';

const resolveUserId = (explicitUserId) => {
  if (explicitUserId) return explicitUserId;
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.id || user?._id || null;
  } catch (error) {
    return null;
  }
};

const getStorageKey = (userId) => (userId ? `${STORAGE_PREFIX}_${userId}` : STORAGE_PREFIX);

const readInvoices = (userId) => {
  const storageKey = getStorageKey(userId);
  return JSON.parse(localStorage.getItem(storageKey) || '[]');
};

const writeInvoices = (userId, invoices) => {
  const storageKey = getStorageKey(userId);
  localStorage.setItem(storageKey, JSON.stringify(invoices));
};

export const recurringStorage = {
  // Get all recurring invoices
  getRecurringInvoices: (userId = null) => {
    try {
      const resolvedUserId = resolveUserId(userId);
      const invoices = readInvoices(resolvedUserId);
      return Array.isArray(invoices) ? invoices : [];
    } catch (error) {
      console.error('Error getting recurring invoices:', error);
      return [];
    }
  },

  // Save a recurring invoice
  saveRecurring: (invoice, userId = null) => {
    try {
      const resolvedUserId = resolveUserId(userId);
      const invoices = recurringStorage.getRecurringInvoices(resolvedUserId);
      const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
      
      if (existingIndex >= 0) {
        invoices[existingIndex] = invoice;
      } else {
        invoices.push(invoice);
      }
      
      writeInvoices(resolvedUserId, invoices);
      return invoice;
    } catch (error) {
      console.error('Error saving recurring invoice:', error);
      throw error;
    }
  },

  // Update a recurring invoice
  updateRecurring: (id, updates, userId = null) => {
    try {
      const resolvedUserId = resolveUserId(userId);
      const invoices = recurringStorage.getRecurringInvoices(resolvedUserId);
      const invoiceIndex = invoices.findIndex(inv => inv.id === id);
      
      if (invoiceIndex >= 0) {
        invoices[invoiceIndex] = { ...invoices[invoiceIndex], ...updates };
        writeInvoices(resolvedUserId, invoices);
        return invoices[invoiceIndex];
      }
      return null;
    } catch (error) {
      console.error('Error updating recurring invoice:', error);
      throw error;
    }
  },

  // Delete a recurring invoice
  deleteRecurring: (id, userId = null) => {
    try {
      const resolvedUserId = resolveUserId(userId);
      let invoices = recurringStorage.getRecurringInvoices(resolvedUserId);
      const invoiceToDelete = invoices.find(inv => inv.id === id);
      
      if (invoiceToDelete) {
        invoices = invoices.filter(inv => inv.id !== id);
        writeInvoices(resolvedUserId, invoices);
        return invoiceToDelete;
      }
      return null;
    } catch (error) {
      console.error('Error deleting recurring invoice:', error);
      throw error;
    }
  },

  // Delete multiple recurring invoices
  deleteMultipleRecurring: (ids, userId = null) => {
    try {
      const resolvedUserId = resolveUserId(userId);
      let invoices = recurringStorage.getRecurringInvoices(resolvedUserId);
      const deletedInvoices = invoices.filter(inv => ids.includes(inv.id));
      
      if (deletedInvoices.length > 0) {
        invoices = invoices.filter(inv => !ids.includes(inv.id));
        writeInvoices(resolvedUserId, invoices);
        return deletedInvoices;
      }
      return [];
    } catch (error) {
      console.error('Error deleting multiple recurring invoices:', error);
      throw error;
    }
  },

  // Delete ALL recurring invoices
  deleteAllRecurring: (userId = null) => {
    try {
      const resolvedUserId = resolveUserId(userId);
      const allInvoices = recurringStorage.getRecurringInvoices(resolvedUserId);
      const storageKey = getStorageKey(resolvedUserId);
      localStorage.removeItem(storageKey);
      return allInvoices;
    } catch (error) {
      console.error('Error deleting all recurring invoices:', error);
      throw error;
    }
  },

  // Pause a recurring invoice
  pauseRecurring: (id, userId = null) => {
    return recurringStorage.updateRecurring(id, { status: 'paused' }, userId);
  },

  // Resume a recurring invoice
  resumeRecurring: (id, userId = null) => {
    return recurringStorage.updateRecurring(id, { status: 'active' }, userId);
  },

  // Get active recurring invoices
  getActiveRecurring: (userId = null) => {
    const invoices = recurringStorage.getRecurringInvoices(userId);
    return invoices.filter(inv => inv.status === 'active');
  },

  // Get recurring invoices by customer
  getRecurringByCustomer: (customerId, userId = null) => {
    const invoices = recurringStorage.getRecurringInvoices(userId);
    return invoices.filter(inv => inv.customerId === customerId);
  }
};
