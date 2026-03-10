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
    <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f5f7ff] to-[#eef2ff] dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-200 text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4 mr-2" />
              Trusted by 10,000+ businesses worldwide
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="block text-slate-900 dark:text-white">Invoice, Receipt &</span>
              <span className="block bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 dark:from-cyan-400 dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">
                Inventory Management
              </span>
              <span className="block text-slate-900 dark:text-white mt-2">Made Simple</span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl">
              All-in-one platform for SMBs, freelancers, and retail stores. Create professional invoices,
              track inventory, and generate reports in minutes, not hours.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-500/15 flex items-center justify-center mr-3">
                    <div className="text-cyan-700 dark:text-cyan-200">
                      {benefit.icon}
                    </div>
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 inline-flex items-center justify-center group shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-6">
              No credit card required | Cancel anytime | 24/7 customer support
            </p>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="relative">
              <div className="bg-gradient-to-br from-white to-cyan-50/40 dark:from-slate-800 dark:to-cyan-500/10 rounded-2xl p-6 shadow-2xl shadow-cyan-500/10 dark:shadow-cyan-400/10 border border-cyan-100/70 dark:border-cyan-500/20 animate-float">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Dashboard Preview</div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-500/15 dark:to-slate-800 p-4 rounded-xl border border-cyan-100 dark:border-cyan-500/25">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">$12,847</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Monthly Revenue</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/30 dark:to-slate-800 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">98%</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">On-time Payments</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/90 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Revenue Trend</div>
                      <div className="text-xs text-cyan-700 dark:text-cyan-300 font-medium">+24% this month</div>
                    </div>
                    <div className="flex items-end space-x-1 h-16">
                      {[30, 45, 60, 75, 90, 80, 70].map((height, idx) => (
                        <div
                          key={idx}
                          className="w-6 bg-gradient-to-t from-cyan-600 to-blue-500 dark:from-cyan-500 dark:to-blue-400 rounded-t-lg"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Recent Invoices</div>
                    <div className="space-y-2">
                      {[
                        { name: 'Acme Corp', amount: '$2,500', status: 'Paid' },
                        { name: 'Tech Solutions', amount: '$1,800', status: 'Pending' },
                        { name: 'Design Studio', amount: '$3,200', status: 'Paid' }
                      ].map((invoice, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center py-2"
                        >
                          <div className="font-medium text-slate-900 dark:text-white">{invoice.name}</div>
                          <div className="flex items-center space-x-3">
                            <span className="text-slate-700 dark:text-slate-300">{invoice.amount}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invoice.status === 'Paid'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
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

              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 dark:from-cyan-400/20 dark:to-blue-400/20 rounded-3xl blur-xl"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-400/10 dark:to-cyan-400/10 rounded-3xl blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
