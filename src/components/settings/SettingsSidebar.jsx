import React from 'react';
import { User, Shield, Bell, CreditCard, Users, Palette, Database, Globe } from 'lucide-react';

const SettingsSidebar = ({ activeSection, onSectionChange }) => {
  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'integrations', label: 'Integrations', icon: Globe }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
      <nav className="space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`
                w-full flex items-center px-3 py-3 rounded-lg text-sm transition-colors
                ${activeSection === section.id
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-4 h-4 mr-3" />
              {section.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SettingsSidebar;