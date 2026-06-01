import React from 'react';

export default function Categories() {
  const categories = [
    {
      name: 'Electronics',
      icon: '💻',
      count: '24,500+',
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      name: 'Fashion',
      icon: '👗',
      count: '18,200+',
      gradient: 'from-pink-500/20 to-rose-500/20',
    },
    {
      name: 'Home & Garden',
      icon: '🏡',
      count: '12,800+',
      gradient: 'from-emerald-500/20 to-teal-500/20',
    },
    {
      name: 'Real Estate',
      icon: '🏠',
      count: '5,400+',
      gradient: 'from-amber-500/20 to-orange-500/20',
    },
    {
      name: 'Vehicles',
      icon: '🚗',
      count: '8,900+',
      gradient: 'from-violet-500/20 to-purple-500/20',
    },
    {
      name: 'Services',
      icon: '🛠️',
      count: '15,100+',
      gradient: 'from-sky-500/20 to-blue-500/20',
    },
    {
      name: 'Art & Collectibles',
      icon: '🎨',
      count: '6,700+',
      gradient: 'from-fuchsia-500/20 to-pink-500/20',
    },
    {
      name: 'Sports & Outdoors',
      icon: '⚽',
      count: '9,300+',
      gradient: 'from-lime-500/20 to-green-500/20',
    },
  ];

  return (
    <section id="categories" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              Explore Categories
            </span>
          </h2>
          <p className="mt-3 text-gray-400">Find exactly what you need across our diverse marketplace</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.gradient} text-2xl`}
              >
                {cat.icon}
              </div>
              <h3 className="font-semibold text-white">{cat.name}</h3>
              <p className="mt-1 text-sm text-gray-400">{cat.count} listings</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}