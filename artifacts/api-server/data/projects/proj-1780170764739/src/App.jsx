import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import ProductListing from './components/ProductListing';
import UserProfile from './components/UserProfile';
import ReviewSystem from './components/ReviewSystem';
import PaymentSection from './components/PaymentSection';
import Footer from './components/Footer';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const categories = [
    { id: 'all', name: 'All Items', icon: '🏪' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'furniture', name: 'Furniture', icon: '🪑' },
    { id: 'rentals', name: 'Rentals', icon: '🏠' },
    { id: 'services', name: 'Services', icon: '🔧' },
    { id: 'fashion', name: 'Fashion', icon: '👗' },
    { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
  ];

  const products = [
    {
      id: 1,
      title: 'Modern Apartment for Rent',
      category: 'rentals',
      price: 1200,
      unit: 'month',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
      seller: 'Sarah Johnson',
      rating: 4.8,
      reviews: 24,
      location: 'Downtown, NY',
      description: 'Beautiful 2-bedroom apartment with modern amenities, gym access, and stunning city views.',
      tags: ['furnished', 'pet-friendly', 'parking']
    },
    {
      id: 2,
      title: 'MacBook Pro 16" M3 Max',
      category: 'electronics',
      price: 2499,
      unit: 'one-time',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop',
      seller: 'TechHub Store',
      rating: 4.9,
      reviews: 156,
      location: 'Online',
      description: 'Brand new MacBook Pro with M3 Max chip, 36GB RAM, 1TB SSD. Perfect for professionals.',
      tags: ['new', 'warranty', 'fast-shipping']
    },
    {
      id: 3,
      title: 'Scandinavian Dining Table',
      category: 'furniture',
      price: 450,
      unit: 'one-time',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop',
      seller: 'Furniture Plus',
      rating: 4.6,
      reviews: 38,
      location: 'Brooklyn, NY',
      description: 'Elegant oak dining table seats 6-8 people. Minimalist design with solid wood construction.',
      tags: ['handmade', 'eco-friendly', 'assembly-included']
    },
    {
      id: 4,
      title: 'Professional Photography Session',
      category: 'services',
      price: 299,
      unit: 'session',
      image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&h=400&fit=crop',
      seller: 'LensCraft Studios',
      rating: 4.9,
      reviews: 89,
      location: 'Manhattan, NY',
      description: '2-hour professional photoshoot with 20+ edited high-res images. Perfect for portraits or events.',
      tags: ['professional', 'editing-included', 'flexible-schedule']
    },
    {
      id: 5,
      title: '2023 Tesla Model 3',
      category: 'vehicles',
      price: 42000,
      unit: 'one-time',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop',
      seller: 'AutoElite',
      rating: 4.7,
      reviews: 42,
      location: 'Queens, NY',
      description: 'Low mileage Tesla Model 3 with autopilot, premium interior, and full self-driving capability.',
      tags: ['electric', 'low-mileage', 'certified']
    },
    {
      id: 6,
      title: 'Vintage Leather Jacket',
      category: 'fashion',
      price: 180,
      unit: 'one-time',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=400&fit=crop',
      seller: 'RetroVibe',
      rating: 4.5,
      reviews: 67,
      location: 'Online',
      description: 'Authentic vintage leather jacket from the 80s. Genuine leather with classic biker style.',
      tags: ['vintage', 'genuine-leather', 'limited-edition']
    },
    {
      id: 7,
      title: 'Cozy Studio for Rent',
      category: 'rentals',
      price: 950,
      unit: 'month',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop',
      seller: 'CityLiving',
      rating: 4.4,
      reviews: 31,
      location: 'Williamsburg, NY',
      description: 'Charming studio apartment in trendy Williamsburg. Close to subway and local cafes.',
      tags: ['cozy', 'transit-friendly', 'renovated']
    },
    {
      id: 8,
      title: 'Sony A7 IV Camera',
      category: 'electronics',
      price: 2498,
      unit: 'one-time',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop',
      seller: 'PhotoPro',
      rating: 4.8,
      reviews: 112,
      location: 'Online',
      description: 'Full-frame mirrorless camera with 33MP sensor, 4K 60fps video, and advanced autofocus.',
      tags: ['professional', '4k-video', 'weather-sealed']
    },
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowPayment(false);
  };

  const handleBuyNow = () => {
    setShowPayment(true);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar 
        categories={categories}
        onCategorySelect={setSelectedCategory}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {!selectedProduct ? (
        <>
          <Hero onGetStarted={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })} />
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <ProductListing 
            products={filteredProducts}
            onProductClick={handleProductClick}
          />
          <UserProfile />
        </>
      ) : (
        <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
          {!showPayment ? (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.title}
                  className="w-full h-80 object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-sm text-blue-400 font-medium mb-2">{selectedProduct.category.toUpperCase()}</span>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{selectedProduct.title}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="font-semibold">{selectedProduct.rating}</span>
                  </div>
                  <span className="text-gray-400">({selectedProduct.reviews} reviews)</span>
                </div>
                <p className="text-3xl font-bold text-blue-400 mb-4">
                  ${selectedProduct.price.toLocaleString()}
                  <span className="text-lg text-gray-400 font-normal">/{selectedProduct.unit}</span>
                </p>
                <p className="text-gray-300 mb-6 leading-relaxed">{selectedProduct.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedProduct.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-sm text-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-gray-400 mb-6">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{selectedProduct.location}</span>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleBuyNow} className="btn-primary flex-1">
                    Buy Now
                  </button>
                  <button onClick={handleBackToProducts} className="btn-secondary">
                    Back to Browse
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <PaymentSection 
              product={selectedProduct}
              onBack={handleBackToProducts}
            />
          )}
        </div>
      )}
      
      <ReviewSystem />
      <Footer />
    </div>
  );
}

export default App;