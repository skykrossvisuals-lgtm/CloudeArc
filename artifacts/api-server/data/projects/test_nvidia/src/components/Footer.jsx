function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8 px-4">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm text-gray-400 hover:text-violet-600 transition-all duration-200">Privacy</a>
          <a href="#" className="text-sm text-gray-400 hover:text-violet-600 transition-all duration-200">Terms</a>
          <a href="#" className="text-sm text-gray-400 hover:text-violet-600 transition-all duration-200">Contact</a>
        </div>
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Taskflow. Built with React + Tailwind.
        </p>
      </div>
    </footer>
  );
}

export default Footer;