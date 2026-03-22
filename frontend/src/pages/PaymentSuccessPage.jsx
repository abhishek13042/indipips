import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const colors = {
  bg: '#060B14',
  surface: '#0D1420',
  surface2: '#131D2E',
  border: '#1E2D40',
  accent: '#2563EB',
  success: '#10B981',
  text: '#F1F5F9',
  text2: '#94A3B8',
  text3: '#475569'
}

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)

  const planName = searchParams.get('plan') || 'Challenge'

  useEffect(() => {
    // Inject successPulse keyframes safely
    const styleId = 'success-pulse-animation'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.innerHTML = `
        @keyframes successPulse {
          0% { transform: scale(0.8); opacity:0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity:1; }
        }
      `
      document.head.appendChild(style)
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  const todayStr = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 45)
  const expiryStr = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(expiryDate)

  return (
    <div style={{
      backgroundColor: colors.bg,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.success}`,
        borderRadius: '20px',
        padding: '60px 48px',
        maxWidth: '520px',
        width: '100%',
        boxShadow: `0 0 40px rgba(16,185,129,0.15)`,
        textAlign: 'center'
      }}>
        
        {/* Success Animation */}
        <div style={{
          width: '80px', height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16,185,129,0.15)',
          border: `2px solid ${colors.success}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px auto',
          fontSize: '40px', color: colors.success,
          animation: 'successPulse 0.5s ease forwards'
        }}>
          ✓
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: colors.success, marginBottom: '12px' }}>
          Payment Successful!
        </h1>
        <p style={{ fontSize: '16px', color: colors.text2, marginBottom: '32px' }}>
          Your {planName} challenge has been activated!
        </p>

        {/* Challenge Details Box */}
        <div style={{
          backgroundColor: colors.surface2,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: colors.text2 }}>Challenge Type</span>
            <span style={{ color: 'white', fontWeight: 600 }}>{planName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
             <span style={{ color: colors.text2 }}>Status</span>
             <span style={{ color: colors.success, fontWeight: 600 }}>Active ✓</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
             <span style={{ color: colors.text2 }}>Started</span>
             <span style={{ color: 'white', fontWeight: 600 }}>{todayStr}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
             <span style={{ color: colors.text2 }}>Expires</span>
             <span style={{ color: 'white', fontWeight: 600 }}>{expiryStr}</span>
          </div>
        </div>

        {/* Next Steps List */}
        <div style={{ textAlign: 'left', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>What's next?</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(37,99,235,0.15)', color: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>1</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>Connect your broker</div>
                <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '8px' }}>Link your Upstox or Zerodha account to sync trades</div>
                <button onClick={() => navigate('/broker')} style={{ backgroundColor: 'transparent', border: `1px solid ${colors.border}`, color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Connect Broker →</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(37,99,235,0.15)', color: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>2</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>Complete KYC</div>
                <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '8px' }}>Verify your identity for future payouts</div>
                <button onClick={() => navigate('/kyc')} style={{ backgroundColor: 'transparent', border: `1px solid ${colors.border}`, color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Complete KYC →</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(37,99,235,0.15)', color: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>3</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>Start trading</div>
                <div style={{ fontSize: '12px', color: colors.text2 }}>Begin trading during market hours 9:15 AM - 3:30 PM IST</div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{ width: '100%', padding: '16px', backgroundColor: colors.accent, color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' }}
        >
          Go to Dashboard →
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <span onClick={() => navigate('/challenges')} style={{ color: colors.text2, fontSize: '14px', cursor: 'pointer' }}>View challenge details</span>
        </div>

        <div style={{ marginTop: '24px', fontSize: '12px', color: colors.text3 }}>
          Redirecting to dashboard in {countdown}s...
        </div>

      </div>
    </div>
  )
}

export default PaymentSuccessPage
