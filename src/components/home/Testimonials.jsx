import React from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Freelance Designer',
      content: 'Ledgerly cut my admin time by 70%. The automatic reminders alone are worth the price! I can now focus on my creative work instead of chasing payments.',
      avatar: 'SC',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Retail Store Owner',
      content: 'The inventory management system saved my business during the holiday rush. Real-time sync between sales and stock prevented multiple stockouts.',
      avatar: 'MR',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Consulting Firm Director',
      content: 'Professional invoices that impress our enterprise clients. The analytics helped us identify our most profitable services and double our revenue.',
      avatar: 'PS',
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gray-900" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Loved by Businesses
            <span className="text-primary-300"> Worldwide</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Join thousands of businesses that transformed their operations with Ledgerly
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 border border-gray-700 hover:border-primary-500/50 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-white text-lg">{testimonial.name}</div>
                  <div className="text-primary-300">{testimonial.role}</div>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-6">"{testimonial.content}"</p>
              
              <div className="flex text-amber-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Logos */}
        <div className="mt-20 pt-12 border-t border-gray-800">
          <p className="text-center text-gray-400 mb-8">Trusted by innovative companies</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 opacity-70">
            {['TechCorp', 'RetailX', 'ServicePro', 'CreativeLab', 'GrowthInc', 'GlobalCo'].map((company, idx) => (
              <div key={idx} className="text-center">
                <div className="text-xl font-bold text-white/30">{company}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;