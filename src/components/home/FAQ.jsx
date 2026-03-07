import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CreditCard, FileText, Globe, HelpCircle, LifeBuoy, Settings, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    id: 'start',
    question: 'How do I get started with Ledgerly?',
    answer:
      'Create your account, complete your business profile, and choose a plan. You can start sending invoices immediately after onboarding.',
    icon: Zap,
    tags: ['Fast onboarding', 'Invoice-ready in minutes', 'No setup friction']
  },
  {
    id: 'payments',
    question: 'What payment methods do you support?',
    answer:
      'Ledgerly works with major gateways and bank transfer workflows, so clients can pay using their preferred method while you keep one tracking timeline.',
    icon: CreditCard,
    tags: ['Gateway integrations', 'Card + transfer support', 'Unified tracking']
  },
  {
    id: 'customization',
    question: 'Can I customize my invoices?',
    answer:
      'Yes. Add your brand assets, edit template styles, and include custom fields so every invoice matches your business identity.',
    icon: FileText,
    tags: ['Logo + branding', 'Template variants', 'Custom fields']
  },
  {
    id: 'security',
    question: 'Is my financial data secure?',
    answer:
      'Your data is protected with encrypted transport, secure storage, and routine backups. Ledgerly is built for high-trust billing operations.',
    icon: Shield,
    tags: ['Encrypted data', 'Routine backups', 'Secure access']
  },
  {
    id: 'international',
    question: 'Can I bill clients internationally?',
    answer:
      'Yes. You can invoice in multiple currencies and configure tax behavior for cross-border workflows.',
    icon: Globe,
    tags: ['Multi-currency', 'Tax flexibility', 'Global client support']
  },
  {
    id: 'plans',
    question: 'What plans are available?',
    answer:
      'Starter begins at NGN 24,000/year, Professional at NGN 84,000/year, and Enterprise at NGN 360,000/year with advanced automation and scale features.',
    icon: HelpCircle,
    tags: ['Starter', 'Professional', 'Enterprise']
  },
  {
    id: 'recurring',
    question: 'Can I automate recurring invoices?',
    answer:
      'Yes. Professional and Enterprise plans include recurring invoices with flexible schedule rules and automatic generation.',
    icon: Settings,
    tags: ['Recurring schedules', 'Auto generation', 'Less manual work']
  },
  {
    id: 'overdue',
    question: "What if a client doesn't pay on time?",
    answer:
      'Use reminders, overdue status tracking, and follow-up workflows to reduce delays and keep your collections process consistent.',
    icon: LifeBuoy,
    tags: ['Automated reminders', 'Overdue tracking', 'Follow-up workflows']
  }
];

const QUESTION_CLAMP_STYLE = {
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden'
};

const FAQSection = () => {
  const [activeId, setActiveId] = useState(FAQS[0].id);

  const activeFAQ = useMemo(() => FAQS.find((faq) => faq.id === activeId) || FAQS[0], [activeId]);
  const ActiveIcon = activeFAQ.icon;

  return (
    <motion.section
      id="faq"
      className="relative py-16 md:py-20 bg-gradient-to-b from-[#f5f7ff] to-[#eef2ff] dark:from-slate-950 dark:to-slate-900"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45 }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-8 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-4 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-xs md:text-sm font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-cyan-300">
            Help Center
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Quick answers without the
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
              {' '}long scroll
            </span>
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/88 dark:bg-slate-900/72 backdrop-blur-sm p-4 md:p-5 lg:p-6 shadow-[0_25px_65px_-45px_rgba(15,23,42,0.95)]">
          <div className="grid lg:grid-cols-12 gap-4 md:gap-5">
            <div className="lg:col-span-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-cyan-300">
                  Top Questions
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-400">{FAQS.length} items</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[360px] overflow-y-auto pr-1">
                {FAQS.map((faq, index) => {
                  const Icon = faq.icon;
                  const isActive = faq.id === activeId;

                  return (
                    <motion.button
                      key={faq.id}
                      type="button"
                      onClick={() => setActiveId(faq.id)}
                      title={faq.question}
                      className={`group min-w-0 text-left rounded-2xl border px-3.5 py-3 transition-all duration-300 ${
                        isActive
                          ? 'border-cyan-300 dark:border-cyan-500/70 bg-cyan-50/70 dark:bg-cyan-500/10 shadow-[0_18px_35px_-25px_rgba(6,182,212,0.85)]'
                          : 'border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/65 hover:border-cyan-200 dark:hover:border-cyan-500/45'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-200 border border-slate-200/70 dark:border-slate-700/70">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-[0.13em] font-semibold text-slate-400 dark:text-slate-500">
                            Q{String(index + 1).padStart(2, '0')}
                          </p>
                          <p
                            className="mt-1 text-sm font-semibold leading-5 text-slate-800 dark:text-slate-100"
                            style={QUESTION_CLAMP_STYLE}
                          >
                            {faq.question}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-7 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFAQ.id}
                  className="h-full rounded-2xl border border-slate-200/85 dark:border-slate-700/75 bg-white/92 dark:bg-slate-900/78 p-5 md:p-6"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.24 }}
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200">
                    <ActiveIcon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    {activeFAQ.question}
                  </h3>
                  <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">{activeFAQ.answer}</p>

                  <div className="mt-5 grid sm:grid-cols-2 gap-2">
                    {activeFAQ.tags.map((tag) => (
                      <div
                        key={`${activeFAQ.id}-${tag}`}
                        className="rounded-xl border border-slate-200/80 dark:border-slate-700/70 bg-slate-50/80 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-600 dark:text-slate-300"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Still need details for your workflow?
                    </p>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
                    >
                      Talk to support
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default FAQSection;
