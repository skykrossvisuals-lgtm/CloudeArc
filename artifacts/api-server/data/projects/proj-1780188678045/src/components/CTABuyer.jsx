import React from 'react';

export default function CTABuyer() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/2 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-sm md:p-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold md:text-5xl">
              <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Ready to Find Your Next Treasure?
              </span>
            </h2>
            <p className="mt-6 text-lg text-gray-400">
              Join 2.4 million buyers who trust EasyGet for secure transactions, verified sellers,
              and unbeatable prices on everything from electronics to luxury real estate.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#listings"
                className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-10 py-4 text-center text-lg font-bold text-[#080C0A] transition-all duration-200 hover:opacity-90 hover:shadow-xl hover:shadow-emerald-500/25 sm:w-auto"
              >
                Explore Marketplace
              </a>
              <a
                href="#"
                className="w-full rounded-full border border-white/20 bg-white/5 px-10 py-4 text-center text-lg font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:bg-white/10 sm:w-auto"
              >
                Download the App
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500">Free to browse · No credit card required · Instant access</p>
          </div>
        </div>
      </div>
    </section>
  );
}