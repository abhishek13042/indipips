import { Target, TrendingUp, Wallet, ArrowRight } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const colors = {
  bg: '#0A0F1E', card: '#111827', border: '#1F2937', accent: '#10B981',
  gold: '#F59E0B', success: '#10B981', text: '#F9FAFB', muted: '#6B7280'
}

export default function HowItWorks() {
  const [ref, isVisible] = useScrollReveal()
  const steps = [
    { number: "01", icon: Target, title: "Choose Your Challenge", desc: "Pick from 5 account sizes starting at just ₹999. Pay once, trade for 45 days on real Indian markets.", tag: "From ₹999", color: colors.accent },
    { number: "02", icon: TrendingUp, title: "Prove Your Skill", desc: "Hit 8% profit target while keeping daily loss under 4% and max drawdown under 8%. Algo trading allowed.", tag: "45 Days", color: colors.success },
    { number: "03", icon: Wallet, title: "Get Funded & Paid", desc: "Pass the challenge, get your funded account. Request payouts anytime and keep 80% of all profits you make.", tag: "80% Profit Split", color: colors.gold }
  ]

  const revealStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
  }

  return (
    <section id="how-it-works" ref={ref} style={{ padding: '96px 24px', background: colors.bg, position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10, ...revealStyle }}>
        
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ color: colors.gold, fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '16px' }}>
            Simple Process
          </span>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 'bold', color: colors.text, marginBottom: '16px' }}>
            How It Works
          </h2>
          <p style={{ color: colors.muted, fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            3 steps to get funded and start your professional trading career.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', position: 'relative' }}>
          <style dangerouslySetInnerHTML={{ __html: `
            .hiw-card { background: ${colors.card}; border: 1px solid ${colors.border}; padding: 32px; border-radius: 24px; position: relative; transition: border-color 0.3s, transform 0.3s; }
            .hiw-card:hover { border-color: ${colors.accent}80; transform: translateY(-5px); }
          `}} />

          {steps.map((step, i) => (
            <div key={i} className="hiw-card" style={{ ...revealStyle, transitionDelay: `${i * 0.15}s` }}>
              <div style={{
                fontSize: '48px', fontWeight: 'bold', position: 'absolute', top: '24px', right: '32px',
                background: `linear-gradient(to bottom, ${colors.accent}40, transparent)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                {step.number}
              </div>
              
              <div style={{
                width: '56px', height: '56px', background: colors.bg, border: `1px solid ${colors.border}`,
                borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px'
              }}>
                <step.icon size={28} color={step.color} />
              </div>

              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.text, marginBottom: '16px' }}>
                {step.title}
              </h3>
              <p style={{ color: colors.muted, lineHeight: 1.6, marginBottom: '32px' }}>
                {step.desc}
              </p>
              
              <div style={{
                display: 'inline-flex', padding: '4px 16px', borderRadius: '999px',
                background: colors.bg, border: `1px solid ${colors.border}`,
                fontSize: '14px', fontWeight: 600, color: colors.text
              }}>
                {step.tag}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '64px', textAlign: 'center' }}>
          <button onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })} style={{
            padding: '16px 32px', borderRadius: '12px', background: colors.accent,
            color: 'white', fontWeight: 'bold', fontSize: '18px', border: 'none', cursor: 'pointer',
            boxShadow: `0 8px 24px ${colors.accent}40`, transition: 'transform 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            Start for ₹999 →
          </button>
        </div>
      </div>
    </section>
  )
}
