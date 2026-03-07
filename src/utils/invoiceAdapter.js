const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isValidObjectId = (value) => typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);

const normalizeObjectId = (value) => {
  const normalized = String(value || '').trim();
  return isValidObjectId(normalized) ? normalized : '';
};

const RECURRING_FREQUENCIES = new Set(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);
const RECURRING_STATUSES = new Set(['active', 'paused', 'completed']);

const normalizeRecurringFrequency = (value) => {
  const normalized = String(value || 'monthly').toLowerCase();
  return RECURRING_FREQUENCIES.has(normalized) ? normalized : 'monthly';
};

const normalizeRecurringStatus = (value) => {
  const normalized = String(value || 'active').toLowerCase();
  return RECURRING_STATUSES.has(normalized) ? normalized : 'active';
};

const normalizeRecurringDate = (value, fallback = undefined) => {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
};

const resolveRecurringPayload = (invoiceData = {}) => {
  const explicitRecurring = invoiceData.recurring && typeof invoiceData.recurring === 'object'
    ? invoiceData.recurring
    : null;

  if (explicitRecurring) {
    const isRecurring = Boolean(explicitRecurring.isRecurring);
    if (!isRecurring) return { isRecurring: false };

    const interval = toNumber(explicitRecurring.interval, 1);
    const startDate = normalizeRecurringDate(
      explicitRecurring.startDate,
      normalizeRecurringDate(invoiceData.issueDate, new Date().toISOString())
    );
    const nextInvoiceDate = normalizeRecurringDate(explicitRecurring.nextInvoiceDate, startDate);
    const endDate = normalizeRecurringDate(explicitRecurring.endDate);
    const totalCycles = toNumber(explicitRecurring.totalCycles, 0);
    const completedCycles = toNumber(explicitRecurring.completedCycles, 0);

    return {
      isRecurring: true,
      status: normalizeRecurringStatus(explicitRecurring.status),
      frequency: normalizeRecurringFrequency(explicitRecurring.frequency),
      interval: interval > 0 ? interval : 1,
      startDate,
      nextInvoiceDate,
      ...(endDate ? { endDate } : {}),
      ...(totalCycles > 0 ? { totalCycles } : {}),
      ...(completedCycles > 0 ? { completedCycles } : {})
    };
  }

  const recurringSettings = invoiceData.recurringSettings && typeof invoiceData.recurringSettings === 'object'
    ? invoiceData.recurringSettings
    : null;
  const isRecurring = Boolean(invoiceData.isRecurring || recurringSettings);

  if (!isRecurring) {
    return { isRecurring: false };
  }

  const issueDate = normalizeRecurringDate(invoiceData.issueDate, new Date().toISOString());
  const startDate = normalizeRecurringDate(recurringSettings?.startDate, issueDate);
  const nextInvoiceDate = normalizeRecurringDate(recurringSettings?.nextInvoiceDate, startDate);
  const endDate = normalizeRecurringDate(recurringSettings?.endDate);
  const interval = toNumber(recurringSettings?.interval, 1);
  const totalCycles = toNumber(recurringSettings?.totalCycles, 0);

  return {
    isRecurring: true,
    status: normalizeRecurringStatus(recurringSettings?.status || 'active'),
    frequency: normalizeRecurringFrequency(recurringSettings?.frequency),
    interval: interval > 0 ? interval : 1,
    startDate,
    nextInvoiceDate,
    ...(endDate ? { endDate } : {}),
    ...(totalCycles > 0 ? { totalCycles } : {})
  };
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
    templateStyle: invoice.templateStyle || 'standard',
    recurring: invoice.recurring
      ? {
          isRecurring: Boolean(invoice.recurring.isRecurring),
          status: normalizeRecurringStatus(invoice.recurring.status),
          frequency: normalizeRecurringFrequency(invoice.recurring.frequency),
          interval: toNumber(invoice.recurring.interval, 1),
          startDate: normalizeRecurringDate(invoice.recurring.startDate),
          endDate: normalizeRecurringDate(invoice.recurring.endDate),
          nextInvoiceDate: normalizeRecurringDate(invoice.recurring.nextInvoiceDate),
          totalCycles: toNumber(invoice.recurring.totalCycles, 0) || undefined,
          completedCycles: toNumber(invoice.recurring.completedCycles, 0) || 0,
          parentInvoice: invoice.recurring.parentInvoice || undefined
        }
      : undefined,
    emailSubject: invoice.emailSubject || '',
    emailMessage: invoice.emailMessage || '',
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
    templateStyle: invoiceData.templateStyle || undefined,
    emailSubject: invoiceData.emailSubject || undefined,
    emailMessage: invoiceData.emailMessage || undefined,
    items,
    status: invoiceData.status || 'draft'
  };

  const recurring = resolveRecurringPayload(invoiceData);
  if (recurring?.isRecurring) {
    payload.recurring = recurring;
  }

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
