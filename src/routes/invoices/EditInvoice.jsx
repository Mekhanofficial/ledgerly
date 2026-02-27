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
import { useInvoice } from '../../context/InvoiceContext';
import { useAccount } from '../../context/AccountContext';
import { isMultiCurrencyPlan } from '../../utils/subscription';
import { draftStorage } from '../../utils/draftStorage';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { fetchTaxSettings } from '../../services/taxSettingsService';

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const {
    drafts,
    customers: invoiceCustomers,
    addCustomer: addCustomerFromContext,
    addInvoice,
    updateInvoice: updateInvoiceFromContext,
    sendInvoice: sendInvoiceFromContext,
    deleteDraft: deleteDraftFromContext,
    loading: invoicesLoading
  } = useInvoice();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  const canUseMultiCurrency = isMultiCurrencyPlan(accountInfo?.plan, accountInfo?.subscriptionStatus);
  
  // Main state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('net-30');
  const [currency, setCurrency] = useState(baseCurrency);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [emailSubject, setEmailSubject] = useState('Invoice for Services Rendered');
  const [emailMessage, setEmailMessage] = useState('Dear valued customer,\n\nPlease find attached your invoice for services rendered.\n\nThank you for your business.\n\nBest regards,');
  
  // Customer state
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  
  // Line items state
  const [lineItems, setLineItems] = useState([
    { id: 1, description: '', quantity: 1, rate: 0.00, tax: 0, amount: 0.00 }
  ]);

  // Tax settings state
  const [taxSettings, setTaxSettings] = useState({
    taxEnabled: true,
    taxName: 'VAT',
    taxRate: 7.5,
    allowManualOverride: true
  });
  
  // Modal states
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [originalInvoice, setOriginalInvoice] = useState(null);
  const [isBackendDraft, setIsBackendDraft] = useState(false);
  
  const roundMoney = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.round((number + Number.EPSILON) * 100) / 100;
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const settingsTaxEnabled = taxSettings.taxEnabled ?? true;
  const taxName = originalInvoice?.taxName || taxSettings.taxName || 'VAT';
  const storedTaxRateValue = Number.isFinite(Number(originalInvoice?.taxRateUsed))
    ? Number(originalInvoice.taxRateUsed)
    : NaN;
  const storedTaxAmount = Number(originalInvoice?.taxAmount ?? originalInvoice?.totalTax ?? NaN);
  const hasStoredTaxAmount = Number.isFinite(storedTaxAmount) && storedTaxAmount > 0;
  const hasStoredTaxRate = Number.isFinite(storedTaxRateValue) && storedTaxRateValue > 0;
  const taxEnabled = originalInvoice
    ? (hasStoredTaxRate || hasStoredTaxAmount || Boolean(originalInvoice?.isTaxOverridden))
    : settingsTaxEnabled;
  const baseTaxRate = Number.isFinite(storedTaxRateValue)
    ? storedTaxRateValue
    : (taxEnabled ? (Number(taxSettings.taxRate) || 0) : 0);
  const hasStoredOverrideAmount = Boolean(originalInvoice?.isTaxOverridden) && Number.isFinite(storedTaxAmount);
  const totalTax = taxEnabled
    ? roundMoney(Math.max(0, hasStoredOverrideAmount ? storedTaxAmount : subtotal * (baseTaxRate / 100)))
    : 0;
  const totalAmount = roundMoney(subtotal + totalTax);
  const isTaxOverridden = taxEnabled && hasStoredOverrideAmount;
  const taxLabel = `${taxName} (${baseTaxRate}%)`;
  const resolvedCurrency = canUseMultiCurrency ? currency : baseCurrency;

  useEffect(() => {
    if (!canUseMultiCurrency) {
      setCurrency(baseCurrency);
      return;
    }
    if (!currency) {
      setCurrency(baseCurrency);
    }
  }, [baseCurrency, canUseMultiCurrency]);

  useEffect(() => {
    setLoading(true);
  }, [id]);

  useEffect(() => {
    if (!Array.isArray(invoiceCustomers)) return;
    setCustomers(invoiceCustomers.map((customer) => ({
      id: customer.id || customer._id,
      name: customer.name || '',
      email: customer.email || '',
      address: customer.address || '',
      phone: customer.phone || ''
    })));
  }, [invoiceCustomers]);

  // Load draft data
  useEffect(() => {
    if (invoicesLoading) return;
    if (!loading) return;
    loadDraftData();
  }, [id, drafts, invoicesLoading, loading]);

  useEffect(() => {
    let isMounted = true;
    const loadTaxSettings = async () => {
      try {
        const settings = await fetchTaxSettings();
        if (!isMounted || !settings) return;
        setTaxSettings({
          taxEnabled: settings.taxEnabled ?? true,
          taxName: settings.taxName || 'VAT',
          taxRate: Number(settings.taxRate) || 0,
          allowManualOverride: settings.allowManualOverride ?? true
        });
      } catch (error) {
        console.error('Failed to load tax settings:', error);
        addToast('Unable to load tax settings. Using defaults.', 'warning');
      }
    };

    loadTaxSettings();
    return () => {
      isMounted = false;
    };
  }, [addToast]);

  const loadDraftData = () => {
    try {
      const backendDraft = drafts.find((draft) => draft.id === id);
      const localDraft = draftStorage.getDraft(id);
      const draft = backendDraft || localDraft;
      if (!draft) {
        addToast('Draft not found', 'error');
        navigate('/invoices/drafts');
        return;
      }

      setIsBackendDraft(Boolean(backendDraft) && !String(id).startsWith('draft_'));
      setOriginalInvoice(draft);
      setInvoiceNumber(draft.invoiceNumber || '');
      setIssueDate(draft.issueDate || new Date().toISOString().split('T')[0]);
      setDueDate(draft.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setPaymentTerms(draft.paymentTerms || 'net-30');
      setCurrency(canUseMultiCurrency ? (draft.currency || baseCurrency) : baseCurrency);
      setNotes(draft.notes || '');
      setTerms(draft.terms || '');
      setEmailSubject(draft.emailSubject || 'Invoice for Services Rendered');
      setEmailMessage(draft.emailMessage || 'Dear valued customer,\n\nPlease find attached your invoice for services rendered.\n\nThank you for your business.\n\nBest regards,');
      
      if (draft.lineItems && draft.lineItems.length > 0) {
        setLineItems(draft.lineItems.map(item => ({
          ...item,
          tax: 0,
          amount: item.quantity * item.rate
        })));
      }
      
      if (draft.customer) {
        const draftCustomerId = draft.customer.id || draft.customer._id || draft.customerId || '';
        const normalizedDraftCustomer = {
          id: draftCustomerId,
          name: draft.customer.name || draft.customerName || '',
          email: draft.customer.email || draft.customerEmail || '',
          address: draft.customer.address || draft.customerAddress || '',
          phone: draft.customer.phone || draft.customerPhone || ''
        };
        // Add customer to list if not already there
        const existingCustomer = customers.find(c => c.id === draftCustomerId);
        if (!existingCustomer) {
          setCustomers(prev => [...prev, normalizedDraftCustomer]);
        }
        setSelectedCustomer(draftCustomerId);
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
        const updatedItem = { ...item, [field]: value, tax: 0 };

        if (field === 'quantity' || field === 'rate') {
          const quantity = field === 'quantity' ? (value === '' ? '' : parseFloat(value) || 0) : item.quantity;
          const rate = field === 'rate' ? (value === '' ? '' : parseFloat(value) || 0) : item.rate;

          if (quantity !== '' && rate !== '') {
            updatedItem.amount = quantity * rate;
          } else {
            updatedItem.amount = 0;
          }
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

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      addToast('Please enter customer name and email', 'error');
      return;
    }

    try {
      const addedCustomer = await addCustomerFromContext(newCustomer, { showNotificationToast: false });
      const normalizedCustomer = {
        id: addedCustomer.id || addedCustomer._id,
        name: addedCustomer.name || newCustomer.name,
        email: addedCustomer.email || newCustomer.email,
        phone: addedCustomer.phone || newCustomer.phone,
        address: addedCustomer.address || newCustomer.address
      };
      setCustomers((prev) => {
        if (prev.some((customer) => customer.id === normalizedCustomer.id)) {
          return prev;
        }
        return [...prev, normalizedCustomer];
      });
      setSelectedCustomer(normalizedCustomer.id);
      setNewCustomer({ name: '', email: '', phone: '', address: '' });
      addToast('Customer added successfully', 'success');
    } catch (error) {
      addToast(error?.message || 'Error adding customer', 'error');
    }
  };

  const getSelectedCustomer = () => {
    return customers.find(c => c.id === selectedCustomer);
  };

  const handleUpdateDraft = async () => {
    try {
      const customer = getSelectedCustomer();
      const customerId = customer?.id || customer?._id || originalInvoice?.customerId || originalInvoice?.customer?._id || originalInvoice?.customer?.id || '';
      const normalizedLineItems = lineItems.map(item => ({
        ...item,
        tax: 0,
        amount: item.quantity * item.rate
      }));
      
      const updatedInvoiceData = {
        ...originalInvoice,
        invoiceNumber,
        issueDate,
        dueDate,
        paymentTerms,
        customer,
        customerId,
        lineItems: normalizedLineItems,
        subtotal,
        totalTax,
        totalAmount,
        taxName,
        taxRateUsed: baseTaxRate,
        taxAmount: totalTax,
        isTaxOverridden,
        notes,
        terms,
        currency: resolvedCurrency,
        attachments: attachments.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })),
        emailSubject,
        emailMessage,
        updatedAt: new Date().toISOString(),
      };

      if (isBackendDraft) {
        if (!customerId) {
          addToast('Please select a customer to sync this draft', 'error');
          return;
        }
        const updated = await updateInvoiceFromContext(id, {
          ...updatedInvoiceData,
          status: 'draft'
        });
        if (updated) {
          addToast('Draft updated successfully!', 'success');
          navigate('/invoices/drafts');
        } else {
          addToast('Failed to update draft', 'error');
        }
        return;
      }

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
      const draftPayload = {
        invoiceNumber,
        issueDate,
        dueDate,
        paymentTerms,
        customer,
        customerId: customer.id || customer._id,
        lineItems: lineItems.map((item) => ({
          ...item,
          tax: 0,
          amount: item.quantity * item.rate
        })),
        subtotal,
        totalTax,
        totalAmount,
        taxName,
        taxRateUsed: baseTaxRate,
        taxAmount: totalTax,
        isTaxOverridden,
        notes,
        terms,
        emailSubject,
        emailMessage,
        templateStyle: originalInvoice?.templateStyle || 'standard',
        currency: resolvedCurrency
      };

      let targetInvoiceId = id;
      if (isBackendDraft) {
        const updatedDraft = await updateInvoiceFromContext(id, {
          ...draftPayload,
          status: 'draft'
        });
        if (!updatedDraft) {
          throw new Error('Failed to update draft before sending');
        }
      } else {
        const createdDraft = await addInvoice({
          ...draftPayload,
          status: 'draft'
        });
        if (!createdDraft?.id) {
          throw new Error('Failed to sync local draft before sending');
        }
        targetInvoiceId = createdDraft.id;
        await deleteDraftFromContext(id);
      }

      const sentInvoice = await sendInvoiceFromContext(targetInvoiceId, {
        templateStyle: originalInvoice?.templateStyle || 'standard',
        emailSubject,
        emailMessage
      }, { throwOnError: true });
      if (!sentInvoice) {
        throw new Error('Failed to send invoice');
      }

      addToast(`Invoice ${sentInvoice.invoiceNumber || invoiceNumber} sent successfully!`, 'success');
      navigate('/invoices');
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
        taxName,
        taxRateUsed: baseTaxRate,
        taxAmount: totalTax,
        isTaxOverridden,
        notes,
        terms,
        currency: resolvedCurrency,
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

  const handleDeleteDraft = async () => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      const deleted = await deleteDraftFromContext(id);
      if (deleted) {
        navigate('/invoices/drafts');
      } else {
        addToast('Failed to delete draft', 'error');
      }
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
              currency={resolvedCurrency}
              setCurrency={setCurrency}
              isMultiCurrencyAllowed={canUseMultiCurrency}
              baseCurrency={baseCurrency}
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
              currency={resolvedCurrency}
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
              currency={resolvedCurrency}
              taxLabel={taxLabel}
              showTax={taxEnabled}
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
            taxName,
            taxRateUsed: baseTaxRate,
            isTaxOverridden,
            notes,
            terms,
            currency: resolvedCurrency,
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


