import { motion } from 'framer-motion'
import { ArrowRight, Trophy, Users, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

function Hero() {
  const stats = [
    { label: 'Traders Funded', value: '10,000+', icon: Users },
    { label: 'Total Payouts', value: '₹50Cr+', icon: Trophy },
    { label: 'Trust Score', value: '4.9/5', icon: ShieldCheck },
  ]

  return (
    <div className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
      
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-green-400/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[100px] mix-blend-screen" style={{ animationDelay: '2s' }}></div>
        
        {/* Subtle Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center">
        
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border-gray-800"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-green-400">Built by traders, for traders</span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-outfit font-black text-white leading-[1.1] mb-6 tracking-tight">
            Prop trading, <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-200">
              perfected for India.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-inter max-w-2xl mx-auto mb-10 leading-relaxed">
            Join the leading firm evaluating traders based on skill, not luck. Trade in a fully simulated environment with flexible rules and earn up to 90% reward shares.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-20"
        >
          <Link 
            to="/register" 
            className="group relative px-8 py-4 rounded-xl bg-white text-black font-bold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-400/20 to-gray-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative flex items-center justify-center gap-2">
              Start Evaluation <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <a 
            href="#objectives" 
            className="px-8 py-4 rounded-xl glass text-white font-semibold text-lg hover:bg-white/10 transition-colors"
          >
            View Objectives
          </a>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform duration-300">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-4 border border-gray-700 text-green-400">
                  <Icon size={24} />
                </div>
                <div className="text-3xl font-black text-white mb-1 font-outfit">{stat.value}</div>
                <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
              </div>
            )
          })}
        </motion.div>

      </div>
    </div>
  )
}

export default Hero