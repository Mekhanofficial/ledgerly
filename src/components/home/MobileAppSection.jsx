import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, ShieldCheck, Smartphone } from 'lucide-react';

const MOBILE_APP_URL = 'https://expo.dev/accounts/mekhanofficial/projects/ledgerly-mobile/builds/d0adab6c-33f9-4975-aead-4cc85fd82f3e';
const MotionSection = motion.section;
const MotionDiv = motion.div;

const highlights = [
  'Android-first performance',
  'Google account ready',
  'Offline-safe invoice drafts'
];

const MobileAppSection = () => {
  return (
    <MotionSection
      id="mobile-app"
      className="relative bg-gradient-to-b from-[#f5f7ff] to-[#eef2ff] py-16 dark:from-slate-950 dark:to-slate-900 md:py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45 }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-8 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionDiv
          className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.95)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/80 md:p-8 lg:p-10"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200">
                <Smartphone className="h-3.5 w-3.5" />
                Ledgerly Mobile
              </div>

              <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
                Take Ledgerly to your pocket
              </h2>
              <p className="mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-300 md:text-lg">
                Built for Android workflows with clean mobile UI, quick invoice actions, and real-time business control on the move.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-200">
                  <PlayCircle className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                  Google & Android ready
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                  Secure account access
                </div>
              </div>

              <ul className="mt-6 space-y-2">
                {highlights.map((item) => (
                  <li key={item} className="text-sm text-slate-600 dark:text-slate-300">
                    • {item}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href={MOBILE_APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25"
                >
                  Download The App
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mx-auto w-full max-w-xs">
                <div className="absolute -inset-6 rounded-[2.4rem] bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-2xl" />
                <div className="relative rounded-[2.2rem] border border-cyan-200/80 bg-gradient-to-b from-white to-cyan-50 p-4 shadow-xl dark:border-cyan-500/25 dark:from-slate-900 dark:to-cyan-500/10">
                  <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="space-y-3 rounded-2xl bg-white/85 p-4 dark:bg-slate-900/70">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 dark:border-slate-700/70">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Invoice #INV-0321</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        Paid
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Client</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Acme Retail LLC</p>
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">$2,450.00</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/90 p-2 text-center dark:border-slate-700/80 dark:bg-slate-800/70">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Issued</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Mar 09</p>
                      </div>
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/90 p-2 text-center dark:border-slate-700/80 dark:bg-slate-800/70">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Due</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Mar 24</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-cyan-200/70 bg-cyan-50/80 p-2.5 dark:border-cyan-500/25 dark:bg-cyan-500/10">
                      <p className="text-[10px] text-cyan-700 dark:text-cyan-200">Quick items</p>
                      <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">Web design package • 1</p>
                      <p className="text-xs text-slate-700 dark:text-slate-200">SEO setup • 1</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionDiv>
      </div>
    </MotionSection>
  );
};

export default MobileAppSection;
