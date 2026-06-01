export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Search & Filter',
      description: 'Find properties that match your criteria — location, price, type, and amenities.',
      image: 'https://images.unsplash.com/photo-1494526585095-41f55d7a57bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      number: '02',
      title: 'Virtual Tour & Contact',
      description: 'Take 360° tours and message owners directly to schedule viewings.',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      number: '03',
      title: 'Secure Booking',
      description: 'Pay through our escrow system and get verified keys to your new space.',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      number: '04',
      title: 'Move In & Enjoy',
      description: 'Settle in with neighborhood insights and ongoing support from our team.',
      image: 'https://images.unsplash.com/photo-1599611552844-918d982c75bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            How EasyRent Works
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            From search to keys — we make renting seamless and secure for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : ''} gap-8`}
            >
              <div className="flex-1">
                <div className="text-6xl font-bold text-slate-800 mb-4">{step.number}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{step.description}</p>
              </div>
              <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/10">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-64 md:h-80 object-cover transform transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}