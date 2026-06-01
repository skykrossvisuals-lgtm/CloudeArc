import React, { useState } from 'react';

export default function SearchFilter() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const categories = [
    'All',
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Real Estate',
    'Vehicles',
    'Services',
    'Art & Collectibles',
  ];

  const priceRanges = [
    { label: 'Any Price', value: 'all' },
    { label: 'Under $50', value: 'under50' },
    { label: '$50 – $200', value: '50-200' },
    { label: '$200 – $1,000', value: '200-1000' },
    { label: '$1,000+', value: '1000+' },
  ];

  return (
    <section className="border-y border-white/10 bg-[#0a0f0d]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Search input */}
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search products, services, rentals..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder-gray-500 backdrop-blur-sm transition-all duration-200 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Category dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white backdrop-blur-sm transition-all duration-200 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {categories.map((cat) => (
              <option key={cat.toLowerCase()} value={cat.toLowerCase()} className="bg-[#0a0f0d]">
                {cat}
              </option>
            ))}
          </select>

          {/* Price range */}
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white backdrop-blur-sm transition-all duration-200 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value} className="bg-[#0a0f0d]">
                {range.label}
              </option>
            ))}
          </select>

          {/* Search button */}
          <button
            className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3.5 font-semibold text-[#080C0A] transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-emerald-500/20"
          >
            Search
          </button>
        </div>

        {/* Active filters */}
        {(query || category !== 'all' || priceRange !== 'all') && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400">Active filters:</span>
            {query && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-300">
                Search: {query}
                <button className="ml-1 text-gray-500 hover:text-white">×</button>
              </span>
            )}
            {category !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-300">
                {category}
                <button className="ml-1 text-gray-500 hover:text-white">×</button>
              </span>
            )}
            {priceRange !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-300">
                {priceRanges.find((r) => r.value === priceRange)?.label}
                <button className="ml-1 text-gray-500 hover:text-white">×</button>
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}