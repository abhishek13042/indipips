import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, TrendingUp, DollarSign, Clock, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import api from '../api'
import AdminLayout from '../components/admin/AdminLayout'

const formatINR = (paise) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(paise / 100)
}

const timeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff/60000)
  const hours = Math.floor(diff/3600000)
  const days = Math.floor(diff/86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return mins + 'm ago'
  if (hours < 24) return hours + 'h ago'
  if (days === 1) return 'Yesterday'
  if (days < 30) return days + 'd ago'
  return date.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
}

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState(null)
  const [challenges, setChallenges] = useState([])
  const [payouts, setPayouts] = useState([])
  const [activities, setActivities] = useState([])
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      setRefreshing(true)
      const [statsRes, challengesRes, payoutsRes, activityRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: { data: { traders: {}, challenges: {}, revenue: {}, risk: {} } } })),
        api.get('/admin/challenges?status=ACTIVE&limit=10').catch(() => ({ data: { data: [] } })),
        api.get('/admin/payouts?status=PENDING').catch(() => ({ data: { data: [] } })),
        api.get('/analytics/global').catch(() => ({ data: { data: [] } }))
      ])

      setStats(statsRes.data.data)
      setChallenges(challengesRes.data.data || [])
      setPayouts(payoutsRes.data.data || [])
      setActivities(activityRes.data.data || [])
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApprove = async (id) => {
    if (window.confirm('Approve this payout transfer?')) {
      try {
        await api.put(`/admin/payouts/${id}/approve`)
        fetchData()
      } catch (err) {
        alert('Failed to approve payout')
      }
    }
  }

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection:')
    if (reason) {
      try {
        await api.put(`/admin/payouts/${id}/reject`, { reason })
        fetchData()
      } catch (err) {
        alert('Failed to reject payout')
      }
    }
  }

  if (loading || !stats) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94A3B8' }}>
          <RefreshCw className="spinner" size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </AdminLayout>
    )
  }

  const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <AdminLayout>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#F1F5F9', margin: 0 }}>Admin Overview</h1>
          <p style={{ color: '#94A3B8', fontSize: '15px', marginTop: '4px' }}>{todayStr}</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '10px 16px', backgroundColor: '#131D2E', color: '#F1F5F9', 
            border: '1px solid #1E2D40', borderRadius: '8px', cursor: 'pointer',
            opacity: refreshing ? 0.7 : 1
          }}
        >
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ROW 1: KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Total Traders */}
        <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', padding: '24px', borderTop: '3px solid #2563EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <p style={{ color: '#94A3B8', fontSize: '14px', fontWeight: '500', margin: 0 }}>Total Traders</p>
            <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <Users size={20} color="#2563EB" />
            </div>
          </div>
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#F1F5F9', margin: '0 0 8px 0' }}>{stats.traders?.total || 0}</h3>
          <p style={{ fontSize: '13px', color: '#10B981', margin: 0, fontWeight: '500' }}>+{stats.traders?.newToday || 0} today</p>
        </div>

        {/* Active Challenges */}
        <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', padding: '24px', borderTop: '3px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <p style={{ color: '#94A3B8', fontSize: '14px', fontWeight: '500', margin: 0 }}>Active Challenges</p>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <TrendingUp size={20} color="#10B981" />
            </div>
          </div>
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#F1F5F9', margin: '0 0 8px 0' }}>{stats.challenges?.active || 0}</h3>
          <p style={{ fontSize: '13px', margin: 0 }}>
            <span style={{ color: '#10B981', fontWeight: '500' }}>{stats.challenges?.passedToday || 0} passed today</span>
            <span style={{ display: 'inline-block', margin: '0 8px', color: '#1E2D40' }}>|</span>
            <span style={{ color: '#EF4444', fontWeight: '500' }}>{stats.challenges?.failedToday || 0} failed today</span>
          </p>
        </div>

        {/* Revenue This Month */}
        <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', padding: '24px', borderTop: '3px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <p style={{ color: '#94A3B8', fontSize: '14px', fontWeight: '500', margin: 0 }}>Revenue This Month</p>
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <DollarSign size={20} color="#F59E0B" />
            </div>
          </div>
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#F1F5F9', margin: '0 0 8px 0' }}>{formatINR(stats.revenue?.thisMonth || 0)}</h3>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>{formatINR(stats.revenue?.today || 0)} today</p>
        </div>

        {/* Pending Payouts */}
        <div style={{ 
          backgroundColor: '#0D1420', 
          border: '1px solid #1E2D40', 
          borderRadius: '16px', padding: '24px', borderTop: '3px solid #EF4444',
          animation: stats.revenue?.pendingPayouts > 0 ? 'pulseBorder 2s infinite' : 'none'
        }}>
          <style>{`
            @keyframes pulseBorder {
              0% { border-color: #1E2D40; border-top-color: #EF4444; }
              50% { border-color: rgba(239, 68, 68, 0.5); border-top-color: #EF4444; }
              100% { border-color: #1E2D40; border-top-color: #EF4444; }
            }
          `}</style>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <p style={{ color: '#94A3B8', fontSize: '14px', fontWeight: '500', margin: 0 }}>Pending Payouts</p>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <Clock size={20} color="#EF4444" />
            </div>
          </div>
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: stats.revenue?.pendingPayouts > 0 ? '#EF4444' : '#F1F5F9', margin: '0 0 8px 0' }}>{stats.revenue?.pendingPayouts || 0}</h3>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>{stats.revenue?.pendingPayouts > 0 ? 'Requires approval' : 'All caught up'}</p>
        </div>

      </div>

      {/* ROW 2: REVENUE BREAKDOWN */}
      <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#F1F5F9', margin: '0 0 24px 0' }}>Revenue Overview</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', backgroundColor: '#1E2D40', borderRadius: '12px', overflow: 'hidden' }}>
          
          <div style={{ backgroundColor: '#131D2E', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '8px', margin: 0 }}>Today</p>
            <h3 style={{ color: '#F1F5F9', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{formatINR(stats.revenue?.today || 0)}</h3>
          </div>
          
          <div style={{ backgroundColor: '#131D2E', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '8px', margin: 0 }}>This Month</p>
            <h3 style={{ color: '#10B981', fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{formatINR(stats.revenue?.thisMonth || 0)}</h3>
          </div>
          
          <div style={{ backgroundColor: '#131D2E', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '8px', margin: 0 }}>This Year</p>
            <h3 style={{ color: '#F1F5F9', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{formatINR(stats.revenue?.thisYear || 0)}</h3>
          </div>

        </div>
      </div>

      {/* ROW 3: TWO COLUMNS (RISK & PAYOUTS) */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
        
        {/* LEFT COLUMN: RISK MONITOR TABLE */}
        <div style={{ flex: '3 1 600px', backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', padding: '24px', minWidth: 0 }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#F1F5F9', margin: '0 0 4px 0' }}>Active Challenge Risk Monitor</h2>
            <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>Real-time drawdown tracking</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1E2D40', color: '#94A3B8', fontSize: '13px', backgroundColor: 'transparent' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '500' }}>Trader</th>
                  <th style={{ padding: '12px 16px', fontWeight: '500' }}>Balance</th>
                  <th style={{ padding: '12px 16px', fontWeight: '500' }}>P&L</th>
                  <th style={{ padding: '12px 16px', fontWeight: '500' }}>Drawdown%</th>
                  <th style={{ padding: '12px 16px', fontWeight: '500' }}>Daily Loss%</th>
                  <th style={{ padding: '12px 16px', fontWeight: '500' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {challenges.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>No active challenges</td>
                  </tr>
                ) : challenges.map((ch) => {
                  const pnl = Number(ch.currentBalance) - Number(ch.accountSize)
                  const pnlPct = (pnl / Number(ch.accountSize)) * 100
                  const drawdownPct = Math.max(0, ((Number(ch.peakBalance) - Number(ch.currentBalance)) / Number(ch.peakBalance)) * 100)
                  const dailyLossPct = ((Number(ch.dailyStartingBalance || ch.accountSize) - Number(ch.currentBalance)) / Number(ch.dailyStartingBalance || ch.accountSize)) * 100

                  let ddColor = '#10B981' // < 3%
                  let rowBg = 'transparent'
                  let ddDot = '#10B981'
                  
                  if (drawdownPct > 7) {
                    ddColor = '#EF4444'; rowBg = 'rgba(239, 68, 68, 0.05)'; ddDot = '#EF4444'
                  } else if (drawdownPct > 5) {
                    ddColor = '#F97316'; ddDot = '#F97316'
                  } else if (drawdownPct > 3) {
                    ddColor = '#F59E0B'; ddDot = '#F59E0B'
                  }

                  let dlColor = dailyLossPct > 4 ? '#EF4444' : (dailyLossPct > 2 ? '#F59E0B' : '#10B981')

                  return (
                    <tr key={ch.id} style={{ borderBottom: '1px solid #1E2D40', backgroundColor: rowBg, cursor: 'pointer', transition: 'background-color 0.2s' }} onClick={() => navigate(`/admin/traders/${ch.userId}`)} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = rowBg === 'transparent' ? '#131D2E' : rowBg }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = rowBg }}>
                      <td style={{ padding: '16px', color: '#F1F5F9', fontWeight: '500', fontSize: '14px' }}>
                        {ch.user?.fullName?.substring(0, 15) || 'Unknown'}
                        <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>{ch.plan?.name}</div>
                      </td>
                      <td style={{ padding: '16px', color: '#F1F5F9', fontSize: '14px' }}>{formatINR(ch.currentBalance)}</td>
                      <td style={{ padding: '16px', color: pnl >= 0 ? '#10B981' : '#EF4444', fontSize: '14px', fontWeight: '500' }}>
                        {pnl >= 0 ? '+' : ''}{formatINR(pnl)}
                      </td>
                      <td style={{ padding: '16px', color: ddColor, fontSize: '14px', fontWeight: '600' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ddDot }} />
                          {drawdownPct.toFixed(2)}%
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: dlColor, fontSize: '14px', fontWeight: '500' }}>
                        {Math.max(0, dailyLossPct).toFixed(2)}%
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                          {ch.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: PAYOUTS QUEUE */}
        <div style={{ flex: '2 1 350px', backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', padding: '24px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#F1F5F9', margin: '0 0 4px 0' }}>Payout Queue</h2>
              <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>Requires your approval</p>
            </div>
            <Link to="/admin/payouts" style={{ color: '#2563EB', fontSize: '13px', textDecoration: 'none' }}>View All →</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {payouts.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', backgroundColor: '#131D2E', borderRadius: '12px' }}>
                <CheckCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                No pending payouts
              </div>
            ) : payouts.slice(0, 5).map((p) => (
              <div key={p.id} style={{ backgroundColor: '#131D2E', borderRadius: '12px', padding: '16px', border: '1px solid #1E2D40' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '500', color: '#F1F5F9', fontSize: '15px' }}>
                    {p.user?.fullName}
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px', fontWeight: 'normal' }}>{p.challenge?.plan?.name || 'Funded'}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>{timeAgo(p.requestedAt)}</div>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '18px', color: '#10B981', fontWeight: 'bold' }}>{formatINR(p.netPayoutAmount)}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>Net after 30% TDS</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {p.user?.kycStatus === 'VERIFIED' ? (
                    <span style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      <CheckCircle size={10} /> KYC ✓
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      <XCircle size={10} /> KYC ✗
                    </span>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleReject(p.id)}
                      style={{ padding: '6px 12px', backgroundColor: 'transparent', color: '#EF4444', border: '1px solid currentColor', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(p.id)}
                      style={{ padding: '6px 12px', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ROW 4: RECENT ACTIVITY */}
      <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#F1F5F9', margin: '0 0 20px 0' }}>Recent Platform Activity</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activities.length === 0 ? (
            <div style={{ padding: '24px', color: '#94A3B8', textAlign: 'center' }}>No recent activity</div>
          ) : activities.slice(0, 10).map((act, i) => {
            // Placeholder colors/icons based on type
            let color = '#2563EB'; let icon = <CheckCircle size={16} />
            if (act.type?.includes('FAIL') || act.type?.includes('BREACH')) { color = '#EF4444'; icon = <XCircle size={16} /> }
            if (act.type?.includes('PAYOUT')) { color = '#10B981'; icon = <DollarSign size={16} /> }
            if (act.type?.includes('NEW_TRADER') || act.type?.includes('REGISTER')) { color = '#F59E0B'; icon = <Users size={16} /> }
            if (act.type?.includes('WARNING')) { color = '#F59E0B'; icon = <AlertTriangle size={16} /> }

            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: `rgba(${color === '#10B981' ? '16,185,129' : color === '#EF4444' ? '239,68,68' : color === '#F59E0B' ? '245,158,11' : '37,99,235'}, 0.1)`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#F1F5F9', fontSize: '14px' }}>
                    {act.description || act.title || 'Platform Activity'} 
                    {act.userName && <span style={{ color: '#94A3B8' }}> — {act.userName}</span>}
                  </div>
                </div>
                <div style={{ color: '#94A3B8', fontSize: '13px' }}>
                  {timeAgo(act.createdAt)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </AdminLayout>
  )
}

export default AdminDashboardPage
