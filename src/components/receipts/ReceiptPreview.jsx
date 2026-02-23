import React from 'react';
import {
  Printer,
  Mail,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Wallet,
  Smartphone,
  User,
  ShoppingCart
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAccount } from '../../context/AccountContext';
import templateStorage from '../../utils/templateStorage';
import PaymentMethodDisplay from './PaymentMethodDisplay';
import { formatCurrency } from '../../utils/currency';

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

const resolveTemplatePalette = (templateId, templates = []) => {
  const matchedTemplate = templates.find((item) => item.id === templateId);
  const template = matchedTemplate || templateStorage.getTemplate(templateId) || templateStorage.getTemplate('standard');
  const palette = template?.colors || {};
  return {
    primary: toCssColor(palette.primary, TEMPLATE_COLOR_FALLBACK.primary),
    secondary: toCssColor(palette.secondary, TEMPLATE_COLOR_FALLBACK.secondary),
    accent: toCssColor(palette.accent, TEMPLATE_COLOR_FALLBACK.accent),
    text: toCssColor(palette.text, TEMPLATE_COLOR_FALLBACK.text)
  };
};

const ReceiptPreview = ({
  items,
  onUpdateQuantity,
  onClearAll,
  onPrint,
  onPrintAndEmail,
  onEmailOnly,
  customerEmail,
  setCustomerEmail,
  customerName,
  setCustomerName,
  selectedCustomerId,
  onSelectCustomer,
  selectedCustomer,
  customers,
  paymentMethod,
  setPaymentMethod,
  selectedPaymentMethodId,
  onSelectPaymentMethod,
  selectedPaymentMethod,
  paymentMethods,
  notes,
  setNotes,
  isProcessing,
  availableTemplates = [],
  selectedTemplateId,
  onSelectTemplate
}) => {
  const { isDarkMode } = useTheme();
  const { accountInfo } = useAccount();
  const currencyCode = accountInfo?.currency || 'USD';
  const formatMoney = (value, currencyOverride) => formatCurrency(value, currencyOverride || currencyCode);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.085;
  const total = subtotal + tax;
  const itemUnits = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getPaymentMethodDetails = () => {
    if (selectedPaymentMethod) {
      if (selectedPaymentMethod.type === 'credit_card') {
        return `**** ${selectedPaymentMethod.last4 || '1234'}`;
      }
      if (selectedPaymentMethod.type === 'paypal') {
        return selectedPaymentMethod.email || 'paypal@example.com';
      }
    }
    return paymentMethod === 'Card' ? 'Card payment' : paymentMethod === 'Mobile Money' ? 'Mobile transfer' : 'Cash payment';
  };

  const companyName = accountInfo?.companyName || accountInfo?.businessName || 'Ledgerly';
  const locationParts = [
    accountInfo?.address,
    [accountInfo?.city, accountInfo?.state, accountInfo?.zipCode].filter(Boolean).join(', '),
    accountInfo?.country
  ].filter(Boolean);
  const contactLine = [
    accountInfo?.phone ? `Tel: ${accountInfo.phone}` : '',
    accountInfo?.email || '',
    accountInfo?.website || ''
  ].filter(Boolean).join(' | ');

  const templatePalette = React.useMemo(
    () => resolveTemplatePalette(selectedTemplateId, availableTemplates),
    [selectedTemplateId, availableTemplates]
  );

  const previewReceiptNumber = React.useMemo(
    () => `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    []
  );
  const previewTimestamp = React.useMemo(() => new Date(), []);
  const previewEmail = selectedCustomer?.email || customerEmail || '';
  const selectedTemplate = availableTemplates.find((template) => template.id === selectedTemplateId);
  const canSendEmail = Boolean(previewEmail || selectedCustomerId);
  const hideContent = isMobile && isCollapsed;
  const customerCount = Array.isArray(customers) ? customers.length : 0;
  const savedPaymentMethodsCount = Array.isArray(paymentMethods) ? paymentMethods.length : 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}
      style={{ boxShadow: isDarkMode ? 'none' : '0 12px 30px rgba(15, 23, 42, 0.05)' }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background: `linear-gradient(135deg, ${templatePalette.primary}22, ${templatePalette.secondary}14 55%, transparent)`
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ background: templatePalette.primary }} />

      <div className="relative p-4 sm:p-5">
        {isMobile && (
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className={`mb-3 flex w-full items-center justify-between rounded-xl border p-3 text-left ${
              isDarkMode ? 'border-gray-700 bg-gray-900/60' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isDarkMode ? 'bg-gray-800 text-gray-300' : 'border border-gray-200 bg-white text-gray-700'
              }`}>
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Checkout Panel
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {itemUnits} units | {formatMoney(total)}
                </div>
              </div>
            </div>
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isCollapsed ? 'Expand' : 'Collapse'}
            </span>
          </button>
        )}

        {!hideContent && (
          <div className="space-y-4">
            <section className={`rounded-xl border p-4 ${
              isDarkMode ? 'border-gray-700 bg-gray-900/60' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-lg font-semibold tracking-tight" style={{ color: templatePalette.primary }}>
                    {companyName}
                  </div>
                  <div className={`mt-1 text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {locationParts.length ? locationParts.join(' | ') : 'Business address not configured'}
                    {contactLine ? ` | ${contactLine}` : ''}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      isDarkMode ? 'border border-gray-700 bg-gray-800 text-gray-300' : 'border border-gray-200 bg-white text-gray-700'
                    }`}>
                      {previewReceiptNumber}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      isDarkMode ? 'border border-gray-700 bg-gray-800 text-gray-300' : 'border border-gray-200 bg-white text-gray-700'
                    }`}>
                      {previewTimestamp.toLocaleDateString()} {previewTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {selectedTemplate?.name && (
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        isDarkMode ? 'border border-gray-700 bg-gray-800 text-gray-300' : 'border border-gray-200 bg-white text-gray-700'
                      }`}>
                        Template: {selectedTemplate.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className={`rounded-2xl px-4 py-3 text-right ${
                  isDarkMode ? 'border border-gray-700 bg-gray-800' : 'border border-gray-200 bg-white'
                }`}>
                  <div className={`text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Total Due
                  </div>
                  <div className="text-xl font-semibold" style={{ color: templatePalette.primary }}>
                    {formatMoney(total)}
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {items.length} lines | {itemUnits} units
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className={`rounded-xl border p-4 ${
                isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'
              }`}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Customer</h3>
                  </div>
                  <button
                    type="button"
                    onClick={onSelectCustomer}
                    disabled={isProcessing}
                    className={`text-xs font-medium ${
                      isDarkMode ? 'text-primary-300 hover:text-primary-200' : 'text-primary-600 hover:text-primary-700'
                    } ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {selectedCustomerId ? 'Change' : 'Choose saved'}
                  </button>
                </div>

                {selectedCustomerId ? (
                  <div className={`rounded-xl border p-3 ${
                    isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCustomer?.name || customerName || 'Customer'}
                    </div>
                    <div className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {previewEmail || 'No email on file'}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Walk-in customer or full name"
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 ${
                        isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                      disabled={isProcessing}
                    />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@example.com (optional)"
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 ${
                        isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                      disabled={isProcessing}
                    />
                    <div className={`text-[11px] ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {customerCount > 0 ? `${customerCount} saved customers available.` : 'No saved customers available.'}
                    </div>
                  </div>
                )}
              </div>

              <div className={`rounded-xl border p-4 ${
                isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'
              }`}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Method</h3>
                  <button
                    type="button"
                    onClick={onSelectPaymentMethod}
                    disabled={isProcessing}
                    className={`text-xs font-medium ${
                      isDarkMode ? 'text-primary-300 hover:text-primary-200' : 'text-primary-600 hover:text-primary-700'
                    } ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {selectedPaymentMethodId ? 'Change saved' : `Saved (${savedPaymentMethodsCount})`}
                  </button>
                </div>

                {selectedPaymentMethodId ? (
                  <div className={`rounded-xl border p-3 ${
                    isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <PaymentMethodDisplay
                      method={selectedPaymentMethod?.type || paymentMethod}
                      details={getPaymentMethodDetails()}
                      isDarkMode={isDarkMode}
                      compact={false}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {['Cash', 'Card', 'Mobile Money'].map((method) => {
                      const Icon = method === 'Cash' ? Wallet : method === 'Card' ? CreditCard : Smartphone;
                      const active = paymentMethod === method;
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          disabled={isProcessing}
                          className={`rounded-xl border px-2 py-3 text-center transition ${
                            active
                              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                              : isDarkMode
                                ? 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                          } ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                          <Icon className="mx-auto h-4 w-4" />
                          <span className="mt-1 block text-[11px] font-medium">{method}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className={`rounded-xl border p-4 ${
              isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'
            }`}>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Receipt Template</h3>
                    <div className="flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: templatePalette.primary }} />
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: templatePalette.secondary }} />
                      <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ background: templatePalette.accent }} />
                    </div>
                  </div>
                  <select
                    value={selectedTemplateId || ''}
                    onChange={(e) => onSelectTemplate && onSelectTemplate(e.target.value)}
                    disabled={isProcessing || availableTemplates.length === 0}
                    className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    } ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {availableTemplates.map((template) => {
                      const isLocked = template.hasAccess === false;
                      const label = `${template.name}${isLocked ? ' (Locked)' : ''}`;
                      return (
                        <option key={template.id} value={template.id} disabled={isLocked}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                  <div className={`mt-2 text-[11px] ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Applied to generated PDF and print output.
                  </div>
                </div>

                <div>
                  <label className={`mb-2 block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add internal or customer notes (optional)"
                    className={`h-24 w-full resize-none rounded-xl border px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </section>

            <section className={`overflow-hidden rounded-xl border ${
              isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'
            }`}>
              <div className={`flex items-center justify-between border-b px-4 py-3 ${
                isDarkMode ? 'border-gray-700 bg-gray-800/70' : 'border-gray-200 bg-gray-50'
              }`}>
                <div>
                  <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order Items</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {items.length} line items | {itemUnits} units
                  </p>
                </div>
                <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatMoney(subtotal)}
                </div>
              </div>

              {items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <ShoppingCart className={`mx-auto h-9 w-9 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`mt-3 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Your receipt is empty
                  </p>
                  <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Add products from the catalog to start building the order.
                  </p>
                </div>
              ) : (
                <div className="max-h-[340px] overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b px-4 py-3 last:border-b-0 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className={`truncate text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </div>
                        <div className={`mt-0.5 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatMoney(item.price)} each | SKU: {item.sku || item.id}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`flex items-center rounded-xl border px-1 ${
                          isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className={`rounded-lg p-1.5 ${
                              isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-white'
                            }`}
                            disabled={isProcessing}
                            aria-label={`Decrease ${item.name}`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className={`min-w-[24px] text-center text-sm font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className={`rounded-lg p-1.5 ${
                              isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-white'
                            }`}
                            disabled={isProcessing}
                            aria-label={`Increase ${item.name}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className={`w-20 text-right text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatMoney(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)]">
              <div className={`rounded-xl border p-4 ${
                isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'
              }`}>
                <h3 className={`mb-3 text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Payment Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Subtotal</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Tax (8.5%)</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{formatMoney(tax)}</span>
                  </div>
                  <div className={`mt-2 flex items-center justify-between rounded-xl border px-3 py-2 ${
                    isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total</span>
                    <span className="text-lg font-semibold" style={{ color: templatePalette.primary }}>
                      {formatMoney(total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl border p-4 ${
                isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'
              }`}>
                <h3 className={`mb-3 text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Actions
                </h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={onPrintAndEmail}
                    disabled={isProcessing || items.length === 0 || !canSendEmail}
                    className="flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Print & Email'}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={onPrint}
                      disabled={isProcessing || items.length === 0}
                      className={`flex items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <Printer className="mr-1.5 h-4 w-4" />
                      Print
                    </button>
                    <button
                      type="button"
                      onClick={onEmailOnly}
                      disabled={isProcessing || items.length === 0 || !canSendEmail}
                      className={`flex items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <Mail className="mr-1.5 h-4 w-4" />
                      Email
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={onClearAll}
                    disabled={isProcessing || items.length === 0}
                    className={`flex w-full items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                      isDarkMode ? 'border-gray-600 text-red-400 hover:bg-red-900/20' : 'border-gray-300 text-red-600 hover:bg-red-50'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Clear Cart
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptPreview;
