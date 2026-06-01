import { useState, useEffect } from 'react';

export default function Navbar({ onNavigate, currentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Browse', page: 'browse' },
    { label: 'Categories', page: 'categories' },
    { label: 'How It Works', page: 'how-it-works' },
    { label: 'Reviews', page: 'reviews' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
              E
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Easy<span className="gradient-text">Get</span>
            </span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`nav-link ${
                  currentPage === link.page ? 'text-white' : ''
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => onNavigate('login')}
              className="btn-secondary text-sm py-2 px-4"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('sell')}
              className="btn-primary text-sm py-2 px-4"
            >
              Start Selling
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mobile-menu mx-4 mb-4 rounded-2xl p-4 border border-white/10">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => {
                  onNavigate(link.page);
                  setIsMenuOpen(false);
                }}
                className={`text-left px-4 py-3 rounded-xl transition-colors ${
                  currentPage === link.page
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="section-divider my-2" />
            <button
              onClick={() => {
                onNavigate('login');
                setIsMenuOpen(false);
              }}
              className="btn-secondary w-full justify-center text-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                onNavigate('sell');
                setIsMenuOpen(false);
              }}
              className="btn-primary w-full justify-center text-sm"
            >
              Start Selling
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}