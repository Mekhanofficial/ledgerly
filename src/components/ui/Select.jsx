// src/components/ui/CustomSelect.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Select = React.forwardRef(({ 
  value, 
  onValueChange, 
  children, 
  placeholder = "Select...",
  disabled = false,
  className = "",
  triggerClassName = "",
  contentClassName = "",
  ...props 
}, ref) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  const selectedChild = React.Children.toArray(children).find(
    child => React.isValidElement(child) && child.props.value === value
  );

  const selectedLabel = selectedChild ? selectedChild.props.children : placeholder;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue) => {
    onValueChange(newValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${triggerClassName} ${
          disabled 
            ? 'cursor-not-allowed opacity-50' 
            : 'cursor-pointer'
        } ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700 focus:ring-blue-500' 
            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-blue-500'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        {...props}
      >
        <span className="block truncate text-left">{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`} />
      </button>

      {isOpen && (
        <div
          ref={ref}
          className={`absolute z-50 mt-1 w-full rounded-md border shadow-lg animate-in fade-in-0 zoom-in-95 ${
            contentClassName
          } ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white' 
              : 'bg-white border-gray-200 text-gray-900'
          }`}
          role="listbox"
        >
          <div className="py-1 max-h-60 overflow-auto">
            {React.Children.map(children, (child) => {
              if (!React.isValidElement(child)) return null;
              
              return React.cloneElement(child, {
                selected: child.props.value === value,
                onSelect: () => handleSelect(child.props.value),
              });
            })}
          </div>
        </div>
      )}
    </div>
  );
});

Select.displayName = "Select";

export const SelectItem = React.forwardRef(({ 
  children, 
  value, 
  selected = false, 
  onSelect,
  className = "",
  ...props 
}, ref) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      ref={ref}
      className={`relative flex cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-opacity-50 ${
        selected 
          ? (isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-900') 
          : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
      } ${className}`}
      onClick={onSelect}
      role="option"
      aria-selected={selected}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {selected && <Check className="h-4 w-4" />}
      </span>
      <span className="block truncate">{children}</span>
    </div>
  );
});

SelectItem.displayName = "SelectItem";