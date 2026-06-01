function ReviewSystem() {
  const reviews = [
    {
      id: 1,
      author: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      date: '2 days ago',
      comment: 'Amazing experience! Found exactly what I needed at a great price. The seller was responsive and the item arrived quickly.',
      product: 'MacBook Pro 16" M3 Max'
    },
    {
      id: 2,
      author: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      date: '1 week ago',
      comment: 'EasyGet made renting my apartment so simple. Had multiple inquiries within hours. Highly recommend!',
      product: 'Modern Apartment for Rent'
    },
    {
      id: 3,
      author: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      rating: 4,
      date: '2 weeks ago',
      comment: 'Great platform for selling furniture. The listing process was smooth and I got a fair price for my items.',
      product: 'Scandinavian Dining Table'
    },
  ];

  return (
    <section className="py-20 bg-[#111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Users Say</h2>
          <p className="text-gray-400">Real reviews from real customers</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map(review => (
            <div key={review.id} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={review.avatar} 
                  alt={review.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-white">{review.author}</h4>
                  <p className="text-xs text-gray-400">{review.date}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                ))}
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-3">"{review.comment}"</p>
              
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-gray-500">Purchased: {review.product}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ReviewSystem;