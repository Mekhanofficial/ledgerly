import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  BarChart,
  XCircle,
  Clock,
  FileArchive,
  DollarSign,
  X
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { useNotifications } from '../../../context/NotificationContext';
import { useAccount } from '../../../context/AccountContext';
import { getAvatarSeed, getAvatarUrl, getUserDisplayName, getUserEmail, getUserRoleLabel, resolveAuthUser } from '../../../utils/userDisplay';
import { formatCurrency, getCurrencySymbol } from '../../../utils/currency';
import { hasPermission, normalizeRole } from '../../../utils/permissions';
import { normalizePlanId } from '../../../utils/subscription';
import CountUpNumber from '../../ui/CountUpNumber';

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
  const { accountInfo } = useAccount();
  
  const authUser = useSelector((state) => state.auth?.user);
  const user = resolveAuthUser(authUser);
  const baseCurrency = accountInfo?.currency || user?.currencyCode || user?.currency || 'USD';
  const normalizedRole = normalizeRole(user?.role);
  const subscriptionStatus = String(accountInfo?.subscriptionStatus || 'active').toLowerCase();
  const effectivePlan = subscriptionStatus === 'expired' ? 'starter' : normalizePlanId(accountInfo?.plan);
  const hasInventoryFeature = ['professional', 'enterprise'].includes(effectivePlan);
  const isClient = normalizedRole === 'client';
  const canAccessSettings = hasPermission(user, 'settings', 'view');
  const canAccessReports = hasPermission(user, 'reports', 'view');
  const canAccessReceipts = ['admin', 'accountant', 'super_admin'].includes(normalizedRole);
  const canManageInventoryAdmin = hasPermission(user, 'products', 'create') && hasInventoryFeature;
  const canCreateCustomer = hasPermission(user, 'customers', 'create');
  const canRecordPayments = ['admin', 'accountant', 'super_admin'].includes(normalizedRole);
  const canCreateInvoice = hasPermission(user, 'invoices', 'create');
  const canCreate = !isClient && normalizedRole !== 'super_admin' && (
    canCreateInvoice
    || canAccessReceipts
    || canManageInventoryAdmin
    || canCreateCustomer
    || canAccessReports
    || canRecordPayments
  );
  const dicebearAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${getAvatarSeed(user)}&backgroundColor=4f46e5&backgroundType=solid&hairColor=262626&mouth=smile&eyes=happy&eyebrows=raised`;
  const computedAvatarUrl = getAvatarUrl(user) || dicebearAvatarUrl;
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const invoices = useSelector((state) => state.invoices?.invoices || []);
  const customers = useSelector((state) => state.customers?.customers || []);
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [searchWidth, setSearchWidth] = useState('max-w-2xl');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const userMenuRef = useRef(null);
  const desktopCreateMenuRef = useRef(null);
  const mobileCreateMenuRef = useRef(null);
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
      const insideDesktopCreateMenu = Boolean(
        desktopCreateMenuRef.current && desktopCreateMenuRef.current.contains(event.target)
      );
      const insideMobileCreateMenu = Boolean(
        mobileCreateMenuRef.current && mobileCreateMenuRef.current.contains(event.target)
      );
      if (!insideDesktopCreateMenu && !insideMobileCreateMenu) {
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

  useEffect(() => {
    setAvatarLoadError(false);
  }, [computedAvatarUrl]);

  const showAvatarImage = Boolean(computedAvatarUrl) && !avatarLoadError;

  const toNumber = (value, fallback = 0) => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : fallback;
    }
    if (typeof value === 'string') {
      const normalized = value.replace(/[^0-9.-]/g, '');
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : fallback;
    }
    if (value && typeof value === 'object') {
      return toNumber(
        value.amount
        ?? value.total
        ?? value.value
        ?? value.raw
        ?? fallback,
        fallback
      );
    }
    return fallback;
  };

  const resolveInvoiceAmount = (invoice = {}) => {
    return toNumber(
      invoice.totalAmount
      ?? invoice.total
      ?? invoice.amount
      ?? invoice.grandTotal
      ?? invoice.raw?.totalAmount
      ?? invoice.raw?.total
      ?? invoice.raw?.amount
      ?? 0
    );
  };

  const formatRevenue = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return formatCurrency(0, baseCurrency, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    const absoluteValue = Math.abs(numeric);
    const symbol = getCurrencySymbol(baseCurrency);
    const formatCompact = (divisor, suffix) => `${symbol}${(numeric / divisor).toFixed(1).replace(/\.0$/, '')}${suffix}`;

    if (absoluteValue >= 1000000000) {
      return formatCompact(1000000000, 'B');
    }

    if (absoluteValue >= 1000000) {
      return formatCompact(1000000, 'M');
    }

    if (absoluteValue >= 1000) {
      return formatCompact(1000, 'K');
    }

    return formatCurrency(numeric, baseCurrency, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const getUserStats = () => {
    const totalInvoices = invoices?.length || 0;
    const totalCustomers = customers?.length || 0;
    const totalRevenue = invoices?.reduce((sum, inv) => sum + resolveInvoiceAmount(inv), 0) || 0;

    if (isClient) {
      const paidCount = invoices?.filter(inv => inv.status === 'paid').length || 0;
      const dueCount = invoices?.filter(inv => inv.status !== 'paid').length || 0;
      return [
        { label: 'Invoices', value: totalInvoices.toString(), icon: FileText },
        { label: 'Paid', value: paidCount.toString(), icon: CheckCircle },
        { label: 'Due', value: dueCount.toString(), icon: Clock }
      ];
    }

    return [
      { label: 'Invoices', value: totalInvoices.toString(), icon: FileText },
      { label: 'Customers', value: totalCustomers.toString(), icon: Users },
      { label: 'Revenue', value: formatRevenue(totalRevenue), icon: Briefcase }
    ];
  };

  const userStats = useMemo(() => getUserStats(), [invoices, customers, isClient, baseCurrency]);

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
      path: '/invoices/create',
      requiresRole: canCreateInvoice
    },
    {
      title: 'Generate Receipt',
      description: 'Quick POS receipt',
      icon: Receipt,
      color: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300',
      path: '/receipts',
      requiresRole: canAccessReceipts
    },
    {
      title: 'Add Product',
      description: 'Add to inventory',
      icon: Package,
      color: 'bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300',
      path: '/inventory/products/new',
      requiresRole: canManageInventoryAdmin
    }
  ].filter((item) => item.requiresRole !== false);

  // More create items for second column
  const createItemsColumn2 = [
    {
      title: 'New Report',
      description: 'Generate analytics report',
      icon: BarChart,
      color: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300',
      path: '/reports',
      requiresRole: canAccessReports
    },
    {
      title: 'Record Payment',
      description: 'Record received payment',
      icon: CreditCard,
      color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
      path: '/payments/process',
      requiresRole: canRecordPayments
    },
    {
      title: 'Add Customer',
      description: 'New customer record',
      icon: Users,
      color: 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300',
      path: '/customers',
      requiresRole: canCreateCustomer
    }
  ].filter((item) => item.requiresRole !== false);
  const createItemsMobile = [...createItems, ...createItemsColumn2];

  // User menu items
  const userMenuItems = [
    ...(canAccessSettings ? [{ label: 'Account Settings', icon: Settings, path: '/settings' }] : []),
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
    <header
      data-dashboard-navbar="true"
      className="sticky top-0 z-20 bg-white/92 dark:bg-slate-950/88 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md"
    >
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
                onKeyDown={handleSearch}
                placeholder="Search invoices, customers..."
                className="pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:focus:ring-cyan-400 dark:bg-slate-800 dark:text-white w-full"
                aria-label="Search"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Close search"
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
                onKeyDown={handleSearch}
                placeholder={isClient ? 'Search invoices...' : 'Search invoices, customers, products, reports...'}
                className="pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:focus:ring-cyan-400 dark:bg-slate-800 dark:text-white w-full"
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
            {canCreate && (
              <div className="relative hidden sm:block" ref={desktopCreateMenuRef}>
                <button
                  onClick={() => setCreateMenuOpen(!createMenuOpen)}
                  className="flex items-center px-3 sm:px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
                  aria-label="Create new"
                  aria-expanded={createMenuOpen}
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium hidden md:inline ml-2">Create</span>
                  <ChevronDown className={`w-4 h-4 hidden md:block ml-2 transition-transform ${createMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {createMenuOpen && (
                  <div className="absolute right-0 mt-2 w-[320px] sm:w-[640px] bg-white/95 dark:bg-slate-900/95 rounded-lg shadow-xl border border-slate-200/80 dark:border-slate-700/80 py-2 z-50 overflow-hidden backdrop-blur-sm">
                    {/* Header */}
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose what you want to create</p>
                    </div>
                    
                    {/* Responsive grid for create items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                      {/* First Column */}
                      <div className={`${createItemsColumn2.length > 0 ? 'sm:border-r border-gray-200 dark:border-gray-700' : ''}`}>
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
                      {createItemsColumn2.length > 0 && (
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
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => handleCreateItemClick('/invoices/templates')}
                        className="flex items-center justify-center w-full px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View all templates
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Create Button - Icon only */}
            {canCreate && (
              <div className="relative sm:hidden" ref={mobileCreateMenuRef}>
                <button
                  onClick={() => setCreateMenuOpen(!createMenuOpen)}
                  className="p-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-colors shadow-sm"
                  aria-label="Create new"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {createMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-slate-900/95 rounded-lg shadow-xl border border-slate-200/80 dark:border-slate-700/80 py-2 z-50 backdrop-blur-sm">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Create New</h3>
                    </div>
                    {createItemsMobile.map((item, index) => (
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
            )}

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
                <div className="absolute right-0 mt-2 w-screen max-w-xs sm:max-w-sm md:w-96 bg-white/95 dark:bg-slate-900/95 rounded-lg shadow-xl border border-slate-200/80 dark:border-slate-700/80 z-50 overflow-hidden backdrop-blur-sm">
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
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-slate-800">
                  {showAvatarImage ? (
                    <img loading="lazy" decoding="async" 
                      src={computedAvatarUrl}
                      alt="User avatar" 
                      className="w-full h-full object-cover"
                      onError={() => setAvatarLoadError(true)}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}
                </div>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 text-gray-500 dark:text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 md:w-[22rem] bg-white/95 dark:bg-slate-900/95 rounded-lg shadow-xl border border-slate-200/80 dark:border-slate-700/80 py-2 z-50 overflow-hidden backdrop-blur-sm">
                  {/* User Info Section */}
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-slate-800">
                          {showAvatarImage ? (
                            <img loading="lazy" decoding="async" 
                              src={computedAvatarUrl}
                              alt="User avatar" 
                              className="w-full h-full object-cover"
                              onError={() => setAvatarLoadError(true)}
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold">
                              <User className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                          )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate whitespace-nowrap text-sm sm:text-base">
                          {getUserDisplayName(user)}
                        </h4>
                        <p
                          title={getUserEmail(user)}
                          className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap"
                        >
                          {getUserEmail(user)}
                        </p>
                        <div className="flex items-center mt-1 min-w-0">
                          {['Admin', 'Super Admin'].includes(getUserRoleLabel(user)) ? (
                            <Shield className="w-3 h-3 text-green-500 dark:text-green-400 mr-1" />
                          ) : (
                            <User className="w-3 h-3 text-blue-500 dark:text-blue-400 mr-1" />
                          )}
                          <span
                            className={`text-xs ${
                              ['Admin', 'Super Admin'].includes(getUserRoleLabel(user))
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {getUserRoleLabel(user)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* User Stats - RESTORED SECTION */}
                    <div className="grid grid-cols-3 gap-2.5 mt-4">
                      {userStats.map((stat, index) => (
                        <div key={index} className="text-center min-w-0">
                          <div className="flex items-center justify-center gap-1 min-w-0">
                            <stat.icon className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <span
                              title={stat.value}
                              className="min-w-0 text-[13px] sm:text-sm font-semibold text-gray-900 dark:text-white stat-value-safe"
                            >
                              <CountUpNumber
                                value={stat.value}
                                className="block truncate whitespace-nowrap"
                              />
                            </span>
                          </div>
                          <span
                            title={stat.label}
                            className="block mt-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate whitespace-nowrap"
                          >
                            {stat.label}
                          </span>
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

