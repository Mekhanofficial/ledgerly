import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  ShieldCheck,
  ChevronLeft, 
  ChevronRight,
  LogOut,
  HelpCircle,
  Bell,
  FileArchive,
  CreditCard,
  Calendar,
  Mail
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { useNotifications } from '../../../context/NotificationContext'; // Add this import
import { getUserDisplayName, getUserInitials, getUserRoleLabel, resolveAuthUser } from '../../../utils/userDisplay';
import logo from '../../../assets/icons/ledger-icon.png';

const SideBar = ({ isOpen, mobileOpen, onMobileToggle }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const desktopScrollRef = useRef(null);
  const mobileScrollRef = useRef(null);
  const location = useLocation();
  const { unreadCount } = useNotifications(); // Get unread notification count
  const authUser = useSelector((state) => state.auth?.user);
  const user = resolveAuthUser(authUser);
  const normalizedRole = String(user?.role || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  const isSuperAdmin = normalizedRole === 'super_admin';
  const isClient = normalizedRole === 'client';
  const canAccessReports = ['admin', 'accountant', 'super_admin'].includes(normalizedRole);
  const canAccessPayments = ['admin', 'accountant', 'client', 'super_admin'].includes(normalizedRole);
  const canAccessReceipts = ['admin', 'accountant', 'super_admin'].includes(normalizedRole);
  const canManageInventory = ['admin', 'accountant', 'staff', 'viewer', 'super_admin'].includes(normalizedRole);
  const canManageInventoryAdmin = ['admin', 'accountant', 'super_admin'].includes(normalizedRole);
  const canAccessSettings = ['admin', 'super_admin'].includes(normalizedRole);
  const canManageTeam = ['admin', 'super_admin'].includes(normalizedRole);
  
  useTheme();

  const inventorySubmenu = [
    { label: 'Dashboard', path: '/inventory' },
    { label: 'Products', path: '/inventory/products' },
    { label: 'Categories', path: '/inventory/categories' },
    ...(canManageInventoryAdmin ? [{ label: 'Stock Adjustments', path: '/inventory/stock-adjustments' }] : []),
    { label: 'Suppliers', path: '/inventory/suppliers' }
  ];

  const businessMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', badge: null },
    {
      icon: FileText,
      label: 'Invoices',
      path: null,
      submenu: [
        { label: 'All Invoices', path: '/invoices' },
        { label: 'Create Invoice', path: '/invoices/create' },
        { label: 'Recurring', path: '/invoices/recurring' },
        { label: 'Templates', path: '/invoices/templates' }
      ]
    },
    ...(canAccessReceipts ? [{ icon: Receipt, label: 'Receipts', path: '/receipts' }] : []),
    { icon: FileArchive, label: 'Documents', path: '/documents' },
    ...(canManageInventory
      ? [{
          icon: Package,
          label: 'Inventory',
          path: '/inventory',
          submenu: inventorySubmenu
        }]
      : []),
    { icon: Users, label: 'Customers', path: '/customers' },
    ...(canManageTeam ? [{ icon: Mail, label: 'Team', path: '/team' }] : []),
    ...(canAccessReports ? [{ icon: BarChart3, label: 'Reports', path: '/reports' }] : []),
    ...(canAccessPayments ? [{ icon: CreditCard, label: 'Payments', path: '/payments' }] : [])
  ];

  const clientMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'My Invoices', path: '/invoices' },
    { icon: CreditCard, label: 'Payments', path: '/payments' }
  ];

  const menuItems = isSuperAdmin
    ? [{ icon: ShieldCheck, label: 'Super Admin', path: '/super-admin' }]
    : isClient
      ? clientMenuItems
      : businessMenuItems;

  // Update bottom menu items to show notification count
  const bottomMenuItems = isSuperAdmin
    ? [
        { icon: HelpCircle, label: 'Help & Support', path: '/support' },
        {
          icon: Bell,
          label: 'Notifications',
          path: '/notifications',
          badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount.toString()) : null
        }
      ]
    : isClient
      ? [
          { icon: HelpCircle, label: 'Help & Support', path: '/support' },
          {
            icon: Bell,
            label: 'Notifications',
            path: '/notifications',
            badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount.toString()) : null
          }
        ]
      : [
          { icon: HelpCircle, label: 'Help & Support', path: '/support' },
          ...(canAccessSettings ? [{ icon: Settings, label: 'Settings', path: '/settings' }] : []),
          ...(canAccessSettings ? [{ icon: CreditCard, label: 'Pricing & Plans', path: '/payments/pricing' }] : []),
          {
            icon: Bell,
            label: 'Notifications',
            path: '/notifications',
            badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount.toString()) : null
          }
        ];

  const toggleSubmenu = (label) => {
    setActiveSubmenu(activeSubmenu === label ? null : label);
  };

  useEffect(() => {
    if (location.pathname.startsWith('/invoices')) {
      setActiveSubmenu('Invoices');
      return;
    }

    if (location.pathname.startsWith('/inventory')) {
      setActiveSubmenu('Inventory');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const desktopSaved = Number(window.sessionStorage.getItem('ledgerly_sidebar_scroll_desktop'));
    if (desktopScrollRef.current && Number.isFinite(desktopSaved)) {
      desktopScrollRef.current.scrollTop = desktopSaved;
    }

    const mobileSaved = Number(window.sessionStorage.getItem('ledgerly_sidebar_scroll_mobile'));
    if (mobileScrollRef.current && Number.isFinite(mobileSaved)) {
      mobileScrollRef.current.scrollTop = mobileSaved;
    }
  }, []);

  const persistSidebarScroll = (storageKey, element) => {
    if (!element || typeof window === 'undefined') return;
    window.sessionStorage.setItem(storageKey, String(element.scrollTop));
  };

  const SidebarItem = ({ item }) => {
    const Icon = item.icon;
    const hasSubmenu = item.submenu;

    if (hasSubmenu) {
      return (
        <div>
          <button
            onClick={() => toggleSubmenu(item.label)}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:text-cyan-700 dark:hover:text-cyan-300 mb-1 ${
              activeSubmenu === item.label 
                ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300' 
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Icon className="w-5 h-5" />
              {isOpen && <span className="ml-3 font-medium">{item.label}</span>}
            </div>
            {isOpen && (
              <ChevronRight className={`w-4 h-4 transition-transform ${activeSubmenu === item.label ? 'rotate-90' : ''}`} />
            )}
          </button>
          
          <AnimatePresence initial={false}>
            {isOpen && activeSubmenu === item.label && (
              <Motion.div
                className="ml-4 pl-3 border-l-2 border-cyan-100 dark:border-cyan-500/30 space-y-1 mb-2 overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {item.submenu.map((subItem) => (
                  <NavLink
                    key={subItem.label}
                    to={subItem.path}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded text-sm transition-colors ${
                        isActive
                          ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-500/10'
                      }`
                    }
                  >
                    {subItem.label}
                  </NavLink>
                ))}
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <NavLink
        to={item.path}
        end={item.path === '/inventory'}
        className={({ isActive }) =>
          `flex items-center px-3 py-3 rounded-lg transition-colors mb-1 ${
            isActive
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:text-cyan-700 dark:hover:text-cyan-300'
          }`
        }
      >
        <div className="relative">
          <Icon className="w-5 h-5" />
          {item.badge && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {item.badge}
            </span>
          )}
        </div>
        {isOpen && (
          <>
            <span className="ml-3 font-medium">{item.label}</span>
            {item.badge && isOpen && (
              <span className="ml-auto bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <Motion.aside
        data-dashboard-sidebar="true"
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-white/92 dark:bg-slate-950/88 border-r border-slate-200/80 dark:border-slate-800/80 overflow-hidden"
        initial={false}
        animate={{ width: isOpen ? 256 : 80 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4">
          <img
            loading="eager"
            decoding="async"
            src={logo}
            alt="Ledgerly"
            className="h-10 w-10 flex-shrink-0 object-contain"
          />
        </div>

        {/* Main Menu */}
        <div
          ref={desktopScrollRef}
          onScroll={() => persistSidebarScroll('ledgerly_sidebar_scroll_desktop', desktopScrollRef.current)}
          className="flex-1 overflow-y-auto py-4 px-3"
        >
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <SidebarItem key={item.label} item={item} />
            ))}
          </nav>
        </div>

        {/* Bottom Menu */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <nav className="space-y-1">
            {bottomMenuItems.map((item) => (
              <SidebarItem key={item.label} item={item} />
            ))}
          </nav>
          
          {/* User Profile */}
          <div className="mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {getUserInitials(user)}
              </div>
              {isOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{getUserDisplayName(user)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{getUserRoleLabel(user)}</p>
                </div>
              )}
            </div>
            {isOpen && (
              <button className="mt-4 w-full flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </Motion.aside>

      {/* Mobile Sidebar */}
      <Motion.aside
        data-dashboard-sidebar="true"
        className="lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white/95 dark:bg-slate-950/95 border-r border-slate-200/80 dark:border-slate-800/80"
        initial={false}
        animate={{ x: mobileOpen ? 0 : -280 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center">
            <img
              loading="eager"
              decoding="async"
              src={logo}
              alt="Ledgerly"
              className="h-10 w-10 object-contain"
            />
          </div>
          <button
            onClick={onMobileToggle}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div
          ref={mobileScrollRef}
          onScroll={() => persistSidebarScroll('ledgerly_sidebar_scroll_mobile', mobileScrollRef.current)}
          className="overflow-y-auto h-full py-4 px-3"
        >
          <nav className="space-y-1">
            {[...menuItems, ...bottomMenuItems].map((item) => (
              <SidebarItem key={item.label} item={item} />
            ))}
          </nav>
          
          {/* User Profile */}
          <div className="mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {getUserInitials(user)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{getUserDisplayName(user)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{getUserRoleLabel(user)}</p>
              </div>
            </div>
            <button className="mt-4 w-full flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </Motion.aside>
    </>
  );
};

export default SideBar;


