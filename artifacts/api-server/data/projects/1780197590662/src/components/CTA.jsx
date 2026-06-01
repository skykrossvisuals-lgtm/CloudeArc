function CTA() {
  return (
    <section id="cta" className="py-24 px-4">
      <div className="max-w-4xl mx-auto text-center relative">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Ready to transform
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              your procurement?
            </span>
          </h2>
          <p className="max-w-md mx-auto text-slate-400 leading-relaxed mb-8">
            Join 2,500+ companies already saving time and money with EasyGet. Start your
            free 14-day trial — no credit card required.
          </p>

          <form className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your work email"
              className="w-full sm:flex-1 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-all duration-200"
            >
              Get Started
            </button>
          </form>

          <p className="text-xs text-slate-500 mt-4">
            Free 14-day trial · No credit card · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

export default CTA;
