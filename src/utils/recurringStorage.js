// src/utils/recurringStorage.js
export const recurringStorage = {
  saveRecurring: (recurringData) => {
    try {
      const recurringInvoices = JSON.parse(localStorage.getItem('ledgerly_recurring') || '[]');
      recurringInvoices.push(recurringData);
      localStorage.setItem('ledgerly_recurring', JSON.stringify(recurringInvoices));
      return true;
    } catch (error) {
      console.error('Error saving recurring invoice:', error);
      return false;
    }
  },

  getRecurringInvoices: () => {
    try {
      return JSON.parse(localStorage.getItem('ledgerly_recurring') || '[]');
    } catch (error) {
      console.error('Error getting recurring invoices:', error);
      return [];
    }
  },

  updateRecurring: (id, updatedData) => {
    try {
      const recurringInvoices = JSON.parse(localStorage.getItem('ledgerly_recurring') || '[]');
      const index = recurringInvoices.findIndex(inv => inv.id === id);
      if (index !== -1) {
        recurringInvoices[index] = { ...recurringInvoices[index], ...updatedData };
        localStorage.setItem('ledgerly_recurring', JSON.stringify(recurringInvoices));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating recurring invoice:', error);
      return false;
    }
  },

  deleteRecurring: (id) => {
    try {
      const recurringInvoices = JSON.parse(localStorage.getItem('ledgerly_recurring') || '[]');
      const updatedInvoices = recurringInvoices.filter(inv => inv.id !== id);
      localStorage.setItem('ledgerly_recurring', JSON.stringify(updatedInvoices));
      return true;
    } catch (error) {
      console.error('Error deleting recurring invoice:', error);
      return false;
    }
  },

  getRecurringById: (id) => {
    try {
      const recurringInvoices = JSON.parse(localStorage.getItem('ledgerly_recurring') || '[]');
      return recurringInvoices.find(inv => inv.id === id);
    } catch (error) {
      console.error('Error getting recurring invoice:', error);
      return null;
    }
  },

  pauseRecurring: (id) => {
    return this.updateRecurring(id, { status: 'paused' });
  },

  resumeRecurring: (id) => {
    return this.updateRecurring(id, { status: 'active' });
  }
};

// Alias for backward compatibility
export const saveRecurringInvoice = recurringStorage.saveRecurring;