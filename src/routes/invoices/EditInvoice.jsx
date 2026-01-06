// src/pages/invoices/EditInvoice.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Mail, Download } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import InvoicePreviewModal from '../../components/invoices/InvoicePreviewModal';
import EmailTemplateModal from '../../components/invoices/EmailTemplateModal';
import InvoiceHeader from '../../components/invoices/create/InvoiceHeader';
import CustomerSection from '../../components/invoices/create/CustomerSection';
import InvoiceDetailsSection from '../../components/invoices/create/InvoiceDetailsSection';
import LineItemsTable from '../../components/invoices/create/LineItemsTable';
import InvoiceSummary from '../../components/invoices/create/InvoiceSummary';
import AttachmentsSection from '../../components/invoices/create/AttachmentsSection';
import EmailTemplateSection from '../../components/invoices/create/EmailTemplateSection';
import QuickActions from '../../components/invoices/create/QuickActions';
import { useToast } from '../../context/ToastContext';
import { draftStorage } from '../../utils/draftStorage';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { saveInvoice } from '../../utils/invoiceStorage';

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  // Main state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('net-30');
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [emailSubject, setEmailSubject] = useState('Invoice for Services Rendered');
  const [emailMessage, setEmailMessage] = useState('Dear valued customer,\n\nPlease find attached your invoice for services rendered.\n\nThank you for your business.\n\nBest regards,');
  
  // Customer state
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState([
    { id: 'nextgen', name: 'NextGen Technologies', email: 'contact@nextgentech.com', address: '123 Innovation Drive, Tech Valley, CA 94025', phone: '+1 (555) 123-4567' },
    { id: 'acme', name: 'Acme Corp', email: 'billing@acmecorp.com', address: '456 Business Ave, Suite 100, New York, NY 10001', phone: '+1 (555) 987-6543' },
    { id: 'techstart', name: 'TechStart Inc', email: 'finance@techstart.com', address: '789 Startup Blvd, San Francisco, CA 94107', phone: '+1 (555) 456-7890' },
  ]);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  
  // Line items state
  const [lineItems, setLineItems] = useState([
    { id: 1, description: '', quantity: 1, rate: 0.00, tax: 0, amount: 0.00 }
  ]);
  
  // Modal states
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [originalInvoice, setOriginalInvoice] = useState(null);
  
  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const totalTax = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate * (item.tax / 100)), 0);
  const totalAmount = subtotal + totalTax;

  // Load draft data
  useEffect(() => {
    loadDraftData();
  }, [id]);

  const loadDraftData = () => {
    try {
      const draft = draftStorage.getDraft(id);
      if (!draft) {
        addToast('Draft not found', 'error');
        navigate('/invoices/drafts');
        return;
      }

      setOriginalInvoice(draft);
      setInvoiceNumber(draft.invoiceNumber || '');
      setIssueDate(draft.issueDate || new Date().toISOString().split('T')[0]);
      setDueDate(draft.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setPaymentTerms(draft.paymentTerms || 'net-30');
      setCurrency(draft.currency || 'USD');
      setNotes(draft.notes || '');
      setTerms(draft.terms || '');
      setEmailSubject(draft.emailSubject || 'Invoice for Services Rendered');
      setEmailMessage(draft.emailMessage || 'Dear valued customer,\n\nPlease find attached your invoice for services rendered.\n\nThank you for your business.\n\nBest regards,');
      
      if (draft.lineItems && draft.lineItems.length > 0) {
        setLineItems(draft.lineItems.map(item => ({
          ...item,
          amount: item.quantity * item.rate * (1 + (item.tax || 0) / 100)
        })));
      }
      
      if (draft.customer) {
        // Add customer to list if not already there
        const existingCustomer = customers.find(c => c.id === draft.customer.id);
        if (!existingCustomer) {
          setCustomers(prev => [...prev, draft.customer]);
        }
        setSelectedCustomer(draft.customer.id);
      }
      
      if (draft.attachments) {
        setAttachments(draft.attachments);
      }
      
      setLoading(false);
    } catch (error) {
      addToast('Error loading draft: ' + error.message, 'error');
      navigate('/invoices/drafts');
    }
  };

  // Handler functions
  const updateLineItem = (id, field, value) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'quantity' || field === 'rate' || field === 'tax') {
          const quantity = field === 'quantity' ? parseInt(value) || 0 : item.quantity;
          const rate = field === 'rate' ? parseFloat(value) || 0 : item.rate;
          const tax = field === 'tax' ? parseFloat(value) || 0 : item.tax;
          updatedItem.amount = quantity * rate * (1 + tax / 100);
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

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      addToast('Please enter customer name and email', 'error');
      return;
    }
    
    const newCustomerId = `cust_${Date.now()}`;
    const customerToAdd = {
      id: newCustomerId,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      address: newCustomer.address
    };
    
    setCustomers([...customers, customerToAdd]);
    setSelectedCustomer(newCustomerId);
    setNewCustomer({ name: '', email: '', phone: '', address: '' });
    addToast('Customer added successfully', 'success');
  };

  const getSelectedCustomer = () => {
    return customers.find(c => c.id === selectedCustomer);
  };

  const handleUpdateDraft = () => {
    try {
      const customer = getSelectedCustomer();
      
      const updatedInvoiceData = {
        ...originalInvoice,
        invoiceNumber,
        issueDate,
        dueDate,
        paymentTerms,
        customer,
        lineItems: lineItems.map(item => ({
          ...item,
          amount: item.quantity * item.rate * (1 + item.tax / 100)
        })),
        subtotal,
        totalTax,
        totalAmount,
        notes,
        terms,
        currency,
        attachments: attachments.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })),
        emailSubject,
        emailMessage,
        updatedAt: new Date().toISOString(),
      };

      const saved = draftStorage.updateDraft(id, updatedInvoiceData);
      
      if (saved) {
        addToast('Draft updated successfully!', 'success');
        navigate('/invoices/drafts');
      } else {
        addToast('Failed to update draft', 'error');
      }
    } catch (error) {
      addToast('Error updating draft: ' + error.message, 'error');
    }
  };

  const handleSendInvoice = async () => {
    if (!selectedCustomer) {
      addToast('Please select a customer', 'error');
      return;
    }
    
    const customer = getSelectedCustomer();
    if (!customer?.email) {
      addToast('Customer email is required to send invoice', 'error');
      return;
    }
    
    setIsSending(true);
    
    try {
      const invoiceData = {
        id: `inv_${Date.now()}`,
        invoiceNumber,
        issueDate,
        dueDate,
        paymentTerms,
        customer,
        lineItems: lineItems.map(item => ({
          ...item,
          amount: item.quantity * item.rate * (1 + item.tax / 100)
        })),
        subtotal,
        totalTax,
        totalAmount,
        notes,
        terms,
        currency,
        status: 'sent',
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // Save to sent invoices
      saveInvoice(invoiceData);

      // Remove from drafts
      draftStorage.deleteDraft(id);

      // Generate PDF
      const pdfDoc = generateInvoicePDF(invoiceData);
      
      // Generate email body
      const emailBody = `
${emailMessage}

INVOICE DETAILS
===============
Invoice #: ${invoiceNumber}
Issue Date: ${new Date(issueDate).toLocaleDateString()}
Due Date: ${new Date(dueDate).toLocaleDateString()}
Total Amount: ${currency} ${totalAmount.toFixed(2)}

ITEMS:
${lineItems.map(item => `- ${item.description}: ${item.quantity} × ${currency}${item.rate} = ${currency}${item.amount.toFixed(2)}`).join('\n')}

Thank you for your business!
      `;
      
      // Convert PDF to Blob for download
      const pdfBlob = pdfDoc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Create download link for the PDF
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(pdfUrl);
      
      // Create mailto link
      const subject = encodeURIComponent(emailSubject);
      const body = encodeURIComponent(emailBody);
      const mailtoLink = `mailto:${customer.email}?subject=${subject}&body=${body}`;
      
      // Open email client
      window.open(mailtoLink, '_blank');
      
      addToast(`Invoice sent to ${customer.email} successfully! PDF downloaded.`, 'success');
      
      // Navigate to invoices list
      setTimeout(() => {
        navigate('/invoices');
      }, 2000);
      
    } catch (error) {
      addToast('Error sending invoice: ' + error.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      const invoiceData = {
        invoiceNumber,
        issueDate,
        dueDate,
        paymentTerms,
        customer: getSelectedCustomer(),
        lineItems,
        subtotal,
        totalTax,
        totalAmount,
        notes,
        terms,
        currency,
      };

      const pdfDoc = generateInvoicePDF(invoiceData);
      pdfDoc.save(`${invoiceNumber}.pdf`);
      addToast('PDF invoice downloaded successfully!', 'success');
    } catch (error) {
      addToast('Error generating PDF: ' + error.message, 'error');
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleDeleteDraft = () => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      draftStorage.deleteDraft(id);
      addToast('Draft deleted successfully', 'success');
      navigate('/invoices/drafts');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading draft...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Edit Draft Invoice
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Editing draft saved on {originalInvoice?.savedAt ? new Date(originalInvoice.savedAt).toLocaleDateString() : 'Unknown date'}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button 
              onClick={handleDeleteDraft}
              className="flex items-center px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete Draft
            </button>
            <button 
              onClick={handlePreview}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button 
              onClick={handleUpdateDraft}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Update Draft
            </button>
            <button 
              onClick={handleSendInvoice}
              disabled={isSending}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isSending ? 'Sending...' : 'Send Invoice'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <CustomerSection
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              customers={customers}
              newCustomer={newCustomer}
              setNewCustomer={setNewCustomer}
              onAddCustomer={handleAddCustomer}
              getSelectedCustomer={getSelectedCustomer}
            />
            
            <InvoiceDetailsSection
              invoiceNumber={invoiceNumber}
              setInvoiceNumber={setInvoiceNumber}
              currency={currency}
              setCurrency={setCurrency}
              issueDate={issueDate}
              setIssueDate={setIssueDate}
              dueDate={dueDate}
              setDueDate={setDueDate}
              paymentTerms={paymentTerms}
              setPaymentTerms={setPaymentTerms}
            />
            
            <LineItemsTable
              lineItems={lineItems}
              updateLineItem={updateLineItem}
              removeLineItem={removeLineItem}
              addLineItem={addLineItem}
              currency={currency}
            />
            
            {/* Notes and Terms */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Additional notes..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Terms and conditions..."
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <InvoiceSummary
              subtotal={subtotal}
              totalTax={totalTax}
              totalAmount={totalAmount}
              currency={currency}
            />
            
            <AttachmentsSection
              attachments={attachments}
              setAttachments={setAttachments}
            />
            
            <EmailTemplateSection
              emailSubject={emailSubject}
              setEmailSubject={setEmailSubject}
              emailMessage={emailMessage}
              setEmailMessage={setEmailMessage}
              onCustomize={() => setShowEmailModal(true)}
            />
            
            <QuickActions
              onDownloadPDF={handleDownloadPDF}
              onSaveDraft={handleUpdateDraft}
            />
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showPreview && (
        <InvoicePreviewModal
          invoiceData={{
            invoiceNumber,
            issueDate,
            dueDate,
            paymentTerms,
            customer: getSelectedCustomer(),
            lineItems,
            subtotal,
            totalTax,
            totalAmount,
            notes,
            terms,
            currency,
          }}
          onClose={() => setShowPreview(false)}
          onSend={handleSendInvoice}
        />
      )}
      
      {showEmailModal && (
        <EmailTemplateModal
          subject={emailSubject}
          message={emailMessage}
          onSave={(subject, message) => {
            setEmailSubject(subject);
            setEmailMessage(message);
            setShowEmailModal(false);
            addToast('Email template saved', 'success');
          }}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default EditInvoice;