import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Create Your Account',
      description:
        'Sign up in seconds with email or social login. Set up your profile and preferences to get personalized recommendations.',
      icon: '👤',
    },
    {
      number: '02',
      title: 'Browse or List',
      description:
        'Explore thousands of products, services, and rental properties. Or list your own items with our intuitive listing wizard.',
      icon: '🔍',
    },
    {
      number: '03',
      title: 'Connect & Transact',
      description:
        'Message sellers directly, schedule viewings, and complete secure transactions through our protected payment system.',
      icon: '💬',
    },
    {
      number: '04',
      title: 'Review & Repeat',
      description:
        'Leave reviews to build community trust. Earn seller badges, grow your reputation, and unlock premium features.',
      icon: '⭐',
    },
  ];

  return (
    <section id="how-it-works" className="border-y border-white/10 bg-[#0a0f0d]">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              How EasyGet Works
            </span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-gray-400">
            From sign-up to successful transaction — we make the entire process seamless and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10"
            >
              <div className="mb-4 text-4xl">{step.icon}</div>
              <div className="mb-2 text-xs font-bold tracking-wider text-emerald-400">STEP {step.number}</div>
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">{step.description}</p>

              {/* Connector line (except last) */}
              {step.number !== '04' && (
                <div className="hidden lg:block absolute -right-4 top-1/2 z-10">
                  <svg className="h-8 w-8 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}