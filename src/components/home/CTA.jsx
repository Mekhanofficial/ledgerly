import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, Zap, Rocket } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-t from-white to-primary-50/20 dark:from-gray-900 dark:to-primary-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Inverted gradient */}
          <div className="bg-gradient-to-tl from-white to-primary-50/40 dark:from-gray-800 dark:to-primary-900/20 rounded-2xl p-6 md:p-8 lg:p-10 overflow-hidden border border-primary-100/30 dark:border-primary-800/20 shadow-xl shadow-primary-500/5 dark:shadow-primary-400/5">
            {/* Subtle full-width gradient overlay - also inverted */}
            <div className="absolute inset-0 bg-gradient-to-l from-primary-500/2 via-transparent to-cyan-500/2"></div>
            
            <div className="relative z-10">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl mb-4">
                  <Rocket className="w-6 h-6 text-primary-700 dark:text-primary-400" />
                </div>
                
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Transform Your
                  <span className="bg-gradient-to-l from-primary-600 to-cyan-500 dark:from-primary-400 dark:to-cyan-400 bg-clip-text text-transparent block mt-1"> Business?</span>
                </h2>
                
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  Join thousands of businesses that trust Ledgerly for their daily operations.
                </p>
                
                <div className="flex justify-center mb-8">
                  <Link 
                    to="/dashboard" 
                    className="relative overflow-hidden bg-gradient-to-l from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-300 inline-flex items-center justify-center group shadow-lg shadow-primary-500/20 dark:shadow-primary-400/20 hover:shadow-xl hover:shadow-primary-500/30"
                  >
                    <span className="relative z-10">Get Started Now</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-primary-100/30 dark:border-primary-800/20">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">Instant setup</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">Bank security</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">Cancel anytime</div>
                    </div>
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