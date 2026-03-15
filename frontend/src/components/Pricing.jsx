import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

function Pricing() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

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

  const formatAmount = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)} Lakh`
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const popularPlan = 'Pro'

  return (
    <section id="plans" className="bg-black py-24 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">Transparent Pricing</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Choose Your Challenge
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            One-time fee. No hidden charges. 100% INR pricing.
          </p>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading plans...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 border transition-all hover:scale-105 ${
                  plan.name === popularPlan
                    ? 'bg-green-400 border-green-400 text-black'
                    : 'bg-gray-900 border-gray-800 text-white hover:border-green-400/50'
                }`}
              >
                {/* Popular Badge */}
                {plan.name === popularPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-black text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-400">
                    MOST POPULAR
                  </div>
                )}

                {/* Plan Name */}
                <p className={`font-black text-xl mb-1 ${plan.name === popularPlan ? 'text-black' : 'text-white'}`}>
                  {plan.name}
                </p>

                {/* Account Size */}
                <p className={`text-sm mb-4 ${plan.name === popularPlan ? 'text-black/70' : 'text-gray-400'}`}>
                  {formatAmount(plan.accountSize)} Account
                </p>

                {/* Fee */}
                <p className={`text-3xl font-black mb-6 ${plan.name === popularPlan ? 'text-black' : 'text-green-400'}`}>
                  ₹{plan.challengeFee.toLocaleString('en-IN')}
                </p>

                {/* Rules */}
                <div className={`space-y-2 mb-6 text-sm ${plan.name === popularPlan ? 'text-black/80' : 'text-gray-400'}`}>
                  <p>✓ {plan.profitTarget}% Profit Target</p>
                  <p>✓ {plan.dailyLossLimit}% Daily Loss Limit</p>
                  <p>✓ {plan.maxDrawdown}% Max Drawdown</p>
                  <p>✓ Min {plan.minTradingDays} Trading Days</p>
                  <p>✓ 80% Profit Split</p>
                  <p>✓ INR Payouts</p>
                </div>

                {/* CTA */}
                <Link
                  to="/register"
                  className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${
                    plan.name === popularPlan
                      ? 'bg-black text-green-400 hover:bg-gray-900'
                      : 'bg-green-400 text-black hover:bg-green-300'
                  }`}
                >
                  Start Challenge
                </Link>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}

export default Pricing