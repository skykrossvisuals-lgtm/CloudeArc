export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-white/70 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Trusted by 50,000+ users worldwide
        </div>

        <h1 className="font-['Syne'] text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
          Buy & Sell{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">
            Anything
          </span>
          <br />
          in One Place
        </h1>

        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          From gadgets and furniture to rental properties and freelance services — EasyGet connects buyers and sellers instantly. List in seconds, sell in minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#browse"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#080C0A] font-semibold text-base hover:opacity-90 transition-all duration-200 shadow-lg shadow-emerald-500/20"
          >
            Start Buying
          </a>
          <a
            href="#cta"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/20 bg-white/5 text-white font-semibold text-base hover:bg-white/10 hover:border-white/30 transition-all duration-200"
          >
            Start Selling →
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: '50K+', label: 'Active Users' },
            { value: '120K+', label: 'Listings' },
            { value: '98%', label: 'Happy Buyers' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-['Syne'] text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}