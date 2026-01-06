import React, { createContext, useState, useEffect } from 'react';

export const InvoiceContext = createContext();

export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Initialize with sample data
  useEffect(() => {
    // Sample invoice data
    const sampleInvoices = [
      {
        id: 1,
        invoiceNumber: 'INV-2024-001',
        customer: 'Acme Corporation',
        amount: 2450.00,
        dueDate: '2024-01-15',
        status: 'overdue',
        items: [
          { name: 'Product A', quantity: 2, price: 500 },
          { name: 'Service B', quantity: 1, price: 1450 }
        ]
      },
      {
        id: 2,
        invoiceNumber: 'INV-2024-002',
        customer: 'Tech Solutions Inc.',
        amount: 1800.50,
        dueDate: '2024-01-20',
        status: 'pending',
        items: [
          { name: 'Consulting', quantity: 10, price: 180 }
        ]
      },
      {
        id: 3,
        invoiceNumber: 'INV-2024-003',
        customer: 'Global Designs LLC',
        amount: 3200.00,
        dueDate: '2024-01-10',
        status: 'paid',
        items: [
          { name: 'Website Design', quantity: 1, price: 2000 },
          { name: 'Hosting', quantity: 12, price: 100 }
        ]
      },
      {
        id: 4,
        invoiceNumber: 'INV-2024-004',
        customer: 'Retail Pro',
        amount: 950.75,
        dueDate: '2024-01-25',
        status: 'pending',
        items: [
          { name: 'POS System', quantity: 1, price: 800 },
          { name: 'Installation', quantity: 1, price: 150.75 }
        ]
      },
      {
        id: 5,
        invoiceNumber: 'INV-2024-005',
        customer: 'Manufacturing Co.',
        amount: 5250.00,
        dueDate: '2024-01-05',
        status: 'overdue',
        items: [
          { name: 'Equipment', quantity: 3, price: 1500 },
          { name: 'Maintenance', quantity: 6, price: 125 }
        ]
      }
    ];

    // Sample customer data
    const sampleCustomers = [
      { id: 1, name: 'Acme Corporation', email: 'contact@acme.com', phone: '+1 555-1234' },
      { id: 2, name: 'Tech Solutions Inc.', email: 'info@techsolutions.com', phone: '+1 555-5678' },
      { id: 3, name: 'Global Designs LLC', email: 'hello@globaldesigns.com', phone: '+1 555-9012' },
      { id: 4, name: 'Retail Pro', email: 'support@retailpro.com', phone: '+1 555-3456' },
      { id: 5, name: 'Manufacturing Co.', email: 'sales@manufacturing.com', phone: '+1 555-7890' }
    ];

    // Sample product data
    const sampleProducts = [
      { id: 1, name: 'Product A', price: 500, stock: 50 },
      { id: 2, name: 'Service B', price: 1450, stock: null },
      { id: 3, name: 'Consulting', price: 180, stock: null },
      { id: 4, name: 'Website Design', price: 2000, stock: null },
      { id: 5, name: 'POS System', price: 800, stock: 15 }
    ];

    setInvoices(sampleInvoices);
    setCustomers(sampleCustomers);
    setProducts(sampleProducts);
  }, []);

  // Function to add new invoice
  const addInvoice = (invoice) => {
    const newInvoice = {
      id: invoices.length + 1,
      ...invoice,
      status: 'pending'
    };
    setInvoices([...invoices, newInvoice]);
  };

  // Function to update invoice status
  const updateInvoiceStatus = (invoiceId, status) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === invoiceId ? { ...invoice, status } : invoice
    ));
  };

  // Function to add customer
  const addCustomer = (customer) => {
    const newCustomer = {
      id: customers.length + 1,
      ...customer
    };
    setCustomers([...customers, newCustomer]);
  };

  const contextValue = {
    invoices,
    customers,
    products,
    addInvoice,
    updateInvoiceStatus,
    addCustomer
  };

  return (
    <InvoiceContext.Provider value={contextValue}>
      {children}
    </InvoiceContext.Provider>
  );
};