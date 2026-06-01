import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-[#F4C430]/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#F4C430]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Ready to Find Your <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F4C430]">
            Perfect Rental?
          </span>
        </h2>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of Ghanaians who trust EasyRent for their rental needs. 
            Verified listings, secure payments, and neighborhood insights — all in one place.
          </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup" className="px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-slate-900 font-bold text-lg hover:opacity-90 transition-all duration-200 shadow-lg shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/40 transform hover:-translate-y-1">
            Get Started Now
          </Link>
          <Link to="/properties" className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all duration-200">
            Browse Properties
          </Link>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-white">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-slate-400 ml-2">Trusted by 5,000+ users</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
