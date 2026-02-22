import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { fetchAuditLogs } from '../../services/settingsService';
import { isAccessDeniedError } from '../../utils/accessControl';

const formatWhen = (value) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString();
};

const AuditLogSettings = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('');
  const [limit, setLimit] = useState(25);
  const [readOnly, setReadOnly] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const result = await fetchAuditLogs({
        limit,
        action: actionFilter.trim()
      });
      setLogs(result.data || []);
      setReadOnly(false);
    } catch (error) {
      if (isAccessDeniedError(error)) {
        setReadOnly(true);
        return;
      }
      addToast(error?.response?.data?.error || 'Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [limit]);

  const handleApplyFilter = (event) => {
    event.preventDefault();
    load();
  };

  return (
    <div className={`border rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Activity className={`w-5 h-5 ${isDarkMode ? 'text-primary-300' : 'text-primary-600'}`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Audit Log
            </h3>
          </div>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Review system changes with actor, action, resource, and structured metadata.
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

      <form onSubmit={handleApplyFilter} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 mb-4">
        <input
          type="text"
          value={actionFilter}
          onChange={(event) => setActionFilter(event.target.value)}
          placeholder="Filter by action (e.g. update-settings, run-backup)"
          className={`px-3 py-2 border rounded-lg ${
            isDarkMode ? 'bg-gray-900/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <select
          value={String(limit)}
          onChange={(event) => setLimit(Number(event.target.value))}
          className={`px-3 py-2 border rounded-lg ${
            isDarkMode ? 'bg-gray-900/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="25">25 entries</option>
          <option value="50">50 entries</option>
          <option value="100">100 entries</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
        >
          Apply
        </button>
      </form>

      {readOnly ? (
        <div className={`text-sm ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
          You do not have permission to view audit logs.
        </div>
      ) : loading ? (
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No audit log entries found.</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log._id}
              className={`rounded-lg border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                <div>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {log.action}
                  </div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {log.resource || 'Unknown resource'} - {formatWhen(log.timestamp)}
                  </div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {log.user?.name || 'System'} ({log.user?.email || 'unknown'}) - {log.user?.role || 'n/a'}
                  </div>
                </div>
                <div className={`text-[11px] px-2 py-1 rounded-full ${
                  isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-700 border border-gray-200'
                }`}>
                  {log._id}
                </div>
              </div>

              <details className="mt-3">
                <summary className={`cursor-pointer text-xs font-medium ${isDarkMode ? 'text-primary-300' : 'text-primary-700'}`}>
                  View details
                </summary>
                <pre className={`mt-2 text-xs p-3 rounded-lg overflow-x-auto ${
                  isDarkMode ? 'bg-gray-950/70 text-gray-200' : 'bg-white border border-gray-200 text-gray-800'
                }`}>
{JSON.stringify(log.details || {}, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogSettings;
