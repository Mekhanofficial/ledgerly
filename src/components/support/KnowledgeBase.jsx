import React from 'react';
import { FileText, Video, BookOpen, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const KnowledgeBase = () => {
  const { isDarkMode } = useTheme();
  
  const categories = [
    {
      title: 'Getting Started',
      items: [
        { title: 'Setup your account', icon: FileText, time: '5 min read' },
        { title: 'Importing data', icon: FileText, time: '8 min read' },
        { title: 'User permissions', icon: FileText, time: '6 min read' }
      ]
    },
    {
      title: 'Invoicing',
      items: [
        { title: 'Create your first invoice', icon: FileText, time: '7 min read' },
        { title: 'Recurring invoices', icon: FileText, time: '10 min read' },
        { title: 'Payment tracking', icon: FileText, time: '8 min read' }
      ]
    },
    {
      title: 'Inventory',
      items: [
        { title: 'Add products', icon: FileText, time: '5 min read' },
        { title: 'Stock management', icon: FileText, time: '9 min read' },
        { title: 'Supplier management', icon: FileText, time: '7 min read' }
      ]
    },
    {
      title: 'Video Tutorials',
      items: [
        { title: 'Dashboard overview', icon: Video, time: '12 min watch' },
        { title: 'Reporting guide', icon: Video, time: '15 min watch' },
        { title: 'Advanced features', icon: Video, time: '20 min watch' }
      ]
    }
  ];

  return (
    <div className={`border rounded-xl overflow-hidden ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className={`px-6 py-4 border-b ${
        isDarkMode 
          ? 'border-gray-700 bg-gray-800' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <h3 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Knowledge Base
        </h3>
        <p className={`mt-1 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Browse articles and tutorials
        </p>
      </div>
      
      <div className="p-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Search for help articles..."
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div key={category.title} className="space-y-3">
              <h4 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {category.title}
              </h4>
              <div className="space-y-2">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      to="#"
                      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'border-gray-700 hover:bg-gray-750' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className={`w-4 h-4 mr-3 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {item.title}
                        </span>
                      </div>
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {item.time}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className={`mt-8 pt-6 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h4 className={`font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Quick Links
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="#"
              className={`flex items-center p-4 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'border-gray-700 hover:bg-gray-750' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <div className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  User Guide
                </div>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Complete documentation
                </div>
              </div>
            </Link>
            <Link
              to="#"
              className={`flex items-center p-4 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'border-gray-700 hover:bg-gray-750' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Video className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <div className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Video Library
                </div>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Step-by-step tutorials
                </div>
              </div>
            </Link>
            <Link
              to="#"
              className={`flex items-center p-4 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'border-gray-700 hover:bg-gray-750' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <div className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  API Docs
                </div>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Developer resources
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;