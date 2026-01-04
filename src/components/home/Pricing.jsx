import React from 'react';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$9',
      period: '/month',
      description: 'Perfect for freelancers',
      popular: false,
      features: [
        '50 invoices/month',
        'Unlimited receipts',
        'Basic reporting',
        'Email support',
        'Single user'
      ],
      ctaText: 'Start Free Trial',
      ctaLink: '/dashboard'
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      description: 'For growing businesses',
      popular: true,
      features: [
        'Unlimited invoices',
        'Advanced reports',
        'Team access (3 users)',
        'Priority support',
        'Recurring invoices',
        'Inventory management',
        'Customer database'
      ],
      ctaText: 'Start Free Trial',
      ctaLink: '/dashboard'
    },
    {
      name: 'Enterprise',
      price: '$79',
      period: '/month',
      description: 'For established teams',
      popular: false,
      features: [
        'Everything in Professional',
        'Team access (10 users)',
        'API access',
        'Custom integrations',
        'Dedicated support',
        'White-label branding',
        'Advanced analytics',
        'Custom workflows'
      ],
      ctaText: 'Contact Sales',
      ctaLink: '/contact'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent
            <span className="text-primary-600"> Pricing</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your business needs. All plans include a 14-day free trial.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] ${
                plan.popular 
                  ? 'border-2 border-primary-500 bg-gradient-to-b from-white to-primary-50/50 shadow-xl shadow-primary-500/10' 
                  : 'border border-gray-200 bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary-600 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-2 fill-white" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl md:text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              
              <div className="mb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start">
                      <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link 
                to={plan.ctaLink}
                className={`w-full py-4 rounded-xl font-semibold text-center block transition-all duration-300 ${
                  plan.popular 
                    ? 'btn-primary' 
                    : 'btn-secondary'
                }`}
              >
                {plan.ctaText}
              </Link>
              
              {plan.popular && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  🎉 500+ businesses upgraded this month
                </p>
              )}
            </div>
          ))}
        </div>
        
        {/* FAQ / Additional Info */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h4>
                <p className="text-gray-600">Yes, you can upgrade or downgrade anytime. Changes take effect immediately.</p>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Is there a setup fee?</h4>
                <p className="text-gray-600">No setup fees. Only pay the monthly subscription fee.</p>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Do you offer discounts?</h4>
                <p className="text-gray-600">Annual plans get 2 months free. Contact us for team discounts.</p>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">What payment methods?</h4>
                <p className="text-gray-600">Credit/debit cards, PayPal, and bank transfers for annual plans.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;