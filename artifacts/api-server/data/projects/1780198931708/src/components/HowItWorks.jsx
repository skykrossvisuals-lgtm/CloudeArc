const steps = [
  {
    step: '01',
    title: 'Create Your Profile',
    description:
      'Sign up in under 2 minutes. Verify your identity to unlock full access. Build your reputation with every transaction.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'List or Browse',
    description:
      'Post your product or property with photos, pricing, and availability. Or search through thousands of listings with smart filters.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Connect & Transact',
    description:
      'Chat securely within the platform. Agree on terms, schedule viewings or pickups, and complete the transaction with escrow protection.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Rate & Get Paid',
    description:
      'Leave a review after the transaction. Sellers receive fast payouts. Your rating helps the community thrive.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="section-container" id="how-it-works">
      <div className="text-center mb-16">
        <span className="badge bg-violet-500/10 text-violet-300 border border-violet-500/20 mb-4">
          Simple Process
        </span>
        <h2 className="text-4xl md:text-5xl font-bold font-['Syne'] text-white mb-4">
          How EasyGet <span className="gradient-text">Works</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Four simple steps to start buying, selling, or renting on the most trusted marketplace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, idx) => (
          <div key={s.step} className="relative">
            <div className="card-glass p-6 h-full group hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
              <div className="text-5xl font-bold font-['Syne'] text-white/5 mb-4 group-hover:text-white/10 transition-colors">
                {s.step}
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white mb-4 shadow-lg">
                {s.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.description}</p>
            </div>
            {/* Connector line for desktop */}
            {idx < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-violet-400/50 to-transparent" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
