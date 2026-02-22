import React, { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, ArrowUpRight } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useTheme } from '../../context/ThemeContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useInventory } from '../../context/InventoryContext';
import { usePayments } from '../../context/PaymentContext';

const normalizeText = (value) => String(value || '').toLowerCase();

const SearchPage = () => {
  const { isDarkMode } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState('all');

  const authUser = useSelector((state) => state.auth?.user);
  const normalizedRole = String(authUser?.role || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  const isClient = normalizedRole === 'client';
  const canAccessInventory = ['admin', 'accountant', 'staff'].includes(normalizedRole);
  const canAccessCustomers = ['admin', 'accountant', 'staff'].includes(normalizedRole);
  const canAccessReceipts = ['admin', 'accountant'].includes(normalizedRole);

  const { invoices, customers, products } = useInvoice();
  const { categories, suppliers } = useInventory();
  const { receipts } = usePayments();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  const normalizedQuery = normalizeText(trimmedQuery);

  const invoiceResults = useMemo(() => {
    if (!hasQuery) return [];
    return invoices.filter((invoice) => {
      const customerName =
        invoice.customerName ||
        invoice.customer?.name ||
        (typeof invoice.customer === 'string' ? invoice.customer : '');
      return [
        invoice.number,
        invoice.invoiceNumber,
        customerName,
        invoice.customerEmail,
        invoice.status
      ].some((field) => normalizeText(field).includes(normalizedQuery));
    }).map((invoice) => ({
      id: invoice.id,
      type: 'invoices',
      title: invoice.number || invoice.invoiceNumber || 'Invoice',
      subtitle: invoice.customerName || invoice.customer?.name || 'Customer',
      meta: invoice.status ? invoice.status.toUpperCase() : 'INVOICE',
      to: `/invoices/view/${invoice.id}`
    }));
  }, [invoices, hasQuery, normalizedQuery]);

  const customerResults = useMemo(() => {
    if (!hasQuery || !canAccessCustomers) return [];
    return customers.filter((customer) => {
      return [
        customer.name,
        customer.email,
        customer.phone,
        customer.company,
        customer.address
      ].some((field) => normalizeText(field).includes(normalizedQuery));
    }).map((customer) => ({
      id: customer.id,
      type: 'customers',
      title: customer.name || 'Customer',
      subtitle: customer.email || customer.phone || 'Customer record',
      meta: customer.company || 'Customer',
      to: `/customers/${customer.id}`
    }));
  }, [customers, hasQuery, normalizedQuery, canAccessCustomers]);

  const productResults = useMemo(() => {
    if (!hasQuery || !canAccessInventory) return [];
    return products.filter((product) => {
      return [
        product.name,
        product.sku,
        product.description,
        product.categoryName,
        product.supplierName
      ].some((field) => normalizeText(field).includes(normalizedQuery));
    }).map((product) => ({
      id: product.id,
      type: 'products',
      title: product.name || 'Product',
      subtitle: product.sku ? `SKU ${product.sku}` : 'Inventory item',
      meta: product.categoryName || 'Product',
      to: `/inventory/products/edit/${product.id}`
    }));
  }, [products, hasQuery, normalizedQuery, canAccessInventory]);

  const categoryResults = useMemo(() => {
    if (!hasQuery || !canAccessInventory) return [];
    return categories.filter((category) => {
      return [
        category.name,
        category.description
      ].some((field) => normalizeText(field).includes(normalizedQuery));
    }).map((category) => ({
      id: category.id,
      type: 'categories',
      title: category.name || 'Category',
      subtitle: category.description || 'Inventory category',
      meta: 'Category',
      to: '/inventory/categories'
    }));
  }, [categories, hasQuery, normalizedQuery, canAccessInventory]);

  const supplierResults = useMemo(() => {
    if (!hasQuery || !canAccessInventory) return [];
    return suppliers.filter((supplier) => {
      return [
        supplier.name,
        supplier.email,
        supplier.phone
      ].some((field) => normalizeText(field).includes(normalizedQuery));
    }).map((supplier) => ({
      id: supplier.id || supplier._id,
      type: 'suppliers',
      title: supplier.name || 'Supplier',
      subtitle: supplier.email || supplier.phone || 'Supplier',
      meta: 'Supplier',
      to: '/inventory/suppliers'
    }));
  }, [suppliers, hasQuery, normalizedQuery, canAccessInventory]);

  const receiptResults = useMemo(() => {
    if (!hasQuery || !canAccessReceipts) return [];
    return receipts.filter((receipt) => {
      return [
        receipt.receiptNumber,
        receipt.customerName,
        receipt.customerEmail,
        receipt.paymentMethod,
        receipt.status
      ].some((field) => normalizeText(field).includes(normalizedQuery));
    }).map((receipt) => ({
      id: receipt.id,
      type: 'receipts',
      title: receipt.receiptNumber || 'Receipt',
      subtitle: receipt.customerName || 'Customer',
      meta: receipt.status ? receipt.status.toUpperCase() : 'RECEIPT',
      to: '/receipts'
    }));
  }, [receipts, hasQuery, normalizedQuery, canAccessReceipts]);

  const sections = useMemo(() => {
    return [
      { key: 'invoices', label: 'Invoices', items: invoiceResults },
      { key: 'customers', label: 'Customers', items: customerResults },
      { key: 'products', label: 'Products', items: productResults },
      { key: 'categories', label: 'Categories', items: categoryResults },
      { key: 'suppliers', label: 'Suppliers', items: supplierResults },
      { key: 'receipts', label: 'Receipts', items: receiptResults }
    ].filter((section) => section.items.length > 0 || activeFilter === section.key);
  }, [
    invoiceResults,
    customerResults,
    productResults,
    categoryResults,
    supplierResults,
    receiptResults,
    activeFilter
  ]);

  const totalResults = useMemo(() => {
    return [
      invoiceResults,
      customerResults,
      productResults,
      categoryResults,
      supplierResults,
      receiptResults
    ].reduce((sum, list) => sum + list.length, 0);
  }, [invoiceResults, customerResults, productResults, categoryResults, supplierResults, receiptResults]);

  const filterOptions = useMemo(() => {
    const options = [
      { key: 'all', label: 'All', count: totalResults },
      { key: 'invoices', label: 'Invoices', count: invoiceResults.length },
      { key: 'customers', label: 'Customers', count: customerResults.length, hidden: !canAccessCustomers },
      { key: 'products', label: 'Products', count: productResults.length, hidden: !canAccessInventory },
      { key: 'categories', label: 'Categories', count: categoryResults.length, hidden: !canAccessInventory },
      { key: 'suppliers', label: 'Suppliers', count: supplierResults.length, hidden: !canAccessInventory },
      { key: 'receipts', label: 'Receipts', count: receiptResults.length, hidden: !canAccessReceipts }
    ];
    return options.filter((option) => !option.hidden);
  }, [
    totalResults,
    invoiceResults,
    customerResults,
    productResults,
    categoryResults,
    supplierResults,
    receiptResults,
    canAccessInventory,
    canAccessCustomers,
    canAccessReceipts
  ]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchParams({});
      return;
    }
    setSearchParams({ q: trimmed });
  };

  const renderResults = () => {
    if (!hasQuery) {
      return (
        <div className={`rounded-xl border p-8 text-center ${
          isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
        }`}>
          Start typing to search invoices, customers, products, receipts, and more.
        </div>
      );
    }

    if (totalResults === 0) {
      return (
        <div className={`rounded-xl border p-8 text-center ${
          isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
        }`}>
          No results found for "{trimmedQuery}".
        </div>
      );
    }

    const visibleSections = activeFilter === 'all'
      ? sections
      : sections.filter((section) => section.key === activeFilter);

    return (
      <div className="space-y-6">
        {visibleSections.map((section) => (
          <div key={section.key} className={`rounded-xl border ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            <div className={`px-4 py-3 border-b text-sm font-semibold uppercase tracking-wide ${
              isDarkMode ? 'border-gray-800 text-gray-300' : 'border-gray-200 text-gray-500'
            }`}>
              {section.label} ({section.items.length})
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {section.items.map((item) => (
                <Link
                  key={`${section.key}-${item.id}`}
                  to={item.to}
                  className={`flex items-center justify-between gap-4 px-4 py-3 transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-800 text-gray-100'
                      : 'hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{item.title}</div>
                    <div className={`text-sm truncate ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {item.subtitle}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold uppercase px-2 py-1 rounded-full ${
                      isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.meta}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-primary-500" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-2">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Search
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Search across your invoices, customers, products, and receipts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isClient ? 'Search invoices...' : 'Search invoices, customers, products, receipts...'}
              className={`w-full rounded-lg border pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                isDarkMode
                  ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setActiveFilter(option.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === option.key
                    ? 'bg-primary-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </form>

        {renderResults()}
      </div>
    </DashboardLayout>
  );
};

export default SearchPage;
