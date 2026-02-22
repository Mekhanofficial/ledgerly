const DEFAULT_LOCALE = 'en-US';

export const formatCurrency = (value, currency = 'USD', options = {}) => {
  const amount = Number(value ?? 0);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const safeCurrency = (currency || 'USD').toUpperCase();
  const {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    ...rest
  } = options || {};

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits,
      maximumFractionDigits,
      ...rest
    }).format(safeAmount);
  } catch (error) {
    return `${safeCurrency} ${safeAmount.toFixed(minimumFractionDigits)}`;
  }
};

export const getCurrencySymbol = (currency = 'USD', locale = DEFAULT_LOCALE) => {
  const safeCurrency = (currency || 'USD').toUpperCase();
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: safeCurrency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(0);
    const symbol = formatted.replace(/[\d\s.,]/g, '').trim();
    return symbol || safeCurrency;
  } catch (error) {
    return safeCurrency;
  }
};
