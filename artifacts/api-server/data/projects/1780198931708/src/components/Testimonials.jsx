const testimonials = [
  {
    name: 'Priya Patel',
    role: 'Property Owner',
    avatar: 'PP',
    rating: 5,
    text: 'EasyGet transformed how I manage my rental properties. I listed my Brooklyn apartment and had three qualified tenants within a week. The escrow payment system gives me peace of mind every month.',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    name: 'James Wilson',
    role: 'Frequent Buyer',
    avatar: 'JW',
    rating: 5,
    text: 'I have bought everything from a MacBook to a vintage watch on EasyGet. The verified profiles and review system make it easy to trust sellers. The search filters are incredibly precise.',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    name: 'Maria Gonzalez',
    role: 'Small Business Owner',
    avatar: 'MG',
    rating: 5,
    text: 'As a freelance photographer, EasyGet has been a game-changer for booking clients. The scheduling system handles all my availability, and I get paid within 24 hours of completing a shoot.',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    name: 'Ryan O\'Brien',
    role: 'Tenant',
    avatar: 'RO',
    rating: 4,
    text: 'Finding an apartment used to be a nightmare. With EasyGet, I filtered by my budget, neighborhood, and move-in date, and found the perfect place in two days. The in-app messaging made everything smooth.',
    gradient: 'from-rose-400 to-pink-500',
  },
  {
    name: 'Aisha Thompson',
    role: 'Power Seller',
    avatar: 'AT',
    rating: 5,
    text: 'I have sold over 200 items on EasyGet. The listing process is intuitive, the fees are transparent, and the instant payout feature keeps my cash flow healthy. This platform respects sellers.',
    gradient: 'from-cyan-400 to-blue-500',
  },
  {
    name: 'Daniel Lee',
    role: 'Car Enthusiast',
    avatar: 'DL',
    rating: 5,
    text: 'Sold my Tesla through EasyGet in under a week. The buyer was verified, the payment was secured through escrow, and the whole process felt safe and professional. Highly recommend for big-ticket items.',
    gradient: 'from-green-400 to-emerald-500',
  },
];

export default function Testimonials() {
  return (
    <section className="section-container" id="testimonials">
      <div className="text-center mb-16">
        <span className="badge bg-rose-500/10 text-rose-300 border border-rose-500/20 mb-4">
          Testimonials
        </span>
        <h2 className="text-4xl md:text-5xl font-bold font-['Syne'] text-white mb-4">
          Loved by <span className="gradient-text-warm">Thousands</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Hear from real users who buy, sell, and rent on EasyGet every day.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="card-glass p-6 group hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300"
          >
            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < t.rating ? 'text-amber-400' : 'text-slate-600'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-5">
              &ldquo;{t.text}&rdquo;
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-sm font-bold text-white shadow-lg`}
              >
                {t.avatar}
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{t.name}</div>
                <div className="text-slate-500 text-xs">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
