// src/utils/invoiceStorage.js
export const saveInvoice = (invoiceData) => {
  try {
    const invoices = JSON.parse(localStorage.getItem('ledgerly_invoices') || '[]');
    invoices.push(invoiceData);
    localStorage.setItem('ledgerly_invoices', JSON.stringify(invoices));
    return true;
  } catch (error) {
    console.error('Error saving invoice:', error);
    return false;
  }
};

export const getInvoices = () => {
  try {
    return JSON.parse(localStorage.getItem('ledgerly_invoices') || '[]');
  } catch (error) {
    console.error('Error getting invoices:', error);
    return [];
  }
};

export const deleteInvoice = (id) => {
  try {
    const invoices = JSON.parse(localStorage.getItem('ledgerly_invoices') || '[]');
    const updatedInvoices = invoices.filter(inv => inv.id !== id);
    localStorage.setItem('ledgerly_invoices', JSON.stringify(updatedInvoices));
    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return false;
  }
};

export const updateInvoice = (id, updatedData) => {
  try {
    const invoices = JSON.parse(localStorage.getItem('ledgerly_invoices') || '[]');
    const index = invoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
      invoices[index] = { ...invoices[index], ...updatedData };
      localStorage.setItem('ledgerly_invoices', JSON.stringify(invoices));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating invoice:', error);
    return false;
  }
};