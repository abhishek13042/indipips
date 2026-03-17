import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Info } from 'lucide-react'
import api from '../api'

function Pricing() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('ONE_STEP')
  const [selectedSize, setSelectedSize] = useState(1000000)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/plans')
        setPlans(res.data.data)
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const challengeTypes = [
    { key: 'ZERO_STEP', label: 'Zero Step', desc: 'Instant Funding' },
    { key: 'ONE_STEP', label: '1 Step', desc: 'Fast Track' },
    { key: 'TWO_STEP', label: '2 Step', desc: 'Standard Path' },
  ]

  const accountSizes = [250000, 500000, 1000000, 1500000, 2000000]

  const formatSize = (size) => {
    if (size >= 100000) return `₹${size / 100000} Lakh`
    return `₹${size.toLocaleString('en-IN')}`
  }

  const selectedPlan = plans.find(
    p => p.challengeType === selectedType && p.accountSize === selectedSize
  )

  return (
    <section id="pricing" className="relative py-32 px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gray-800/20 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-white font-outfit mb-6 tracking-tight"
          >
            Transparent <span className="text-green-400 text-glow">Pricing</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-inter"
          >
            One-time fee. No hidden charges. 100% INR pricing structured for the Indian trading ecosystem.
          </motion.p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            
            {/* Challenge Type Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {challengeTypes.map((type) => {
                const isActive = selectedType === type.key;
                return (
                  <button
                    key={type.key}
                    onClick={() => setSelectedType(type.key)}
                    className={`relative px-8 py-4 rounded-xl font-outfit transition-all overflow-hidden ${
                      isActive ? 'text-black bg-green-400 shadow-[0_0_20px_rgba(74,222,128,0.3)]' : 'text-gray-300 glass hover:bg-white/10'
                    }`}
                  >
                    <span className="block text-xl font-bold relative z-10">{type.label}</span>
                    <span className={`block text-sm font-medium relative z-10 mt-1 ${isActive ? 'text-black/70' : 'text-gray-500'}`}>
                      {type.desc}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Account Size Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-16 p-2 rounded-2xl glass-dark">
              {accountSizes.map((size) => {
                const isActive = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-8 py-3 rounded-xl font-bold tracking-wide transition-all ${
                      isActive 
                        ? 'bg-gray-800 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {formatSize(size)}
                  </button>
                )
              })}
            </div>

            {/* Pricing Details Card */}
            <AnimatePresence mode="wait">
              {selectedPlan && (
                <motion.div 
                  key={`${selectedType}-${selectedSize}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-4xl glass-card rounded-3xl p-1 overflow-hidden"
                >
                  <div className="bg-gray-900 rounded-[22px] p-8 md:p-12">
                    
                    {/* Card Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12 pb-8 border-b border-gray-800">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-400/10 border border-green-400/20 text-green-400 text-sm font-bold mb-4">
                          {challengeTypes.find(t => t.key === selectedType)?.label} Mode
                        </div>
                        <h3 className="text-4xl font-black text-white font-outfit">
                          {formatSize(selectedPlan.accountSize)} <span className="text-gray-500 font-medium text-2xl">Account</span>
                        </h3>
                      </div>
                      <div className="text-center md:text-right">
                        <p className="text-gray-500 uppercase tracking-widest font-semibold text-sm mb-2">One-Time Fee</p>
                        <div className="text-5xl font-black text-white font-outfit flex items-baseline gap-1">
                          <span className="text-2xl text-green-400">₹</span>
                          {selectedPlan.challengeFee.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Rules Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                      <RuleCard label="Profit Target" value={`${selectedPlan.profitTarget}%`} subtext="Phase 1" />
                      {selectedType === 'TWO_STEP' ? (
                        <RuleCard label="Phase 2 Target" value={`${selectedPlan.phase2Target}%`} subtext="Phase 2" />
                      ) : (
                        <RuleCard label="Max Drawdown" value={`${selectedPlan.maxDrawdown}%`} subtext="Static" />
                      )}
                      <RuleCard label="Daily Loss Limit" value={`${selectedPlan.dailyLossLimit}%`} subtext="Equity based" highlight />
                      <RuleCard label="Trading Days" value={`${selectedPlan.minTradingDays} Min`} subtext={`Up to ${selectedPlan.maxTradingDays} days`} />
                      
                      <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-gray-800 border border-gray-700 rounded-2xl p-6 mt-4 flex items-center justify-between">
                         <div>
                           <p className="text-gray-400 font-medium mb-1">Profit Split</p>
                           <p className="text-green-400 font-bold">Up to {selectedPlan.profitSplit}%</p>
                         </div>
                         <div className="text-right">
                           <p className="text-gray-400 font-medium mb-1">Leverage</p>
                           <p className="text-white font-bold">1:100</p>
                         </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link
                      to="/register"
                      className="block w-full text-center py-5 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-black font-black text-xl shadow-[0_0_30px_rgba(74,222,128,0.3)] hover:shadow-[0_0_50px_rgba(74,222,128,0.5)] transition-all transform hover:-translate-y-1"
                    >
                      Start Challenge Now
                    </Link>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  )
}

function RuleCard({ label, value, subtext, highlight }) {
  return (
    <div className={`p-6 rounded-2xl border ${highlight ? 'border-red-500/30 bg-red-500/5' : 'border-gray-800 bg-gray-900/50'}`}>
      <div className="flex items-center gap-2 text-gray-400 font-medium text-sm mb-3">
        {label} <Info size={14} className="opacity-50" />
      </div>
      <div className={`text-3xl font-black font-outfit mb-1 ${highlight ? 'text-red-400' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{subtext}</div>
    </div>
  )
}

export default Pricing