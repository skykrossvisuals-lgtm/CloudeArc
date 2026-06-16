import { useState } from 'react';

const btnPrimary = "px-8 py-3 rounded-full font-semibold bg-[#00FF88]/10 text-[#00FF88] hover:bg-[#00FF88]/20 transition-all duration-200";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-gray-900/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <span className="text-[#00FF88] font-bold text-xl font-[Syne]">Apex</span>
      </div>
      <div className="hidden md:flex items-center space-x-6 text-gray-300 hover:text-white transition-colors">
        <a href="#features" className="hover:underline">Features</a>
        <a href="#testimonials" className="hover:underline">How It Works</a>
        <a href="#cta" className="hover:underline">Pricing</a>
      </div>
      <div className="flex items-center space-x-3">
        <button onClick={() => setOpen(!open)} className="p-2 rounded-full hover:bg-gray-800 transition-colors md:hidden">
          {open ? (
            <svg className="h-5 w-5 text-[#00FF88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ) : (
            <svg className="h-5 w-5 text-[#00FF88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          )}
        </button>
        <a href="#cta" className={btnPrimary} hidden md:inline-flex>
          Get Started
        </a>
      </div>
      {open && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-sm mt-2 p-4 rounded-md space-y-3 text-gray-300">
          <a href="#features" className="block hover:text-white transition-colors">Features</a>
          <a href="#testimonials" className="block hover:text-white transition-colors">How It Works</a>
          <a href="#cta" className="block hover:text-white transition-colors">Pricing</a>
          <a href="#cta" className={btnPrimary} w-full justify-center>
            Get Started
          </a>
        </div>
      )}
    </nav>
  );
}