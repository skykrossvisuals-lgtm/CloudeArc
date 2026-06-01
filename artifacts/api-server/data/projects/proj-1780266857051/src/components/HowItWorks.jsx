import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      title: "1. Take the Assessment",
      description: "Complete our in-depth fitness and lifestyle questionnaire to build your baseline profile."
    },
    {
      title: "2. Get Your Plan",
      description: "Receive a personalized weekly workout and nutrition plan crafted by our expert coaches."
    },
    {
      title: "3. Train & Track",
      description: "Follow your plan with live coaching, video demos, and real-time form feedback."
    },
    {
      title: "4. Optimize & Grow",
      description: "Adjust based on progress, sync wearables, and hit new personal records every week."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-syne text-white mb-4">
            Your Path to <span className="text-emerald-500">Peak Performance</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Four simple steps to transform your fitness journey with science-backed methods and human support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="absolute -inset-4 bg-emerald-500/10 rounded-2xl blur-lg group-hover:bg-emerald-500/20 transition-all duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-6 text-slate-900 font-bold text-xl">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-syne">{step.title}</h3>
                <p className="text-slate-300 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
