export default function Testimonials() {
  const testimonials = [
    {
      name: 'Jordan M.',
      role: 'Marathon Runner',
      text: 'Apex adjusted my plan after each long run. I shaved 12 minutes off my PB in 8 weeks.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80'
    },
    {
      name: 'Lena P.',
      role: 'Yoga Instructor',
      text: 'The live coaching kept me accountable. I finally nailed my handstand goal.',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&q=80'
    },
    {
      name: 'Marcus T.',
      role: 'CrossFit Athlete',
      text: 'Wearable sync gave me insights I never had. My recovery scores improved dramatically.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&q=80'
    }
  ];

  return (
    <section className="py-24 px-4 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center font-[Syne] text-4xl font-bold text-white mb-12">What Athletes Say</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-gray-800/50 p-6 rounded-2xl border border-[#00FF88]/20">
              <div className="flex items-center space-x-4 mb-4">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="font-[Syne] text-lg font-bold text-white">{t.name}</h3>
                  <p className="text-sm text-gray-400">{t.role}</p>
                </div>
              </div>
              <p className="text-gray-300 italic mb-4">"{t.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}