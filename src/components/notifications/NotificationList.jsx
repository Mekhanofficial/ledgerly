import React from 'react';
import { Bell, CheckCircle, AlertCircle, Info, XCircle, Clock, Trash2, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const NotificationList = ({ notifications, onMarkAsRead, onClearAll, onDelete }) => {
  const { isDarkMode } = useTheme();

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
      success: isDarkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800',
      warning: isDarkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800',
      info: isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800',
      error: isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800',
      system: isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800',
      reminder: isDarkMode ? 'bg-cyan-900/30 text-cyan-300' : 'bg-cyan-100 text-cyan-800'
    };
    return colors[type] || (isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800');
  };

  const getUnreadBackground = (read) => {
    if (!read) {
      return isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50';
    }
    return isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50';
  };

  return (
    <div className={`border rounded-xl overflow-hidden ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        isDarkMode 
          ? 'border-gray-700 bg-gray-800' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Notifications
            </h3>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {notifications.filter(n => !n.read).length} unread of {notifications.length} total
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClearAll}
              className={`flex items-center px-4 py-2 border rounded-lg ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All as Read
            </button>
            <button
              onClick={onClearAll}
              className={`flex items-center px-4 py-2 border rounded-lg ${
                isDarkMode 
                  ? 'border-red-700 text-red-400 hover:bg-red-900/30' 
                  : 'border-red-300 text-red-600 hover:bg-red-50'
              }`}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className={`divide-y max-h-[600px] overflow-y-auto ${
        isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
      }`}>
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className={`w-12 h-12 mx-auto mb-4 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-300'
            }`} />
            <h3 className={`font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              No notifications
            </h3>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              You're all caught up!
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={`p-6 ${getUnreadBackground(notification.read)}`}
              >
                <div className="flex items-start">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${getNotificationColor(notification.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className={`mt-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                        <button
                          onClick={() => onDelete(notification.id)}
                          className={`p-1 ${
                            isDarkMode 
                              ? 'text-gray-500 hover:text-gray-300' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className={`flex items-center text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <span>{notification.time}</span>
                        <span className={`mx-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
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