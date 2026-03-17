import { motion } from 'framer-motion'
import { Target, Landmark, Zap, Bot, Shield, Activity } from 'lucide-react'

function WhyUs() {
  const reasons = [
    {
      icon: Target,
      title: 'Built for India',
      description: 'Trade Nifty, BankNifty, MidcapNifty, F&O — instruments you already know. No USD confusion, no foreign platforms.',
    },
    {
      icon: Landmark,
      title: '100% INR Payouts',
      description: 'Get paid directly to your Indian bank account via NEFT/IMPS. No Wise, no Payoneer, no massive conversion fees.',
    },
    {
      icon: Zap,
      title: 'Instant UPI Payments',
      description: 'Pay your evaluation fee via UPI, Card, or Netbanking. Get account access within minutes of successful payment.',
    },
    {
      icon: Bot,
      title: 'Algo Trading Allowed',
      description: 'We embrace technology. Use your automated trading strategies freely without fear of shadow bans.',
    },
    {
      icon: Shield,
      title: 'Fair & Transparent Rules',
      description: '8% target, 4% daily loss limit, 8% max drawdown. Simple, fair, and clearly defined rules with no hidden traps.',
    },
    {
      icon: Activity,
      title: 'Real-Time Insights',
      description: 'Track your P&L, drawdown, and rule compliance live on our cutting-edge dashboard. Always know where you stand.',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  }

  return (
    <section id="why-us" className="relative bg-black py-32 px-4 border-t border-b border-white/5">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-20 text-glow">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white mb-4 font-outfit"
          >
            Why Choose <span className="text-green-400 text-glow">Indipips?</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-inter"
          >
            The only proprietary trading firm architected exclusively from the ground up for the Indian market.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {reasons.map((reason, index) => {
            const Icon = reason.icon
            return (
              <motion.div 
                key={index} 
                variants={cardVariants}
                className="glass-dark border border-white/5 rounded-2xl p-8 hover:border-gray-600 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-transparent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-700">
                  <Icon className="text-green-400 group-hover:text-green-300" size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-white font-bold text-xl mb-3 font-outfit group-hover:text-green-400 transition-colors">
                  {reason.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-inter">
                  {reason.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center glass-card border border-green-400/20 rounded-[32px] p-12 relative overflow-hidden group"
        >
          {/* Subtle moving background inside the banner */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
          
          <h3 className="text-3xl md:text-4xl font-black text-white mb-4 font-outfit relative z-10">
            Ready to prove your edge?
          </h3>
          <p className="text-gray-300 mb-8 text-lg font-inter relative z-10">
            Join thousands of Indian traders currently dominating the markets.
          </p>
          <a href="#pricing" className="relative z-10 inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]">
            Explore Trading Objectives
          </a>
        </motion.div>

      </div>
    </section>
  )
}

export default WhyUs