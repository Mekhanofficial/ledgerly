import React from 'react';
import templateStorage from '../../../utils/templateStorage';
import { resolveTemplateStyleVariant } from '../../../utils/templateStyleVariants';
import { useAccount } from '../../../context/AccountContext';
import { useTheme } from '../../../context/ThemeContext';

// ----------------------------------------------------------------------
// HELPER FUNCTIONS
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

const resolveTemplate = (template, templateId) => {
  if (template) return template;
  if (templateId) {
    const byId = templateStorage.getTemplate(templateId);
    if (byId) return byId;
  }
  return templateStorage.getTemplate('standard');
};

const buildPalette = (template) => {
  const palette = template?.colors || {};
  return {
    primary: toCssColor(palette.primary, TEMPLATE_COLOR_FALLBACK.primary),
    secondary: toCssColor(palette.secondary, TEMPLATE_COLOR_FALLBACK.secondary),
    accent: toCssColor(palette.accent, TEMPLATE_COLOR_FALLBACK.accent),
    text: toCssColor(palette.text, TEMPLATE_COLOR_FALLBACK.text)
  };
};

// ----------------------------------------------------------------------
// BASE PREVIEW COMPONENTS (for basic templates)
const TemplatePreviewBase = ({ template, templateId, variant = 'card', className = '' }) => {
  const resolvedTemplate = resolveTemplate(template, templateId);
  const palette = buildPalette(resolvedTemplate);
  const isCompact = variant !== 'fullscreen';
  const metaText = isCompact ? 'text-[8px]' : 'text-[10px]';
  const bodyText = isCompact ? 'text-[9px]' : 'text-xs';
  const titleText = isCompact ? 'text-sm' : 'text-lg';
  const rows = isCompact
    ? [
        { item: 'Design Retainer', price: '$850', qty: '1', total: '$850' },
        { item: 'Consulting', price: '$650', qty: '1', total: '$650' }
      ]
    : [
        { item: 'Design Retainer', price: '$850', qty: '1', total: '$850' },
        { item: 'Consulting Support', price: '$650', qty: '1', total: '$650' },
        { item: 'Brand Assets', price: '$850', qty: '1', total: '$850' }
      ];

  return (
    <div
      className={`h-full w-full rounded-lg overflow-hidden border relative ${className}`}
      style={{ borderColor: palette.primary, background: palette.accent, color: palette.text }}
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: palette.primary }} />
      <div className={`relative z-10 flex flex-col h-full ${isCompact ? 'p-3' : 'p-6'}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className={`${metaText} uppercase tracking-[0.25em]`} style={{ color: palette.secondary }}>
              Invoice
            </div>
            <div className={`${titleText} font-semibold`} style={{ color: palette.primary }}>
              {resolvedTemplate?.name || 'Template'}
            </div>
            <div className={`${bodyText} text-slate-500`}>Ledgerly Studio</div>
          </div>
          <div className="text-right">
            <div className={`${metaText} text-slate-400`}>Invoice #</div>
            <div className={`${bodyText} font-medium`}>INV-2026-004</div>
            <div className={`${metaText} text-slate-400 mt-1`}>Due</div>
            <div className={`${bodyText}`}>Feb 15, 2026</div>
          </div>
        </div>

        <div className={`${isCompact ? 'mt-2' : 'mt-3'} grid grid-cols-2 gap-2 ${bodyText}`}>
          <div>
            <div className="font-semibold" style={{ color: palette.primary }}>Bill To</div>
            <div>Alex Morgan</div>
            <div>New York, NY</div>
          </div>
          <div className="text-right">
            <div className="font-semibold" style={{ color: palette.primary }}>From</div>
            <div>Ledgerly Inc.</div>
            <div>billing@ledgerly.com</div>
          </div>
        </div>

        <div
          className={`${isCompact ? 'mt-2' : 'mt-3'} rounded-md overflow-hidden border`}
          style={{ borderColor: palette.secondary, background: 'rgba(255,255,255,0.9)' }}
        >
          <div className={`grid grid-cols-4 ${metaText} font-semibold`} style={{ background: palette.primary, color: 'white' }}>
            <div className="px-2 py-1">Item</div>
            <div className="px-2 py-1 text-center">Price</div>
            <div className="px-2 py-1 text-center">Qty</div>
            <div className="px-2 py-1 text-right">Total</div>
          </div>
          <div>
            {rows.map((row, index) => (
              <div
                key={row.item}
                className={`grid grid-cols-4 ${bodyText} border-t`}
                style={{
                  borderColor: palette.secondary,
                  background: index % 2 === 0 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)'
                }}
              >
                <div className="px-2 py-1">{row.item}</div>
                <div className="px-2 py-1 text-center">{row.price}</div>
                <div className="px-2 py-1 text-center">{row.qty}</div>
                <div className="px-2 py-1 text-right">{row.total}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-2 flex items-end justify-between">
          <div className={`${metaText} uppercase tracking-[0.2em]`} style={{ color: palette.secondary }}>
            Total
          </div>
          <div className={`${titleText} font-bold`} style={{ color: palette.primary }}>
            $2,538
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// PREMIUM GENERIC BASE (for templates without dedicated component)
const PremiumTemplatePreviewBase = ({
  template,
  templateId,
  variant = 'card',
  className = '',
  styleVariant = 'wave'
}) => {
  const resolvedTemplate = resolveTemplate(template, templateId);
  const palette = buildPalette(resolvedTemplate);
  const isCompact = variant !== 'fullscreen';
  const headerHeight = isCompact ? 38 : 64;
  const footerHeight = isCompact ? 30 : 50;
  const titleSize = isCompact ? 'text-sm' : 'text-lg';
  const labelSize = isCompact ? 'text-[8px]' : 'text-[10px]';
  const valueSize = isCompact ? 'text-[9px]' : 'text-[11px]';
  const tableText = isCompact ? 'text-[8px]' : 'text-[10px]';
  const panelPadding = isCompact ? 'p-2' : 'p-3';
  const rows = isCompact
    ? [
        { item: 'Design Retainer', price: '$850', qty: '1', total: '$850' },
        { item: 'Consulting', price: '$650', qty: '1', total: '$650' }
      ]
    : [
        { item: 'Design Retainer', price: '$850', qty: '1', total: '$850' },
        { item: 'Consulting Support', price: '$650', qty: '1', total: '$650' },
        { item: 'Brand Assets', price: '$850', qty: '1', total: '$850' }
      ];

  const renderBackground = () => {
    if (styleVariant === 'panel') {
      return (
        <>
          <div
            className="absolute top-0 left-0 w-full"
            style={{
              height: headerHeight,
              background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 100%)`
            }}
          />
          <svg
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
            className="absolute left-0 w-full"
            style={{ top: headerHeight - (isCompact ? 10 : 16), height: isCompact ? 18 : 28 }}
          >
            <path d="M0,0 H100 V10 Q70,20 0,14 Z" fill={palette.accent} />
          </svg>
          <div
            className="absolute bottom-0 left-0"
            style={{
              width: '45%',
              height: footerHeight,
              background: palette.primary
            }}
          />
        </>
      );
    }

    if (styleVariant === 'stripe') {
      return (
        <>
          <div
            className="absolute top-0 left-0 w-full"
            style={{
              height: headerHeight,
              backgroundImage: `repeating-linear-gradient(135deg, ${palette.primary}, ${palette.primary} 10px, ${palette.secondary} 10px, ${palette.secondary} 20px)`
            }}
          />
          <div
            className="absolute bottom-0 right-0"
            style={{
              width: '70%',
              height: footerHeight,
              background: `linear-gradient(135deg, ${palette.secondary} 0%, ${palette.primary} 100%)`
            }}
          />
          <div
            className="absolute bottom-0 left-0"
            style={{
              width: '30%',
              height: Math.max(16, footerHeight - 10),
              background: palette.primary,
              transform: 'skewX(-18deg)',
              transformOrigin: 'left bottom'
            }}
          />
        </>
      );
    }

    if (styleVariant === 'angled') {
      return (
        <>
          <div
            className="absolute -top-6 left-0"
            style={{
              width: '70%',
              height: headerHeight + 10,
              background: palette.primary,
              transform: 'skewX(-15deg)'
            }}
          />
          <div
            className="absolute top-4 left-[45%]"
            style={{
              width: '60%',
              height: headerHeight - 10,
              background: palette.secondary,
              transform: 'skewX(-15deg)'
            }}
          />
          <div
            className="absolute bottom-0 right-0"
            style={{
              width: '55%',
              height: footerHeight,
              background: palette.primary
            }}
          />
        </>
      );
    }

    return (
      <>
        <svg
          viewBox="0 0 100 25"
          preserveAspectRatio="none"
          className="absolute top-0 left-0 w-full"
          style={{ height: headerHeight }}
        >
          <path d="M0,0 H100 V16 Q70,26 0,18 Z" fill={palette.primary} />
          <path d="M0,0 H100 V12 Q70,22 0,16 Z" fill={palette.secondary} opacity="0.9" />
        </svg>
        <svg
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full"
          style={{ height: footerHeight }}
        >
          <path d="M0,30 H100 V12 Q70,2 0,10 Z" fill={palette.primary} opacity="0.95" />
          <path d="M0,30 H100 V18 Q80,8 0,14 Z" fill={palette.secondary} opacity="0.85" />
        </svg>
      </>
    );
  };

  return (
    <div
      className={`h-full w-full rounded-lg overflow-hidden border relative ${className}`}
      style={{ borderColor: palette.primary, background: palette.accent, color: palette.text }}
    >
      <div className="absolute inset-0 pointer-events-none">{renderBackground()}</div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0))' }}
      />
      <div className={`relative z-10 flex flex-col h-full ${isCompact ? 'p-3' : 'p-5'}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className={`${labelSize} uppercase tracking-[0.3em]`} style={{ color: 'rgba(255,255,255,0.85)' }}>
              {resolvedTemplate?.name || 'Premium'} Studio
            </div>
            <div
              className={`${titleSize} font-semibold`}
              style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.25)' }}
            >
              Premium Invoice
            </div>
          </div>
          <div className="text-right">
            <div
              className={`${titleSize} font-bold`}
              style={{ color: 'white', letterSpacing: '0.2em', textShadow: '0 2px 4px rgba(0,0,0,0.25)' }}
            >
              INVOICE
            </div>
            <div className={`${labelSize}`} style={{ color: 'rgba(255,255,255,0.8)' }}>
              #INV-2026-004
            </div>
          </div>
        </div>

        <div className={`${isCompact ? 'mt-2' : 'mt-3'} grid grid-cols-2 gap-2`}>
          <div className={`${panelPadding} rounded-md shadow-sm`} style={{ background: 'rgba(255,255,255,0.92)' }}>
            <div className={`${labelSize} uppercase tracking-wide text-slate-400`}>Invoice To</div>
            <div className={`${valueSize} font-semibold`} style={{ color: palette.primary }}>Alex Morgan</div>
            <div className={`${valueSize} text-slate-600`}>New York, NY</div>
          </div>
          <div className={`${panelPadding} rounded-md shadow-sm text-right`} style={{ background: 'rgba(255,255,255,0.92)' }}>
            <div className={`${labelSize} uppercase tracking-wide text-slate-400`}>Details</div>
            <div className={`${valueSize}`}>Invoice # 52148</div>
            <div className={`${valueSize}`}>Date 02/11/2026</div>
          </div>
        </div>

        <div className={`${isCompact ? 'mt-2' : 'mt-3'} rounded-md overflow-hidden shadow-sm border`} style={{ borderColor: 'rgba(255,255,255,0.65)' }}>
          <div
            className={`grid grid-cols-4 ${tableText} font-semibold`}
            style={{ background: palette.primary, color: 'white' }}
          >
            <div className="px-2 py-1">Item</div>
            <div className="px-2 py-1 text-center">Price</div>
            <div className="px-2 py-1 text-center">Qty</div>
            <div className="px-2 py-1 text-right">Total</div>
          </div>
          <div>
            {rows.map((row, index) => (
              <div
                key={row.item}
                className={`grid grid-cols-4 ${tableText} border-t`}
                style={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  background: index % 2 === 0 ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.82)'
                }}
              >
                <div className="px-2 py-1">{row.item}</div>
                <div className="px-2 py-1 text-center">{row.price}</div>
                <div className="px-2 py-1 text-center">{row.qty}</div>
                <div className="px-2 py-1 text-right">{row.total}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-2 flex items-end justify-between">
          <div className={`${labelSize}`} style={{ color: 'rgba(255,255,255,0.8)' }}>
            Thank you for your business
          </div>
          <div
            className={`${panelPadding} rounded-md text-right`}
            style={{ background: palette.primary, color: 'white', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
          >
            <div className={`${labelSize} uppercase tracking-wide opacity-80`}>Total</div>
            <div className={`${titleSize} font-bold`}>$2,538</div>
            <div className={`${labelSize} opacity-80`}>Subtotal $2,350 | Tax $188</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// DEDICATED PREVIEW COMPONENTS – 7 NEW PREMIUM TEMPLATES

const ProfessionalClassicPreview = ({ variant = 'card', className = '' }) => {
  const isCompact = variant !== 'fullscreen';
  const { accountInfo } = useAccount();
  const companyName = accountInfo?.companyName || 'East Repair Inc.';
  const address = accountInfo?.address || '1912 Harvest Lane, New York, NY 12210';

  return (
    <div className={`h-full w-full bg-white rounded-lg overflow-hidden border border-gray-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] ${className}`}>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-700 to-slate-600" />
      <div className={`relative z-10 flex flex-col h-full ${isCompact ? 'p-3' : 'p-6'}`}>
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className={`${isCompact ? 'text-sm' : 'text-xl'} font-bold text-slate-800`}>{companyName}</div>
            <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} text-slate-500`}>{address}</div>
          </div>
          <div className="text-right">
            <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} uppercase text-slate-400`}>Invoice #</div>
            <div className={`${isCompact ? 'text-[10px]' : 'text-sm'} font-mono text-slate-800`}>US-001</div>
          </div>
        </div>
        {/* Bill To / Ship To */}
        <div className={`grid grid-cols-2 gap-2 ${isCompact ? 'mt-2 text-[9px]' : 'mt-4 text-sm'}`}>
          <div>
            <span className="font-semibold">Bill To</span><br />
            John Smith<br />
            2 Court Square, NY
          </div>
          <div>
            <span className="font-semibold">Ship To</span><br />
            John Smith<br />
            3787 Pineview Dr, MA
          </div>
        </div>
        {/* Table */}
        <div className={`${isCompact ? 'mt-2' : 'mt-4'} overflow-x-auto`}>
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100">
              <tr className={`${isCompact ? 'text-[8px]' : 'text-xs'} text-slate-700`}>
                <th className="py-1 px-1">Qty</th>
                <th className="py-1 px-1">Description</th>
                <th className="py-1 px-1 text-right">Unit Price</th>
                <th className="py-1 px-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className={`${isCompact ? 'text-[8px]' : 'text-xs'} border-b border-gray-200`}>
                <td className="py-1 px-1">1</td>
                <td className="py-1 px-1">Front and rear brake cables</td>
                <td className="py-1 px-1 text-right">$100.00</td>
                <td className="py-1 px-1 text-right">$100.00</td>
              </tr>
              <tr className={`${isCompact ? 'text-[8px]' : 'text-xs'}`}>
                <td className="py-1 px-1">2</td>
                <td className="py-1 px-1">New set of pedal arms</td>
                <td className="py-1 px-1 text-right">$15.00</td>
                <td className="py-1 px-1 text-right">$30.00</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Totals */}
        <div className="mt-auto pt-2">
          <div className="flex justify-end">
            <div className={`${isCompact ? 'w-1/2' : 'w-1/3'} space-y-1`}>
              <div className="flex justify-between text-[8px] sm:text-xs">
                <span>Subtotal</span>
                <span>$145.00</span>
              </div>
              <div className="flex justify-between text-[8px] sm:text-xs">
                <span>Sales Tax 6.25%</span>
                <span>$9.06</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 border-t border-slate-300 pt-1 text-[9px] sm:text-sm">
                <span>Invoice Total</span>
                <span>$154.06</span>
              </div>
            </div>
          </div>
        </div>
        {/* Terms */}
        <div className={`${isCompact ? 'text-[7px]' : 'text-xs'} text-slate-500 pt-2 border-t border-gray-200 mt-2`}>
          Terms & Conditions – Payment is due within 15 days
        </div>
      </div>
    </div>
  );
};

const ModernCorporatePreview = ({ variant = 'card', className = '' }) => {
  const isCompact = variant !== 'fullscreen';
  return (
    <div className={`h-full w-full bg-white rounded-lg overflow-hidden border border-blue-200 shadow-lg ${className}`}>
      {/* Brand bar */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-3 text-white">
        <div className={`${isCompact ? 'text-sm' : 'text-xl'} font-bold`}>Brand Name</div>
        <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} italic opacity-90`}>TAGLINE SPACE HERE</div>
      </div>
      <div className={`relative z-10 flex flex-col h-full ${isCompact ? 'p-3' : 'p-5'}`}>
        <div className="flex justify-between items-start">
          <div>
            <div className={`${isCompact ? 'text-[9px]' : 'text-sm'} uppercase tracking-wider text-blue-700 font-semibold`}>INVOICE</div>
            <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} text-gray-600`}>Invoice# 52148 • Date 01/02/2020</div>
          </div>
        </div>
        <div className={`${isCompact ? 'mt-2 text-[8px]' : 'mt-4 text-sm'} grid grid-cols-2 gap-2`}>
          <div>
            <span className="font-bold">Invoice to:</span><br />
            Dwyane Clark<br />
            24 Dummy Street, Lorem Ipsum
          </div>
          <div className="text-right">
            <div className="font-semibold">Payment Info:</div>
            <div className="text-gray-600">Account #: 123456789012</div>
          </div>
        </div>
        {/* Table with colored header */}
        <div className={`${isCompact ? 'mt-2' : 'mt-4'} overflow-x-auto`}>
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-700 text-white">
              <tr className={`${isCompact ? 'text-[8px]' : 'text-xs'}`}>
                <th className="py-1 px-1">Item Description</th>
                <th className="py-1 px-1 text-right">Price</th>
                <th className="py-1 px-1 text-center">Qty</th>
                <th className="py-1 px-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-1 px-1 text-[8px]">Lorem Ipsum Dolor</td>
                <td className="py-1 px-1 text-right text-[8px]">$50.00</td>
                <td className="py-1 px-1 text-center text-[8px]">1</td>
                <td className="py-1 px-1 text-right text-[8px]">$50.00</td>
              </tr>
              <tr>
                <td className="py-1 px-1 text-[8px]">Pellentesque id neque</td>
                <td className="py-1 px-1 text-right text-[8px]">$20.00</td>
                <td className="py-1 px-1 text-center text-[8px]">3</td>
                <td className="py-1 px-1 text-right text-[8px]">$60.00</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-auto pt-2 flex justify-between items-end">
          <div className={`${isCompact ? 'text-[7px]' : 'text-xs'}`}>Thank you for your business</div>
          <div className="text-right">
            <div className={`${isCompact ? 'text-[8px]' : 'text-xs'}`}>Total: <span className="font-bold text-blue-700">$220.00</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CleanBillingPreview = ({ variant = 'card', className = '' }) => {
  const isCompact = variant !== 'fullscreen';
  return (
    <div className={`h-full w-full bg-slate-50 rounded-lg border border-slate-200 ${className}`}>
      <div className={`relative z-10 flex flex-col h-full ${isCompact ? 'p-3' : 'p-6'}`}>
        <div className="text-center border-b border-slate-300 pb-2">
          <div className={`${isCompact ? 'text-sm' : 'text-xl'} font-light text-slate-700`}>COMPANY NAME</div>
          <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} text-slate-500 italic`}>Tagline Goes Here</div>
          <div className={`${isCompact ? 'text-[9px]' : 'text-sm'} font-semibold text-slate-600 mt-1`}>INVOICE</div>
        </div>
        <div className="flex justify-between mt-2 text-[8px] sm:text-xs">
          <div>
            <span className="font-medium">Invoice#</span> 0000000<br />
            <span className="font-medium">Date</span> 31/01/2050
          </div>
          <div className="text-right">
            <span className="font-medium">Invoice To:</span><br />
            John Smith
          </div>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-[8px] sm:text-xs">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="text-left py-1">SL.</th>
                <th className="text-left py-1">Product Description</th>
                <th className="text-right py-1">Price</th>
                <th className="text-right py-1">Qty</th>
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="py-0.5">01.</td><td className="py-0.5">Product No 01</td><td className="py-0.5 text-right">$20.00</td><td className="py-0.5 text-right">2</td><td className="py-0.5 text-right">$40.00</td></tr>
              <tr><td className="py-0.5">02.</td><td className="py-0.5">Product No 02</td><td className="py-0.5 text-right">$10.00</td><td className="py-0.5 text-right">8</td><td className="py-0.5 text-right">$80.00</td></tr>
            </tbody>
          </table>
        </div>
        <div className="mt-auto pt-2 border-t border-slate-300 flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between text-[8px] sm:text-xs"><span>Sub Total</span><span>$1512.00</span></div>
            <div className="flex justify-between text-[8px] sm:text-xs"><span>Tax</span><span>00%</span></div>
            <div className="flex justify-between font-bold text-slate-700 mt-1"><span>Total</span><span>$1512.00</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RetailReceiptPreview = ({ variant = 'card', className = '' }) => {
  const isCompact = variant !== 'fullscreen';
  return (
    <div className={`h-full w-full bg-white rounded-lg border border-teal-200 ${className}`}>
      <div className="bg-teal-600 text-white p-2">
        <div className={`${isCompact ? 'text-sm' : 'text-lg'} font-bold`}>INVOICE</div>
        <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} flex justify-between`}>
          <span>Bill To: ClientNameHere</span>
          <span>InvoiceNo: 414521011</span>
        </div>
      </div>
      <div className={`${isCompact ? 'p-2' : 'p-4'}`}>
        <div className="grid grid-cols-2 gap-2 text-[8px] sm:text-xs">
          <div>Phone: 123-456-7890</div>
          <div className="text-right">Date: 01/10/2050</div>
        </div>
        <div className="text-[8px] sm:text-xs mb-1">Website: Yourwebsitegoeshere</div>
        <table className="w-full mt-2 text-[8px] sm:text-xs">
          <thead className="bg-teal-50">
            <tr><th className="text-left">Item</th><th className="text-right">Price</th><th className="text-right">Qty</th><th className="text-right">Total</th></tr>
          </thead>
          <tbody>
            <tr><td>StoryBook</td><td className="text-right">$000.00</td><td className="text-right">00</td><td className="text-right">$000.00</td></tr>
            <tr><td>Note Book</td><td className="text-right">$000.00</td><td className="text-right">00</td><td className="text-right">$000.00</td></tr>
          </tbody>
        </table>
        <div className="mt-2 text-right">
          <div className="font-bold">Grand Total: $000.00</div>
          <div className="text-[7px]">Thank You For Your Business</div>
        </div>
      </div>
    </div>
  );
};

const SimpleElegantPreview = ({ variant = 'card', className = '' }) => {
  const isCompact = variant !== 'fullscreen';
  return (
    <div className={`h-full w-full bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className={`relative z-10 flex flex-col h-full ${isCompact ? 'p-3' : 'p-6'} text-center`}>
        <div className={`${isCompact ? 'text-lg' : 'text-2xl'} font-serif font-bold text-gray-800 border-b border-gray-300 pb-2`}>BRANDNAME</div>
        <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} text-gray-500 italic mt-1`}>SLOGAN HERE</div>
        <div className={`${isCompact ? 'text-sm' : 'text-xl'} font-serif mt-2`}>INVOICE</div>
        <div className="flex justify-center space-x-4 mt-2 text-[8px] sm:text-xs">
          <span>Invoice: 00000</span>
          <span>Date: 01/01/2050</span>
        </div>
        <div className="mt-3 text-left">
          <table className="w-full text-[8px] sm:text-xs">
            <thead><tr className="border-b"><th className="text-left">Item Description</th><th className="text-right">Price</th><th className="text-right">Qty</th><th className="text-right">Total</th></tr></thead>
            <tbody>
              <tr><td>Lorem Ipsum</td><td className="text-right">$30.00</td><td className="text-right">3</td><td className="text-right">$90.00</td></tr>
              <tr><td>Simply dummy</td><td className="text-right">$45.00</td><td className="text-right">6</td><td className="text-right">$270.00</td></tr>
            </tbody>
          </table>
        </div>
        <div className="mt-auto pt-2 border-t border-gray-300 text-right">
          <div className="text-[8px] sm:text-xs">Sub Total: $1685.00</div>
          <div className="font-bold">Total: $1685.00</div>
          <div className="text-[7px] text-gray-500 mt-1">Authorized Signature</div>
        </div>
      </div>
    </div>
  );
};

const UrbanEdgePreview = ({ variant = 'card', className = '' }) => {
  const isCompact = variant !== 'fullscreen';
  return (
    <div className={`h-full w-full bg-white rounded-lg overflow-hidden relative ${className}`}>
      {/* Asymmetric color blocks */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-600" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-orange-600" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}></div>
      <div className={`relative z-10 flex flex-col h-full ${isCompact ? 'p-3' : 'p-5'}`}>
        <div className="flex justify-between items-start">
          <div className={`${isCompact ? 'text-sm' : 'text-xl'} font-bold text-amber-700`}>BRAND</div>
          <div className="text-right">
            <div className="text-[8px] uppercase tracking-wider text-amber-600">Invoice</div>
            <div className="text-[10px] font-mono">#INV-2026</div>
          </div>
        </div>
        <div className={`${isCompact ? 'mt-2' : 'mt-4'} grid grid-cols-2 gap-2 text-[8px] sm:text-xs`}>
          <div>
            <span className="font-bold">Invoice to MIRJA KHAN</span>
          </div>
          <div className="text-right">
            <div>Date: ../../....</div>
            <div>Invoice No: ......</div>
          </div>
        </div>
        <table className="w-full mt-2 text-[8px] sm:text-xs">
          <thead><tr className="border-b-2 border-amber-500"><th className="text-left">ITEM NAME</th><th className="text-right">PRICE</th><th className="text-right">QTY</th><th className="text-right">TOTAL</th></tr></thead>
          <tbody>
            <tr><td>Lorem ipsum dolor sit amet</td><td className="text-right">$25.00</td><td className="text-right">2</td><td className="text-right">$50.00</td></tr>
            <tr><td>Lorem ipsum dolor</td><td className="text-right">$28.00</td><td className="text-right">1</td><td className="text-right">$28.00</td></tr>
          </tbody>
        </table>
        <div className="mt-auto pt-2 border-t border-amber-200 flex justify-between">
          <div className="text-[7px]">Terms: Lorem ipsum dolor sit amet...</div>
          <div className="text-right">
            <div className="font-bold text-amber-700">Total $196.40</div>
            <div className="text-[7px]">Signature _________</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreativeFlowPreview = ({ variant = 'card', className = '' }) => {
  const isCompact = variant !== 'fullscreen';
  return (
    <div className={`h-full w-full bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg overflow-hidden relative ${className}`}>
      {/* Wave separator */}
      <svg className="absolute top-0 left-0 w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 25">
        <path d="M0,25 Q25,0 50,25 T100,25" fill="rgba(147,51,234,0.2)" />
      </svg>
      <div className={`relative z-10 flex flex-col h-full ${isCompact ? 'p-3' : 'p-5'}`}>
        <div className="text-center">
          <div className={`${isCompact ? 'text-lg' : 'text-2xl'} font-bold text-purple-700`}>INVOICE</div>
          <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} text-purple-500`}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
        </div>
        <div className="flex justify-between mt-2 text-[8px] sm:text-xs">
          <div><span className="font-semibold">Invoice to:</span> MIRJA KHAN</div>
          <div>Invoice No: ......</div>
        </div>
        <table className="w-full mt-2 text-[8px] sm:text-xs">
          <thead><tr className="border-b border-purple-300"><th className="text-left">ITEM NAME</th><th className="text-right">PRICE</th><th className="text-right">QTY</th><th className="text-right">TOTAL</th></tr></thead>
          <tbody>
            <tr><td>Lorem ipsum dolor sit amet</td><td className="text-right">$25.00</td><td className="text-right">2</td><td className="text-right">$50.00</td></tr>
            <tr><td>Lorem ipsum dolor</td><td className="text-right">$28.00</td><td className="text-right">1</td><td className="text-right">$28.00</td></tr>
          </tbody>
        </table>
        <div className="mt-auto pt-2 flex justify-between items-end">
          <div className="text-[7px]">Terms and Conditions: Lorem ipsum...</div>
          <div className="text-right">
            <div className="text-[8px]">Sub Total $196.40</div>
            <div className="font-bold text-purple-700">Total $196.40</div>
            <div className="text-[7px]">Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== 5 ULTRA-PREMIUM PREVIEW COMPONENTS ==========

const GlassmorphicPreview = ({ variant = 'card', className = '' }) => {
  const isCompact = variant !== 'fullscreen';
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`
        h-full w-full rounded-2xl overflow-hidden relative
        ${isDarkMode ? 'bg-gray-900/40 backdrop-blur-xl border border-white/20' : 'bg-white/40 backdrop-blur-xl border border-white/30'}
        shadow-[0_8px_32px_rgba(0,0,0,0.08)]
        ${className}
      `}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className={`relative z-10 flex flex-col h-full ${isCompact ? 'p-3' : 'p-6'}`}>
        <div
          className={`
            rounded-xl p-3 mb-4
            ${isDarkMode ? 'bg-gray-800/60' : 'bg-white/60'}
            backdrop-blur-md border border-white/30
            shadow-lg
          `}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className={`${isCompact ? 'text-sm' : 'text-xl'} font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
                {isCompact ? 'Brand' : 'Glassmorphic Co.'}
              </div>
              <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} text-gray-600 dark:text-gray-300`}>
                hello@glass.co - +1 (800) 555-0199
              </div>
            </div>
            <div className="text-right">
              <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} uppercase tracking-wider text-indigo-500 font-semibold`}>
                INVOICE
              </div>
              <div className={`${isCompact ? 'text-[9px]' : 'text-sm'} font-mono`}>
                #GL-2026-042
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className={`
              rounded-lg p-2
              ${isDarkMode ? 'bg-gray-800/40' : 'bg-white/40'}
              backdrop-blur-sm border border-white/20
            `}
          >
            <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} font-semibold opacity-70`}>Bill To</div>
            <div className={`${isCompact ? 'text-[9px]' : 'text-sm'} font-medium`}>Alex Rivera</div>
            <div className={`${isCompact ? 'text-[7px]' : 'text-xs'} opacity-70`}>alex@creativestudio.io</div>
          </div>
          <div
            className={`
              rounded-lg p-2
              ${isDarkMode ? 'bg-gray-800/40' : 'bg-white/40'}
              backdrop-blur-sm border border-white/20
            `}
          >
            <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} font-semibold opacity-70`}>Due Date</div>
            <div className={`${isCompact ? 'text-[9px]' : 'text-sm'} font-medium`}>Mar 15, 2026</div>
            <div className={`${isCompact ? 'text-[7px]' : 'text-xs'} opacity-70`}>Net 15</div>
          </div>
        </div>

        <div className="flex-1">
          <div
            className={`
              rounded-xl overflow-hidden
              backdrop-blur-md border border-white/30
              ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/30'}
            `}
          >
            <table className="w-full text-[8px] sm:text-xs">
              <thead className="border-b border-white/30">
                <tr>
                  <th className="py-2 px-2 text-left font-semibold">Item</th>
                  <th className="py-2 px-2 text-right font-semibold">Qty</th>
                  <th className="py-2 px-2 text-right font-semibold">Price</th>
                  <th className="py-2 px-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-2 px-2">UI/UX Design</td>
                  <td className="py-2 px-2 text-right">2</td>
                  <td className="py-2 px-2 text-right">$850</td>
                  <td className="py-2 px-2 text-right">$1,700</td>
                </tr>
                <tr>
                  <td className="py-2 px-2">Development</td>
                  <td className="py-2 px-2 text-right">1</td>
                  <td className="py-2 px-2 text-right">$2,400</td>
                  <td className="py-2 px-2 text-right">$2,400</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          className={`
            mt-4 rounded-xl p-3
            ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}
            backdrop-blur-md border border-white/30
            flex justify-between items-center
          `}
        >
          <span className={`${isCompact ? 'text-xs' : 'text-base'} font-semibold`}>Total</span>
          <span className={`${isCompact ? 'text-sm' : 'text-lg'} font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
            $4,100.00
          </span>
        </div>

        <div className={`mt-3 text-[7px] text-center opacity-60 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          * 30-day money-back guarantee *
        </div>
      </div>
    </div>
  );
};

const NeoBrutalistPreview = ({ variant = 'card', className = '' }) => {
  const isCompact = variant !== 'fullscreen';
  return (
    <div className={`h-full w-full bg-white border-4 border-black rounded-none overflow-hidden relative ${className}`}>
      <div className="absolute top-0 left-0 w-24 h-24 bg-red-500 -rotate-12 -translate-x-6 -translate-y-6" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-400 rotate-45 translate-x-12 translate-y-12" />

      <div className={`relative z-10 flex flex-col h-full ${isCompact ? 'p-3' : 'p-5'}`}>
        <div className="flex justify-between items-start border-b-4 border-black pb-2">
          <div>
            <div className={`${isCompact ? 'text-2xl' : 'text-4xl'} font-black uppercase tracking-tighter`}>
              BRUTAL
            </div>
            <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} font-mono uppercase`}>
              invoice #NV-2049
            </div>
          </div>
          <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-bold bg-black text-white px-2 py-1`}>
            DUE: 03/01
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-mono uppercase">Client</div>
            <div className="text-sm font-bold">RADIO.CO</div>
            <div className="text-xs">ATTN: Jamie Chen</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono uppercase">Total</div>
            <div className="text-xl font-black">$6,200</div>
          </div>
        </div>

        <div className="mt-4 flex-1">
          <div className="flex justify-between font-mono text-xs border-t-2 border-black pt-2">
            <span className="w-1/12">QTY</span>
            <span className="w-6/12">DESCRIPTION</span>
            <span className="w-2/12 text-right">PRICE</span>
            <span className="w-3/12 text-right">TOTAL</span>
          </div>
          <div className="flex justify-between font-mono text-xs mt-2">
            <span className="w-1/12">2</span>
            <span className="w-6/12">Brand identity system</span>
            <span className="w-2/12 text-right">$1,800</span>
            <span className="w-3/12 text-right">$3,600</span>
          </div>
          <div className="flex justify-between font-mono text-xs mt-1">
            <span className="w-1/12">1</span>
            <span className="w-6/12">Webflow development</span>
            <span className="w-2/12 text-right">$2,600</span>
            <span className="w-3/12 text-right">$2,600</span>
          </div>
        </div>

        <div className="mt-4 border-t-4 border-black pt-2 flex justify-between items-center">
          <div className="text-xs font-mono">TERMS: NET 15 - 5% LATE FEE</div>
          <div className="text-xs bg-black text-white px-2 py-1">APPROVED</div>
        </div>
      </div>
    </div>
  );
};

const HolographicPreview = ({ variant = 'card', className = '' }) => {
  const isCompact = variant !== 'fullscreen';
  return (
    <div
      className={`
        h-full w-full rounded-lg overflow-hidden relative
        bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500
        ${className}
      `}
    >
      <div
        className={`
          absolute inset-0
          bg-[url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)" opacity="0.12"/%3E%3C/svg%3E')]
          opacity-30 mix-blend-overlay
        `}
      />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-white/80 via-yellow-300/80 to-white/80" />

      <div className="relative z-10 flex flex-col h-full text-white p-5 backdrop-brightness-90">
        <div className="flex justify-between items-start">
          <div>
            <div className={`${isCompact ? 'text-sm' : 'text-xl'} font-bold tracking-wider`}>H O L O</div>
            <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} uppercase opacity-80`}>iridescent invoice</div>
          </div>
          <div className="text-right">
            <div className={`${isCompact ? 'text-[9px]' : 'text-sm'} font-mono`}>#HOLO-042</div>
            <div className={`${isCompact ? 'text-[7px]' : 'text-xs'} opacity-80`}>2026-02-12</div>
          </div>
        </div>

        <div className="mt-6 flex-1">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="backdrop-blur-sm bg-white/10 p-3 rounded-lg border border-white/30">
              <div className="text-[8px] uppercase opacity-70">Client</div>
              <div className="text-sm font-semibold">LUMINA LABS</div>
              <div className="text-[8px]">contact@lumina.io</div>
            </div>
            <div className="backdrop-blur-sm bg-white/10 p-3 rounded-lg border border-white/30">
              <div className="text-[8px] uppercase opacity-70">Amount</div>
              <div className="text-lg font-bold">$9,450</div>
              <div className="text-[8px]">due 03/15</div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/5 rounded-lg border border-white/20 p-3">
            <div className="flex justify-between text-[8px] uppercase border-b border-white/30 pb-1 mb-2">
              <span>Item</span>
              <span>Qty</span>
              <span>Total</span>
            </div>
            <div className="flex justify-between text-[9px] mb-1">
              <span>Holographic branding</span>
              <span>1</span>
              <span>$5,200</span>
            </div>
            <div className="flex justify-between text-[9px]">
              <span>3D modeling</span>
              <span>2</span>
              <span>$4,250</span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-right">
          <div className="text-xs opacity-80">Grand Total</div>
          <div className={`${isCompact ? 'text-lg' : 'text-2xl'} font-bold`}>$9,450</div>
        </div>

        <div className="mt-2 text-[7px] text-center opacity-60">
          * METALLIC FINISH *
        </div>
      </div>
    </div>
  );
};

const MinimalistDarkPreview = ({ variant = 'card', className = '' }) => {
  const isCompact = variant !== 'fullscreen';
  return (
    <div className={`h-full w-full bg-gray-950 text-white rounded-lg overflow-hidden border border-gray-800 shadow-[0_0_20px_rgba(0,122,255,0.15)] ${className}`}>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

      <div className={`relative z-10 flex flex-col h-full ${isCompact ? 'p-3' : 'p-6'} font-mono`}>
        <div className="flex justify-between items-start border-b border-gray-800 pb-3">
          <div>
            <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-blue-400`}>$ ./invoice --generate</div>
            <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} text-gray-500`}>[user@dev] ~/billing</div>
          </div>
          <div className="text-right">
            <div className={`${isCompact ? 'text-[9px]' : 'text-xs'} text-blue-400`}>INV-2026-042</div>
            <div className={`${isCompact ? 'text-[8px]' : 'text-[10px]'} text-gray-500`}>2026-02-12</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-[9px] sm:text-xs">
          <div>
            <span className="text-gray-500">CLIENT:</span>
            <span className="ml-2 text-white">STRATOSPHERE.IO</span>
          </div>
          <div className="text-right">
            <span className="text-gray-500">DUE:</span>
            <span className="ml-2 text-white">03/12/2026</span>
          </div>
        </div>

        <div className="mt-4 flex-1">
          <div className="grid grid-cols-12 gap-1 text-[8px] sm:text-[10px] text-gray-500 border-b border-gray-800 pb-1">
            <span className="col-span-1">#</span>
            <span className="col-span-5">DESCRIPTION</span>
            <span className="col-span-2 text-right">QTY</span>
            <span className="col-span-2 text-right">PRICE</span>
            <span className="col-span-2 text-right">AMOUNT</span>
          </div>
          <div className="grid grid-cols-12 gap-1 text-[8px] sm:text-[10px] mt-2">
            <span className="col-span-1 text-gray-400">01</span>
            <span className="col-span-5">Cloud infrastructure</span>
            <span className="col-span-2 text-right">3</span>
            <span className="col-span-2 text-right">$420</span>
            <span className="col-span-2 text-right text-blue-400">$1,260</span>
          </div>
          <div className="grid grid-cols-12 gap-1 text-[8px] sm:text-[10px] mt-1">
            <span className="col-span-1 text-gray-400">02</span>
            <span className="col-span-5">DevOps support</span>
            <span className="col-span-2 text-right">40h</span>
            <span className="col-span-2 text-right">$95</span>
            <span className="col-span-2 text-right text-blue-400">$3,800</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center">
          <span className="text-xs text-gray-500">TOTAL</span>
          <span className="text-sm sm:text-base font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(0,122,255,0.5)]">
            $5,060.00
          </span>
        </div>

        <div className="mt-3 text-[7px] text-gray-600">
          $ echo "Thank you for your business" _
        </div>
      </div>
    </div>
  );
};

const OrganicEcoPreview = ({ variant = 'card', className = '' }) => {
  const isCompact = variant !== 'fullscreen';
  return (
    <div className={`h-full w-full bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl overflow-hidden relative ${className}`}>
      <svg className="absolute bottom-0 left-0 w-full h-24" preserveAspectRatio="none" viewBox="0 0 100 30">
        <path d="M0,30 Q20,20 40,25 T80,20 T100,18 L100,30 Z" fill="rgba(34,197,94,0.15)" />
      </svg>

      <div className="absolute top-2 right-2 text-emerald-600/30 text-xs font-semibold tracking-[0.3em]">LEAF</div>

      <div className={`relative z-10 flex flex-col h-full ${isCompact ? 'p-4' : 'p-6'}`}>
        <div className="flex justify-between items-start">
          <div>
            <div className={`${isCompact ? 'text-lg' : 'text-2xl'} font-serif text-emerald-800`}>EcoBalance</div>
            <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} text-emerald-600`}>sustainable - ethical</div>
          </div>
          <div className="text-right">
            <div className={`${isCompact ? 'text-[9px]' : 'text-sm'} font-serif text-emerald-800`}>INVOICE</div>
            <div className={`${isCompact ? 'text-[8px]' : 'text-xs'} text-emerald-600`}>#ECO-042</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-emerald-200">
            <div className="text-[8px] uppercase text-emerald-700">Bill to</div>
            <div className="text-sm font-medium text-emerald-900">GreenFuture Co.</div>
            <div className="text-xs text-emerald-700">contact@greenfuture.eco</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-emerald-200">
            <div className="text-[8px] uppercase text-emerald-700">Due</div>
            <div className="text-sm font-medium text-emerald-900">Apr 22, 2026</div>
            <div className="text-xs text-emerald-700">Earth Day</div>
          </div>
        </div>

        <div className="mt-5 flex-1">
          <div className="bg-white/40 rounded-2xl p-4 border border-emerald-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-emerald-200 text-emerald-800">
                  <th className="text-left py-1 font-medium">Description</th>
                  <th className="text-right py-1 font-medium">Qty</th>
                  <th className="text-right py-1 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 text-emerald-900">Carbon offset credits</td>
                  <td className="py-2 text-right">50 t</td>
                  <td className="py-2 text-right font-medium">$750.00</td>
                </tr>
                <tr>
                  <td className="py-2 text-emerald-900">Sustainable packaging design</td>
                  <td className="py-2 text-right">1</td>
                  <td className="py-2 text-right font-medium">$1,200.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 bg-emerald-800 text-white rounded-2xl p-4 flex justify-between items-center">
          <span className="text-xs uppercase tracking-wider">Total</span>
          <span className="text-lg font-serif">$1,950.00</span>
        </div>

        <div className="mt-3 text-center text-[8px] text-emerald-700">
          Thank you for supporting a greener future
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// EXISTING PREMIUM TEMPLATE COMPONENTS (keep as-is)
const LuxuryTemplate = (props) => <PremiumTemplatePreviewBase templateId="luxury" {...props} />;
const CorporateProTemplate = (props) => <PremiumTemplatePreviewBase templateId="corporatePro" {...props} />;
const CreativeStudioTemplate = (props) => <PremiumTemplatePreviewBase templateId="creativeStudio" {...props} />;
const TechModernTemplate = (props) => <PremiumTemplatePreviewBase templateId="techModern" {...props} />;
const ElegantTemplate = (props) => <PremiumTemplatePreviewBase templateId="elegant" {...props} />;
const StartupTemplate = (props) => <PremiumTemplatePreviewBase templateId="startup" {...props} />;
const ConsultantTemplate = (props) => <PremiumTemplatePreviewBase templateId="consultant" {...props} />;
const RetailTemplate = (props) => <PremiumTemplatePreviewBase templateId="retail" {...props} />;
const MedicalTemplate = (props) => <PremiumTemplatePreviewBase templateId="medical" {...props} />;
const LegalTemplate = (props) => <PremiumTemplatePreviewBase templateId="legal" {...props} />;

// Basic templates
const StandardTemplate = (props) => <TemplatePreviewBase templateId="standard" {...props} />;
const MinimalTemplate = (props) => <TemplatePreviewBase templateId="minimal" {...props} />;

// ----------------------------------------------------------------------
// TEMPLATE COMPONENTS MAP
const TEMPLATE_COMPONENTS = {
  // Basic
  standard: StandardTemplate,
  minimal: MinimalTemplate,
  // Existing Premium
  luxury: LuxuryTemplate,
  corporatePro: CorporateProTemplate,
  creativeStudio: CreativeStudioTemplate,
  techModern: TechModernTemplate,
  elegant: ElegantTemplate,
  startup: StartupTemplate,
  consultant: ConsultantTemplate,
  retail: RetailTemplate,
  medical: MedicalTemplate,
  legal: LegalTemplate,
  // NEW PREMIUM
  professionalClassic: ProfessionalClassicPreview,
  modernCorporate: ModernCorporatePreview,
  cleanBilling: CleanBillingPreview,
  retailReceipt: RetailReceiptPreview,
  simpleElegant: SimpleElegantPreview,
  urbanEdge: UrbanEdgePreview,
  creativeFlow: CreativeFlowPreview,
  // ULTRA-PREMIUM
  glassmorphic: GlassmorphicPreview,
  neoBrutalist: NeoBrutalistPreview,
  holographic: HolographicPreview,
  minimalistDark: MinimalistDarkPreview,
  organicEco: OrganicEcoPreview
};

// ----------------------------------------------------------------------
// MAIN RENDERER
const TemplatePreviewRenderer = ({ template, templateId, variant = 'card', className = '' }) => {
  const resolvedId = template?.id || templateId;
  const PreviewComponent = resolvedId ? TEMPLATE_COMPONENTS[resolvedId] : null;

  if (PreviewComponent) {
    return <PreviewComponent template={template} variant={variant} className={className} />;
  }

  // Fallback for premium templates without dedicated component
  if (template?.isPremium) {
    return (
      <PremiumTemplatePreviewBase
        template={template}
        templateId={resolvedId}
        variant={variant}
        styleVariant={resolveTemplateStyleVariant(resolvedId, template)}
        className={className}
      />
    );
  }

  return <TemplatePreviewBase template={template} templateId={resolvedId} variant={variant} className={className} />;
};

export default TemplatePreviewRenderer;
