const Stats = () => {
  const stats = [
    { value: '10,000+', label: 'Verified Listings' },
    { value: '5,000+', label: 'Happy Tenants' },
    { value: '98%', label: 'Property Verification' },
    { value: '24/7', label: 'Customer Support' }
  ];

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 bg-[#D4AF37]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-slate-900">
                {stat.value}
              </div>
              <div className="text-lg font-medium text-slate-900">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
