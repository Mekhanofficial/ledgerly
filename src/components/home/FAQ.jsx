import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  LifeBuoy,
  Settings,
  Shield,
  Zap
} from 'lucide-react';
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

const MotionSection = motion.section;
const MotionArticle = motion.article;
const MotionDiv = motion.div;

const FAQSection = () => {
  const [activeId, setActiveId] = useState(FAQS[0].id);
  const faqItems = FAQS.map((faq, index) => ({ faq, index }));

  const handleToggle = (id) => {
    setActiveId((prev) => (prev === id ? '' : id));
  };

  const renderFaqCard = (faq, index) => {
    const Icon = faq.icon;
    const isActive = faq.id === activeId;

    return (
      <MotionArticle
        key={faq.id}
        layout
        className={`rounded-2xl border transition-all duration-300 ${
          isActive
            ? 'border-cyan-300 bg-cyan-50/70 shadow-[0_18px_35px_-25px_rgba(6,182,212,0.85)] dark:border-cyan-500/70 dark:bg-cyan-500/10'
            : 'border-slate-200/80 bg-white/75 hover:border-cyan-200 dark:border-slate-700/80 dark:bg-slate-900/65 dark:hover:border-cyan-500/45'
        }`}
      >
        <button
          type="button"
          onClick={() => handleToggle(faq.id)}
          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200/70 bg-white text-cyan-700 dark:border-slate-700/70 dark:bg-slate-800 dark:text-cyan-200">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400 dark:text-slate-500">
                Q{String(index + 1).padStart(2, '0')}
              </p>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-800 dark:text-slate-100">
                {faq.question}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 flex-shrink-0 text-slate-500 transition-transform duration-300 dark:text-slate-300 ${
              isActive ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {isActive && (
            <MotionDiv
              key={`${faq.id}-content`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-slate-200/80 px-4 pb-4 pt-3 dark:border-slate-700/80">
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {faq.answer}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {faq.tags.map((tag) => (
                    <span
                      key={`${faq.id}-${tag}`}
                      className="rounded-lg border border-slate-200/80 bg-slate-50/90 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </MotionArticle>
    );
  };

  return (
    <MotionSection
      id="faq"
      className="relative bg-gradient-to-b from-[#f5f7ff] to-[#eef2ff] py-16 dark:from-slate-950 dark:to-slate-900 md:py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45 }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-8 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-4 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center md:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-cyan-300 md:text-sm">
            Help Center
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300 md:text-base">
            Clear answers on billing, invoices, automation, and support so your team can move faster.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/88 p-4 shadow-[0_25px_65px_-45px_rgba(15,23,42,0.95)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/72 md:p-5 lg:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-cyan-300">
              Top Questions
            </p>
            <span className="rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-xs text-slate-600 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300">
              {FAQS.length} items
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:hidden">
            {faqItems.map(({ faq, index }) => renderFaqCard(faq, index))}
          </div>

          <div className="hidden items-start gap-4 md:grid md:grid-cols-2">
            <div className="space-y-4">
              {faqItems
                .filter((_, idx) => idx % 2 === 0)
                .map(({ faq, index }) => renderFaqCard(faq, index))}
            </div>
            <div className="space-y-4">
              {faqItems
                .filter((_, idx) => idx % 2 === 1)
                .map(({ faq, index }) => renderFaqCard(faq, index))}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-5 dark:border-slate-700/80">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Need something specific for your workflow?
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
            >
              Talk to support
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </MotionSection>
  );
};

export default FAQSection;
