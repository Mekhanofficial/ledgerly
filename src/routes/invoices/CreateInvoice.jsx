import React, { useState } from 'react';
import { Eye, Mail, Download } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import LineItemsTable from '../../components/invoices/LineItemsTable';
import InvoiceSummary from '../../components/invoices/InvoiceSummary';

const CreateInvoice = () => {
  // State for invoice details
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2024-006');
  const [issueDate, setIssueDate] = useState('2024-12-16');
  const [dueDate, setDueDate] = useState('2025-01-15');
  const [paymentTerms, setPaymentTerms] = useState('net-30');
  
  // State for customer
  const [selectedCustomer, setSelectedCustomer] = useState('nextgen');
  const customers = [
    { id: 'nextgen', name: 'NextGen Technologies', email: 'contact@nextgentech.com', address: '123 Innovation Drive, Tech Valley, CA 94025' },
    { id: 'acme', name: 'Acme Corp', email: 'billing@acmecorp.com', address: '456 Business Ave, Suite 100, New York, NY 10001' },
    { id: 'techstart', name: 'TechStart Inc', email: 'finance@techstart.com', address: '789 Startup Blvd, San Francisco, CA 94107' }
  ];
  
  // State for additional options
  const [notes, setNotes] = useState('');
  const [template, setTemplate] = useState('standard');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
  const [attachments, setAttachments] = useState([]);
  
  // State for line items
  const [lineItems, setLineItems] = useState([
    { id: 1, description: 'Web Development', quantity: 40, rate: 125.00, tax: 10, amount: 5000.00 },
    { id: 2, description: 'UI/UX Design', quantity: 20, rate: 150.00, tax: 10, amount: 3000.00 }
  ]);

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const totalTax = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate * (item.tax / 100)), 0);
  const totalAmount = subtotal + totalTax;

  // Line item handlers
  const calculateLineItem = (quantity, rate, tax) => {
    const subtotal = quantity * rate;
    const taxAmount = subtotal * (tax / 100);
    return subtotal + taxAmount;
  };

  const updateLineItem = (id, field, value) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate' || field === 'tax') {
          updatedItem.amount = calculateLineItem(
            field === 'quantity' ? value : item.quantity,
            field === 'rate' ? parseFloat(value) : item.rate,
            field === 'tax' ? parseFloat(value) : item.tax
          );
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const addLineItem = () => {
    const newId = lineItems.length > 0 ? Math.max(...lineItems.map(item => item.id)) + 1 : 1;
    setLineItems([
      ...lineItems,
      { id: newId, description: '', quantity: 1, rate: 0.00, tax: 0, amount: 0.00 }
    ]);
  };

  const removeLineItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  // Action handlers
  const handleSaveDraft = () => {
    console.log('Saving draft...', {
      invoiceNumber,
      issueDate,
      dueDate,
      paymentTerms,
      selectedCustomer,
      lineItems,
      subtotal,
      totalTax,
      totalAmount,
      notes,
      template,
      isRecurring,
      recurringFrequency,
      attachments
    });
    alert('Invoice saved as draft!');
  };

  const handleSendInvoice = () => {
    console.log('Sending invoice...', {
      invoiceNumber,
      issueDate,
      dueDate,
      paymentTerms,
      selectedCustomer,
      lineItems,
      subtotal,
      totalTax,
      totalAmount,
      notes,
      template,
      isRecurring,
      recurringFrequency,
      attachments
    });
    alert('Invoice sent successfully!');
  };

  const handlePreview = () => {
    console.log('Preview invoice...');
    alert('Opening preview...');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Invoice</h1>
            <p className="text-gray-600 mt-1">Create and send professional invoices to your customers</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button 
              onClick={handlePreview}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button 
              onClick={handleSaveDraft}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Save Draft
            </button>
            <button 
              onClick={handleSendInvoice}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Invoice
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Form & Line Items */}
          <div className="lg:col-span-2 space-y-6">
            <InvoiceForm
              invoiceNumber={invoiceNumber}
              setInvoiceNumber={setInvoiceNumber}
              issueDate={issueDate}
              setIssueDate={setIssueDate}
              dueDate={dueDate}
              setDueDate={setDueDate}
              paymentTerms={paymentTerms}
              setPaymentTerms={setPaymentTerms}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              customers={customers}
              notes={notes}
              setNotes={setNotes}
              template={template}
              setTemplate={setTemplate}
              isRecurring={isRecurring}
              setIsRecurring={setIsRecurring}
              recurringFrequency={recurringFrequency}
              setRecurringFrequency={setRecurringFrequency}
            />
            
            <LineItemsTable
              lineItems={lineItems}
              updateLineItem={updateLineItem}
              removeLineItem={removeLineItem}
              addLineItem={addLineItem}
            />
          </div>

          {/* Right Column - Summary & Actions */}
          <div>
            <InvoiceSummary
              subtotal={subtotal}
              totalTax={totalTax}
              totalAmount={totalAmount}
              onSaveDraft={handleSaveDraft}
              onSendInvoice={handleSendInvoice}
              onPreview={handlePreview}
              attachments={attachments}
              setAttachments={setAttachments}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateInvoice;