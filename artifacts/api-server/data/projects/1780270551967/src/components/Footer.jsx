export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-xl font-bold text-white">EasyRent</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ghana's #1 rental marketplace — connecting renters and owners with verified listings, smart matching, and secure payments.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['For Renters', 'For Owners', 'List Your Property', 'Success Stories'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold mb-4">Popular Categories</h4>
            <ul className="space-y-2">
              {['Homes in Accra', 'Apartments in Kumasi', 'Shops in Cape Coast', 'Commercial Spaces'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-4">Stay Updated</h4>
            <p className="text-slate-400 text-sm mb-4">Get the latest listings and tips in your inbox.</p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-red-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-200">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} EasyRent. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {['Privacy Policy', 'Terms of Service', 'Trust & Safety', 'Contact Us'].map((link) => (
              <a key={link} href="#" className="text-slate-500 hover:text-amber-500 text-sm transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}