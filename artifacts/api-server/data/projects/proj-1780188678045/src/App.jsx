import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SearchFilter from './components/SearchFilter';
import Categories from './components/Categories';
import ProductListings from './components/ProductListings';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import CTABuyer from './components/CTABuyer';
import CTASeller from './components/CTASeller';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#080C0A] text-white">
      <Navbar />
      <Hero />
      <SearchFilter />
      <Categories />
      <ProductListings />
      <HowItWorks />
      <Testimonials />
      <CTABuyer />
      <CTASeller />
      <Footer />
    </div>
  );
}