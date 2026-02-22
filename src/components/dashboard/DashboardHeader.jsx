import React, { useMemo, useState } from 'react';
import { Download, ChevronDown, Calendar, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useInvoice } from '../../context/InvoiceContext';
import { getUserDisplayName, resolveAuthUser } from '../../utils/userDisplay';

const DashboardHeader = ({
  activeFilter = 'this-month',
  onFilterChange,
  customRange,
  onCustomRangeChange,
  onApplyCustomRange,
  onExport
}) => {
  const [customRangeOpen, setCustomRangeOpen] = useState(false);
  const [showDateFilters, setShowDateFilters] = useState(false);
  const { exportInvoicesAsCSV } = useInvoice();
  const authUser = useSelector((state) => state.auth?.user);
  const user = resolveAuthUser(authUser);
  const isClient = user?.role === 'client';

  const dateFilters = [
    { id: 'today', label: 'Today', mobileLabel: 'Today' },
    { id: 'this-week', label: 'This Week', mobileLabel: 'Week' },
    { id: 'this-month', label: 'This Month', mobileLabel: 'Month' },
    { id: 'custom', label: 'Custom', mobileLabel: 'Custom', icon: ChevronDown }
  ];

  const handleExport = () => {
    if (typeof onExport === 'function') {
      onExport();
      return;
    }
    exportInvoicesAsCSV();
  };

  const handleDateFilter = (filterId) => {
    if (filterId === 'custom') {
      setCustomRangeOpen((prev) => !prev);
      setShowDateFilters(false);
      return;
    }
    if (typeof onFilterChange === 'function') {
      onFilterChange(filterId);
    }
    setCustomRangeOpen(false);
    setShowDateFilters(false);
  };

  // Get active filter label for mobile view
  const getActiveFilterLabel = () => {
    const active = dateFilters.find(filter => filter.id === activeFilter);
    return active ? active.mobileLabel || active.label : 'Month';
  };

  const customLabel = useMemo(() => {
    if (!customRange?.from || !customRange?.to) return 'Custom';
    return 'Custom';
  }, [customRange]);

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between sm:block">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-0.5 sm:mt-1">
                Welcome back, <span className="font-medium text-primary-600 dark:text-primary-400">{getUserDisplayName(user)}</span>! Here's your real-time business overview.
              </p>
            </div>
            
            {/* Mobile Export Button - Top Right */}
          {!isClient && (
            <button 
              onClick={handleExport}
              className="sm:hidden flex items-center px-2.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-medium shadow-sm hover:shadow transition-shadow whitespace-nowrap ml-2 flex-shrink-0"
              aria-label="Export"
            >
              <Download className="w-3 h-3" />
            </button>
          )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:ml-4">
          {/* Desktop Date Filter Buttons */}
          <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {dateFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleDateFilter(filter.id)}
                className={`flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeFilter === filter.id || (filter.id === 'custom' && customRangeOpen)
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="hidden sm:inline">{filter.id === 'custom' ? customLabel : filter.label}</span>
                <span className="sm:hidden text-xs">{filter.mobileLabel}</span>
                {filter.icon && <filter.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-0.5 sm:ml-1" />}
              </button>
            ))}
          </div>

          {/* Mobile Date Filter Dropdown */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowDateFilters(!showDateFilters)}
              className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              aria-label="Date filters"
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-xs font-medium">
                {customRangeOpen ? customLabel : (activeFilter === 'custom' ? customLabel : getActiveFilterLabel())}
              </span>
              <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showDateFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {showDateFilters && (
              <>
                {/* Backdrop overlay */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDateFilters(false)}
                />
                
                {/* Dropdown positioned to stay on screen */}
                <div className="fixed left-1/2 transform -translate-x-1/2 top-20 w-[calc(100vw-2rem)] max-w-xs z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1">
                  {dateFilters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => handleDateFilter(filter.id)}
                      className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium transition-colors ${
                        activeFilter === filter.id || (filter.id === 'custom' && customRangeOpen)
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{filter.id === 'custom' ? customLabel : filter.label}</span>
                      {(activeFilter === filter.id || (filter.id === 'custom' && customRangeOpen)) && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400"></div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Desktop Export Button */}
          {!isClient && (
            <button 
              onClick={handleExport}
              className="hidden sm:flex items-center px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow transition-shadow whitespace-nowrap"
            >
              <Download className="w-3 h-3 mr-1.5" />
              <span className="text-xs sm:text-sm">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range Picker (Conditional) */}
      {customRangeOpen && (
        <div className="mt-3 p-3 sm:p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Custom Date Range</h3>
            <button
              onClick={() => setCustomRangeOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">From</label>
              <input
                type="date"
                className="w-full px-3 py-2 sm:px-3 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={customRange?.from || ''}
                onChange={(event) => {
                  if (typeof onCustomRangeChange === 'function') {
                    onCustomRangeChange({
                      ...customRange,
                      from: event.target.value
                    });
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">To</label>
              <input
                type="date"
                className="w-full px-3 py-2 sm:px-3 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={customRange?.to || ''}
                onChange={(event) => {
                  if (typeof onCustomRangeChange === 'function') {
                    onCustomRangeChange({
                      ...customRange,
                      to: event.target.value
                    });
                  }
                }}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-5">
            <button
              onClick={() => setCustomRangeOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (typeof onApplyCustomRange === 'function') {
                  onApplyCustomRange();
                } else if (typeof onFilterChange === 'function') {
                  onFilterChange('custom');
                }
                setCustomRangeOpen(false);
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
