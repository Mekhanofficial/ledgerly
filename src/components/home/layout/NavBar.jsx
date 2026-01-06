import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Menu, X, ChevronDown } from 'lucide-react';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Resources', href: '#' }
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
                  InvoiceFlow
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <button 
                onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
                className="inline-flex items-center text-gray-600 hover:text-primary-700 font-medium px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Solutions
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isSolutionsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSolutionsOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                  <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-primary-50">For Freelancers</a>
                  <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-primary-50">For Retail Stores</a>
                  <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-primary-50">For Agencies</a>
                  <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-primary-50">For E-commerce</a>
                </div>
              )}
            </div>
            
            {navItems.map((item) => (
              <a 
                key={item.label} 
                href={item.href}
                className="text-gray-600 hover:text-primary-700 font-medium px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-primary-700 font-medium">
              Sign In
            </Link>
            <Link to="/dashboard" className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30">
              Get Started Free
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="space-y-2">
              <a href="#" className="block px-4 py-3 rounded-lg bg-primary-50 text-primary-700 font-medium">
                Solutions
              </a>
              {navItems.map((item) => (
                <a 
                  key={item.label} 
                  href={item.href}
                  className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link 
                  to="/login" 
                  className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/dashboard" 
                  className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 text-center block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started Free
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