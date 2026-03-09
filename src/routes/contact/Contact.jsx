import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Headphones,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import Navbar from '../../components/home/layout/NavBar';
import Footer from '../../components/home/layout/Footer';
import { resolveAuthUser } from '../../utils/userDisplay';
import { getLiveChatEligibility } from '../../services/liveChatService';

const SUPPORT_CHANNELS = [
  {
    id: 'email',
    title: 'Email Support',
    description: 'Best for billing, account, and document questions.',
    detail: 'support@ledgerly.com',
    ctaLabel: 'Send Email',
    ctaHref: 'mailto:support@ledgerly.com',
    icon: Mail
  },
  {
    id: 'phone',
    title: 'Talk To Sales',
    description: 'Need a custom plan or onboarding guidance?',
    detail: '+1 (555) 123-4567',
    ctaLabel: 'Call Sales',
    ctaHref: 'tel:+15551234567',
    icon: Phone
  },
  {
    id: 'chat',
    title: 'Live Chat',
    description: 'Elite Enterprise support chat for high-priority product workflows.',
    detail: 'Available Mon-Fri, 8:00 AM - 8:00 PM (Elite Enterprise)',
    ctaLabel: 'Open Chat',
    ctaHref: '#',
    icon: MessageSquare
  }
];

const TOPICS = [
  'General Inquiry',
  'Sales & Pricing',
  'Billing Support',
  'Technical Help',
  'Partnership'
];

const MotionDiv = motion.div;

const ContactPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated: reduxAuthenticated } = useSelector((state) => state.auth || {});
  const authUser = resolveAuthUser(user);
  const isAuthenticated = Boolean(reduxAuthenticated && authUser);
  const authIdentity = authUser?._id || authUser?.id || authUser?.email || '';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    topic: TOPICS[0],
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [chatAccess, setChatAccess] = useState({
    loading: false,
    canAccess: false,
    reason: 'Live chat is reserved for Elite Enterprise customers.'
  });

  useEffect(() => {
    let isActive = true;

    const loadChatEligibility = async () => {
      if (!isAuthenticated) {
        if (isActive) {
          setChatAccess({
            loading: false,
            canAccess: false,
            reason: 'Create your account to request Elite Enterprise live chat.'
          });
        }
        return;
      }

      setChatAccess((prev) => ({ ...prev, loading: true }));
      try {
        const eligibility = await getLiveChatEligibility();
        if (!isActive) return;

        setChatAccess({
          loading: false,
          canAccess: Boolean(eligibility?.canAccess),
          reason:
            eligibility?.reason
            || (eligibility?.canAccess
              ? 'Live chat is available for your account.'
              : 'Live chat is reserved for Elite Enterprise customers.')
        });
      } catch {
        if (!isActive) return;
        setChatAccess({
          loading: false,
          canAccess: false,
          reason: 'We could not verify live chat access right now. Contact sales for Enterprise onboarding.'
        });
      }
    };

    loadChatEligibility();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, authIdentity]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Your name is required.';
    if (!formData.email.trim()) {
      nextErrors.email = 'Your email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email.';
    }
    if (!formData.message.trim()) nextErrors.message = 'Please share a quick message.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsSubmitted(true);
    setFormData({
      name: '',
      email: '',
      company: '',
      topic: TOPICS[0],
      message: ''
    });
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  };

  const renderChannelAction = (channel) => {
    const classes =
      'mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200';

    if (channel.id === 'chat') {
      if (!isAuthenticated) {
        return (
          <Link to="/signup" className={classes}>
            Register For Chat
            <ArrowRight className="h-4 w-4" />
          </Link>
        );
      }

      if (chatAccess.loading) {
        return <span className="mt-3 inline-flex text-sm font-semibold text-slate-500 dark:text-slate-300">Checking access...</span>;
      }

      if (chatAccess.canAccess) {
        return (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('ledgerly:open-livechat'))}
            className={`${classes} bg-transparent`}
          >
            Open Live Chat
            <ArrowRight className="h-4 w-4" />
          </button>
        );
      }

      return (
        <a href="mailto:sales@ledgerly.com?subject=Upgrade%20to%20Enterprise%20Live%20Chat" className={classes}>
          Upgrade To Enterprise
          <ArrowRight className="h-4 w-4" />
        </a>
      );
    }

    if (channel.ctaHref.startsWith('/')) {
      return (
        <Link to={channel.ctaHref} className={classes}>
          {channel.ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      );
    }

    return (
      <a href={channel.ctaHref} className={classes}>
        {channel.ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7ff] to-[#eef2ff] dark:from-slate-950 dark:to-slate-900">
      <Navbar />

      <main className="relative overflow-hidden pb-16 pt-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-6 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.14),transparent_40%),radial-gradient(circle_at_82%_82%,rgba(59,130,246,0.12),transparent_38%)]" />
        </div>

        <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-900/75 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>

          <MotionDiv
            className="mb-10 rounded-3xl border border-cyan-100/80 bg-gradient-to-br from-white to-cyan-50/35 p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.9)] backdrop-blur-sm dark:border-cyan-500/25 dark:from-slate-900 dark:to-cyan-500/10 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-8">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-cyan-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Contact Ledgerly
                </p>
                <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white md:text-5xl">
                  Real support for serious billing workflows
                </h1>
                <p className="mt-4 max-w-2xl text-sm text-slate-600 dark:text-slate-300 md:text-base">
                  Share your question and our team will route it to the right specialist. You can ask about
                  pricing, implementation, billing, or advanced setup.
                </p>
              </div>

              <div className="lg:col-span-4">
                <div className="h-full rounded-2xl border border-cyan-100/80 bg-gradient-to-br from-white to-cyan-50/60 p-5 dark:border-cyan-500/25 dark:from-slate-900 dark:to-cyan-500/10">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Support SLA</p>
                  <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                      Avg first response in under 2 hours
                    </div>
                    <div className="flex items-center gap-2">
                      <Headphones className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                      Dedicated onboarding for paid plans
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                      Enterprise-grade data handling
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                      Global team, US business hours
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MotionDiv>

          <div className="grid gap-6 lg:grid-cols-12">
            <MotionDiv
              className="lg:col-span-7 rounded-3xl border border-cyan-100/80 bg-gradient-to-br from-white to-cyan-50/35 p-6 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.95)] dark:border-cyan-500/25 dark:from-slate-900 dark:to-cyan-500/10"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Send a message</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Tell us what you need. We will follow up by email.
                </p>
              </div>

              {isSubmitted && (
                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-700/70 dark:bg-emerald-900/20 dark:text-emerald-200">
                  Message sent. Our team will reach out shortly.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:ring-4 dark:bg-slate-800 dark:text-white ${
                        errors.name
                          ? 'border-red-400 focus:ring-red-500/15'
                          : 'border-slate-300 focus:border-cyan-500 focus:ring-cyan-500/20 dark:border-slate-700 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20'
                      }`}
                      placeholder="Your full name"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Work Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:ring-4 dark:bg-slate-800 dark:text-white ${
                        errors.email
                          ? 'border-red-400 focus:ring-red-500/15'
                          : 'border-slate-300 focus:border-cyan-500 focus:ring-cyan-500/20 dark:border-slate-700 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20'
                      }`}
                      placeholder="you@company.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all placeholder-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Topic
                    </label>
                    <select
                      name="topic"
                      value={formData.topic}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
                    >
                      {TOPICS.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:ring-4 dark:bg-slate-800 dark:text-white ${
                      errors.message
                        ? 'border-red-400 focus:ring-red-500/15'
                        : 'border-slate-300 focus:border-cyan-500 focus:ring-cyan-500/20 dark:border-slate-700 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20'
                    }`}
                    placeholder="Tell us what you are trying to achieve, and we will point you to the best setup."
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-cyan-500/30 transition hover:from-cyan-500 hover:to-blue-500"
                >
                  Send Message
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </MotionDiv>

            <MotionDiv
              className="space-y-4 lg:col-span-5"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.05 }}
            >
              {SUPPORT_CHANNELS.map((channel) => {
                const Icon = channel.icon;

                return (
                  <div
                    key={channel.id}
                    className="rounded-2xl border border-cyan-100/80 bg-gradient-to-br from-white to-cyan-50/40 p-5 shadow-[0_16px_42px_-34px_rgba(15,23,42,0.95)] dark:border-cyan-500/25 dark:from-slate-900 dark:to-cyan-500/10"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-500/12 dark:text-cyan-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{channel.title}</h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{channel.description}</p>
                        <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                          {channel.detail}
                        </p>
                        {renderChannelAction(channel)}
                        {channel.id === 'chat' && (
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{chatAccess.reason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-2xl border border-cyan-100/80 bg-gradient-to-br from-white to-cyan-50/40 p-5 dark:border-cyan-500/25 dark:from-slate-900 dark:to-cyan-500/10">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Already a customer?</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Sign in to open a tracked support ticket from your account dashboard.
                </p>
                <Link
                  to="/support"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
                >
                  Open Support Center
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </MotionDiv>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
