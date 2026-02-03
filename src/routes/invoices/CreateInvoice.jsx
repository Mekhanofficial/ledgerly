// src/routes/invoices/CreateInvoice.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Eye, Mail, Download, Repeat, Save, Printer, Palette, Package, Search, Plus } from 'lucide-react';
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
import { useInvoice } from '../../context/InvoiceContext';
import { useInventory } from '../../context/InventoryContext';
import { useAccount } from '../../context/AccountContext';
import templateStorage from '../../utils/templateStorage';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TEMPLATE_COLOR_FALLBACK = {
  primary: '#2980b9',
  secondary: '#3498db',
  accent: '#f8f9fa',
  text: '#2c3e50'
};

const toCssColor = (colorValue, fallback) => {
  if (Array.isArray(colorValue)) {
    return `rgb(${colorValue.join(',')})`;
  }
  return colorValue || fallback;
};

const resolveTemplateColors = (templateId) => {
  const template = templateStorage.getTemplate(templateId) || templateStorage.getTemplate('standard');
  const palette = template?.colors || {};
  return {
    primary: toCssColor(palette.primary, TEMPLATE_COLOR_FALLBACK.primary),
    secondary: toCssColor(palette.secondary, TEMPLATE_COLOR_FALLBACK.secondary),
    accent: toCssColor(palette.accent, TEMPLATE_COLOR_FALLBACK.accent),
    text: toCssColor(palette.text, TEMPLATE_COLOR_FALLBACK.text)
  };
};

const dedupeTemplates = (templates = []) => {
  const map = new Map();
  templates.forEach((template) => {
    if (template?.id && !map.has(template.id)) {
      map.set(template.id, template);
    }
  });
  return Array.from(map.values());
};

const CreateInvoice = () => {
  const { addToast } = useToast();
  const { 
    addInvoice, 
    addCustomer, 
    refreshCustomers,
    saveDraft,
    customers,
    saveRecurringInvoice,
    getAvailableTemplates 
  } = useInvoice();
  
  const { getProductsForInvoice } = useInventory();
  const { accountInfo } = useAccount();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const invoiceRef = useRef(null);
  
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
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  
  // Line items state - EMPTY BY DEFAULT
  const [lineItems, setLineItems] = useState([
    { id: 1, description: '', quantity: 1, rate: 0.00, tax: 0, amount: 0.00 }
  ]);
  
  // Inventory products state
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  
  // Modal states
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  
  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const totalTax = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate * (item.tax / 100)), 0);
  const totalAmount = subtotal + totalTax;

  // Load templates
  useEffect(() => {
    const templates = dedupeTemplates(getAvailableTemplates());
    setAvailableTemplates(templates);
    
    // Set initial template data if available
    const defaultTemplate = templates.find(t => t.id === 'standard');
    if (defaultTemplate) {
      setNotes(defaultTemplate.notes || '');
      setTerms(defaultTemplate.terms || '');
      setEmailSubject(defaultTemplate.emailSubject || 'Invoice for Services Rendered');
      setEmailMessage(defaultTemplate.emailMessage || 'Dear valued customer,\n\nPlease find attached your invoice for services rendered.\n\nThank you for your business.\n\nBest regards,');
      setCurrency(defaultTemplate.currency || 'USD');
      setPaymentTerms(defaultTemplate.paymentTerms || 'net-30');
    }
  }, [getAvailableTemplates]);

  // Load products from inventory
  useEffect(() => {
    const products = getProductsForInvoice();
    setAvailableProducts(products);
  }, [getProductsForInvoice]);

  // Load specific template if provided in URL
  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadTemplate = (templateId) => {
    setLoadingTemplate(true);
    try {
      const templates = dedupeTemplates(getAvailableTemplates());
      const template = templates.find(t => t.id === templateId);
      if (template) {
        // Apply template settings
        if (template.lineItems && template.lineItems.length > 0) {
          setLineItems(template.lineItems.map(item => ({
            ...item,
            id: Date.now() + Math.random(),
            amount: item.quantity * item.rate * (1 + (item.tax || 0) / 100)
          })));
        }
        if (template.notes) setNotes(template.notes);
        if (template.terms) setTerms(template.terms);
        if (template.emailSubject) setEmailSubject(template.emailSubject);
        if (template.emailMessage) setEmailMessage(template.emailMessage);
        if (template.currency) setCurrency(template.currency);
        if (template.paymentTerms) setPaymentTerms(template.paymentTerms);
        if (template.templateStyle) setSelectedTemplate(template.templateStyle);
        
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

  // Handler functions for line items
  const updateLineItem = (id, field, value) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'quantity' || field === 'rate' || field === 'tax') {
          const quantity = field === 'quantity' ? (value === '' ? '' : parseFloat(value) || 0) : item.quantity;
          const rate = field === 'rate' ? (value === '' ? '' : parseFloat(value) || 0) : item.rate;
          const tax = field === 'tax' ? (value === '' ? '' : parseFloat(value) || 0) : item.tax;
          
          // Only calculate amount if all values are numbers
          if (quantity !== '' && rate !== '' && tax !== '') {
            updatedItem.amount = quantity * rate * (1 + tax / 100);
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

  // Add product from inventory
  const addProductFromInventory = (product) => {
    const newId = lineItems.length > 0 ? Math.max(...lineItems.map(item => item.id)) + 1 : 1;
    
    const newItem = {
      id: newId,
      description: product.name,
      quantity: 1,
      rate: product.price,
      tax: 0,
      amount: product.price,
      productId: product.id,
      sku: product.sku,
      stock: product.stock
    };
    
    setLineItems([...lineItems, newItem]);
    setShowProductSelector(false);
    setProductSearchTerm('');
    addToast(`Product "${product.name}" added to invoice`, 'success');
  };

  // Filter products for selector
  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      addToast('Please enter customer name and email', 'error');
      return;
    }
    
    setIsAddingCustomer(true);
    try {
      const addedCustomer = await addCustomer(newCustomer, { showNotificationToast: false });
      setSelectedCustomer(addedCustomer.id);
      setNewCustomer({ name: '', email: '', phone: '', address: '' });
      refreshCustomers();
      addToast(`Customer "${addedCustomer.name}" added successfully!`, 'success');
    } catch (error) {
      addToast(error?.message || 'Error adding customer', 'error');
    } finally {
      setIsAddingCustomer(false);
    }
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
        customer: customer || newCustomer,
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          tax: item.tax,
          amount: item.amount,
          productId: item.productId,
          sku: item.sku
        })),
        subtotal,
        totalTax,
        totalAmount,
        notes,
        terms,
        currency,
        emailSubject,
        emailMessage,
        templateStyle: selectedTemplate,
        isRecurring,
        recurringSettings,
        attachments: attachments.map(att => ({
          name: att.name,
          type: att.type,
          size: att.size,
          url: URL.createObjectURL(att)
        })),
        status: 'draft',
        savedAt: new Date().toISOString()
      };

      saveDraft(invoiceData);
      addToast('Draft saved successfully!', 'success');
      navigate('/invoices/drafts');
    } catch (error) {
      addToast('Error saving draft: ' + error.message, 'error');
    }
  };

  const generatePDF = async (download = true, overrideLineItems = null) => {
    try {
      const customer = getSelectedCustomer() || newCustomer;
      const pdfLineItems = (overrideLineItems && overrideLineItems.length > 0) ? overrideLineItems : lineItems;
      
      // Create a hidden div for PDF generation
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '-9999px';
      pdfContainer.style.width = '800px';
      pdfContainer.style.backgroundColor = 'white';
      pdfContainer.style.padding = '40px';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      
      const colors = resolveTemplateColors(selectedTemplate);
      
      const companyName = accountInfo?.companyName || 'Ledgerly';
      const contactTitle = accountInfo?.contactName ? `Attn: ${accountInfo.contactName}` : '';
      const locationPieces = [
        accountInfo?.city,
        accountInfo?.state,
        accountInfo?.zipCode
      ].filter(Boolean);
      const cityLine = locationPieces.length > 0 ? locationPieces.join(', ') : '';
      const companyLines = [
        accountInfo?.address,
        cityLine,
        accountInfo?.country
      ].filter(Boolean);
      const companyLinesHtml = companyLines.map(line => `<div>${line}</div>`).join('');
      const contactDetailsList = [
        accountInfo?.email,
        accountInfo?.phone,
        accountInfo?.website
      ].filter(Boolean);
      const contactDetailsHtml = contactDetailsList.map(line => `<div>${line}</div>`).join('');
      
      // Prepare attachments HTML
      let attachmentsHtml = '';
      if (attachments.length > 0) {
        attachmentsHtml = `
          <div style="margin-top: 30px; padding: 20px; background: ${colors.accent}; border-radius: 8px; border-left: 4px solid ${colors.primary};">
            <div style="color: ${colors.primary}; font-weight: bold; margin-bottom: 15px; font-size: 14px;">
              <span style="margin-right: 8px;">📎</span>Attachments
            </div>
        `;
        
        for (const file of attachments) {
          if (file.type.startsWith('image/')) {
            // For images in PDF, we'll embed them
            const reader = new FileReader();
            const imagePromise = new Promise((resolve) => {
              reader.onload = function(e) {
                attachmentsHtml += `
                  <div style="margin-bottom: 15px; padding: 10px; background: white; border-radius: 6px; border: 1px solid #e9ecef;">
                    <div style="font-weight: bold; color: #495057; margin-bottom: 8px; font-size: 13px;">${file.name}</div>
                    <div style="color: #6c757d; font-size: 12px; margin-bottom: 10px;">${(file.size / 1024).toFixed(1)} KB</div>
                    <img src="${e.target.result}" style="max-width: 300px; max-height: 200px; border-radius: 4px; border: 1px solid #dee2e6;" />
                  </div>
                `;
                resolve();
              };
              reader.readAsDataURL(file);
            });
            await imagePromise;
          } else {
            attachmentsHtml += `
              <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 6px; border: 1px solid #e9ecef;">
                <div style="font-weight: bold; color: #495057; font-size: 13px;">${file.name}</div>
                <div style="color: #6c757d; font-size: 12px;">${(file.size / 1024).toFixed(1)} KB • ${file.type}</div>
              </div>
            `;
          }
        }
        
        attachmentsHtml += '</div>';
      }
      
      const htmlContent = `
        <div id="invoice-content" style="max-width: 800px; margin: 0 auto;">
          <!-- Header -->
          <div style="border-bottom: 3px solid ${colors.primary}; padding-bottom: 30px; margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h1 style="font-size: 32px; font-weight: bold; color: ${colors.primary}; margin: 0 0 10px 0;">INVOICE</h1>
                <div style="background: ${colors.primary}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block;">
                  ${selectedTemplate.toUpperCase()} TEMPLATE
                </div>
                <div style="color: #6c757d; font-size: 14px; margin-top: 15px;">
                  <div><strong>Invoice #:</strong> ${invoiceNumber}</div>
                  <div><strong>Issue Date:</strong> ${new Date(issueDate).toLocaleDateString()}</div>
                  <div><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</div>
                  <div><strong>Payment Terms:</strong> ${paymentTerms}</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 18px; font-weight: bold; color: ${colors.primary}; margin-bottom: 10px;">
                  ${companyName}
                </div>
                <div style="color: #6c757d; font-size: 13px; line-height: 1.4;">
                  ${contactTitle ? `<div>${contactTitle}</div>` : ''}
                  ${companyLinesHtml}
                  ${contactDetailsHtml}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Customer Info -->
          ${customer ? `
            <div style="background: ${colors.accent}; padding: 25px; margin: 20px 0 30px 0; border-radius: 8px; border-left: 4px solid ${colors.primary};">
              <div style="font-weight: bold; margin-bottom: 15px; color: ${colors.primary}; font-size: 16px;">Bill To:</div>
              <div style="color: #495057;">
                <div style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">${customer.name}</div>
                ${customer.address ? `<div style="margin-bottom: 5px;">${customer.address}</div>` : ''}
                <div style="margin-bottom: 5px;">${customer.email}</div>
                ${customer.phone ? `<div>${customer.phone}</div>` : ''}
              </div>
            </div>
          ` : ''}
          
          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0 30px 0;">
            <thead>
              <tr style="background: ${colors.primary}; color: white;">
                <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Description</th>
                <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Qty</th>
                <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Rate</th>
                <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Tax</th>
                <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${pdfLineItems.map((item, index) => `
                <tr style="${index % 2 === 0 ? `background: ${colors.accent};` : ''} border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 15px; font-size: 14px; color: #495057;">
                    ${item.description || 'Item'}
                    ${item.sku ? `<div style="font-size: 12px; color: #6c757d;">SKU: ${item.sku}</div>` : ''}
                  </td>
                  <td style="padding: 15px; font-size: 14px; color: #495057;">${item.quantity}</td>
                  <td style="padding: 15px; font-size: 14px; color: #495057;">${currency} ${item.rate.toFixed(2)}</td>
                  <td style="padding: 15px; font-size: 14px; color: #495057;">${item.tax}%</td>
                  <td style="padding: 15px; font-size: 14px; font-weight: bold; color: #495057;">${currency} ${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Totals -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid ${colors.primary}; text-align: right;">
            <div style="margin-bottom: 10px;">
              <span style="color: #6c757d; font-size: 14px;">Subtotal:</span>
              <span style="font-weight: bold; color: #495057; margin-left: 20px; font-size: 16px;">${currency} ${subtotal.toFixed(2)}</span>
            </div>
            <div style="margin-bottom: 20px;">
              <span style="color: #6c757d; font-size: 14px;">Tax:</span>
              <span style="font-weight: bold; color: #495057; margin-left: 20px; font-size: 16px;">${currency} ${totalTax.toFixed(2)}</span>
            </div>
            <div>
              <span style="color: ${colors.primary}; font-weight: bold; font-size: 20px;">Total:</span>
              <span style="color: ${colors.primary}; font-weight: bold; margin-left: 20px; font-size: 24px;">${currency} ${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <!-- Attachments -->
          ${attachmentsHtml}
          
          <!-- Notes -->
          ${notes ? `
            <div style="margin-top: 30px; padding: 20px; background: ${colors.accent}; border-radius: 8px;">
              <div style="color: ${colors.primary}; font-weight: bold; margin-bottom: 15px; font-size: 14px;">
                <span style="margin-right: 8px;">📝</span>Notes
              </div>
              <div style="color: #495057; line-height: 1.6; font-size: 14px; white-space: pre-line;">${notes}</div>
            </div>
          ` : ''}
          
          <!-- Terms -->
          ${terms ? `
            <div style="margin-top: 20px; padding: 20px; background: ${colors.accent}; border-radius: 8px;">
              <div style="color: ${colors.primary}; font-weight: bold; margin-bottom: 15px; font-size: 14px;">
                <span style="margin-right: 8px;">⚖️</span>Terms & Conditions
              </div>
              <div style="color: #495057; line-height: 1.6; font-size: 13px; white-space: pre-line;">${terms}</div>
            </div>
          ` : ''}
          
          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 12px;">
            <div>Thank you for your business!</div>
            <div style="margin-top: 5px;">Generated by Ledgerly Invoice System • ${selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template</div>
          </div>
        </div>
      `;
      
      pdfContainer.innerHTML = htmlContent;
      document.body.appendChild(pdfContainer);
      
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate PDF from HTML
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Clean up
      document.body.removeChild(pdfContainer);
      
      if (download) {
        pdf.save(`${invoiceNumber}.pdf`);
        addToast('PDF invoice downloaded successfully!', 'success');
      }
      
      return pdf;
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      addToast('Error generating PDF: ' + error.message, 'error');
      throw error;
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await generatePDF(true);
    } catch (error) {
      addToast('Error downloading PDF', 'error');
    }
  };

  const handleSendInvoice = async () => {
    try {
      if (!selectedCustomer && !newCustomer.name) {
        addToast('Please select a customer or add new customer details', 'error');
        return;
      }
      
      const normalizedLineItems = lineItems
        .map((item) => {
          const quantity = Number(item.quantity);
          const rate = Number(item.rate);
          const tax = Number(item.tax);
          const safeQuantity = Number.isFinite(quantity) ? quantity : 0;
          const safeRate = Number.isFinite(rate) ? rate : 0;
          const safeTax = Number.isFinite(tax) ? tax : 0;
          const computedAmount = Number(item.amount) || safeQuantity * safeRate * (1 + safeTax / 100);
          return {
            ...item,
            description: (item.description || '').trim(),
            quantity: safeQuantity,
            rate: safeRate,
            tax: safeTax,
            amount: Number.isFinite(computedAmount) ? computedAmount : 0
          };
        })
        .filter(item => item.description && item.quantity > 0 && Number.isFinite(item.rate));

      if (normalizedLineItems.length === 0) {
        addToast('Add at least one line item with a description and quantity greater than zero', 'error');
        return;
      }

      setIsSending(true);
      
      let customer = getSelectedCustomer();
      
      // If no existing customer selected but new customer data exists, add them
      if (!customer && newCustomer.name && newCustomer.email) {
        customer = await addCustomer(newCustomer, { showNotificationToast: false });
      }
      
      if (!customer) {
        throw new Error('Customer information is required');
      }
      
      const sanitizedSubtotal = normalizedLineItems.reduce(
        (sum, item) => sum + item.quantity * item.rate,
        0
      );
      const sanitizedTotalTax = normalizedLineItems.reduce(
        (sum, item) => sum + (item.quantity * item.rate * (item.tax / 100)),
        0
      );
      const sanitizedTotalAmount = sanitizedSubtotal + sanitizedTotalTax;
      
      // Generate PDF first
      const pdf = await generatePDF(false, normalizedLineItems);
      
      // Convert PDF to Blob for email attachment
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const invoiceData = {
        id: `inv_${Date.now()}`,
        number: invoiceNumber,
        invoiceNumber,
        issueDate,
        dueDate,
        paymentTerms,
        customer: customer.name,
        customerEmail: customer.email,
        customerId: customer.id,
        lineItems: normalizedLineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          tax: item.tax,
          amount: item.amount,
          productId: item.productId,
          sku: item.sku
        })),
        items: normalizedLineItems.length,
        amount: sanitizedTotalAmount,
        totalAmount: sanitizedTotalAmount,
        subtotal: sanitizedSubtotal,
        totalTax: sanitizedTotalTax,
        notes,
        terms,
        currency,
        status: 'sent',
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        templateStyle: selectedTemplate
      };

      // Add to invoices
      const createdInvoice = await addInvoice(invoiceData);
      if (!createdInvoice) {
        throw new Error('Failed to create invoice');
      }

      // If recurring, save recurring profile
      if (isRecurring) {
        const recurringData = {
          id: `rec_${Date.now()}`,
          invoiceNumber: createdInvoice.invoiceNumber,
          invoiceId: createdInvoice.id,
          customer,
          amount: sanitizedTotalAmount,
          frequency: recurringSettings.frequency,
          startDate: recurringSettings.startDate,
          endDate: recurringSettings.endDate,
          nextRun: recurringSettings.startDate,
          totalCycles: recurringSettings.totalCycles,
          cyclesCompleted: 1,
          status: 'active',
          lineItems: normalizedLineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            tax: item.tax,
            amount: item.amount
          })),
          templateStyle: selectedTemplate
        };
        
        saveRecurringInvoice(recurringData);
      }

      // Create email body with invoice details
      const emailBody = `
${emailMessage}

INVOICE DETAILS
===============
Invoice #: ${invoiceNumber}
Issue Date: ${new Date(issueDate).toLocaleDateString()}
Due Date: ${new Date(dueDate).toLocaleDateString()}
Total Amount: ${currency} ${sanitizedTotalAmount.toFixed(2)}

ITEMS:
${normalizedLineItems.map(item => `- ${item.description}: ${item.quantity} × ${currency}${item.rate.toFixed(2)} = ${currency}${item.amount.toFixed(2)}`).join('\n')}

Thank you for your business!

--
This email was sent from Ledgerly Invoice System
      `;
      
      // Create download link for the PDF
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(pdfUrl);
      
      // Create mailto link with subject and body
      const subject = encodeURIComponent(emailSubject);
      const body = encodeURIComponent(emailBody);
      const mailtoLink = `mailto:${customer.email}?subject=${subject}&body=${body}`;
      
      // Open email client
      window.open(mailtoLink, '_blank');
      
      addToast(`Invoice sent to ${customer.email} successfully!`, 'success');
      
      // Reset form after successful send
      setTimeout(() => {
        resetForm();
        navigate('/invoices');
      }, 2000);
      
    } catch (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || 'Unable to send invoice';
      addToast('Error sending invoice: ' + errorMessage, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const customer = getSelectedCustomer() || newCustomer;
    const printColors = resolveTemplateColors(selectedTemplate);
    
    const printContent = `
      <html>
        <head>
          <title>Print Invoice ${invoiceNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              background: white;
            }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="max-width: 800px; margin: 0 auto; padding: 30px; border: 1px solid #ddd; background: white;">
            <div style="border-bottom: 3px solid ${printColors.primary}; padding-bottom: 30px; margin-bottom: 30px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h1 style="font-size: 32px; font-weight: bold; color: ${printColors.primary}; margin: 0 0 10px 0;">INVOICE</h1>
                  <div style="color: #6c757d; font-size: 14px; margin-top: 15px;">
                    <div><strong>Invoice #:</strong> ${invoiceNumber}</div>
                    <div><strong>Issue Date:</strong> ${new Date(issueDate).toLocaleDateString()}</div>
                    <div><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</div>
                    <div><strong>Payment Terms:</strong> ${paymentTerms}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 18px; font-weight: bold; color: ${printColors.primary}; margin-bottom: 10px;">LEDGERLY</div>
                  <div style="color: #6c757d; font-size: 14px;">
                    123 Business Street<br>
                    City, State 12345<br>
                    contact@ledgerly.com
                  </div>
                </div>
              </div>
            </div>
            
            ${customer ? `
              <div style="background: ${printColors.accent}; padding: 25px; margin: 20px 0 30px 0; border-radius: 8px; border-left: 4px solid ${printColors.primary};">
                <div style="font-weight: bold; margin-bottom: 15px; color: ${printColors.primary}; font-size: 16px;">Bill To:</div>
                <div style="color: #495057;">
                  <div style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">${customer.name}</div>
                  ${customer.address ? `<div style="margin-bottom: 5px;">${customer.address}</div>` : ''}
                  <div style="margin-bottom: 5px;">${customer.email}</div>
                  ${customer.phone ? `<div>${customer.phone}</div>` : ''}
                </div>
              </div>
            ` : ''}
            
            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0 30px 0;">
              <thead>
                <tr style="background: ${printColors.primary}; color: white;">
                  <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Description</th>
                  <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Qty</th>
                  <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Rate</th>
                  <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Tax</th>
                  <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 14px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${lineItems.map((item, index) => `
                <tr style="${index % 2 === 0 ? `background: ${printColors.accent};` : ''} border-bottom: 1px solid #e9ecef;">
                    <td style="padding: 15px; font-size: 14px; color: #495057;">
                      ${item.description || 'Item'}
                      ${item.sku ? `<div style="font-size: 12px; color: #6c757d;">SKU: ${item.sku}</div>` : ''}
                    </td>
                    <td style="padding: 15px; font-size: 14px; color: #495057;">${item.quantity}</td>
                    <td style="padding: 15px; font-size: 14px; color: #495057;">${currency} ${item.rate.toFixed(2)}</td>
                    <td style="padding: 15px; font-size: 14px; color: #495057;">${item.tax}%</td>
                    <td style="padding: 15px; font-size: 14px; font-weight: bold; color: #495057;">${currency} ${item.amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <!-- Totals -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid ${printColors.primary}; text-align: right;">
              <div style="margin-bottom: 20px;">
                <span style="color: #6c757d; font-size: 14px;">Subtotal:</span>
                <span style="font-weight: bold; color: #495057; margin-left: 20px; font-size: 16px;">${currency} ${subtotal.toFixed(2)}</span>
              </div>
              <div style="margin-bottom: 20px;">
                <span style="color: #6c757d; font-size: 14px;">Tax:</span>
                <span style="font-weight: bold; color: #495057; margin-left: 20px; font-size: 16px;">${currency} ${totalTax.toFixed(2)}</span>
              </div>
              <div>
              <span style="color: ${printColors.primary}; font-weight: bold; font-size: 20px;">Total:</span>
              <span style="color: ${printColors.primary}; font-weight: bold; margin-left: 20px; font-size: 24px;">${currency} ${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <!-- Notes & Terms -->
            ${notes ? `
              <div style="margin-top: 30px; padding: 20px; background: ${printColors.accent}; border-radius: 8px;">
                <div style="color: ${printColors.primary}; font-weight: bold; margin-bottom: 15px; font-size: 14px;">Notes</div>
                <div style="color: #495057; line-height: 1.6; font-size: 14px; white-space:pre-line;">${notes}</div>
              </div>
            ` : ''}
            
            ${terms ? `
              <div style="margin-top: 20px; padding: 20px; background: ${printColors.accent}; border-radius: 8px;">
                <div style="color: ${printColors.primary}; font-weight: bold; margin-bottom: 15px; font-size: 14px;">Terms & Conditions</div>
                <div style="color: #495057; line-height: 1.6; font-size: 13px; white-space: pre-line;">${terms}</div>
              </div>
            ` : ''}
            
            <div class="no-print" style="margin-top: 50px; text-align: center; padding-top: 20px; border-top: 1px solid #ddd;">
              <button onclick="window.print()" style="padding: 12px 24px; background: ${printColors.primary}; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
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
    
    // Trigger print after content loads
    printWindow.onload = function() {
      printWindow.print();
    };
    
    addToast('Print preview opened', 'info');
  };

  const resetForm = () => {
    setInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setSelectedCustomer('');
    setLineItems([
      { id: 1, description: '', quantity: 1, rate: 0.00, tax: 0, amount: 0.00 }
    ]);
    setAttachments([]);
    setSelectedTemplate('standard');
    setNotes('Payment due within 30 days. Late payments subject to 1.5% monthly interest.');
    setTerms('All services are subject to our terms and conditions. For any questions, please contact our billing department.');
    setIsRecurring(false);
    setNewCustomer({ name: '', email: '', phone: '', address: '' });
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
              isAddingCustomer={isAddingCustomer}
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
                            backgroundColor: template.colors?.primary ? 
                              `rgb(${template.colors.primary.join(',')})` : '#2980b9',
                            background: template.colors?.primary && template.colors?.secondary ? 
                              `linear-gradient(135deg, 
                               rgb(${template.colors.primary.join(',')}) 0%, 
                               rgb(${template.colors.secondary.join(',')}) 100%)` : 
                              'linear-gradient(135deg, #2980b9 0%, #2c3e50 100%)'
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
            
            {/* Products from Inventory */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Products from Inventory
                </h2>
                <button
                  onClick={() => setShowProductSelector(true)}
                  className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Add from Inventory
                </button>
              </div>
              
              {availableProducts.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No products available in inventory
                  </p>
                  <button
                    onClick={() => navigate('/inventory/products/new')}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableProducts.slice(0, 4).map(product => (
                    <div
                      key={product.id}
                      className={`border rounded-lg p-4 cursor-pointer hover:border-primary-500 transition-colors ${
                        product.stock === 0 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => product.stock > 0 && addProductFromInventory(product)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{product.sku}</p>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.stock === 0 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : product.stock <= 10
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        }`}>
                          {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                        </span>
                        {product.stock > 0 && (
                          <button className="text-primary-600 hover:text-primary-700">
                            Add to Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {availableProducts.length > 4 && (
                    <div
                      className="border border-dashed rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-primary-500"
                      onClick={() => setShowProductSelector(true)}
                    >
                      <div className="text-center">
                        <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          View all {availableProducts.length} products
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
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
              onPrint={handlePrint}
            />
          </div>
        </div>
      </div>
      
      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Products from Inventory
                </h3>
                <button
                  onClick={() => {
                    setShowProductSelector(false);
                    setProductSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>
              
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  placeholder="Search products by name, SKU, or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No products found matching "{productSearchTerm}"
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        product.stock === 0 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:border-primary-500'
                      }`}
                      onClick={() => product.stock > 0 && addProductFromInventory(product)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{product.sku}</p>
                          {product.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.stock === 0 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : product.stock <= 10
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        }`}>
                          {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                        </span>
                        {product.stock > 0 && (
                          <button className="text-primary-600 hover:text-primary-700">
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredProducts.length} products found
                </span>
                <button
                  onClick={() => {
                    setShowProductSelector(false);
                    setProductSearchTerm('');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modals */}
      {showPreview && (
        <InvoicePreviewModal
          invoiceData={{
            invoiceNumber,
            issueDate,
            dueDate,
            paymentTerms,
            customer: getSelectedCustomer() || newCustomer,
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
