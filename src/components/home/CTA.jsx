import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Rocket, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <motion.section
      className="relative py-16 md:py-20 bg-gradient-to-b from-[#f5f7ff] to-[#eef2ff] dark:from-slate-950 dark:to-slate-900"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45 }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-10 -top-10 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/80 p-6 md:p-8 lg:p-10 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.95)] backdrop-blur-sm overflow-hidden"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full bg-cyan-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200 mb-4">
              Ready to launch
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
              Start sending invoices that
              <span className="block mt-1 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                get paid faster
              </span>
            </h2>

            <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-300">
              Join teams using Ledgerly to automate billing, improve follow-ups, and track every payment in one dashboard.
            </p>

            <div className="mt-7 flex justify-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3.5 text-sm md:text-base font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
              >
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center justify-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200 flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Instant setup</span>
              </div>
              <div className="flex items-center justify-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200 flex items-center justify-center">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Bank security</span>
              </div>
              <div className="flex items-center justify-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Cancel anytime</span>
              </div>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300">
              <Rocket className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" />
              No credit card required
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CTA;
