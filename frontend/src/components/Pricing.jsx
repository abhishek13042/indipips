import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
    { key: 'ZERO_STEP', label: 'Zero Step', desc: 'Instant Funded' },
    { key: 'ONE_STEP', label: '1 Step', desc: 'One Evaluation' },
    { key: 'TWO_STEP', label: '2 Step', desc: 'Two Evaluations' },
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
    <section id="plans" className="bg-black py-24 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">Transparent Pricing</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Choose Your Challenge</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">One-time fee. No hidden charges. 100% INR pricing.</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading plans...</div>
        ) : (
          <>
            {/* Challenge Type Selector */}
            <div className="flex justify-center gap-3 mb-6">
              {challengeTypes.map(type => (
                <button
                  key={type.key}
                  onClick={() => setSelectedType(type.key)}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    selectedType === type.key
                      ? 'bg-green-400 text-black'
                      : 'bg-gray-900 text-gray-400 border border-gray-700 hover:border-green-400/50'
                  }`}
                >
                  {type.label}
                  <span className={`block text-xs font-normal mt-0.5 ${selectedType === type.key ? 'text-black/70' : 'text-gray-500'}`}>
                    {type.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* Account Size Selector */}
            <div className="flex justify-center gap-2 mb-10 flex-wrap">
              {accountSizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
                    selectedSize === size
                      ? 'bg-green-400 text-black'
                      : 'bg-gray-900 text-gray-400 border border-gray-700 hover:border-green-400/50'
                  }`}
                >
                  {formatSize(size)}
                </button>
              ))}
            </div>

            {/* Plan Detail Card */}
            {selectedPlan && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-2xl mx-auto">

                {/* Plan Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{challengeTypes.find(t => t.key === selectedType)?.label} Challenge</p>
                    <p className="text-white font-black text-2xl">{formatSize(selectedPlan.accountSize)} Account</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm mb-1">Challenge Fee</p>
                    <p className="text-green-400 font-black text-3xl">₹{selectedPlan.challengeFee.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Rules Table */}
                <div className="space-y-4 mb-8">

                  {selectedType === 'ZERO_STEP' && (
                    <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-4 text-center">
                      <p className="text-green-400 font-bold">🚀 No Evaluation Required</p>
                      <p className="text-gray-400 text-sm mt-1">Get funded instantly — start trading right away</p>
                    </div>
                  )}

                  {selectedType !== 'ZERO_STEP' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-800 rounded-xl p-4">
                        <p className="text-gray-400 text-xs mb-1">Phase 1 Target</p>
                        <p className="text-white font-bold text-lg">{selectedPlan.profitTarget}%</p>
                      </div>
                      {selectedType === 'TWO_STEP' && (
                        <div className="bg-gray-800 rounded-xl p-4">
                          <p className="text-gray-400 text-xs mb-1">Phase 2 Target</p>
                          <p className="text-white font-bold text-lg">{selectedPlan.phase2Target}%</p>
                        </div>
                      )}
                      <div className="bg-gray-800 rounded-xl p-4">
                        <p className="text-gray-400 text-xs mb-1">Min Trading Days</p>
                        <p className="text-white font-bold text-lg">{selectedPlan.minTradingDays} days</p>
                      </div>
                      <div className="bg-gray-800 rounded-xl p-4">
                        <p className="text-gray-400 text-xs mb-1">Max Trading Days</p>
                        <p className="text-white font-bold text-lg">{selectedPlan.maxTradingDays} days</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-400 text-xs mb-1">Daily Loss Limit</p>
                      <p className="text-red-400 font-bold text-lg">{selectedPlan.dailyLossLimit}%</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-400 text-xs mb-1">Max Drawdown</p>
                      <p className="text-red-400 font-bold text-lg">{selectedPlan.maxDrawdown}%</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-400 text-xs mb-1">Profit Split</p>
                      <p className="text-green-400 font-bold text-lg">{selectedPlan.profitSplit}%</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  to="/register"
                  className="block text-center bg-green-400 text-black py-4 rounded-xl font-black text-lg hover:bg-green-300 transition-all"
                >
                  Start Challenge — ₹{selectedPlan.challengeFee.toLocaleString('en-IN')}
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default Pricing