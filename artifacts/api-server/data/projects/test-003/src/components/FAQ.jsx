import { useState } from "react";

const faqs = [
  {
    question: "What is Nexus and who is it for?",
    answer:
      "Nexus is an all-in-one SaaS platform designed for engineering and product teams. Whether you're a startup of 5 or an enterprise of 5,000, Nexus helps you build, deploy, and scale your products faster.",
  },
  {
    question: "How does the free trial work?",
    answer:
      "All plans come with a 14-day free trial. No credit card is required to sign up. You'll get full access to all features in your chosen plan, and you can upgrade or downgrade at any time.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Absolutely. You can upgrade, downgrade, or cancel your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at your next billing cycle.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Security is our top priority. Nexus is SOC 2 Type II certified, uses end-to-end encryption, and undergoes regular third-party security audits. We never sell or share your data with third parties.",
  },
  {
    question: "Do you offer custom integrations?",
    answer:
      "Yes! Our Pro and Enterprise plans include access to our API and webhook system. Our Enterprise plan also includes dedicated support for building custom integrations tailored to your stack.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "Starter plans include email support with 24-hour response times. Pro plans get priority support with 4-hour response times. Enterprise plans include a dedicated account manager and 24/7 phone support.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Frequently asked <span className="gradient-text">questions</span>
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Got questions? We've got answers. If you can't find what you're
            looking for, reach out to our team.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-dark-800/50 overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-base font-semibold pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-5 text-sm text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}