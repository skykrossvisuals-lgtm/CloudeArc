import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#F4C430] rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F4C430]">
                EasyRent
              </span>
            </div>
            <p className="text-slate-400">
              Ghana's leading rental marketplace, connecting renters and owners with verified listings, secure payments, and neighborhood insights.
            </p>
            <div className="flex gap-4">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                <a
                  key={social}
                  href={`#${social}`}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-[#D4AF37] hover:text-slate-900 transition-all duration-200"
                >
                  <span className="capitalize">{social}</span>
                </a>
              ))}
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="text-white font-bold mb-6">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/properties" className="text-slate-400 hover:text-[#D4AF37] transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link to="/owners" className="text-slate-400 hover:text-[#D4AF37] transition-colors">
                  For Owners
                </Link>
              </li>
              <li>
                <Link to="/neighborhoods" className="text-slate-400 hover:text-[#D4AF37] transition-colors">
                  Neighborhoods
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-[#D4AF37] transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-6">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-slate-400 hover:text-[#D4AF37] transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-slate-400 hover:text-[#D4AF37] transition-colors">
                  Safety Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-slate-400 hover:text-[#D4AF37] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-[#D4AF37] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-6">Stay Updated</h3>
            <p className="text-slate-400 mb-4">
              Get the latest listings and rental tips in your inbox.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-slate-900 font-bold hover:opacity-90 transition-all duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} EasyRent. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link to="/privacy" className="hover:text-[#D4AF37] transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-[#D4AF37] transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="hover:text-[#D4AF37] transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
