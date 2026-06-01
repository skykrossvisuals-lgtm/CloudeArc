const steps = [
  {
    step: '01',
    title: 'Create Your RFQ',
    description:
      'Pick a template or start from scratch. Add line items, attach specs, and set your deadline — all in one screen.',
  },
  {
    step: '02',
    title: 'Invite Suppliers',
    description:
      'Choose from our vetted network or upload your own. Suppliers receive instant notifications and can respond directly in the platform.',
  },
  {
    step: '03',
    title: 'Compare & Award',
    description:
      'Side-by-side quote comparison with automated scoring. Award with one click and the PO is generated automatically.',
  },
  {
    step: '04',
    title: 'Track & Optimize',
    description:
      'Monitor delivery, manage invoices, and analyze spend patterns. Continuous insights help you save more every quarter.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-[#111827]">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            From RFQ to payment
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              in four simple steps.
            </span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-16 w-full h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
              )}

              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <span className="text-5xl font-black text-white/5 mb-3">{s.step}</span>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
