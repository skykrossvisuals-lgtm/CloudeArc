import React from 'react';

export default function Footer() {
  const columns = [
    {
      title: 'Marketplace',
      links: ['Browse All', 'Electronics', 'Fashion', 'Real Estate', 'Vehicles', 'Services'],
    },
    {
      title: 'Company',
      links: ['About Us', 'Careers', 'Press', 'Blog', 'Partners', 'Investors'],
    },
    {
      title: 'Support',
      links: ['Help Center', 'Safety', 'Seller Support', 'Buyer Protection', 'Contact Us', 'Community'],
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility', 'Sitemap'],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-[#080C0A]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold text-white">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 transition-colors duration-200 hover:text-emerald-400"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600">
              <span className="text-xs font-bold text-[#080C0A]">EG</span>
            </div>
            <span className="text-lg font-bold">EasyGet</span>
          </div>

          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} EasyGet Inc. All rights reserved.
          </p>

          <div className="flex gap-4">
            {['Twitter', 'Instagram', 'LinkedIn', 'YouTube'].map((social) => (
              <a
                key={social}
                href="#"
                className="text-sm text-gray-400 transition-colors duration-200 hover:text-emerald-400"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}