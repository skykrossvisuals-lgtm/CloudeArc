const steps = [
  {
    step: '01',
    title: 'Create Your Profile',
    description: 'Sign up in under 60 seconds. Verify your identity, set up your payment method, and you\'re ready to go.',
    icon: '👤',
  },
  {
    step: '02',
    title: 'List or Browse',
    description: 'Post a listing with photos and a description in minutes — or browse thousands of items with smart filters.',
    icon: '📋',
  },
  {
    step: '03',
    title: 'Secure Transaction',
    description: 'Our escrow system holds funds until both parties confirm satisfaction. Every payment is encrypted end-to-end.',
    icon: '🔒',
  },
  {
    step: '04',
    title: 'Rate & Review',
    description: 'Leave honest feedback after every transaction. Build your reputation and help the community thrive.',
    icon: '⭐',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-['Syne'] text-3xl md:text-5xl font-bold mb-4">
            How EasyGet Works
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Four simple steps to start buying and selling on the most trusted marketplace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className="relative group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300"
            >
              <div className="text-3xl mb-4">{s.icon}</div>
              <div className="text-xs font-bold text-emerald-400/60 mb-2">{s.step}</div>
              <h3 className="font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{s.description}</p>

              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 w-6 h-px bg-gradient-to-r from-white/20 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}