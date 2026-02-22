// src/routes/reports/Reports.js - CLEANED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Download, Calendar, Plus, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import ReportStats from '../../components/reports/ReportStats';
import ReportCards from '../../components/reports/ReportCards';
import ReportCharts from '../../components/reports/ReportCharts';
import CreateReportModal from '../../components/reports/CreateReportModal';
import ReportProgressModal from '../../components/reports/ReportProgressModal';
import GeneratedReportsList from '../../components/reports/GeneratedReportsList';
import ReportHeader from '../../components/reports/ReportHeader';
import ReportTypeFilter from '../../components/reports/ReportTypeFilter';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useInventory } from '../../context/InventoryContext';
import { useAccount } from '../../context/AccountContext';
import { isAccessDeniedError } from '../../utils/accessControl';
import { formatCurrency as formatMoney } from '../../utils/currency';
import {
  fetchReports as fetchStoredReports,
  createReport as createStoredReport,
  updateReport as updateStoredReport,
  deleteReport as deleteStoredReport,
  recordDownload as recordReportDownload
} from '../../services/reportService';

const Reports = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const { addReportNotification } = useNotifications();
  const { invoices, customers } = useInvoice();
  const { products, categories, stockAdjustments } = useInventory();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  const formatReportCurrency = (value, currencyCode = baseCurrency, options = {}) =>
    formatMoney(value, currencyCode, options);
  
  const [dateRange, setDateRange] = useState('last-30-days');
  const [reportType, setReportType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [jsPDF, setJsPDF] = useState(null);

  const loadReports = useCallback(async () => {
    try {
      const storedReports = await fetchStoredReports();
      setReports(storedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      if (isAccessDeniedError(error)) {
        return;
      }
      addToast('Unable to load generated reports', 'error');
    }
  }, [addToast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Dynamically import jsPDF
  useEffect(() => {
    import('jspdf').then(jsPDF => {
      setJsPDF(jsPDF);
    });
  }, []);

  const normalizeReportType = (value) => {
    if (!value) return '';
    const normalized = String(value).toLowerCase();
    if (normalized === 'quick-summary') return 'summary';
    if (normalized === 'monthly-performance') return 'performance';
    return normalized;
  };

  const filteredReports = reportType === 'all'
    ? reports
    : reports.filter((report) => normalizeReportType(report.type) === reportType);

  const handleCreateReport = () => {
    setShowCreateModal(true);
  };

  const handleSaveReport = async (reportData) => {
    try {
      const payload = buildReportPayload(reportData);
      const storedReport = await createStoredReport(payload);

      setReports(prev => [storedReport, ...prev]);
      setShowCreateModal(false);
      setGeneratingReport(storedReport);
      setShowProgressModal(true);
      simulateReportGeneration(storedReport);

      addToast('Report creation started!', 'success');
    } catch (error) {
      console.error('Error creating report:', error);
      if (isAccessDeniedError(error)) {
        return;
      }
      addToast('Error creating report: ' + (error.message || 'Unable to save report'), 'error');
    }
  };

  const simulateReportGeneration = (report) => {
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 10;
      
      // Update progress
      setReports(prevReports => {
        return prevReports.map(r => 
          r.id === report.id ? { 
            ...r, 
            progress: Math.min(progress, 100), 
            status: progress === 100 ? 'completed' : 'processing',
            updatedAt: new Date().toISOString()
          } : r
        );
      });

      if (progress >= 100) {
        clearInterval(interval);
        
      // Final update to completed status
      const completionTime = new Date().toISOString();
      setReports(prevReports => {
        const finalUpdatedReports = prevReports.map(r => 
          r.id === report.id ? { 
            ...r, 
            status: 'completed',
            progress: 100,
            updatedAt: completionTime,
            completedAt: completionTime
          } : r
        );
        
        return finalUpdatedReports;
      });

        // Add notification when report is complete
        addReportNotification(report, 'completed');
        addToast(`Report "${report.title}" generated successfully!`, 'success');
        
        setTimeout(() => {
          setShowProgressModal(false);
          setGeneratingReport(null);
        }, 1000);

      updateStoredReport(report.id, {
        status: 'completed',
        progress: 100,
        completedAt: completionTime
      }).catch((err) => {
        console.error('Failed to update report status:', err);
      });
      }
    }, 300);
  };

  const handleGenerateReport = async (reportId) => {
    try {
      const reportTemplate = {
        sales: { title: 'Sales Report', type: 'sales', format: 'pdf', description: 'Daily, weekly, and monthly sales performance' },
        revenue: { title: 'Revenue Report', type: 'revenue', format: 'pdf', description: 'Revenue breakdown by product and category' },
        inventory: { title: 'Inventory Report', type: 'inventory', format: 'pdf', description: 'Stock levels, turnover, and restocking needs' },
        customer: { title: 'Customer Report', type: 'customer', format: 'pdf', description: 'Customer acquisition, retention, and behavior' },
        profit: { title: 'Profit & Loss Report', type: 'profit', format: 'pdf', description: 'Income statement and profitability analysis' },
        expenses: { title: 'Expenses Report', type: 'expenses', format: 'pdf', description: 'Operating costs and expense breakdown' },
        'quick-summary': { title: 'Quick Summary Report', type: 'summary', format: 'pdf', description: 'Executive summary with key metrics' },
        'monthly-performance': { title: 'Monthly Performance Report', type: 'performance', format: 'pdf', description: 'Month-over-month performance comparison' }
      };

      const template = reportTemplate[reportId] || { 
        title: 'Custom Report', 
        type: 'custom',
        format: 'pdf'
      };

      const reportPayload = buildReportPayload({
        ...template,
        dateRange: dateRange || 'last-30-days',
        includeCharts: true,
        sections: ['summary', 'charts', 'tables', 'details'],
        description: template.description || ''
      });

      const storedReport = await createStoredReport(reportPayload);
      setReports(prev => [storedReport, ...prev]);

      setGeneratingReport(storedReport);
      setShowProgressModal(true);
      setTimeout(() => {
        simulateReportGeneration(storedReport);
      }, 100);
    } catch (error) {
      console.error('Error generating report:', error);
      if (isAccessDeniedError(error)) {
        return;
      }
      addToast('Unable to generate report at the moment', 'error');
    }
  };

  // Generate actual report data functions
  function generateReportData(report) {
    const toNumber = (value, fallback = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const formatCurrency = (value) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: baseCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(toNumber(value));

    const formatCount = (value) => toNumber(value).toLocaleString('en-US');

    const titleMap = {
      sales: 'Sales Report',
      revenue: 'Revenue Report',
      inventory: 'Inventory Report',
      customer: 'Customer Report',
      profit: 'Profit & Loss Report',
      expenses: 'Expenses Report',
      summary: 'Quick Summary Report',
      performance: 'Monthly Performance Report',
      custom: 'Custom Report'
    };

    const dateRangeLabels = {
      today: 'Today',
      yesterday: 'Yesterday',
      'last-7-days': 'Last 7 days',
      'last-30-days': 'Last 30 days',
      'this-month': 'This month',
      'last-month': 'Last month',
      'this-quarter': 'This quarter',
      'this-year': 'This year',
      custom: 'Custom range'
    };

    const resolveDateRange = (rangeId, customStart, customEnd) => {
      const now = new Date();
      let start = null;
      let end = null;

      const withStartOfDay = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
      };

      const withEndOfDay = (date) => {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
      };

      switch (rangeId) {
        case 'today': {
          start = withStartOfDay(now);
          end = withEndOfDay(now);
          break;
        }
        case 'yesterday': {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          start = withStartOfDay(yesterday);
          end = withEndOfDay(yesterday);
          break;
        }
        case 'last-7-days': {
          start = withStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
          end = withEndOfDay(now);
          break;
        }
        case 'last-30-days': {
          start = withStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29));
          end = withEndOfDay(now);
          break;
        }
        case 'this-month': {
          start = withStartOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
          end = withEndOfDay(now);
          break;
        }
        case 'last-month': {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          start = withStartOfDay(monthStart);
          end = withEndOfDay(monthEnd);
          break;
        }
        case 'this-quarter': {
          const quarter = Math.floor(now.getMonth() / 3);
          start = withStartOfDay(new Date(now.getFullYear(), quarter * 3, 1));
          end = withEndOfDay(now);
          break;
        }
        case 'this-year': {
          start = withStartOfDay(new Date(now.getFullYear(), 0, 1));
          end = withEndOfDay(now);
          break;
        }
        case 'custom': {
          if (customStart) start = withStartOfDay(new Date(customStart));
          if (customEnd) end = withEndOfDay(new Date(customEnd));
          break;
        }
        default: {
          start = withStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29));
          end = withEndOfDay(now);
        }
      }

      const days = start && end ? Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1) : null;
      return {
        start,
        end,
        days,
        label: dateRangeLabels[rangeId] || rangeId
      };
    };

    const resolveDateRangeId = report?.dateRange || report?.metadata?.dateRange || dateRange || 'last-30-days';
    const customStart = report?.startDate || report?.metadata?.extra?.startDate;
    const customEnd = report?.endDate || report?.metadata?.extra?.endDate;
    const rangeInfo = resolveDateRange(resolveDateRangeId, customStart, customEnd);

    const getInvoiceDate = (invoice) => {
      const raw = invoice?.issueDate || invoice?.date || invoice?.createdAt || invoice?.sentAt || invoice?.updatedAt;
      return raw ? new Date(raw) : new Date();
    };

    const isWithinRange = (date) => {
      if (rangeInfo.start && date < rangeInfo.start) return false;
      if (rangeInfo.end && date > rangeInfo.end) return false;
      return true;
    };

    const filteredInvoices = invoices.filter((invoice) => isWithinRange(getInvoiceDate(invoice)));
    const paidInvoices = filteredInvoices.filter((inv) => String(inv.status || '').toLowerCase() === 'paid');

    const statusCounts = {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      pending: 0,
      cancelled: 0
    };

    const revenueByStatus = {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      pending: 0,
      cancelled: 0
    };

    filteredInvoices.forEach((invoice) => {
      const status = String(invoice.status || 'draft').toLowerCase();
      if (statusCounts[status] !== undefined) {
        statusCounts[status] += 1;
        revenueByStatus[status] += toNumber(invoice.totalAmount || invoice.amount || 0);
      }
    });

    const totalInvoices = filteredInvoices.length;
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + toNumber(inv.totalAmount || inv.amount || 0), 0);
    const totalCustomers = customers.length;

    const customerMap = new Map(customers.map((customer) => [customer.id || customer._id || customer.email || customer.name, customer]));
    const productMap = new Map(products.map((product) => [product.id || product._id, product]));
    const categoryMap = new Map(categories.map((category) => [category.id || category._id, category]));

    const resolveCustomerName = (invoice) => {
      if (typeof invoice.customer === 'string' && invoice.customer.trim()) {
        return invoice.customer;
      }
      if (invoice.customer?.name) {
        return invoice.customer.name;
      }
      const customer = customerMap.get(invoice.customerId) || customerMap.get(invoice.customer);
      return customer?.name || invoice.customerName || 'Customer';
    };

    const customerTotals = new Map();
    filteredInvoices.forEach((invoice) => {
      const key = invoice.customerId || invoice.customerEmail || resolveCustomerName(invoice);
      const existing = customerTotals.get(key) || {
        name: resolveCustomerName(invoice),
        invoices: 0,
        revenue: 0,
        lastInvoice: null
      };
      const invoiceDate = getInvoiceDate(invoice);
      existing.invoices += 1;
      existing.revenue += toNumber(invoice.totalAmount || invoice.amount || 0);
      if (!existing.lastInvoice || invoiceDate > existing.lastInvoice) {
        existing.lastInvoice = invoiceDate;
      }
      customerTotals.set(key, existing);
    });

    const topCustomers = Array.from(customerTotals.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const lineItems = filteredInvoices.flatMap((invoice) => {
      const items = Array.isArray(invoice.lineItems)
        ? invoice.lineItems
        : Array.isArray(invoice.items)
          ? invoice.items
          : [];
      return items.map((item) => {
        const quantity = toNumber(item.quantity ?? item.qty ?? 1, 1);
        const rate = toNumber(item.rate ?? item.unitPrice ?? item.price ?? 0);
        const amount = toNumber(item.amount ?? (quantity * rate));
        return {
          description: item.description || item.name || 'Item',
          quantity,
          rate,
          amount,
          productId: item.productId || item.product || item.id || item._id
        };
      });
    });

    const revenueByProduct = new Map();
    const revenueByCategory = new Map();

    lineItems.forEach((item) => {
      const product = productMap.get(item.productId);
      const productName = product?.name || item.description || 'Item';
      const productEntry = revenueByProduct.get(productName) || {
        name: productName,
        quantity: 0,
        revenue: 0
      };
      productEntry.quantity += item.quantity;
      productEntry.revenue += item.amount;
      revenueByProduct.set(productName, productEntry);

      const categoryId = product?.categoryId || product?.category?._id || product?.category;
      const categoryName = categoryMap.get(categoryId)?.name || product?.categoryName || 'Uncategorized';
      const categoryEntry = revenueByCategory.get(categoryName) || { name: categoryName, revenue: 0 };
      categoryEntry.revenue += item.amount;
      revenueByCategory.set(categoryName, categoryEntry);
    });

    const buildMonthlySeries = (monthsBack = 12) => {
      const now = new Date();
      const series = [];
      for (let i = monthsBack - 1; i >= 0; i -= 1) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
        const monthInvoices = filteredInvoices.filter((invoice) => {
          const date = getInvoiceDate(invoice);
          return date >= monthStart && date <= monthEnd;
        });
        const revenue = monthInvoices.reduce((sum, inv) => sum + toNumber(inv.totalAmount || inv.amount || 0), 0);
        series.push({
          label: monthStart.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
          revenue,
          invoices: monthInvoices.length,
          paidRevenue: monthInvoices
            .filter((inv) => String(inv.status || '').toLowerCase() === 'paid')
            .reduce((sum, inv) => sum + toNumber(inv.totalAmount || inv.amount || 0), 0)
        });
      }
      return series;
    };

    const groupInvoicesByPeriod = (period = 'day') => {
      const groups = new Map();
      filteredInvoices.forEach((invoice) => {
        const date = getInvoiceDate(invoice);
        const key = period === 'month'
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          : date.toISOString().split('T')[0];
        const label = period === 'month'
          ? date.toLocaleString('en-US', { month: 'short', year: 'numeric' })
          : key;
        const entry = groups.get(key) || { label, revenue: 0, invoices: 0 };
        entry.revenue += toNumber(invoice.totalAmount || invoice.amount || 0);
        entry.invoices += 1;
        groups.set(key, entry);
      });
      return Array.from(groups.values());
    };

    const summaryCards = [];
    const sections = [];
    const reportType = report?.type || 'summary';
    const reportTitle = report?.title || titleMap[reportType] || 'Business Report';
    const reportFormat = report?.format || 'pdf';

    const baseSummary = {
      totalInvoices,
      totalCustomers,
      totalRevenue,
      paidInvoices: paidInvoices.length,
      pendingInvoices: statusCounts.pending + statusCounts.sent,
      overdueInvoices: statusCounts.overdue,
      draftInvoices: statusCounts.draft,
      activeCustomers: customerTotals.size
    };

    const breakdown = {
      byStatus: statusCounts,
      revenueByStatus
    };

    const addSection = (section) => {
      if (!section?.columns || !section?.rows) return;
      const rows = section.rows.length > 0
        ? section.rows
        : [[section.emptyMessage || 'No data available', ...Array(section.columns.length - 1).fill('')]];
      sections.push({ ...section, rows });
    };

    switch (reportType) {
      case 'sales': {
        const taxCollected = paidInvoices.reduce((sum, inv) => sum + toNumber(inv.totalTax || inv.tax?.amount || 0), 0);
        const averageSale = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
        summaryCards.push(
          { label: 'Total Sales', value: formatCount(totalInvoices) },
          { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
          { label: 'Avg Sale', value: formatCurrency(averageSale) },
          { label: 'Tax Collected', value: formatCurrency(taxCollected) }
        );

        const periodType = rangeInfo.days && rangeInfo.days > 31 ? 'month' : 'day';
        const salesByPeriod = groupInvoicesByPeriod(periodType).map((entry) => {
          const avg = entry.invoices > 0 ? entry.revenue / entry.invoices : 0;
          return [
            entry.label,
            formatCount(entry.invoices),
            formatCurrency(entry.revenue),
            formatCurrency(avg)
          ];
        });

        addSection({
          title: 'Sales by Period',
          columns: ['Period', 'Invoices', 'Revenue', 'Avg Sale'],
          rows: salesByPeriod
        });

        addSection({
          title: 'Top Customers',
          columns: ['Customer', 'Invoices', 'Revenue'],
          rows: topCustomers.map((customer) => [
            customer.name,
            formatCount(customer.invoices),
            formatCurrency(customer.revenue)
          ])
        });

        addSection({
          title: 'Revenue by Status',
          columns: ['Status', 'Revenue'],
          rows: Object.entries(revenueByStatus).map(([status, value]) => [
            status.charAt(0).toUpperCase() + status.slice(1),
            formatCurrency(value)
          ])
        });

        breakdown.salesByPeriod = salesByPeriod;
        breakdown.topCustomers = topCustomers;
        break;
      }
      case 'revenue': {
        const pendingRevenue = (revenueByStatus.pending || 0) + (revenueByStatus.sent || 0);
        const overdueRevenue = revenueByStatus.overdue || 0;
        summaryCards.push(
          { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
          { label: 'Paid Revenue', value: formatCurrency(revenueByStatus.paid || 0) },
          { label: 'Pending Revenue', value: formatCurrency(pendingRevenue) },
          { label: 'Overdue Revenue', value: formatCurrency(overdueRevenue) }
        );

        addSection({
          title: 'Revenue by Product',
          columns: ['Product', 'Qty', 'Revenue'],
          rows: Array.from(revenueByProduct.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10)
            .map((item) => [item.name, formatCount(item.quantity), formatCurrency(item.revenue)])
        });

        addSection({
          title: 'Revenue by Category',
          columns: ['Category', 'Revenue'],
          rows: Array.from(revenueByCategory.values())
            .sort((a, b) => b.revenue - a.revenue)
            .map((item) => [item.name, formatCurrency(item.revenue)])
        });

        addSection({
          title: 'Revenue by Status',
          columns: ['Status', 'Revenue'],
          rows: Object.entries(revenueByStatus).map(([status, value]) => [
            status.charAt(0).toUpperCase() + status.slice(1),
            formatCurrency(value)
          ])
        });
        break;
      }
      case 'inventory': {
        const inventoryValue = products.reduce((sum, product) => sum + (toNumber(product.costPrice) * toNumber(product.stock || product.quantity)), 0);
        const salesValue = products.reduce((sum, product) => sum + (toNumber(product.price) * toNumber(product.stock || product.quantity)), 0);
        const lowStockItems = products.filter((product) => toNumber(product.stock || product.quantity) > 0 && toNumber(product.stock || product.quantity) <= toNumber(product.reorderLevel || 0));
        const outOfStock = products.filter((product) => toNumber(product.stock || product.quantity) <= 0);

        summaryCards.push(
          { label: 'Total Products', value: formatCount(products.length) },
          { label: 'Low Stock Items', value: formatCount(lowStockItems.length) },
          { label: 'Inventory Value', value: formatCurrency(inventoryValue) },
          { label: 'Sales Value', value: formatCurrency(salesValue) }
        );

        addSection({
          title: 'Inventory Overview',
          columns: ['Product', 'SKU', 'Stock', 'Cost Value', 'Sales Value'],
          rows: [...products]
            .sort((a, b) => (toNumber(b.price) * toNumber(b.stock || b.quantity)) - (toNumber(a.price) * toNumber(a.stock || a.quantity)))
            .slice(0, 15)
            .map((product) => [
              product.name,
              product.sku || 'N/A',
              formatCount(product.stock || product.quantity),
              formatCurrency(toNumber(product.costPrice) * toNumber(product.stock || product.quantity)),
              formatCurrency(toNumber(product.price) * toNumber(product.stock || product.quantity))
            ])
        });

        addSection({
          title: 'Low Stock Items',
          columns: ['Product', 'SKU', 'Stock', 'Reorder Level'],
          rows: lowStockItems.map((product) => [
            product.name,
            product.sku || 'N/A',
            formatCount(product.stock || product.quantity),
            formatCount(product.reorderLevel || 0)
          ]),
          emptyMessage: outOfStock.length > 0 ? 'No low stock items (some are out of stock)' : 'No low stock items'
        });

        const adjustmentRows = [...stockAdjustments]
          .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))
          .slice(0, 10)
          .map((adjustment) => {
            const product = productMap.get(adjustment.productId);
            return [
              new Date(adjustment.date || adjustment.createdAt || Date.now()).toLocaleDateString(),
              product?.name || 'Product',
              adjustment.type || 'Adjustment',
              formatCount(adjustment.quantity || 0),
              adjustment.user || 'System'
            ];
          });

        addSection({
          title: 'Recent Stock Adjustments',
          columns: ['Date', 'Product', 'Type', 'Qty', 'User'],
          rows: adjustmentRows
        });

        breakdown.inventory = {
          totalProducts: products.length,
          lowStock: lowStockItems.length,
          outOfStock: outOfStock.length
        };
        break;
      }
      case 'customer': {
        const newCustomers = customers.filter((customer) => {
          if (!customer?.createdAt && !customer?.joinedDate) return false;
          const createdDate = new Date(customer.createdAt || customer.joinedDate);
          return isWithinRange(createdDate);
        });

        const repeatCustomers = Array.from(customerTotals.values()).filter((entry) => entry.invoices > 1);

        summaryCards.push(
          { label: 'Total Customers', value: formatCount(totalCustomers) },
          { label: 'Active Customers', value: formatCount(customerTotals.size) },
          { label: 'New Customers', value: formatCount(newCustomers.length) },
          { label: 'Repeat Customers', value: formatCount(repeatCustomers.length) }
        );

        addSection({
          title: 'Top Customers',
          columns: ['Customer', 'Invoices', 'Revenue', 'Last Invoice'],
          rows: topCustomers.map((customer) => [
            customer.name,
            formatCount(customer.invoices),
            formatCurrency(customer.revenue),
            customer.lastInvoice ? customer.lastInvoice.toLocaleDateString() : 'N/A'
          ])
        });

        addSection({
          title: 'Customer Activity',
          columns: ['Customer', 'Invoices', 'Revenue'],
          rows: Array.from(customerTotals.values())
            .sort((a, b) => b.invoices - a.invoices)
            .slice(0, 10)
            .map((customer) => [
              customer.name,
              formatCount(customer.invoices),
              formatCurrency(customer.revenue)
            ])
        });

        addSection({
          title: 'New Customers',
          columns: ['Customer', 'Email', 'Joined'],
          rows: newCustomers.map((customer) => [
            customer.name,
            customer.email || 'N/A',
            new Date(customer.createdAt || customer.joinedDate).toLocaleDateString()
          ])
        });
        break;
      }
      case 'profit': {
        const costOfGoods = lineItems.reduce((sum, item) => {
          const product = productMap.get(item.productId);
          const cost = product ? toNumber(product.costPrice) : 0;
          return sum + (cost * item.quantity);
        }, 0);

        const grossProfit = totalRevenue - costOfGoods;
        const operatingExpenses = 0;
        const netProfit = grossProfit - operatingExpenses;

        summaryCards.push(
          { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
          { label: 'Cost of Goods', value: formatCurrency(costOfGoods) },
          { label: 'Gross Profit', value: formatCurrency(grossProfit) },
          { label: 'Net Profit', value: formatCurrency(netProfit) }
        );

        addSection({
          title: 'Profit & Loss Summary',
          columns: ['Metric', 'Amount'],
          rows: [
            ['Revenue', formatCurrency(totalRevenue)],
            ['Cost of Goods Sold', formatCurrency(costOfGoods)],
            ['Gross Profit', formatCurrency(grossProfit)],
            ['Operating Expenses', formatCurrency(operatingExpenses)],
            ['Net Profit', formatCurrency(netProfit)]
          ]
        });

        addSection({
          title: 'Revenue by Product',
          columns: ['Product', 'Qty', 'Revenue'],
          rows: Array.from(revenueByProduct.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10)
            .map((item) => [item.name, formatCount(item.quantity), formatCurrency(item.revenue)])
        });
        break;
      }
      case 'expenses': {
        summaryCards.push(
          { label: 'Total Expenses', value: formatCurrency(0) },
          { label: 'Expense Entries', value: formatCount(0) },
          { label: 'Avg Expense', value: formatCurrency(0) },
          { label: 'Largest Expense', value: formatCurrency(0) }
        );

        addSection({
          title: 'Expense Breakdown',
          columns: ['Category', 'Amount'],
          rows: [],
          emptyMessage: 'No expense records found'
        });
        break;
      }
      case 'performance': {
        const monthlySeries = buildMonthlySeries(12);
        const totalPerformanceRevenue = monthlySeries.reduce((sum, entry) => sum + entry.revenue, 0);
        const averageMonthly = monthlySeries.length > 0 ? totalPerformanceRevenue / monthlySeries.length : 0;
        const bestMonth = monthlySeries.reduce((best, entry) => (entry.revenue > best.revenue ? entry : best), monthlySeries[0] || { revenue: 0 });
        const worstMonth = monthlySeries.reduce((worst, entry) => (entry.revenue < worst.revenue ? entry : worst), monthlySeries[0] || { revenue: 0 });

        summaryCards.push(
          { label: 'YTD Revenue', value: formatCurrency(totalPerformanceRevenue) },
          { label: 'Avg Monthly Revenue', value: formatCurrency(averageMonthly) },
          { label: 'Best Month', value: bestMonth?.label || 'N/A' },
          { label: 'Worst Month', value: worstMonth?.label || 'N/A' }
        );

        addSection({
          title: 'Monthly Performance',
          columns: ['Month', 'Revenue', 'Invoices', 'Paid Revenue'],
          rows: monthlySeries.map((entry) => [
            entry.label,
            formatCurrency(entry.revenue),
            formatCount(entry.invoices),
            formatCurrency(entry.paidRevenue)
          ])
        });
        break;
      }
      case 'summary':
      default: {
        const overdueAmount = filteredInvoices
          .filter((inv) => String(inv.status || '').toLowerCase() === 'overdue')
          .reduce((sum, inv) => sum + toNumber(inv.totalAmount || inv.amount || 0), 0);

        summaryCards.push(
          { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
          { label: 'Total Invoices', value: formatCount(totalInvoices) },
          { label: 'Active Customers', value: formatCount(customerTotals.size) },
          { label: 'Overdue Amount', value: formatCurrency(overdueAmount) }
        );

        addSection({
          title: 'Key Metrics',
          columns: ['Metric', 'Value'],
          rows: [
            ['Total Customers', formatCount(totalCustomers)],
            ['Paid Invoices', formatCount(paidInvoices.length)],
            ['Pending Invoices', formatCount(statusCounts.pending + statusCounts.sent)],
            ['Overdue Invoices', formatCount(statusCounts.overdue)]
          ]
        });

        addSection({
          title: 'Top Customers',
          columns: ['Customer', 'Invoices', 'Revenue'],
          rows: topCustomers.map((customer) => [
            customer.name,
            formatCount(customer.invoices),
            formatCurrency(customer.revenue)
          ])
        });

        addSection({
          title: 'Recent Invoices',
          columns: ['Invoice', 'Customer', 'Amount', 'Status'],
          rows: [...filteredInvoices]
            .sort((a, b) => getInvoiceDate(b) - getInvoiceDate(a))
            .slice(0, 10)
            .map((invoice) => [
              invoice.invoiceNumber || invoice.number || invoice.id || 'INV',
              resolveCustomerName(invoice),
              formatCurrency(toNumber(invoice.totalAmount || invoice.amount || 0)),
              (invoice.status || 'draft').toString()
            ])
        });
        break;
      }
    }

      return {
        metadata: {
          title: reportTitle,
          generated: report?.metadata?.generated || report?.generatedAt || new Date().toISOString(),
          type: reportType,
          format: reportFormat,
          dateRange: rangeInfo.label,
          currency: baseCurrency
        },
      summary: baseSummary,
      breakdown,
      summaryCards,
      sections
    };
  }

  function buildReportPayload(report, overrides = {}) {
    const reportData = generateReportData(report);
    const metadata = {
      ...reportData.metadata,
      dateRange: report.dateRange || reportData.metadata.dateRange || 'last-30-days',
      generated: overrides.generatedAt || new Date().toISOString(),
      extra: report.metadata?.extra || {}
    };
    const resolvedExtra = {
      ...metadata.extra,
      startDate: report.startDate || report.metadata?.extra?.startDate,
      endDate: report.endDate || report.metadata?.extra?.endDate
    };
    if (resolvedExtra.startDate || resolvedExtra.endDate) {
      metadata.extra = resolvedExtra;
    }
    const payload = {
      title: report.title || reportData.metadata.title || 'Business Report',
      description: report.description || '',
      type: report.type || reportData.metadata.type || 'custom',
      format: report.format || reportData.metadata.format || 'pdf',
      filters: report.filters || {},
      options: {
        includeCharts: report.includeCharts ?? true,
        sections: report.sections && report.sections.length > 0
          ? report.sections
          : ['summary', 'charts', 'tables', 'details']
      },
      metadata,
      summary: reportData.summary,
      breakdown: reportData.breakdown,
      status: overrides.status || 'processing',
      progress: overrides.progress ?? 0,
      generatedAt: metadata.generated
    };

    if (overrides.extra) {
      payload.metadata.extra = {
        ...payload.metadata.extra,
        ...overrides.extra
      };
    }

    return payload;
  }

  // Generate PDF using jsPDF
// Update the generatePDF function in Reports.js

// Generate PDF using jsPDF - ENHANCED VERSION
const generatePDF = (reportData, filename) => {
  if (!jsPDF) {
    addToast('PDF library not loaded. Please try again.', 'error');
    return;
  }

  try {
    const hasDynamicSections = Array.isArray(reportData?.sections) && reportData.sections.length > 0;
    const summaryCards = Array.isArray(reportData?.summaryCards) ? reportData.summaryCards : [];

    if (hasDynamicSections || summaryCards.length > 0) {
      const doc = new jsPDF.jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      let yPos = margin;

      const addFooter = (pageNum) => {
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Generated by Ledgerly Invoice System', pageWidth / 2, pageHeight - 20, { align: 'center' });
        doc.text(`Page ${pageNum} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
      };

      const checkNewPage = (neededHeight = 10) => {
        if (yPos + neededHeight > pageHeight - 30) {
          doc.addPage();
          yPos = margin;
        }
      };

      const safeText = (value) => String(value ?? '');
      const truncate = (text, max = 32) => (text.length > max ? `${text.slice(0, max - 3)}...` : text);

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text(reportData.metadata?.title || 'Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Metadata
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date(reportData.metadata?.generated || Date.now()).toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      doc.text(
        `Type: ${reportData.metadata?.type || 'custom'} | Format: ${reportData.metadata?.format || 'pdf'} | Date Range: ${reportData.metadata?.dateRange || 'N/A'}`,
        pageWidth / 2,
        yPos,
        { align: 'center' }
      );
      yPos += 15;

      // Summary cards
      if (summaryCards.length > 0) {
        const cardWidth = (pageWidth - 2 * margin - 10) / 2;
        const cardHeight = 28;
        summaryCards.forEach((card, index) => {
          const row = Math.floor(index / 2);
          const col = index % 2;
          const xPos = margin + col * (cardWidth + 10);
          const cardYPos = yPos + row * (cardHeight + 6);

          doc.setFillColor(241, 245, 249);
          doc.roundedRect(xPos, cardYPos, cardWidth, cardHeight, 3, 3, 'F');
          doc.setFillColor(41, 128, 185);
          doc.rect(xPos, cardYPos, 4, cardHeight, 'F');

          doc.setTextColor(71, 85, 105);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(truncate(safeText(card.label), 40), xPos + 8, cardYPos + 9);

          doc.setTextColor(15, 23, 42);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(truncate(safeText(card.value), 26), xPos + 8, cardYPos + 20);
        });

        yPos += Math.ceil(summaryCards.length / 2) * (cardHeight + 6) + 8;
      }

      const renderTable = (section) => {
        if (!section) return;
        checkNewPage(18);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(section.title, margin, yPos);
        yPos += 8;

        if (section.note) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(section.note, margin, yPos);
          yPos += 6;
        }

        const columns = section.columns || [];
        const rows = section.rows || [];
        if (columns.length === 0) return;

        const tableWidth = pageWidth - 2 * margin;
        const colWidth = tableWidth / columns.length;
        const rowHeight = 8;

        doc.setFillColor(241, 245, 249);
        doc.rect(margin, yPos, tableWidth, rowHeight, 'F');
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        columns.forEach((col, index) => {
          doc.text(truncate(safeText(col), 18), margin + index * colWidth + 2, yPos + 6);
        });
        yPos += rowHeight + 2;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);

        rows.forEach((row, rowIndex) => {
          checkNewPage(rowHeight + 4);
          if (rowIndex % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, yPos - 2, tableWidth, rowHeight, 'F');
          }
          columns.forEach((_, colIndex) => {
            const cell = row[colIndex] ?? '';
            doc.text(truncate(safeText(cell), 18), margin + colIndex * colWidth + 2, yPos + 4);
          });
          yPos += rowHeight;
        });

        yPos += 8;
      };

      reportData.sections?.forEach(renderTable);

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i += 1) {
        doc.setPage(i);
        addFooter(i);
      }

      doc.save(filename);
      return;
    }

    const doc = new jsPDF.jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPos = margin;
    let currentPage = 1;
    
    // Helper function to check if we need a new page
    const checkNewPage = () => {
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
        currentPage++;
      }
    };
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185); // Blue color
    doc.text(reportData.metadata.title, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Report info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date(reportData.metadata.generated).toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text(`Type: ${reportData.metadata.type} | Format: ${reportData.metadata.format} | Date Range: ${reportData.metadata.dateRange}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    checkNewPage();
    
    // Summary section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('SUMMARY', margin, yPos);
    yPos += 10;
    
    // Summary cards layout
    const legacySummaryCards = [
      { label: 'Total Invoices', value: reportData.summary.totalInvoices.toString() },
      { label: 'Total Revenue', value: formatReportCurrency(reportData.summary.totalRevenue, reportData?.metadata?.currency) },
      { label: 'Total Customers', value: reportData.summary.totalCustomers.toString() },
      { label: 'Active Customers', value: reportData.summary.activeCustomers.toString() }
    ];
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Calculate card dimensions
    const cardWidth = (pageWidth - 2 * margin) / 2 - 5;
    const cardHeight = 30;
    
    legacySummaryCards.forEach((card, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const xPos = margin + col * (cardWidth + 10);
      const cardYPos = yPos + row * (cardHeight + 5);
      
      // Draw card background
      doc.setFillColor(241, 245, 249); // Light gray-blue
      doc.roundedRect(xPos, cardYPos, cardWidth, cardHeight, 3, 3, 'F');
      
      // Draw left border
      doc.setFillColor(41, 128, 185); // Blue
      doc.rect(xPos, cardYPos, 4, cardHeight, 'F');
      
      // Add card content
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(card.label, xPos + 10, cardYPos + 10);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(card.value, xPos + 10, cardYPos + 22);
    });
    
    yPos += (Math.ceil(legacySummaryCards.length / 2) * (cardHeight + 5)) + 15;
    checkNewPage();
    
    // Invoice Status Breakdown
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE STATUS BREAKDOWN', margin, yPos);
    yPos += 10;
    
    const statusData = [
      { label: 'Draft', value: reportData.breakdown.byStatus.draft, color: [254, 243, 199] },
      { label: 'Sent', value: reportData.breakdown.byStatus.sent, color: [219, 234, 254] },
      { label: 'Paid', value: reportData.breakdown.byStatus.paid, color: [209, 250, 229] },
      { label: 'Overdue', value: reportData.breakdown.byStatus.overdue, color: [254, 226, 226] },
      { label: 'Pending', value: reportData.breakdown.byStatus.pending, color: [255, 255, 255] },
      { label: 'Cancelled', value: reportData.breakdown.byStatus.cancelled, color: [255, 255, 255] }
    ];
    
    // Table header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(71, 85, 105); // Dark gray
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Status', margin + 5, yPos + 7);
    doc.text('Count', margin + 60, yPos + 7);
    doc.text('Percentage', margin + 100, yPos + 7);
    
    yPos += 12;
    
    // Status rows
    doc.setFont('helvetica', 'normal');
    statusData.forEach((status, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      }
      
      // Status badge
      if (status.color[0] !== 255) { // Not white
        doc.setFillColor(...status.color);
        doc.roundedRect(margin + 5, yPos + 1, 15, 6, 1, 1, 'F');
      }
      
      doc.setTextColor(0, 0, 0);
      doc.text(status.label, margin + 25, yPos + 6);
      doc.text(status.value.toString(), margin + 60, yPos + 6);
      
      const percentage = ((status.value / reportData.summary.totalInvoices) * 100 || 0).toFixed(1);
      doc.text(`${percentage}%`, margin + 100, yPos + 6);
      
      yPos += 8;
    });
    
    yPos += 10;
    checkNewPage();
    
    // Revenue by Status
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REVENUE BY STATUS', margin, yPos);
    yPos += 10;
    
    const revenueData = [
      { label: 'Paid', value: reportData.breakdown.revenueByStatus.paid },
      { label: 'Pending', value: reportData.breakdown.revenueByStatus.pending },
      { label: 'Overdue', value: reportData.breakdown.revenueByStatus.overdue }
    ];
    
    // Table header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Status', margin + 5, yPos + 7);
    doc.text('Amount', margin + 60, yPos + 7);
    doc.text('Percentage', margin + 120, yPos + 7);
    
    yPos += 12;
    
    // Revenue rows
    doc.setFont('helvetica', 'normal');
    revenueData.forEach((revenue, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      }
      
      doc.setTextColor(0, 0, 0);
      doc.text(revenue.label, margin + 5, yPos + 6);
      doc.text(formatReportCurrency(revenue.value, reportData?.metadata?.currency), margin + 60, yPos + 6);
      
      const percentage = ((revenue.value / reportData.summary.totalRevenue) * 100 || 0).toFixed(1);
      doc.text(`${percentage}%`, margin + 120, yPos + 6);
      
      yPos += 8;
    });
    
    yPos += 15;
    checkNewPage();
    
    // Top Customers
    if (reportData.breakdown.byCustomer.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('TOP CUSTOMERS', margin, yPos);
      yPos += 10;
      
      // Table header
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Rank', margin + 5, yPos + 7);
      doc.text('Customer', margin + 25, yPos + 7);
      doc.text('Invoices', margin + 120, yPos + 7);
      doc.text('Total Amount', margin + 160, yPos + 7);
      doc.text('Last Purchase', pageWidth - margin - 40, yPos + 7, { align: 'right' });
      
      yPos += 12;
      
      // Customer rows
      doc.setFont('helvetica', 'normal');
      reportData.breakdown.byCustomer.slice(0, 5).forEach((customer, index) => {
        checkNewPage();
        
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
        }
        
        doc.setTextColor(0, 0, 0);
        doc.text((index + 1).toString(), margin + 5, yPos + 6);
        
        // Truncate long customer names
        const customerName = customer.name.length > 30 ? customer.name.substring(0, 27) + '...' : customer.name;
        doc.text(customerName, margin + 25, yPos + 6);
        doc.text(customer.totalInvoices.toString(), margin + 120, yPos + 6);
        doc.text(formatReportCurrency(customer.totalAmount, reportData?.metadata?.currency), margin + 160, yPos + 6);
        doc.text(customer.lastPurchase, pageWidth - margin - 5, yPos + 6, { align: 'right' });
        
        yPos += 8;
      });
      
      yPos += 15;
      checkNewPage();
    }
    
    // Monthly Trend
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`MONTHLY TREND (${new Date().getFullYear()})`, margin, yPos);
    yPos += 10;
    
    // Table header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Month', margin + 5, yPos + 7);
    doc.text('Revenue', margin + 40, yPos + 7);
    doc.text('Invoices', margin + 90, yPos + 7);
    doc.text('Avg/Invoice', margin + 130, yPos + 7);
    
    yPos += 12;
    
    // Monthly data rows
    doc.setFont('helvetica', 'normal');
    reportData.breakdown.monthlyTrend.forEach((month, index) => {
      checkNewPage();
      
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      }
      
      const avgInvoice = month.invoices > 0 ? (month.revenue / month.invoices) : 0;
      
      doc.setTextColor(0, 0, 0);
      doc.text(month.month, margin + 5, yPos + 6);
      doc.text(formatReportCurrency(month.revenue, reportData?.metadata?.currency), margin + 40, yPos + 6);
      doc.text(month.invoices.toString(), margin + 90, yPos + 6);
      doc.text(formatReportCurrency(avgInvoice, reportData?.metadata?.currency), margin + 130, yPos + 6);
      
      yPos += 8;
    });
    
    // Footer on each page
    const addFooter = (pageNum) => {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Generated by Ledgerly Invoice System', pageWidth / 2, pageHeight - 20, { align: 'center' });
      doc.text(`Page ${pageNum} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
    };
    
    // Add footer to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i);
    }
    
    // Save the PDF
    doc.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

  // Content generation functions for other formats
  const generateExcelContent = (reportData) => {
    const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

    if (Array.isArray(reportData.sections) && reportData.sections.length > 0) {
      const rows = [
        ['Report:', reportData.metadata.title],
        ['Generated:', new Date(reportData.metadata.generated).toLocaleString()],
        ['Type:', reportData.metadata.type],
        ['Format:', reportData.metadata.format],
        ['Date Range:', reportData.metadata.dateRange],
        []
      ];

      if (Array.isArray(reportData.summaryCards) && reportData.summaryCards.length > 0) {
        rows.push(['SUMMARY']);
        reportData.summaryCards.forEach((card) => {
          rows.push([card.label, card.value]);
        });
        rows.push([]);
      }

      reportData.sections.forEach((section) => {
        rows.push([section.title]);
        rows.push(section.columns);
        section.rows.forEach((row) => rows.push(row));
        rows.push([]);
      });

      return rows.map(row => row.map(escapeCell).join(',')).join('\n');
    }

    const rows = [
      ['Report:', reportData.metadata.title],
      ['Generated:', new Date(reportData.metadata.generated).toLocaleString()],
      ['Type:', reportData.metadata.type],
      ['Format:', reportData.metadata.format],
      ['Date Range:', reportData.metadata.dateRange],
      [],
      ['SUMMARY', '', ''],
      ['Total Invoices:', reportData.summary.totalInvoices],
      ['Total Customers:', reportData.summary.totalCustomers],
      ['Total Revenue:', formatReportCurrency(reportData.summary.totalRevenue, reportData?.metadata?.currency)],
      ['Paid Invoices:', reportData.summary.paidInvoices],
      ['Pending Invoices:', reportData.summary.pendingInvoices],
      ['Overdue Invoices:', reportData.summary.overdueInvoices],
      ['Draft Invoices:', reportData.summary.draftInvoices],
      ['Active Customers:', reportData.summary.activeCustomers],
      [],
      ['INVOICE BREAKDOWN BY STATUS', '', ''],
      ['Draft:', reportData.breakdown.byStatus.draft],
      ['Sent:', reportData.breakdown.byStatus.sent],
      ['Paid:', reportData.breakdown.byStatus.paid],
      ['Overdue:', reportData.breakdown.byStatus.overdue],
      ['Pending:', reportData.breakdown.byStatus.pending],
      ['Cancelled:', reportData.breakdown.byStatus.cancelled],
    ];
    return rows.map(row => row.map(escapeCell).join(',')).join('\n');
  };

  const generateCSVContent = (reportData) => {
    return generateExcelContent(reportData);
  };

  const generateHTMLContent = (reportData) => {
    if (Array.isArray(reportData.sections) && reportData.sections.length > 0) {
      const summaryCards = Array.isArray(reportData.summaryCards) ? reportData.summaryCards : [];
      const summaryCardsHtml = summaryCards.map((card) => `
        <div class="summary-card">
          <div>${card.label}</div>
          <div class="summary-value">${card.value}</div>
        </div>
      `).join('');

      const sectionsHtml = reportData.sections.map((section) => {
        const headerCells = section.columns.map((col) => `<th>${col}</th>`).join('');
        const rows = section.rows.map((row) => {
          const cells = row.map((cell) => `<td>${cell ?? ''}</td>`).join('');
          return `<tr>${cells}</tr>`;
        }).join('');
        const note = section.note ? `<p class="note">${section.note}</p>` : '';
        return `
          <div class="section">
            <h2>${section.title}</h2>
            ${note}
            <table>
              <tr>${headerCells}</tr>
              ${rows}
            </table>
          </div>
        `;
      }).join('');

      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportData.metadata.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; background: #f8fafc; }
    .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
    .header h1 { color: #2563eb; margin-bottom: 10px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .summary-card { background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #2563eb; }
    .summary-value { font-size: 24px; font-weight: bold; color: #2563eb; margin: 10px 0; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #475569; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 10px; }
    .note { color: #64748b; font-size: 13px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; color: #475569; }
    tr:hover { background: #f8fafc; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${reportData.metadata.title}</h1>
      <p>Generated: ${new Date(reportData.metadata.generated).toLocaleString()}</p>
      <p>Report Type: ${reportData.metadata.type} | Format: ${reportData.metadata.format} | Date Range: ${reportData.metadata.dateRange}</p>
    </div>

    ${summaryCards.length > 0 ? `<div class="summary">${summaryCardsHtml}</div>` : ''}

    ${sectionsHtml}

    <div class="footer">
      Generated by Ledgerly Invoice System
    </div>
  </div>
</body>
</html>
      `;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportData.metadata.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; background: #f8fafc; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
        .header h1 { color: #2563eb; margin-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .summary-card { background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #2563eb; }
        .summary-value { font-size: 24px; font-weight: bold; color: #2563eb; margin: 10px 0; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #475569; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f1f5f9; font-weight: 600; color: #475569; }
        tr:hover { background: #f8fafc; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .status-draft { background: #fef3c7; color: #92400e; }
        .status-sent { background: #dbeafe; color: #1e40af; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-overdue { background: #fee2e2; color: #991b1b; }
        .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${reportData.metadata.title}</h1>
            <p>Generated: ${new Date(reportData.metadata.generated).toLocaleString()}</p>
            <p>Report Type: ${reportData.metadata.type} | Format: ${reportData.metadata.format} | Date Range: ${reportData.metadata.dateRange}</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <div>Total Invoices</div>
                <div class="summary-value">${reportData.summary.totalInvoices}</div>
            </div>
            <div class="summary-card">
                <div>Total Revenue</div>
                <div class="summary-value">${formatReportCurrency(reportData.summary.totalRevenue, reportData?.metadata?.currency)}</div>
            </div>
            <div class="summary-card">
                <div>Total Customers</div>
                <div class="summary-value">${reportData.summary.totalCustomers}</div>
            </div>
            <div class="summary-card">
                <div>Active Customers</div>
                <div class="summary-value">${reportData.summary.activeCustomers}</div>
            </div>
        </div>

        <div class="stat-grid">
            <div class="section">
                <h2>Invoice Status Breakdown</h2>
                <table>
                    <tr>
                        <th>Status</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                    <tr>
                        <td><span class="status-badge status-draft">Draft</span></td>
                        <td>${reportData.breakdown.byStatus.draft}</td>
                        <td>${((reportData.breakdown.byStatus.draft / reportData.summary.totalInvoices) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td><span class="status-badge status-sent">Sent</span></td>
                        <td>${reportData.breakdown.byStatus.sent}</td>
                        <td>${((reportData.breakdown.byStatus.sent / reportData.summary.totalInvoices) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td><span class="status-badge status-paid">Paid</span></td>
                        <td>${reportData.breakdown.byStatus.paid}</td>
                        <td>${((reportData.breakdown.byStatus.paid / reportData.summary.totalInvoices) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td><span class="status-badge status-overdue">Overdue</span></td>
                        <td>${reportData.breakdown.byStatus.overdue}</td>
                        <td>${((reportData.breakdown.byStatus.overdue / reportData.summary.totalInvoices) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td>Pending</td>
                        <td>${reportData.breakdown.byStatus.pending}</td>
                        <td>${((reportData.breakdown.byStatus.pending / reportData.summary.totalInvoices) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td>Cancelled</td>
                        <td>${reportData.breakdown.byStatus.cancelled}</td>
                        <td>${((reportData.breakdown.byStatus.cancelled / reportData.summary.totalInvoices) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <h2>Revenue by Status</h2>
                <table>
                    <tr>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Percentage</th>
                    </tr>
                    <tr>
                        <td>Paid</td>
                        <td>${formatReportCurrency(reportData.breakdown.revenueByStatus.paid, reportData?.metadata?.currency)}</td>
                        <td>${((reportData.breakdown.revenueByStatus.paid / reportData.summary.totalRevenue) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td>Pending</td>
                        <td>${formatReportCurrency(reportData.breakdown.revenueByStatus.pending, reportData?.metadata?.currency)}</td>
                        <td>${((reportData.breakdown.revenueByStatus.pending / reportData.summary.totalRevenue) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td>Overdue</td>
                        <td>${formatReportCurrency(reportData.breakdown.revenueByStatus.overdue, reportData?.metadata?.currency)}</td>
                        <td>${((reportData.breakdown.revenueByStatus.overdue / reportData.summary.totalRevenue) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="section">
            <h2>Top Customers</h2>
            <table>
                <tr>
                    <th>Rank</th>
                    <th>Customer</th>
                    <th>Invoices</th>
                    <th>Total Amount</th>
                    <th>Last Purchase</th>
                </tr>
                ${reportData.breakdown.byCustomer.slice(0, 5).map((cust, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${cust.name}</td>
                    <td>${cust.totalInvoices}</td>
                    <td>${formatReportCurrency(cust.totalAmount, reportData?.metadata?.currency)}</td>
                    <td>${cust.lastPurchase}</td>
                </tr>
                `).join('')}
            </table>
        </div>

        <div class="section">
            <h2>Monthly Trend (${new Date().getFullYear()})</h2>
            <table>
                <tr>
                    <th>Month</th>
                    <th>Revenue</th>
                    <th>Invoices</th>
                    <th>Average Invoice Value</th>
                </tr>
                ${reportData.breakdown.monthlyTrend.map(month => `
                <tr>
                    <td>${month.month}</td>
                    <td>${formatReportCurrency(month.revenue, reportData?.metadata?.currency)}</td>
                    <td>${month.invoices}</td>
                    <td>${formatReportCurrency(month.invoices > 0 ? (month.revenue / month.invoices) : 0, reportData?.metadata?.currency)}</td>
                </tr>
                `).join('')}
            </table>
        </div>

        <div class="footer">
            <p>Generated by Ledgerly Invoice System</p>
            <p>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            <p>Report ID: ${reportData.metadata.generated}</p>
        </div>
    </div>
</body>
</html>`;
  };

  const generateTextContent = (reportData) => {
    if (Array.isArray(reportData.sections) && reportData.sections.length > 0) {
      const lines = [];
      lines.push('==================================================================');
      lines.push(`                          ${reportData.metadata.title}`);
      lines.push('==================================================================');
      lines.push(`Generated: ${new Date(reportData.metadata.generated).toLocaleString()}`);
      lines.push(`Report Type: ${reportData.metadata.type}`);
      lines.push(`Format: ${reportData.metadata.format}`);
      lines.push(`Date Range: ${reportData.metadata.dateRange}`);
      lines.push('');

      if (Array.isArray(reportData.summaryCards) && reportData.summaryCards.length > 0) {
        lines.push('SUMMARY');
        lines.push('==================================================================');
        reportData.summaryCards.forEach((card) => {
          lines.push(`${card.label}: ${card.value}`);
        });
        lines.push('');
      }

      reportData.sections.forEach((section) => {
        lines.push(section.title.toUpperCase());
        lines.push('==================================================================');
        lines.push(section.columns.join(' | '));
        section.rows.forEach((row) => {
          lines.push(row.map((cell) => String(cell ?? '')).join(' | '));
        });
        lines.push('');
      });

      lines.push('==================================================================');
      lines.push('Generated by Ledgerly Invoice System');
      lines.push(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);
      lines.push('==================================================================');
      return lines.join('\n');
    }

    const title = reportData.metadata.title;
    const date = new Date(reportData.metadata.generated).toLocaleString();
    
    return `
==================================================================
                          ${title}
==================================================================

Generated: ${date}
Report Type: ${reportData.metadata.type}
Format: ${reportData.metadata.format}
Date Range: ${reportData.metadata.dateRange}

SUMMARY
==================================================================
Total Invoices: ${reportData.summary.totalInvoices}
Total Customers: ${reportData.summary.totalCustomers}
Total Revenue: ${formatReportCurrency(reportData.summary.totalRevenue, reportData?.metadata?.currency)}
Paid Invoices: ${reportData.summary.paidInvoices}
Pending Invoices: ${reportData.summary.pendingInvoices}
Overdue Invoices: ${reportData.summary.overdueInvoices}
Draft Invoices: ${reportData.summary.draftInvoices}
Active Customers: ${reportData.summary.activeCustomers}

INVOICE BREAKDOWN BY STATUS
==================================================================
Draft: ${reportData.breakdown.byStatus.draft}
Sent: ${reportData.breakdown.byStatus.sent}
Paid: ${reportData.breakdown.byStatus.paid}
Overdue: ${reportData.breakdown.byStatus.overdue}
Pending: ${reportData.breakdown.byStatus.pending}
Cancelled: ${reportData.breakdown.byStatus.cancelled}

REVENUE BY STATUS
==================================================================
Paid Revenue: ${formatReportCurrency(reportData.breakdown.revenueByStatus.paid, reportData?.metadata?.currency)}
Pending Revenue: ${formatReportCurrency(reportData.breakdown.revenueByStatus.pending, reportData?.metadata?.currency)}
Overdue Revenue: ${formatReportCurrency(reportData.breakdown.revenueByStatus.overdue, reportData?.metadata?.currency)}

TOP CUSTOMERS
==================================================================
${reportData.breakdown.byCustomer.slice(0, 5).map((cust, i) => 
  `${i + 1}. ${cust.name}: ${cust.totalInvoices} invoices, ${formatReportCurrency(cust.totalAmount, reportData?.metadata?.currency)}`
).join('\n')}

MONTHLY TREND (Current Year)
==================================================================
${reportData.breakdown.monthlyTrend.map(month => 
  `${month.month}: ${formatReportCurrency(month.revenue, reportData?.metadata?.currency)} revenue, ${month.invoices} invoices`
).join('\n')}

==================================================================
Generated by Ledgerly Invoice System
${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
==================================================================`;
  };

  // Helper function to download files
  const downloadFile = (content, filename, mimeType) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  };

  // Download function with actual content generation
  const handleExport = async (format, reportId = null) => {
    const report = reportId ? reports.find(r => r.id === reportId) : null;
    
    if (!report && reportId) {
      addToast('Report not found!', 'error');
      return;
    }
    
    try {
      const reportData = generateReportData(report);
      
      // Generate filename
      const safeTitle = (report?.title || 'report').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `${safeTitle}_${dateStr}.${format}`;
      
      // Generate and download based on format
      switch(format) {
        case 'pdf':
          generatePDF(reportData, filename);
          break;
          
        case 'excel':
          const excelContent = generateExcelContent(reportData);
          downloadFile(excelContent, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          break;
          
        case 'csv':
          const csvContent = generateCSVContent(reportData);
          downloadFile(csvContent, filename, 'text/csv');
          break;
          
        case 'html':
          const htmlContent = generateHTMLContent(reportData);
          downloadFile(htmlContent, filename, 'text/html');
          break;
          
        default:
          const textContent = generateTextContent(reportData);
          downloadFile(textContent, filename, 'text/plain');
      }

      // Update report download count
      if (report) {
        try {
          const updated = await recordReportDownload(report.id);
          setReports(prev => prev.map(r => r.id === report.id ? updated : r));
        } catch (error) {
          console.error('Unable to record report download:', error);
        }
      }

      // Show success toast
      setTimeout(() => {
        addToast(`"${report?.title || 'Report'}" downloaded successfully as ${format.toUpperCase()}`, 'success');
      }, 100);
      
    } catch (error) {
      console.error('Export error:', error);
      addToast(`Error generating ${format.toUpperCase()}: ${error.message}`, 'error');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        await deleteStoredReport(reportId);
        setReports(prev => prev.filter(r => r.id !== reportId));
        addToast('Report deleted successfully', 'success');
      } catch (error) {
        console.error('Delete report failed:', error);
        if (isAccessDeniedError(error)) {
          return;
        }
        addToast('Unable to delete report', 'error');
      }
    }
  };

  const handleViewReport = (report) => {
    if (report.status === 'completed') {
      // Create a preview of the report
      const reportData = generateReportData(report);
      const content = generateHTMLContent(reportData);
      
      // Open in new tab
      const newWindow = window.open();
      newWindow.document.write(content);
      newWindow.document.close();
    } else {
      setGeneratingReport(report);
      setShowProgressModal(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <ReportHeader
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onCreateReport={handleCreateReport}
          onExport={() => handleExport('pdf')}
          isDarkMode={isDarkMode}
        />

        {/* Alert Banner for Processing Reports */}
        {reports.some(r => r.status === 'processing') && (
          <div className={`rounded-lg p-4 border ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-800' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center">
              <AlertCircle className={`w-5 h-5 mr-3 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div>
                <p className={`font-medium ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-800'
                }`}>
                  Reports are being generated
                </p>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-700'
                }`}>
                  {reports.filter(r => r.status === 'processing').length} report(s) in progress
                </p>
              </div>
              <button 
                onClick={() => setShowProgressModal(true)}
                className="ml-auto text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                View Progress
              </button>
            </div>
          </div>
        )}

        {/* Stats Component */}
        <ReportStats />

        {/* Report Type Filter */}
        <ReportTypeFilter reportType={reportType} onReportTypeChange={setReportType} isDarkMode={isDarkMode} />

        {/* Report Cards Component */}
        <ReportCards 
          onGenerateReport={handleGenerateReport}
          reports={filteredReports}
          onDeleteReport={handleDeleteReport}
          onViewReport={handleViewReport}
          onExport={handleExport}
          reportType={reportType}
          isDarkMode={isDarkMode}
        />

        {/* Charts Component */}
        <ReportCharts />

        {/* Generated Reports List - USING THE SEPARATE COMPONENT */}
        <GeneratedReportsList
          reports={filteredReports}
          onLoadReports={loadReports}
          onExport={handleExport}
          onViewReport={handleViewReport}
          onDeleteReport={handleDeleteReport}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Modals */}
      <CreateReportModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveReport}
        isDarkMode={isDarkMode}
      />

      <ReportProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        report={generatingReport}
        reports={reports.filter(r => r.status === 'processing')}
        isDarkMode={isDarkMode}
      />
    </DashboardLayout>
  );
};

export default Reports;
