export default function CTABanner() {
  return (
    <section id="cta" className="py-24 px-4">
      <div className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden">
        {/* Glow background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/15 rounded-full blur-[60px]" />

        <div className="relative z-10 border border-white/10 bg-white/[0.03] backdrop-blur-xl rounded-3xl p-10 md:p-16 text-center">
          <h2 className="font-['Syne'] text-3xl md:text-5xl font-bold mb-4">
            Ready to{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Get Started
            </span>
            ?
          </h2>
          <p className="text-white/50 max-w-lg mx-auto mb-10 leading-relaxed">
            Join 50,000+ users who are already buying and selling on EasyGet. Create your free account and list your first item in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              className="w-full sm:w-auto px-10 py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#080C0A] font-semibold text-base hover:opacity-90 transition-all duration-200 shadow-lg shadow-emerald-500/20"
            >
              Create Free Account
            </a>
            <a
              href="#"
              className="w-full sm:w-auto px-10 py-3.5 rounded-full border border-white/20 bg-white/5 text-white font-semibold text-base hover:bg-white/10 hover:border-white/30 transition-all duration-200"
            >
              Learn More
            </a>
          </div>

          <p className="mt-6 text-xs text-white/25">No credit card required • Free to list • 2.9% transaction fee</p>
        </div>
      </div>
    </section>
  );
}