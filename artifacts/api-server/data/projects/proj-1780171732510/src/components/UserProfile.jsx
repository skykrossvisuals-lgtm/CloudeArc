function UserProfile() {
  const user = {
    name: 'Alex Morgan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    rating: 4.9,
    sales: 127,
    joined: '2023',
    badges: ['Top Seller', 'Verified', 'Fast Responder']
  };

  return (
    <section className="py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trusted by the Community</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Join thousands of satisfied users who trust EasyGet for their buying and selling needs</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card p-8 text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-blue-500/50">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
            <div className="flex items-center justify-center gap-1 mb-3">
              <span className="text-yellow-400">★</span>
              <span className="font-semibold">{user.rating}</span>
              <span className="text-gray-400 text-sm">({user.sales} sales)</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {user.badges.map(badge => (
                <span key={badge} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                  {badge}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-400">Member since {user.joined}</p>
          </div>
          
          <div className="card p-8">
            <div className="text-3xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-white mb-2">Buyer Protection</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Every purchase is protected. If your item doesn't arrive or isn't as described, we'll help you get a full refund.
            </p>
          </div>
          
          <div className="card p-8">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-white mb-2">Secure Messaging</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Communicate safely with buyers and sellers through our encrypted messaging system. Your privacy matters.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UserProfile;