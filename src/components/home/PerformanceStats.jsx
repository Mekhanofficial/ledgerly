import React from 'react';
import { motion } from 'framer-motion';
import { Clock3, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import CountUpNumber from '../ui/CountUpNumber';

const STATS = [
  {
    id: 'speed',
    label: 'Faster invoicing',
    value: 94,
    suffix: '%',
    icon: Sparkles
  },
  {
    id: 'effort',
    label: 'Reduced admin work',
    value: 75,
    suffix: '%',
    icon: TrendingUp
  },
  {
    id: 'uptime',
    label: 'Uptime guarantee',
    value: 99.9,
    suffix: '%',
    decimals: 1,
    icon: ShieldCheck
  },
  {
    id: 'support',
    label: 'Support available',
    value: 24,
    suffix: '/7',
    icon: Clock3
  }
];

const PerformanceStats = () => {
  return (
    <section
      className="w-full bg-gradient-to-b from-[#f5f7ff] to-[#eef2ff] dark:from-slate-950 dark:to-slate-900"
    >
      <motion.div
        className="relative w-full overflow-hidden bg-gradient-to-b from-[#f5f7ff] to-[#eef2ff] dark:border-slate-700 dark:from-slate-950 dark:to-slate-900"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-none absolute -top-24 left-0 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative px-4 py-5 sm:px-6 md:px-10 md:py-6">

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {STATS.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  key={stat.id}
                  className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 text-center shadow-sm dark:border-white/10 dark:bg-white/5 md:p-4"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.28, delay: index * 0.06 }}
                >
                  <div className="mx-auto mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-cyan-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-bold leading-none text-slate-800 dark:text-white md:text-3xl">
                    <CountUpNumber
                      value={`${stat.value}${stat.suffix}`}
                      decimals={stat.decimals}
                      duration={2600}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-200 md:text-sm">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default PerformanceStats;
