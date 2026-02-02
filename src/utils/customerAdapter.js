const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatMonthYear = (value) => {
  const date = safeDate(value);
  if (!date) return 'N/A';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const formatShortDate = (value) => {
  const date = safeDate(value);
  if (!date) return 'Never';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address;

  const parts = [
    address.street,
    address.city,
    address.state,
    address.country,
    address.postalCode
  ].filter(Boolean);

  return parts.join(', ');
};

export const mapCustomerFromApi = (customer = {}) => {
  const lastTransactionDate = customer.lastPurchaseDate || customer.updatedAt || customer.createdAt;
  const totalPaid = Number(customer.totalPaid ?? customer.totalSpent ?? 0);
  const totalInvoiced = Number(customer.totalInvoiced ?? 0);
  const outstanding = Number(customer.outstandingBalance ?? 0);

  return {
    id: customer._id || customer.id || '',
    name: customer.name || 'Unnamed Customer',
    email: customer.email || '',
    phone: customer.phone || customer.mobile || '',
    company: customer.company || '',
    address: formatAddress(customer.address),
    createdAt: customer.createdAt || null,
    joinedDate: formatMonthYear(customer.createdAt),
    totalSpent: totalPaid,
    outstanding,
    transactions: Number.isFinite(customer.totalInvoices)
      ? customer.totalInvoices
      : totalInvoiced > 0
        ? 1
        : 0,
    lastTransaction: formatShortDate(lastTransactionDate),
    isActive: customer.isActive !== false,
    raw: customer
  };
};

export const buildCustomerPayload = (formData = {}) => {
  const payload = {
    name: formData.name?.trim(),
    email: formData.email?.trim(),
    phone: formData.phone?.trim()
  };

  if (formData.company) {
    payload.company = formData.company.trim();
  }

  if (formData.address) {
    payload.address = { street: formData.address.trim() };
  }

  return payload;
};
