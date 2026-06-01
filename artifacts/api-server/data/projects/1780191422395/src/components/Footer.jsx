const footerLinks = {
  Marketplace: ['Browse All', 'Electronics', 'Rentals', 'Services', 'Vehicles', 'Fashion'],
  Company: ['About Us', 'Careers', 'Press', 'Blog', 'Contact'],
  Support: ['Help Center', 'Safety Tips', 'Seller Guidelines', 'Buyer Protection', 'Dispute Resolution'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Accessibility'],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-[#080C0A] font-bold text-sm">E</span>
              <span className="font-['Syne'] font-bold text-xl tracking-tight">EasyGet</span>
            </a>
            <p className="text-sm text-white/30 leading-relaxed mb-4">
              The marketplace where anyone can buy and sell anything — safely, quickly, and easily.
            </p>
            <div className="flex items-center gap-3">
              {['𝕏', '📷', '💼', '🎵'].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-xs hover:border-white/20 hover:bg-white/10 transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/40 hover:text-white transition-all duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">© 2025 EasyGet, Inc. All rights reserved.</p>
          <p className="text-xs text-white/20">Made with ❤️ for buyers & sellers everywhere</p>
        </div>
      </div>
    </footer>
  );
}