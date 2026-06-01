export default function CTA() {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl border border-white/10 bg-dark-800/50 overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative px-6 py-16 sm:px-12 sm:py-20 md:px-16 md:py-24 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Ready to build something{" "}
              <span className="gradient-text">amazing</span>?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Join thousands of teams already using Nexus to ship faster, collaborate
              better, and scale with confidence. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
                Get started for free
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
              <a href="#" className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto">
                Talk to sales
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Free 14-day trial · No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}