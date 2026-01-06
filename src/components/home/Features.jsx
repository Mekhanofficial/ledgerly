import React from 'react';
import { FileText, Receipt, Package, Users, BarChart, UserPlus } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Professional Invoicing',
      description: 'Create branded invoices in seconds, send automatic reminders, and track payment status',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Receipt className="w-8 h-8" />,
      title: 'Instant Receipts',
      description: 'Generate receipts for walk-in customers with quick POS interface and instant email/print',
      color: 'from-emerald-500 to-green-500'
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Smart Inventory',
      description: 'Track stock levels, receive low-stock alerts, and never run out of products',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Customer Database',
      description: 'Maintain customer records, track payment history, and manage relationships',
      color: 'from-orange-500 to-amber-500'
    },
    {
      icon: <BarChart className="w-8 h-8" />,
      title: 'Financial Insights',
      description: 'View real-time dashboards, generate tax-ready reports, and make data-driven decisions',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: <UserPlus className="w-8 h-8" />,
      title: 'Team Access',
      description: 'Invite staff with role-based permissions and maintain full audit trails',
      color: 'from-gray-700 to-gray-900'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to
            <span className="text-primary-600"> Run Your Business</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools that work seamlessly together to streamline your operations
            and help your business grow efficiently.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/5 hover:border-primary-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <div className="text-white">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="text-primary-600 font-medium inline-flex items-center group/link">
                  Learn more
                  <svg className="w-4 h-4 ml-2 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Stats Banner */}
        <div className="mt-20 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">94%</div>
              <div className="text-primary-200">Faster invoicing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">75%</div>
              <div className="text-primary-200">Reduced admin work</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">99.9%</div>
              <div className="text-primary-200">Uptime guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-primary-200">Support available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;