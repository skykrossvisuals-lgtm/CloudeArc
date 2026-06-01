function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
            Now in Public Beta
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
          <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
            Procurement
          </span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            made effortless.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl mx-auto text-lg text-slate-400 leading-relaxed mb-10">
          EasyGet streamlines your entire sourcing workflow — from RFQs to supplier
          management — so your team can focus on what actually matters.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#cta"
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-all duration-200"
          >
            Start Free Trial
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-3.5 rounded-full border border-white/15 font-semibold text-white hover:bg-white/5 transition-all duration-200"
          >
            See How It Works →
          </a>
        </div>

        {/* Trusted by */}
        <div className="mt-16">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">
            Trusted by procurement teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Stark Industries'].map((name) => (
              <span key={name} className="text-sm font-semibold text-slate-400">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
