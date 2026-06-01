const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'Perfect for small teams getting started with structured procurement.',
    features: [
      'Up to 5 active RFQs',
      '50 supplier invites/month',
      'Basic spend dashboard',
      'Email support',
      '1 ERP integration',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$149',
    period: '/month',
    description: 'For growing teams that need advanced workflows and deeper analytics.',
    features: [
      'Unlimited RFQs',
      '500 supplier invites/month',
      'Advanced spend analytics',
      'Custom approval workflows',
      'Priority support',
      'All ERP integrations',
      'API access',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with complex procurement needs and dedicated support.',
    features: [
      'Everything in Professional',
      'Unlimited supplier invites',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'SSO & advanced RBAC',
      'On-premise deployment option',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 bg-[#111827]">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Simple, transparent
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              pricing for every team.
            </span>
          </h2>
          <p className="max-w-lg mx-auto text-slate-400 leading-relaxed">
            No hidden fees. No surprises. Start free and upgrade when you're ready.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 flex flex-col ${
                plan.highlighted
                  ? 'border-cyan-500/40 bg-gradient-to-b from-cyan-500/10 to-transparent ring-1 ring-cyan-500/20'
                  : 'border-white/10 bg-white/5 backdrop-blur-sm'
              }`}
            >
              {plan.highlighted && (
                <span className="self-start px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 mb-4">
                  Most Popular
                </span>
              )}

              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <svg className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#cta"
                className={`block text-center px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:opacity-90'
                    : 'border border-white/15 text-white hover:bg-white/5'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
