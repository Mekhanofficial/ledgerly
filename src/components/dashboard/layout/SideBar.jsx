import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  HelpCircle,
  Bell,
  FileArchive,
  CreditCard,
  Calendar,
  Mail,
  Moon,
  Sun
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';

const Sidebar = ({ isOpen, mobileOpen, onMobileToggle }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const { isDarkMode, toggleTheme } = useTheme();

  const menuItems = [
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
    { icon: Receipt, label: 'Receipts', path: '/receipts' },
    { 
      icon: Package, 
      label: 'Inventory', 
      path: '/inventory',
      submenu: [
        { label: 'Dashboard', path: '/inventory' },
        { label: 'Products', path: '/inventory/products' },
        { label: 'Categories', path: '/inventory/categories' },
        { label: 'Stock Adjustments', path: '/inventory/stock-adjustments' },
        { label: 'Suppliers', path: '/inventory/suppliers' }
      ]
    },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
  ];

  const bottomMenuItems = [
    { icon: HelpCircle, label: 'Help & Support', path: '/support' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: '5' },
  ];

  const toggleSubmenu = (label) => {
    setActiveSubmenu(activeSubmenu === label ? null : label);
  };

  const SidebarItem = ({ item }) => {
    const Icon = item.icon;
    const hasSubmenu = item.submenu;

    if (hasSubmenu) {
      return (
        <div>
          <button
            onClick={() => toggleSubmenu(item.label)}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 mb-1 ${
              activeSubmenu === item.label 
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
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
          
          {isOpen && activeSubmenu === item.label && (
            <div className="ml-4 pl-3 border-l-2 border-primary-100 dark:border-primary-800 space-y-1 mb-2">
              {item.submenu.map((subItem) => (
                <NavLink
                  key={subItem.label}
                  to={subItem.path}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded text-sm transition-colors ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30'
                    }`
                  }
                >
                  {subItem.label}
                </NavLink>
              ))}
            </div>
          )}
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
              ? 'bg-primary-600 dark:bg-primary-700 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300'
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
      <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">ledgerly</h1>
            </div>
          )}
          {!isOpen && (
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">IF</h1>
            </div>
          )}
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <SidebarItem key={item.label} item={item} />
            ))}
          </nav>
        </div>

        {/* Bottom Menu */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {/* Theme Toggle - Added to sidebar */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors mb-4 ${
              isDarkMode
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            {isOpen && (
              <span className="ml-3 font-medium">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          <nav className="space-y-1">
            {bottomMenuItems.map((item) => (
              <SidebarItem key={item.label} item={item} />
            ))}
          </nav>
          
          {/* User Profile */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                JS
              </div>
              {isOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">John Smith</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                </div>
              )}
            </div>
            {isOpen && (
              <button className="mt-4 w-full flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">ledgerly</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Professional Edition</p>
            </div>
          </div>
          <button
            onClick={onMobileToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="overflow-y-auto h-full py-4 px-3">
          {/* Theme Toggle for Mobile */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors mb-4 ${
              isDarkMode
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 mr-3" />
            ) : (
              <Moon className="w-5 h-5 mr-3" />
            )}
            <span className="font-medium">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          <nav className="space-y-1">
            {[...menuItems, ...bottomMenuItems].map((item) => (
              <SidebarItem key={item.label} item={item} />
            ))}
          </nav>
          
          {/* User Profile */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                JS
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">John Smith</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
              </div>
            </div>
            <button className="mt-4 w-full flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;