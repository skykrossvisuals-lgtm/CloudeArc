import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Programs from './components/Programs';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import CTA from './components/CTA';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-apex-deeper font-inter text-white">
      <Navbar />
      <Hero />
      <Features />
      <Programs />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
