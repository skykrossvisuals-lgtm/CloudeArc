import React from 'react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-[400px] w-[500px] rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-emerald-300 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Now serving 50+ cities worldwide
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl">
            <span className="block bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Buy & Sell
            </span>
            <span className="mt-2 block bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Anything, Anywhere
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl">
            EasyGet is the modern marketplace where you can discover unique products, rent
            properties, book services, and connect with trusted sellers — all in one place.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#listings"
              className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-center text-lg font-bold text-[#080C0A] transition-all duration-200 hover:opacity-90 hover:shadow-xl hover:shadow-emerald-500/25 sm:w-auto"
            >
              Start Buying
            </a>
            <a
              href="#sell"
              className="w-full rounded-full border border-white/20 bg-white/5 px-8 py-4 text-center text-lg font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:bg-white/10 sm:w-auto"
            >
              Become a Seller
            </a>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-8">
            {[
              { value: '2.4M+', label: 'Active Users' },
              { value: '180K+', label: 'Products Listed' },
              { value: '$420M+', label: 'Transactions' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}