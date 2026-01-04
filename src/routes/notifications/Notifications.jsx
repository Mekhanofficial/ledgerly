import React, { useState } from 'react';
import { Bell, Filter, Settings, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import NotificationList from '../../components/notifications/NotificationList';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Payment Received',
      message: 'Acme Corporation paid invoice INV-2024-089 for $2,450.00',
      type: 'success',
      time: 'Just now',
      read: false
    },
    {
      id: 2,
      title: 'Low Stock Alert',
      message: 'Wireless Mouse stock is low (8 items remaining)',
      type: 'warning',
      time: '30 minutes ago',
      read: false
    },
    {
      id: 3,
      title: 'New Invoice Created',
      message: 'Invoice INV-2024-095 has been created for TechStart Industries',
      type: 'info',
      time: '2 hours ago',
      read: true
    },
    {
      id: 4,
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Dec 18, 2:00 AM - 4:00 AM',
      type: 'system',
      time: '5 hours ago',
      read: true
    },
    {
      id: 5,
      title: 'Payment Failed',
      message: 'Payment for invoice INV-2024-092 failed. Please retry.',
      type: 'error',
      time: '1 day ago',
      read: true
    },
    {
      id: 6,
      title: 'Invoice Due Soon',
      message: 'Invoice INV-2024-090 is due in 2 days for Global Solutions Ltd',
      type: 'reminder',
      time: '1 day ago',
      read: false
    },
    {
      id: 7,
      title: 'New Customer Added',
      message: 'Innovate Labs has been added to your customer list',
      type: 'info',
      time: '2 days ago',
      read: true
    },
    {
      id: 8,
      title: 'Report Generated',
      message: 'Monthly sales report for November has been generated',
      type: 'success',
      time: '3 days ago',
      read: true
    }
  ]);

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount} unread notifications
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <button 
              onClick={handleMarkAllAsRead}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Read
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{unreadCount}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-300" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {notifications.filter(n => n.time.includes('now') || n.time.includes('hour')).length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-emerald-300" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Important</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {notifications.filter(n => n.type === 'warning' || n.type === 'error').length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-amber-300" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['all', 'unread', 'success', 'warning', 'info', 'error', 'system', 'reminder'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    filter === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'unread' ? (
                    <>
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {type}
                    </>
                  ) : (
                    type
                  )}
                </button>
              ))}
            </div>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Notification List Component */}
        <NotificationList
          notifications={filteredNotifications}
          onMarkAsRead={handleMarkAsRead}
          onClearAll={handleClearAll}
          onDelete={handleDelete}
        />

        {/* Notification Preferences */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
              <p className="text-gray-600 mt-1">Customize what notifications you receive</p>
            </div>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Manage Preferences
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center mb-3">
                <Bell className="w-5 h-5 text-blue-600 mr-3" />
                <div className="font-medium text-gray-900">Email Notifications</div>
              </div>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center mb-3">
                <Bell className="w-5 h-5 text-emerald-600 mr-3" />
                <div className="font-medium text-gray-900">Push Notifications</div>
              </div>
              <p className="text-sm text-gray-600">Real-time notifications on your devices</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center mb-3">
                <Bell className="w-5 h-5 text-purple-600 mr-3" />
                <div className="font-medium text-gray-900">SMS Alerts</div>
              </div>
              <p className="text-sm text-gray-600">Critical alerts via text message</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;