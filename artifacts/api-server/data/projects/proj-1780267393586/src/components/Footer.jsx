import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-slate-900 font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-bold font-syne text-white">Apex</span>
            </div>
            <p className="text-slate-400 max-w-md mb-6">
              The ultimate fitness companion for athletes and enthusiasts. Personalized plans, live coaching, and real-time tracking to help you reach your peak performance.
            </p>
            <div className="flex space-x-4">
              {['Twitter', 'Instagram', 'Facebook', 'LinkedIn'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-slate-900 transition-all duration-200">
                  <span className="sr-only">{social}</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold font-syne mb-6">Product</h3>
            <ul className="space-y-3">
              {['Workout Plans', 'Live Coaching', 'Nutrition Tracking', 'Wearable Sync', 'Success Stories'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-emerald-500 transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold font-syne mb-6">Company</h3>
            <ul className="space-y-3">
              {['About Us', 'Careers', 'Blog', 'Contact', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-emerald-500 transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-slate-500">
            © {new Date().getFullYear()} Apex Fitness. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
