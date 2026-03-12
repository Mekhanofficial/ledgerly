import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, ShieldCheck, Smartphone } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const MOBILE_APP_URL = 'https://expo.dev/accounts/mekhanofficial/projects/ledgerly-mobile/builds/d0adab6c-33f9-4975-aead-4cc85fd82f3e';
const LIGHT_MODE_PREVIEW = '/bglightmode.png';
const DARK_MODE_PREVIEW = '/bgdarkmode.png';
const MotionSection = motion.section;
const MotionDiv = motion.div;

const highlights = [
  'Invoices, receipts, and inventory in one mobile workspace.',
  'Secure access built for everyday business operations.'
];

const MobileAppSection = () => {
  const { isDarkMode } = useTheme();

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
          <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
            <div className="lg:col-span-7">
              <div className="flex h-full flex-col">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200">
                    <Smartphone className="h-3.5 w-3.5" />
                    Ledgerly Mobile
                  </div>

                  <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-slate-900 dark:text-white md:text-4xl">
                    Business control that travels with you.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
                    A clean mobile workspace for handling invoices, receipts, and daily business activity while you are away from your desk.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-200">
                    <PlayCircle className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                    Android ready
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-200">
                    <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                    Secure sign-in
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {highlights.map((item) => (
                    <li
                      key={item}
                      className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-slate-700/80 dark:bg-slate-800/55 dark:text-slate-300"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <a
                    href={MOBILE_APP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:from-cyan-500 hover:to-blue-500"
                  >
                    Download The App
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mx-auto w-full max-w-sm">
                <div className="relative">
                  <img
                    src={LIGHT_MODE_PREVIEW}
                    alt="Ledgerly mobile app preview in light mode"
                    className={`block h-auto w-full transition-opacity duration-500 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}
                    loading="lazy"
                    decoding="async"
                    aria-hidden={isDarkMode}
                  />
                  <img
                    src={DARK_MODE_PREVIEW}
                    alt="Ledgerly mobile app preview in dark mode"
                    className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    decoding="async"
                    aria-hidden={!isDarkMode}
                  />
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
