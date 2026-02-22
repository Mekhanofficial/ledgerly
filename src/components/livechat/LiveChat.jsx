// src/components/live-chat/LiveChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, X, Send, User, Bot, Paperclip,
  FileText, Receipt, Package, CreditCard, AlertCircle,
  CheckCircle, ChevronDown, ChevronUp, Maximize2, Minimize2,
  BarChart3, TrendingUp, Users, DollarSign, ShoppingCart,
  Truck, Bell, Settings, Download, RefreshCw, Mail, Eye
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useInventory } from '../../context/InventoryContext';
import { usePayments } from '../../context/PaymentContext';
import { useNotifications } from '../../context/NotificationContext';
import { useUser } from '../../context/UserContext';
import { useAccount } from '../../context/AccountContext';
import { generateReportData } from '../../utils/reportGenerator';
import { formatCurrency } from '../../utils/currency';

const LiveChat = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { 
    invoices, 
    customers, 
    getInvoiceStats, 
    markAsPaid,
    getCustomerStats,
    exportInvoicesAsCSV,
    addCustomer
  } = useInvoice();
  const { 
    products: inventoryProducts, 
    getInventoryStats,
    addProduct: addInventoryProduct,
  } = useInventory();
  const { 
    processPayment, 
    getPaymentStats,
    getRecentTransactions,
  } = usePayments();
  const { 
    addNotification, 
    markAllAsRead,
    getRecentNotifications,
    getNotificationStats
  } = useNotifications();
  const { user } = useUser();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || user?.currencyCode || 'USD';
  const formatMoney = (value, currencyCode) => formatCurrency(value, currencyCode || baseCurrency);
  
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: 'Hello! Welcome to Ledgerly AI Assistant. I can help you with invoices, inventory, payments, reports, and more. How can I assist you today?', 
      sender: 'bot', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInvoiceSelector, setShowInvoiceSelector] = useState(false);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768 && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isFullscreen]);

  // Auto-focus input
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // REAL DATA FUNCTIONS
  const getOverdueInvoices = () => {
    return invoices?.filter(inv => inv.status === 'overdue' || (inv.dueDate && new Date(inv.dueDate) < new Date())) || [];
  };

  const getLowStockProducts = () => {
    return inventoryProducts?.filter(p => p.quantity <= (p.reorderLevel || 10) && p.quantity > 0) || [];
  };

  const getOutOfStockProducts = () => {
    return inventoryProducts?.filter(p => p.quantity === 0) || [];
  };

  // Handle sending messages with INSTANT responses
  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setActiveAction(null);

    // Analyze and respond instantly (no setTimeout for delays)
    setIsTyping(true);
    
    // Small delay for realistic typing effect (optional, can be removed)
    setTimeout(() => {
      const botResponse = analyzeMessageAndRespond(inputText);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 100);
  };

  // Enhanced message analysis with real context
  const analyzeMessageAndRespond = (userMessage) => {
    const message = userMessage.toLowerCase();
    const invoiceStats = getInvoiceStats?.() || {};
    const inventoryStats = getInventoryStats?.() || {};
    const paymentStats = getPaymentStats?.() || {};
    const notificationStats = getNotificationStats?.() || {};

    // Greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return createBotResponse(`Hello ${user?.name || 'there'}! I'm your Ledgerly AI Assistant. I can help you manage invoices, inventory, payments, and more. What would you like to do?`, [
        'View dashboard',
        'Check invoices',
        'Manage inventory',
        'Process payments'
      ]);
    }

    // Dashboard/Summary
    if (message.includes('dashboard') || message.includes('summary') || message.includes('overview')) {
      const overdueCount = getOverdueInvoices().length;
      const lowStockCount = getLowStockProducts().length;
      return createBotResponse(
        `Here is your dashboard summary:\n\n` +
        `Invoices: ${invoiceStats.totalInvoices || 0} total, ${overdueCount} overdue\n` +
        `Inventory: ${inventoryStats.totalProducts || 0} products, ${lowStockCount} low stock\n` +
        `Payments: ${paymentStats.todayCount || 0} today, ${formatMoney(paymentStats.processedToday || 0, baseCurrency)} revenue\n` +
        `Notifications: ${notificationStats.unread || 0} unread\n\n` +
        `What would you like to focus on?`,
        ['View invoices', 'Check inventory', 'See payments', 'View notifications']
      );
    }

    // Invoice Management
    if (message.includes('invoice') || message.includes('bill')) {
      if (message.includes('create') || message.includes('new') || message.includes('add')) {
        setActiveAction('create_invoice');
        return createBotResponse(
          'I can help you create a new invoice. Would you like to:\n1. Select a customer\n2. Use a template\n3. Start from scratch\n\nOr you can type the customer name directly.',
          ['Select customer', 'Use template', 'From scratch', 'Cancel']
        );
      }
      if (message.includes('overdue') || message.includes('late')) {
        const overdue = getOverdueInvoices();
        if (overdue.length === 0) {
          return createBotResponse('Great news! You have no overdue invoices.', [
            'View all invoices',
            'Create new invoice',
            'Back to dashboard'
          ]);
        }
        return createBotResponse(
          `You have ${overdue.length} overdue invoices totaling ${formatMoney(overdue.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0), baseCurrency)}. Would you like to:`,
          ['Send reminders', 'View overdue list', 'Set up payment plans']
        );
      }
      if (message.includes('paid') || message.includes('payment')) {
        const pending = invoices?.filter(inv => inv.status === 'sent' || inv.status === 'pending') || [];
        return createBotResponse(
          `You have ${pending.length} unpaid invoices. Would you like to:`,
          ['Process payment', 'View unpaid invoices', 'Send payment links']
        );
      }
      // Default invoice response
      return createBotResponse(
        `You have ${invoiceStats.totalInvoices || 0} invoices. ${getOverdueInvoices().length} are overdue. What would you like to do?`,
        ['Create invoice', 'View overdue', 'Export invoices', 'Invoice reports']
      );
    }

    // Inventory Management
    if (message.includes('inventory') || message.includes('product') || message.includes('stock')) {
      if (message.includes('low') || message.includes('out') || message.includes('stock')) {
        const lowStock = getLowStockProducts();
        const outOfStock = getOutOfStockProducts();
        if (lowStock.length === 0 && outOfStock.length === 0) {
          return createBotResponse('All products are well stocked!', [
            'View inventory',
            'Add product',
            'Stock report'
          ]);
        }
        return createBotResponse(
          `Stock Alert:\n${lowStock.length} products low on stock\n${outOfStock.length} products out of stock\n\nWould you like to:`,
          ['View low stock', 'Restock products', 'Generate restock report']
        );
      }
      if (message.includes('add') || message.includes('new')) {
        setActiveAction('add_product');
        return createBotResponse('Let me help you add a new product. Please provide:\n1. Product name\n2. SKU\n3. Price\n4. Initial quantity\n\nOr type "cancel" to abort.', []);
      }
      // Default inventory response
      return createBotResponse(
        `Inventory Summary:\n${inventoryStats.totalProducts || 0} total products\n` +
        `Total value: ${formatMoney(inventoryStats.totalValue || 0, baseCurrency)}\n` +
        `${getLowStockProducts().length} low stock items\n\nWhat would you like to do?`,
        ['View inventory', 'Add product', 'Stock adjustments', 'Inventory report']
      );
    }

    // Payment Processing
    if (message.includes('payment') || message.includes('paid') || message.includes('revenue')) {
      if (message.includes('process') || message.includes('record')) {
        setActiveAction('process_payment');
        setShowInvoiceSelector(true);
        return createBotResponse('Select an invoice to process payment:', []);
      }
      if (message.includes('method') || message.includes('card')) {
        return createBotResponse('I can help you manage payment methods. Would you like to:', [
          'Add payment method',
          'View payment methods',
          'Set default method'
        ]);
      }
      // Default payment response
      return createBotResponse(
        `Payment Summary:\nToday: ${formatMoney(paymentStats.processedToday || 0, baseCurrency)}\n` +
        `This month: ${formatMoney(paymentStats.totalRevenue || 0, baseCurrency)}\n` +
        `Pending: ${formatMoney(paymentStats.pendingPayments || 0, baseCurrency)}\n\nWhat would you like to do?`,
        ['Process payment', 'View transactions', 'Payment report', 'Add payment method']
      );
    }

    // Customer Management
    if (message.includes('customer') || message.includes('client')) {
      if (message.includes('add') || message.includes('new')) {
        setActiveAction('add_customer');
        return createBotResponse('Let me help you add a new customer. Please provide:\n1. Customer name\n2. Email address\n3. Phone number (optional)\n\nOr type "cancel" to abort.', []);
      }
      // Default customer response
      const customerStats = getCustomerStats?.() || [];
      return createBotResponse(
        `You have ${customers?.length || 0} customers.\n` +
        `${customerStats[0]?.value || 0} active customers\n` +
        `Total outstanding: ${customerStats[2]?.value || formatMoney(0, baseCurrency)}\n\nWhat would you like to do?`,
        ['Add customer', 'View customers', 'Customer reports', 'Send promotions']
      );
    }

    // Report Generation
    if (message.includes('report') || message.includes('analytics') || message.includes('export')) {
      return createBotResponse(
        'I can generate several types of reports:\n\n' +
        '1. **Financial Reports** - Revenue, expenses, profits\n' +
        '2. **Inventory Reports** - Stock levels, valuations\n' +
        '3. **Customer Reports** - Sales, aging, activity\n' +
        '4. **Invoice Reports** - Status, collections, aging\n\n' +
        'Which report would you like?',
        ['Revenue report', 'Inventory report', 'Customer report', 'Invoice report']
      );
    }

    // Notification Management
    if (message.includes('notification') || message.includes('alert') || message.includes('bell')) {
      return createBotResponse(
        `You have ${notificationStats.unread || 0} unread notifications. Would you like to:`,
        ['View notifications', 'Mark all as read', 'Notification settings', 'Clear all']
      );
    }

    // User/Account
    if (message.includes('profile') || message.includes('account') || message.includes('settings')) {
      return createBotResponse(
        `Account Information:\nName: ${user?.name || 'Not set'}\nEmail: ${user?.email || 'Not set'}\nRole: ${user?.role || 'User'}\n\nWhat would you like to update?`,
        ['Update profile', 'Change password', 'Notification settings', 'Account settings']
      );
    }

    // Help
    if (message.includes('help') || message.includes('support') || message.includes('what can you do')) {
      return createBotResponse(
        'I can help you with:\n\n' +
        '- Dashboard and analytics (business overview)\n' +
        '- Invoice management (create, send, track)\n' +
        '- Inventory control (products and stock)\n' +
        '- Payment processing (record payments, track revenue)\n' +
        '- Customer management (add customers, view history)\n' +
        '- Report generation (financial, inventory, customer)\n' +
        '- Notifications (alerts and reminders)\n\n' +
        'Just tell me what you need help with!',
        ['Show dashboard', 'Create invoice', 'Check inventory', 'Process payment']
      );
    }

    // Default response
    return createBotResponse(
      "I can help you manage your business. You can ask me about:\n\n" +
      "- Invoices and billing\n" +
      "- Inventory and products\n" +
      "- Payments and revenue\n" +
      "- Customers and clients\n" +
      "- Reports and analytics\n" +
      "- Notifications and alerts\n\n" +
      "What would you like to do?",
      ['Invoice help', 'Inventory check', 'Payment status', 'Customer info', 'Generate report']
    );
  };

  const createBotResponse = (text, actions = []) => {
    return {
      id: messages.length + 2,
      text,
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      actions
    };
  };

  const actionRoutes = {
    'Show dashboard': '/dashboard',
    'Back to dashboard': '/dashboard',
    'View dashboard': '/dashboard',
    'Dashboard summary': '/dashboard',
    'Check invoices': '/invoices',
    'View invoices': '/invoices',
    'View all invoices': '/invoices',
    'View overdue': '/invoices',
    'View overdue list': '/invoices',
    'View unpaid invoices': '/invoices',
    'Send payment links': '/invoices',
    'Invoice reports': '/reports',
    'View inventory': '/inventory',
    'Manage inventory': '/inventory',
    'Check inventory': '/inventory',
    'Stock report': '/reports',
    'Inventory report': '/reports',
    'Restock products': '/inventory/products',
    'Select products': '/invoices/create',
    'View transactions': '/payments',
    'Payment report': '/reports',
    'Add payment method': '/settings',
    'View notifications': '/notifications',
    'Notification settings': '/settings',
    'Account settings': '/settings',
    'Update profile': '/settings',
    'Change password': '/settings',
    'Customer reports': '/reports',
    'Send promotions': '/customers',
    'View customers': '/customers',
    'Create invoice': '/invoices/create',
    'Use template': '/invoices/templates',
    'From scratch': '/invoices/create',
    'Generate report': '/reports',
    'Revenue report': '/reports',
    'Customer report': '/reports',
    'Invoice report': '/reports',
    'See payments': '/payments',
    'Process payments': '/payments/process',
    'View receipt': '/receipts',
    'View report': '/reports'
  };

  const navigateToAction = (action) => {
    const route = actionRoutes[action];
    if (!route) return false;
    navigate(route);
    return true;
  };

  // REAL ACTION HANDLERS
  const handleQuickAction = async (action) => {
    let response = '';
    let newNotification = null;

    try {
      switch(action) {
        case 'Send reminders': {
          const overdueInvoices = getOverdueInvoices();
          overdueInvoices.forEach(invoice => {
            addNotification({
              type: 'invoice',
              title: 'Payment Reminder Sent',
              description: `Reminder sent for Invoice #${invoice.number || invoice.invoiceNumber}`,
              details: `Amount: ${formatMoney(invoice.totalAmount || invoice.amount || 0, invoice.currency || baseCurrency)}`,
              time: 'Just now',
              action: 'View Invoice',
              color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
              link: `/invoices/edit/${invoice.id}`,
              icon: 'AlertCircle'
            });
          });
          response = `Sent payment reminders for ${overdueInvoices.length} overdue invoices.`;
          break;
        }
        case 'Send reminder': {
          if (selectedInvoice) {
            addNotification({
              type: 'invoice',
              title: 'Payment Reminder Sent',
              description: `Reminder sent for Invoice #${selectedInvoice.number || selectedInvoice.invoiceNumber}`,
              details: `Amount: ${formatMoney(selectedInvoice.totalAmount || selectedInvoice.amount || 0, selectedInvoice.currency || baseCurrency)}`,
              time: 'Just now',
              action: 'View Invoice',
              color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
              link: `/invoices/edit/${selectedInvoice.id}`,
              icon: 'AlertCircle'
            });
            response = `Reminder sent for Invoice #${selectedInvoice.number || selectedInvoice.invoiceNumber}.`;
          } else {
            response = 'Select an invoice first to send a reminder.';
            setShowInvoiceSelector(true);
          }
          break;
        }
        case 'Mark as paid':
          setActiveAction('mark_as_paid');
          setShowInvoiceSelector(true);
          response = 'Please select an invoice to mark as paid:';
          break;

        case 'Process payment':
          setActiveAction('process_payment');
          setShowInvoiceSelector(true);
          response = 'Select an invoice to process payment:';
          break;
        case 'Next invoice':
          setActiveAction('process_payment');
          setShowInvoiceSelector(true);
          response = 'Select another invoice to process payment:';
          break;

        case 'Add customer':
          setActiveAction('add_customer');
          response = 'Please provide customer details:\n\nName:\nEmail:\nPhone (optional):\n\nOr type "cancel" to abort.';
          break;

        case 'Add product':
          setActiveAction('add_product');
          response = 'Please provide product details:\n\nName:\nSKU:\nPrice:\nInitial Quantity:\nCategory (optional):\n\nOr type "cancel" to abort.';
          break;
        case 'Select customer':
          setActiveAction('create_invoice');
          setShowCustomerSelector(true);
          response = 'Select a customer:';
          break;

        case 'View low stock': {
          const lowStock = getLowStockProducts();
          if (lowStock.length === 0) {
            response = 'No low stock items found.';
          } else {
            response = `Low Stock Items (${lowStock.length}):\n\n` +
              lowStock.map((p, i) => `${i + 1}. ${p.name} - ${p.quantity} left (Reorder: ${p.reorderLevel || 10})`).join('\n');
          }
          break;
        }
        case 'Generate restock report': {
          const lowStockProducts = getLowStockProducts();
          generateReportData(invoices || [], customers || [], {
            title: 'Restock Report',
            type: 'inventory',
            format: 'json',
            filters: { lowStock: true }
          });
          response = `Generated restock report for ${lowStockProducts.length} items.`;
          newNotification = {
            type: 'report',
            title: 'Restock Report Generated',
            description: 'Low stock items report is ready',
            time: 'Just now',
            action: 'View Report',
            color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            link: '/reports',
            icon: 'BarChart3'
          };
          break;
        }
        case 'Revenue report': {
          const paymentData = getPaymentStats?.() || {};
          generateReportData(invoices || [], customers || [], {
            title: 'Revenue Report',
            type: 'revenue',
            format: 'json'
          });
          response = `Generated revenue report. Total: ${formatMoney(paymentData.totalRevenue || 0, baseCurrency)}`;
          newNotification = {
            type: 'report',
            title: 'Revenue Report Generated',
            description: 'Revenue analysis report is ready',
            time: 'Just now',
            action: 'View Report',
            color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
            link: '/reports',
            icon: 'TrendingUp'
          };
          break;
        }
        case 'Mark all as read':
          markAllAsRead?.();
          response = 'All notifications marked as read.';
          break;
        case 'Clear all':
          markAllAsRead?.();
          response = 'All notifications cleared.';
          break;

        case 'Export invoices':
          exportInvoicesAsCSV?.();
          response = 'Invoice export started. Check your downloads.';
          break;

        case 'View dashboard': {
          navigate('/dashboard');
          const stats = getInvoiceStats?.() || {};
          const inventoryStatsData = getInventoryStats?.() || {};
          response = `Dashboard Overview:\n\n` +
            `**Invoices:** ${stats.totalInvoices || 0} total, ${getOverdueInvoices().length} overdue\n` +
            `**Inventory:** ${inventoryStatsData.totalProducts || 0} products, ${getLowStockProducts().length} low stock\n` +
            `**Revenue:** ${formatMoney(getPaymentStats?.()?.processedToday || 0, baseCurrency)} today\n` +
            `**Customers:** ${customers?.length || 0} active`;
          break;
        }
        case 'View details':
        case 'Download PDF': {
          if (selectedInvoice) {
            navigate(`/invoices/edit/${selectedInvoice.id}`);
            response = action === 'Download PDF'
              ? 'Opening invoice so you can download the PDF.'
              : 'Opening invoice details.';
          } else {
            response = 'Select an invoice first.';
            setShowInvoiceSelector(true);
          }
          break;
        }
        case 'Set up payment plans':
          navigate('/payments');
          response = 'Opening payments for plan setup.';
          break;
        case 'View receipt':
          navigate('/receipts');
          response = 'Opening receipts.';
          break;
        case 'View report':
          navigate('/reports');
          response = 'Opening reports.';
          break;
        case 'View history':
        case 'View profile':
        case 'Update details':
        case 'Send email': {
          if (selectedCustomer) {
            navigate(`/customers/${selectedCustomer.id}`);
            response = 'Opening customer profile.';
          } else {
            response = 'Select a customer first.';
            setShowCustomerSelector(true);
          }
          break;
        }
        case 'Cancel':
          setActiveAction(null);
          response = 'Action cancelled.';
          break;
        default:
          if (navigateToAction(action)) {
            const label = action.replace(/^(View|Show|Check|Manage)\s+/i, '');
            response = `Opening ${label.toLowerCase()}...`;
          } else {
            response = `I've noted your request for: ${action}. How would you like to proceed?`;
          }
      }

      // Add user action message
      const userActionMessage = {
        id: messages.length + 1,
        text: action,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'action'
      };

      // Add bot response
      const botResponse = createBotResponse(response);

      setMessages(prev => [...prev, userActionMessage, botResponse]);

      // Add notification if generated
      if (newNotification) {
        addNotification(newNotification);
      }

    } catch (error) {
      console.error('Action error:', error);
      const errorMessage = createBotResponse(`Error: ${error.message}`);
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handle invoice selection for various actions
  const handleInvoiceSelect = (invoice) => {
    setShowInvoiceSelector(false);
    setSelectedInvoice(invoice);

    const userMessage = {
      id: messages.length + 1,
      text: `Selected: ${invoice.invoiceNumber || invoice.number}`,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);

    switch(activeAction) {
      case 'mark_as_paid': {
        // Mark invoice as paid
        markAsPaid?.(invoice.id);
        addNotification({
          type: 'invoice',
          title: 'Invoice Marked as Paid',
          description: `Invoice #${invoice.invoiceNumber || invoice.number} has been marked as paid`,
          time: 'Just now',
          action: 'View Invoice',
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
          link: `/invoices/edit/${invoice.id}`,
          icon: 'CheckCircle'
        });
        setMessages(prev => [...prev, createBotResponse(`Invoice #${invoice.invoiceNumber || invoice.number} marked as paid.`)]);
        break;
      }
      case 'process_payment': {
        // Process payment for invoice
        processPayment?.({
          invoiceId: invoice.id,
          amount: invoice.totalAmount || invoice.amount,
          paymentMethodId: 'method_1', // Default payment method
          customerId: invoice.customerId,
          generateReceipt: true
        }).then(result => {
          setMessages(prev => [...prev, createBotResponse(
            `Payment of ${formatMoney(invoice.totalAmount || invoice.amount || 0, invoice.currency || baseCurrency)} processed successfully.\nReceipt: ${result.receipt?.id || 'Generated'}`,
            ['View receipt', 'Next invoice']
          )]);
        }).catch(error => {
          setMessages(prev => [...prev, createBotResponse(`Payment failed: ${error.message}`)]);
        });
        break;
      }
      default: {
        // Show invoice details
        setMessages(prev => [...prev, createBotResponse(
          `Invoice Details:\n\n` +
          `Number: ${invoice.invoiceNumber || invoice.number}\n` +
          `Customer: ${invoice.customer || 'Unknown'}\n` +
          `Amount: ${formatMoney(invoice.totalAmount || invoice.amount || 0, invoice.currency || baseCurrency)}\n` +
          `Status: ${invoice.status}\n` +
          `Due Date: ${invoice.dueDate || 'Not set'}\n\n` +
          `What would you like to do?`,
          ['Mark as paid', 'Send reminder', 'Download PDF', 'View details']
        )]);
      }
    }

    setActiveAction(null);
  };

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setShowCustomerSelector(false);
    setSelectedCustomer(customer);
    
    const userMessage = {
      id: messages.length + 1,
      text: `Selected: ${customer.name}`,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);

    if (activeAction === 'create_invoice') {
      setMessages(prev => [...prev, createBotResponse(
        `Great! Creating invoice for ${customer.name}.\n\nPlease provide:\n1. Products/Services\n2. Amount\n3. Due date (optional)\n\nOr type "cancel" to abort.`,
        ['Select products', 'Use template', 'Cancel']
      )]);
    } else {
      setMessages(prev => [...prev, createBotResponse(
        `Customer Details:\n\n` +
        `Name: ${customer.name}\n` +
        `Email: ${customer.email || 'Not provided'}\n` +
        `Phone: ${customer.phone || 'Not provided'}\n` +
        `Total Spent: ${formatMoney(customer.totalSpent || 0, baseCurrency)}\n` +
        `Outstanding: ${formatMoney(customer.outstanding || 0, baseCurrency)}\n\n` +
        `What would you like to do?`,
        ['Create invoice', 'View history', 'Send email', 'Update details']
      )]);
    }

    setActiveAction(null);
  };

  // Handle special input parsing for actions
  const handleSpecialInput = (text) => {
    if (activeAction === 'add_customer') {
      if (text.toLowerCase() === 'cancel') {
        setActiveAction(null);
        return createBotResponse('Customer addition cancelled.');
      }
      
      // Parse customer data (simple example)
      const lines = text.split('\n');
      const customerData = {
        name: lines[0]?.replace('Name:', '').trim() || lines[0]?.trim(),
        email: lines[1]?.replace('Email:', '').trim() || lines[1]?.trim(),
        phone: lines[2]?.replace('Phone:', '').trim() || lines[2]?.trim()
      };

      addCustomer?.(customerData).catch(() => {});
      addNotification({
        type: 'customer',
        title: 'New Customer Added',
        description: `${customerData.name} has been added`,
        details: customerData.email,
        time: 'Just now',
        action: 'View Profile',
        color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        link: '/customers',
        icon: 'UserPlus'
      });

      setActiveAction(null);
      return createBotResponse(`Customer "${customerData.name}" added successfully.`);
    }

    if (activeAction === 'add_product') {
      if (text.toLowerCase() === 'cancel') {
        setActiveAction(null);
        return createBotResponse('Product addition cancelled.');
      }

      // Parse product data
      const lines = text.split('\n');
      const productData = {
        name: lines[0]?.replace('Name:', '').trim() || lines[0]?.trim(),
        sku: lines[1]?.replace('SKU:', '').trim() || lines[1]?.trim(),
        price: parseFloat(lines[2]?.replace('Price:', '').trim() || lines[2]?.trim() || '0'),
        quantity: parseInt(lines[3]?.replace('Quantity:', '').trim() || lines[3]?.trim() || '0'),
        categoryId: lines[4]?.replace('Category:', '').trim() || lines[4]?.trim()
      };

      // Call addInventoryProduct from InventoryContext
      addInventoryProduct?.(productData).catch(() => {});
      
      setActiveAction(null);
      return createBotResponse(`Product "${productData.name}" added to inventory.`);
    }

    return null;
  };

  // Enhanced send message with special input handling
  const handleSendMessageEnhanced = () => {
    if (inputText.trim() === '') return;

    // Check for special input handling
    const specialResponse = handleSpecialInput(inputText);
    if (specialResponse) {
      const userMessage = {
        id: messages.length + 1,
        text: inputText,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      };
      setMessages(prev => [...prev, userMessage, specialResponse]);
      setInputText('');
      return;
    }

    handleSendMessage();
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessageEnhanced();
    }
  };

  // Quick replies for common tasks
  const quickReplies = [
    'Dashboard summary',
    'Overdue invoices',
    'Low stock alert',
    'Process payment',
    'Add customer',
    'Generate report',
    'View notifications',
    'Help'
  ];

  const handleQuickReply = (text) => {
    const userMessage = {
      id: messages.length + 1,
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    setTimeout(() => {
      const botResponse = analyzeMessageAndRespond(text);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 100);
  };

  // Toggle functions
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setIsMinimized(false);
      setIsFullscreen(false);
      setShowInvoiceSelector(false);
      setShowCustomerSelector(false);
      setActiveAction(null);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setShowInvoiceSelector(false);
      setShowCustomerSelector(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setIsMinimized(false);
    }
  };

  // Get chat dimensions
  const getChatDimensions = () => {
    if (isFullscreen) return 'fixed inset-0 w-screen h-screen z-[100] rounded-none';
    if (isMinimized) return `fixed ${isMobile ? 'bottom-4 right-4 w-[calc(100vw-2rem)] max-w-sm' : 'bottom-6 right-6 w-80'} h-16 z-50`;
    if (isMobile) return 'fixed inset-0 z-50 bg-white dark:bg-gray-800';
    return 'fixed bottom-6 right-6 z-50 w-[calc(100vw-2rem)] max-w-md h-[85vh] max-h-[700px]';
  };

  // Render message
  const renderMessage = (message) => {
    switch(message.type) {
      case 'file':
        return (
          <div className={`flex items-center p-2 rounded-lg ${isDarkMode ? 'bg-primary-900/30' : 'bg-primary-50'}`}>
            <FileText className="w-5 h-5 mr-2" />
            <span className="text-sm truncate">{message.text}</span>
          </div>
        );
      case 'action':
        return (
          <div className={`inline-flex items-center px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} text-sm`}>
            <span className="mr-2">Action</span>
            {message.text}
          </div>
        );
      default:
        return <div className="whitespace-pre-wrap break-words">{message.text}</div>;
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className={`fixed z-50 bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-105
            ${isMobile 
              ? 'bottom-4 right-4 w-12 h-12 rounded-full text-sm' 
              : 'bottom-6 right-6 w-14 h-14 rounded-full'
            }`}
          aria-label="Open AI Assistant"
        >
          <MessageSquare className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
          {(getOverdueInvoices().length > 0 || getLowStockProducts().length > 0) && (
            <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full border-2 border-white flex items-center justify-center
              ${isMobile ? 'w-4 h-4 text-[10px]' : 'w-5 h-5 text-xs'}`}
              style={{ backgroundColor: '#ef4444' }}
            >
              {getOverdueInvoices().length + getLowStockProducts().length}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={chatContainerRef}
          className={`${getChatDimensions()} ${
            isFullscreen 
              ? 'rounded-none' 
              : isMobile && !isMinimized 
                ? 'rounded-none' 
                : 'rounded-xl'
          } transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 text-gray-100' 
              : 'bg-white text-gray-900'
          } shadow-2xl flex flex-col`}
        >
          {/* Header */}
          <div className={`flex-shrink-0 ${
            isFullscreen || (isMobile && !isMinimized)
              ? 'rounded-t-none' 
              : 'rounded-t-xl'
          } p-4 ${isDarkMode 
            ? 'bg-gradient-to-r from-primary-800 to-primary-900 text-white' 
            : 'bg-gradient-to-r from-primary-600 to-primary-800 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <div className={`rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-white/20' : 'bg-white/20'
                  } w-8 h-8`}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-primary-800 bg-emerald-400"></span>
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold">Ledgerly AI Assistant</h3>
                  <p className="text-xs opacity-90">
                    {getOverdueInvoices().length > 0 
                      ? `${getOverdueInvoices().length} overdue - ` 
                      : ''}
                    {getLowStockProducts().length > 0
                      ? `${getLowStockProducts().length} low stock - `
                      : ''}
                    AI Online
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!isMobile && !isMinimized && (
                  <button
                    onClick={toggleFullscreen}
                    className={`p-1.5 rounded ${
                      isDarkMode ? 'hover:bg-white/20' : 'hover:bg-white/20'
                    }`}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={toggleMinimize}
                  className={`p-1.5 rounded ${
                      isDarkMode ? 'hover:bg-white/20' : 'hover:bg-white/20'
                    }`}
                  aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
                >
                  {isMinimized ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={toggleChat}
                  className={`p-1.5 rounded ${
                    isDarkMode ? 'hover:bg-white/20' : 'hover:bg-white/20'
                  }`}
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Body */}
          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className={`flex-1 overflow-y-auto p-4 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      <div className={`flex max-w-[90%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-shrink-0 rounded-full flex items-center justify-center ${
                          message.sender === 'user' 
                            ? isDarkMode 
                              ? 'bg-primary-900/50 text-primary-300 ml-3' 
                              : 'bg-primary-100 text-primary-600 ml-3'
                            : isDarkMode
                              ? 'bg-gray-700 text-gray-300 mr-3'
                              : 'bg-gray-200 text-gray-600 mr-3'
                        } w-8 h-8`}>
                          {message.sender === 'user' ? 
                            <User className="w-4 h-4" /> : 
                            <Bot className="w-4 h-4" />
                          }
                        </div>
                        <div className="flex-1 min-w-0 max-w-full">
                          <div className={`rounded-xl px-4 py-2 ${
                            message.sender === 'user' 
                              ? isDarkMode
                                ? 'bg-primary-700 text-white rounded-tr-none'
                                : 'bg-primary-600 text-white rounded-tr-none'
                              : isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-100 rounded-tl-none'
                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                          } ${isMobile ? 'text-sm' : ''}`}>
                            {renderMessage(message)}
                          </div>
                          <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-right' : ''} ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {message.time}
                          </div>
                          
                          {/* Action Buttons */}
                          {message.sender === 'bot' && message.actions && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {message.actions.map((action, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleQuickAction(action)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    isDarkMode
                                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                                      : 'bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200'
                                  }`}
                                >
                                  {action}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Invoice Selector */}
                  {showInvoiceSelector && invoices && invoices.length > 0 && (
                    <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
                      <div className="font-medium mb-2">
                        {activeAction === 'process_payment' ? 'Select invoice to pay:' : 'Select an invoice:'}
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {invoices.slice(0, 10).map((invoice) => (
                          <button
                            key={invoice.id}
                            onClick={() => handleInvoiceSelect(invoice)}
                            className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${
                              isDarkMode 
                                ? 'hover:bg-gray-600' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">
                                {invoice.invoiceNumber || invoice.number || `Invoice #${invoice.id.slice(-6)}`}
                              </div>
                              <div className="text-sm opacity-70 truncate">
                                {invoice.customer || 'Unknown Customer'}
                              </div>
                            </div>
                            <div className="text-right pl-2 flex-shrink-0">
                              <div className="font-medium whitespace-nowrap">
                                {formatMoney(invoice.totalAmount || invoice.amount || 0, invoice.currency || baseCurrency)}
                              </div>
                              <div className={`px-2 py-1 rounded text-xs mt-1 ${
                                invoice.status === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : invoice.status === 'overdue'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {invoice.status || 'pending'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer Selector */}
                  {showCustomerSelector && customers && customers.length > 0 && (
                    <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
                      <div className="font-medium mb-2">Select a customer:</div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {customers.slice(0, 10).map((customer) => (
                          <button
                            key={customer.id}
                            onClick={() => handleCustomerSelect(customer)}
                            className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${
                              isDarkMode 
                                ? 'hover:bg-gray-600' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">
                                {customer.name}
                              </div>
                              <div className="text-sm opacity-70 truncate">
                                {customer.email || 'No email'}
                              </div>
                            </div>
                            <div className="text-right pl-2 flex-shrink-0">
                              <div className="text-sm">
                                {formatMoney(customer.totalSpent || 0, baseCurrency)}
                              </div>
                              <div className="text-xs opacity-70 mt-1">
                                {customer.transactions || 0} trans
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start mb-4">
                      <div className="flex">
                        <div className={`rounded-full flex items-center justify-center mr-3 ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                        } w-8 h-8`}>
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className={`rounded-xl rounded-tl-none px-4 py-3 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-white border border-gray-200'
                        }`}>
                          <div className="flex space-x-1">
                            <div className={`w-2 h-2 rounded-full animate-bounce ${
                              isDarkMode ? 'bg-gray-400' : 'bg-gray-400'
                            }`}></div>
                            <div className={`w-2 h-2 rounded-full animate-bounce ${
                              isDarkMode ? 'bg-gray-400' : 'bg-gray-400'
                            }`} style={{ animationDelay: '0.2s' }}></div>
                            <div className={`w-2 h-2 rounded-full animate-bounce ${
                              isDarkMode ? 'bg-gray-400' : 'bg-gray-400'
                            }`} style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                <div className={`flex-shrink-0 px-4 py-3 border-t ${
                  isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}>
                  <div className={`mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  } text-xs`}>
                    Quick actions:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickReply(reply)}
                        className={`px-3 py-1.5 rounded-full transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-primary-50 hover:bg-primary-100 text-primary-700'
                        } text-xs font-medium`}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <div className={`flex-shrink-0 border-t p-4 ${
                  isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex flex-col space-y-3">
                    <div className={`border rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700' 
                        : 'border-gray-300 bg-white'
                    }`}>
                      <textarea
                        ref={inputRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about invoices, inventory, payments, reports..."
                        className={`w-full px-3 py-3 border-0 focus:ring-0 resize-none ${
                          isMobile ? 'text-sm' : ''
                        } ${isDarkMode 
                          ? 'bg-gray-700 text-gray-100 placeholder-gray-400' 
                          : 'bg-white text-gray-900 placeholder-gray-500'
                        }`}
                        rows="2"
                        style={{ minHeight: '60px', maxHeight: '120px' }}
                      />
                      <div className={`flex items-center justify-between px-3 py-2 border-t ${
                        isDarkMode ? 'border-gray-600' : 'border-gray-100'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowInvoiceSelector(!showInvoiceSelector)}
                            className={`p-1.5 hover:text-gray-700 ${
                              isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                            }`}
                            aria-label="Select invoice"
                            title="Select invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowCustomerSelector(!showCustomerSelector)}
                            className={`p-1.5 hover:text-gray-700 ${
                              isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                            }`}
                            aria-label="Select customer"
                            title="Select customer"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          {(getOverdueInvoices().length > 0 || getLowStockProducts().length > 0) && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'
                            }`}>
                              {getOverdueInvoices().length}O/{getLowStockProducts().length}L
                            </span>
                          )}
                        </div>
                        <button
                          onClick={handleSendMessageEnhanced}
                          disabled={!inputText.trim()}
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            inputText.trim() 
                              ? 'bg-primary-600 text-white hover:bg-primary-700' 
                              : isDarkMode
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Send className="w-4 h-4" />
                          <span className="ml-2 text-sm">Send</span>
                        </button>
                      </div>
                    </div>
                    <div className={`text-center ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    } text-xs`}>
                      Tip: Try "dashboard", "overdue invoices", or "low stock"
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default LiveChat;
