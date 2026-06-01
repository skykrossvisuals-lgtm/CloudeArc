import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Marcus T.",
      role: "Marathon Runner",
      quote: "Apex completely transformed my training. The personalized plans and live coaching helped me shave 12 minutes off my marathon time."
    },
    {
      name: "Sarah L.",
      role: "Fitness Beginner",
      quote: "I was overwhelmed with fitness apps until I found Apex. The nutrition tracking and wearable sync made it so easy to stay consistent."
    },
    {
      name: "David R.",
      role: "CrossFit Athlete",
      quote: "The form feedback feature is a game-changer. My coaches catch things I'd miss, and my injury-free streak has never been better."
    }
  ];

  return (
    <section id="testimonials" className="py-24 px-4 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-syne text-white mb-4">
            Real Results, <span className="text-emerald-500">Real People</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Join thousands of athletes and fitness enthusiasts who've achieved their goals with Apex.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-slate-900 border border-white/10 rounded-2xl p-8 hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-300 italic mb-6">"{testimonial.quote}"</p>
              <div>
                <p className="text-white font-semibold">{testimonial.name}</p>
                <p className="text-emerald-500 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
