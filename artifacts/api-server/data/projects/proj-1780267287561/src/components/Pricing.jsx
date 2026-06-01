import React from 'react';

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for getting started with fitness tracking and basic plans.",
      features: [
        "Personalized workout plans",
        "Basic nutrition tracking",
        "Mobile app access",
        "Community support"
      ],
      popular: false
    },
    {
      name: "Pro Athlete",
      price: "$59",
      period: "/month",
      description: "Advanced coaching and analytics for serious athletes.",
      features: [
        "Everything in Starter",
        "Live coaching sessions",
        "Wearable sync & analytics",
        "Custom nutrition plans",
        "Form feedback & video analysis"
      ],
      popular: true
    },
    {
      name: "Elite",
      price: "$99",
      period: "/month",
      description: "Full-service coaching with dedicated personal trainer.",
      features: [
        "Everything in Pro Athlete",
        "1-on-1 weekly coaching",
        "In-depth performance reports",
        "Priority support",
        "Custom gear discounts"
      ],
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 px-4 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-syne text-white mb-4">
            Simple, <span className="text-emerald-500">Transparent Pricing</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your goals. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className={`relative rounded-2xl overflow-hidden ${
              plan.popular 
                ? 'border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20' 
                : 'border border-white/10'
            }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                  MOST POPULAR
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2 font-syne">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <p className="text-slate-300 mb-6">{plan.description}</p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-300">
                      <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                >
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
