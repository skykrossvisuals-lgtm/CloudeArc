import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <span className="font-syne text-xl font-bold text-green-400">Apex</span>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-8">
            <a href="#hero" className="text-gray-300 hover:text-green-400 transition">Home</a>
            <a href="#features" className="text-gray-300 hover:text-green-400 transition">Features</a>
            <a href="#workout" className="text-gray-300 hover:text-green-400 transition">Workout Plans</a>
            <a href="#coaching" className="text-gray-300 hover:text-green-400 transition">Live Coaching</a>
            <a href="#nutrition" className="text-gray-300 hover:text-green-400 transition">Nutrition</a>
            <a href="#wearable" className="text-gray-300 hover:text-green-400 transition">Wearable Sync</a>
            <a href="#testimonials" className="text-gray-300 hover:text-green-400 transition">Testimonials</a>
            <a href="#cta" className="text-gray-300 hover:text-green-400 transition">Get Started</a>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-md hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#hero" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-green-400">Home</a>
            <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-green-400">Features</a>
            <a href="#workout" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-green-400">Workout Plans</a>
            <a href="#coaching" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-green-400">Live Coaching</a>
            <a href="#nutrition" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-green-400">Nutrition</a>
            <a href="#wearable" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-green-400">Wearable Sync</a>
            <a href="#testimonials" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-green-400">Testimonials</a>
            <a href="#cta" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-green-400">Get Started</a>
          </div>
        </div>
      )}
    }
  );
}