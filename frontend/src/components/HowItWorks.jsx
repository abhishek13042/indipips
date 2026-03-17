import { motion } from 'framer-motion'
import { ClipboardList, CreditCard, TrendingUp, Trophy } from 'lucide-react'

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Choose Your Plan',
      description: 'Select your evaluation path. Pick an account size from ₹2.5L to ₹20L virtual capital.',
      icon: ClipboardList,
    },
    {
      number: '02',
      title: 'Pay & Start Trading',
      description: 'Instantly pay via UPI or Netbanking. Get access to your powerful NSE/BSE virtual environment.',
      icon: CreditCard,
    },
    {
      number: '03',
      title: 'Hit the Target',
      description: 'Trade Nifty, BankNifty, or F&O. Hit the profit target while staying within our fair drawdown limits.',
      icon: TrendingUp,
    },
    {
      number: '04',
      title: 'Get Funded & Earn',
      description: 'Pass the evaluation and get a funded account. Keep up to 90% of profits, paid out directly via NEFT.',
      icon: Trophy,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <section id="how-it-works" className="relative bg-black py-24 px-4 overflow-hidden border-t border-white/5">
      
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-400/5 rounded-full blur-[150px] pointer-events-none -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-20 text-glow">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-green-400 text-sm font-bold mb-4 uppercase tracking-widest"
          >
            The Process
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white font-outfit mb-4"
          >
            Your Journey to <span className="text-green-400">Funding</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-xl mx-auto font-inter"
          >
            From registration to your first payout in 4 simple, transparent steps.
          </motion.p>
        </div>

        {/* Steps */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
        >
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-green-400/20 to-transparent"></div>

          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="relative group pt-8"
              >
                <div className="glass-dark border border-white/5 rounded-2xl p-8 hover:border-green-400/30 transition-all duration-300 h-full flex flex-col items-center text-center transform hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(74,222,128,0.1)]">
                  
                  {/* Icon & Number Pin */}
                  <div className="absolute -top-6 w-12 h-12 rounded-full bg-black border border-green-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.2)] group-hover:scale-110 transition-transform">
                    <span className="text-green-400 font-black font-outfit">{step.number}</span>
                  </div>

                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 text-green-300 group-hover:text-green-400 group-hover:bg-green-400/10 transition-colors">
                    <Icon size={32} strokeWidth={1.5} />
                  </div>
                  
                  <h3 className="text-white font-bold text-xl mb-3 font-outfit">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

      </div>
    </section>
  )
}

export default HowItWorks