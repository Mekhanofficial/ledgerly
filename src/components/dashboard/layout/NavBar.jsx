import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Plus, 
  Menu, 
  Moon, 
  Sun, 
  LogOut, 
  User, 
  Settings, 
  HelpCircle,
  FileText,
  Receipt,
  Package,
  Users,
  CheckCircle,
  AlertCircle,
  Info,
  Shield,
  Award,
  Briefcase,
  CreditCard,
  FileCheck,
  ShoppingCart,
  BarChart
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';

const Navbar = ({ onMenuClick, sidebarOpen, onSidebarToggle }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [searchWidth, setSearchWidth] = useState('max-w-2xl');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      text: 'Payment received from Acme Corp', 
      time: '2 min ago', 
      read: false,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    { 
      id: 2, 
      text: 'Invoice #INV-2024-100 is overdue', 
      time: '1 hour ago', 
      read: false,
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    },
    { 
      id: 3, 
      text: 'Low stock alert: Wireless Mouse', 
      time: '3 hours ago', 
      read: true,
      icon: Info,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20'
    },
    { 
      id: 4, 
      text: 'New customer registered: TechStart Inc', 
      time: '5 hours ago', 
      read: true,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const userMenuRef = useRef(null);
  const createMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
        setCreateMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Adjust search bar width based on sidebar state
  useEffect(() => {
    if (sidebarOpen) {
      setSearchWidth('max-w-xl');
    } else {
      setSearchWidth('max-w-3xl');
    }
  }, [sidebarOpen]);

  // Handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Unread notification count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Create menu items with actual navigation
  const createItems = [
    {
      title: 'New Invoice',
      description: 'Create professional invoice',
      icon: FileText,
      color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
      path: '/invoices/create'
    },
    {
      title: 'Generate Receipt',
      description: 'Quick POS receipt',
      icon: Receipt,
      color: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300',
      path: '/receipts'
    },
    {
      title: 'Add Product',
      description: 'Add to inventory',
      icon: Package,
      color: 'bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300',
      path: '/inventory/products/new'
    },
    {
      title: 'Add Customer',
      description: 'New customer record',
      icon: Users,
      color: 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300',
      path: '/customers/new'
    }
  ];

  // More create items for second column
  const createItemsColumn2 = [
    {
      title: 'New Report',
      description: 'Generate analytics report',
      icon: BarChart,
      color: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300',
      path: '/reports/new'
    },
    {
      title: 'Create Quote',
      description: 'Create sales quote',
      icon: FileCheck,
      color: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-300',
      path: '/quotes/create'
    },
    {
      title: 'New Order',
      description: 'Create sales order',
      icon: ShoppingCart,
      color: 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300',
      path: '/orders/new'
    },
    {
      title: 'Record Payment',
      description: 'Record received payment',
      icon: CreditCard,
      color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
      path: '/payments/new'
    }
  ];

  // User menu items
  const userMenuItems = [
    { label: 'Profile', icon: User, path: '/profile' },
    { label: 'Account Settings', icon: Settings, path: '/settings' },
    { label: 'Help & Support', icon: HelpCircle, path: '/support' },
    { label: 'Sign Out', icon: LogOut, path: '/login', isLogout: true }
  ];

  // Handle user menu item click
  const handleUserMenuItemClick = (item) => {
    if (item.isLogout) {
      console.log('Logging out...');
      localStorage.removeItem('theme');
      navigate('/login');
    } else {
      navigate(item.path);
    }
    setUserMenuOpen(false);
  };

  // Handle create item click
  const handleCreateItemClick = (path) => {
    navigate(path);
    setCreateMenuOpen(false);
  };

  // User stats (optional)
  const userStats = [
    { label: 'Invoices', value: '24', icon: FileText },
    { label: 'Customers', value: '156', icon: Users },
    { label: 'Revenue', value: '$12.5k', icon: Briefcase }
  ];

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Menu Button & Search */}
          <div className="flex items-center flex-1">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 mr-2"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <button
              onClick={onSidebarToggle}
              className="hidden lg:flex items-center p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 mr-4"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Search Bar - Dynamic width based on sidebar */}
            <div className={`flex items-center relative flex-1 ${searchWidth} transition-all duration-300`}>
              <Search className="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                placeholder="Search invoices, customers, products, reports..."
                className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:focus:ring-primary-400 dark:bg-gray-800 dark:text-white w-full"
                aria-label="Search"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4 ml-6">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Create Button with Dropdown */}
            <div className="relative" ref={createMenuRef}>
              <button
                onClick={() => setCreateMenuOpen(!createMenuOpen)}
                className="flex items-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
                aria-label="Create new"
                aria-expanded={createMenuOpen}
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-medium hidden sm:inline">Create</span>
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${createMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {createMenuOpen && (
                <div className="absolute right-0 mt-2 w-[640px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose what you want to create</p>
                  </div>
                  
                  {/* Two-column grid for create items */}
                  <div className="grid grid-cols-2 gap-0">
                    {/* First Column */}
                    <div className="border-r border-gray-200 dark:border-gray-700">
                      {createItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleCreateItemClick(item.path)}
                          className="flex items-center w-full px-6 py-4 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mr-4`}>
                            <item.icon className="w-6 h-6" />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-medium dark:text-white">{item.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Second Column */}
                    <div>
                      {createItemsColumn2.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleCreateItemClick(item.path)}
                          className="flex items-center w-full px-6 py-4 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mr-4`}>
                            <item.icon className="w-6 h-6" />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-medium dark:text-white">{item.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to="/templates"
                      className="flex items-center justify-center w-full px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View all templates
                      <ChevronDown className="w-4 h-4 ml-2 transform rotate-270" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Notifications"
                aria-expanded={showNotifications}
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-3 py-1 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-3 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Notifications List */}
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">You're all caught up!</p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const Icon = notification.icon;
                        return (
                          <button
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                              !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-4">
                              <div className={`w-10 h-10 rounded-lg ${notification.bgColor} flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-5 h-5 ${notification.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                                  {notification.text}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {notification.time}
                                  </p>
                                  {!notification.read && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                      New
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to="/notifications"
                      className="flex items-center justify-center w-full px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile with Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-gray-800">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=4f46e5&backgroundType=solid&hairColor=262626&mouth=smile&eyes=happy&eyebrows=raised" 
                    alt="User avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold hidden">
                    <User className="w-5 h-5" />
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 ml-2 text-gray-500 dark:text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 overflow-hidden">
                  {/* User Info Section */}
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-gray-800">
                        <img 
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=4f46e5&backgroundType=solid&hairColor=262626&mouth=smile&eyes=happy&eyebrows=raised" 
                          alt="User avatar" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold hidden">
                          <User className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">John Smith</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">john@example.com</p>
                        <div className="flex items-center mt-1">
                          <Shield className="w-3 h-3 text-green-500 dark:text-green-400 mr-1" />
                          <span className="text-xs text-green-600 dark:text-green-400">Admin</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* User Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {userStats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <stat.icon className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{stat.value}</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    {userMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleUserMenuItemClick(item)}
                        className={`flex items-center w-full px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          item.isLogout ? 'hover:bg-red-50 dark:hover:bg-red-900/10' : ''
                        }`}
                      >
                        <item.icon className={`w-4 h-4 mr-3 ${
                          item.isLogout 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`} />
                        <span className={item.isLogout ? 'text-red-600 dark:text-red-400' : ''}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;