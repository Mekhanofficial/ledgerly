import React from 'react';
import Navbar from '../../components/home/layout/NavBar';
import Hero from '../../components/home/Hero';
import PerformanceStats from '../../components/home/PerformanceStats';
import Features from '../../components/home/Features';
import Testimonials from '../../components/home/Testimonials';
import Pricing from '../../components/home/Pricing';
import FAQSection from '../../components/home/FAQ'; 
import MobileAppSection from '../../components/home/MobileAppSection';
import CTA from '../../components/home/CTA';
import Footer from '../../components/home/layout/Footer';
import { FadeInSection } from '../../components/motion';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7ff] to-[#eef2ff] dark:from-slate-950 dark:to-slate-900">
      <Navbar />
      <main className="overflow-hidden">
        <FadeInSection delay={0.03}>
          <Hero />
        </FadeInSection>
        <PerformanceStats />
        <FadeInSection>
          <Features />
        </FadeInSection>
        <FadeInSection>
          <Testimonials />
        </FadeInSection>
        <FadeInSection>
          <Pricing />
        </FadeInSection>
        <FadeInSection>
          <MobileAppSection />
        </FadeInSection>
        <FadeInSection>
          <FAQSection />
        </FadeInSection>
        <FadeInSection>
          <CTA />
        </FadeInSection>
      </main>
      <FadeInSection amount={0.05}>
        <Footer />
      </FadeInSection>
    </div>
  );
};

export default HomePage;
