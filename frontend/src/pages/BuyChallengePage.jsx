import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Target, TrendingUp as TrendingUpIcon, Zap, Lock, Shield, ArrowLeft } from 'lucide-react'
import api from '../api'
import useAuthStore from '../stores/authStore'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import BottomNav from '../components/dashboard/BottomNav'

const colors = {
  bg: '#060B14',
  surface: '#0D1420',
  surface2: '#131D2E',
  card: '#111827',
  border: '#1E2D40',
  accent: '#2563EB',
  accent2: '#1D4ED8',
  gold: '#F59E0B',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  text: '#F1F5F9',
  text2: '#94A3B8',
  text3: '#475569'
}

const formatINR = (paise) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(paise / 100)
}

const BuyChallengePage = () => {
  const [plans, setPlans] = useState([])
  const [selectedType, setSelectedType] = useState('ONE_STEP')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState(null)

  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Fetch all plans
    api.get('/plans')
      .then(res => {
        setPlans(res.data.data || [])
        setIsLoading(false)
        
        // Auto select from URL param
        const planId = searchParams.get('planId')
        if (planId) {
          const plan = res.data.data.find(p => p.id === planId)
          if (plan) {
            setSelectedPlan(plan)
            setSelectedType(plan.type || plan.planType || plan.challengeType || 'ONE_STEP')
          }
        }
      })
      .catch(() => setIsLoading(false))
  }, [searchParams])

  const filteredPlans = plans.filter(p => {
    const planType = p.type || p.planType || p.challengeType
    return planType === selectedType
  })

  // Calculate totals for selected plan
  const baseAmount = selectedPlan ? selectedPlan.challengeFee / 100 : 0
  const gstAmount = baseAmount * 0.18
  const totalAmount = baseAmount + gstAmount

  const handlePayment = async () => {
    if (!selectedPlan) return
    setPaymentLoading(true)
    setError(null)
    
    try {
      // Create Razorpay order
      const orderRes = await api.post('/payments/create-checkout', { planId: selectedPlan.id })
      const { orderId, totalAmount: totalPaisa, razorpayKeyId, planName } = orderRes.data.data

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const options = {
          key: razorpayKeyId,
          amount: totalPaisa,
          currency: 'INR',
          name: 'Indipips',
          description: planName + ' Challenge',
          order_id: orderId,
          prefill: {
            name: user?.fullName,
            email: user?.email,
            contact: user?.phone
          },
          theme: {
            color: colors.accent
          },
          handler: async (response) => {
            // Payment successful
            await verifyPayment(response)
          },
          modal: {
            ondismiss: () => {
              setPaymentLoading(false)
            }
          }
        }
        
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', (response) => {
          navigate('/payment/failed?reason=' + encodeURIComponent(response.error.description))
        })
        rzp.open()
      }
      script.onerror = () => {
        setError('Failed to load Razorpay SDK')
        setPaymentLoading(false)
      }
      document.body.appendChild(script)
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order')
      setPaymentLoading(false)
    }
  }

  const verifyPayment = async (response) => {
    try {
      await api.post('/payments/verify', {
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature
      })
      navigate('/payment/success?plan=' + encodeURIComponent(selectedPlan.name))
    } catch (err) {
      navigate('/payment/failed?reason=verification_failed')
    }
  }

  // Helper for rules list
  const renderRules = (type) => {
    if (type === 'ONE_STEP') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px', fontSize: '12px', color: colors.text2 }}>
        <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> 8% Profit Target</div>
        <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> 4% Daily Loss</div>
        <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> 8% Max Drawdown</div>
        <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> 45 Days</div>
        <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> 80% Split</div>
      </div>
    )
    if (type === 'TWO_STEP') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px', fontSize: '12px', color: colors.text2 }}>
        <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> Phase 1: 8% Target</div>
        <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> Phase 2: 5% Target</div>
        <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> 5% Daily Loss</div>
        <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> 60 Days</div>
        <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> 80% Split</div>
      </div>
    )
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px', fontSize: '12px', color: colors.text2 }}>
        <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> No Profit Target</div>
        <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> Instant Funding</div>
        <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> 3% Daily Loss</div>
        <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> 5% Max Drawdown</div>
        <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> 80% Split</div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <div className="desktop-only"><Sidebar /></div>
      
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <TopBar />

        <div style={{ padding: '32px', flex: 1 }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Buy a Challenge</h1>
            <p style={{ fontSize: '16px', color: colors.text2 }}>Choose your account size and start your funded trading journey</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', lg: { flexDirection: 'row' }, gap: '32px', alignItems: 'flex-start' }}>
            
            {/* LEFT SIDE: PlANS SELECTION */}
            <div style={{ flex: 1, width: '100%' }}>
              
              {/* TABS */}
              <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px' }}>
                <div 
                  onClick={() => { setSelectedType('ONE_STEP'); setSelectedPlan(null); }}
                  style={{
                    backgroundColor: selectedType === 'ONE_STEP' ? 'rgba(37,99,235,0.15)' : colors.surface,
                    border: `1px solid ${selectedType === 'ONE_STEP' ? colors.accent : colors.border}`,
                    borderRadius: '12px', padding: '16px 24px', cursor: 'pointer', minWidth: '200px',
                    color: selectedType === 'ONE_STEP' ? 'white' : colors.text2,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                    <Target size={18} color={selectedType === 'ONE_STEP' ? colors.accent : colors.text2} /> 1-Step Challenge
                  </div>
                  <div style={{ fontSize: '12px', color: selectedType === 'ONE_STEP' ? colors.accent : colors.text3, fontWeight: 600 }}>Most Popular</div>
                  <div style={{ fontSize: '13px', marginTop: '8px' }}>Hit 8% target in 45 days</div>
                </div>

                <div 
                  onClick={() => { setSelectedType('TWO_STEP'); setSelectedPlan(null); }}
                  style={{
                    backgroundColor: selectedType === 'TWO_STEP' ? 'rgba(37,99,235,0.15)' : colors.surface,
                    border: `1px solid ${selectedType === 'TWO_STEP' ? colors.accent : colors.border}`,
                    borderRadius: '12px', padding: '16px 24px', cursor: 'pointer', minWidth: '200px',
                    color: selectedType === 'TWO_STEP' ? 'white' : colors.text2,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                    <TrendingUpIcon size={18} color={selectedType === 'TWO_STEP' ? colors.accent : colors.text2} /> 2-Step Challenge
                  </div>
                  <div style={{ fontSize: '12px', color: selectedType === 'TWO_STEP' ? colors.accent : colors.success, fontWeight: 600 }}>Best Value</div>
                  <div style={{ fontSize: '13px', marginTop: '8px' }}>Lower fees, two phases</div>
                </div>

                <div 
                  onClick={() => { setSelectedType('ZERO_STEP'); setSelectedPlan(null); }}
                  style={{
                    backgroundColor: selectedType === 'ZERO_STEP' ? 'rgba(37,99,235,0.15)' : colors.surface,
                    border: `1px solid ${selectedType === 'ZERO_STEP' ? colors.accent : colors.border}`,
                    borderRadius: '12px', padding: '16px 24px', cursor: 'pointer', minWidth: '200px',
                    color: selectedType === 'ZERO_STEP' ? 'white' : colors.text2,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                    <Zap size={18} color={selectedType === 'ZERO_STEP' ? colors.accent : colors.text2} /> Instant Funded
                  </div>
                  <div style={{ fontSize: '12px', color: selectedType === 'ZERO_STEP' ? colors.accent : colors.gold, fontWeight: 600 }}>No Evaluation</div>
                  <div style={{ fontSize: '13px', marginTop: '8px' }}>Get funded immediately</div>
                </div>
              </div>

              {/* CARDS */}
              {isLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: '300px', borderRadius: '16px' }}></div>)}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', padding: '4px' }}>
                  {filteredPlans.map(plan => {
                    const isSelected = selectedPlan?.id === plan.id
                    const isPro = plan.name?.toLowerCase().includes('pro')
                    const planFee = plan.challengeFee / 100
                    const planGST = planFee * 0.18
                    
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        style={{
                          minWidth: '220px',
                          backgroundColor: isSelected ? 'rgba(37,99,235,0.08)' : colors.surface,
                          border: `2px solid ${isSelected ? colors.accent : (isPro ? colors.gold : colors.border)}`,
                          borderRadius: '16px',
                          padding: '24px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? `0 0 20px rgba(37,99,235,0.2)` : 'none',
                          transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = colors.accent
                            e.currentTarget.style.transform = 'translateY(-2px)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = isPro ? colors.gold : colors.border
                            e.currentTarget.style.transform = 'translateY(0)'
                          }
                        }}
                      >
                        {isPro && (
                          <div style={{
                            position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                            backgroundColor: colors.gold, color: colors.bg, fontSize: '11px', fontWeight: 'bold',
                            padding: '4px 12px', borderRadius: '999px', whiteSpace: 'nowrap'
                          }}>
                            MOST POPULAR
                          </div>
                        )}
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: colors.text2, textTransform: 'uppercase', marginBottom: '8px' }}>
                          {plan.name}
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
                          {formatINR(plan.accountSize)}
                        </div>

                        <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.accent }}>
                            {formatINR(plan.challengeFee)}
                          </div>
                          <div style={{ fontSize: '12px', color: colors.text2, marginTop: '4px' }}>
                            + 18% GST ({formatINR(plan.challengeFee * 0.18)})
                          </div>
                          <div style={{ fontSize: '13px', color: 'white', marginTop: '4px', fontWeight: 600 }}>
                            = {formatINR(plan.challengeFee * 1.18)} total
                          </div>
                          <div style={{ fontSize: '12px', color: colors.success, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ArrowLeft size={12} /> Fee refunded with first payout
                          </div>
                        </div>

                        {renderRules(selectedType)}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* RIGHT SIDE: ORDER SUMMARY */}
            <div style={{ 
              width: '100%', maxWidth: '340px', 
              backgroundColor: colors.surface, border: `1px solid ${colors.border}`, 
              borderRadius: '16px', padding: '28px',
              position: 'sticky', top: '100px'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>Order Summary</h2>
              
              {!selectedPlan ? (
                <div style={{ color: colors.text3, fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>
                  Please select a plan to view summary
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: colors.text2, fontSize: '14px' }}>
                    <span>{selectedPlan.name} Challenge</span>
                    <span>{formatINR(selectedPlan.challengeFee)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: colors.text2, fontSize: '14px' }}>
                    <span>GST (18%)</span>
                    <span>{formatINR(selectedPlan.challengeFee * 0.18)}</span>
                  </div>
                  
                  <div style={{ height: '1px', backgroundColor: colors.border, marginBottom: '20px' }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontWeight: 'bold' }}>
                    <span style={{ color: 'white', fontSize: '16px' }}>Total Amount</span>
                    <span style={{ color: colors.accent, fontSize: '20px' }}>{formatINR(selectedPlan.challengeFee * 1.18)}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', color: colors.text2, marginBottom: '32px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> Instant account activation</div>
                    <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> GST invoice included</div>
                    <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> Fee refunded with first payout</div>
                    <div style={{ display: 'flex', gap: '8px' }}><span>✓</span> 80% profit split</div>
                  </div>

                  {error && (
                    <div style={{ color: colors.danger, fontSize: '13px', marginBottom: '16px', textAlign: 'center', backgroundColor: 'rgba(239,68,68,0.1)', padding: '8px', borderRadius: '8px' }}>
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handlePayment}
                    disabled={paymentLoading}
                    style={{
                      width: '100%', height: '52px',
                      backgroundColor: colors.accent,
                      color: 'white', fontSize: '16px', fontWeight: 'bold',
                      border: 'none', borderRadius: '12px',
                      cursor: paymentLoading ? 'not-allowed' : 'pointer',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      transition: 'background-color 0.2s',
                      opacity: paymentLoading ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => { if(!paymentLoading) e.target.style.backgroundColor = colors.accent2 }}
                    onMouseLeave={(e) => { if(!paymentLoading) e.target.style.backgroundColor = colors.accent }}
                  >
                    {paymentLoading ? 'Creating order...' : `Pay ${formatINR(selectedPlan.challengeFee * 1.18)} →`}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px', fontSize: '11px', color: colors.text2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={12} /> Razorpay Secured</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={12} /> 256-bit SSL</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

export default BuyChallengePage
