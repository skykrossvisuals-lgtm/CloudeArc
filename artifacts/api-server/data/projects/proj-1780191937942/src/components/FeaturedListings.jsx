const listings = [
  {
    id: 1,
    title: 'iPhone 15 Pro Max — 256GB',
    price: '$1,099',
    category: 'Electronics',
    image: '📱',
    seller: 'TechDeals',
    rating: 4.9,
    reviews: 234,
    badge: 'Featured',
  },
  {
    id: 2,
    title: 'Modern Studio Apartment — Downtown',
    price: '$1,850/mo',
    category: 'Rentals',
    image: '🏠',
    seller: 'CityNest',
    rating: 4.7,
    reviews: 89,
    badge: null,
  },
  {
    id: 3,
    title: 'Ergonomic Office Chair — Herman Miller',
    price: '$620',
    category: 'Furniture',
    image: '🪑',
    seller: 'OfficeGear',
    rating: 4.8,
    reviews: 156,
    badge: 'Sale',
  },
  {
    id: 4,
    title: 'Professional Logo Design Package',
    price: '$299',
    category: 'Services',
    image: '🎨',
    seller: 'DesignCraft',
    rating: 5.0,
    reviews: 412,
    badge: null,
  },
  {
    id: 5,
    title: 'Tesla Model 3 — 2024 Long Range',
    price: '$38,990',
    category: 'Vehicles',
    image: '🚗',
    seller: 'AutoHub',
    rating: 4.6,
    reviews: 67,
    badge: 'Premium',
  },
  {
    id: 6,
    title: 'Vintage Leather Jacket — Schott NYC',
    price: '$340',
    category: 'Fashion',
    image: '🧥',
    seller: 'RetroThreads',
    rating: 4.8,
    reviews: 198,
    badge: null,
  },
];

export default function FeaturedListings() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-['Syne'] text-3xl md:text-4xl font-bold mb-2">
              Trending Listings
            </h2>
            <p className="text-white/40 text-sm">Hand-picked deals updated daily</p>
          </div>
          <a href="#" className="hidden sm:block text-sm text-emerald-400 hover:text-emerald-300 transition-all duration-200">
            View all →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300 cursor-pointer"
            >
              <div className="relative">
                <div className="w-full h-44 rounded-xl bg-white/[0.03] flex items-center justify-center text-5xl mb-4 group-hover:scale-[1.02] transition-transform duration-300">
                  {item.image}
                </div>
                {item.badge && (
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#080C0A]">
                    {item.badge}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium">{item.category}</span>
              </div>

              <h3 className="font-semibold text-white mb-1 group-hover:text-emerald-300 transition-colors duration-200 line-clamp-1">
                {item.title}
              </h3>

              <div className="flex items-center justify-between mt-3">
                <span className="font-['Syne'] text-lg font-bold text-white">{item.price}</span>
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <span className="text-yellow-400">★</span>
                  {item.rating}
                  <span className="text-white/20">({item.reviews})</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-white/30">by {item.seller}</span>
                <button className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-all duration-200">
                  View Deal →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <a href="#" className="text-sm text-emerald-400 hover:text-emerald-300 transition-all duration-200">
            View all listings →
          </a>
        </div>
      </div>
    </section>
  );
}