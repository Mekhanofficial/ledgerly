import React, { useState } from 'react';
import { HelpCircle, Mail, Phone, MessageSquare, Clock, ChevronDown, Sparkles } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import SupportStats from '../../components/support/SupportStats';
import KnowledgeBase from '../../components/support/KnowledgeBase';
import SupportTickets from '../../components/support/SupportTickets';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import { useAccount } from '../../context/AccountContext';
import { useTheme } from '../../context/ThemeContext';

const initialTickets = [
  {
    id: 'TCK-101',
    subject: 'Unable to process payments via new gateway',
    customer: 'NextGen Technologies',
    email: 'billing@nextgentech.com',
    priority: 'high',
    status: 'open',
    lastUpdated: '5m ago',
    time: 'Just now',
    category: 'Payments'
  },
  {
    id: 'TCK-102',
    subject: 'Missing inventory sync between locations',
    customer: 'Acme Corporation',
    email: 'ops@acmecorp.com',
    priority: 'medium',
    status: 'in-progress',
    lastUpdated: '20m ago',
    time: 'Just now',
    category: 'Inventory'
  },
  {
    id: 'TCK-103',
    subject: 'Invoice PDF branding needs update',
    customer: 'TechStart Inc',
    email: 'finance@techstart.com',
    priority: 'low',
    status: 'resolved',
    lastUpdated: '1h ago',
    time: 'Today',
    category: 'Invoices'
  },
  {
    id: 'TCK-104',
    subject: 'Notification preferences not saving',
    customer: 'Solstice Labs',
    email: 'admin@solsticelabs.com',
    priority: 'medium',
    status: 'open',
    lastUpdated: '3h ago',
    time: 'Today',
    category: 'Notifications'
  }
];

const FAQ_ITEMS = [
  {
    question: 'How do I reset my password?',
    answer: 'Go to Settings > Account > Security and click "Reset Password".',
    tag: 'Security'
  },
  {
    question: 'Can I export my data?',
    answer: 'Yes, you can export your data in CSV, Excel, or PDF format from the Reports section.',
    tag: 'Reports'
  },
  {
    question: 'How do I set up recurring invoices?',
    answer: 'Navigate to Invoices > Recurring, click "New Recurring Profile", and set your schedule.',
    tag: 'Invoices'
  },
  {
    question: 'Is there a mobile app?',
    answer: 'Yes, you can download our mobile app from the App Store or Google Play Store.',
    tag: 'Mobile'
  },
  {
    question: 'How do I add team members?',
    answer: 'Go to Team from the sidebar, then click Invite/Add Member and enter their email address.',
    tag: 'Team'
  }
];

const Support = () => {
  const { addNotification } = useNotifications();
  const { addToast } = useToast();
  const { accountInfo } = useAccount();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('knowledge-base');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [tickets, setTickets] = useState(initialTickets);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    priority: 'medium',
    contactMethod: 'Send Email',
    contactDetail: accountInfo?.email || 'support@ledgerly.com',
    message: ''
  });

  const handleViewTicket = (ticketId) => {
    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, status: ticket.status === 'open' ? 'in-progress' : ticket.status }
          : ticket
      )
    );
    addToast(`Opening ticket ${ticketId}`, 'info');
  };

  const handleSupportFormChange = (event) => {
    const { name, value } = event.target;
    setSupportForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSupportRequest = (event) => {
    event.preventDefault();
    if (!supportForm.subject.trim() || !supportForm.message.trim()) {
      addToast('Subject and message are required', 'warning');
      return;
    }

    const customerName = accountInfo?.contactName || accountInfo?.companyName || 'Account Owner';
    const newTicket = {
      id: `TCK-${Date.now().toString().slice(-6)}`,
      subject: supportForm.subject.trim(),
      customer: customerName,
      email: supportForm.contactDetail || accountInfo?.email || 'support@ledgerly.com',
      priority: supportForm.priority,
      status: 'open',
      lastUpdated: 'Just now',
      time: 'Just now',
      category: supportForm.contactMethod.includes('Email')
        ? 'Email'
        : supportForm.contactMethod.includes('Call')
          ? 'Phone'
          : 'Live Chat'
    };

    setTickets(prev => [newTicket, ...prev]);
    addNotification({
      type: 'support',
      title: 'Support Request Submitted',
      description: `${newTicket.subject} (${newTicket.priority} priority)`,
      details: `Via ${newTicket.category} channel`,
      time: 'Just now',
      action: 'View Tickets',
      link: '/support',
      icon: 'HelpCircle'
    }, { showToast: false });
    addToast('Support request submitted. We will reach out shortly!', 'success');
    setSupportForm({
      subject: '',
      priority: 'medium',
      contactMethod: 'Send Email',
      contactDetail: accountInfo?.email || 'support@ledgerly.com',
      message: ''
    });
  };

  const handleContactMethodClick = (action) => {
    switch (action) {
      case 'Send Email':
        window.open('mailto:support@ledgerly.com');
        break;
      case 'Call Now':
        window.open('tel:+15551234567');
        break;
      case 'Start Chat':
        addToast('Open the chat widget at the bottom-right corner to start a conversation.', 'info');
        break;
      default:
        addToast('Support is on the way!', 'info');
    }
  };

  const handleStatusClick = () => {
    window.open('https://status.ledgerly.com', '_blank');
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@ledgerly.com',
      responseTime: 'Typically within 2 hours',
      action: 'Send Email'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: '+1 (555) 123-4567',
      responseTime: 'Mon-Fri, 9AM-6PM EST',
      action: 'Call Now'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Available on website',
      responseTime: 'Instant response',
      action: 'Start Chat'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Help & Support
            </h1>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Get help, browse documentation, and contact support
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              type="button"
              onClick={handleStatusClick}
              className={`flex items-center px-4 py-2 border rounded-lg ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Clock className="w-4 h-4 mr-2" />
              Service Status
            </button>
            <button
              type="button"
              onClick={() => handleContactMethodClick('Send Email')}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Support
            </button>
          </div>
        </div>

        {/* Stats Component */}
        <SupportStats />

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div key={method.title} className={`
                border rounded-xl p-6
                ${isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
                }`}>
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                    isDarkMode ? 'bg-primary-900/30' : 'bg-primary-100'
                  }`}>
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {method.title}
                    </h3>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {method.description}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center justify-between mt-4 pt-4 border-t ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {method.responseTime}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleContactMethodClick(method.action)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                  >
                    {method.action}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support Request Form */}
        <div className={`border rounded-xl p-6 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
            <div>
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Submit a Support Request
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Tell us how we can help and we&apos;ll respond within 2 hours.
              </p>
            </div>
            <span className={`text-xs uppercase tracking-wide font-semibold px-3 py-1 rounded-full ${
              isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-600'
            }`}>
              Priority Support
            </span>
          </div>
          <form onSubmit={handleSupportRequest} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={supportForm.subject}
                onChange={handleSupportFormChange}
                placeholder="e.g. Invoice report export not working"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Priority
                </label>
                <select
                  name="priority"
                  value={supportForm.priority}
                  onChange={handleSupportFormChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Contact Method
                </label>
                <select
                  name="contactMethod"
                  value={supportForm.contactMethod}
                  onChange={handleSupportFormChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                  }`}
                >
                  <option>Send Email</option>
                  <option>Call Now</option>
                  <option>Start Chat</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Contact details (email or phone)
              </label>
              <input
                type="text"
                name="contactDetail"
                value={supportForm.contactDetail}
                onChange={handleSupportFormChange}
                placeholder="support@ledgerly.com"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Message
              </label>
              <textarea
                name="message"
                rows="4"
                value={supportForm.message}
                onChange={handleSupportFormChange}
                placeholder="Describe the issue and any relevant steps."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                We respond within 2 hours during support hours.
              </span>
              <button
                type="submit"
                className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>

        {/* Tabs */}
        <div className={`border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <nav className="-mb-px flex space-x-8">
            {['knowledge-base', 'support-tickets', 'faq'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm capitalize
                  ${activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : `${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' 
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } border-transparent`
                  }
                `}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'knowledge-base' && <KnowledgeBase />}
        {activeTab === 'support-tickets' && (
          <SupportTickets tickets={tickets} onViewTicket={handleViewTicket} />
        )}
        {activeTab === 'faq' && (
          <div className={`border rounded-2xl overflow-hidden ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <div className={`relative px-6 py-6 border-b ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
            }`}>
              <div className="pointer-events-none absolute inset-0 opacity-70">
                <div className={`absolute -top-10 right-8 h-24 w-24 rounded-full blur-2xl ${
                  isDarkMode ? 'bg-primary-500/15' : 'bg-primary-200/60'
                }`} />
                <div className={`absolute -bottom-8 left-6 h-20 w-20 rounded-full blur-2xl ${
                  isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-100/70'
                }`} />
              </div>

              <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    isDarkMode ? 'bg-gray-700 text-gray-200 border border-gray-600' : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                    Help Center
                  </div>
                  <h3 className={`mt-3 text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Frequently Asked Questions
                  </h3>
                  <p className={`mt-1 text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Quick answers to the most common setup and workflow questions.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  {['Security', 'Invoices', 'Reports', 'Team'].map((pill) => (
                    <span
                      key={pill}
                      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-4 md:gap-6">
                <div className={`rounded-2xl border p-4 h-fit ${
                  isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isDarkMode ? 'bg-primary-900/30' : 'bg-primary-100'
                    }`}>
                      <HelpCircle className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Need more help?
                      </div>
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        If your answer is not here, contact support directly.
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleContactMethodClick('Send Email')}
                      className="w-full text-left px-3 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
                    >
                      Contact Support
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('knowledge-base')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium border ${
                        isDarkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-200 text-gray-700 hover:bg-white'
                      }`}
                    >
                      Browse Knowledge Base
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {FAQ_ITEMS.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div
                        key={faq.question}
                        className={`rounded-2xl border transition-all ${
                          isOpen
                            ? isDarkMode
                              ? 'border-primary-500/40 bg-gray-900/30'
                              : 'border-primary-200 bg-primary-50/40'
                            : isDarkMode
                              ? 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                          className="w-full flex items-start justify-between gap-3 p-4 md:p-5 text-left"
                          aria-expanded={isOpen}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                isOpen
                                  ? 'bg-primary-600 text-white'
                                  : isDarkMode
                                    ? 'bg-gray-700 text-gray-300'
                                    : 'bg-gray-100 text-gray-600'
                              }`}>
                                {faq.tag}
                              </span>
                            </div>
                            <h4 className={`font-semibold leading-snug ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {faq.question}
                            </h4>
                          </div>
                          <span className={`mt-0.5 flex-shrink-0 rounded-lg p-1.5 transition ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                          } ${isOpen ? 'rotate-180' : ''}`}>
                            <ChevronDown className={`w-4 h-4 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`} />
                          </span>
                        </button>

                        {isOpen && (
                          <div className={`px-4 md:px-5 pb-4 md:pb-5 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <div className={`pl-0 md:pl-0 pt-1 text-sm leading-relaxed border-t ${
                              isDarkMode ? 'border-gray-700' : 'border-gray-100'
                            }`}>
                              <p className="pt-3">{faq.answer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Support;
