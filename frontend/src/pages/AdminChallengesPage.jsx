import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, RefreshCw } from 'lucide-react'
import api from '../api'
import AdminLayout from '../components/admin/AdminLayout'

const formatINR = (paise) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((paise || 0) / 100)
}

const AdminChallengesPage = () => {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  
  const [riskFilter, setRiskFilter] = useState('all') // 'all', 'safe', 'warning', 'danger'
  const navigate = useNavigate()

  const fetchChallenges = async () => {
    setRefreshing(true)
    try {
      const res = await api.get('/admin/challenges', {
        params: { status: 'ACTIVE', limit: 100 } // Load a larger set for live monitor
      })
      setChallenges(res.data.data || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching risk monitor:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchChallenges()
    const timer = setInterval(fetchChallenges, 60000) // Auto refresh every 60s
    return () => clearInterval(timer)
  }, [])

  // Process and sort challenges
  const processedChallenges = challenges.map(ch => {
    const pnl = Number(ch.currentBalance) - Number(ch.accountSize)
    const pnlPct = (pnl / Number(ch.accountSize)) * 100
    const drawdownPct = Math.max(0, ((Number(ch.peakBalance) - Number(ch.currentBalance)) / Number(ch.peakBalance)) * 100)
    const dailyStartingBalance = Number(ch.dailyStartingBalance) || Number(ch.accountSize)
    const dailyLossPct = Math.max(0, ((dailyStartingBalance - Number(ch.currentBalance)) / dailyStartingBalance) * 100)
    
    // Calculate Days Left (30 days logic)
    const start = new Date(ch.startDate)
    const end = new Date(start.getTime() + (30 * 24 * 60 * 60 * 1000))
    const diff = end - new Date()
    const daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))

    return { ...ch, pnl, pnlPct, drawdownPct, dailyLossPct, daysLeft }
  }).filter(ch => {
    if (riskFilter === 'safe') return ch.drawdownPct < 3
    if (riskFilter === 'warning') return ch.drawdownPct >= 3 && ch.drawdownPct <= 6
    if (riskFilter === 'danger') return ch.drawdownPct > 6
    return true
  }).sort((a, b) => b.drawdownPct - a.drawdownPct) // Default sort: highest drawdown first

  // Summary stats
  const activeCount = challenges.length
  const dangerCount = challenges.filter(c => ((Math.max(0, ((Number(c.peakBalance) - Number(c.currentBalance)) / Number(c.peakBalance)) * 100))) > 6).length
  const warningCount = challenges.filter(c => {
    const dd = ((Math.max(0, ((Number(c.peakBalance) - Number(c.currentBalance)) / Number(c.peakBalance)) * 100)))
    return dd >= 3 && dd <= 6
  }).length
  const safeCount = challenges.filter(c => ((Math.max(0, ((Number(c.peakBalance) - Number(c.currentBalance)) / Number(c.peakBalance)) * 100))) < 3).length

  return (
    <AdminLayout>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#F1F5F9', margin: 0 }}>Challenge Monitor</h1>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '4px 8px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 2s infinite' }} />
              LIVE
              <style>{`@keyframes pulse { 0% { opacity: 1; box-shadow: 0 0 0 0 rgba(16,185,129,0.7); } 70% { opacity: 0.5; box-shadow: 0 0 0 4px rgba(16,185,129,0); } 100% { opacity: 1; } }`}</style>
            </span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>Real-time risk monitoring (auto-refreshes every 60s)</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: '#475569' }}>
            Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
          </span>
          <button 
            onClick={fetchChallenges}
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#131D2E', color: '#F1F5F9', border: '1px solid #1E2D40', borderRadius: '8px', cursor: 'pointer', opacity: refreshing ? 0.7 : 1 }}
          >
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            Manual Refresh
          </button>
        </div>
      </div>

      {/* SUMMARY ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #2563EB' }}>
          <div style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '8px' }}>Total Active</div>
          <div style={{ color: '#F1F5F9', fontSize: '24px', fontWeight: 'bold' }}>{activeCount}</div>
        </div>
        <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #10B981' }}>
          <div style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '8px' }}>Safe (&lt;3% DD)</div>
          <div style={{ color: '#10B981', fontSize: '24px', fontWeight: 'bold' }}>{safeCount}</div>
        </div>
        <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '8px' }}>Warning (3-6% DD)</div>
          <div style={{ color: '#F59E0B', fontSize: '24px', fontWeight: 'bold' }}>{warningCount}</div>
        </div>
        <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #EF4444' }}>
          <div style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '8px' }}>Danger (&gt;6% DD)</div>
          <div style={{ color: '#EF4444', fontSize: '24px', fontWeight: 'bold' }}>{dangerCount}</div>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {['all', 'safe', 'warning', 'danger'].map(tab => (
          <button 
            key={tab}
            onClick={() => setRiskFilter(tab)}
            style={{
              padding: '8px 16px', border: '1px solid #1E2D40', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
              backgroundColor: riskFilter === tab ? '#1E2D40' : 'transparent',
              color: riskFilter === tab ? '#F1F5F9' : '#94A3B8',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'all' ? 'All Challenges' : 
             tab === 'safe' ? 'Safe (<3%)' : 
             tab === 'warning' ? 'Warning (3-6%)' : 'Danger (>6%)'}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', overflow: 'hidden', paddingBottom: '16px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead>
              <tr style={{ backgroundColor: '#131D2E', color: '#94A3B8', fontSize: '13px', borderBottom: '1px solid #1E2D40' }}>
                <th style={{ padding: '16px', fontWeight: '500' }}>Trader</th>
                <th style={{ padding: '16px', fontWeight: '500' }}>Account Size</th>
                <th style={{ padding: '16px', fontWeight: '500' }}>Current Balance</th>
                <th style={{ padding: '16px', fontWeight: '500' }}>Total P&L</th>
                <th style={{ padding: '16px', fontWeight: '500' }}>Drawdown</th>
                <th style={{ padding: '16px', fontWeight: '500' }}>Daily Loss</th>
                <th style={{ padding: '16px', fontWeight: '500' }}>Days Left</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ padding: '64px', textAlign: 'center', color: '#94A3B8' }}><Activity size={32} className="spinner" style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />Loading live data...</td></tr>
              ) : processedChallenges.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '64px', textAlign: 'center', color: '#94A3B8' }}>No challenges match this filter.</td></tr>
              ) : processedChallenges.map((ch) => {
                
                // Risk Color Logic (row level)
                let rowStyle = { borderBottom: '1px solid #1E2D40', transition: 'background-color 0.2s', cursor: 'pointer', backgroundColor: 'transparent' }
                let textClass = '#F1F5F9'
                
                if (ch.drawdownPct > 6) {
                  rowStyle.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                  rowStyle.border = '1px dashed #EF4444'
                  textClass = '#EF4444'
                } else if (ch.drawdownPct > 5) {
                  rowStyle.backgroundColor = 'rgba(245, 158, 11, 0.1)'
                  textClass = '#F59E0B'
                } else if (ch.drawdownPct > 3) {
                  rowStyle.borderLeft = '4px solid #F59E0B'
                }

                return (
                  <tr 
                    key={ch.id} 
                    style={rowStyle}
                    onClick={() => navigate(`/admin/traders/${ch.userId}`)}
                    onMouseOver={(e) => { if(ch.drawdownPct <= 5) e.currentTarget.style.backgroundColor = '#131D2E' }}
                    onMouseOut={(e) => { if(ch.drawdownPct <= 5) e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <td style={{ padding: '16px', color: textClass, fontWeight: '500', fontSize: '14px' }}>
                      {ch.user?.fullName}
                      <div style={{ fontSize: '12px', color: ch.drawdownPct > 5 ? textClass : '#94A3B8', marginTop: '4px', fontWeight: 'normal' }}>{ch.plan?.name}</div>
                    </td>
                    <td style={{ padding: '16px', color: ch.drawdownPct > 5 ? textClass : '#F1F5F9', fontSize: '14px' }}>{formatINR(ch.accountSize)}</td>
                    <td style={{ padding: '16px', color: ch.drawdownPct > 5 ? textClass : '#F1F5F9', fontSize: '14px', fontWeight: '500' }}>{formatINR(ch.currentBalance)}</td>
                    <td style={{ padding: '16px', color: ch.pnl >= 0 ? '#10B981' : '#EF4444', fontSize: '14px', fontWeight: '600' }}>
                      {ch.pnl >= 0 ? '+' : ''}{formatINR(ch.pnl)}
                    </td>
                    <td style={{ padding: '16px', color: ch.drawdownPct > 6 ? '#EF4444' : (ch.drawdownPct > 3 ? '#F59E0B' : '#10B981'), fontSize: '14px', fontWeight: 'bold' }}>
                      {ch.drawdownPct.toFixed(2)}%
                    </td>
                    <td style={{ padding: '16px', color: ch.dailyLossPct > 4 ? '#EF4444' : (ch.dailyLossPct > 2 ? '#F59E0B' : '#10B981'), fontSize: '14px', fontWeight: '500' }}>
                      {ch.dailyLossPct.toFixed(2)}%
                    </td>
                    <td style={{ padding: '16px', color: ch.daysLeft < 3 ? '#EF4444' : '#94A3B8', fontSize: '14px' }}>
                      {ch.daysLeft} days
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </AdminLayout>
  )
}

export default AdminChallengesPage
