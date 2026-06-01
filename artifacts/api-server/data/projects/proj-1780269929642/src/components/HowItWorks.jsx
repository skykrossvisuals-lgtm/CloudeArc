import { motion } from 'framer-motion';

const HowItWorks = () => {
  const steps = [
    {
      title: 'Create Your Profile',
      description: 'Sign up and complete your profile with verified ID for instant trust.',
      icon: '1',
      color: 'bg-[#D4AF37]'
    },
    {
      title: 'Search & Filter',
      description: 'Find properties that match your criteria with smart filters and AI suggestions.',
      icon: '2',
      color: 'bg-[#F4C430]'
    },
    {
      title: 'Book a Viewing',
      description: 'Schedule visits or take virtual tours to see your potential new home.',
      icon: '3',
      color: 'bg-[#D4AF37]'
    },
    {
      title: 'Sign & Move In',
      description: 'Use our secure escrow and digital agreements to finalize your rental.',
      icon: '4',
      color: 'bg-[#F4C430]'
    }
  ];

  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-[#0f172a]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F4C430]">
              How It Works
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Renting made simple with our 4-step process
          </p>
        </div>
        
        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-[#D4AF37] to-[#F4C430] opacity-30 -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-slate-900 shadow-lg shadow-[#D4AF37]/20`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-400">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
