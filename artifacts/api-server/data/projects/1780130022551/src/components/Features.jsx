export default function Features({ onNavigate }) {
  const features = [
    {
      icon: '🔍',
      title: 'Smart Search & Filter',
      description:
        'Find exactly what you need with AI-powered search, category filters, price ranges, location-based results, and personalized recommendations.',
      color: 'purple',
    },
    {
      icon: '🔒',
      title: 'Secure Payments',
      description:
        'Bank-level encryption protects every transaction. Escrow service, buyer protection, and multiple payment methods including cards and digital wallets.',
      color: 'blue',
    },
    {
      icon: '⭐',
      title: 'Verified Reviews',
      description:
        'Make informed decisions with our two-way review system. Only verified buyers can leave reviews, ensuring authentic and trustworthy feedback.',
      color: 'emerald',
    },
    {
      icon: '👤',
      title: 'User Profiles',
      description:
        'Build your reputation with a comprehensive profile. Showcase your listings, ratings, transaction history, and verification badges.',
      color: 'purple',
    },
    {
      icon: '📦',
      title: 'Product Listings',
      description:
        'List anything in minutes with our intuitive listing builder. Add photos, descriptions, pricing, and availability with smart templates.',
      color: 'blue',
    },
    {
      icon: '💬',
      title: 'In-App Messaging',
      description:
        'Communicate safely with built-in chat. Share details, negotiate prices, and arrange meetups — all within the platform.',
      color: 'emerald',
    },
  ];

  const colorMap = {
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  };

  return (
    <section className="py-20 lg:py-28 relative" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-sm text-neutral-400">Platform Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Everything You Need in One{' '}
            <span className="gradient-text">Place</span>
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Powerful tools designed to make buying and selling seamless, secure, and
            enjoyable for everyone.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const colors = colorMap[feature.color];
            return (
              <div
                key={i}
                className="card-glow rounded-2xl p-6 lg:p-8 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
                <div className={`mt-4 inline-flex items-center gap-1 text-sm font-medium ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Learn more
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="mt-16 card-glow rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 gradient-bg opacity-5" />
          <div className="relative z-10">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Ready to get started?
            </h3>
            <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
              Join thousands of users already buying and selling on EasyGet. Create
              your free account in under 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('signup')}
                className="btn-primary text-base py-3 px-8"
              >
                Create Free Account
              </button>
              <button
                onClick={() => onNavigate('how-it-works')}
                className="btn-secondary text-base py-3 px-8"
              >
                See How It Works
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}