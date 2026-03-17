import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = [
    {
      question: 'What makes Indipips different from global prop firms?',
      answer: 'Indipips is entirely localized for India. We deal in INR (no conversion fees), support purely Indian instruments (Nifty, BankNifty, F&O), and process payouts via instant NEFT/IMPS transfers instead of costly international wires. Plus, we fully welcome automated/algo trading without shadow bans.',
    },
    {
      question: 'What instruments can I trade?',
      answer: 'You have full access to trade Nifty 50, BankNifty, MidcapNifty Options & Futures, as well as Equity Stocks on the NSE and BSE. Trade the instruments you already know with zero delay.',
    },
    {
      question: 'What are the core challenge rules?',
      answer: 'Our evaluation is straightforward: Hit an 8% profit target, do not breach the 4% daily loss limit (calculated on day-start equity), and do not hit the 8% maximum trailing drawdown. You must also trade for a minimum of 5 days.',
    },
    {
      question: 'How fast are the payouts processed?',
      answer: 'Incredibly fast. Once you submit a payout request and complete basic KYC verification, your profit split (up to 90%) is processed directly to your linked Indian bank account within 24-48 business hours.',
    },
    {
      question: 'Is algorithm / bot trading allowed?',
      answer: 'Absolutely. We believe technology should assist traders, not penalize them. Algo and automated trading strategies are fully permitted on our platform provided they do not exploit market data delays or engage in toxic flow.',
    },
    {
      question: 'Can I hold trades overnight or over the weekend?',
      answer: 'Yes, overnight and over-the-weekend holding is permitted. However, you must remain mindful of gap-ups and gap-downs, as breaching the drawdown limits during these times will result in account violation.',
    },
  ]

  return (
    <section id="faq" className="relative bg-black py-32 px-4 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gray-800/10 rounded-full blur-[200px] pointer-events-none translate-y-1/2"></div>
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-green-400/5 rounded-full blur-[150px] pointer-events-none -translate-x-1/2"></div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-400/10 border border-green-400/20 text-green-400 font-bold text-sm tracking-wide uppercase mb-6"
          >
            Clarity First
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white font-outfit mb-4"
          >
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-300 text-glow">Questions</span>
          </motion.h2>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen 
                    ? 'bg-gray-900 border-green-500/30 shadow-[0_4px_30px_rgba(74,222,128,0.1)]' 
                    : 'glass-dark hover:border-white/20'
                }`}
              >
                <button
                  className="w-full text-left px-6 py-6 flex items-center justify-between gap-4 group"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className={`font-semibold text-lg font-outfit transition-colors md:pr-10 ${isOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10'}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 pt-0 text-gray-400 text-base leading-relaxed font-inter border-t border-white/5 mt-2 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default FAQ