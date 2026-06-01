const reviews = [
  {
    name: 'Sarah Chen',
    role: 'Buyer & Seller',
    avatar: '👩‍💼',
    text: 'I sold my old DSLR in under 3 hours. The escrow system gave me peace of mind, and the buyer was verified. Best marketplace experience I\'ve ever had.',
    rating: 5,
  },
  {
    name: 'Marcus Rivera',
    role: 'Landlord',
    avatar: '👨‍🔧',
    text: 'I\'ve listed three rental properties on EasyGet and found tenants within days. The tenant verification and review system saves me so much time.',
    rating: 5,
  },
  {
    name: 'Priya Patel',
    role: 'Freelance Designer',
    avatar: '👩‍🎨',
    text: 'EasyGet helped me turn my design side-hustle into a full-time income. The service listings feature is incredibly well thought out.',
    rating: 5,
  },
  {
    name: 'James Okonkwo',
    role: 'First-Time Buyer',
    avatar: '👨‍💻',
    text: 'I was nervous about buying used electronics online, but the seller ratings and secure payment made it feel completely safe. Now I\'m hooked.',
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-['Syne'] text-3xl md:text-5xl font-bold mb-4">
            Loved by Thousands
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Real stories from real users who buy and sell on EasyGet every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-sm ${i < r.rating ? 'text-yellow-400' : 'text-white/15'}`}>★</span>
                ))}
              </div>
              <p className="text-white/70 leading-relaxed mb-5 text-sm">"{r.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                  {r.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">{r.name}</div>
                  <div className="text-xs text-white/40">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}