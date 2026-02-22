import React, { useEffect, useMemo, useState } from 'react';
import { DatabaseBackup, Download, RefreshCw, Save } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  downloadBackupSnapshot,
  fetchSettings,
  runBackup,
  updateSettings
} from '../../services/settingsService';
import { isAccessDeniedError } from '../../utils/accessControl';

const DEFAULT_BACKUP = {
  autoBackup: false,
  frequency: 'weekly',
  backupLocation: '',
  lastBackup: null
};

const formatDateTime = (value) => {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString();
};

const DataBackupSettings = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningBackup, setRunningBackup] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [backup, setBackup] = useState(DEFAULT_BACKUP);
  const [readOnly, setReadOnly] = useState(false);

  const lastBackupLabel = useMemo(() => formatDateTime(backup.lastBackup), [backup.lastBackup]);

  const load = async () => {
    try {
      setLoading(true);
      const settings = await fetchSettings();
      setBackup({
        ...DEFAULT_BACKUP,
        ...(settings?.backup || {})
      });
      setReadOnly(false);
    } catch (error) {
      if (isAccessDeniedError(error)) {
        setReadOnly(true);
        return;
      }
      addToast(error?.response?.data?.error || 'Failed to load backup settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setBackup((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateSettings({
        backup: {
          autoBackup: Boolean(backup.autoBackup),
          frequency: backup.frequency || 'weekly',
          backupLocation: String(backup.backupLocation || '').trim()
        }
      });
      setBackup({
        ...DEFAULT_BACKUP,
        ...(updated?.backup || backup)
      });
      addToast('Backup preferences saved', 'success');
    } catch (error) {
      if (isAccessDeniedError(error)) {
        setReadOnly(true);
        addToast('You do not have permission to update backup settings', 'warning');
        return;
      }
      addToast(error?.response?.data?.error || 'Failed to save backup preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRunBackup = async () => {
    try {
      setRunningBackup(true);
      const response = await runBackup({
        backupLocation: backup.backupLocation || undefined
      });
      setBackup((prev) => ({
        ...prev,
        ...(response?.data || {})
      }));
      addToast(response?.message || 'Backup completed', 'success');
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to run backup', 'error');
    } finally {
      setRunningBackup(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const { blob, fileName } = await downloadBackupSnapshot();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('Backup snapshot exported', 'success');
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to export backup snapshot', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={`border rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <DatabaseBackup className={`w-5 h-5 ${isDarkMode ? 'text-primary-300' : 'text-primary-600'}`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Data Backup
            </h3>
          </div>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure backup preferences, trigger a backup job, and export a JSON snapshot for migration/archive.
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
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading backup settings...</div>
      ) : (
        <div className="space-y-6">
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4`}>
            <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
              <div className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Backup</div>
              <div className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{lastBackupLabel}</div>
            </div>
            <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
              <div className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Auto Backup</div>
              <div className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {backup.autoBackup ? `Enabled (${backup.frequency})` : 'Disabled'}
              </div>
            </div>
            <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
              <div className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Backup Location</div>
              <div className={`mt-2 text-sm font-medium break-all ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {backup.backupLocation || 'Not set'}
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-white'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Auto Backup</span>
                <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                  isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Run backups automatically
                  </span>
                  <input
                    type="checkbox"
                    name="autoBackup"
                    checked={Boolean(backup.autoBackup)}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="h-4 w-4"
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Frequency</span>
                <select
                  name="frequency"
                  value={backup.frequency || 'weekly'}
                  onChange={handleChange}
                  disabled={readOnly}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode ? 'bg-gray-900/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
            </div>

            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Backup Location (path / bucket reference)
              </label>
              <input
                type="text"
                name="backupLocation"
                value={backup.backupLocation || ''}
                onChange={handleChange}
                disabled={readOnly}
                placeholder="e.g. s3://ledgerly-backups/acme-inc or \\\\server\\backup"
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDarkMode ? 'bg-gray-900/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || readOnly}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Backup Settings'}
              </button>
              <button
                type="button"
                onClick={handleRunBackup}
                disabled={runningBackup}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                } disabled:opacity-60`}
              >
                <RefreshCw className="w-4 h-4" />
                {runningBackup ? 'Running Backup...' : 'Run Backup Now'}
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                } disabled:opacity-60`}
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export JSON Snapshot'}
              </button>
            </div>
          </div>

          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Export includes core business records (customers, products, invoices, receipts, payments, settings, team users) as a JSON snapshot.
          </div>
        </div>
      )}
    </div>
  );
};

export default DataBackupSettings;

