import React, { useState } from 'react';
import { Bell, Mail, Smartphone, ToggleLeft, ToggleRight } from 'lucide-react';

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    email: {
      newInvoice: true,
      paymentReceived: true,
      lowStock: true,
      systemUpdates: false
    },
    push: {
      newInvoice: true,
      paymentReceived: true,
      lowStock: false,
      systemUpdates: true
    },
    sms: {
      urgentAlerts: false,
      paymentReminders: false
    }
  });

  const toggleNotification = (type, key) => {
    setNotifications(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: !prev[type][key]
      }
    }));
  };

  const notificationCategories = [
    {
      type: 'email',
      title: 'Email Notifications',
      icon: Mail,
      items: [
        { key: 'newInvoice', label: 'New invoice created', description: 'When a new invoice is generated' },
        { key: 'paymentReceived', label: 'Payment received', description: 'When a customer makes a payment' },
        { key: 'lowStock', label: 'Low stock alerts', description: 'When inventory items are running low' },
        { key: 'systemUpdates', label: 'System updates', description: 'Product updates and announcements' }
      ]
    },
    {
      type: 'push',
      title: 'Push Notifications',
      icon: Bell,
      items: [
        { key: 'newInvoice', label: 'New invoice created', description: 'Receive push notifications on your devices' },
        { key: 'paymentReceived', label: 'Payment received', description: 'Instant payment notifications' },
        { key: 'lowStock', label: 'Low stock alerts', description: 'Urgent inventory alerts' },
        { key: 'systemUpdates', label: 'System updates', description: 'Important system notifications' }
      ]
    },
    {
      type: 'sms',
      title: 'SMS Notifications',
      icon: Smartphone,
      items: [
        { key: 'urgentAlerts', label: 'Urgent alerts only', description: 'Critical system alerts via SMS' },
        { key: 'paymentReminders', label: 'Payment reminders', description: 'Send payment reminders to customers' }
      ]
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
          <p className="text-gray-600 mt-1">Choose how you want to receive notifications</p>
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          Reset to Default
        </button>
      </div>

      <div className="space-y-8">
        {notificationCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.type} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{category.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {category.type === 'email' && 'Notifications sent to your email address'}
                    {category.type === 'push' && 'Notifications on your desktop and mobile devices'}
                    {category.type === 'sms' && 'Text message notifications'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {category.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                    </div>
                    <button
                      onClick={() => toggleNotification(category.type, item.key)}
                      className="ml-4"
                    >
                      {notifications[category.type][item.key] ? (
                        <ToggleRight className="w-10 h-6 text-primary-600" />
                      ) : (
                        <ToggleLeft className="w-10 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Notification Schedule</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiet Hours Start
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option>8:00 PM</option>
              <option>9:00 PM</option>
              <option>10:00 PM</option>
              <option>11:00 PM</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiet Hours End
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option>7:00 AM</option>
              <option>8:00 AM</option>
              <option>9:00 AM</option>
              <option>10:00 AM</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;