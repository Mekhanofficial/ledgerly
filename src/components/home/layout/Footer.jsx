import React from 'react';
import { motion as Motion } from 'framer-motion';
import {
  ArrowRight,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter
} from 'lucide-react';
import logo from '../../../assets/icons/ledger-icon.png';

const Footer = () => {
  const socialLinks = [
    { label: 'X (Twitter)', href: 'https://x.com', icon: Twitter },
    { label: 'LinkedIn', href: 'https://www.linkedin.com', icon: Linkedin },
    { label: 'Instagram', href: 'https://www.instagram.com', icon: Instagram },
    { label: 'GitHub', href: 'https://github.com', icon: Github }
  ];

  const footerLinks = {
    Company: ['About', 'Careers', 'Press', 'Partners', 'Contact', 'Security'],
    Product: ['Features', 'Pricing', 'API', 'Documentation', 'Changelog', 'Status'],
    Solutions: ['Freelancers', 'Retail Stores', 'Agencies', 'E-commerce', 'Startups', 'Enterprise']
  };

  const contactInfo = [
    { icon: Mail, text: 'hello@ledgerly.com' },
    { icon: Phone, text: '+1 (555) 123-4567' },
    { icon: MapPin, text: 'San Francisco, CA' }
  ];

  return (
    <Motion.footer
      className="relative bg-gradient-to-b from-[#f5f7ff] to-[#eef2ff] dark:from-slate-950 dark:to-slate-900 border-t border-slate-200/70 dark:border-slate-700/70"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45 }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-4 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-6 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <Motion.div
        className="mb-12 w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:gap-8 lg:px-8 lg:py-10">
          <div className="lg:w-1/2 xl:w-3/5">
            <h3 className="mb-4 text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">
              Streamline your invoicing workflow today
            </h3>
            <p className="text-base text-cyan-50/90 md:text-lg">
              Join teams using Ledgerly for invoices, receipts, and payment tracking in one platform.
            </p>
          </div>
          <div className="w-full lg:w-1/2 xl:w-2/5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 border border-white/25 bg-white/12 px-4 py-3 text-white placeholder-white/75 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/35"
              />
              <button className="flex items-center justify-center gap-2 whitespace-nowrap bg-white px-6 py-3 font-semibold text-cyan-700 transition-colors hover:bg-cyan-50">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-3 text-xs text-cyan-100/85">No credit card required. Start free forever.</p>
          </div>
        </div>
      </Motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">
          <div className="lg:w-2/5 space-y-6">
            <div className="flex items-center space-x-3">
              <img
                loading="eager"
                decoding="async"
                src={logo}
                alt="Ledgerly"
                className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
              />
              <div>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">Ledgerly</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Professional Billing & Inventory Platform</p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Empowering businesses with intuitive invoicing, smart inventory management, and clear financial insights.
            </p>

            <div className="space-y-2">
              {contactInfo.map((info) => {
                const Icon = info.icon;

                return (
                  <div key={info.text} className="flex items-center space-x-3 text-slate-600 dark:text-slate-400 text-sm">
                    <div className="text-cyan-600 dark:text-cyan-300 flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{info.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:w-3/5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              {Object.entries(footerLinks).map(([category, links], index) => (
                <Motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-lg">{category}</h3>
                  <ul className="space-y-2">
                    {links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors text-sm flex items-center group"
                        >
                          <span className="truncate">{link}</span>
                          <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </Motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/80 dark:border-slate-700/80">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-slate-600 dark:text-slate-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Ledgerly, Inc. All rights reserved.
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
              <div className="flex items-center space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      title={social.label}
                      className="text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>

              <div className="hidden md:flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
                <a href="#" className="hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors whitespace-nowrap">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors whitespace-nowrap">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors whitespace-nowrap">
                  Cookie Policy
                </a>
                <div className="flex items-center space-x-1 whitespace-nowrap">
                  <Globe className="w-4 h-4" />
                  <span>English</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:hidden mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-700/80">
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
              <a href="#" className="hover:text-cyan-700 dark:hover:text-cyan-300">Privacy</a>
              <a href="#" className="hover:text-cyan-700 dark:hover:text-cyan-300">Terms</a>
              <a href="#" className="hover:text-cyan-700 dark:hover:text-cyan-300">Security</a>
              <a href="#" className="hover:text-cyan-700 dark:hover:text-cyan-300">GDPR</a>
            </div>
          </div>
        </div>
      </div>
    </Motion.footer>
  );
};

export default Footer;

