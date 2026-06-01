import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#F4C430] rounded-xl flex items-center justify-center">
                <span className="text-slate-900 font-bold text-xl">E</span>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F4C430]">
                EasyRent
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/properties" className="text-slate-300 hover:text-[#D4AF37] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Properties
              </Link>
              <Link to="/owners" className="text-slate-300 hover:text-[#D4AF37] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                For Owners
              </Link>
              <Link to="/neighborhoods" className="text-slate-300 hover:text-[#D4AF37] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Neighborhoods
              </Link>
              <Link to="/about" className="text-slate-300 hover:text-[#D4AF37] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                About
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-slate-300 hover:text-[#D4AF37] font-medium transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-slate-900 font-semibold hover:opacity-90 transition-all duration-200 shadow-lg shadow-[#D4AF37]/20">
              Sign Up
            </Link>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/properties" className="text-slate-300 hover:text-[#D4AF37] block px-3 py-2 rounded-md text-base font-medium">
              Properties
            </Link>
            <Link to="/owners" className="text-slate-300 hover:text-[#D4AF37] block px-3 py-2 rounded-md text-base font-medium">
              For Owners
            </Link>
            <Link to="/neighborhoods" className="text-slate-300 hover:text-[#D4AF37] block px-3 py-2 rounded-md text-base font-medium">
              Neighborhoods
            </Link>
            <Link to="/about" className="text-slate-300 hover:text-[#D4AF37] block px-3 py-2 rounded-md text-base font-medium">
              About
            </Link>
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3 px-3">
              <Link to="/login" className="text-slate-300 hover:text-[#D4AF37] font-medium">
                Log In
              </Link>
              <Link to="/signup" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-slate-900 font-semibold text-center">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
