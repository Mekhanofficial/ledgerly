import React from 'react';
import { ArrowRight, CheckCircle, BarChart3, DollarSign, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const benefits = [
    { icon: <Zap className="w-5 h-5" />, text: 'Setup in 5 minutes' },
    { icon: <DollarSign className="w-5 h-5" />, text: 'No hidden fees' },
    { icon: <Shield className="w-5 h-5" />, text: 'Bank-level security' },
    { icon: <BarChart3 className="w-5 h-5" />, text: 'Real-time analytics' }
  ];

  return (
    <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4 mr-2" />
              Trusted by 10,000+ businesses worldwide
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="block text-gray-900">Invoice, Receipt &</span>
              <span className="block bg-gradient-to-r from-primary-600 via-primary-500 to-cyan-500 bg-clip-text text-transparent">
                Inventory Management
              </span>
              <span className="block text-gray-900 mt-2">Made Simple</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              All-in-one platform for SMBs, freelancers, and retail stores. Create professional invoices, 
              track inventory, and generate reports in minutes—not hours.
            </p>
            
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <div className="text-primary-600">
                      {benefit.icon}
                    </div>
                  </div>
                  <span className="text-gray-700 font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/dashboard" 
                className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center group"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center">
                <span>Watch Demo (2 min)</span>
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
          
          {/* Right Image/Illustration */}
          <div className="lg:w-1/2 relative">
            <div className="relative">
              {/* Dashboard Preview */}
              <div className="card-gradient rounded-2xl p-6 shadow-2xl shadow-primary-500/10 animate-float">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">Dashboard Preview</div>
                </div>
                
                {/* Mock Dashboard */}
                <div className="space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-primary-50 to-white p-4 rounded-xl border border-primary-100">
                      <div className="text-2xl font-bold text-gray-900">$12,847</div>
                      <div className="text-sm text-gray-600">Monthly Revenue</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-xl border border-emerald-100">
                      <div className="text-2xl font-bold text-gray-900">98%</div>
                      <div className="text-sm text-gray-600">On-time Payments</div>
                    </div>
                  </div>
                  
                  {/* Chart */}
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm font-medium text-gray-700">Revenue Trend</div>
                      <div className="text-xs text-primary-600 font-medium">↑ 24% this month</div>
                    </div>
                    <div className="flex items-end space-x-1 h-16">
                      {[30, 45, 60, 75, 90, 80, 70].map((height, idx) => (
                        <div 
                          key={idx}
                          className="w-6 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-lg"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Recent Invoices */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-3">Recent Invoices</div>
                    <div className="space-y-2">
                      {[
                        { name: 'Acme Corp', amount: '$2,500', status: 'Paid' },
                        { name: 'Tech Solutions', amount: '$1,800', status: 'Pending' },
                        { name: 'Design Studio', amount: '$3,200', status: 'Paid' }
                      ].map((invoice, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2">
                          <div className="font-medium text-gray-900">{invoice.name}</div>
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-700">{invoice.amount}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invoice.status === 'Paid' 
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-primary-500/20 rounded-3xl blur-xl"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;