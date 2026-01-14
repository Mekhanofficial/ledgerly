import React, { useState } from 'react';
import { ChevronDown, HelpCircle, CreditCard, Settings, FileText, Globe, Shield, Zap } from 'lucide-react';

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I get started with Ledgerly?",
      answer: "Sign up for a free account, complete your business profile, and start creating invoices immediately. No credit card required for the free plan.",
      icon: <Zap className="w-6 h-6 text-primary-500 dark:text-primary-400" />
    },
    {
      id: 2,
      question: "What payment methods do you support?",
      answer: "We support all major payment gateways including Stripe, PayPal, Square, and bank transfers. You can also accept credit cards directly through our secure payment portal.",
      icon: <CreditCard className="w-6 h-6 text-primary-500 dark:text-primary-400" />
    },
    {
      id: 3,
      question: "Can I customize my invoices?",
      answer: "Yes! You can add your logo, choose from multiple templates, customize colors, and add custom fields to match your brand identity perfectly.",
      icon: <FileText className="w-6 h-6 text-primary-500 dark:text-primary-400" />
    },
    {
      id: 4,
      question: "Is my data secure?",
      answer: "We use bank-level 256-bit SSL encryption, regular backups, and comply with GDPR regulations. Your financial data is never shared with third parties.",
      icon: <Shield className="w-6 h-6 text-primary-500 dark:text-primary-400" />
    },
    {
      id: 5,
      question: "Can I use Ledgerly internationally?",
      answer: "Absolutely! We support multiple currencies, languages, and tax systems. Create invoices in over 50 currencies and send them anywhere in the world.",
      icon: <Globe className="w-6 h-6 text-primary-500 dark:text-primary-400" />
    },
    {
      id: 6,
      question: "How does the free plan work?",
      answer: "Our free plan includes 10 invoices per month, basic templates, and email support. Upgrade anytime to unlock unlimited invoices, advanced features, and priority support.",
      icon: <HelpCircle className="w-6 h-6 text-primary-500 dark:text-primary-400" />
    },
    {
      id: 7,
      question: "Can I automate recurring invoices?",
      answer: "Yes! Set up automatic recurring invoices for regular clients. Choose daily, weekly, monthly, or custom intervals. The system will handle everything automatically.",
      icon: <Settings className="w-6 h-6 text-primary-500 dark:text-primary-400" />
    },
    {
      id: 8,
      question: "What happens if a client doesn't pay?",
      answer: "We offer automated payment reminders, late fee calculations, and collection tools. You can also set up automatic follow-up emails for overdue invoices.",
      icon: <FileText className="w-6 h-6 text-primary-500 dark:text-primary-400" />
    }
  ];

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-white to-primary-50/30 dark:from-gray-900 dark:to-primary-950/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-primary-700 dark:text-primary-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions about Ledgerly
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500 shadow-sm hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-gray-900/50 transition-all duration-300 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group-hover:bg-primary-50/50 dark:group-hover:bg-primary-900/20 transition-colors duration-300"
              >
                <div className="flex items-center space-x-5">
                  <div className="flex-shrink-0">
                    {faq.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-300 ${openFAQ === faq.id ? 'rotate-180' : ''}`}
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openFAQ === faq.id ? 'max-h-96' : 'max-h-0'}`}
              >
                <div className="px-8 pb-6">
                  <div className="pl-11 border-l-2 border-primary-200 dark:border-primary-700">
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;