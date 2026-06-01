export default function Reviews() {
  const reviews = [
    {
      id: 1,
      name: 'Jennifer L.',
      role: 'Tenant',
      avatar: 'J',
      rating: 5,
      text: 'Found my dream apartment through EasyGet in just 3 days. The verification process gave me confidence, and the landlord was fantastic. Highly recommend!',
      date: '2 weeks ago',
      verified: true,
    },
    {
      id: 2,
      name: 'David Chen',
      role: 'Property Owner',
      avatar: 'D',
      rating: 5,
      text: 'Listed my rental property and had qualified tenants within a week. The platform\'s screening tools saved me so much time. Revenue is up 40% since switching.',
      date: '1 month ago',
      verified: true,
    },
    {
      id: 3,
      name: 'Maria G.',
      role: 'Freelancer',
      avatar: 'M',
      rating: 5,
      text: 'I offer design services here and have built a steady client base. The review system helps me showcase my work, and payments are always on time.',
      date: '3 weeks ago',
      verified: true,
    },
    {
      id: 4,
      name: 'James Wilson',
      role: 'Buyer',
      avatar: 'J',
      rating: 4,
      text: 'Bought a used MacBook and was nervous at first, but the buyer protection policy gave me peace of mind. Item arrived exactly as described. Great experience!',
      date: '1 month ago',
      verified: true,
    },
    {
      id: 5,
      name: 'Sophie Turner',
      role: 'Seller',
      avatar: 'S',
      rating: 5,
      text: 'Sold my old furniture set in 2 days! The listing process was so easy, and the messaging feature made coordinating pickup seamless.',
      date: '2 months ago',
      verified: true,
    },
    {
      id: 6,
      name: 'Alex Rivera',
      role: 'Renter',
      avatar: 'A',
      rating: 5,
      text: 'Rented a car for a weekend trip through EasyGet. The owner was professional, the car was in perfect condition, and the price was unbeatable.',
      date: '3 months ago',
      verified: true,
    },
  ];

  return (
    <section className="py-20 lg:py-28 relative" id="reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-sm text-neutral-400">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Loved by <span className="gradient-text">50,000+</span> Users
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our community has to say
            about their EasyGet experience.
          </p>
        </div>

        {/* Overall Rating */}
        <div className="card-glow rounded-2xl p-8 max-w-2xl mx-auto mb-12 text-center">
          <div className="text-5xl font-extrabold text-white mb-2">4.9</div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-neutral-400">Based on 12,500+ verified reviews</p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">
                    {review.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">
                        {review.name}
                      </span>
                      {review.verified && (
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-neutral-500 text-xs">{review.role}</span>
                  </div>
                </div>
                <span className="text-neutral-600 text-xs">{review.date}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-neutral-700'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Text */}
              <p className="text-neutral-300 text-sm leading-relaxed">
                "{review.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}