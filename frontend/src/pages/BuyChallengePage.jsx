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
        // Fallback for UI design verification if API fails
        setPlans([
          { id: '1', name: 'Seed', challengeType: 'ONE_STEP', accountSize: 250000, challengeFee: 999, profitTarget: 8, dailyLossLimit: 4, maxDrawdown: 8, minTradingDays: 5, maxTradingDays: 30, profitSplit: 80, isActive: true },
          { id: '2', name: 'Starter', challengeType: 'ONE_STEP', accountSize: 500000, challengeFee: 1799, profitTarget: 8, dailyLossLimit: 4, maxDrawdown: 8, minTradingDays: 5, maxTradingDays: 30, profitSplit: 80, isActive: true },
          { id: '3', name: 'Pro', challengeType: 'ONE_STEP', accountSize: 1000000, challengeFee: 3299, profitTarget: 8, dailyLossLimit: 4, maxDrawdown: 8, minTradingDays: 5, maxTradingDays: 30, profitSplit: 80, isActive: true },
          { id: '4', name: 'Elite', challengeType: 'ONE_STEP', accountSize: 1500000, challengeFee: 4799, profitTarget: 8, dailyLossLimit: 4, maxDrawdown: 8, minTradingDays: 5, maxTradingDays: 30, profitSplit: 80, isActive: true },
        ])
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
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(67, 56, 202, 0.1)', borderTopColor: '#2dd4bf', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '10px 0 40px 0' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#1e1b4b', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {step === 1 ? '🚀 Select Your Challenge' : step === 2 ? '📋 Review Order' : '⏳ Redirecting...'}
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b', fontWeight: 500, margin: 0 }}>
            {step === 1 ? 'Choose the path that fits your trading style and start your journey to being funded.' : step === 2 ? 'Confirm your selection and proceed to secure payment.' : 'Please wait while we prepare your secure checkout session.'}
          </p>
        </div>

        {step === 1 && (
          <>
            {/* Step 1: Type Selection */}
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              marginBottom: '40px',
              padding: '6px',
              backgroundColor: '#f1f5f9',
              borderRadius: '20px',
              maxWidth: 'fit-content'
            }}>
              {challengeTypes.map(type => {
                const isActive = selectedType === type.key;
                return (
                  <button
                    key={type.key}
                    onClick={() => { setSelectedType(type.key); setSelectedPlan(null) }}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '16px',
                      border: 'none',
                      backgroundColor: isActive ? 'white' : 'transparent',
                      color: isActive ? '#1e1b4b' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
                      fontWeight: 700,
                      fontSize: '14px'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{type.icon}</span>
                    {type.label}
                  </button>
                )
              })}
            </div>

            {/* Plans Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '24px' 
            }}>
              {filteredPlans.map(plan => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    style={{
                      position: 'relative',
                      padding: '32px',
                      borderRadius: '24px',
                      backgroundColor: isSelected ? 'white' : 'white',
                      border: isSelected ? '2px solid #4338ca' : '2px solid transparent',
                      boxShadow: isSelected ? '0 20px 25px -5px rgba(67, 56, 202, 0.1), 0 10px 10px -5px rgba(67, 56, 202, 0.04)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      transform: isSelected ? 'translateY(-8px)' : 'none'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                      }
                    }}
                  >
                    {/* Badge */}
                    <div style={{ 
                      position: 'absolute', 
                      top: '0', 
                      right: '0', 
                      padding: '8px 16px', 
                      backgroundColor: isSelected ? '#4338ca' : '#f1f5f9',
                      color: isSelected ? 'white' : '#64748b',
                      fontSize: '10px',
                      fontWeight: 900,
                      letterSpacing: '1px',
                      borderBottomLeftRadius: '16px'
                    }}>
                      {plan.name.toUpperCase()}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#94a3b8' }}>ACCOUNT SIZE</p>
                      <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#1e1b4b' }}>
                        {formatAmount(Number(plan.accountSize))}
                      </h3>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#94a3b8' }}>CHALLENGE FEE</p>
                      <h4 style={{ margin: 0, fontSize: '42px', fontWeight: 900, color: '#2dd4bf' }}>
                        {formatAmount(Number(plan.challengeFee))}
                      </h4>
                    </div>

                    {/* Features List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                      {[
                        { label: 'Profit Target', value: `${plan.profitTarget}%`, icon: '📈' },
                        { label: 'Daily Loss', value: `${plan.dailyLossLimit}%`, icon: '📉' },
                        { label: 'Max Drawdown', value: `${plan.maxDrawdown}%`, icon: '⚠️' },
                        { label: 'Profit Split', value: `${plan.profitSplit}%`, icon: '💰' },
                      ].map((feat, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {feat.icon} {feat.label}
                          </span>
                          <span style={{ fontSize: '14px', color: '#1e1b4b', fontWeight: 800 }}>{feat.value}</span>
                        </div>
                      ))}
                    </div>

                    {isSelected && (
                       <div style={{ 
                         marginTop: '24px', 
                         height: '4px', 
                         width: '100%', 
                         backgroundColor: '#2dd4bf', 
                         borderRadius: '2px',
                         animation: 'glow 2s infinite alternate' 
                       }} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Sticky Action Footer */}
            {selectedPlan && (
              <div style={{ 
                marginTop: '48px', 
                textAlign: 'center',
                animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    backgroundColor: '#1e1b4b',
                    color: 'white',
                    border: 'none',
                    padding: '18px 64px',
                    borderRadius: '50px',
                    fontWeight: 900,
                    fontSize: '18px',
                    cursor: 'pointer',
                    boxShadow: '0 10px 15px -3px rgba(30, 27, 75, 0.3)',
                    transition: 'all 0.3s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Buy {selectedPlan.name} Account — {formatAmount(Number(selectedPlan.challengeFee))} 🚀
                </button>
              </div>
            )}
          </>
        )}

        {step === 2 && selectedPlan && (
          <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '32px', 
              padding: '40px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', gap: '40px' }}>
                {/* Left: Plan Summary */}
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    padding: '24px', 
                    borderRadius: '24px', 
                    backgroundColor: '#1e1b4b', 
                    color: 'white',
                    marginBottom: '24px'
                  }}>
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>SELECTED PLAN</p>
                    <h3 style={{ margin: '4px 0 16px 0', fontSize: '24px', fontWeight: 900 }}>{selectedPlan.name} Challenge</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>ACCOUNT SIZE</p>
                        <p style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{formatAmount(Number(selectedPlan.accountSize))}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>PRICE</p>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#2dd4bf' }}>{formatAmount(Number(selectedPlan.challengeFee))}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { label: 'Profit Target', value: `${selectedPlan.profitTarget}%` },
                      { label: 'Daily Loss', value: `${selectedPlan.dailyLossLimit}%` },
                      { label: 'Max Drawdown', value: `${selectedPlan.maxDrawdown}%` },
                      { label: 'Min Trading Days', value: selectedPlan.minTradingDays },
                      { label: 'Max Days', value: 'Unlimited' },
                      { label: 'Profit Split', value: `${selectedPlan.profitSplit}%` },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                        <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', fontWeight: 800 }}>{item.label.toUpperCase()}</p>
                        <p style={{ margin: 0, fontSize: '15px', color: '#1e1b4b', fontWeight: 800 }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Checkout Actions */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ 
                    backgroundColor: '#fffbeb', 
                    padding: '20px', 
                    borderRadius: '20px', 
                    border: '1px solid #fef3c7',
                    marginBottom: '32px'
                  }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#92400e', fontWeight: 600, lineHeight: 1.6 }}>
                      🔒 Secure Checkout: You will be redirected to our encrypted payment processor. Your credentials will be sent instantly upon success.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      style={{
                        padding: '18px',
                        borderRadius: '16px',
                        border: 'none',
                        backgroundColor: '#2dd4bf',
                        color: '#1e1b4b',
                        fontWeight: 900,
                        fontSize: '18px',
                        cursor: purchasing ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      {purchasing ? 'Encrypting...' : 'Secure Checkout →'}
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      style={{
                        padding: '14px',
                        borderRadius: '16px',
                        border: '2px solid #f1f5f9',
                        backgroundColor: 'transparent',
                        color: '#64748b',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      ← Back to Selection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Global Processing Overlay */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div className="pulse" style={{ width: '80px', height: '80px', backgroundColor: 'rgba(45, 212, 191, 0.1)', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
               <div style={{ width: '40px', height: '40px', border: '3px solid #2dd4bf', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
            <h2 style={{ color: '#1e1b4b', fontWeight: 900, margin: '0 0 8px 0' }}>Preparing Your Journey</h2>
            <p style={{ color: '#64748b', fontWeight: 500 }}>Connecting to secure payment node...</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes glow { from { opacity: 0.5; box-shadow: 0 0 5px #2dd4bf; } to { opacity: 1; box-shadow: 0 0 15px #2dd4bf; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </DashboardLayout>
  )
}

export default BuyChallengePage
