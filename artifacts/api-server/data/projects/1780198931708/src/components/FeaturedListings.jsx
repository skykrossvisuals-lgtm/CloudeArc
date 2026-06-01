const listings = [
  {
    id: 1,
    title: 'Modern Loft in Downtown Brooklyn',
    category: 'Real Estate',
    price: '$3,200/mo',
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop',
    badge: 'Featured',
    badgeColor: 'bg-emerald-500',
    seller: 'Sarah Chen',
    sellerAvatar: 'SC',
  },
  {
    id: 2,
    title: 'iPhone 15 Pro Max — 256GB',
    category: 'Electronics',
    price: '$1,099',
    rating: 4.8,
    reviews: 56,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=400&fit=crop',
    badge: 'Like New',
    badgeColor: 'bg-amber-500',
    seller: 'Marcus Johnson',
    sellerAvatar: 'MJ',
  },
  {
    id: 3,
    title: 'Tesla Model 3 — 2024 Long Range',
    category: 'Vehicles',
    price: '$42,900',
    rating: 5.0,
    reviews: 34,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop',
    badge: 'Verified',
    badgeColor: 'bg-violet-500',
    seller: 'Alex Rivera',
    sellerAvatar: 'AR',
  },
  {
    id: 4,
    title: 'Mid-Century Modern Sofa Set',
    category: 'Furniture',
    price: '$2,450',
    rating: 4.7,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop',
    badge: 'Popular',
    badgeColor: 'bg-rose-500',
    seller: 'Emily Watson',
    sellerAvatar: 'EW',
  },
  {
    id: 5,
    title: 'Professional Photography Package',
    category: 'Services',
    price: '$350/session',
    rating: 4.9,
    reviews: 215,
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=400&fit=crop',
    badge: 'Top Rated',
    badgeColor: 'bg-cyan-500',
    seller: 'David Kim',
    sellerAvatar: 'DK',
  },
  {
    id: 6,
    title: 'Vintage Leather Jacket — Schott',
    category: 'Fashion',
    price: '$580',
    rating: 4.6,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=400&fit=crop',
    badge: 'Rare Find',
    badgeColor: 'bg-orange-500',
    seller: 'Luna Martinez',
    sellerAvatar: 'LM',
  },
];

export default function FeaturedListings() {
  return (
    <section className="section-container" id="listings">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
        <div>
          <span className="badge bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 mb-4">
            Hot Picks
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-['Syne'] text-white">
            Featured <span className="gradient-text">Listings</span>
          </h2>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          View All Listings
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="card-glass overflow-hidden group cursor-pointer hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
          >
            {/* Image */}
            <div className="relative h-52 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <span
                className={`absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-xs font-semibold text-white ${listing.badgeColor}`}
              >
                {listing.badge}
              </span>
              <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-semibold text-white">{listing.rating}</span>
                <span className="text-xs text-slate-300">({listing.reviews})</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                {listing.category}
              </span>
              <h3 className="text-white font-semibold mt-1 mb-3 line-clamp-2 leading-snug">
                {listing.title}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold gradient-text font-['Syne']">{listing.price}</span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-xs font-bold text-white">
                    {listing.sellerAvatar}
                  </div>
                  <span className="text-xs text-slate-400">{listing.seller}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
