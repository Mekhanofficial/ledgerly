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
  BarChart,
  XCircle,
  Clock,
  FileArchive,
  DollarSign,
  X
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useNotifications } from '../../../context/NotificationContext';
import { useUser } from '../../../context/UserContext';

const Navbar = ({ onMenuClick, sidebarOpen, onSidebarToggle }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll,
    getRecentNotifications 
  } = useNotifications();
  
  const { user } = useUser();
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [searchWidth, setSearchWidth] = useState('max-w-2xl');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const userMenuRef = useRef(null);
  const createMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchInputRef = useRef(null);
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

  // Focus search input when opened on mobile
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'Guest User';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    if (user.firstName) {
      return user.firstName;
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'Ledgerly User';
  };

  // Get user email
  const getUserEmail = () => {
    if (!user) return 'guest@example.com';
    return user.email || 'guest@example.com';
  };

  // Get user role
  const getUserRole = () => {
    if (!user) return 'Guest';
    return user.role === 'admin' ? 'Admin' : 'User';
  };

  // Get user avatar seed for DiceBear
  const getAvatarSeed = () => {
    if (!user) return 'Guest';
    
    if (user.email) {
      return user.email;
    }
    
    if (user.firstName && user.lastName) {
      return `${user.firstName}${user.lastName}`;
    }
    
    if (user.firstName) {
      return user.firstName;
    }
    
    return 'Ledgerly';
  };

  // Get user stats function
  const getUserStats = () => {
    if (!user) {
      return [
        { label: 'Invoices', value: '0', icon: FileText },
        { label: 'Customers', value: '0', icon: Users },
        { label: 'Revenue', value: '$0', icon: Briefcase }
      ];
    }
    
    return [
      { label: 'Invoices', value: user.invoiceCount || '24', icon: FileText },
      { label: 'Customers', value: user.customerCount || '156', icon: Users },
      { label: 'Revenue', value: user.revenue || '$12.5k', icon: Briefcase }
    ];
  };

  const userStats = getUserStats();

  // Handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  // Handle notification click
  const handleNotificationClick = (id, link) => {
    markAsRead(id);
    navigate(link);
    setShowNotifications(false);
  };

  // Get icon component based on notification icon type
  const getNotificationIcon = (iconType) => {
    switch(iconType) {
      case 'CheckCircle': return CheckCircle;
      case 'AlertCircle': return AlertCircle;
      case 'Info': return Info;
      case 'Users': return Users;
      case 'DollarSign': return DollarSign;
      case 'FileText': return FileText;
      case 'Clock': return Clock;
      case 'Bell': return Bell;
      case 'Package': return Package;
      default: return Bell;
    }
  };

  // Get color based on notification type
  const getNotificationColor = (type) => {
    switch(type) {
      case 'new-invoice': return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20';
      case 'new-customer': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'overdue': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'payment': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
      case 'warning': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
      case 'info': return 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50';
    }
  };

  // Get recent notifications (limit to 5 for dropdown)
  const recentNotifications = getRecentNotifications(5);

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
      path: '/customers'
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

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationTime.toLocaleDateString();
  };

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Mobile Search Bar - Full Width when active */}
        {isSearchOpen && (
          <div className="lg:hidden flex items-center py-3">
            <div className="flex items-center relative w-full">
              <Search className="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                placeholder="Search invoices, customers..."
                className="pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:focus:ring-primary-400 dark:bg-gray-800 dark:text-white w-full"
                aria-label="Search"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between h-16">
          {/* Left Section - Menu Button & Logo/Search Toggle */}
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
            
            {/* Desktop Search Bar - Hidden on mobile */}
            <div className={`hidden lg:flex items-center relative flex-1 ${searchWidth} transition-all duration-300`}>
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

            {/* Mobile Search Toggle Button - Only show when search is not open */}
            {!isSearchOpen && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 ml-2"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Theme Toggle - Always visible */}
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

            {/* Create Button with Dropdown - Hide text on mobile */}
            <div className="relative hidden sm:block" ref={createMenuRef}>
              <button
                onClick={() => setCreateMenuOpen(!createMenuOpen)}
                className="flex items-center px-3 sm:px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
                aria-label="Create new"
                aria-expanded={createMenuOpen}
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium hidden md:inline ml-2">Create</span>
                <ChevronDown className={`w-4 h-4 hidden md:block ml-2 transition-transform ${createMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {createMenuOpen && (
                <div className="absolute right-0 mt-2 w-[320px] sm:w-[640px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose what you want to create</p>
                  </div>
                  
                  {/* Responsive grid for create items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                    {/* First Column */}
                    <div className="sm:border-r border-gray-200 dark:border-gray-700">
                      {createItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleCreateItemClick(item.path)}
                          className="flex items-center w-full px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${item.color} flex items-center justify-center mr-3 sm:mr-4`}>
                            <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-medium dark:text-white text-sm sm:text-base">{item.title}</div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Second Column - Hidden on mobile */}
                    <div className="hidden sm:block">
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
                  <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to="/templates"
                      className="flex items-center justify-center w-full px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View all templates
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Create Button - Icon only */}
            <div className="relative sm:hidden" ref={createMenuRef}>
              <button
                onClick={() => setCreateMenuOpen(!createMenuOpen)}
                className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm"
                aria-label="Create new"
              >
                <Plus className="w-5 h-5" />
              </button>

              {createMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Create New</h3>
                  </div>
                  {createItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleCreateItemClick(item.path)}
                      className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mr-3`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium dark:text-white">{item.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                      </div>
                    </button>
                  ))}
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
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-screen max-w-xs sm:max-w-sm md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {unreadCount} unread
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              markAllAsRead();
                              setShowNotifications(false);
                            }}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-2 py-1 rounded-md"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Notifications List */}
                  <div className="max-h-[320px] overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                      <div className="px-4 sm:px-6 py-8 text-center">
                        <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                      </div>
                    ) : (
                      recentNotifications.map((notification) => {
                        const Icon = getNotificationIcon(notification.icon || 'Bell');
                        return (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification.id, notification.link)}
                            className={`w-full text-left px-4 sm:px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                              !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${getNotificationColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                                  {notification.title}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                                  {notification.description}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatRelativeTime(notification.timestamp)}
                                  </p>
                                  {!notification.read && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
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
                  <div className="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to="/notifications"
                      className="flex items-center justify-center w-full px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                      onClick={() => setShowNotifications(false)}
                    >
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
                className="flex items-center p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-gray-800">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getAvatarSeed()}&backgroundColor=4f46e5&backgroundType=solid&hairColor=262626&mouth=smile&eyes=happy&eyebrows=raised`}
                    alt="User avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold hidden">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 text-gray-500 dark:text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 overflow-hidden">
                  {/* User Info Section */}
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-gray-800">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getAvatarSeed()}&backgroundColor=4f46e5&backgroundType=solid&hairColor=262626&mouth=smile&eyes=happy&eyebrows=raised`}
                          alt="User avatar" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold hidden">
                          <User className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                          {getUserDisplayName()}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                          {getUserEmail()}
                        </p>
                        <div className="flex items-center mt-1">
                          {getUserRole() === 'Admin' ? (
                            <Shield className="w-3 h-3 text-green-500 dark:text-green-400 mr-1" />
                          ) : (
                            <User className="w-3 h-3 text-blue-500 dark:text-blue-400 mr-1" />
                          )}
                          <span className={`text-xs ${getUserRole() === 'Admin' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            {getUserRole()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* User Stats - RESTORED SECTION */}
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
                  <div className="py-1">
                    {userMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleUserMenuItemClick(item)}
                        className={`flex items-center w-full px-4 sm:px-6 py-2.5 sm:py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-base ${
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