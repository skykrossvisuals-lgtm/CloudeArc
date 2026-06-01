import React from 'react';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative max-w-7xl mx-auto text-center">
        <div className="inline-block mb-6 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <span className="text-emerald-500 font-semibold text-sm">The Future of Fitness</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-syne text-white mb-8 leading-tight">
          Unlock Your <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
            Peak Performance
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
          Personalized workout plans, live coaching, nutrition tracking, and wearable sync—all in one platform designed to help you achieve your fitness goals faster.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-500 text-slate-900 font-bold text-lg hover:bg-emerald-400 transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-1">
            Start Your Journey
          </button>
          <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 text-white font-bold text-lg hover:bg-white/10 transition-all duration-200 border border-white/10">
            Watch Demo
          </button>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <div className="aspect-video bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-slate-400">Apex App Interface Preview</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
