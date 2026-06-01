const plans = [
  {
    name: "Starter",
    description: "Perfect for side projects and small teams getting started.",
    price: "$19",
    period: "/month",
    features: [
      "Up to 5 team members",
      "10,000 API requests/month",
      "5 integrations",
      "Basic analytics",
      "Email support",
      "1GB storage",
    ],
    cta: "Start free trial",
    popular: false,
  },
  {
    name: "Pro",
    description: "For growing teams that need more power and flexibility.",
    price: "$49",
    period: "/month",
    features: [
      "Up to 25 team members",
      "100,000 API requests/month",
      "Unlimited integrations",
      "Advanced analytics & reports",
      "Priority support",
      "50GB storage",
      "Custom workflows",
      "SSO & advanced security",
    ],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For organizations that need dedicated support and custom solutions.",
    price: "Custom",
    period: "",
    features: [
      "Unlimited team members",
      "Unlimited API requests",
      "Unlimited integrations",
      "Custom analytics & BI",
      "Dedicated account manager",
      "Unlimited storage",
      "Custom SLA",
      "On-premise deployment",
      "Audit logs & compliance",
    ],
    cta: "Contact sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            No hidden fees. No surprises. Pick the plan that fits your team and
            scale as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 sm:p-8 transition-all duration-200 hover:-translate-y-1 ${
                plan.popular
                  ? "border-accent/50 bg-dark-800/80 shadow-xl shadow-accent/10"
                  : "border-white/10 bg-dark-800/50 hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent text-xs font-semibold text-white">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-500 text-lg">{plan.period}</span>
                )}
              </div>

              <a
                href="#"
                className={`block w-full text-center py-3 rounded-xl font-semibold transition-all duration-200 mb-6 ${
                  plan.popular
                    ? "bg-accent hover:bg-accent-dark text-white hover:shadow-lg hover:shadow-accent/25"
                    : "border border-white/10 hover:border-white/20 hover:bg-white/5 text-white"
                }`}
              >
                {plan.cta}
              </a>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-gray-500 mt-10">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}