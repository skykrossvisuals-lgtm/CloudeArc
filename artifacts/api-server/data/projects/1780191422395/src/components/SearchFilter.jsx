import { useState } from 'react';

const categories = ['All', 'Electronics', 'Furniture', 'Rentals', 'Services', 'Vehicles', 'Fashion'];

export default function SearchFilter() {
  const [active, setActive] = useState('All');

  return (
    <section id="browse" className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Search bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search for anything — iPhone, apartment rental, logo design..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/[0.07] transition-all duration-200 text-sm"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                active === cat
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#080C0A]'
                  : 'border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}