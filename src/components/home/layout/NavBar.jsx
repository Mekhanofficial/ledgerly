import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' }
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl blur opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <img 
                src="/images/logo.svg" 
                alt="InvoiceFlow"
                className="relative w-10 h-10 rounded-xl transform group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center">
                      <span class="text-white font-bold">IF</span>
                    </div>
                  `;
                }}
              />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
              InvoiceFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a 
                key={item.label} 
                href={item.href}
                className="text-gray-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 font-medium px-3 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 font-medium px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              to="/dashboard" 
              className="bg-primary-600 dark:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 dark:border-gray-800">
            <div className="space-y-1">
              {navItems.map((item) => (
                <a 
                  key={item.label} 
                  href={item.href}
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <Link 
                  to="/login" 
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/dashboard" 
                  className="block bg-primary-600 dark:bg-primary-700 text-white px-4 py-3 rounded-lg font-medium text-center hover:bg-primary-700 dark:hover:bg-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;