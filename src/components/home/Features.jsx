import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BarChart, FileText, Package, Receipt, UserPlus, Users } from 'lucide-react';

const Features = () => {
  const features = [
    {
      id: 'invoicing',
      icon: FileText,
      label: 'Billing Core',
      title: 'Professional Invoicing',
      description: 'Create branded invoices in seconds, send automatic reminders, and track payment status',
      iconGradient: 'from-cyan-500 to-blue-600',
      badgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200',
      hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-500/70',
      glowClass: 'bg-cyan-500/25',
      linkClass: 'text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200',
      lineClass: 'from-cyan-500/0 via-cyan-500 to-blue-500/0'
    },
    {
      id: 'receipts',
      icon: Receipt,
      label: 'POS Ready',
      title: 'Instant Receipts',
      description: 'Generate receipts for walk-in customers with quick POS interface and instant email/print',
      iconGradient: 'from-emerald-500 to-teal-500',
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
      hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-500/70',
      glowClass: 'bg-emerald-500/25',
      linkClass: 'text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200',
      lineClass: 'from-emerald-500/0 via-emerald-500 to-teal-500/0'
    },
    {
      id: 'inventory',
      icon: Package,
      label: 'Stock Control',
      title: 'Smart Inventory',
      description: 'Track stock levels, receive low-stock alerts, and never run out of products',
      iconGradient: 'from-indigo-500 to-sky-500',
      badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200',
      hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-500/70',
      glowClass: 'bg-indigo-500/25',
      linkClass: 'text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200',
      lineClass: 'from-indigo-500/0 via-indigo-500 to-sky-500/0'
    },
    {
      id: 'customers',
      icon: Users,
      label: 'Client CRM',
      title: 'Customer Database',
      description: 'Maintain customer records, track payment history, and manage relationships',
      iconGradient: 'from-orange-500 to-amber-500',
      badgeClass: 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200',
      hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-500/70',
      glowClass: 'bg-orange-500/25',
      linkClass: 'text-orange-700 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200',
      lineClass: 'from-orange-500/0 via-orange-500 to-amber-500/0'
    },
    {
      id: 'insights',
      icon: BarChart,
      label: 'Analytics',
      title: 'Financial Insights',
      description: 'View real-time dashboards, generate tax-ready reports, and make data-driven decisions',
      iconGradient: 'from-rose-500 to-red-500',
      badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200',
      hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-500/70',
      glowClass: 'bg-rose-500/25',
      linkClass: 'text-rose-700 hover:text-rose-800 dark:text-rose-300 dark:hover:text-rose-200',
      lineClass: 'from-rose-500/0 via-rose-500 to-red-500/0'
    },
    {
      id: 'teams',
      icon: UserPlus,
      label: 'Collaboration',
      title: 'Team Access',
      description: 'Invite staff with role-based permissions and maintain full audit trails',
      iconGradient: 'from-slate-700 to-slate-900 dark:from-slate-500 dark:to-slate-700',
      badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200',
      hoverBorder: 'hover:border-slate-400 dark:hover:border-slate-500/70',
      glowClass: 'bg-slate-500/25',
      linkClass: 'text-slate-700 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-200',
      lineClass: 'from-slate-500/0 via-slate-500 to-slate-700/0'
    }
  ];

  return (
    <motion.section
      className="relative py-20 bg-gradient-to-b from-[#f5f7ff] to-[#eef2ff] dark:from-slate-950 dark:to-slate-900"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45 }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-8 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-4 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs md:text-sm font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-cyan-300">
            Workflow Modules
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Everything You Need to
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
              {' '}Run Your Business
            </span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Comprehensive tools that work seamlessly together to streamline your operations
            and help your business grow efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.id}
              className={`group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 dark:bg-slate-900/70 dark:border-slate-700/80 p-6 md:p-7 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.9)] backdrop-blur-sm transition-all duration-300 ${feature.hoverBorder}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              whileHover={{ y: -8 }}
            >
              <div className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl transition-opacity duration-300 opacity-60 group-hover:opacity-95 ${feature.glowClass}`} />
              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${feature.badgeClass}`}>
                    {feature.label}
                  </span>
                  <span className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.iconGradient} flex items-center justify-center mb-5 shadow-lg shadow-slate-900/10`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>

                <button
                  type="button"
                  className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${feature.linkClass}`}
                >
                  Learn more
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
              <div className={`pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r ${feature.lineClass} opacity-80`} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Features;
