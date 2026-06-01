export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
    { name: 'Contact', href: '#' },
  ];

  return (
    <footer className="border-t border-white/10 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-gray-500">
          &copy; {currentYear} HelloWorld. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm text-gray-500 hover:text-white transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}