import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { 
  Rocket, AlertTriangle, TrendingDown, Target, 
  Calendar, Clock, BarChart2, Wallet, Shield, 
  Link as LinkIcon, Award, X
} from 'lucide-react'
import api from '../api'
import useAuthStore from '../stores/authStore'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import BottomNav from '../components/dashboard/BottomNav'

const colors = {
  bg: '#060B14',
  surface: '#0D1420',
  surface2: '#0F1923',
  card: '#111827',
  border: '#1E2D40',
  accent: '#2563EB',
  gold: '#F59E0B',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  text: '#F1F5F9',
  text2: '#94A3B8',
  text3: '#475569'
}

const formatINR = (paise) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(paise / 100)
}

const formatPct = (value) => {
  return (value >= 0 ? '+' : '') + value.toFixed(2) + '%'
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [challenge, setChallenge] = useState(null)
  const [trades, setTrades] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPassModal, setShowPassModal] = useState(false)
  const [showFailModal, setShowFailModal] = useState(false)
  const [alert, setAlert] = useState(null)

  const fetchDashboardData = async () => {
    try {
      const [challengeRes, tradesRes] = await Promise.all([
        api.get('/challenges'),
        api.get('/trades/active')
      ])
      
      const challenges = challengeRes.data.data
      const active = challenges.find(
        c => c.status === 'ACTIVE' || c.status === 'PASSED' || c.status === 'SUSPENDED'
      )
      setChallenge(active || null)
      setTrades(tradesRes.data.data || [])
    } catch (err) {
      console.error(err)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Socket.io integration
    const token = localStorage.getItem('accessToken')
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket']
    })

    socket.on('connect', () => {
      if (challenge?.id) {
        socket.emit('join', { challengeId: challenge.id })
      }
    })

    socket.on('risk_event', (data) => {
      switch(data.type) {
        case 'CHALLENGE_PASSED':
          setShowPassModal(true)
          break
        case 'CHALLENGE_FAILED':
          setShowFailModal(true)
          break
        case 'DAILY_LOSS_HIT':
          setAlert({
            type: 'danger',
            message: 'Daily loss limit reached! Trading suspended for today.'
          })
          break
        case 'CONSISTENCY_WARNING':
          setAlert({
            type: 'warning', 
            message: data.message
          })
          break
        case 'MIN_DAYS_PENDING':
          setAlert({
            type: 'info',
            message: 'Profit target reached! Need more trading days.'
          })
          break
      }
    })

    socket.on('equity:snapshot', (data) => {
      setChallenge(prev => prev ? ({
        ...prev,
        currentBalance: data.currentBalance,
        totalPnl: data.totalPnl,
        dailyPnl: data.dailyPnl,
        peakBalance: data.peakBalance
      }) : prev)
    })

    // Fallback polling
    const interval = setInterval(fetchDashboardData, 30000)

    return () => {
      socket.disconnect()
      clearInterval(interval)
    }
  }, [challenge?.id]) // Re-run if challenge ID changes to rejoin socket Room

  if (isLoading) {
    return (
      <div style={{ backgroundColor: colors.bg, minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
        <div className="desktop-only"><Sidebar /></div>
        <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TopBar />
          <div style={{ padding: '24px 32px' }}>
            <div className="skeleton" style={{ height: '250px', width: '100%', marginBottom: '24px' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: '120px' }}></div>)}
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  // Derived Values
  const accountSize = Number(challenge?.accountSize || 0)
  const currentBalance = Number(challenge?.currentBalance || accountSize)
  const totalPnl = Number(challenge?.totalPnl || 0)
  const dailyPnl = Number(challenge?.dailyPnl || 0)
  const peakBalance = Number(challenge?.peakBalance || accountSize)

  const profitTarget = (accountSize * 8) / 100
  const dailyLossLimit = (accountSize * 4) / 100
  const maxDrawdownLimit = (accountSize * 8) / 100

  const profitTargetPct = Math.min((Math.max(0, totalPnl) / profitTarget) * 100, 100) || 0
  const dailyLossPct = Math.min((Math.abs(dailyPnl) / dailyLossLimit) * 100, 100) || 0
  
  const drawdownAmount = peakBalance - currentBalance
  const maxDrawdownPct = Math.min((drawdownAmount / maxDrawdownLimit) * 100, 100) || 0

  const startDate = challenge?.startDate ? new Date(challenge.startDate) : new Date()
  const expiryDate = challenge?.expiryDate ? new Date(challenge.expiryDate) : new Date()
  const today = new Date()
  const daysElapsed = Math.max(0, Math.floor((today - startDate) / (1000 * 60 * 60 * 24)))
  const daysRemaining = Math.max(0, Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24)))

  const isBrokerConnected = !!user?.brokerAccessToken

  // Helper for rule card styles
  const getRuleStatusColor = (pct, breached) => {
    if (breached) return colors.danger
    if (pct >= 75) return colors.warning
    return colors.success
  }

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <div className="desktop-only"><Sidebar /></div>
      
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <TopBar />

        {/* ALERT BANNER */}
        {alert && (
          <div style={{
            backgroundColor: alert.type === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
            borderBottom: `2px solid ${alert.type === 'danger' ? colors.danger : colors.warning}`,
            padding: '12px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color={alert.type === 'danger' ? colors.danger : colors.warning} />
              {alert.message}
            </div>
            <X size={18} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setAlert(null)} />
          </div>
        )}

        <div style={{ padding: '24px 32px', flex: 1 }}>
          
          {!challenge ? (
            /* NO CHALLENGE STATE */
            <div style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '16px',
              padding: '60px 40px',
              textAlign: 'center',
              maxWidth: '800px',
              margin: '40px auto'
            }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '24px', 
                backgroundColor: 'rgba(37,99,235,0.1)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 24px auto',
                border: `1px solid rgba(37,99,235,0.2)`
              }}>
                <Rocket size={40} color={colors.accent} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                No Active Challenge
              </h2>
              <p style={{ color: colors.text2, fontSize: '16px', marginBottom: '32px' }}>
                Purchase a challenge to start your funded trading journey
              </p>

              <div style={{ 
                display: 'flex', justifyContent: 'center', gap: '40px', 
                marginBottom: '40px', color: colors.text2, fontSize: '14px',
                flexWrap: 'wrap'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>47</div>
                  <div>Traders Funded</div>
                </div>
                <div style={{ width: '1px', backgroundColor: colors.border }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>₹2.3Cr</div>
                  <div>Paid Out</div>
                </div>
                <div style={{ width: '1px', backgroundColor: colors.border }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>80%</div>
                  <div>Profit Split</div>
                </div>
              </div>

              <button
                onClick={() => navigate('/buy-challenge')}
                style={{
                  backgroundColor: colors.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = colors.accent2}
                onMouseLeave={(e) => e.target.style.backgroundColor = colors.accent}
              >
                Buy Your First Challenge →
              </button>
            </div>
          ) : (
            /* ACTIVE CHALLENGE STATE */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* WIDGET 6: QUICK ACTIONS */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/payouts')}
                  disabled={challenge.status !== 'PASSED'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 16px', borderRadius: '8px',
                    backgroundColor: colors.surface, border: `1px solid ${colors.border}`,
                    color: challenge.status === 'PASSED' ? 'white' : colors.text3,
                    cursor: challenge.status === 'PASSED' ? 'pointer' : 'not-allowed',
                    fontSize: '14px', fontWeight: 500
                  }}
                >
                  <Wallet size={16} color={challenge.status === 'PASSED' ? colors.accent : colors.text3} /> 
                  Request Payout
                </button>

                {user?.kycStatus !== 'VERIFIED' && (
                  <button
                    onClick={() => navigate('/kyc')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 16px', borderRadius: '8px',
                      backgroundColor: colors.surface, border: `1px solid ${colors.border}`,
                      color: 'white', cursor: 'pointer',
                      fontSize: '14px', fontWeight: 500
                    }}
                  >
                    <Shield size={16} color={colors.gold} /> Complete KYC
                  </button>
                )}

                {!isBrokerConnected && (
                  <button
                    onClick={() => navigate('/broker')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 16px', borderRadius: '8px',
                      backgroundColor: colors.surface, border: `1px solid ${colors.border}`,
                      color: 'white', cursor: 'pointer',
                      fontSize: '14px', fontWeight: 500
                    }}
                  >
                    <LinkIcon size={16} color="#A855F7" /> Connect Broker
                  </button>
                )}

                {challenge.status === 'PASSED' && (
                  <button
                    onClick={() => navigate(`/challenges/${challenge.id}/certificate`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 16px', borderRadius: '8px',
                      backgroundColor: colors.surface, border: `1px solid ${colors.border}`,
                      color: 'white', cursor: 'pointer',
                      fontSize: '14px', fontWeight: 500
                    }}
                  >
                    <Award size={16} color={colors.success} /> View Certificate
                  </button>
                )}
              </div>

              {/* WIDGET 3: BROKER CONNECTION BANNER */}
              {!isBrokerConnected ? (
                <div style={{
                  backgroundColor: 'rgba(245,158,11,0.1)',
                  border: `1px solid rgba(245,158,11,0.3)`,
                  borderRadius: '12px',
                  padding: '16px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ color: colors.warning, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
                    ⚡ Connect your broker to start syncing trades automatically
                  </div>
                  <button
                    onClick={() => navigate('/broker')}
                    style={{
                      backgroundColor: colors.warning,
                      color: colors.bg,
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Connect Upstox →
                  </button>
                </div>
              ) : (
                <div style={{ color: colors.success, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.success }}></div>
                  Upstox Connected — Syncing via Webhooks
                </div>
              )}

              {/* WIDGET 1: ACCOUNT OVERVIEW */}
              <div style={{
                background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.card} 100%)`,
                border: `1px solid ${colors.border}`,
                borderRadius: '16px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      backgroundColor: 'rgba(37,99,235,0.15)',
                      color: colors.accent,
                      border: `1px solid rgba(37,99,235,0.3)`,
                      borderRadius: '999px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      Phase {challenge.phase || 1}
                    </div>
                    <div style={{
                      color: challenge.status === 'PASSED' ? colors.success : 
                             challenge.status === 'FAILED' ? colors.danger :
                             challenge.status === 'SUSPENDED' ? colors.warning : colors.success,
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      ● {challenge.status}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: daysRemaining < 10 ? colors.gold : 'white' }}>
                      {daysRemaining} <span style={{ fontSize: '14px', fontWeight: 'normal', color: colors.text2 }}>days left</span>
                    </div>
                    <div style={{ fontSize: '12px', color: colors.text3 }}>
                      Expires: {expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
                  {/* Account Balance */}
                  <div>
                    <div style={{ color: colors.text2, fontSize: '14px', marginBottom: '8px' }}>Account Balance</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                      {formatINR(currentBalance)}
                    </div>
                    <div style={{ fontSize: '14px', color: totalPnl >= 0 ? colors.success : colors.danger, fontWeight: 500 }}>
                      {totalPnl >= 0 ? '+' : ''}{formatINR(totalPnl)} ({formatPct((totalPnl / accountSize) * 100)})
                    </div>
                  </div>
                  {/* Total PnL */}
                  <div>
                    <div style={{ color: colors.text2, fontSize: '14px', marginBottom: '8px' }}>Total P&L</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: totalPnl >= 0 ? colors.success : colors.danger }}>
                      {formatINR(Math.abs(totalPnl))}
                    </div>
                  </div>
                  {/* Today's PnL */}
                  <div>
                    <div style={{ color: colors.text2, fontSize: '14px', marginBottom: '8px' }}>Today's P&L</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: dailyPnl >= 0 ? colors.success : colors.danger }}>
                      {formatINR(Math.abs(dailyPnl))}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span style={{ color: colors.text2 }}>Profit Target Progress</span>
                    <span style={{ color: 'white', fontWeight: 500 }}>
                      {formatINR(Math.max(0, totalPnl))} / {formatINR(profitTarget)} ({profitTargetPct.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: colors.border, borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${profitTargetPct}%`, 
                      height: '100%', 
                      background: `linear-gradient(90deg, ${colors.accent} 0%, ${colors.success} 100%)`,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                </div>
              </div>

              {/* WIDGET 2: RULES GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                
                {/* 1. Daily Loss Limit */}
                <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', borderLeft: `3px solid ${getRuleStatusColor(dailyLossPct, dailyPnl <= -dailyLossLimit)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.text2, fontSize: '14px' }}>
                      <AlertTriangle size={16} /> Daily Loss Limit
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: getRuleStatusColor(dailyLossPct, dailyPnl <= -dailyLossLimit) }}>
                      {dailyLossPct < 50 ? 'Safe ✓' : dailyLossPct >= 100 ? 'Limit Hit ✗' : 'Warning ⚠'}
                    </span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                    {formatINR(Math.abs(dailyPnl < 0 ? dailyPnl : 0))}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text3, marginBottom: '12px' }}>
                    Limit: {formatINR(dailyLossLimit)}
                  </div>
                  <div style={{ width: '100%', height: '4px', backgroundColor: colors.border, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${dailyLossPct}%`, height: '100%', backgroundColor: getRuleStatusColor(dailyLossPct, dailyPnl <= -dailyLossLimit) }}></div>
                  </div>
                </div>

                {/* 2. Max Drawdown */}
                <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', borderLeft: `3px solid ${getRuleStatusColor(maxDrawdownPct, drawdownAmount >= maxDrawdownLimit)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.text2, fontSize: '14px' }}>
                      <TrendingDown size={16} /> Max Drawdown
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: getRuleStatusColor(maxDrawdownPct, drawdownAmount >= maxDrawdownLimit) }}>
                      {maxDrawdownPct < 50 ? 'Safe ✓' : maxDrawdownPct >= 100 ? 'Limit Hit ✗' : 'Warning ⚠'}
                    </span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                    {formatINR(drawdownAmount)}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text3, marginBottom: '12px' }}>
                    Limit: {formatINR(maxDrawdownLimit)}
                  </div>
                  <div style={{ width: '100%', height: '4px', backgroundColor: colors.border, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${maxDrawdownPct}%`, height: '100%', backgroundColor: getRuleStatusColor(maxDrawdownPct, drawdownAmount >= maxDrawdownLimit) }}></div>
                  </div>
                </div>

                {/* 3. Profit Target */}
                <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', borderLeft: `3px solid ${profitTargetPct >= 100 ? colors.success : colors.text3}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.text2, fontSize: '14px' }}>
                      <Target size={16} /> Profit Target
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: profitTargetPct >= 100 ? colors.success : colors.text2 }}>
                      {profitTargetPct >= 100 ? 'Target Met! 🎉' : `${formatINR(profitTarget - Math.max(0, totalPnl))} to go`}
                    </span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                    {formatINR(Math.max(0, totalPnl))}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text3, marginBottom: '12px' }}>
                    Target: {formatINR(profitTarget)}
                  </div>
                  <div style={{ width: '100%', height: '4px', backgroundColor: colors.border, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${profitTargetPct}%`, height: '100%', backgroundColor: colors.success }}></div>
                  </div>
                </div>

                {/* 4. Trading Days */}
                <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', borderLeft: `3px solid ${challenge.daysTraded >= 5 ? colors.success : colors.text3}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.text2, fontSize: '14px' }}>
                      <Calendar size={16} /> Min Trading Days
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: challenge.daysTraded >= 5 ? colors.success : colors.text2 }}>
                      {challenge.daysTraded >= 5 ? 'Requirement Met ✓' : `${Math.max(0, 5 - challenge.daysTraded)} more days needed`}
                    </span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                    {challenge.daysTraded || 0} / 5
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text3, marginBottom: '12px' }}>
                    Active trading days
                  </div>
                  <div style={{ width: '100%', height: '4px', backgroundColor: colors.border, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(((challenge.daysTraded || 0) / 5) * 100, 100)}%`, height: '100%', backgroundColor: colors.success }}></div>
                  </div>
                </div>

                {/* 5. Challenge Duration */}
                <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', borderLeft: `3px solid ${daysRemaining < 10 ? colors.warning : colors.success}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.text2, fontSize: '14px' }}>
                      <Clock size={16} /> Time Remaining
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: daysRemaining < 10 ? colors.warning : colors.success }}>
                      {daysRemaining} days left
                    </span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                    {daysRemaining} Days
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text3, marginBottom: '12px' }}>
                    Expires {expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  <div style={{ width: '100%', height: '4px', backgroundColor: colors.border, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${((45 - daysRemaining) / 45) * 100}%`, height: '100%', backgroundColor: daysRemaining < 10 ? colors.warning : colors.success }}></div>
                  </div>
                </div>

                {/* 6. Consistency Rule */}
                <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', borderLeft: `3px solid ${challenge.consistencyViolations === 0 ? colors.success : challenge.consistencyViolations < 3 ? colors.warning : colors.danger}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.text2, fontSize: '14px' }}>
                      <BarChart2 size={16} /> Consistency Rule
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: challenge.consistencyViolations === 0 ? colors.success : challenge.consistencyViolations < 3 ? colors.warning : colors.danger }}>
                      {challenge.consistencyViolations === 0 ? 'Clean ✓' : challenge.consistencyViolations < 3 ? 'Warning ⚠' : 'Violated ✗'}
                    </span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                    {challenge.consistencyViolations || 0} / 3 <span style={{ fontSize: '14px', color: colors.text2, fontWeight: 'normal' }}>violations</span>
                  </div>
                  <div style={{ fontSize: '11px', color: colors.text3, marginBottom: '12px' }}>
                    No single day {'>'} 40% of target
                  </div>
                  <div style={{ width: '100%', height: '4px', backgroundColor: colors.border, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${((challenge.consistencyViolations || 0) / 3) * 100}%`, height: '100%', backgroundColor: colors.danger }}></div>
                  </div>
                </div>

              </div>
              
              {/* WIDGET 5: OPEN POSITIONS */}
              {trades.filter(t => t.status === 'OPEN').length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>Open Positions</h3>
                    <div style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: colors.danger, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <div style={{ width: '6px', height: '6px', backgroundColor: colors.danger, borderRadius: '50%', boxShadow: `0 0 6px ${colors.danger}` }}></div>
                      LIVE
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {trades.filter(t => t.status === 'OPEN').map(trade => (
                      <div key={trade.id} style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ color: 'white', fontWeight: 'bold' }}>{trade.instrument || trade.symbol}</span>
                          <span style={{ 
                            backgroundColor: trade.tradeType === 'BUY' ? 'rgba(37,99,235,0.15)' : 'rgba(168,85,247,0.15)',
                            color: trade.tradeType === 'BUY' ? colors.accent : '#A855F7',
                            padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'
                          }}>{trade.tradeType}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.text2, fontSize: '13px', marginBottom: '8px' }}>
                          <span>Entry: {formatINR(trade.entryPrice)}</span>
                          <span>Qty: {trade.quantity}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${colors.border}` }}>
                          <span style={{ color: colors.text3, fontSize: '12px' }}>Unrealized P&L</span>
                          <span style={{ 
                            color: Number(trade.pnl) >= 0 ? colors.success : colors.danger, 
                            fontWeight: 'bold',
                            fontSize: '16px' 
                          }}>
                            {Number(trade.pnl) >= 0 ? '+' : ''}{formatINR(trade.pnl)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WIDGET 4: RECENT TRADES */}
              <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>Recent Trades</h3>
                  <span onClick={() => navigate(`/challenges/${challenge.id}`)} style={{ color: colors.accent, fontSize: '14px', cursor: 'pointer' }}>View All →</span>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: colors.surface2, color: colors.text2, fontSize: '13px' }}>
                        <th style={{ padding: '12px 24px', fontWeight: 500 }}>Instrument</th>
                        <th style={{ padding: '12px 24px', fontWeight: 500 }}>Type</th>
                        <th style={{ padding: '12px 24px', fontWeight: 500 }}>Qty</th>
                        <th style={{ padding: '12px 24px', fontWeight: 500 }}>Entry</th>
                        <th style={{ padding: '12px 24px', fontWeight: 500 }}>Exit</th>
                        <th style={{ padding: '12px 24px', fontWeight: 500 }}>P&L</th>
                        <th style={{ padding: '12px 24px', fontWeight: 500 }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: colors.text3 }}>
                            No trades yet. Connect your broker and start trading to see history.
                          </td>
                        </tr>
                      ) : (
                        trades.slice(0, 10).map((trade) => (
                          <tr key={trade.id} style={{ borderBottom: `1px solid ${colors.border}`, color: 'white', fontSize: '14px' }}>
                            <td style={{ padding: '16px 24px', fontWeight: 500 }}>{trade.instrument || trade.symbol}</td>
                            <td style={{ padding: '16px 24px' }}>
                              <span style={{ 
                                backgroundColor: trade.tradeType === 'BUY' ? 'rgba(37,99,235,0.15)' : 'rgba(168,85,247,0.15)',
                                color: trade.tradeType === 'BUY' ? colors.accent : '#A855F7',
                                padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'
                              }}>{trade.tradeType}</span>
                            </td>
                            <td style={{ padding: '16px 24px' }}>{trade.quantity}</td>
                            <td style={{ padding: '16px 24px' }}>{formatINR(trade.entryPrice)}</td>
                            <td style={{ padding: '16px 24px', color: trade.status === 'OPEN' ? colors.gold : 'white' }}>
                              {trade.status === 'OPEN' ? 'Open' : formatINR(trade.exitPrice)}
                            </td>
                            <td style={{ padding: '16px 24px', fontWeight: 'bold', color: Number(trade.pnl) >= 0 ? colors.success : colors.danger }}>
                              {Number(trade.pnl) >= 0 ? '+' : ''}{formatINR(trade.pnl)}
                            </td>
                            <td style={{ padding: '16px 24px', color: colors.text2, fontSize: '13px' }}>
                              {new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(trade.entryTime))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
      <BottomNav />

      {/* PASS MODAL */}
      {showPassModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(6,11,20,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.success}`, borderRadius: '16px', padding: '40px', textAlign: 'center', maxWidth: '400px', boxShadow: `0 0 50px rgba(16,185,129,0.2)` }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: colors.success, marginBottom: '16px' }}>Challenge Passed!</h2>
            <p style={{ color: colors.text2, marginBottom: '32px', lineHeight: '1.5' }}>
              Congratulations! You've successfully completed your challenge requirements. Welcome to the funded tier.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => { setShowPassModal(false); navigate(`/challenges/${challenge?.id}/certificate`); }}
                style={{ backgroundColor: colors.success, color: colors.bg, padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >View Certificate →</button>
              <button 
                onClick={() => { setShowPassModal(false); navigate('/payouts'); }}
                style={{ backgroundColor: 'transparent', border: `1px solid ${colors.accent}`, color: colors.accent, padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >Request Payout →</button>
            </div>
          </div>
        </div>
      )}

      {/* FAIL MODAL */}
      {showFailModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(6,11,20,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.danger}`, borderRadius: '16px', padding: '40px', textAlign: 'center', maxWidth: '400px', boxShadow: `0 0 50px rgba(239,68,68,0.2)` }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: colors.danger, marginBottom: '16px' }}>Challenge Failed</h2>
            <p style={{ color: colors.text2, marginBottom: '16px', lineHeight: '1.5' }}>
              {challenge?.failReason || "You have breached the risk limits of your challenge."}
            </p>
            <p style={{ color: colors.text3, fontSize: '13px', marginBottom: '32px', fontStyle: 'italic' }}>
              "Don't give up! 80% of successful traders failed at least once before passing."
            </p>
            <button 
              onClick={() => { setShowFailModal(false); navigate('/buy-challenge'); }}
              style={{ backgroundColor: colors.accent, color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
            >
              Retry with 20% Discount →
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default DashboardPage
