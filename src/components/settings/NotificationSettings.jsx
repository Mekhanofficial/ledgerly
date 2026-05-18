import React, { useCallback, useEffect, useState } from 'react';
import {
  Bell,
  Clock3,
  Mail,
  MessageCircle,
  Package,
  RefreshCw,
  Save
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  fetchSettings,
  normalizeNotificationSettings,
  updateSettings
} from '../../services/settingsService';
import { isAccessDeniedError } from '../../utils/accessControl';

const listToInput = (values = []) => values.join(', ');

const parseDayList = (value, fallback = []) => {
  const normalized = String(value || '')
    .split(',')
    .map((entry) => Number.parseInt(entry.trim(), 10))
    .filter((entry) => Number.isFinite(entry) && entry >= 0);

  return normalized.length ? Array.from(new Set(normalized)) : [...fallback];
};

const parseRecipients = (value) => (
  String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
);

const createDraft = (notifications = DEFAULT_NOTIFICATION_SETTINGS) => {
  const normalized = normalizeNotificationSettings(notifications);
  return {
    notifications: normalized,
    preDueDaysInput: listToInput(normalized.arAutomation.preDueDays),
    overdueDaysInput: listToInput(normalized.arAutomation.overdueDays),
    recipientsInput: listToInput(normalized.dailySummary.recipients)
  };
};

const NotificationSettings = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const [form, setForm] = useState(() => createDraft(DEFAULT_NOTIFICATION_SETTINGS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const settings = await fetchSettings();
      setForm(createDraft(settings?.notifications || DEFAULT_NOTIFICATION_SETTINGS));
      setReadOnly(false);
    } catch (error) {
      if (isAccessDeniedError(error)) {
        setReadOnly(true);
        return;
      }
      addToast(error?.response?.data?.error || 'Failed to load notification settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const setSectionValue = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [section]: {
          ...prev.notifications[section],
          [key]: value
        }
      }
    }));
  };

  const resetLocal = () => {
    setForm(createDraft(DEFAULT_NOTIFICATION_SETTINGS));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const payload = normalizeNotificationSettings({
      ...form.notifications,
      lowStock: {
        ...form.notifications.lowStock,
        threshold: Number(form.notifications.lowStock.threshold || 0)
      },
      invoiceOverdue: {
        ...form.notifications.invoiceOverdue,
        daysBefore: Number(form.notifications.invoiceOverdue.daysBefore || 0)
      },
      dailySummary: {
        ...form.notifications.dailySummary,
        recipients: parseRecipients(form.recipientsInput)
      },
      arAutomation: {
        ...form.notifications.arAutomation,
        preDueDays: parseDayList(
          form.preDueDaysInput,
          DEFAULT_NOTIFICATION_SETTINGS.arAutomation.preDueDays
        ),
        overdueDays: parseDayList(
          form.overdueDaysInput,
          DEFAULT_NOTIFICATION_SETTINGS.arAutomation.overdueDays
        )
      }
    });

    try {
      setSaving(true);
      const updated = await updateSettings({ notifications: payload });
      setForm(createDraft(updated?.notifications || payload));
      addToast('Notification automation saved', 'success');
    } catch (error) {
      if (isAccessDeniedError(error)) {
        setReadOnly(true);
        addToast('Only admins/accountants can update shared notification settings', 'warning');
        return;
      }
      addToast(error?.response?.data?.error || 'Failed to save notification settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const { notifications } = form;
  const summaryText = notifications.arAutomation.enabled
    ? `AR reminders will run ${form.preDueDaysInput || '7, 3, 1'} days before due and ${form.overdueDaysInput || '1, 7, 14'} days after due using ${notifications.arAutomation.defaultChannel}.`
    : 'AR automation is disabled. Invoices can still be sent manually by email or WhatsApp.';

  const inputClasses = `w-full px-3 py-2 rounded-lg border text-sm ${
    isDarkMode
      ? 'bg-gray-900/60 border-gray-700 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const sectionCardClasses = isDarkMode
    ? 'rounded-xl border border-gray-700 bg-gray-900/30 p-5'
    : 'rounded-xl border border-gray-200 bg-gray-50 p-5';

  const toggleCardClasses = isDarkMode
    ? 'rounded-lg border border-gray-700 bg-gray-800/60 p-4'
    : 'rounded-lg border border-gray-200 bg-white p-4';

  return (
    <div className={`border rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Bell className={`w-5 h-5 ${isDarkMode ? 'text-primary-300' : 'text-primary-600'}`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Notification Settings
            </h3>
          </div>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Control BillMetro reminders, collections automation, low-stock alerts, and summary digests from one shared business settings screen.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={resetLocal}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
              isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Reset Local
          </button>
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
      </div>

      {loading ? (
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading notification settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className={sectionCardClasses}>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary-600" />
              <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Accounts Receivable Automation
              </h4>
            </div>
            <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Queue pre-due and overdue follow-ups, choose the default channel, and let WhatsApp back up failed email delivery.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`${toggleCardClasses} flex items-center justify-between`}>
                <div className="pr-4">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Enable AR automation
                  </div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Run reminder automation from the collections queue.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(notifications.arAutomation.enabled)}
                  onChange={(event) => setSectionValue('arAutomation', 'enabled', event.target.checked)}
                  disabled={readOnly}
                  className="h-4 w-4"
                />
              </label>

              <label className={`${toggleCardClasses} flex items-center justify-between`}>
                <div className="pr-4">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    WhatsApp fallback
                  </div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Switch to WhatsApp when the chosen email flow is unavailable.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(notifications.arAutomation.fallbackToWhatsApp)}
                  onChange={(event) => setSectionValue('arAutomation', 'fallbackToWhatsApp', event.target.checked)}
                  disabled={readOnly}
                  className="h-4 w-4"
                />
              </label>

              <label className={`${toggleCardClasses} flex items-center justify-between md:col-span-2`}>
                <div className="pr-4">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Auto-apply late fees
                  </div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Allow the collections run to add configured late-fee logic before reminders are sent.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(notifications.arAutomation.autoApplyLateFees)}
                  onChange={(event) => setSectionValue('arAutomation', 'autoApplyLateFees', event.target.checked)}
                  disabled={readOnly}
                  className="h-4 w-4"
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Default reminder channel
                </label>
                <select
                  value={notifications.arAutomation.defaultChannel}
                  onChange={(event) => setSectionValue('arAutomation', 'defaultChannel', event.target.value)}
                  disabled={readOnly}
                  className={inputClasses}
                >
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="both">Email + WhatsApp</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Pre-due reminder days
                </label>
                <input
                  type="text"
                  value={form.preDueDaysInput}
                  onChange={(event) => setForm((prev) => ({ ...prev, preDueDaysInput: event.target.value }))}
                  disabled={readOnly}
                  className={inputClasses}
                  placeholder="7, 3, 1"
                />
                <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Comma-separated day list before the due date.
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Overdue reminder days
                </label>
                <input
                  type="text"
                  value={form.overdueDaysInput}
                  onChange={(event) => setForm((prev) => ({ ...prev, overdueDaysInput: event.target.value }))}
                  disabled={readOnly}
                  className={inputClasses}
                  placeholder="1, 7, 14"
                />
                <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Comma-separated day list after the due date.
                </div>
              </div>
            </div>

            <div className={`mt-4 rounded-lg border px-4 py-3 ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-primary-600" />
                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Automation Preview
                </div>
              </div>
              <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {summaryText}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className={sectionCardClasses}>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary-600" />
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Operational Alerts
                </h4>
              </div>
              <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Keep finance and stock alerts active for the business team.
              </p>

              <div className="mt-4 space-y-4">
                <label className={`${toggleCardClasses} flex items-center justify-between`}>
                  <div className="pr-4">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Invoice overdue alerts
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Raise an internal alert before invoices cross the overdue threshold.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(notifications.invoiceOverdue.enabled)}
                    onChange={(event) => setSectionValue('invoiceOverdue', 'enabled', event.target.checked)}
                    disabled={readOnly}
                    className="h-4 w-4"
                  />
                </label>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Days before invoice is flagged overdue
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={notifications.invoiceOverdue.daysBefore}
                    onChange={(event) => setSectionValue('invoiceOverdue', 'daysBefore', event.target.value)}
                    disabled={readOnly}
                    className={inputClasses}
                  />
                </div>

                <label className={`${toggleCardClasses} flex items-center justify-between`}>
                  <div className="pr-4">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Low stock alerts
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Notify the team when inventory falls below your threshold.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(notifications.lowStock.enabled)}
                    onChange={(event) => setSectionValue('lowStock', 'enabled', event.target.checked)}
                    disabled={readOnly}
                    className="h-4 w-4"
                  />
                </label>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Low stock threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={notifications.lowStock.threshold}
                    onChange={(event) => setSectionValue('lowStock', 'threshold', event.target.value)}
                    disabled={readOnly}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            <div className={sectionCardClasses}>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-600" />
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Daily Summary
                </h4>
              </div>
              <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Send a scheduled digest to finance stakeholders with the day’s activity.
              </p>

              <div className="mt-4 space-y-4">
                <label className={`${toggleCardClasses} flex items-center justify-between`}>
                  <div className="pr-4">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Enable daily summary
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Email a digest of activity and balances once per day.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(notifications.dailySummary.enabled)}
                    onChange={(event) => setSectionValue('dailySummary', 'enabled', event.target.checked)}
                    disabled={readOnly}
                    className="h-4 w-4"
                  />
                </label>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Summary time
                  </label>
                  <input
                    type="time"
                    value={notifications.dailySummary.time}
                    onChange={(event) => setSectionValue('dailySummary', 'time', event.target.value)}
                    disabled={readOnly}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Summary recipients
                  </label>
                  <input
                    type="text"
                    value={form.recipientsInput}
                    onChange={(event) => setForm((prev) => ({ ...prev, recipientsInput: event.target.value }))}
                    disabled={readOnly}
                    className={inputClasses}
                    placeholder="finance@billmetro.com, owner@billmetro.com"
                  />
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Separate multiple email addresses with commas.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {readOnly
                ? 'Read-only access: you can review automation rules, but only admins/accountants can change them.'
                : 'Messaging provider credentials still live under Integrations. These settings control when and how reminders are triggered.'}
            </div>
            <button
              type="submit"
              disabled={saving || readOnly}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Notification Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NotificationSettings;
