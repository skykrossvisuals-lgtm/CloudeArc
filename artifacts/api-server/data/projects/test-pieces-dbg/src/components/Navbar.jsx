import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="text-xl font-bold tracking-tight">
          Hello<span className="text-indigo-400">World</span>
        </a>

        {/* Desktop links */}
        <div className="hidden gap-8 md:flex">
          <a href="#" className="text-sm text-gray-300 transition-colors hover:text-white">Home</a>
          <a href="#" className="text-sm text-gray-300 transition-colors hover:text-white">About</a>
          <a href="#" className="text-sm text-gray-300 transition-colors hover:text-white">Contact</a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 transition-colors hover:bg-white/10 md:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-[#0a0a0a] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="#" className="text-sm text-gray-300 transition-colors hover:text-white">Home</a>
            <a href="#" className="text-sm text-gray-300 transition-colors hover:text-white">About</a>
            <a href="#" className="text-sm text-gray-300 transition-colors hover:text-white">Contact</a>
          </div>
        </div>
      )}
    </nav>
  );
}