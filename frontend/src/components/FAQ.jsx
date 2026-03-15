import { useState } from 'react'

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'What is Indipips?',
      answer: 'Indipips is India\'s first proprietary trading platform built exclusively for Indian traders. You pay a one-time challenge fee, trade with virtual capital on NSE/BSE instruments, hit the profit target, and get a funded account with real INR payouts.',
    },
    {
      question: 'What instruments can I trade?',
      answer: 'You can trade Nifty 50, BankNifty, MidcapNifty options, Equity Futures & Options, and Equity Stocks on NSE/BSE. All Indian instruments you already know and trade.',
    },
    {
      question: 'What are the challenge rules?',
      answer: 'You need to hit 8% profit target within 45 days, trade for minimum 5 days, stay within 4% daily loss limit and 8% max drawdown. Simple, transparent, and fair rules.',
    },
    {
      question: 'How do payouts work?',
      answer: 'Once you pass the challenge and get a funded account, you keep 80% of all profits. Payouts are processed directly to your Indian bank account via NEFT/IMPS. No international transfers, no conversion fees.',
    },
    {
      question: 'Is algo trading allowed?',
      answer: 'Yes! Algo and automated trading is fully allowed on Indipips. This is a major advantage over most global prop firms that ban automated strategies.',
    },
    {
      question: 'What happens if I fail the challenge?',
      answer: 'If you breach any rule, your challenge ends. You can retry at a discounted price. Many successful traders retry 2-3 times before passing — it\'s part of the journey.',
    },
    {
      question: 'How is this different from FTMO or other global prop firms?',
      answer: 'Global platforms charge in USD, don\'t support Indian instruments, and pay via international transfers. Indipips is 100% INR, supports Nifty/BankNifty/F&O, and pays directly to your Indian bank account.',
    },
    {
      question: 'When will Indipips launch?',
      answer: 'Indipips is currently in development and will launch soon. Join the waitlist to get early access and an exclusive launch discount.',
    },
  ]

  return (
    <section id="faq" className="bg-black py-24 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">Got Questions?</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
            >
              <button
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-white font-semibold text-sm md:text-base">{faq.question}</span>
                <span className={`text-green-400 text-xl transition-transform ${openIndex === index ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default FAQ