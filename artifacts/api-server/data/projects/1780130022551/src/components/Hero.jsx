export default function Hero({ onNavigate }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Glows */}
      <div className="hero-glow bg-purple-600 top-1/4 left-1/4" />
      <div className="hero-glow bg-blue-600 bottom-1/4 right-1/4" />
      <div className="hero-glow bg-emerald-600 top-1/2 left-1/2" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <div className="pulse-dot" />
          <span className="text-sm text-neutral-300">
            Trusted by <span className="text-white font-semibold">50,000+</span> users worldwide
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
          Buy & Sell Anything,
          <br />
          <span className="gradient-text">Effortlessly</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The modern marketplace for products, services, and rentals. Connect with
          thousands of buyers and sellers in a secure, intuitive platform designed
          for the way you live and work.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => onNavigate('browse')}
            className="btn-primary text-base py-4 px-8 w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Start Browsing
          </button>
          <button
            onClick={() => onNavigate('sell')}
            className="btn-secondary text-base py-4 px-8 w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            List Your Item
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { number: '50K+', label: 'Active Users' },
            { number: '120K+', label: 'Products Listed' },
            { number: '98%', label: 'Satisfaction Rate' },
            { number: '$2.4M', label: 'Transactions' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="stat-number">{stat.number}</div>
              <div className="text-neutral-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Floating Cards */}
        <div className="hidden lg:block">
          <div className="absolute top-1/3 left-8 float-animation" style={{ animationDelay: '0s' }}>
            <div className="card-glow rounded-2xl p-4 w-48">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                  🏠
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Apartment Rent</div>
                  <div className="text-xs text-neutral-500">Downtown</div>
                </div>
              </div>
              <div className="text-lg font-bold text-white">$1,200<span className="text-xs text-neutral-500 font-normal">/mo</span></div>
            </div>
          </div>

          <div className="absolute top-1/2 right-8 float-animation" style={{ animationDelay: '2s' }}>
            <div className="card-glow rounded-2xl p-4 w-48">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  🚗
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Car Rental</div>
                  <div className="text-xs text-neutral-500">Tesla Model 3</div>
                </div>
              </div>
              <div className="text-lg font-bold text-white">$85<span className="text-xs text-neutral-500 font-normal">/day</span></div>
            </div>
          </div>

          <div className="absolute bottom-1/3 left-16 float-animation" style={{ animationDelay: '4s' }}>
            <div className="card-glow rounded-2xl p-4 w-48">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  💻
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">MacBook Pro</div>
                  <div className="text-xs text-neutral-500">M3 Chip</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="star-rating text-sm">★★★★★</span>
                <span className="text-xs text-neutral-500">(24)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-600">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-neutral-700 flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-neutral-500 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}