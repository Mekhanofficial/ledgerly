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

function GooglePlayStoreIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
      <path d="M5 3.5 17.1 15.6 12.5 20.2 5 27.7Z" fill="#32BBFF" />
      <path d="M5 27.7 16.3 16.4 21.5 19.2 5 27.7Z" fill="#00D16E" />
      <path d="M5 3.5 21.5 12 16.3 15.2 5 3.5Z" fill="#00A6FF" />
      <path d="M21.5 12 27.5 15.3C28.8 16 28.8 17.8 27.5 18.5L21.5 21.8 16.3 16.4Z" fill="#FFD54A" />
      <path d="M16.3 15.2 21.5 12 25.2 14 20 16.8 25.2 19.7 21.5 21.8 16.3 16.4Z" fill="#FF6B5F" />
    </svg>
  );
}

function AppStoreBadgeIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0 text-white" aria-hidden="true">
      <line x1="11" y1="7" x2="21" y2="24.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="21" y1="7" x2="10" y2="25" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="8.5" y1="20.5" x2="23.5" y2="20.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

function StoreBadge({ eyebrow, label, icon: Icon }) {
  return (
    <div className="inline-flex min-w-[152px] items-center gap-2.5 rounded-2xl border border-slate-900/80 bg-slate-950 px-3.5 py-2.5 text-left shadow-lg shadow-slate-950/15 dark:border-white/10">
      <Icon />
      <div className="min-w-0">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {eyebrow}
        </p>
        <p className="truncate text-sm font-semibold text-white">{label}</p>
      </div>
    </div>
  );
}

const storeBadges = [
  {
    eyebrow: 'Available on',
    label: 'Google Play',
    icon: GooglePlayStoreIcon
  },
  {
    eyebrow: 'Also for',
    label: 'App Store',
    icon: AppStoreBadgeIcon
  }
];

const MobileAppSection = () => {
  const { isDarkMode } = useTheme();

  return (
    <MotionSection
      id="mobile-app"
      className="relative bg-gradient-to-b from-[#f5f7ff] to-[#eef2ff] py-0 dark:from-slate-950 dark:to-slate-900"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45 }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-8 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative w-full">
        <MotionDiv
          className="relative overflow-hidden border border-slate-200/80 bg-white/90 p-6 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.95)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/80 md:p-8 lg:p-10"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-4 lg:items-center">
            <div className="lg:col-span-7">
              <div className="relative z-10 flex h-full flex-col lg:pr-6">
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

                <div className="mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-[38rem]">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-200 lg:px-3.5 lg:py-2.5">
                    <PlayCircle className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                    Android ready
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-200 lg:px-3.5 lg:py-2.5">
                    <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                    Secure sign-in
                  </div>
                </div>

                <ul className="mt-6 max-w-3xl space-y-3 lg:max-w-[38rem]">
                  {highlights.map((item) => (
                    <li
                      key={item}
                      className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-slate-700/80 dark:bg-slate-800/55 dark:text-slate-300 lg:px-3.5 lg:py-2.5"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                  <a
                    href={MOBILE_APP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:from-cyan-500 hover:to-blue-500"
                  >
                    Download The App
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <div className="flex flex-wrap items-center gap-3">
                    {storeBadges.map((badge) => (
                      <StoreBadge key={badge.label} {...badge} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="pointer-events-none relative mx-auto w-full max-w-sm sm:max-w-md lg:w-[145%] lg:max-w-none lg:-translate-x-40 xl:w-[154%] xl:-translate-x-48">
                <div className="relative drop-shadow-[0_30px_60px_rgba(15,23,42,0.35)]">
                  <img
                    src={LIGHT_MODE_PREVIEW}
                    alt="Ledgerly mobile app preview in light mode"
                    className={`block h-auto w-full select-none transition-opacity duration-500 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}
                    loading="lazy"
                    decoding="async"
                    aria-hidden={isDarkMode}
                  />
                  <img
                    src={DARK_MODE_PREVIEW}
                    alt="Ledgerly mobile app preview in dark mode"
                    className={`absolute inset-0 h-full w-full select-none transition-opacity duration-500 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}
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
