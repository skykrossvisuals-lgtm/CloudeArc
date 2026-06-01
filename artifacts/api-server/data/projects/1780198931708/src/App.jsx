import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Categories from './components/Categories';
import HowItWorks from './components/HowItWorks';
import FeaturedListings from './components/FeaturedListings';
import Testimonials from './components/Testimonials';
import CTABanner from './components/CTABanner';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      <Hero />
      <Features />
      <Categories />
      <HowItWorks />
      <FeaturedListings />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
}
