export default function CTA() {
  const btnPrimary = "px-8 py-3 rounded-full font-semibold bg-[#00FF88]/10 text-[#00FF88] hover:bg-[#00FF88]/20 transition-all duration-200";

  return (
    <section id="cta" className="py-24 px-4 bg-[#00FF88]/5">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-[Syne] text-4xl font-bold text-[#00FF88] mb-6">Ready to Train Like an Elite?</h2>
        <p className="text-gray-300 mb-8 text-lg">Start your 7‑day free trial. No credit card required.</p>
        <a href="#" className={btnPrimary}>
          Start Free Trial
        </a>
      </div>
    </section>
  );
}