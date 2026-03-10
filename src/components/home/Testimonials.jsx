import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, FileText, Quote, Star } from 'lucide-react';

const REVIEWS = [
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    role: 'Freelance Designer',
    avatar: 'https://i.pravatar.cc/120?img=12',
    quote:
      'Ledgerly helped me send invoices in under 2 minutes. Follow-ups are automatic, and my monthly paid invoices increased without extra admin work.',
    rating: 5,
    metric: '32 invoices paid last month'
  },
  {
    id: 'marcus-rodriguez',
    name: 'Marcus Rodriguez',
    role: 'Retail Store Owner',
    avatar: 'https://i.pravatar.cc/120?img=32',
    quote:
      'The invoice and receipt flow is clean. Counter sales and invoice payments now stay in one timeline, so reconciliation is finally straightforward.',
    rating: 5,
    metric: '98% payment tracking accuracy'
  },
  {
    id: 'priya-sharma',
    name: 'Priya Sharma',
    role: 'Consulting Director',
    avatar: 'https://i.pravatar.cc/120?img=47',
    quote:
      'Client invoicing used to be fragmented. With recurring invoices and status tracking, we now close billing cycles faster and reduce overdue balances.',
    rating: 5,
    metric: 'Overdues reduced by 41%'
  },
  {
    id: 'rodrigo-aguilar',
    name: 'Rodrigo Aguilar',
    role: 'Operations Manager',
    avatar: 'https://i.pravatar.cc/120?img=24',
    quote:
      'The dashboard shows who paid, who viewed, and who is overdue in one place. It gives my team clear invoice actions every morning.',
    rating: 5,
    metric: 'Saved 9 hours weekly'
  }
];

const truncateText = (text, maxLength = 115) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

const CARD_QUOTE_CLAMP_STYLE = {
  display: '-webkit-box',
  WebkitLineClamp: 4,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden'
};

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalReviews = REVIEWS.length;
  const activeReview = REVIEWS[activeIndex];

  const nextIndex = useMemo(() => {
    const value = activeIndex + 1;
    return value >= totalReviews ? 0 : value;
  }, [activeIndex, totalReviews]);

  useEffect(() => {
    if (isPaused) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex((previousIndex) => (previousIndex + 1) % totalReviews);
    }, 5500);

    return () => window.clearInterval(interval);
  }, [isPaused, totalReviews]);

  const handlePrevious = () => {
    setActiveIndex((previousIndex) => {
      const value = previousIndex - 1;
      return value < 0 ? totalReviews - 1 : value;
    });
  };

  const handleNext = () => {
    setActiveIndex((previousIndex) => (previousIndex + 1) % totalReviews);
  };

  return (
    <section
      className="py-14 md:py-16 bg-gradient-to-b from-[#f5f7ff] to-[#eef2ff] dark:from-slate-950 dark:to-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-9"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-slate-300">
            Invoice Success Stories
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            Teams billing faster with Ledgerly
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
          <div className="lg:col-span-5 grid sm:grid-cols-2 sm:auto-rows-fr gap-4">
            {REVIEWS.map((review, index) => {
              const isActive = index === activeIndex;

              return (
                <motion.button
                  key={review.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-full min-h-[176px] rounded-2xl p-4 border text-left transition-all duration-300 bg-white/95 dark:bg-slate-800/90 overflow-hidden flex flex-col ${
                    isActive
                      ? 'border-cyan-400 shadow-lg shadow-cyan-400/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.28, delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-3">
                    <img loading="lazy" decoding="async"
                      src={review.avatar}
                      alt={`${review.name} avatar`}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{review.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-300 truncate">{review.role}</p>
                    </div>
                  </div>

                  <p
                    className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-200 break-words"
                    style={CARD_QUOTE_CLAMP_STYLE}
                  >
                    {truncateText(review.quote)}
                  </p>
                </motion.button>
              );
            })}
          </div>

          <div className="lg:col-span-7 min-w-0">
            <div className="h-full rounded-2xl border border-slate-300/70 dark:border-slate-700 bg-white/90 dark:bg-slate-800/80 p-5 md:p-6 flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeReview.id}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.25 }}
                  className="flex-1"
                >
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200 mb-4">
                    <Quote className="w-4 h-4" />
                  </div>

                  <p className="text-lg md:text-xl leading-8 text-slate-700 dark:text-slate-100 max-w-3xl break-words">
                    {activeReview.quote}
                  </p>

                  <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img loading="lazy" decoding="async"
                        src={activeReview.avatar}
                        alt={`${activeReview.name} avatar`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-lg font-semibold text-slate-800 dark:text-white leading-tight truncate">
                          {activeReview.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-300 truncate">{activeReview.role}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-1 min-w-0">
                      <div className="inline-flex items-center gap-1 text-amber-400">
                        {Array.from({ length: activeReview.rating }).map((_, starIndex) => (
                          <Star key={`${activeReview.id}-star-${starIndex}`} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <div className="inline-flex max-w-full items-center gap-2 text-xs font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/30 px-2.5 py-1 rounded-full">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate">{activeReview.metric}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {REVIEWS.map((review, index) => (
                    <button
                      key={`${review.id}-dot`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === activeIndex
                          ? 'w-7 bg-cyan-500'
                          : 'w-3 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                      }`}
                      aria-label={`Go to review ${index + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={handlePrevious}
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-200 flex items-center justify-center hover:border-slate-300 dark:hover:border-slate-500"
                    whileTap={{ scale: 0.94 }}
                    whileHover={{ y: -1 }}
                    aria-label="Previous review"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleNext}
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-200 flex items-center justify-center hover:border-slate-300 dark:hover:border-slate-500"
                    whileTap={{ scale: 0.94 }}
                    whileHover={{ y: -1 }}
                    aria-label="Next review"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <motion.div
                  key={`progress-${activeReview.id}-${nextIndex}`}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  initial={{ width: '0%' }}
                  animate={{ width: isPaused ? '0%' : '100%' }}
                  transition={{ duration: isPaused ? 0 : 5.3, ease: 'linear' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

