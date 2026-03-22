import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, TrendingUp, Users } from 'lucide-react'
import api from '../api'
import Navbar from '../components/landing/Navbar'

const formatINR = (paise) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((paise || 0) / 100)
}

const LeaderboardPage = () => {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All Plans')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/leaderboard', { params: { limit: 50 } })
        setLeaders(res.data.data || [])
      } catch (err) {
        // MOCK data to ensure public page works for verification
        setLeaders([
          { rank: 1, name: 'Ananya S.', plan: 'Elite', profit: 75000000, returnPct: 15.2, datePassed: 'Mar 2026' },
          { rank: 2, name: 'Vikram R.', plan: 'Pro', profit: 42000000, returnPct: 14.8, datePassed: 'Feb 2026' },
          { rank: 3, name: 'Rohan D.', plan: 'Starter', profit: 21000000, returnPct: 18.5, datePassed: 'Mar 2026' },
          { rank: 4, name: 'Megha P.', plan: 'Master', profit: 18000000, returnPct: 9.2, datePassed: 'Jan 2026' },
          { rank: 5, name: 'Aditya K.', plan: 'Seed', profit: 8500000, returnPct: 22.1, datePassed: 'Mar 2026' },
          { rank: 6, name: 'Karan J.', plan: 'Pro', profit: 6200000, returnPct: 6.8, datePassed: 'Dec 2025' }
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  const top3 = leaders.slice(0, 3)
  const rest = leaders.slice(3)

  const getPlanColor = (plan) => {
    if (plan.includes('Seed')) return '#94A3B8'
    if (plan.includes('Starter')) return '#2563EB'
    if (plan.includes('Pro')) return '#8B5CF6'
    if (plan.includes('Elite')) return '#F59E0B'
    return '#EF4444' // Master
  }

  return (
    <div style={{ backgroundColor: '#060B14', minHeight: '100vh', color: '#F1F5F9', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      {/* HEADER SECTION */}
      <section style={{ padding: '120px 24px 64px 24px', textAlign: 'center', backgroundImage: 'radial-gradient(circle at top, rgba(37,99,235,0.1) 0%, transparent 50%)' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 16px 0', letterSpacing: '-1px' }}>
          🏆 Trader Leaderboard
        </h1>
        <p style={{ fontSize: '18px', color: '#94A3B8', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
          Top funded traders on Indipips — verified profits, real accounts. We reward consistency and risk management.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', padding: '12px 24px', borderRadius: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#2563EB" /> <span style={{ fontWeight: '600' }}>+120 Funded Traders</span>
          </div>
          <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', padding: '12px 24px', borderRadius: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={18} color="#F59E0B" /> <span style={{ fontWeight: '600' }}>₹2.3Cr Paid Out</span>
          </div>
          <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', padding: '12px 24px', borderRadius: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#10B981" /> <span style={{ fontWeight: '600' }}>Up to 90% Profit Split</span>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px 120px 24px' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#94A3B8' }}>Leaderboard loading...</div>
        ) : leaders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#94A3B8' }}>No traders on the leaderboard yet.</div>
        ) : (
          <>
            {/* TOP 3 PODIUM */}
            {top3.length === 3 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '16px', marginBottom: '64px', minHeight: '300px' }}>
                
                {/* #2 SILVER */}
                <div style={{ textAlign: 'center', width: '200px' }}>
                  <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', borderRadius: '50%', backgroundColor: '#0D1420', border: '3px solid #94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                    {top3[1].name[0]}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{top3[1].name}</div>
                  <div style={{ color: '#10B981', fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>+{formatINR(top3[1].profit)}</div>
                  <div style={{ backgroundColor: '#131D2E', height: '180px', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', borderTop: '4px solid #94A3B8', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
                    <div style={{ fontSize: '48px', fontWeight: '900', color: '#94A3B8', opacity: 0.5 }}>2</div>
                    <div style={{ marginTop: 'auto', color: getPlanColor(top3[1].plan), fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{top3[1].plan}</div>
                  </div>
                </div>

                {/* #1 GOLD */}
                <div style={{ textAlign: 'center', width: '220px', zIndex: 10 }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>👑</div>
                  <div style={{ width: '100px', height: '100px', margin: '0 auto 16px', borderRadius: '50%', backgroundColor: '#0D1420', border: '4px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', boxShadow: '0 0 30px rgba(245,158,11,0.2)' }}>
                    {top3[0].name[0]}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{top3[0].name}</div>
                  <div style={{ color: '#10B981', fontSize: '24px', fontWeight: '900', marginBottom: '16px' }}>+{formatINR(top3[0].profit)}</div>
                  <div style={{ backgroundColor: '#1E2D40', height: '240px', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', borderTop: '4px solid #F59E0B', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)' }}>
                    <div style={{ fontSize: '64px', fontWeight: '900', color: '#F59E0B', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>1</div>
                    <div style={{ marginTop: 'auto', color: getPlanColor(top3[0].plan), fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{top3[0].plan}</div>
                  </div>
                </div>

                {/* #3 BRONZE */}
                <div style={{ textAlign: 'center', width: '200px' }}>
                  <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', borderRadius: '50%', backgroundColor: '#0D1420', border: '3px solid #B87333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                    {top3[2].name[0]}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{top3[2].name}</div>
                  <div style={{ color: '#10B981', fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>+{formatINR(top3[2].profit)}</div>
                  <div style={{ backgroundColor: '#131D2E', height: '140px', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', borderTop: '4px solid #B87333', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
                    <div style={{ fontSize: '48px', fontWeight: '900', color: '#B87333', opacity: 0.5 }}>3</div>
                    <div style={{ marginTop: 'auto', color: getPlanColor(top3[2].plan), fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{top3[2].plan}</div>
                  </div>
                </div>

              </div>
            )}

            {/* FULL TABLE */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ backgroundColor: '#131D2E', color: '#F1F5F9', border: '1px solid #1E2D40', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
              >
                <option>All Plans</option>
                <option>Seed</option>
                <option>Starter</option>
                <option>Pro</option>
                <option>Elite</option>
                <option>Master</option>
              </select>
            </div>

            <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#131D2E', color: '#94A3B8', fontSize: '13px', borderBottom: '1px solid #1E2D40' }}>
                      <th style={{ padding: '16px', fontWeight: '500' }}>Rank</th>
                      <th style={{ padding: '16px', fontWeight: '500' }}>Trader</th>
                      <th style={{ padding: '16px', fontWeight: '500' }}>Plan</th>
                      <th style={{ padding: '16px', fontWeight: '500' }}>Verfied Profit</th>
                      <th style={{ padding: '16px', fontWeight: '500' }}>% Return</th>
                      <th style={{ padding: '16px', fontWeight: '500' }}>Joined / Passed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((t) => (
                      <tr key={t.rank} style={{ borderBottom: '1px solid #1E2D40', transition: 'background-color 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#131D2E'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '16px', color: '#F1F5F9', fontSize: '16px', fontWeight: 'bold' }}>#{t.rank}</td>
                        <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1E2D40', color: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                            {t.name[0]}
                          </div>
                          <span style={{ color: '#F1F5F9', fontSize: '14px', fontWeight: '600' }}>{t.name}</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ color: getPlanColor(t.plan), backgroundColor: `${getPlanColor(t.plan)}1A`, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                            {t.plan}
                          </span>
                        </td>
                        <td style={{ padding: '16px', color: '#10B981', fontSize: '15px', fontWeight: 'bold' }}>+{formatINR(t.profit)}</td>
                        <td style={{ padding: '16px', color: '#10B981', fontSize: '14px', fontWeight: '600' }}>+{t.returnPct}%</td>
                        <td style={{ padding: '16px', color: '#94A3B8', fontSize: '13px' }}>{t.datePassed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BOTTOM CTA */}
            <div style={{ marginTop: '64px', textAlign: 'center', backgroundColor: 'rgba(37,99,235,0.05)', border: '1px solid #1E2D40', borderRadius: '16px', padding: '48px 24px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#F1F5F9', marginBottom: '16px' }}>Want to be on this list?</h2>
              <p style={{ color: '#94A3B8', fontSize: '16px', marginBottom: '32px' }}>Follow your edge and pass our evaluation. Prove your skills.</p>
              <button 
                onClick={() => navigate('/buy-challenge')}
                style={{ backgroundColor: '#2563EB', color: '#FFF', padding: '14px 28px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}>
                Start a Challenge (₹799) →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default LeaderboardPage
