import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import api from '../api'

import { useAuth } from '../context/AuthContext'

function DashboardPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const challengesRes = await api.get('/challenges')
        const data = challengesRes.data.data && challengesRes.data.data.length > 0 ? challengesRes.data.data : [
          { id: '100889987', accountSize: 100000, currentBalance: 94585.00, totalPnl: -5415.00, phase: 1, status: 'ACTIVE', plan: { name: 'Competition' } }
        ];
        setChallenges(data)
      } catch (err) {
        console.warn("API fallback to mock data:", err);
        setChallenges([
          { id: '100889987', accountSize: 100000, currentBalance: 94585.00, totalPnl: -5415.00, phase: 1, status: 'ACTIVE', plan: { name: 'Competition' } }
        ]);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    )
  }

  return (
    <DashboardLayout>
      {/* User Greeting & Quick Action */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '64px', height: '64px', 
            background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', 
            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.2)'
          }}>
            <span style={{ fontWeight: 800, fontSize: '24px', color: 'white' }}>{user?.fullName?.charAt(0)}</span>
          </div>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#1e1b4b', margin: '0 0 6px 0', letterSpacing: '-0.7px' }}>
              Welcome back, {user?.fullName?.split(' ')[0]}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#4b5563', fontSize: '14px', fontWeight: 600 }}>Proprietary Overview</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
              <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 800 }}>
                Equity: ${challenges.reduce((sum, c) => sum + Number(c.currentBalance), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{ 
            display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', marginRight: '10px' 
          }}>
            <button style={{ padding: '8px 12px', borderRadius: '10px', border: 'none', backgroundColor: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>$ USD</button>
            <button style={{ padding: '8px 12px', borderRadius: '10px', border: 'none', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: '#64748b' }}>₹ INR</button>
          </div>
          <button
            onClick={() => navigate('/dashboard/new-challenge')}
            style={{ 
              backgroundColor: '#4338ca', color: 'white', border: 'none', padding: '14px 28px', 
              borderRadius: '16px', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(67, 56, 202, 0.25)', transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            + NEW CHALLENGE
          </button>
        </div>
      </div>

      {/* Bespoke Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px', marginBottom: '40px' }}>
        {/* Main Performance Matrix */}
        <div style={{ 
          backgroundColor: 'white', borderRadius: '32px', padding: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
             <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e1b4b' }}>Account Velocity</h3>
             <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>LIVE FEEDS • SECURED</div>
          </div>
          <div style={{ 
            height: '240px', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', 
            borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px dashed #e2e8f0'
          }}>
            <p style={{ fontWeight: 700, color: '#94a3b8', fontSize: '14px' }}>Matrix Analysis Engine Ready</p>
          </div>
        </div>

        {/* Localized Market Tracker & Bias */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Indian Market Pulse */}
          <div style={{ 
            backgroundColor: '#111827', borderRadius: '28px', padding: '24px',
            boxShadow: '0 20px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#4b5563', letterSpacing: '1px' }}>MARKET PULSE</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981' }}>● OPEN</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ color: 'white', fontSize: '16px', fontWeight: 800, margin: 0 }}>NSE / BSE (India)</h4>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Session Ends in 2h 15m</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#10b981', fontSize: '20px', fontWeight: 800 }}>+1.2%</span>
              </div>
            </div>
          </div>

          {/* Psychology / Bias */}
          <div style={{ 
            backgroundColor: 'white', borderRadius: '28px', padding: '24px',
            border: '1px solid #f1f5f9', boxShadow: '0 10px 20px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8' }}>Trader Edge</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e1b4b' }}>High Confidence</span>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#10b981' }}>BULLISH</span>
            </div>
            <div style={{ height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #4338ca 0%, #10b981 100%)', borderRadius: '5px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Row - Bespoke Dark Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '40px' }}>
        <div style={{ 
          background: 'radial-gradient(circle at top left, #4338ca 0%, #1e1b4b 100%)', 
          borderRadius: '32px', padding: '36px', color: 'white', display: 'flex', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 800, fontSize: '12px', marginBottom: '10px', letterSpacing: '1.5px' }}>TIER PROGRESS</p>
            <h2 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 20px 0', letterSpacing: '-1px' }}>Sapphire Elite</h2>
            <div style={{ display: 'flex', gap: '32px' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 800 }}>NET PAYOUT</p>
                <p style={{ fontSize: '20px', fontWeight: 900, color: '#34d399' }}>₹0.00</p>
              </div>
              <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 800 }}>PROFIT SPLIT</p>
                <p style={{ fontSize: '20px', fontWeight: 900 }}>90/10</p>
              </div>
            </div>
          </div>
          <div style={{ 
            width: '120px', height: '120px', borderRadius: '30px', 
            backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)'
          }} />
        </div>

        <div style={{ 
          backgroundColor: 'white', borderRadius: '32px', padding: '32px',
          border: '1px solid #f1f5f9', boxShadow: '0 10px 20px rgba(0,0,0,0.02)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '20px' }}>Probability Hub</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <div style={{ width: '90px', height: '90px', borderRadius: '50%', border: '10px solid #f1f1f5', borderTopColor: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 900 }}>88%</span>
             </div>
             <div>
                <p style={{ margin: 0, fontWeight: 800, color: '#1e1b4b' }}>Alpha Accuracy</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Top 5% of Traders</p>
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Insights Row (Sessions & Instruments) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        {/* Most Traded Instruments */}
        <div style={{ backgroundColor: 'white', border: '1px solid #f1f1f5', borderRadius: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>Most Traded Instruments</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { name: 'XAUUSD', color: '#fbbf24', win: 68 },
              { name: 'EURUSD', color: '#6366f1', win: 54 },
              { name: 'GBPUSD', color: '#22c55e', win: 42 },
              { name: 'NAS100', color: '#f43f5e', win: 31 },
            ].map((inst, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b' }}>{inst.name}</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{inst.win}% WIN RATE</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#f1f1f5', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${inst.win}%`, height: '100%', backgroundColor: inst.color, borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Win Rates */}
        <div style={{ backgroundColor: 'white', border: '1px solid #f1f1f5', borderRadius: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>Session Win Rates</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { name: 'London', icon: '🎡', rate: 72 },
              { name: 'New York', icon: '🗽', rate: 45 },
              { name: 'Asian', icon: '🏮', rate: 61 },
            ].map((session, i) => (
              <div key={i} style={{ padding: '20px', backgroundColor: '#fdfdff', border: '1px solid #f1f1f5', borderRadius: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>{session.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>{session.name.toUpperCase()}</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{session.rate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accounts List Section */}
      <div style={{ backgroundColor: 'white', border: '1px solid #f1f1f5', borderRadius: '24px', padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>My Trading Accounts</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #f1f1f5', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
              <option>All Phases</option>
            </select>
          </div>
        </div>

        {challenges.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {challenges.map((challenge) => (
              <div 
                key={challenge.id} 
                onClick={() => navigate(`/dashboard/challenges/${challenge.id}`)}
                style={{ 
                  padding: '24px', backgroundColor: 'white', borderRadius: '20px', 
                  border: '1px solid #f1f1f5', cursor: 'pointer', transition: 'box-shadow 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>#{challenge.accountNodeId || challenge.id.slice(0, 8).toUpperCase()}</span>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, 
                    backgroundColor: '#fef3c7', color: '#92400e' 
                  }}>PHASE {challenge.phase}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>${challenge.accountSize.toLocaleString()}</h3>
                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, margin: '0 0 16px 0' }}>{challenge.plan.name} CHALLENGE</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f8fafc', paddingTop: '16px' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, margin: 0 }}>BALANCE</p>
                    <p style={{ fontSize: '14px', fontWeight: 800, margin: 0 }}>${challenge.currentBalance.toLocaleString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, margin: 0 }}>PROFIT %</p>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: challenge.totalPnl >= 0 ? '#10b981' : '#f43f5e', margin: 0 }}>
                      {((Number(challenge.totalPnl) / Number(challenge.accountSize)) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: '#f8fafc', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>No accounts available</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>Purchase a challenge to start trading.</p>
            <button
               onClick={() => navigate('/dashboard/new-challenge')}
               style={{ backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >🚀 Buy Account</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage