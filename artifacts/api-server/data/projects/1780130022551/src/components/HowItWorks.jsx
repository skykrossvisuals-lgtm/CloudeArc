export default function HowItWorks({ onNavigate }) {
  const steps = [
    {
      number: '01',
      title: 'Create Your Account',
      description:
        'Sign up in seconds with your email or social accounts. Verify your identity to build trust with the community.',
      icon: '👤',
    },
    {
      number: '02',
      title: 'Browse or List',
      description:
        'Search thousands of listings or create your own in minutes. Add photos, set your price, and reach millions of potential buyers.',
      icon: '📋',
    },
    {
      number: '03',
      title: 'Connect & Negotiate',
      description:
        'Message sellers directly through our secure chat. Ask questions, negotiate terms, and arrange meetups safely.',
      icon: '💬',
    },
    {
      number: '04',
      title: 'Pay Securely',
      description:
        'Complete transactions through our protected payment system. Buyer protection ensures your money is safe until you\'re satisfied.',
      icon: '💳',
    },
    {
      number: '05',
      title: 'Review & Repeat',
      description:
        'Leave a review after your transaction. Build your reputation and become a trusted member of the EasyGet community.',
      icon: '⭐',
    },
  ];

  return (
    <section className="py-20 lg:py-28 relative" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-sm text-neutral-400">Simple Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            How <span className="gradient-text">EasyGet</span> Works
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Getting started is simple. From signup to your first transaction in just
            a few easy steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="card-glow rounded-2xl p-6 lg:p-8 text-center h-full relative z-10">
                  {/* Step Number */}
                  <div className="text-6xl font-black text-white/5 absolute top-4 right-4">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg shadow-purple-500/20">
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-20 text-purple-500/40">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button
            onClick={() => onNavigate('signup')}
            className="btn-primary text-base py-4 px-10"
          >
            Get Started Now — It's Free
          </button>
          <p className="text-neutral-500 text-sm mt-4">
            No credit card required. Start browsing in seconds.
          </p>
        </div>
      </div>
    </section>
  );
}