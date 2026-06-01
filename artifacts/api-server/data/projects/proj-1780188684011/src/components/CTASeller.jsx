import React from 'react';

export default function CTASeller() {
  return (
    <section id="sell" className="border-y border-white/10 bg-[#0a0f0d]">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
              For Sellers
            </div>
            <h2 className="text-3xl font-bold md:text-5xl">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Turn Your Items Into Income
              </span>
            </h2>
            <p className="mt-6 text-lg text-gray-400 leading-relaxed">
              Whether you\'re decluttering your home, running a small business, or managing rental
              properties — EasyGet gives you the tools to reach millions of ready buyers.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                'List items in under 2 minutes with our smart wizard',
                'Reach 2.4M+ active buyers across 50+ cities',
                'Secure payments with instant payouts to your bank',
                'Built-in shipping labels and logistics support',
                'Analytics dashboard to track performance',
                'Dedicated seller support 24/7',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#"
                className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-center text-lg font-bold text-[#080C0A] transition-all duration-200 hover:opacity-90 hover:shadow-xl hover:shadow-emerald-500/25"
              >
                Start Selling Free
              </a>
              <a
                href="#"
                className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-center text-lg font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:bg-white/10"
              >
                Seller Guide
              </a>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              {/* Mock dashboard */}
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-300">Seller Dashboard</div>
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Sales', value: '$12,450', change: '+18%', up: true },
                  { label: 'Active Listings', value: '47', change: '+5', up: true },
                  { label: 'Orders', value: '128', change: '+12%', up: true },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-gray-400">{stat.label}</div>
                    <div className="mt-1 text-lg font-bold text-white">{stat.value}</div>
                    <div className={`text-xs ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>{stat.change}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-gray-400">Recent Orders</div>
                <div className="mt-3 space-y-2">
                  {[
                    { item: 'MacBook Pro 16"', buyer: 'Alex K.', amount: '$2,499', status: 'Shipped' },
                    { item: 'Leather Jacket', buyer: 'Jamie L.', amount: '$189', status: 'Delivered' },
                    { item: 'Camera Kit', buyer: 'Morgan S.', amount: '$2,498', status: 'Processing' },
                  ].map((order) => (
                    <div key={order.item} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-white">{order.item}</div>
                        <div className="text-xs text-gray-400">{order.buyer}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white">{order.amount}</div>
                        <div className="text-xs text-emerald-400">{order.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}