import React from 'react';
import { Check, Star, Zap, Users, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '₦9',
      period: '/month',
      description: 'Perfect for freelancers & solo entrepreneurs',
      popular: false,
      icon: <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />,
      features: [
        '100 invoices/month',
        'Unlimited receipts',
        'Basic reporting',
        'Email support',
        'Single user',
        'Mobile app access',
        'Access to 5 Standard templates only',
        'No recurring invoices',
        'No API access',
        'No team access'
      ],
      ctaText: 'Get Started',
      ctaLink: '/dashboard'
    },
    {
      name: 'Professional',
      price: '₦29',
      period: '/month',
      description: 'For growing businesses & small teams',
      popular: true,
      icon: <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />,
      features: [
        'Unlimited invoices',
        'Advanced reporting',
        'Team access (5 users)',
        'Priority support',
        'Recurring invoices',
        'Inventory management',
        'Customer database',
        'Multi-currency',
        'API access (limited)',
        'Access to ALL Standard + Premium templates'
      ],
      ctaText: 'Upgrade to Professional',
      ctaLink: '/dashboard'
    },
    {
      name: 'Enterprise',
      price: '₦79',
      period: '/month',
      description: 'For established companies & large teams',
      popular: false,
      icon: <Building className="w-6 h-6 text-primary-600 dark:text-primary-400" />,
      features: [
        'Everything in Professional',
        'Team access (20 users)',
        'Full API access',
        'White-label branding',
        'Custom workflows',
        'Dedicated manager',
        'SLA guarantee',
        'Access to ALL templates including Elite'
      ],
      ctaText: 'Contact Sales',
      ctaLink: '/contact'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-2xl mb-6">
            <span className="text-2xl font-bold text-primary-700 dark:text-primary-400">₦</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent
            <span className="text-primary-600 dark:text-primary-400"> Pricing</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan for your business needs. All plans include core features.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mt-2">
            Pricing shown in NGN.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                plan.popular 
                  ? 'border-2 border-primary-500 dark:border-primary-400 bg-gradient-to-b from-white to-primary-50/50 dark:from-gray-800 dark:to-primary-900/20 shadow-2xl shadow-primary-500/20 dark:shadow-primary-400/10' 
                  : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg dark:shadow-2xl dark:shadow-gray-900/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary-600 to-cyan-500 dark:from-primary-500 dark:to-cyan-400 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center shadow-lg shadow-primary-500/30">
                    <Star className="w-4 h-4 mr-2 fill-white" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
                    {plan.icon}
                  </div>
                  {plan.popular && (
                    <div className="text-xs font-semibold bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full">
                      Save 2 months yearly
                    </div>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">{plan.period}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
              </div>
              
              <div className="mb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start">
                      <Check className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${
                        plan.popular 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link 
                to={plan.ctaLink}
                className={`w-full py-4 rounded-2xl font-semibold text-center block transition-all duration-300 relative overflow-hidden group ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40' 
                    : 'bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-400 border-2 border-primary-200 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:border-primary-300 dark:hover:border-primary-500 shadow-md hover:shadow-lg'
                }`}
              >
                <span className="relative z-10">{plan.ctaText}</span>
                {plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-900 dark:from-primary-600 dark:to-primary-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                )}
              </Link>
              
              {plan.popular && (
                <div className="text-center mt-4 pt-4 border-t border-primary-100/50 dark:border-primary-800/30">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-primary-600 dark:text-primary-400">1,200+ businesses</span> upgraded last month
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Annual billing option */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center bg-primary-50 dark:bg-primary-900/20 rounded-full px-4 py-2">
            <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Save 2 months with annual billing</span>
            <div className="text-xs font-semibold bg-primary-600 dark:bg-primary-500 text-white px-2 py-1 rounded-full">
              Recommended
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
