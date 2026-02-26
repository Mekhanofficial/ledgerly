const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isValidObjectId = (value) => typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);

const normalizeObjectId = (value) => {
  const normalized = String(value || '').trim();
  return isValidObjectId(normalized) ? normalized : '';
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
  const totalTax = toNumber(invoice.taxAmount ?? invoice.tax?.amount ?? invoice.tax);
  const taxRateUsed = toNumber(invoice.taxRateUsed ?? invoice.tax?.percentage ?? 0);
  const taxName = invoice.taxName || invoice.tax?.description || 'Tax';
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
    taxRateUsed,
    taxName,
    taxAmount: totalTax,
    isTaxOverridden: Boolean(invoice.isTaxOverridden),
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
    const resolvedProductId = normalizeObjectId(
      item.productId
      || item.product?._id
      || item.product?.id
      || item.product
    );
    const lineSubtotal = quantity * unitPrice;
    const lineTax = lineSubtotal * (taxRate / 100);
    const lineTotal = lineSubtotal + lineTax;

    const payloadItem = {
      description: item.description || item.name || '',
      quantity,
      unitPrice,
      taxRate,
      total: toNumber(item.amount ?? lineTotal, lineTotal)
    };

    if (resolvedProductId) {
      payloadItem.product = resolvedProductId;
    }

    if (item.sku) {
      payloadItem.sku = item.sku;
    }

    const itemDiscount = toNumber(item.discount, 0);
    if (itemDiscount > 0) {
      payloadItem.discount = itemDiscount;
      if (item.discountType) {
        payloadItem.discountType = item.discountType;
      }
    }

    return payloadItem;
  });

  const sentDateSource = invoiceData.sentDate || invoiceData.sentAt;
  const shouldSetSentDate = invoiceData.status === 'sent' || Boolean(sentDateSource);
  const sentDate = shouldSetSentDate
    ? (sentDateSource ? new Date(sentDateSource) : new Date())
    : undefined;
  const resolvedCustomer = normalizeObjectId(
    invoiceData.customerId
    || (typeof invoiceData.customer === 'object'
      ? (invoiceData.customer._id || invoiceData.customer.id || '')
      : invoiceData.customer)
  );

  const discountAmount = toNumber(invoiceData.discountAmount, 0);
  const discountPercentage = toNumber(invoiceData.discountPercentage, 0);
  const shippingAmount = toNumber(invoiceData.shippingAmount, 0);
  const amountPaid = toNumber(invoiceData.amountPaid, 0);

  const payload = {
    invoiceNumber: invoiceData.invoiceNumber || invoiceData.number,
    customer: resolvedCustomer || undefined,
    date: invoiceData.issueDate ? new Date(invoiceData.issueDate) : undefined,
    dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined,
    paymentTerms: invoiceData.paymentTerms || undefined,
    currency: invoiceData.currency || 'USD',
    notes: invoiceData.notes || '',
    terms: invoiceData.terms || '',
    items,
    status: invoiceData.status || 'draft'
  };

  const taxRateUsed = toNumber(invoiceData.taxRateUsed ?? invoiceData.taxRate, Number.NaN);
  if (Number.isFinite(taxRateUsed)) {
    payload.taxRateUsed = taxRateUsed;
  }

  const taxAmount = toNumber(invoiceData.taxAmount, Number.NaN);
  if (Number.isFinite(taxAmount)) {
    payload.taxAmount = taxAmount;
  }

  if (invoiceData.taxName || invoiceData.taxDescription) {
    payload.taxName = invoiceData.taxName || invoiceData.taxDescription;
  }

  if (typeof invoiceData.isTaxOverridden === 'boolean') {
    payload.isTaxOverridden = invoiceData.isTaxOverridden;
  }

  if (discountAmount > 0 || discountPercentage > 0 || invoiceData.discountDescription) {
    payload.discount = {
      amount: discountAmount,
      percentage: discountPercentage,
      type: invoiceData.discountType || 'fixed',
      description: invoiceData.discountDescription || ''
    };
  }

  if (shippingAmount > 0 || invoiceData.shippingDescription) {
    payload.shipping = {
      amount: shippingAmount,
      description: invoiceData.shippingDescription || ''
    };
  }

  if (amountPaid > 0) {
    payload.amountPaid = amountPaid;
  }

  if (sentDate) {
    payload.sentDate = sentDate;
  }

  return payload;
};
