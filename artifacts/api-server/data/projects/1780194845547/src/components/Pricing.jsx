import { useState } from 'react';

const plans = [
  {
    name: 'Starter',
    description: 'For individual engineers and small teams getting started with IaC automation.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: 'Start Free',
    featured: false,
    features: [
      '10 architecture generations / month',
      'Terraform & Pulumi output',
      'Basic compliance checks',
      'Single cloud provider',
      'Community support',
      'Public diagram sharing',
    ],
  },
  {
    name: 'Pro',
    description: 'For growing teams that need unlimited generation and advanced collaboration.',
    monthlyPrice: 49,
    yearlyPrice: 39,
    cta: 'Start Free Trial',
    featured: true,
    features: [
      'Unlimited architecture generations',
      'All IaC formats + diagrams',
      'Full compliance suite (CIS, SOC 2, HIPAA)',
      'Multi-cloud & hybrid support',
      'GitOps PR integration',
      'Real-time cost estimation',
      'Priority support',
      'Team workspaces',
    ],
  },
  {
    name: 'Enterprise',
    description: 'For organizations that need custom models, SSO, and dedicated infrastructure.',
    monthlyPrice: null,
    yearlyPrice: null,
    cta: 'Contact Sales',
    featured: false,
    features: [
      'Everything in Pro',
      'Custom AI model fine-tuning',
      'Self-hosted deployment option',
      'SAML / SSO + RBAC',
      'Dedicated support engineer',
      'SLA with 99.9% uptime',
      'Audit logs & advanced analytics',
      'Unlimited team members',
    ],
  },
];

function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-teal-400 uppercase tracking-widest mb-4">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-['Syne'] tracking-tight">
            Start free, scale{' '}
            <span className="gradient-text">as you grow</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            No hidden fees. No surprise bills. Just straightforward pricing that matches your
            team's velocity.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 bg-white/5 rounded-full p-1 border border-white/10">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !isYearly ? 'bg-cyan-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isYearly ? 'bg-cyan-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs text-emerald-400 font-semibold">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card p-8 flex flex-col relative ${
                plan.featured
                  ? 'border-cyan-500/30 bg-cyan-500/[0.03] ring-1 ring-cyan-500/20'
                  : 'hover:border-white/20'
              } transition-all duration-300`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full text-xs font-semibold shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.monthlyPrice !== null ? (
                  <>
                    <span className="text-4xl font-bold font-['Syne']">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-400 text-sm">/month</span>
                    {isYearly && (
                      <p className="text-xs text-gray-500 mt-1">
                        Billed annually (${plan.yearlyPrice * 12}/year)
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-4xl font-bold font-['Syne']">Custom</span>
                )}
              </div>

              {/* CTA */}
              <a
                href="#"
                className={`text-center py-3 rounded-full font-semibold transition-all duration-200 mb-8 ${
                  plan.featured
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {plan.cta}
              </a>

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <svg
                      className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
