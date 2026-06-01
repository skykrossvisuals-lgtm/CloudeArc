import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          HelloWorld
        </a>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Home</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">About</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Contact</a>
          <button className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all duration-200">
            Get Started
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md">
          <div className="px-6 py-4 flex flex-col gap-4">
            <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 py-2">Home</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 py-2">About</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 py-2">Contact</a>
            <button className="w-full px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all duration-200">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}