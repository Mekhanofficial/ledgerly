import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import Navbar from '../../components/home/layout/NavBar';
import Hero from '../../components/home/Hero';
import PerformanceStats from '../../components/home/PerformanceStats';

const Features = lazy(() => import('../../components/home/Features'));
const Testimonials = lazy(() => import('../../components/home/Testimonials'));
const Pricing = lazy(() => import('../../components/home/Pricing'));
const FAQSection = lazy(() => import('../../components/home/FAQ'));
const MobileAppSection = lazy(() => import('../../components/home/MobileAppSection'));
const CTA = lazy(() => import('../../components/home/CTA'));
const Footer = lazy(() => import('../../components/home/layout/Footer'));

const SectionPlaceholder = ({ minHeight }) => (
  <div
    className="w-full"
    style={{ minHeight }}
    aria-hidden="true"
  />
);

const DeferredSection = ({ id, children, minHeight = 280, rootMargin = '280px 0px' }) => {
  const sectionRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) return undefined;
    if (typeof window === 'undefined') {
      setShouldRender(true);
      return undefined;
    }

    const target = sectionRef.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0.01
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  return (
    <section id={id} ref={sectionRef}>
      {shouldRender ? children : <SectionPlaceholder minHeight={minHeight} />}
    </section>
  );
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7ff] to-[#eef2ff] dark:from-slate-950 dark:to-slate-900">
      <Navbar />
      <main className="overflow-hidden">
        <Hero />
        <PerformanceStats />

        <DeferredSection id="features" minHeight={760}>
          <Suspense fallback={<SectionPlaceholder minHeight={760} />}>
            <Features />
          </Suspense>
        </DeferredSection>

        <DeferredSection id="testimonials" minHeight={620}>
          <Suspense fallback={<SectionPlaceholder minHeight={620} />}>
            <Testimonials />
          </Suspense>
        </DeferredSection>

        <DeferredSection id="pricing" minHeight={780}>
          <Suspense fallback={<SectionPlaceholder minHeight={780} />}>
            <Pricing />
          </Suspense>
        </DeferredSection>

        <DeferredSection minHeight={680}>
          <Suspense fallback={<SectionPlaceholder minHeight={680} />}>
            <MobileAppSection />
          </Suspense>
        </DeferredSection>

        <DeferredSection id="faq" minHeight={560}>
          <Suspense fallback={<SectionPlaceholder minHeight={560} />}>
            <FAQSection />
          </Suspense>
        </DeferredSection>

        <DeferredSection minHeight={360}>
          <Suspense fallback={<SectionPlaceholder minHeight={360} />}>
            <CTA />
          </Suspense>
        </DeferredSection>
      </main>

      <DeferredSection minHeight={260} rootMargin="120px 0px">
        <Suspense fallback={<SectionPlaceholder minHeight={260} />}>
          <Footer />
        </Suspense>
      </DeferredSection>
    </div>
  );
};

export default HomePage;
