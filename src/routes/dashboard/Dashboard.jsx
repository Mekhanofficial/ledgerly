import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatsCards from '../../components/dashboard/StatsCards';
import QuickActions from '../../components/dashboard/QuickActions';
import RecentInvoices from '../../components/dashboard/RecentInvoices';
import AlertsNotifications from '../../components/dashboard/AlertsNotifications';
import { fetchInvoices } from '../../store/slices/invoiceSlice';
import { fetchCustomers } from '../../store/slices/customerSlice';
import { useInvoice } from '../../context/InvoiceContext';
import { usePayments } from '../../context/PaymentContext';
import { useToast } from '../../context/ToastContext';
import { useAccount } from '../../context/AccountContext';
import { formatCurrency } from '../../utils/currency';

const Dashboard = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth?.user);
  const invoices = useSelector((state) => state.invoices?.invoices || []);
  const isClient = authUser?.role === 'client';
  const { exportInvoicesAsCSV } = useInvoice();
  const { receipts } = usePayments();
  const { addToast } = useToast();
  const { accountInfo } = useAccount();
  const baseCurrency = accountInfo?.currency || 'USD';
  const formatMoney = useCallback(
    (value, currencyCode) => formatCurrency(value, currencyCode || baseCurrency),
    [baseCurrency]
  );

  const [activeFilter, setActiveFilter] = useState('this-month');
  const [customRange, setCustomRange] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return { from: today, to: today };
  });

  if (authUser?.role === 'super_admin') {
    return <Navigate to="/super-admin" replace />;
  }

  useEffect(() => {
    dispatch(fetchInvoices());
    dispatch(fetchCustomers());
  }, [dispatch]);

  const parseDateInput = useCallback((value) => {
    if (!value) return null;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, []);

  const parseInvoiceDateValue = useCallback((value) => {
    if (!value) return null;
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'number') {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (dateOnlyMatch) {
        const year = Number(dateOnlyMatch[1]);
        const month = Number(dateOnlyMatch[2]) - 1;
        const day = Number(dateOnlyMatch[3]);
        const localDate = new Date(year, month, day);
        return Number.isNaN(localDate.getTime()) ? null : localDate;
      }
      const utcMidnightMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T00:00:00(?:\.000)?Z$/);
      if (utcMidnightMatch) {
        const year = Number(utcMidnightMatch[1]);
        const month = Number(utcMidnightMatch[2]) - 1;
        const day = Number(utcMidnightMatch[3]);
        const localDate = new Date(year, month, day);
        return Number.isNaN(localDate.getTime()) ? null : localDate;
      }
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, []);

  const resolveInvoiceTimestamp = useCallback((invoice) => {
    const rawDate = invoice?.issueDate || invoice?.date || invoice?.sentDate || invoice?.createdAt;
    const parsed = parseInvoiceDateValue(rawDate);
    if (!parsed) return null;
    return parsed.getTime();
  }, [parseInvoiceDateValue]);

  const resolveReceiptTimestamp = useCallback((receipt) => {
    const rawDate = receipt?.paymentDate || receipt?.savedAt || receipt?.createdAt || receipt?.date;
    const parsed = parseInvoiceDateValue(rawDate);
    if (!parsed) return null;
    return parsed.getTime();
  }, [parseInvoiceDateValue]);

  const dateRange = useMemo(() => {
    const now = new Date();
    let start = new Date(now.getFullYear(), now.getMonth(), 1);
    let end = new Date(now);

    if (activeFilter === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now);
    } else if (activeFilter === 'this-week') {
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
    } else if (activeFilter === 'this-month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now);
    } else if (activeFilter === 'custom') {
      let fromDate = parseDateInput(customRange?.from);
      let toDate = parseDateInput(customRange?.to);

      if (!fromDate && !toDate) {
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        toDate = new Date(now);
      } else if (!fromDate && toDate) {
        fromDate = new Date(toDate);
      } else if (fromDate && !toDate) {
        toDate = new Date(fromDate);
      }

      if (fromDate && toDate && fromDate > toDate) {
        const temp = fromDate;
        fromDate = toDate;
        toDate = temp;
      }

      start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
      end = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 999);
    }

    const duration = Math.max(0, end.getTime() - start.getTime());
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration);

    return {
      start,
      end,
      previousStart,
      previousEnd
    };
  }, [activeFilter, customRange, parseDateInput]);

  const periodLabel = useMemo(() => {
    if (activeFilter === 'today') return 'Today';
    if (activeFilter === 'this-week') return 'This week';
    if (activeFilter === 'this-month') return 'This month';
    if (activeFilter !== 'custom') return 'This month';

    const formatDate = (value) =>
      value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
  }, [activeFilter, dateRange]);

  const filterInvoicesByRange = useCallback(
    (list, start, end) => {
      return list.filter((invoice) => {
        const timestamp = resolveInvoiceTimestamp(invoice);
        if (timestamp == null) return false;
        return timestamp >= start.getTime() && timestamp <= end.getTime();
      });
    },
    [resolveInvoiceTimestamp]
  );

  const filteredInvoices = useMemo(
    () => filterInvoicesByRange(invoices, dateRange.start, dateRange.end),
    [invoices, dateRange, filterInvoicesByRange]
  );

  const previousInvoices = useMemo(
    () => filterInvoicesByRange(invoices, dateRange.previousStart, dateRange.previousEnd),
    [invoices, dateRange, filterInvoicesByRange]
  );

  const filterReceiptsByRange = useCallback(
    (list, start, end) => {
      return list.filter((receipt) => {
        const timestamp = resolveReceiptTimestamp(receipt);
        if (timestamp == null) return false;
        return timestamp >= start.getTime() && timestamp <= end.getTime();
      });
    },
    [resolveReceiptTimestamp]
  );

  const filteredReceipts = useMemo(
    () => filterReceiptsByRange(receipts || [], dateRange.start, dateRange.end),
    [receipts, dateRange, filterReceiptsByRange]
  );

  const previousReceipts = useMemo(
    () => filterReceiptsByRange(receipts || [], dateRange.previousStart, dateRange.previousEnd),
    [receipts, dateRange, filterReceiptsByRange]
  );

  const resolveCustomerId = useCallback((invoice) => {
    if (!invoice) return null;
    if (typeof invoice.customer === 'object' && invoice.customer) {
      return invoice.customer._id || invoice.customer.id || null;
    }
    return invoice.customer || null;
  }, []);

  const handleApplyCustomRange = useCallback(() => {
    setActiveFilter('custom');
  }, []);

  const handleExport = useCallback(() => {
    if (!filteredInvoices.length) {
      addToast('No invoices found for the selected date range', 'warning');
      return;
    }
    const ids = filteredInvoices.map((invoice) => invoice.id || invoice._id).filter(Boolean);
    exportInvoicesAsCSV(ids);
  }, [filteredInvoices, exportInvoicesAsCSV, addToast]);

  // Calculate real-time stats
  const statsData = useMemo(() => {
    const totalInvoices = filteredInvoices.length;
    const paidInvoicesInRange = filteredInvoices.filter(inv => inv.status === 'paid');
    const paidInvoiceRevenue = paidInvoicesInRange.reduce(
      (sum, inv) => sum + (inv.totalAmount || inv.amount || inv.total || 0),
      0
    );
    const receiptRevenue = filteredReceipts
      .filter((receipt) => receipt.status === 'completed')
      .reduce((sum, receipt) => sum + (receipt.total || receipt.amount || 0), 0);
    const hasReceiptData = Array.isArray(receipts) && receipts.length > 0;
    const totalRevenue = hasReceiptData ? receiptRevenue : paidInvoiceRevenue;
    const paidInvoices = paidInvoicesInRange.length;
    const pendingInvoices = filteredInvoices.filter(inv => ['sent', 'viewed', 'partial', 'overdue'].includes(inv.status)).length;
    const overdueInvoices = filteredInvoices.filter(inv => inv.status === 'overdue').length;
    const draftInvoices = filteredInvoices.filter(inv => inv.status === 'draft').length;
    const activeCustomers = new Set(filteredInvoices.map(resolveCustomerId).filter(Boolean)).size;
    const previousActiveCustomers = new Set(previousInvoices.map(resolveCustomerId).filter(Boolean)).size;

    const previousPaidRevenue = previousInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || inv.total || 0), 0);
    const previousReceiptRevenue = previousReceipts
      .filter((receipt) => receipt.status === 'completed')
      .reduce((sum, receipt) => sum + (receipt.total || receipt.amount || 0), 0);
    const previousRevenue = hasReceiptData ? previousReceiptRevenue : previousPaidRevenue;
    const revenueChange = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : totalRevenue > 0 ? '100.0' : '0.0';

    const invoiceChange = previousInvoices.length > 0
      ? ((totalInvoices - previousInvoices.length) / previousInvoices.length * 100).toFixed(1)
      : totalInvoices > 0 ? '100.0' : '0.0';

    const activeCustomersChange = previousActiveCustomers > 0
      ? ((activeCustomers - previousActiveCustomers) / previousActiveCustomers * 100).toFixed(1)
      : activeCustomers > 0 ? '100.0' : '0.0';

    const previousOverdue = previousInvoices.filter(inv => inv.status === 'overdue').length;
    const overdueChange = previousOverdue > 0
      ? ((overdueInvoices - previousOverdue) / previousOverdue * 100).toFixed(1)
      : overdueInvoices > 0 ? '100.0' : '0.0';

    return {
      totalRevenue: formatMoney(totalRevenue, baseCurrency),
      revenueChange: parseFloat(revenueChange) > 0 ? `+${revenueChange}%` : `${revenueChange}%`,
      totalInvoices: totalInvoices.toString(),
      invoiceChange: parseFloat(invoiceChange) > 0 ? `+${invoiceChange}%` : `${invoiceChange}%`,
      activeCustomers: activeCustomers.toString(),
      activeCustomersChange: parseFloat(activeCustomersChange) > 0 ? `+${activeCustomersChange}%` : `${activeCustomersChange}%`,
      overdueInvoices: overdueInvoices.toString(),
      overdueChange: parseFloat(overdueChange) > 0 ? `+${overdueChange}%` : `${overdueChange}%`,
      paidInvoices: paidInvoices.toString(),
      pendingInvoices: pendingInvoices.toString(),
      draftInvoices: draftInvoices.toString(),
      periodLabel
    };
  }, [
    filteredInvoices,
    previousInvoices,
    filteredReceipts,
    previousReceipts,
    receipts,
    resolveCustomerId,
    periodLabel,
    formatMoney
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
        onApplyCustomRange={handleApplyCustomRange}
        onExport={handleExport}
      />
      {!isClient && <StatsCards statsData={statsData} />}
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - QuickActions */}
        <div className="lg:col-span-2 space-y-6">
          {!isClient && <QuickActions />}
          <RecentInvoices />
        </div>
        
        {/* Right Column - Alerts & Notifications */}
        {!isClient && (
          <div className="lg:col-span-1">
            <AlertsNotifications />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
