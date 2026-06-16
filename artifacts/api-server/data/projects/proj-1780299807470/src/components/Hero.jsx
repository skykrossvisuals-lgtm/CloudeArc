export default function Hero() {
  const btnPrimary = "px-8 py-3 rounded-full font-semibold bg-[#00FF88]/10 text-[#00FF88] hover:bg-[#00FF88]/20 transition-all duration-200";
  const btnSecondary = "px-8 py-3 rounded-full font-semibold border border-[#00FF88]/30 text-[#00FF88] hover:bg-[#00FF88]/10 transition-all duration-200";

  return (
    <section className="relative min-h-[90vh] flex items-center bg-gray-900 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="font-[Syne] text-5xl md:text-7xl font-bold bg-gradient-to-r from-[#00FF88] to-[#00D4AA] bg-clip-text text-transparent mb-6">
          Personalized Fitness, Powered by Data
        </h1>
        <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Get workout plans that adapt to you, live coaching that pushes you, and nutrition tracking that syncs with your wearables.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="#cta" className={btnPrimary}>
            Start Free Trial
          </a>
          <a href="#features" className={btnSecondary}>
            Watch Demo
          </a>
        </div>
      </div>
    </section>
  );
}