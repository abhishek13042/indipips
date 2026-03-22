import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, ChevronRight, Award } from 'lucide-react'
import api from '../api'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'

const formatINR = (paise) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((paise || 0) / 100)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
}

const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE': return '#2563EB' // blue
    case 'PASSED': return '#10B981' // green // actually green glow as well
    case 'FAILED': return '#EF4444' // red
    case 'EXPIRED': return '#475569' // gray
    case 'SUSPENDED': return '#F59E0B' // gold/warning
    default: return '#1E2D40'
  }
}

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await api.get('/challenges')
        setChallenges(res.data.data || [])
      } catch (err) {
        console.error('Failed to fetch challenges:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchChallenges()
  }, [])

  const filteredChallenges = filter === 'All' 
    ? challenges 
    : challenges.filter(c => c.status === filter)

  const counts = {
    All: challenges.length,
    ACTIVE: challenges.filter(c => c.status === 'ACTIVE').length,
    PASSED: challenges.filter(c => c.status === 'PASSED').length,
    FAILED: challenges.filter(c => c.status === 'FAILED').length,
    EXPIRED: challenges.filter(c => c.status === 'EXPIRED').length,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#060B14', color: '#F1F5F9' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />
        
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0' }}>My Challenges</h1>
            <button 
              onClick={() => navigate('/buy-challenge')}
              style={{ backgroundColor: '#2563EB', color: '#FFF', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
              Buy New Challenge
            </button>
          </div>

          {/* FILTER TABS */}
          <div style={{ display: 'flex', borderBottom: '1px solid #1E2D40', marginBottom: '24px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {['All', 'ACTIVE', 'PASSED', 'FAILED', 'EXPIRED'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '12px 24px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap',
                  color: filter === tab ? '#2563EB' : '#94A3B8',
                  borderBottom: filter === tab ? '2px solid #2563EB' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                {tab === 'All' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()} 
                <span style={{ marginLeft: '6px', fontSize: '12px', color: filter === tab ? '#2563EB' : '#475569' }}>({counts[tab]})</span>
              </button>
            ))}
          </div>

          {/* GRID */}
          {loading ? (
            <div style={{ color: '#94A3B8', textAlign: 'center', padding: '48px' }}>Loading challenges...</div>
          ) : challenges.length === 0 ? (
            <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(37,99,235,0.1)', color: '#2563EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Rocket size={32} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>No challenges yet</h2>
              <p style={{ color: '#94A3B8', marginBottom: '24px', fontSize: '15px' }}>Start your funded trading journey today.</p>
              <button 
                onClick={() => navigate('/buy-challenge')}
                style={{ backgroundColor: '#10B981', color: '#FFF', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}>
                Buy Your First Challenge →
              </button>
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div style={{ color: '#94A3B8', textAlign: 'center', padding: '48px' }}>No challenges match this status.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
              {filteredChallenges.map(ch => {
                const planName = ch.plan?.name || 'Evaluation'
                const statusColor = getStatusColor(ch.status)
                const currentBalance = Number(ch.currentBalance) || Number(ch.accountSize)
                const totalPnl = currentBalance - Number(ch.accountSize)
                const profitTarget = Number(ch.accountSize) * (Number(ch.plan?.rules?.profitTargetPct) || 8) / 100
                const pnlElementColor = totalPnl >= 0 ? '#10B981' : '#EF4444'
                const progressPct = Math.min(100, Math.max(0, (totalPnl / profitTarget) * 100))
                
                // Days Traded (Simple difference for now)
                const daysTraded = Math.max(0, Math.floor((new Date() - new Date(ch.startDate)) / 86400000))

                return (
                  <div key={ch.id} style={{ 
                    backgroundColor: '#0D1420', 
                    border: `1px solid ${ch.status === 'PASSED' ? 'rgba(16,185,129,0.5)' : '#1E2D40'}`, 
                    borderLeft: `4px solid ${statusColor}`, 
                    borderRadius: '16px', 
                    padding: '24px',
                    boxShadow: ch.status === 'PASSED' ? '0 0 20px rgba(16,185,129,0.1)' : 'none',
                    display: 'flex', flexDirection: 'column'
                  }}>
                    
                    {ch.status === 'PASSED' && (
                      <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Award size={16} /> 🏆 Challenge Passed!
                      </div>
                    )}

                    {/* Top Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <div>
                        <div style={{ display: 'inline-block', backgroundColor: '#131D2E', color: '#94A3B8', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                          {planName}
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F1F5F9' }}>
                          {formatINR(ch.accountSize)}
                        </div>
                      </div>
                      <div style={{ 
                        backgroundColor: `${statusColor}22`, 
                        color: statusColor, 
                        padding: '6px 12px', 
                        borderRadius: '16px', 
                        fontSize: '12px', 
                        fontWeight: 'bold' 
                      }}>
                        {ch.status}
                      </div>
                    </div>

                    {/* Middle Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#060B14', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                      <div>
                        <div style={{ color: '#475569', fontSize: '12px', marginBottom: '4px' }}>Total P&L</div>
                        <div style={{ color: pnlElementColor, fontSize: '16px', fontWeight: 'bold' }}>
                          {totalPnl >= 0 ? '+' : ''}{formatINR(totalPnl)}
                        </div>
                      </div>
                      <div style={{ width: '1px', backgroundColor: '#1E2D40' }} />
                      <div>
                        <div style={{ color: '#475569', fontSize: '12px', marginBottom: '4px' }}>Balance</div>
                        <div style={{ color: '#F1F5F9', fontSize: '16px', fontWeight: 'bold' }}>{formatINR(currentBalance)}</div>
                      </div>
                      <div style={{ width: '1px', backgroundColor: '#1E2D40' }} />
                      <div>
                        <div style={{ color: '#475569', fontSize: '12px', marginBottom: '4px' }}>Days</div>
                        <div style={{ color: '#F1F5F9', fontSize: '16px', fontWeight: 'bold' }}>{daysTraded}</div>
                      </div>
                    </div>

                    {/* Progress */}
                    {(ch.status === 'ACTIVE' || ch.status === 'FAILED') && (
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                          <span style={{ color: '#94A3B8' }}>Profit Target ({ch.plan?.rules?.profitTargetPct || 8}%)</span>
                          <span style={{ color: '#F1F5F9', fontWeight: '500' }}>{formatINR(totalPnl)} / {formatINR(profitTarget)}</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: '#1E2D40', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progressPct}%`, backgroundColor: progressPct >= 100 ? '#10B981' : '#2563EB', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                    )}

                    {/* Footer Row */}
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1E2D40', paddingTop: '16px' }}>
                      <div style={{ color: '#475569', fontSize: '12px' }}>
                        {formatDate(ch.startDate)} → {ch.endDate ? formatDate(ch.endDate) : 'Never'}
                      </div>
                      <button 
                        onClick={() => navigate(`/challenges/${ch.id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'transparent', color: '#F1F5F9', border: '1px solid #1E2D40', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#131D2E'; e.currentTarget.style.borderColor = '#475569' }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#1E2D40' }}
                      >
                        View Details <ChevronRight size={14} />
                      </button>
                    </div>

                    {/* Extra Failed State CTA */}
                    {(ch.status === 'FAILED' || ch.status === 'EXPIRED') && (
                      <button 
                        onClick={() => navigate(`/buy-challenge`)}
                        style={{ marginTop: '16px', width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#F59E0B', border: '1px solid #F59E0B', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: 0.9 }}>
                        Retry with 20% off
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default ChallengesPage
