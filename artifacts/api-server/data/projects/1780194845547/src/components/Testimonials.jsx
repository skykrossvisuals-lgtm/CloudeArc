const testimonials = [
  {
    quote:
      'CloudeArc cut our infrastructure provisioning time from 3 weeks to 2 days. The generated Terraform is cleaner than what our senior engineers were writing by hand. It\'s become indispensable for our platform team.',
    author: 'Sarah Chen',
    role: 'VP of Platform Engineering',
    company: 'Vercel',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
  },
  {
    quote:
      'The cost estimation feature alone saved us $18,000 in our first month. We caught three over-provisioned RDS instances before they ever hit production. Our CFO is now our biggest advocate for the tool.',
    author: 'Marcus Rivera',
    role: 'Head of DevOps',
    company: 'Stripe',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
  },
  {
    quote:
      'We evaluated six IaC generators. CloudeArc was the only one that produced SOC 2-compliant templates out of the box. The compliance guardrails are genuinely best-in-class — not just marketing fluff.',
    author: 'Priya Nair',
    role: 'CISO',
    company: 'Datadog',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
  },
  {
    quote:
      'We migrated 47 microservices from CloudFormation to Terraform using CloudeArc. What would have taken six months manually was done in three weeks. The GitOps integration with our existing pipeline was seamless.',
    author: 'James Okonkwo',
    role: 'Staff Platform Engineer',
    company: 'Figma',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
  },
  {
    quote:
      'As a solo DevOps consultant, CloudeArc lets me deliver enterprise-grade architecture to clients at a fraction of the time. I\'ve doubled my client load without sacrificing quality. The multi-cloud support is a game-changer.',
    author: 'Elena Torres',
    role: 'Independent DevOps Consultant',
    company: 'Self-employed',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
  },
  {
    quote:
      'The visual diagram feature alone is worth the subscription. Our architecture reviews used to take hours with whiteboarding. Now we generate the diagram alongside the code and iterate in real-time during the meeting.',
    author: 'David Kim',
    role: 'Engineering Manager',
    company: 'Notion',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
  },
];

function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-4">
            Testimonials
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-['Syne'] tracking-tight">
            Trusted by teams{' '}
            <span className="gradient-text">everywhere</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            From startups to Fortune 500s, infrastructure teams are shipping faster with CloudeArc.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="glass-card p-6 flex flex-col justify-between hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300"
            >
              {/* Quote */}
              <div>
                <svg
                  className="w-8 h-8 text-cyan-500/30 mb-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-300 leading-relaxed text-sm mb-6">{t.quote}</p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{t.author}</p>
                  <p className="text-xs text-gray-500">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
