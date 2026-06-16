import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <nav className="sticky top-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        <div className="text-2xl font-bold cursor-pointer" onClick={() => scrollToSection('hero')}>
          Todoify
        </div>
        <div className="md:hidden">
          <button onClick={() => setOpen(!open)} aria-label="Menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              )}
            </svg>
          </button>
        </div>
        <ul className={\`md:flex space-x-6 \${open ? 'block' : 'hidden'} absolute md:static top-16 left-0 w-full bg-white md:bg-transparent p-4 md:p-0\`}> 
          <li className="cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection('hero')}>Home</li>
          <li className="cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection('todo')}>Todos</li>
          <li className="cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection('footer')}>Contact</li>
        </ul>
      </div>
    </nav>
  );
}