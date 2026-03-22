import { useEffect, useState } from 'react'
import api from '../../api'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const colors = {
  bg: '#0A0F1E', card: '#111827', border: '#1F2937', accent: '#10B981',
  gold: '#F59E0B', success: '#10B981', danger: '#EF4444', text: '#F9FAFB', muted: '#6B7280'
}

export default function StatsBar() {
  const [data, setData] = useState(null)
  const [ref, isVisible] = useScrollReveal()

  useEffect(() => {
    api.get('/analytics/global')
      .then(res => {
        if (res.data.success && res.data.data) {
          setData(res.data.data)
        }
      })
      .catch(() => { console.error("Stats API failed, using fallbacks") })
  }, [])

  const stats = [
    { label: 'Active Traders', suffix: '+', icon: '👥', color: colors.accent, key: 'totalTraders', fallback: 847 },
    { label: 'Total Payouts', prefix: '₹', suffix: 'Cr+', icon: '💰', color: colors.gold, key: 'totalPayouts', fallback: 23 },
    { label: 'Live Challenges', suffix: '', icon: '📈', color: colors.success, key: 'activeChallenges', fallback: 312 },
    { label: 'Funded Traders', suffix: '', icon: '🏆', color: '#8B5CF6', key: 'totalFunded', fallback: 47 }
  ]

  const revealStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
  }

  return (
    <div ref={ref} style={{ background: colors.card, padding: '64px 24px', borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px'
      }}>
        {stats.map((stat, i) => {
          const raw = data?.[stat.key] !== undefined ? data[stat.key] : stat.fallback
          let value = raw
          if (stat.key === 'totalPayouts' && raw > 1000000) {
            value = Math.floor(raw / 10000000)
          }

          return (
            <div key={stat.key} style={{
              textAlign: 'center', padding: '32px', borderRadius: '16px',
              background: colors.bg, border: `1px solid ${colors.border}`,
              borderTop: `4px solid ${stat.color}`, position: 'relative', overflow: 'hidden',
              ...revealStyle, transitionDelay: `${i * 0.1}s`
            }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{stat.icon}</div>
              <div style={{ fontSize: '40px', fontWeight: 900, color: colors.text, marginBottom: '8px' }}>
                {stat.prefix || ''}{value}{stat.suffix}
              </div>
              <div style={{ color: colors.muted, fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}