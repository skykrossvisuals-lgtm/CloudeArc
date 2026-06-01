import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#1a1a2e]" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-[#0f172a]/85 to-[#1a1a2e]/90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-30" />
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#F4C430]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-sm text-slate-300">Ghana's #1 Rental Marketplace</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Find Your Perfect <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#F4C430] to-[#D4AF37] animate-gradient">
                Rental in Ghana
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              Discover homes, apartments, shops, and commercial spaces across Ghana. Verified listings, secure payments, and neighborhood insights — all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/properties" className="px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-slate-900 font-bold text-lg hover:opacity-90 transition-all duration-200 shadow-lg shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/40 transform hover:-translate-y-1">
                Browse Properties
              </Link>
              <Link to="/owners" className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all duration-200">
                List Your Property
              </Link>
            </div>
            
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">10k+</div>
                <div className="text-sm text-slate-400">Listings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">5k+</div>
                <div className="text-sm text-slate-400">Happy Tenants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-sm text-slate-400">Verified</div>
              </div>
            </div>
          </div>
          
          {/* Search Card */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#F4C430] rounded-3xl blur-2xl opacity-30" />
              <div className="relative bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">Find Your Next Place</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Location</label>
                      <input 
                        type="text" 
                        placeholder="Accra, Kumasi, Tamale..." 
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Property Type</label>
                      <select className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all">
                        <option>All Types</option>
                        <option>Apartment</option>
                        <option>House</option>
                        <option>Shop</option>
                        <option>Office</option>
                        <option>Land</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Price Range (₵)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 500 - 2000" 
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Amenities</label>
                      <select className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all">
                        <option>All Amenities</option>
                        <option>WiFi</option>
                        <option>Parking</option>
                        <option>AC</option>
                        <option>Gym</option>
                        <option>Pet Friendly</option>
                      </select>
                    </div>
                  </div>
                  
                  <button className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-slate-900 font-bold text-lg hover:opacity-90 transition-all duration-200 shadow-lg shadow-[#D4AF37]/20">
                    Search Properties
                  </button>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-slate-300 border border-white/10">Accra</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-slate-300 border border-white/10">Kumasi</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-slate-300 border border-white/10">Sekondi-Takoradi</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-slate-300 border border-white/10">Tamale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
