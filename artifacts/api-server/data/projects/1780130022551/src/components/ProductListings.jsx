import { useState } from 'react';

const PRODUCTS = [
  {
    id: 1,
    title: 'Modern Studio Apartment — Downtown',
    category: 'Real Estate',
    price: 1200,
    unit: '/month',
    image: '🏠',
    rating: 4.9,
    reviews: 47,
    seller: 'Sarah M.',
    verified: true,
    location: 'Downtown, NY',
    type: 'rent',
    badge: 'Featured',
  },
  {
    id: 2,
    title: 'Tesla Model 3 — 2023',
    category: 'Vehicles',
    price: 85,
    unit: '/day',
    image: '🚗',
    rating: 4.8,
    reviews: 32,
    seller: 'Mike R.',
    verified: true,
    location: 'Brooklyn, NY',
    type: 'rent',
    badge: 'Popular',
  },
  {
    id: 3,
    title: 'MacBook Pro 16" M3 Max',
    category: 'Electronics',
    price: 2400,
    unit: '',
    image: '💻',
    rating: 5.0,
    reviews: 18,
    seller: 'TechStore',
    verified: true,
    location: 'Online',
    type: 'sale',
    badge: 'New',
  },
  {
    id: 4,
    title: 'Professional Photography Session',
    category: 'Services',
    price: 350,
    unit: '/session',
    image: '📸',
    rating: 4.9,
    reviews: 89,
    seller: 'LensPro',
    verified: true,
    location: 'Manhattan, NY',
    type: 'service',
    badge: 'Top Rated',
  },
  {
    id: 5,
    title: 'Vintage Leather Sofa',
    category: 'Furniture',
    price: 890,
    unit: '',
    image: '🛋️',
    rating: 4.7,
    reviews: 12,
    seller: 'Anna K.',
    verified: false,
    location: 'Queens, NY',
    type: 'sale',
    badge: null,
  },
  {
    id: 6,
    title: 'Yoga Classes — Monthly Pass',
    category: 'Services',
    price: 120,
    unit: '/month',
    image: '🧘',
    rating: 4.8,
    reviews: 156,
    seller: 'ZenStudio',
    verified: true,
    location: 'Online + In-Person',
    type: 'service',
    badge: 'Best Value',
  },
  {
    id: 7,
    title: 'Mountain Bike — Trek Fuel EX',
    category: 'Sports',
    price: 65,
    unit: '/day',
    image: '🚴',
    rating: 4.6,
    reviews: 23,
    seller: 'BikeRental Co.',
    verified: true,
    location: 'Central Park, NY',
    type: 'rent',
    badge: null,
  },
  {
    id: 8,
    title: 'Designer Handbag — Limited Edition',
    category: 'Fashion',
    price: 1800,
    unit: '',
    image: '👜',
    rating: 4.9,
    reviews: 7,
    seller: 'Luxury Finds',
    verified: true,
    location: 'Online',
    type: 'sale',
    badge: 'Rare',
  },
];

const FILTERS = ['All', 'For Sale', 'For Rent', 'Services'];

export default function ProductListings({ onNavigate }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'For Sale' && product.type === 'sale') ||
      (activeFilter === 'For Rent' && product.type === 'rent') ||
      (activeFilter === 'Services' && product.type === 'service');

    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <section className="py-20 lg:py-28 relative" id="listings">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-sm text-neutral-400">Featured Listings</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Discover <span className="gradient-text">Great Deals</span>
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Browse our curated selection of top listings from trusted sellers across
            every category.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search products, services, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                  activeFilter === filter
                    ? 'tab-active border-purple-500/30'
                    : 'bg-white/3 border-white/8 text-neutral-400 hover:bg-white/6 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="card-glow rounded-2xl overflow-hidden group cursor-pointer"
                onClick={() => onNavigate('product', product)}
              >
                {/* Image */}
                <div className="product-image-placeholder h-48 flex items-center justify-center text-6xl relative">
                  {product.image}
                  {product.badge && (
                    <span className="absolute top-3 left-3 badge badge-purple">
                      {product.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      View Details
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-blue text-xs">{product.category}</span>
                    {product.type === 'rent' && (
                      <span className="badge badge-green text-xs">For Rent</span>
                    )}
                  </div>

                  <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {product.title}
                  </h3>

                  <div className="flex items-center gap-1 mb-3">
                    <span className="star-rating text-sm">★★★★★</span>
                    <span className="text-neutral-400 text-sm">{product.rating}</span>
                    <span className="text-neutral-600 text-sm">({product.reviews})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-white">
                        ${product.price.toLocaleString()}
                      </span>
                      {product.unit && (
                        <span className="text-neutral-500 text-sm">{product.unit}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-neutral-500 text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {product.location}
                    </div>
                  </div>

                  <div className="section-divider my-4" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs">
                        {product.seller.charAt(0)}
                      </div>
                      <span className="text-neutral-400 text-sm">{product.seller}</span>
                      {product.verified && (
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('product', product);
                      }}
                      className="text-neutral-500 hover:text-purple-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No listings found</h3>
            <p className="text-neutral-400">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Load More */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('browse')}
              className="btn-secondary text-base py-3 px-8"
            >
              Load More Listings
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}