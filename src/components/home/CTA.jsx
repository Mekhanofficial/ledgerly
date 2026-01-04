import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, Zap } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="card-gradient rounded-3xl p-8 md:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-cyan-500/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full translate-y-32 -translate-x-32"></div>
            
            <div className="relative z-10">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Ready to Transform Your Business?
                </h2>
                <p className="text-xl text-gray-600 mb-10">
                  Join thousands of businesses that trust InvoiceFlow for their daily operations.
                  Start your 14-day free trial today—no credit card required.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Link 
                    to="/dashboard" 
                    className="btn-primary text-lg px-10 py-5 inline-flex items-center justify-center group"
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button className="btn-secondary text-lg px-10 py-5">
                    Schedule a Demo
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  <div className="flex items-center justify-center space-x-3">
                    <Zap className="w-5 h-5 text-primary-600" />
                    <span className="text-gray-700 font-medium">No setup required</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <Shield className="w-5 h-5 text-primary-600" />
                    <span className="text-gray-700 font-medium">Secure & compliant</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary-600" />
                    <span className="text-gray-700 font-medium">Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;