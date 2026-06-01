import { useState } from 'react';

export default function Hero() {
  const [searchType, setSearchType] = useState('homes');

  const propertyTypes = [
    { id: 'homes', label: 'Homes', icon: '🏠' },
    { id: 'apartments', label: 'Apartments', icon: '🏢' },
    { id: 'shops', label: 'Shops', icon: '🏪' },
    { id: 'commercial', label: 'Commercial', icon: '🏢' },
  ];

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-900/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-t from-red-900/10 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
          <span className="text-sm text-slate-300">Ghana's #1 Rental Marketplace</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          Find Your Perfect <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-red-500">Rental in Ghana</span>
        </h1>

        <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto mb-12">
          Verified listings, smart matching, and secure payments for homes, apartments, shops, and commercial spaces across Ghana.
        </p>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-2 md:p-4 shadow-2xl shadow-amber-500/10">
          <div className="flex flex-col md:flex-row gap-2">
            {/* Property Type Tabs */}
            <div className="flex md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0 md:pr-2 gap-2 md:gap-0">
              {propertyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSearchType(type.id)}
                  className={`flex items-center justify-center px-4 py-3 rounded-xl whitespace-nowrap transition-all duration-200 ${
                    searchType === type.id
                      ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="mr-2 text-lg">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>

            {/* Search Inputs */}
            <div className="flex-1 flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Location (e.g., Accra, Kumasi)"
                  className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400">₵</span>
                </div>
                <input
                  type="number"
                  placeholder="Max Price (₵)"
                  className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
              <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-amber-500/20 whitespace-nowrap">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Verified Listings', value: '10K+' },
            { label: 'Happy Tenants', value: '5K+' },
            { label: 'Properties', value: '25K+' },
            { label: 'Cities', value: '12+' },
          ].map((stat, index) => (
            <div key={index}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}