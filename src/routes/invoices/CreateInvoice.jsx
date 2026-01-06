// src/routes/invoices/CreateInvoice.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Eye, Mail, Download, Repeat, Save, Printer, Palette } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import InvoicePreviewModal from '../../components/invoices/InvoicePreviewModal';
import EmailTemplateModal from '../../components/invoices/EmailTemplateModal';
import RecurringSettingsModal from '../../components/invoices/RecurringSettingsModal';
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
import { saveRecurringInvoice } from '../../utils/recurringStorage';
import { templateStorage, getAvailableTemplates } from '../../utils/templateStorage';

const CreateInvoice = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  
  // Main state
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState('net-30');
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('Payment due within 30 days. Late payments subject to 1.5% monthly interest.');
  const [terms, setTerms] = useState('All services are subject to our terms and conditions. For any questions, please contact our billing department.');
  const [attachments, setAttachments] = useState([]);
  const [emailSubject, setEmailSubject] = useState('Invoice for Services Rendered');
  const [emailMessage, setEmailMessage] = useState('Dear valued customer,\n\nPlease find attached your invoice for services rendered.\n\nThank you for your business.\n\nBest regards,');
  
  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [availableTemplates, setAvailableTemplates] = useState([]);
  
  // Recurring invoice state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringSettings, setRecurringSettings] = useState({
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endOption: 'never',
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalCycles: 12,
    sendReminders: true
  });
  
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
    { id: 1, description: 'Web Development Services', quantity: 1, rate: 125.00, tax: 10, amount: 137.50 },
    { id: 2, description: 'UI/UX Design', quantity: 1, rate: 150.00, tax: 10, amount: 165.00 }
  ]);
  
  // Modal states
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  
  // Load available templates
  useEffect(() => {
    loadTemplates();
  }, []);

  // Load template if provided
  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadTemplates = () => {
    const templates = getAvailableTemplates();
    setAvailableTemplates(templates);
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const totalTax = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate * (item.tax / 100)), 0);
  const totalAmount = subtotal + totalTax;

  const loadTemplate = (templateId) => {
    setLoadingTemplate(true);
    try {
      const template = templateStorage.getTemplate(templateId);
      if (template) {
        // Apply template settings
        if (template.lineItems && template.lineItems.length > 0) {
          setLineItems(template.lineItems.map(item => ({
            ...item,
            amount: item.quantity * item.rate * (1 + (item.tax || 0) / 100)
          })));
        }
        if (template.notes) setNotes(template.notes);
        if (template.terms) setTerms(template.terms);
        if (template.emailSubject) setEmailSubject(template.emailSubject);
        if (template.emailMessage) setEmailMessage(template.emailMessage);
        if (template.currency) setCurrency(template.currency);
        if (template.paymentTerms) setPaymentTerms(template.paymentTerms);
        
        // Set template style if available
        if (template.templateStyle) {
          setSelectedTemplate(template.templateStyle);
        }
        
        addToast(`Template "${template.name}" loaded successfully!`, 'success');
      } else {
        addToast('Template not found', 'warning');
      }
    } catch (error) {
      addToast('Error loading template', 'error');
      console.error('Template loading error:', error);
    } finally {
      setLoadingTemplate(false);
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

  const handleSaveDraft = () => {
    try {
      const customer = getSelectedCustomer();
      
      const invoiceData = {
        id: `draft_${Date.now()}`,
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
        templateStyle: selectedTemplate,
        isRecurring,
        recurringSettings,
        status: 'draft',
        savedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const saved = draftStorage.saveDraft(invoiceData);
      
      if (saved) {
        addToast('Invoice saved as draft successfully!', 'success');
        navigate('/invoices/drafts');
      } else {
        addToast('Failed to save draft', 'error');
      }
    } catch (error) {
      addToast('Error saving draft: ' + error.message, 'error');
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
      const invoiceId = `inv_${Date.now()}`;
      const invoiceData = {
        id: invoiceId,
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
        templateStyle: selectedTemplate,
        status: 'sent',
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // Save to sent invoices
      saveInvoice(invoiceData);

      // If recurring, save recurring profile
      if (isRecurring) {
        const recurringData = {
          id: `rec_${Date.now()}`,
          invoiceId,
          invoiceNumber,
          customer,
          amount: totalAmount,
          frequency: recurringSettings.frequency,
          startDate: recurringSettings.startDate,
          endDate: recurringSettings.endDate,
          nextRun: recurringSettings.startDate,
          totalCycles: recurringSettings.totalCycles,
          cyclesCompleted: 1,
          status: 'active',
          lineItems: lineItems.map(item => ({
            ...item,
            amount: item.quantity * item.rate * (1 + item.tax / 100)
          })),
          templateStyle: selectedTemplate,
          created: new Date().toISOString()
        };
        
        saveRecurringInvoice(recurringData);
        addToast('Recurring invoice profile created', 'success');
      }

      // Generate PDF with template
      const pdfDoc = generateInvoicePDF(invoiceData, selectedTemplate);
      
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
      downloadLink.download = `${invoiceNumber}-${selectedTemplate}.pdf`;
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
      
      addToast(`Invoice sent to ${customer.email} successfully!${isRecurring ? ' Recurring profile created.' : ''}`, 'success');
      
      // Reset form after successful send
      setTimeout(() => {
        setInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
        setIssueDate(new Date().toISOString().split('T')[0]);
        setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        setSelectedCustomer('');
        setLineItems([{ id: 1, description: '', quantity: 1, rate: 0.00, tax: 0, amount: 0.00 }]);
        setAttachments([]);
        setSelectedTemplate('standard');
        setNotes('Payment due within 30 days. Late payments subject to 1.5% monthly interest.');
        setTerms('All services are subject to our terms and conditions. For any questions, please contact our billing department.');
        setIsRecurring(false);
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
        templateStyle: selectedTemplate
      };

      const pdfDoc = generateInvoicePDF(invoiceData, selectedTemplate);
      pdfDoc.save(`${invoiceNumber}-${selectedTemplate}.pdf`);
      addToast('PDF invoice downloaded successfully!', 'success');
    } catch (error) {
      addToast('Error generating PDF: ' + error.message, 'error');
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleSaveAsTemplate = () => {
    setIsSavingTemplate(true);
    try {
      const templateName = prompt('Enter template name:', `Template from ${invoiceNumber}`);
      
      if (!templateName) {
        addToast('Template name is required', 'warning');
        setIsSavingTemplate(false);
        return;
      }
      
      const templateData = {
        id: `template_${Date.now()}`,
        name: templateName,
        description: 'Custom template created from invoice',
        category: 'custom',
        isDefault: false,
        isFavorite: false,
        previewColor: 'bg-gradient-to-br from-primary-500 to-primary-600',
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          tax: item.tax
        })),
        notes,
        terms,
        emailSubject,
        emailMessage,
        currency,
        paymentTerms,
        templateStyle: selectedTemplate,
        createdAt: new Date().toISOString()
      };

      templateStorage.saveTemplate(templateData);
      addToast(`Template "${templateName}" saved successfully!`, 'success');
      
      // Navigate to templates page
      setTimeout(() => {
        navigate('/invoices/templates');
      }, 1500);
    } catch (error) {
      addToast('Error saving template: ' + error.message, 'error');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
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
      templateStyle: selectedTemplate
    };

    const templateColors = {
      standard: { primary: '#2980b9', bg: '#f8f9fa' },
      modern: { primary: '#2ecc71', bg: '#ffffff' },
      minimal: { primary: '#34495e', bg: '#ffffff' },
      professional: { primary: '#8e44ad', bg: '#f5f5f5' },
      creative: { primary: '#e74c3c', bg: '#fef9e7' }
    };

    const colors = templateColors[selectedTemplate] || templateColors.standard;

    const printContent = `
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              background: ${colors.bg};
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .invoice-header { 
              border-bottom: 3px solid ${colors.primary}; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .invoice-title { 
              font-size: 28px; 
              font-weight: bold; 
              color: ${colors.primary}; 
              margin: 0;
            }
            .template-badge {
              background: ${colors.primary};
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            }
            .invoice-details { 
              margin-top: 20px; 
              color: #666;
              font-size: 14px;
            }
            .customer-info { 
              background: #f8f9fa; 
              padding: 20px; 
              margin: 20px 0; 
              border-radius: 5px; 
              border-left: 4px solid ${colors.primary};
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
            }
            .items-table th { 
              background: ${colors.primary}; 
              color: white; 
              padding: 12px; 
              text-align: left; 
              font-weight: bold;
            }
            .items-table td { 
              padding: 12px; 
              border-bottom: 1px solid #ddd; 
            }
            .items-table tr:nth-child(even) {
              background: #f8f9fa;
            }
            .total-section { 
              margin-top: 30px; 
              text-align: right; 
              padding-top: 20px;
              border-top: 2px solid ${colors.primary};
            }
            .total-amount { 
              font-size: 24px; 
              font-weight: bold; 
              color: ${colors.primary}; 
            }
            .notes-section, .terms-section {
              margin-top: 25px;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 5px;
            }
            .section-title {
              color: ${colors.primary};
              font-weight: bold;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .section-title:before {
              content: "•";
              font-size: 20px;
            }
            @media print {
              body { margin: 0; background: white; }
              .invoice-container { box-shadow: none; padding: 20px; }
              .no-print { display: none; }
              .template-badge { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="invoice-header">
              <div>
                <h1 class="invoice-title">INVOICE</h1>
                <span class="template-badge">${selectedTemplate.toUpperCase()} TEMPLATE</span>
                <div class="invoice-details">
                  <strong>Invoice #:</strong> ${invoiceNumber}<br>
                  <strong>Issue Date:</strong> ${new Date(issueDate).toLocaleDateString()}<br>
                  <strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}<br>
                  <strong>Payment Terms:</strong> ${paymentTerms}
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 18px; font-weight: bold; color: ${colors.primary};">LEDGERLY</div>
                <div style="color: #666; font-size: 14px;">
                  123 Business Street<br>
                  City, State 12345<br>
                  contact@ledgerly.com
                </div>
              </div>
            </div>
            
            <!-- Customer Info -->
            ${invoiceData.customer ? `
              <div class="customer-info">
                <div style="font-weight: bold; margin-bottom: 10px; color: ${colors.primary};">Bill To:</div>
                <div style="color: #333;">
                  <div style="font-weight: bold;">${invoiceData.customer.name}</div>
                  <div>${invoiceData.customer.address}</div>
                  <div>${invoiceData.customer.email}</div>
                  <div>${invoiceData.customer.phone}</div>
                </div>
              </div>
            ` : ''}
            
            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Tax</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${lineItems.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${currency} ${item.rate.toFixed(2)}</td>
                    <td>${item.tax}%</td>
                    <td><strong>${currency} ${item.amount.toFixed(2)}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <!-- Totals -->
            <div class="total-section">
              <div style="margin-bottom: 8px;"><strong>Subtotal:</strong> ${currency} ${subtotal.toFixed(2)}</div>
              <div style="margin-bottom: 16px;"><strong>Tax:</strong> ${currency} ${totalTax.toFixed(2)}</div>
              <div class="total-amount">Total: ${currency} ${totalAmount.toFixed(2)}</div>
            </div>
            
            <!-- Notes -->
            ${notes ? `
              <div class="notes-section">
                <div class="section-title">Notes</div>
                <div style="color: #333; line-height: 1.6;">${notes.replace(/\n/g, '<br>')}</div>
              </div>
            ` : ''}
            
            <!-- Terms -->
            ${terms ? `
              <div class="terms-section">
                <div class="section-title">Terms & Conditions</div>
                <div style="color: #333; line-height: 1.6; font-size: 14px;">${terms.replace(/\n/g, '<br>')}</div>
              </div>
            ` : ''}
            
            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
              <div>Thank you for your business!</div>
              <div style="margin-top: 5px;">Generated by Ledgerly Invoice System • ${selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template</div>
            </div>
            
            <!-- Print Controls -->
            <div class="no-print" style="margin-top: 50px; text-align: center; padding-top: 20px; border-top: 1px solid #ddd;">
              <button onclick="window.print()" style="padding: 12px 24px; background: ${colors.primary}; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                Print Invoice
              </button>
              <button onclick="window.close()" style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                Close Window
              </button>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    addToast('Print preview opened', 'info');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Create Invoice
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Create and send professional invoices to your customers
              {templateId && (
                <span className="text-primary-600 ml-2">
                  <Palette className="w-4 h-4 inline mr-1" />
                  Template loaded
                </span>
              )}
              {loadingTemplate && (
                <span className="text-amber-600 ml-2">Loading template...</span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button 
              onClick={handlePreview}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button 
              onClick={handleSaveDraft}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
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
            
            {/* Template Selection */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Template Selection
              </h2>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Choose Template Style
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {availableTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {availableTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        selectedTemplate === template.id
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-md scale-105'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm'
                      }`}
                      title={template.name}
                    >
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-8 h-8 rounded-lg mb-2 shadow-inner"
                          style={{ 
                            backgroundColor: `rgb(${template.colors.primary.join(',')})`,
                            background: `linear-gradient(135deg, 
                              rgb(${template.colors.primary.join(',')}) 0%, 
                              rgb(${template.colors.secondary.join(',')}) 100%)`
                          }}
                        ></div>
                        <span className="text-xs font-medium">{template.id}</span>
                        {template.isDefault && (
                          <span className="text-[10px] text-primary-600 dark:text-primary-400 mt-1">
                            Default
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                  <p>Selected: <span className="font-medium text-primary-600">{selectedTemplate.toUpperCase()}</span> template</p>
                  <p className="text-xs mt-1">This template will be used for PDF generation and printing</p>
                </div>
              </div>
            </div>
            
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
            
            {/* Recurring Invoice Checkbox */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="recurring" className="ml-3 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Repeat className="w-4 h-4 mr-2" />
                    Set as Recurring Invoice
                  </label>
                </div>
                {isRecurring && (
                  <button
                    onClick={() => setShowRecurringModal(true)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Configure
                  </button>
                )}
              </div>
              {isRecurring && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  Will repeat {recurringSettings.frequency} starting {recurringSettings.startDate}
                </div>
              )}
            </div>
            
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
              onSaveDraft={handleSaveDraft}
              onSaveTemplate={handleSaveAsTemplate}
              onPrint={handlePrint}
              isSavingTemplate={isSavingTemplate}
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
            templateStyle: selectedTemplate
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
      
      {showRecurringModal && (
        <RecurringSettingsModal
          settings={recurringSettings}
          onSave={(settings) => {
            setRecurringSettings(settings);
            setShowRecurringModal(false);
            addToast('Recurring settings saved', 'success');
          }}
          onClose={() => setShowRecurringModal(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default CreateInvoice;