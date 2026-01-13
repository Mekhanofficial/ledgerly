import React from 'react';
import Navbar from '../../components/home/layout/NavBar';
import Hero from '../../components/home/Hero';
import Features from '../../components/home/Features';
import Testimonials from '../../components/home/Testimonials';
import Pricing from '../../components/home/Pricing';
import FAQSection from '../../components/home/FAQ'; 
import CTA from '../../components/home/CTA';
import Footer from '../../components/home/layout/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50/20 to-white">
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQSection /> 
      <CTA />
      <Footer />
    </div>
  );
};

export default HomePage;