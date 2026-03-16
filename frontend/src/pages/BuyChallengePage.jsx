import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import api from '../api'

function BuyChallengePage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [selectedType, setSelectedType] = useState('ONE_STEP')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [step, setStep] = useState(1) // 1=select, 2=review, 3=processing

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/plans')
        setPlans(res.data.data)
      } catch (err) {
        console.error('Failed to fetch plans:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const challengeTypes = [
    { key: 'ZERO_STEP', label: 'Zero Step', desc: 'Instant Funded', icon: '⚡' },
    { key: 'ONE_STEP', label: '1 Step', desc: 'One Evaluation', icon: '🎯' },
    { key: 'TWO_STEP', label: '2 Step', desc: 'Two Evaluations', icon: '🏆' },
  ]

  const filteredPlans = plans.filter(p => p.challengeType === selectedType)

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100)
  }

  const handlePurchase = async () => {
    if (!selectedPlan) return
    setPurchasing(true)
    setStep(3)

    try {
      const res = await api.post('/payments/create-checkout', {
        planId: selectedPlan.id,
      })

      if (res.data.success && res.data.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = res.data.data.url
      }
    } catch (err) {
      console.error('Purchase error:', err)
      alert(err.response?.data?.message || 'Payment failed. Please try again.')
      setPurchasing(false)
      setStep(2)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <p style={{ color: '#6b7280' }}>Loading plans...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>
          {step === 1 ? '🚀 Buy Challenge' : step === 2 ? '📋 Review & Confirm' : '⏳ Processing...'}
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          {step === 1 ? 'Choose your challenge type and account size' : step === 2 ? 'Review your selection before payment' : 'Redirecting to payment...'}
        </p>
      </div>

      {/* Step 1: Select Plan */}
      {step === 1 && (
        <>
          {/* Challenge Type Selector */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            {challengeTypes.map(type => (
              <button
                key={type.key}
                onClick={() => { setSelectedType(type.key); setSelectedPlan(null) }}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '12px',
                  border: selectedType === type.key ? '2px solid #22c55e' : '1px solid #e5e7eb',
                  backgroundColor: selectedType === type.key ? '#f0fdf4' : 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{type.icon}</div>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: '15px' }}>{type.label}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{type.desc}</div>
              </button>
            ))}
          </div>

          {/* Plans Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {filteredPlans.map(plan => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: selectedPlan?.id === plan.id ? '2px solid #22c55e' : '1px solid #e5e7eb',
                  backgroundColor: selectedPlan?.id === plan.id ? '#f0fdf4' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#111827', marginBottom: '4px' }}>
                  {plan.name}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                  Account: {formatAmount(plan.accountSize * 100)}
                </div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#22c55e', marginBottom: '16px' }}>
                  {formatAmount(plan.challengeFee * 100)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#4b5563' }}>
                  <div>📈 Profit Target: {plan.profitTarget}%</div>
                  <div>📉 Daily Loss: {plan.dailyLossLimit}%</div>
                  <div>⚠️ Max Drawdown: {plan.maxDrawdown}%</div>
                  <div>📅 Min Days: {plan.minTradingDays}</div>
                  <div>💰 Profit Split: {plan.profitSplit}%</div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          {selectedPlan && (
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  padding: '14px 48px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Continue — {formatAmount(selectedPlan.challengeFee * 100)}
              </button>
            </div>
          )}
        </>
      )}

      {/* Step 2: Review & Confirm */}
      {step === 2 && selectedPlan && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px' }}>
            {/* Plan Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '18px', color: '#111827' }}>{selectedPlan.name} Challenge</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{selectedType.replace('_', ' ')}</div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#22c55e' }}>
                {formatAmount(selectedPlan.challengeFee * 100)}
              </div>
            </div>

            {/* Rules Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Account Size', value: formatAmount(selectedPlan.accountSize * 100) },
                { label: 'Profit Target', value: `${selectedPlan.profitTarget}%` },
                { label: 'Daily Loss Limit', value: `${selectedPlan.dailyLossLimit}%` },
                { label: 'Max Drawdown', value: `${selectedPlan.maxDrawdown}%` },
                { label: 'Min Trading Days', value: `${selectedPlan.minTradingDays} days` },
                { label: 'Max Trading Days', value: `${selectedPlan.maxTradingDays} days` },
                { label: 'Profit Split', value: `${selectedPlan.profitSplit}% to you` },
              ].map((item, i) => (
                <div key={i} style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Terms */}
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '10px', padding: '12px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
                ⚠️ By proceeding, you accept all challenge rules. Violation of any rule will result in challenge failure. All trading is simulated.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                style={{
                  flex: 2,
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: purchasing ? '#9ca3af' : '#22c55e',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: purchasing ? 'not-allowed' : 'pointer',
                }}
              >
                {purchasing ? 'Processing...' : `Pay ${formatAmount(selectedPlan.challengeFee * 100)} →`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Processing */}
      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #22c55e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Redirecting to secure payment...</p>
        </div>
      )}
    </DashboardLayout>
  )
}

export default BuyChallengePage
