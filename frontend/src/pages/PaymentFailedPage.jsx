import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const colors = {
  bg: '#060B14',
  surface: '#0D1420',
  border: '#1E2D40',
  accent: '#2563EB',
  success: '#10B981',
  danger: '#EF4444',
  text: '#F1F5F9',
  text2: '#94A3B8',
  text3: '#475569'
}

const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const reason = searchParams.get('reason') || 'Payment was not completed'

  useEffect(() => {
    // Inject failPulse keyframes safely
    const styleId = 'fail-pulse-animation'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.innerHTML = `
        @keyframes failPulse {
          0% { transform: scale(0.8); opacity:0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity:1; }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

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
        border: `1px solid ${colors.danger}`,
        borderRadius: '20px',
        padding: '60px 48px',
        maxWidth: '520px',
        width: '100%',
        boxShadow: `0 0 40px rgba(239,68,68,0.1)`,
        textAlign: 'center'
      }}>
        
        {/* Fail Animation */}
        <div style={{
          width: '80px', height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239,68,68,0.1)',
          border: `2px solid ${colors.danger}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px auto',
          fontSize: '40px', color: colors.danger,
          animation: 'failPulse 0.5s ease forwards'
        }}>
          ✗
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: colors.danger, marginBottom: '12px' }}>
          Payment Failed
        </h1>
        <p style={{ fontSize: '16px', color: colors.success, marginBottom: '32px' }}>
          Don't worry — no money was deducted
        </p>

        {/* Reason Box */}
        <div style={{
          backgroundColor: 'rgba(239,68,68,0.08)',
          border: `1px solid rgba(239,68,68,0.2)`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '32px',
          color: colors.danger,
          fontSize: '14px',
          fontWeight: 500,
          textAlign: 'left'
        }}>
          Reason: <span style={{ fontWeight: 'normal' }}>{reason}</span>
        </div>

        {/* Common Reasons Section */}
        <div style={{ textAlign: 'left', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>Why payments fail:</h3>
          <ul style={{ color: colors.text2, fontSize: '13px', paddingLeft: '20px', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Insufficient bank balance</li>
            <li>Card blocked for online transactions</li>
            <li>UPI limit exceeded</li>
            <li>Bank server timeout</li>
            <li>Incorrect OTP entered</li>
          </ul>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={() => navigate('/buy-challenge')}
            style={{ width: '100%', padding: '16px', backgroundColor: colors.accent, color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Try Again →
          </button>
          
          <button
            onClick={() => window.location.href = 'mailto:support@indipips.com'}
            style={{ width: '100%', padding: '16px', backgroundColor: 'transparent', color: 'white', border: `1px solid ${colors.border}`, borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Contact Support
          </button>
        </div>

        <div style={{ marginTop: '24px', fontSize: '13px', color: colors.text3, lineHeight: '1.5' }}>
          If money was deducted, it will be refunded within 5-7 business days automatically.
        </div>

      </div>
    </div>
  )
}

export default PaymentFailedPage
