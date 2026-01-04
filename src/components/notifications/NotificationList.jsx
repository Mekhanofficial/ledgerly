import React from 'react';
import { Bell, CheckCircle, AlertCircle, Info, XCircle, Clock, Trash2, Check } from 'lucide-react';

const NotificationList = ({ notifications, onMarkAsRead, onClearAll, onDelete }) => {
  const getNotificationIcon = (type) => {
    const icons = {
      success: CheckCircle,
      warning: AlertCircle,
      info: Info,
      error: XCircle,
      system: Bell,
      reminder: Clock
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colors = {
      success: 'bg-emerald-100 text-emerald-800',
      warning: 'bg-amber-100 text-amber-800',
      info: 'bg-blue-100 text-blue-800',
      error: 'bg-red-100 text-red-800',
      system: 'bg-purple-100 text-purple-800',
      reminder: 'bg-cyan-100 text-cyan-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <p className="text-gray-600 mt-1">
              {notifications.filter(n => !n.read).length} unread of {notifications.length} total
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClearAll}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All as Read
            </button>
            <button
              onClick={onClearAll}
              className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-600 mt-1">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${getNotificationColor(notification.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                        <button
                          onClick={() => onDelete(notification.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{notification.time}</span>
                        <span className="mx-2">•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getNotificationColor(notification.type)}`}>
                          {notification.type}
                        </span>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationList;