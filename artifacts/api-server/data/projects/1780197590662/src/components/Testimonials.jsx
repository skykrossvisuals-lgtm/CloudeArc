const testimonials = [
  {
    quote:
      'EasyGet cut our sourcing cycle from 3 weeks to 4 days. The supplier comparison tool alone saved us $120K in the first quarter.',
    name: 'Sarah Chen',
    role: 'VP of Supply Chain',
    company: 'Apex Manufacturing',
  },
  {
    quote:
      'We onboarded 200+ suppliers in under a month. The compliance features give our legal team peace of mind — every approval is auditable.',
    name: 'Marcus Rivera',
    role: 'Head of Procurement',
    company: 'NovaTech Solutions',
  },
  {
    quote:
      'The ERP integration was shockingly smooth. Two-way sync with NetSuite worked out of the box. Our finance team actually thanked us.',
    name: 'Priya Patel',
    role: 'Director of Operations',
    company: 'Brightline Logistics',
  },
];

function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">
            Testimonials
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Loved by procurement
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              teams everywhere.
            </span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-200"
            >
              {/* Quote */}
              <div>
                <svg className="w-8 h-8 text-cyan-500/40 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-slate-300 leading-relaxed mb-6">{t.quote}</p>
              </div>

              {/* Author */}
              <div className="border-t border-white/5 pt-4">
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-slate-500">
                  {t.role}, {t.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
