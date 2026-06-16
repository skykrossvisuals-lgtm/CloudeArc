export default function Footer() {
  return (
    <footer className="bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 grid gap-8 md:grid-cols-4 text-gray-400">
        <div>
          <h3 className="font-[Syne] text-xl font-bold text-[#00FF88] mb-4">Apex</h3>
          <p className="text-sm">Personalized workout plans, live coaching, nutrition tracking, wearable sync.</p>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-white">Features</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="hover:text-white transition-colors">Workout Plans</a></li>
            <li><a href="#features" className="hover:text-white transition-colors">Live Coaching</a></li>
            <li><a href="#features" className="hover:text-white transition-colors">Nutrition</a></li>
            <li><a href="#features" className="hover:text-white transition-colors">Wearable Sync</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-white">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-white">Stay Connected</h4>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">YouTube</a>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-800/50 pt-6">
        © 2025 Apex Fitness. All rights reserved.
      </div>
    </footer>
  );
}