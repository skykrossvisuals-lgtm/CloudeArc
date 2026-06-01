import React, { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: 'Browse', href: '#listings' },
    { label: 'Categories', href: '#categories' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Reviews', href: '#testimonials' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#080C0A]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600">
              <span className="text-sm font-bold text-[#080C0A]">EG</span>
            </div>
            <span className="text-xl font-bold tracking-tight">EasyGet</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#sell"
              className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-semibold text-[#080C0A] transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-emerald-500/20"
            >
              Start Selling
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-[#080C0A]/95 backdrop-blur-md md:hidden">
          <div className="space-y-1 px-4 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-300 transition-colors duration-200 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#sell"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-center text-base font-semibold text-[#080C0A] transition-all duration-200 hover:opacity-90"
            >
              Start Selling
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}