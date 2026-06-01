const categories = [
  {
    name: 'Real Estate',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    count: '12,400+ listings',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    name: 'Electronics',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    count: '28,900+ listings',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    name: 'Vehicles',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    count: '8,200+ listings',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    name: 'Furniture',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    count: '15,600+ listings',
    gradient: 'from-rose-400 to-pink-500',
  },
  {
    name: 'Services',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    count: '9,300+ listings',
    gradient: 'from-cyan-400 to-blue-500',
  },
  {
    name: 'Fashion',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    count: '22,100+ listings',
    gradient: 'from-green-400 to-emerald-500',
  },
];

export default function Categories() {
  return (
    <section className="section-container" id="categories">
      <div className="text-center mb-16">
        <span className="badge bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-4">
          Explore
        </span>
        <h2 className="text-4xl md:text-5xl font-bold font-['Syne'] text-white mb-4">
          Browse by <span className="gradient-text-warm">Category</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          From apartments to accessories — discover thousands of listings across every category imaginable.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.name}
            className="card-glass p-6 text-center group hover:bg-white/[0.08] hover:border-white/25 hover:-translate-y-1 transition-all duration-300"
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}
            >
              {cat.icon}
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">{cat.name}</h3>
            <p className="text-slate-500 text-xs">{cat.count}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
