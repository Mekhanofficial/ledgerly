import React, { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import SettingsSidebar from '../../components/settings/SettingsSidebar';
import AccountSettings from '../../components/settings/AccountSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('account');
  const [hasChanges, setHasChanges] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'billing':
        return <BillingSettings />;
      case 'team':
        return <TeamSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'data':
        return <DataSettings />;
      case 'integrations':
        return <IntegrationSettings />;
      default:
        return <AccountSettings />;
    }
  };

  // Placeholder components for other sections
  const SecuritySettings = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
      <p className="text-gray-600 mt-1">Manage password, 2FA, and security preferences</p>
    </div>
  );

  const BillingSettings = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900">Billing & Plan</h3>
      <p className="text-gray-600 mt-1">Manage subscription, payment methods, and invoices</p>
    </div>
  );

  const TeamSettings = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900">Team Management</h3>
      <p className="text-gray-600 mt-1">Add team members and manage permissions</p>
    </div>
  );

  const AppearanceSettings = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
      <p className="text-gray-600 mt-1">Customize theme, colors, and layout</p>
    </div>
  );

  const DataSettings = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900">Data & Privacy</h3>
      <p className="text-gray-600 mt-1">Manage data export, backup, and privacy settings</p>
    </div>
  );

  const IntegrationSettings = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900">Integrations</h3>
      <p className="text-gray-600 mt-1">Connect with other apps and services</p>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account and preferences</p>
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderSection()}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600">App Version</div>
              <div className="font-medium text-gray-900">Ledgerly v2.4.1</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Last Updated</div>
              <div className="font-medium text-gray-900">Dec 15, 2024</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Storage Used</div>
              <div className="font-medium text-gray-900">245 MB / 5 GB</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;