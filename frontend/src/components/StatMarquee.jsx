import { motion } from 'framer-motion'
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react'

function StatMarquee() {
  const stats = [
    { label: 'Total Funded', value: '₹50Cr+', icon: DollarSign, color: 'text-green-400' },
    { label: 'Active Traders', value: '10,000+', icon: Users, color: 'text-green-400' },
    { label: 'Avg Payout Time', value: '24 Hours', icon: Activity, color: 'text-green-400' },
    { label: 'Win Rate', value: '62%', icon: TrendingUp, color: 'text-green-400' },
    { label: 'Fastest Funding', value: '3 Days', icon: Zap, color: 'text-green-400' },
  ]

  // Duplicate for seamless infinite scroll
  const marqueeStats = [...stats, ...stats, ...stats, ...stats]

  return (
    <div className="bg-black border-y border-white/5 py-4 overflow-hidden relative flex">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
      
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ 
          repeat: Infinity, 
          ease: "linear", 
          duration: 30 
        }}
        className="flex gap-16 whitespace-nowrap pl-10"
      >
        {marqueeStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="flex items-center gap-3">
              <Icon size={18} className={stat.color} />
              <span className="text-gray-400 text-sm font-medium font-inter">{stat.label}:</span>
              <span className={`text-base font-bold font-outfit ${stat.color}`}>{stat.value}</span>
            </div>
          )
        })}
      </motion.div>

      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
    </div>
  )
}

function Zap({ size, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  )
}

export default StatMarquee
