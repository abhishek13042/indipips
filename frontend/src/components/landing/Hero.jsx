import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const colors = {
  bg: '#0A0F1E', card: '#111827', border: '#1F2937', accent: '#10B981',
  gold: '#F59E0B', success: '#10B981', text: '#F9FAFB', muted: '#6B7280'
}

export default function Hero() {
  const navigate = useNavigate()
  const token = localStorage.getItem('accessToken')
  const [ref, isVisible] = useScrollReveal()

  const handleStart = () => {
    navigate(token ? '/buy-challenge' : '/register')
  }

  const revealStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
  }

  return (
    <section style={{
      minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '120px 24px 80px', boxSizing: 'border-box', position: 'relative'
    }}>
      <div ref={ref} style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', textAlign: 'center', zIndex: 2, ...revealStyle }}>
        
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px',
          borderRadius: '999px', border: `1px solid ${colors.gold}50`, color: colors.gold,
          fontSize: '14px', fontWeight: 600, marginBottom: '32px'
        }}>
          <span>🇮🇳</span> Made for Indian Traders
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: 800, color: colors.text,
          lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1px'
        }}>
          India's First Prop Firm <br />
          <span style={{ color: colors.accent }}>for Indian Markets</span>
        </h1>

        <p style={{
          fontSize: 'clamp(18px, 4vw, 22px)', color: colors.muted, maxWidth: '700px',
          margin: '0 auto 48px', lineHeight: 1.6
        }}>
          Trade Nifty 50, BankNifty & F&O with virtual capital up to ₹20 Lakhs. 
          Prove your skill. Get funded. Keep 80%.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '64px' }}>
          <button onClick={handleStart} style={{
            padding: '16px 32px', borderRadius: '12px', background: colors.accent,
            color: 'white', fontSize: '18px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
            boxShadow: `0 8px 24px ${colors.accent}40`, transition: 'transform 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            Start Your Challenge →
          </button>
          <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} style={{
            padding: '16px 32px', borderRadius: '12px', background: 'transparent',
            color: colors.text, fontSize: '18px', fontWeight: 'bold', border: `2px solid ${colors.border}`, cursor: 'pointer', transition: 'background-color 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            See How It Works
          </button>
        </div>

        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', color: colors.muted }}>
          {["UPI Payments", "INR Payouts", "Algo Trading Allowed", "45 Day Challenge"].map((text, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={18} color={colors.success} />
              <span style={{ fontSize: '15px', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  )
}
