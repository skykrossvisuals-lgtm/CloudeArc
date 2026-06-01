function CTA() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto relative">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl blur-3xl" />

        <div className="relative glass-card p-10 md:p-16 text-center border-cyan-500/20 bg-cyan-500/[0.02]">
          <h2 className="text-3xl md:text-5xl font-bold font-['Syne'] tracking-tight mb-4">
            Ready to ship infrastructure{' '}
            <span className="gradient-text">10x faster?</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-8">
            Join 2,400+ engineers who are already generating production-grade cloud architecture
            with AI. Free forever for your first 10 generations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#" className="btn-primary text-lg px-10 py-4 w-full sm:w-auto">
              Get Started Free
              <span className="ml-2">→</span>
            </a>
            <a href="#" className="btn-secondary text-lg px-10 py-4 w-full sm:w-auto">
              Talk to Sales
            </a>
          </div>

          <p className="mt-6 text-xs text-gray-500">
            No credit card required · 10 free generations · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

export default CTA;
