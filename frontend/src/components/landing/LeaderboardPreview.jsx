import { useState, useEffect } from 'react'
import { Trophy, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const colors = {
  bg: '#0A0F1E', card: '#111827', border: '#1F2937', accent: '#10B981',
  gold: '#F59E0B', success: '#10B981', text: '#F9FAFB', muted: '#6B7280'
}

const formatINR = (paise) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(paise / 100)
}

export default function LeaderboardPreview() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const navigate = useNavigate()
  const [ref, isVisible] = useScrollReveal()

  useEffect(() => {
    api.get('/leaderboard?limit=5')
      .then(res => {
        if (res.data.success && res.data.data && Array.isArray(res.data.data.leaderboard)) {
          setLeaders(res.data.data.leaderboard)
        } else {
          setError(true)
        }
      })
      .catch(err => {
        console.error('Failed to fetch leaderboard', err)
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [])

  if (error) return null

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={20} color={colors.gold} />
    if (rank === 2) return <Trophy size={20} color="#94A3B8" />
    if (rank === 3) return <Trophy size={20} color="#B45309" />
    return <span style={{ color: colors.muted, fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{rank}</span>
  }

  const getPlanBadge = (plan) => {
    const p = plan?.toLowerCase() || ''
    const style = { padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }
    if (p.includes('seed')) return <span style={{ ...style, background: '#6B72801A', color: '#9CA3AF' }}>Seed</span>
    if (p.includes('starter')) return <span style={{ ...style, background: `${colors.accent}1A`, color: colors.accent }}>Starter</span>
    if (p.includes('pro')) return <span style={{ ...style, background: '#8B5CF61A', color: '#A78BFA' }}>Pro</span>
    if (p.includes('elite')) return <span style={{ ...style, background: `${colors.gold}1A`, color: colors.gold }}>Elite</span>
    if (p.includes('master')) return <span style={{ ...style, background: '#EF44441A', color: '#F87171' }}>Master</span>
    return <span style={{ ...style, background: '#6B72801A', color: '#9CA3AF' }}>Challenge</span>
  }

  const revealStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
  }

  return (
    <section ref={ref} style={{ padding: '96px 24px', background: colors.bg }}>
      <div style={{ maxWidth: '896px', margin: '0 auto', ...revealStyle }}>
        
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ color: colors.gold, fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '16px' }}>Leaderboard</span>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: colors.text, marginBottom: '16px' }}>Top Funded Traders</h2>
          <p style={{ color: colors.muted, fontSize: '18px' }}>Real traders. Real profits. Verified by Indipips.</p>
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th style={{ padding: '16px 24px', color: colors.muted, fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Rank</th>
                  <th style={{ padding: '16px 24px', color: colors.muted, fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Trader</th>
                  <th style={{ padding: '16px 24px', color: colors.muted, fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Plan</th>
                  <th style={{ padding: '16px 24px', color: colors.muted, fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Profit</th>
                </tr>
              </thead>
              <tbody style={{ WebkitBoxDirection: 'normal' }}>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                      <td style={{ padding: '20px 24px' }}><div style={{ width: '32px', height: '32px', background: colors.border, borderRadius: '4px' }} /></td>
                      <td style={{ padding: '20px 24px' }}><div style={{ width: '96px', height: '16px', background: colors.border, borderRadius: '4px' }} /></td>
                      <td style={{ padding: '20px 24px' }}><div style={{ width: '64px', height: '16px', background: colors.border, borderRadius: '4px' }} /></td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}><div style={{ width: '80px', height: '16px', background: colors.border, borderRadius: '4px', marginLeft: 'auto' }} /></td>
                    </tr>
                  ))
                ) : (
                  leaders.map((leader, index) => (
                    <tr key={index} style={{ borderTop: index > 0 ? `1px solid ${colors.border}` : 'none', transition: 'background-color 0.2s', ...revealStyle, transitionDelay: `${index * 0.1}s` }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '20px 24px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: colors.bg, border: `1px solid ${colors.border}` }}>
                          {getRankIcon(leader.rank)}
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${colors.accent}33`, border: `1px solid ${colors.accent}4D`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.accent, fontSize: '12px', fontWeight: 'bold' }}>
                            {leader?.name?.charAt(0) || '?'}
                          </div>
                          <span style={{ color: 'white', fontWeight: 500 }}>{leader?.name || 'Trader'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', whiteSpace: 'nowrap' }}>
                        {getPlanBadge(leader.plan)}
                      </td>
                      <td style={{ padding: '20px 24px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ color: colors.success, fontWeight: 'bold' }}>{formatINR(leader.profit)}</span>
                          <span style={{ color: `${colors.success}99`, fontSize: '10px', fontWeight: 500 }}>+{leader.pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '16px', background: `${colors.bg}4D`, textAlign: 'center', borderTop: `1px solid ${colors.border}` }}>
            <button onClick={() => navigate('/leaderboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: colors.accent, fontWeight: 'bold', fontSize: '14px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              View Full Leaderboard <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
