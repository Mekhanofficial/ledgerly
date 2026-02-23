import React, { useEffect, useMemo, useState } from 'react';
import {
  User,
  Receipt,
  Shield,
  Bell,
  CreditCard,
  KeyRound,
  Palette,
  Database,
  FileText,
  Globe
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
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

const SETTINGS_SECTIONS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'tax', label: 'Tax Config', icon: Receipt },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
  { id: 'permissions', label: 'Role Permissions', icon: KeyRound, adminOnly: true },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'data', label: 'Data & Backup', icon: Database },
  { id: 'audit', label: 'Audit Log', icon: FileText, adminOnly: true },
  { id: 'integrations', label: 'Integrations', icon: Globe, adminOnly: true }
];

const SETTINGS_SECTION_IDS = new Set(SETTINGS_SECTIONS.map((section) => section.id));

const Settings = () => {
  const { isDarkMode, toggleTheme, setTheme } = useTheme();
  const location = useLocation();
  const authUser = useSelector((state) => state.auth?.user);
  const normalizedRole = String(authUser?.role || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  const canManageAdvancedSettings = ['admin', 'super_admin'].includes(normalizedRole);
  const [activeSection, setActiveSection] = useState('account');
  const visibleSections = useMemo(
    () => SETTINGS_SECTIONS.filter((section) => !section.adminOnly || canManageAdvancedSettings),
    [canManageAdvancedSettings]
  );
  const visibleSectionIds = useMemo(
    () => new Set(visibleSections.map((section) => section.id)),
    [visibleSections]
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (!section) return;
    const normalized = section.trim().toLowerCase();
    if (SETTINGS_SECTION_IDS.has(normalized)) {
      setActiveSection(normalized);
    }
  }, [location.search]);

  useEffect(() => {
    if (!visibleSectionIds.has(activeSection)) {
      setActiveSection(visibleSections[0]?.id || 'account');
    }
  }, [activeSection, visibleSectionIds, visibleSections]);

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
        <div className={`overflow-hidden rounded-2xl border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`p-5 md:p-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className={`text-xs uppercase tracking-[0.16em] font-semibold ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Admin / Settings
                </div>
                <h1 className={`mt-2 text-2xl md:text-3xl font-semibold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Business </span>
                  <span className="text-primary-600">Settings</span>
                </h1>
                <p className={`mt-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Manage account preferences, automation, and business configuration.
                </p>
              </div>
              <div className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${
                isDarkMode ? 'border-gray-600 text-gray-300 bg-gray-900/40' : 'border-gray-200 text-gray-700 bg-gray-50'
              }`}>
                {canManageAdvancedSettings ? 'Admin settings access' : 'Standard settings access'}
              </div>
            </div>
          </div>

          {/* Top Tabs - image-style underline nav */}
          <div className={`border-t ${
            isDarkMode ? 'border-gray-700 bg-gray-800/70' : 'border-gray-200 bg-white'
          }`}>
            <div className="overflow-x-auto">
              <div className="flex min-w-max items-center gap-1 px-3 md:px-4">
                {visibleSections.map((section) => {
                  const isActive = activeSection === section.id;
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`relative inline-flex items-center gap-2 rounded-t-xl px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? 'text-primary-600'
                          : isDarkMode
                            ? 'text-gray-300 hover:text-white'
                            : 'text-gray-600 hover:text-gray-900'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : ''}`} />
                      <span>{section.label}</span>
                      <span
                        className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-opacity ${
                          isActive
                            ? 'opacity-100 bg-primary-600'
                            : 'opacity-0 bg-transparent'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
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
