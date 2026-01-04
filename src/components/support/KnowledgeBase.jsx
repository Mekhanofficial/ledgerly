import React from 'react';
import { FileText, Video, BookOpen, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const KnowledgeBase = () => {
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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Knowledge Base</h3>
        <p className="text-gray-600 mt-1">Browse articles and tutorials</p>
      </div>
      
      <div className="p-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for help articles..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div key={category.title} className="space-y-3">
              <h4 className="font-semibold text-gray-900">{category.title}</h4>
              <div className="space-y-2">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      to="#"
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-700">{item.title}</span>
                      </div>
                      <span className="text-sm text-gray-500">{item.time}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="#"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <BookOpen className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">User Guide</div>
                <div className="text-sm text-gray-600">Complete documentation</div>
              </div>
            </Link>
            <Link
              to="#"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Video className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Video Library</div>
                <div className="text-sm text-gray-600">Step-by-step tutorials</div>
              </div>
            </Link>
            <Link
              to="#"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <FileText className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">API Docs</div>
                <div className="text-sm text-gray-600">Developer resources</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;