import React, { useState } from 'react';
import { Bell, Filter, Settings, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import NotificationList from '../../components/notifications/NotificationList';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext'; // Add this import

const Notifications = () => {
  const { isDarkMode } = useTheme();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll,
    getNotificationStats 
  } = useNotifications(); // Use the context
  
  const [filter, setFilter] = useState('all');

  // Get notification stats
  const stats = getNotificationStats();
  
  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    switch(filter) {
      case 'all':
        return true;
      case 'unread':
        return !notification.read;
      case 'today':
        const today = new Date().toDateString();
        const notifDate = new Date(notification.timestamp).toDateString();
        return notifDate === today;
      default:
        return notification.type === filter;
    }
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Notifications
            </h1>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {unreadCount} unread notifications
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button className={`flex items-center px-4 py-2 border rounded-lg ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <button 
              onClick={markAllAsRead}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Read
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className={`border rounded-xl p-5 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.total}
                </p>
              </div>
              <Bell className={`w-8 h-8 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-300'
              }`} />
            </div>
          </div>
          <div className={`border rounded-xl p-5 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Unread
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.unread}
                </p>
              </div>
              <Bell className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className={`border rounded-xl p-5 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Today
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.today}
                </p>
              </div>
              <Bell className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div className={`border rounded-xl p-5 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Important
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.important}
                </p>
              </div>
              <Bell className="w-8 h-8 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`border rounded-xl p-4 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['all', 'unread', 'new-invoice', 'new-customer', 'overdue', 'payment', 'warning', 'info'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    filter === type
                      ? 'bg-primary-600 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'unread' ? (
                    <>
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {type}
                    </>
                  ) : type === 'new-invoice' ? (
                    'New Invoice'
                  ) : type === 'new-customer' ? (
                    'New Customer'
                  ) : (
                    type
                  )}
                </button>
              ))}
            </div>
            <button className={`flex items-center px-4 py-2 border rounded-lg ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Notification List Component */}
        <NotificationList
          notifications={filteredNotifications}
          onMarkAsRead={markAsRead}
          onClearAll={clearAll}
          onDelete={deleteNotification}
        />

        {/* Notification Preferences */}
        <div className={`border rounded-xl p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Notification Preferences
              </h3>
              <p className={`mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Customize what notifications you receive
              </p>
            </div>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Manage Preferences
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className={`p-4 border rounded-lg ${
              isDarkMode 
                ? 'border-gray-700 bg-gray-800/50' 
                : 'border-gray-200 bg-gray-50/50'
            }`}>
              <div className="flex items-center mb-3">
                <Bell className="w-5 h-5 text-blue-600 mr-3" />
                <div className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Email Notifications
                </div>
              </div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Receive notifications via email
              </p>
            </div>
            <div className={`p-4 border rounded-lg ${
              isDarkMode 
                ? 'border-gray-700 bg-gray-800/50' 
                : 'border-gray-200 bg-gray-50/50'
            }`}>
              <div className="flex items-center mb-3">
                <Bell className="w-5 h-5 text-emerald-600 mr-3" />
                <div className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Push Notifications
                </div>
              </div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Real-time notifications on your devices
              </p>
            </div>
            <div className={`p-4 border rounded-lg ${
              isDarkMode 
                ? 'border-gray-700 bg-gray-800/50' 
                : 'border-gray-200 bg-gray-50/50'
            }`}>
              <div className="flex items-center mb-3">
                <Bell className="w-5 h-5 text-purple-600 mr-3" />
                <div className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  SMS Alerts
                </div>
              </div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Critical alerts via text message
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;