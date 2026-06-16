export default function Hero() {
  return (
    <section id="hero" className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center text-center text-white py-24 px-4">
      <h1 className="font-syne text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
        Train Smarter, Perform Better
      </h1>
      <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl">
        Personalized workout plans, live coaching, nutrition tracking, and seamless wearable sync—all in one powerful app built for athletes who demand results.
      </p>
      <a href="#cta" className="mt-10 inline-block px-8 py-3 rounded-full font-semibold bg-green-500 hover:bg-green-600 text-white transition-all duration-200">
        Start Your Free Trial
      </a>
    </section>
  );
}