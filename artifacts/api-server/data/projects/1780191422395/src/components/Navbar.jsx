import { useState } from 'react';

const navLinks = [
  { label: 'Browse', href: '#browse' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Reviews', href: '#testimonials' },
  { label: 'Sell', href: '#cta' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#080C0A]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-[#080C0A] font-bold text-sm transition-transform duration-200 group-hover:scale-105">E</span>
          <span className="font-['Syne'] font-bold text-xl tracking-tight">EasyGet</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-white/60 hover:text-white transition-all duration-200"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#cta"
            className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#080C0A] text-sm font-semibold hover:opacity-90 transition-all duration-200"
          >
            Get Started
          </a>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-64' : 'max-h-0'}`}>
        <div className="px-4 pb-4 flex flex-col gap-3 border-b border-white/5">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm text-white/60 hover:text-white transition-all duration-200 py-1"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#cta"
            onClick={() => setOpen(false)}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#080C0A] text-sm font-semibold text-center hover:opacity-90 transition-all duration-200"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}