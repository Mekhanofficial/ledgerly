import React, { useState } from 'react';
import { HelpCircle, Mail, Phone, MessageSquare, Clock } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import SupportStats from '../../components/support/SupportStats';
import KnowledgeBase from '../../components/support/KnowledgeBase';
import SupportTickets from '../../components/support/SupportTickets';

const Support = () => {
  const [activeTab, setActiveTab] = useState('knowledge-base');

  const tickets = [
    {
      id: 'TICKET-001',
      subject: 'Cannot generate invoice PDF',
      category: 'Invoicing',
      customer: 'Sarah Johnson',
      email: 'sarah@acmecorp.com',
      priority: 'high',
      status: 'open',
      lastUpdated: 'Today, 10:30 AM',
      time: '2 hours ago'
    },
    {
      id: 'TICKET-002',
      subject: 'Payment gateway integration',
      category: 'Payments',
      customer: 'Mike Chen',
      email: 'mike@techstart.com',
      priority: 'medium',
      status: 'in-progress',
      lastUpdated: 'Today, 09:15 AM',
      time: '3 hours ago'
    },
    {
      id: 'TICKET-003',
      subject: 'Inventory sync issue',
      category: 'Inventory',
      customer: 'Lisa Brown',
      email: 'lisa@retailco.com',
      priority: 'high',
      status: 'open',
      lastUpdated: 'Yesterday, 4:45 PM',
      time: '1 day ago'
    },
    {
      id: 'TICKET-004',
      subject: 'User permission setup',
      category: 'Account',
      customer: 'Robert Wilson',
      email: 'robert@enterprise.com',
      priority: 'low',
      status: 'resolved',
      lastUpdated: 'Dec 14, 2024',
      time: '2 days ago'
    },
    {
      id: 'TICKET-005',
      subject: 'Report export error',
      category: 'Reports',
      customer: 'Emily Davis',
      email: 'emily@consulting.com',
      priority: 'medium',
      status: 'in-progress',
      lastUpdated: 'Dec 13, 2024',
      time: '3 days ago'
    }
  ];

  const handleViewTicket = (ticketId) => {
    console.log('View ticket:', ticketId);
    // Implement view ticket logic
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Help & Support</h1>
            <p className="text-gray-600 mt-1">Get help, browse documentation, and contact support</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <Clock className="w-4 h-4 mr-2" />
              Service Status
            </button>
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
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
              <div key={method.title} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{method.title}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">{method.responseTime}</div>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                    {method.action}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['knowledge-base', 'support-tickets', 'faq'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm capitalize
                  ${activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {[
                {
                  question: 'How do I reset my password?',
                  answer: 'Go to Settings > Account > Security and click "Reset Password".'
                },
                {
                  question: 'Can I export my data?',
                  answer: 'Yes, you can export all your data in CSV, Excel, or PDF format from the Reports section.'
                },
                {
                  question: 'How do I set up recurring invoices?',
                  answer: 'Navigate to Invoices > Recurring, click "New Recurring Profile", and set your schedule.'
                },
                {
                  question: 'Is there a mobile app?',
                  answer: 'Yes, you can download our mobile app from the App Store or Google Play Store.'
                },
                {
                  question: 'How do I add team members?',
                  answer: 'Go to Settings > Team > Add Member and enter their email address.'
                }
              ].map((faq, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <h4 className="font-medium text-gray-900">{faq.question}</h4>
                  <p className="text-gray-600 mt-2">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Support;