// src/components/invoices/create/LineItemsTable.jsx
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const LineItemsTable = ({
  lineItems,
  updateLineItem,
  removeLineItem,
  addLineItem,
  currency
}) => {
  const handleUpdate = (id, field, value) => {
    if (field === 'tax') return;
    updateLineItem(id, field, value);
  };
  const formatAmount = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
  };

  const inputClassName = 'mt-1 w-full min-h-[48px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-900 placeholder:text-slate-400 caret-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:caret-white';
  const labelClassName = 'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400';

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.3)] dark:border-slate-700/80 dark:bg-slate-900/90 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Line Items
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Add clear item descriptions and keep charges easy to review on any screen.
          </p>
        </div>
        <button
          onClick={addLineItem}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-700 transition hover:border-primary-300 hover:bg-primary-100 sm:w-auto dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/20"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      <div className="space-y-4 md:hidden">
        {lineItems.map((item, index) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-600 dark:text-primary-300">
                  Item {String(index + 1).padStart(2, '0')}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Invoice line details
                </p>
              </div>
              <button
                onClick={() => removeLineItem(item.id)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-500/10"
                disabled={lineItems.length <= 1}
                aria-label={`Remove line item ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className={labelClassName}>Description</label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                className={inputClassName}
                placeholder="Item description"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClassName}>Quantity</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleUpdate(item.id, 'quantity', e.target.value)}
                  className={inputClassName}
                  inputMode="numeric"
                  min="1"
                />
              </div>
              <div>
                <label className={labelClassName}>Rate</label>
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) => handleUpdate(item.id, 'rate', e.target.value)}
                  className={inputClassName}
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <p className={labelClassName}>Tax</p>
                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Uses invoice-wide tax settings
                </p>
              </div>
              <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 dark:border-primary-500/20 dark:bg-primary-500/10">
                <p className={labelClassName}>Amount</p>
                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                  {currency} {formatAmount(item.amount)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-slate-200 dark:divide-slate-700">
            <colgroup>
              <col className="w-[36%]" />
              <col className="w-[16%]" />
              <col className="w-[18%]" />
              <col className="w-[14%]" />
              <col className="w-[10%]" />
              <col className="w-[6%]" />
            </colgroup>
            <thead className="bg-slate-50 dark:bg-slate-800/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                  Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                  Tax
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/90">
              {lineItems.map((item, index) => (
                <tr key={item.id} className="align-middle">
                  <td className="min-w-0 px-4 py-4">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                      className={`${inputClassName} mt-0 min-h-[42px]`}
                      placeholder="Item description"
                      aria-label={`Description for line item ${index + 1}`}
                    />
                  </td>
                  <td className="min-w-0 px-4 py-4">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdate(item.id, 'quantity', e.target.value)}
                      className={`${inputClassName} mt-0 min-h-[48px] min-w-[112px]`}
                      inputMode="numeric"
                      min="1"
                    />
                  </td>
                  <td className="min-w-0 px-4 py-4">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleUpdate(item.id, 'rate', e.target.value)}
                      className={`${inputClassName} mt-0 min-h-[48px] min-w-[128px]`}
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td className="min-w-0 px-4 py-4">
                    <span className="inline-flex max-w-full rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Global rate
                    </span>
                  </td>
                  <td className="min-w-0 px-4 py-4">
                    <span className="block whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-white">
                      {currency} {formatAmount(item.amount)}
                    </span>
                  </td>
                  <td className="min-w-0 px-4 py-4">
                    <button
                      onClick={() => removeLineItem(item.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-500/10"
                      disabled={lineItems.length <= 1}
                      aria-label={`Remove line item ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LineItemsTable;
