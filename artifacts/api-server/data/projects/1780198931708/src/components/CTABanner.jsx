export default function CTABanner() {
  return (
    <section className="section-container">
      <div className="relative rounded-3xl overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 px-8 py-16 md:py-20 text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-['Syne'] text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-emerald-100 text-lg max-w-xl mx-auto mb-10">
            Join 50,000+ users who are already buying, selling, and renting on EasyGet.
            Your next great deal is just a click away.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-10 py-4 rounded-full bg-white text-emerald-700 font-semibold text-lg shadow-xl shadow-black/20 hover:bg-emerald-50 hover:scale-105 transition-all duration-200">
              Create Free Account
            </button>
            <button className="px-10 py-4 rounded-full border-2 border-white/40 text-white font-semibold text-lg hover:bg-white/10 hover:border-white/60 transition-all duration-200">
              Learn More
            </button>
          </div>

          <p className="text-emerald-200/70 text-sm mt-6">
            No credit card required &bull; Free to join &bull; Start in minutes
          </p>
        </div>
      </div>
    </section>
  );
}
