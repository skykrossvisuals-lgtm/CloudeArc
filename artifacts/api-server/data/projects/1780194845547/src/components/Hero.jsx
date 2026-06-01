function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[200px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-8 animate-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span className="text-sm text-cyan-400 font-medium">
            Now in Public Beta — Free for Early Adopters
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-['Syne'] leading-[1.05] tracking-tight max-w-5xl mx-auto">
          Design Cloud Infrastructure{' '}
          <span className="gradient-text">10x Faster</span>
          <br />
          <span className="text-gray-400">with AI Precision</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          CloudeArc turns natural language into production-ready Terraform, Pulumi, and CloudFormation
          templates. Ship resilient architectures in minutes, not weeks.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#pricing" className="btn-primary text-lg px-10 py-4 w-full sm:w-auto">
            Start Building Free
            <span className="ml-2">→</span>
          </a>
          <a
            href="#how-it-works"
            className="btn-secondary text-lg px-10 py-4 w-full sm:w-auto"
          >
            Watch Demo
          </a>
        </div>

        {/* Social Proof */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="flex -space-x-3">
            {[
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
            ].map((src, i) => (
              <img
                key={i}
                src={src}
                alt="User"
                className="w-10 h-10 rounded-full border-2 border-[#080C0A] object-cover ring-2 ring-white/10"
              />
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-[#080C0A] bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center text-xs font-bold ring-2 ring-white/10">
              +2k
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Trusted by <span className="text-gray-300 font-semibold">2,400+</span> DevOps engineers
            and platform teams
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
