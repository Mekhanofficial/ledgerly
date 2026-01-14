import React from 'react';
import { FileText, Mail, MapPin, Phone, Twitter, Linkedin, Instagram, Github, ArrowRight, Globe } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    'Company': ['About', 'Careers', 'Press', 'Partners', 'Contact', 'Security'],
    'Product': ['Features', 'Pricing', 'API', 'Documentation', 'Changelog', 'Status'],
    'Solutions': ['Freelancers', 'Retail Stores', 'Agencies', 'E-commerce', 'Startups', 'Enterprise'],
  };

  const contactInfo = [
    { icon: <Mail className="w-4 h-4" />, text: 'hello@Ledgerly.com' },
    { icon: <Phone className="w-4 h-4" />, text: '+1 (555) 123-4567' },
    { icon: <MapPin className="w-4 h-4" />, text: 'San Francisco, CA' },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-800 dark:to-primary-900 rounded-2xl p-6 md:p-8 lg:p-12 text-white mb-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            <div className="lg:w-1/2 xl:w-3/5">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                Streamline your business operations today
              </h3>
              <p className="text-primary-100 dark:text-primary-300 text-base md:text-lg">
                Join thousands of businesses that trust Ledgerly for their billing and inventory management.
              </p>
            </div>
            <div className="lg:w-1/2 xl:w-2/5 w-full">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button className="bg-white text-primary-700 dark:text-primary-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-primary-200 dark:text-primary-400 text-xs mt-3">
                No credit card required. Start free forever.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Content - All sections in one horizontal line */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">
          {/* Brand & Contact - Takes up more space */}
          <div className="lg:w-2/5 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl blur opacity-70"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">Ledgerly</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Professional Billing & Inventory Platform
                </p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Empowering businesses worldwide with intuitive invoicing, 
              smart inventory management, and comprehensive financial insights.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              {contactInfo.map((info, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-gray-600 dark:text-gray-400 text-sm">
                  <div className="text-primary-600 dark:text-primary-400 flex-shrink-0">
                    {info.icon}
                  </div>
                  <span className="truncate">{info.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links Grid - All link columns in one row */}
          <div className="lg:w-3/5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
                    {category}
                  </h3>
                  <ul className="space-y-2">
                    {links.map((link) => (
                      <li key={link}>
                        <a 
                          href="#" 
                          className="text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors text-sm flex items-center group"
                        >
                          <span className="truncate">{link}</span>
                          <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-gray-600 dark:text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Ledgerly, Inc. All rights reserved.
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
              <div className="flex items-center space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
              
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <a href="#" className="hover:text-primary-700 dark:hover:text-primary-400 transition-colors whitespace-nowrap">Privacy Policy</a>
                <a href="#" className="hover:text-primary-700 dark:hover:text-primary-400 transition-colors whitespace-nowrap">Terms of Service</a>
                <a href="#" className="hover:text-primary-700 dark:hover:text-primary-400 transition-colors whitespace-nowrap">Cookie Policy</a>
                <div className="flex items-center space-x-1 whitespace-nowrap">
                  <Globe className="w-4 h-4" />
                  <span>English</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Legal Links */}
          <div className="md:hidden mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-primary-700 dark:hover:text-primary-400">Privacy</a>
              <a href="#" className="hover:text-primary-700 dark:hover:text-primary-400">Terms</a>
              <a href="#" className="hover:text-primary-700 dark:hover:text-primary-400">Security</a>
              <a href="#" className="hover:text-primary-700 dark:hover:text-primary-400">GDPR</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;