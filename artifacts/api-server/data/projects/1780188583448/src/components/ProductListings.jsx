import React, { useState } from 'react';

export default function ProductListings() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Listings' },
    { id: 'trending', label: 'Trending' },
    { id: 'new', label: 'New Arrivals' },
    { id: 'rentals', label: 'Rentals' },
  ];

  const products = [
    {
      id: 1,
      title: 'MacBook Pro 16" M3 Max',
      price: 2499,
      originalPrice: 2799,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
      seller: 'TechWorld Store',
      rating: 4.9,
      reviews: 342,
      badge: 'Best Seller',
      category: 'electronics',
    },
    {
      id: 2,
      title: 'Modern Downtown Apartment',
      price: 2800,
      period: '/month',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
      seller: 'Prime Realty',
      rating: 4.8,
      reviews: 89,
      badge: 'Rental',
      category: 'real-estate',
    },
    {
      id: 3,
      title: 'Vintage Leather Jacket',
      price: 189,
      originalPrice: 250,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
      seller: 'Retro Fashion Co.',
      rating: 4.7,
      reviews: 156,
      badge: 'Sale',
      category: 'fashion',
    },
    {
      id: 4,
      title: 'Professional Photography Session',
      price: 350,
      image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80',
      seller: 'Lens & Light Studio',
      rating: 5.0,
      reviews: 78,
      badge: 'Service',
      category: 'services',
    },
    {
      id: 5,
      title: 'Tesla Model Y Performance',
      price: 52990,
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80',
      seller: 'GreenDrive Motors',
      rating: 4.9,
      reviews: 201,
      badge: 'Verified',
      category: 'vehicles',
    },
    {
      id: 6,
      title: 'Handwoven Persian Rug',
      price: 1200,
      originalPrice: 1500,
      image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80',
      seller: 'Artisan Home',
      rating: 4.8,
      reviews: 64,
      badge: 'Art',
      category: 'art',
    },
    {
      id: 7,
      title: 'Sony A7 IV Camera Kit',
      price: 2498,
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
      seller: 'PhotoPro Gear',
      rating: 4.9,
      reviews: 189,
      badge: 'New',
      category: 'electronics',
    },
    {
      id: 8,
      title: 'Luxury Beachfront Villa',
      price: 8500,
      period: '/month',
      image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=80',
      seller: 'Coastal Living',
      rating: 4.9,
      reviews: 45,
      badge: 'Premium Rental',
      category: 'real-estate',
    },
  ];

  const filtered = activeTab === 'all'
    ? products
    : activeTab === 'rentals'
      ? products.filter((p) => p.period)
      : activeTab === 'new'
        ? products.filter((p) => p.badge === 'New')
        : products;

  return (
    <section id="listings" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                Featured Listings
              </span>
            </h2>
            <p className="mt-2 text-gray-400">Discover top picks from our curated marketplace</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-[#080C0A]'
                    : 'border border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10"
            >
              {/* Image */}
              <div className="relative overflow-hidden rounded-t-2xl">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-[#080C0A]/80 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
                  {product.badge}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-white line-clamp-1">{product.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{product.seller}</p>

                {/* Rating */}
                <div className="mt-2 flex items-center gap-1">
                  <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-white">{product.rating}</span>
                  <span className="text-sm text-gray-500">({product.reviews})</span>
                </div>

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white">
                    ${product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {product.period && (
                    <span className="text-sm text-gray-400">{product.period}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-semibold text-[#080C0A] transition-all duration-200 hover:opacity-90">
                    View Details
                  </button>
                  <button className="rounded-xl border border-white/10 bg-white/5 p-2.5 transition-all duration-200 hover:border-white/20 hover:bg-white/10">
                    <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="rounded-full border border-white/20 bg-white/5 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:bg-white/10">
            View All Listings
          </button>
        </div>
      </div>
    </section>
  );
}