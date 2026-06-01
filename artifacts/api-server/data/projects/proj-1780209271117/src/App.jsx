import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Listings from './components/Listings';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import CTABanner from './components/CTABanner';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      <Hero />
      <Features />
      <Listings />
      <HowItWorks />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
}
