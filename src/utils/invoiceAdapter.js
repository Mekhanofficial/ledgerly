const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toDateString = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
};

export const mapInvoiceFromApi = (invoice = {}) => {
  const customer = invoice.customer && typeof invoice.customer === 'object'
    ? invoice.customer
    : null;
  const items = Array.isArray(invoice.items)
    ? invoice.items
    : Array.isArray(invoice.lineItems)
      ? invoice.lineItems
      : [];

  const lineItems = items.map((item, index) => ({
    id: item._id || item.id || index,
    description: item.description || item.name || '',
    quantity: toNumber(item.quantity ?? item.qty ?? 1, 1),
    rate: toNumber(item.unitPrice ?? item.rate ?? item.unit ?? 0, 0),
    tax: toNumber(item.taxRate ?? item.tax ?? 0, 0),
    amount: toNumber(
      item.total ?? item.amount ?? (toNumber(item.unitPrice ?? item.rate ?? 0) * toNumber(item.quantity ?? 1)),
      0
    ),
    productId: item.product?._id || item.product || item.productId || '',
    sku: item.sku || ''
  }));

  const subtotal = toNumber(invoice.subtotal);
  const totalTax = toNumber(invoice.tax?.amount ?? invoice.taxAmount ?? invoice.tax);
  const totalAmount = toNumber(invoice.total ?? invoice.totalAmount ?? invoice.amount);
  const amountPaid = toNumber(invoice.amountPaid);
  const balance = toNumber(invoice.balance ?? (totalAmount - amountPaid));

  return {
    id: invoice._id || invoice.id || '',
    invoiceNumber: invoice.invoiceNumber || invoice.number || '',
    number: invoice.invoiceNumber || invoice.number || '',
    status: invoice.status || 'draft',
    issueDate: invoice.date || invoice.issueDate || invoice.createdAt || '',
    dueDate: invoice.dueDate || invoice.due || '',
    createdAt: invoice.createdAt || '',
    customer: customer || invoice.customer || null,
    customerId: customer?._id || invoice.customer || invoice.customerId || '',
    customerName: customer?.name || invoice.customerName || '',
    customerEmail: customer?.email || invoice.customerEmail || '',
    customerPhone: customer?.phone || invoice.customerPhone || '',
    customerAddress: customer?.address || invoice.customerAddress || '',
    lineItems,
    items,
    subtotal,
    totalTax,
    totalAmount,
    amountPaid,
    balance,
    currency: invoice.currency || 'USD',
    paymentTerms: invoice.paymentTerms || '',
    notes: invoice.notes || '',
    terms: invoice.terms || '',
    raw: invoice
  };
};

export const buildInvoicePayload = (invoiceData = {}) => {
  const lineItems = Array.isArray(invoiceData.lineItems)
    ? invoiceData.lineItems
    : Array.isArray(invoiceData.items)
      ? invoiceData.items
      : [];

  const items = lineItems.map((item) => {
    const quantity = toNumber(item.quantity ?? item.qty ?? 1, 1);
    const unitPrice = toNumber(item.rate ?? item.unitPrice ?? item.unit ?? 0, 0);
    const taxRate = toNumber(item.tax ?? item.taxRate ?? 0, 0);
    const lineSubtotal = quantity * unitPrice;
    const lineTax = lineSubtotal * (taxRate / 100);
    const lineTotal = lineSubtotal + lineTax;

    return {
      product: item.productId || item.product || undefined,
      sku: item.sku || undefined,
      description: item.description || item.name || '',
      quantity,
      unitPrice,
      taxRate,
      discount: toNumber(item.discount ?? 0, 0),
      discountType: item.discountType || 'fixed',
      total: toNumber(item.amount ?? lineTotal, lineTotal)
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalTax = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity * (item.taxRate / 100)), 0);
  const total = subtotal + totalTax;
  const taxPercentage = subtotal > 0 ? (totalTax / subtotal) * 100 : 0;
  const sentDateSource = invoiceData.sentDate || invoiceData.sentAt;
  const shouldSetSentDate = invoiceData.status === 'sent' || Boolean(sentDateSource);
  const sentDate = shouldSetSentDate
    ? (sentDateSource ? new Date(sentDateSource) : new Date())
    : undefined;
  const resolvedCustomer = invoiceData.customerId
    || (typeof invoiceData.customer === 'object'
      ? (invoiceData.customer._id || invoiceData.customer.id || '')
      : invoiceData.customer);

  const payload = {
    customer: resolvedCustomer || '',
    date: invoiceData.issueDate ? new Date(invoiceData.issueDate) : undefined,
    dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined,
    paymentTerms: invoiceData.paymentTerms || undefined,
    currency: invoiceData.currency || 'USD',
    notes: invoiceData.notes || '',
    terms: invoiceData.terms || '',
    items,
    subtotal,
    tax: {
      percentage: taxPercentage,
      amount: totalTax,
      description: invoiceData.taxDescription || ''
    },
    discount: {
      amount: toNumber(invoiceData.discountAmount ?? 0, 0),
      percentage: toNumber(invoiceData.discountPercentage ?? 0, 0),
      type: invoiceData.discountType || 'fixed',
      description: invoiceData.discountDescription || ''
    },
    shipping: {
      amount: toNumber(invoiceData.shippingAmount ?? 0, 0),
      description: invoiceData.shippingDescription || ''
    },
    total,
    amountPaid: toNumber(invoiceData.amountPaid ?? 0, 0),
    balance: toNumber(invoiceData.balance ?? total, total),
    status: invoiceData.status || 'draft'
  };

  if (sentDate) {
    payload.sentDate = sentDate;
  }

  return payload;
};
