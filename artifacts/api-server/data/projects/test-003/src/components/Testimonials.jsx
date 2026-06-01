const testimonials = [
  {
    quote:
      "Nexus completely transformed how our engineering team operates. We cut our deployment time by 60% in the first month alone.",
    author: "Sarah Chen",
    role: "VP of Engineering",
    company: "TechFlow",
    avatar: "SC",
  },
  {
    quote:
      "The automation features alone saved us 20+ hours per week. It's like having an extra team member who never sleeps.",
    author: "Marcus Rodriguez",
    role: "Product Manager",
    company: "LaunchPad",
    avatar: "MR",
  },
  {
    quote:
      "We evaluated 12 different platforms before choosing Nexus. The developer experience and documentation are unmatched.",
    author: "Emily Watson",
    role: "CTO",
    company: "DataSync",
    avatar: "EW",
  },
  {
    quote:
      "Moving from our legacy system to Nexus was seamless. The migration tools and support team made it painless.",
    author: "David Kim",
    role: "Head of Operations",
    company: "ScaleUp Inc",
    avatar: "DK",
  },
  {
    quote:
      "Our team's productivity has skyrocketed. Nexus gives us the visibility and control we need to move fast.",
    author: "Priya Patel",
    role: "Engineering Lead",
    company: "CloudNine",
    avatar: "PP",
  },
  {
    quote:
      "The real-time collaboration features are game-changing. Our remote team feels more connected than ever.",
    author: "Alex Thompson",
    role: "CEO",
    company: "RemoteFirst",
    avatar: "AT",
  },
];

const logos = [
  "TechFlow",
  "LaunchPad",
  "DataSync",
  "ScaleUp",
  "CloudNine",
  "RemoteFirst",
  "BuildKit",
  "NextGen",
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Loved by <span className="gradient-text">teams</span> everywhere
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Join thousands of companies that trust Nexus to power their most
            critical workflows.
          </p>
        </div>

        {/* Logo Cloud */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-16 opacity-40">
          {logos.map((logo) => (
            <span
              key={logo}
              className="text-xl font-bold tracking-tight text-gray-400 hover:text-white transition-colors duration-200"
            >
              {logo}
            </span>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="card card-hover flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <blockquote className="text-gray-300 leading-relaxed mb-6 flex-1">
                "{testimonial.quote}"
              </blockquote>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-sm font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{testimonial.author}</p>
                  <p className="text-xs text-gray-500">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}