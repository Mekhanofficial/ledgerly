import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import AccountSettings from '../../components/settings/AccountSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import BillingSettings from '../../components/settings/BillingSettings';
import TaxConfigurationSettings from '../../components/settings/TaxConfigurationSettings';
import RolePermissionsSettings from '../../components/settings/RolePermissionsSettings';
import DataBackupSettings from '../../components/settings/DataBackupSettings';
import IntegrationsSettings from '../../components/settings/IntegrationsSettings';
import AuditLogSettings from '../../components/settings/AuditLogSettings';
import { useTheme } from '../../context/ThemeContext';
import TeamManagementPanel from '../../components/team/TeamManagementPanel';

const SETTINGS_SECTIONS = [
  { id: 'account', label: 'Account' },
  { id: 'tax', label: 'Tax Config' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'billing', label: 'Billing & Plan' },
  { id: 'team', label: 'Team' },
  { id: 'permissions', label: 'Role Permissions' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'data', label: 'Data & Backup' },
  { id: 'audit', label: 'Audit Log' },
  { id: 'integrations', label: 'Integrations' }
];

const SETTINGS_SECTION_IDS = new Set(SETTINGS_SECTIONS.map((section) => section.id));

const Settings = () => {
  const { isDarkMode, toggleTheme, setTheme } = useTheme();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('account');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (!section) return;
    const normalized = section.trim().toLowerCase();
    if (SETTINGS_SECTION_IDS.has(normalized)) {
      setActiveSection(normalized);
    }
  }, [location.search]);

  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings />;
      case 'tax':
        return <TaxConfigurationSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'billing':
        return <BillingSettings />;
      case 'team':
        return <TeamSettings />;
      case 'permissions':
        return <RolePermissionsSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'data':
        return <DataSettings />;
      case 'audit':
        return <AuditSettings />;
      case 'integrations':
        return <IntegrationSettings />;
      default:
        return <AccountSettings />;
    }
  };

  // Placeholder components with dark mode
  const SecuritySettings = () => (
    <div className={`border rounded-xl p-6 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-semibold ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Security Settings
      </h3>
      <p className={`mt-1 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Manage password, 2FA, and security preferences
      </p>
    </div>
  );

  const TeamSettings = () => <TeamManagementPanel />;

  const AppearanceSettings = () => (
    <div className={`border rounded-xl p-6 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Appearance
          </h3>
          <p className={`mt-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Customize theme, colors, and layout
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
              !isDarkMode
                ? 'bg-primary-600 text-white border-primary-600'
                : isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
              isDarkMode
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dark
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Dark mode
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Toggle the overall interface theme
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isDarkMode}
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDarkMode ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className={`border rounded-lg p-4 ${
          isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Colors & layout
          </div>
          <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Additional color themes and layout controls are coming soon.
          </div>
        </div>
      </div>
    </div>
  );

  const DataSettings = () => (
    <DataBackupSettings />
  );

  const AuditSettings = () => (
    <AuditLogSettings />
  );

  const IntegrationSettings = () => (
    <IntegrationsSettings />
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Settings
            </h1>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage your account and preferences
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            {hasChanges && (
              <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Top Tabs */}
        <div className={`border rounded-xl p-2 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-2 overflow-x-auto">
            {SETTINGS_SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div>
          {renderSection()}
        </div>

        {/* System Info */}
        <div className={`border rounded-xl p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                App Version
              </div>
              <div className={`font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Ledgerly v2.4.1
              </div>
            </div>
            <div>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Last Updated
              </div>
              <div className={`font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Dec 15, 2024
              </div>
            </div>
            <div>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Storage Used
              </div>
              <div className={`font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                245 MB / 5 GB
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
