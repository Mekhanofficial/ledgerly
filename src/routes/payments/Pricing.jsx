// src/pages/Pricing.jsx
import React from 'react';
import { Check, Crown, Sparkles, Zap, Shield } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';

const Pricing = () => {
  const { isDarkMode } = useTheme();

  const plans = [
    {
      name: 'Free',
      description: 'Basic features for individuals',
      price: '$0',
      period: 'forever',
      features: [
        '2 Basic Templates',
        '50 Invoices per month',
        'Basic PDF Export',
        'Email Support',
        'Limited Customization'
      ],
      buttonText: 'Get Started',
      buttonVariant: 'outline'
    },
    {
      name: 'Pro',
      description: 'For growing businesses',
      price: '$19',
      period: 'per month',
      popular: true,
      features: [
        'All Basic Templates',
        '10 Premium Templates',
        'Unlimited Invoices',
        'Advanced PDF Export',
        'Priority Support',
        'Custom Branding',
        'Tax Calculations',
        'Analytics Dashboard'
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'primary'
    },
    {
      name: 'Enterprise',
      description: 'For large organizations',
      price: '$49',
      period: 'per month',
      features: [
        'All Premium Templates',
        'Custom Template Creation',
        'Unlimited Everything',
        'Dedicated Support',
        'API Access',
        'Team Collaboration',
        'Custom Integrations',
        'White Labeling',
        'SLA Guarantee'
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'primary'
    }
  ];

  const premiumTemplates = [
    {
      name: 'Luxury',
      category: 'Premium',
      price: '$9.99',
      features: ['Gold Accents', 'Custom Watermark', 'Premium Support']
    },
    {
      name: 'Corporate Pro',
      category: 'Premium',
      price: '$14.99',
      features: ['Multi-language', 'Tax Calculations', 'Currency Converter']
    },
    {
      name: 'Creative Studio',
      category: 'Premium',
      price: '$12.99',
      features: ['Animated Elements', 'Interactive PDF', '3D Preview']
    },
    {
      name: 'Tech Modern',
      category: 'Premium',
      price: '$11.99',
      features: ['Gradient Effects', 'Dark Mode', 'API Integration']
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 mb-4">
            <Crown className="w-4 h-4 text-purple-600 dark:text-purple-300" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              PREMIUM TEMPLATES
            </span>
          </div>
          <h1 className={`text-3xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Choose Your Perfect Plan
          </h1>
          <p className={`text-lg md:text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Start with free basic templates or unlock premium designs for your business
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl border ${
                plan.popular
                  ? 'relative border-2 border-purple-500 shadow-xl'
                  : isDarkMode
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-gray-200 bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="p-6 md:p-8">
                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className={`text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      /{plan.period}
                    </span>
                  </div>
                </div>

                <button
                  className={`w-full py-3 rounded-lg font-semibold mb-6 ${
                    plan.buttonVariant === 'primary'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {plan.buttonText}
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Templates Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Premium Templates Available
            </h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Purchase individual templates or get all with Pro/Enterprise plans
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {premiumTemplates.map((template, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-5 ${
                  isDarkMode
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className={`h-24 rounded-lg mb-4 ${getTemplateColor(idx)}`} />
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {template.name}
                    </h3>
                    <span className="text-sm text-purple-600 dark:text-purple-400">
                      {template.category}
                    </span>
                  </div>
                  <span className="font-bold text-lg">{template.price}</span>
                </div>
                <div className="space-y-2">
                  {template.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Comparison */}
        <div className={`rounded-2xl p-6 md:p-8 max-w-6xl mx-auto ${
          isDarkMode
            ? 'bg-gradient-to-r from-gray-800 to-gray-900'
            : 'bg-gradient-to-r from-gray-50 to-white'
        }`}>
          <h2 className={`text-2xl md:text-3xl font-bold mb-8 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Why Choose Premium Templates?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'Exclusive Designs',
                description: 'Unique templates not available in free version'
              },
              {
                icon: Zap,
                title: 'Advanced Features',
                description: 'Interactive elements, animations, and more'
              },
              {
                icon: Shield,
                title: 'Priority Support',
                description: 'Get help faster with dedicated support'
              },
              {
                icon: Crown,
                title: 'Regular Updates',
                description: 'New templates and features added monthly'
              }
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
                }`}>
                  <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Helper function for template colors
const getTemplateColor = (index) => {
  const colors = [
    'bg-gradient-to-br from-amber-500 to-yellow-400',
    'bg-gradient-to-br from-blue-700 to-blue-600',
    'bg-gradient-to-br from-pink-600 to-rose-500',
    'bg-gradient-to-br from-cyan-500 to-teal-500'
  ];
  return colors[index % colors.length];
};

export default Pricing;