export default function Footer() {
  return (
    <footer id="footer" className="bg-gray-800 text-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Todoify</h3>
          <p className="text-sm">Your daily companion for task management.</p>
        </div>
        <div>
          <h4 className="font-medium mb-2">Resources</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:underline">Documentation</a></li>
            <li><a href="#" className="hover:underline">API</a></li>
            <li><a href="#" className="hover:underline">Support</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2">Legal</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            <li><a href="#" className="hover:underline">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Todoify. All rights reserved.
      </div>
    </footer>
  );
}