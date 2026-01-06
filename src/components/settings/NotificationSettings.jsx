import React, { useState } from 'react';
import { Bell, Mail, Smartphone, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const NotificationSettings = () => {
  const { isDarkMode } = useTheme();
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
    <div className={`border rounded-xl p-6 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Notification Settings
          </h3>
          <p className={`mt-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Choose how you want to receive notifications
          </p>
        </div>
        <button className={`px-4 py-2 border rounded-lg ${
          isDarkMode 
            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}>
          Reset to Default
        </button>
      </div>

      <div className="space-y-8">
        {notificationCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.type} className={`border rounded-lg p-6 ${
              isDarkMode 
                ? 'border-gray-700 bg-gray-800/50' 
                : 'border-gray-200 bg-gray-50/50'
            }`}>
              <div className="flex items-center mb-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                  isDarkMode ? 'bg-primary-900/30' : 'bg-primary-100'
                }`}>
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {category.title}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {category.type === 'email' && 'Notifications sent to your email address'}
                    {category.type === 'push' && 'Notifications on your desktop and mobile devices'}
                    {category.type === 'sms' && 'Text message notifications'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {category.items.map((item) => (
                  <div key={item.key} className={`flex items-center justify-between py-4 border-b last:border-0 ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-100'
                  }`}>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.label}
                      </div>
                      <div className={`text-sm mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleNotification(category.type, item.key)}
                      className="ml-4"
                    >
                      {notifications[category.type][item.key] ? (
                        <ToggleRight className="w-10 h-6 text-primary-600" />
                      ) : (
                        <ToggleLeft className={`w-10 h-6 ${
                          isDarkMode ? 'text-gray-600' : 'text-gray-400'
                        }`} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={`mt-8 pt-6 border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h4 className={`font-medium mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Notification Schedule
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Quiet Hours Start
            </label>
            <select className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'border-gray-300 text-gray-900'
            }`}>
              <option>8:00 PM</option>
              <option>9:00 PM</option>
              <option>10:00 PM</option>
              <option>11:00 PM</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Quiet Hours End
            </label>
            <select className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'border-gray-300 text-gray-900'
            }`}>
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