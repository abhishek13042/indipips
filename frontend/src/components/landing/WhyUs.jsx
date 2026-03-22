import { Zap, CreditCard, Landmark, FileText, TrendingUp } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const colors = {
  bg: '#0A0F1E', card: '#111827', border: '#1F2937', accent: '#10B981',
  gold: '#F59E0B', success: '#10B981', text: '#F9FAFB', muted: '#6B7280'
}

export default function WhyUs() {
  const [ref, isVisible] = useScrollReveal()
  const features = [
    { icon: "🇮🇳", title: "100% Indian Platform", desc: "Trade Nifty, BankNifty & all F&O. Pay and get paid in ₹. No forex conversion fees ever." },
    { icon: Zap, title: "Algo Trading Allowed", desc: "Run your trading bots freely. Zero restrictions on automated strategies. Full API support." },
    { icon: CreditCard, title: "UPI & Net Banking", desc: "Pay challenge fees instantly via UPI, Net Banking, or Debit/Credit card. Account activated immediately." },
    { icon: Landmark, title: "Direct Bank Payouts", desc: "Get paid via NEFT/IMPS straight to your bank. No Wise, no Payoneer, no crypto. Pure rupees." },
    { icon: FileText, title: "GST Invoice Included", desc: "Every purchase comes with a proper GST tax invoice. Perfect for your business expense records." },
    { icon: TrendingUp, title: "80% Profit Split", desc: "Keep 80% of everything you earn. Proven traders can scale up to 90% split over time." }
  ]

  const comparison = [
    { label: "Indian Instruments", indi: "✅ Yes", f: "❌ No", n: "❌ No" },
    { label: "INR Currency", indi: "✅ Yes", f: "❌ No", n: "❌ No" },
    { label: "UPI Payment", indi: "✅ Yes", f: "❌ No", n: "❌ No" },
    { label: "Bank Payout", indi: "✅ Yes", f: "❌ No", n: "❌ No" },
    { label: "Algo Trading", indi: "✅ Full", f: "⚠️ Limited", n: "⚠️ Limited" },
    { label: "Entry Price", indi: "✅ ₹999", f: "❌ ₹8,000", n: "❌ ₹2,700" },
    { label: "IST Support", indi: "✅ Yes", f: "❌ No", n: "❌ No" }
  ]

  const revealStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
  }

  return (
    <section ref={ref} style={{ padding: '96px 24px', background: colors.bg }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', ...revealStyle }}>
        
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ color: colors.gold, fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '16px' }}>Why Indipips</span>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 'bold', color: colors.text, marginBottom: '16px' }}>Built for Indian Traders</h2>
          <p style={{ color: colors.muted, fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Everything global platforms get wrong — we got right.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '96px' }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: colors.card, border: `1px solid ${colors.border}`, padding: '32px',
              borderRadius: '24px', transition: 'border-color 0.3s, transform 0.3s',
              ...revealStyle, transitionDelay: `${i * 0.1}s`
            }} onMouseEnter={(e) => {
                 e.currentTarget.style.borderColor = colors.accent
                 e.currentTarget.style.transform = 'translateY(-5px)'
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.borderColor = colors.border
                 e.currentTarget.style.transform = 'translateY(0)'
               }}>
              <div style={{
                width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', marginBottom: '24px', background: colors.bg, borderRadius: '12px', border: `1px solid ${colors.border}`
              }}>
                {typeof f.icon === 'string' ? f.icon : <f.icon size={24} color={colors.accent} />}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.text, marginBottom: '12px' }}>{f.title}</h3>
              <p style={{ color: colors.muted, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div>
          <h3 style={{ fontSize: '30px', fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: '48px' }}>How We Compare</h3>
          <div style={{ overflowX: 'auto', borderRadius: '24px', border: `1px solid ${colors.border}` }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: colors.card }}>
                  <th style={{ padding: '24px', color: colors.muted, fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Feature</th>
                  <th style={{ padding: '24px', color: colors.text, fontWeight: 'bold', fontSize: '18px', background: `${colors.accent}1A`, borderLeft: `1px solid ${colors.accent}33`, borderRight: `1px solid ${colors.accent}33` }}>Indipips</th>
                  <th style={{ padding: '24px', color: colors.muted, fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>FTMO</th>
                  <th style={{ padding: '24px', color: colors.muted, fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>FundedNext</th>
                </tr>
              </thead>
              <tbody style={{ background: `${colors.card}80` }}>
                {comparison.map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${colors.border}` }}>
                    <td style={{ padding: '24px', color: colors.text, fontWeight: 500 }}>{row.label}</td>
                    <td style={{ padding: '24px', color: colors.success, fontWeight: 'bold', background: `${colors.accent}0D`, borderLeft: `1px solid ${colors.accent}1A`, borderRight: `1px solid ${colors.accent}1A` }}>{row.indi}</td>
                    <td style={{ padding: '24px', color: colors.muted }}>{row.f}</td>
                    <td style={{ padding: '24px', color: colors.muted }}>{row.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
