import React, { useEffect, useState } from 'react';
import { Calculator, Save, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { fetchTaxSettings, updateTaxSettings } from '../../services/taxSettingsService';
import { isAccessDeniedError } from '../../utils/accessControl';

const defaultState = {
  taxEnabled: true,
  taxName: 'VAT',
  taxRate: 0,
  allowManualOverride: true,
  withholdingEnabled: false,
  withholdingName: 'WHT',
  withholdingRate: 0,
  allowWithholdingOverride: true,
  withholdingBase: 'taxable_amount'
};

const TaxConfigurationSettings = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const [form, setForm] = useState(defaultState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchTaxSettings();
      setForm({
        taxEnabled: data?.taxEnabled ?? true,
        taxName: data?.taxName || 'VAT',
        taxRate: Number.isFinite(Number(data?.taxRate)) ? Number(data.taxRate) : 0,
        allowManualOverride: data?.allowManualOverride ?? true,
        withholdingEnabled: data?.withholdingEnabled ?? false,
        withholdingName: data?.withholdingName || 'WHT',
        withholdingRate: Number.isFinite(Number(data?.withholdingRate)) ? Number(data.withholdingRate) : 0,
        allowWithholdingOverride: data?.allowWithholdingOverride ?? true,
        withholdingBase: data?.withholdingBase || 'taxable_amount'
      });
      setReadOnly(false);
    } catch (error) {
      if (isAccessDeniedError(error)) {
        setReadOnly(true);
        return;
      }
      addToast(error?.response?.data?.error || 'Failed to load tax settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : (name === 'taxRate' || name === 'withholdingRate' ? Number(value) : value)
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        taxEnabled: Boolean(form.taxEnabled),
        taxName: String(form.taxName || 'VAT').trim() || 'VAT',
        taxRate: Math.max(0, Number(form.taxRate || 0)),
        allowManualOverride: Boolean(form.allowManualOverride),
        withholdingEnabled: Boolean(form.withholdingEnabled),
        withholdingName: String(form.withholdingName || 'WHT').trim() || 'WHT',
        withholdingRate: Math.max(0, Number(form.withholdingRate || 0)),
        allowWithholdingOverride: Boolean(form.allowWithholdingOverride),
        withholdingBase: form.withholdingBase === 'gross_total' ? 'gross_total' : 'taxable_amount'
      };
      const updated = await updateTaxSettings(payload);
      setForm({
        taxEnabled: updated?.taxEnabled ?? payload.taxEnabled,
        taxName: updated?.taxName || payload.taxName,
        taxRate: Number(updated?.taxRate ?? payload.taxRate),
        allowManualOverride: updated?.allowManualOverride ?? payload.allowManualOverride,
        withholdingEnabled: updated?.withholdingEnabled ?? payload.withholdingEnabled,
        withholdingName: updated?.withholdingName || payload.withholdingName,
        withholdingRate: Number(updated?.withholdingRate ?? payload.withholdingRate),
        allowWithholdingOverride: updated?.allowWithholdingOverride ?? payload.allowWithholdingOverride,
        withholdingBase: updated?.withholdingBase || payload.withholdingBase
      });
      addToast('Tax configuration updated', 'success');
    } catch (error) {
      if (isAccessDeniedError(error)) {
        addToast('You do not have permission to update tax settings', 'warning');
        setReadOnly(true);
        return;
      }
      addToast(error?.response?.data?.error || 'Failed to update tax settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`border rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className={`w-5 h-5 ${isDarkMode ? 'text-primary-300' : 'text-primary-600'}`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Tax Configuration
            </h3>
          </div>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure default tax name, rate, and override behavior for invoices and receipts.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
            isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading tax settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`flex items-center justify-between rounded-lg border p-4 ${
              isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'
            }`}>
              <div>
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enable Tax</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Apply tax automatically to new invoices and receipts.
                </div>
              </div>
              <input
                type="checkbox"
                name="taxEnabled"
                checked={Boolean(form.taxEnabled)}
                onChange={handleChange}
                disabled={readOnly}
                className="h-4 w-4"
              />
            </label>

            <label className={`flex items-center justify-between rounded-lg border p-4 ${
              isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'
            }`}>
              <div>
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Allow Manual Override</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Let invoice editors change tax rate/amount per invoice.
                </div>
              </div>
              <input
                type="checkbox"
                name="allowManualOverride"
                checked={Boolean(form.allowManualOverride)}
                onChange={handleChange}
                disabled={readOnly}
                className="h-4 w-4"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tax Label
              </label>
              <input
                type="text"
                name="taxName"
                value={form.taxName}
                onChange={handleChange}
                disabled={readOnly}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDarkMode ? 'bg-gray-900/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="VAT / GST / Sales Tax"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                name="taxRate"
                min="0"
                step="0.01"
                value={form.taxRate}
                onChange={handleChange}
                disabled={readOnly}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDarkMode ? 'bg-gray-900/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
            <div className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Withholding Tax
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-center justify-between rounded-lg border p-4 ${
                isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-white'
              }`}>
                <div>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enable WHT</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Deduct withholding from the gross invoice payable.
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="withholdingEnabled"
                  checked={Boolean(form.withholdingEnabled)}
                  onChange={handleChange}
                  disabled={readOnly}
                  className="h-4 w-4"
                />
              </label>

              <label className={`flex items-center justify-between rounded-lg border p-4 ${
                isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-white'
              }`}>
                <div>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Allow WHT Override</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Let invoice editors override the WHT rate or amount per invoice.
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="allowWithholdingOverride"
                  checked={Boolean(form.allowWithholdingOverride)}
                  onChange={handleChange}
                  disabled={readOnly}
                  className="h-4 w-4"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  WHT Label
                </label>
                <input
                  type="text"
                  name="withholdingName"
                  value={form.withholdingName}
                  onChange={handleChange}
                  disabled={readOnly}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode ? 'bg-gray-900/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="WHT / Withholding Tax"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Default WHT Rate (%)
                </label>
                <input
                  type="number"
                  name="withholdingRate"
                  min="0"
                  step="0.01"
                  value={form.withholdingRate}
                  onChange={handleChange}
                  disabled={readOnly}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode ? 'bg-gray-900/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  WHT Base
                </label>
                <select
                  name="withholdingBase"
                  value={form.withholdingBase}
                  onChange={handleChange}
                  disabled={readOnly}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode ? 'bg-gray-900/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="taxable_amount">Taxable amount</option>
                  <option value="gross_total">Gross total</option>
                </select>
              </div>
            </div>
          </div>

          <div className={`rounded-lg border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Preview</div>
            <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {form.taxEnabled
                ? `${form.taxName || 'Tax'} at ${Number(form.taxRate || 0).toFixed(2)}% will be applied by default.`
                : 'Tax is disabled. New invoices and receipts will not include tax unless manually configured.'}
              {form.withholdingEnabled
                ? ` ${form.withholdingName || 'WHT'} at ${Number(form.withholdingRate || 0).toFixed(2)}% will be deducted from the ${form.withholdingBase === 'gross_total' ? 'gross total' : 'taxable amount'}.`
                : ' Withholding tax is disabled by default.'}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {readOnly ? 'Read-only access: you can view but not update this configuration.' : 'Changes apply to future documents.'}
            </div>
            <button
              type="submit"
              disabled={saving || readOnly}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Tax Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TaxConfigurationSettings;
