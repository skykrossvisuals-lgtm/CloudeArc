export default function Features() {
  const features = [
    {
      title: 'Personalized Workout Plans',
      desc: 'AI-driven plans that evolve with your progress, goals, and recovery data.',
      icon: (
        <svg className="h-8 w-8 text-[#00FF88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      )
    },
    {
      title: 'Live Coaching',
      desc: 'Train with certified coaches via video, get real‑time feedback and motivation.',
      icon: (
        <svg className="h-8 w-8 text-[#00FF88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3"/>
        </svg>
      )
    },
    {
      title: 'Nutrition Tracking',
      desc: 'Log meals, track macros, and get smart suggestions based on your activity.',
      icon: (
        <svg className="h-8 w-8 text-[#00FF88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6"/>
        </svg>
      )
    },
    {
      title: 'Wearable Sync',
      desc: 'Connect Apple Watch, Garmin, Fitbit and more to auto‑import heart rate, steps, and sleep.',
      icon: (
        <svg className="h-8 w-8 text-[#00FF88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 110-4 2 2 0 010 4z"/>
        </svg>
      )
    }
  ];

  return (
    <section className="py-24 px-4 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center font-[Syne] text-4xl font-bold text-white mb-12">How Apex Works</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, idx) => (
            <div key={idx} className="bg-gray-800/50 p-6 rounded-2xl border border-[#00FF88]/20 flex flex-col items-center text-center space-y-4">
              <div className="flex items-center justify-center w-12 h-12 bg-[#00FF88]/10 rounded-full">
                {f.icon}
              </div>
              <h3 className="font-[Syne] text-xl font-bold text-white">{f.title}</h3>
              <p className="text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
