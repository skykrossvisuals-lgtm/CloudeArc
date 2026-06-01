export default function Categories({ onNavigate }) {
  const categories = [
    { icon: '🏠', name: 'Real Estate', count: '2,400+', color: 'purple' },
    { icon: '🚗', name: 'Vehicles', count: '1,800+', color: 'blue' },
    { icon: '💻', name: 'Electronics', count: '5,200+', color: 'emerald' },
    { icon: '👗', name: 'Fashion', count: '8,100+', color: 'purple' },
    { icon: '🏋️', name: 'Sports & Outdoors', count: '3,300+', color: 'blue' },
    { icon: '🎨', name: 'Art & Collectibles', count: '1,500+', color: 'emerald' },
    { icon: '🔧', name: 'Services', count: '4,600+', color: 'purple' },
    { icon: '📚', name: 'Books & Media', count: '2,900+', color: 'blue' },
  ];

  const colorMap = {
    purple: 'bg-purple-500/10 text-purple-400',
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
  };

  return (
    <section className="py-20 lg:py-28 relative" id="categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-sm text-neutral-400">Browse Categories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Explore <span className="gradient-text">Popular</span> Categories
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            From apartments to electronics, find exactly what you're looking for
            across our diverse marketplace categories.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => onNavigate('browse')}
              className="category-card"
            >
              <div className={`category-icon ${colorMap[cat.color]}`}>
                {cat.icon}
              </div>
              <h3 className="text-white font-semibold mb-1">{cat.name}</h3>
              <p className="text-neutral-500 text-sm">{cat.count} listings</p>
            </button>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <button
            onClick={() => onNavigate('browse')}
            className="btn-secondary text-base py-3 px-8"
          >
            View All Categories
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}