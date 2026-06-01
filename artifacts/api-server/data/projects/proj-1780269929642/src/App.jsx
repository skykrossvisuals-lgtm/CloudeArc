import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Stats from './components/Stats';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-300 font-sans">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          <Stats />
          <CallToAction />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
