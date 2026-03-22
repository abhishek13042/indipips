import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import api from '../api'

// Components
import ErrorBoundary from '../components/terminal/ErrorBoundary'
import TopBar from '../components/terminal/TopBar'
import WatchlistPanel from '../components/terminal/WatchlistPanel'
import ChartPanel from '../components/terminal/ChartPanel'
import RightPanel from '../components/terminal/RightPanel'
import PositionsBar from '../components/terminal/PositionsBar'

const terminalStyle = {
  display: 'grid',
  gridTemplateAreas: `
    "topbar topbar topbar"
    "watchlist chart rightpanel"
    "watchlist positions positions"
  `,
  gridTemplateColumns: '200px 1fr 300px',
  gridTemplateRows: '48px 1fr 180px',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  background: '#060B14',
  fontFamily: 'Inter, sans-serif',
}

export default function TradingTerminalPage() {
  const navigate = useNavigate()
  const socketRef = useRef(null)
  const pollingRef = useRef(null)

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // Terminal State
  const [selectedInstrument, setSelectedInstrument] = useState('NIFTY')
  const [tvSymbol, setTvSymbol] = useState('NSE:NIFTY')
  
  // Data State
  const [challenge, setChallenge] = useState(null)
  const [positions, setPositions] = useState([])
  const [marketStatus, setMarketStatus] = useState(null)

  // UI State
  const [alert, setAlert] = useState(null)
  const [showPassModal, setShowPassModal] = useState(false)
  const [showFailModal, setShowFailModal] = useState(null)
  const [toasts, setToasts] = useState([])

  // Order loading states mapped for RightPanel
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderStatus, setOrderStatus] = useState('idle')
  const [lastOrderResult, setLastOrderResult] = useState(null)

  const updateGlobalPriceRef = (price, change) => {
    // This connects Watchlist to TopBar securely bypasses huge re-renders if passed as regular state
    // We update TopBar refs organically from within TopBar via Challenge objects or native refs
    // We use DOM ids to safely isolate updates natively
    const priceEl = document.getElementById('topbar-live-price')
    const changeEl = document.getElementById('topbar-live-change')
    if (priceEl && changeEl) {
      priceEl.textContent = new Intl.NumberFormat('en-IN').format(price.toFixed(2))
      priceEl.style.color = change >= 0 ? '#10B981' : '#EF4444'
      changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%'
      changeEl.style.color = change >= 0 ? '#10B981' : '#EF4444'
    }
  }

  const showToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      // Run all 3 independently
      // One failing doesn't stop others
      const [
        challengeResult,
        tradesResult,
        marketResult,
      ] = await Promise.allSettled([
        api.get('/challenges'),
        api.get('/trades/active'),
        api.get('/trades/market-status'),
      ])

      // Handle challenges
      if (challengeResult.status === 'fulfilled') {
        const challenges = challengeResult.value?.data?.data || []
        const active = challenges.find(
          c => c.status === 'ACTIVE' || c.status === 'SUSPENDED'
        )
        setChallenge(active || null)
        
        if (active?.status === 'SUSPENDED') {
          setAlert({
            type: 'danger',
            message: '⚠️ Trading suspended — daily loss limit reached. Resumes at 9:15 AM IST tomorrow.',
            dismissible: false
          })
        }
      } else {
        console.warn('Challenges fetch failed:', challengeResult.reason?.message)
        setChallenge(null)
        // Handle 401 redirect
        if (challengeResult.reason?.response?.status === 401) {
          navigate('/login')
          return
        }
      }

      // Handle trades
      if (tradesResult.status === 'fulfilled') {
        const trades = tradesResult.value?.data?.data?.trades || []
        setPositions(trades)
      } else {
        console.warn('Trades fetch failed:', tradesResult.reason?.message)
        setPositions([])
      }

      // Handle market status
      if (marketResult.status === 'fulfilled') {
        setMarketStatus(marketResult.value?.data?.data)
      } else {
        console.warn('Market status failed:', marketResult.reason?.message)
        // Default to closed if can't determine
        setMarketStatus({ isOpen: false })
      }

      // NEVER show error screen
      // Terminal loads regardless
      setLoadError(null)
      setIsLoading(false)
      console.log('✅ Terminal loaded')
    }
    loadData()
  }, [navigate])

  // Market Status Polling
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await api.get('/trades/market-status')
        setMarketStatus(res.data.data)
      } catch { /* silent */ }
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Polling Fallback Manager
  const startPollingFallback = () => {
    if (pollingRef.current) return
    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.get('/challenges')
        const active = (res.data.data || []).find(c => c.status === 'ACTIVE')
        if (active) setChallenge(active)
        
        const tradesRes = await api.get('/trades/active')
        setPositions(tradesRes.data.data || [])
      } catch { /* silent */ }
    }, 30000)
  }

  const stopPollingFallback = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  // Socket IO Setup
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('🔌 Terminal socket connected')
      if (challenge?.id) {
        socket.emit('join', { challengeId: challenge.id })
      }
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected — will auto-reconnect')
      startPollingFallback()
    })

    socket.on('reconnect', () => {
      console.log('Socket reconnected')
      stopPollingFallback()
      if (challenge?.id) {
        socket.emit('join', { challengeId: challenge.id })
      }
    })

    // ORDER CONFIRMATION
    socket.on('order:confirmed', (data) => {
      setOrderLoading(false)
      setOrderStatus('done')

      if (data.status === 'CONFIRMED') {
        setLastOrderResult({ success: true, message: data.message })
        showToast(data.message, 'success')
        
        if (data.trade) {
          setPositions(prev => [
            { ...data.trade, currentPrice: data.trade.entryPrice, unrealizedPnl: 0 },
            ...prev
          ])
        }
      } else if (data.status === 'CLOSED') {
        setLastOrderResult({ success: true, message: data.message })
        const pnlColor = data.trade?.pnl >= 0 ? 'success' : 'warning'
        showToast(data.message, pnlColor)

        setPositions(prev => prev.filter(p => p.id !== data.trade?.id && p.tradeId !== data.trade?.id))

        if (data.challenge) {
          setChallenge(data.challenge)
        }

        if (data.riskEvents?.length > 0) {
          data.riskEvents.forEach(handleRiskEvent)
        }
      }
    })

    // ORDER FAILED
    socket.on('order:failed', (data) => {
      setOrderLoading(false)
      setOrderStatus('error')
      setLastOrderResult({ success: false, message: data.message })
      showToast(data.message, 'error')
    })

    // EQUITY SNAPSHOT
    socket.on('equity:snapshot', (data) => {
      setChallenge(prev => ({
        ...prev,
        currentBalance: data.currentBalance * 100,
        totalPnl: data.totalPnl * 100,
        dailyPnl: data.dailyPnl * 100
      }))
    })

    // RISK EVENTS
    socket.on('risk_event', handleRiskEvent)

    return () => {
      socket.disconnect()
      socketRef.current = null
      stopPollingFallback()
    }
  }, [challenge?.id])

  const handleRiskEvent = (data) => {
    switch (data.type) {
      case 'CHALLENGE_PASSED':
        setShowPassModal(true)
        showToast('🎉 Challenge Passed! Congratulations!', 'success')
        break
      case 'CHALLENGE_FAILED':
        setShowFailModal({ visible: true, reason: data.reason })
        showToast('❌ Challenge failed: ' + data.reason, 'error')
        break
      case 'DAILY_LOSS_HIT':
        setAlert({
          type: 'danger',
          message: '⚠️ Daily loss limit reached! Trading suspended until 9:15 AM IST tomorrow.'
        })
        setChallenge(prev => ({ ...prev, status: 'SUSPENDED' }))
        break
      case 'CONSISTENCY_WARNING':
        setAlert({ type: 'warning', message: '⚠️ ' + data.message, dismissible: true })
        break
      case 'MIN_DAYS_PENDING':
        showToast('📅 Profit target reached! Need ' + data.daysNeeded + ' more trading days.', 'info')
        break
      case 'DAILY_RESET':
        setAlert(null)
        setChallenge(prev => ({ ...prev, status: 'ACTIVE', dailyPnl: 0 }))
        showToast('🌅 New trading day! Daily limits reset.', 'info')
        break
    }
  }

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (['INPUT', 'SELECT'].includes(e.target.tagName)) return
      switch (e.key) {
        case 'Escape':
          setShowPassModal(false)
          setShowFailModal(null)
          break
        case '1':
          setSelectedInstrument('NIFTY')
          setTvSymbol('NSE:NIFTY')
          break
        case '2':
          setSelectedInstrument('BANKNIFTY')
          setTvSymbol('NSE:BANKNIFTY')
          break
        case '3':
          setSelectedInstrument('MIDCAPNIFTY')
          setTvSymbol('NSE:MIDCPNIFTY')
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handlePlaceOrder = async (orderData) => {
    if (!challenge || challenge.status !== 'ACTIVE') {
      showToast('No active challenge', 'error')
      return
    }
    if (!marketStatus?.isOpen) {
      showToast('Market is closed. Trading hours: 9:15 AM - 3:15 PM IST', 'error')
      return
    }

    setOrderLoading(true)
    setOrderStatus('submitting')
    setLastOrderResult(null)

    try {
      const livePrices = window.__indipips_live_prices || {}
      const instrumentStr = orderData.instrument || selectedInstrument
      const baseInst = instrumentStr.split('-')[0]
      const currentPrice = orderData.price > 0 ? orderData.price : (livePrices[baseInst] || 0)

      const res = await api.post('/trades/open', {
        challengeId: challenge.id,
        instrument: instrumentStr.toUpperCase(),
        tradeType: orderData.type,
        quantity: orderData.quantity,
        entryPrice: currentPrice,
        orderType: orderData.orderType || 'MARKET'
      })

      if (res.data.success) {
        setOrderStatus('queued')
        showToast('Order submitted — processing...', 'info')
      }
    } catch (err) {
      setOrderLoading(false)
      setOrderStatus('error')
      const msg = err.response?.data?.message || 'Order failed. Please try again.'
      setLastOrderResult({ success: false, message: msg })
      showToast(msg, 'error')
    }
  }

  const handleExitPosition = async (pos) => {
    const confirmed = window.confirm(`Exit ${pos.instrument}?\nThis will close your position.`)
    if (!confirmed) return

    const livePrices = window.__indipips_live_prices || {}
    const baseInst = pos.instrument.split('-')[0]
    const exitPrice = livePrices[baseInst] || pos.entryPrice / 100

    try {
      const res = await api.post('/trades/close', {
        tradeId: pos.id,
        exitPrice: exitPrice
      })

      if (res.data.success) {
        showToast('Exit order submitted...', 'info')
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Exit failed. Please try again.', 'error')
    }
  }

  // Conditional Rendering
  if (isLoading) {
    const styleTag = document.createElement('style')
    styleTag.textContent = `@keyframes spin { to { transform: rotate(360deg) } }`
    document.head.appendChild(styleTag)

    return (
      <div style={{ position: 'fixed', inset: 0, background: '#060B14', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #1E2D40', borderTop: '3px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ color: '#94A3B8', fontSize: 13 }}>Loading terminal...</div>
      </div>
    )
  }

  if (loadError) return <div style={{ color: 'red', textAlign: 'center', marginTop: 100 }}>{loadError}</div>

  const handleInstrumentChange = (id, tv) => {
    setSelectedInstrument(id)
    setTvSymbol(tv)
  }

  return (
    <div style={terminalStyle}>
      {/* Alert Banner */}
      {alert && (
        <div style={{
          gridColumn: '1/-1', zIndex: 50, padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12,
          background: alert.type === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
          borderBottom: `1px solid ${alert.type === 'danger' ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)'}`,
          color: alert.type === 'danger' ? '#EF4444' : '#F59E0B'
        }}>
          <span>{alert.message}</span>
          {alert.dismissible && <button onClick={() => setAlert(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}>×</button>}
        </div>
      )}

      {/* No Challenge Overlay */}
      {!challenge && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,11,20,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ fontSize: 48 }}>🚀</div>
            <h2 style={{ color: '#F1F5F9', fontSize: 24, marginBottom: 8 }}>No Active Challenge</h2>
            <p style={{ color: '#94A3B8', marginBottom: 24, fontSize: 14 }}>Purchase a challenge to access the trading terminal and start your funded trading journey.</p>
            <button onClick={() => navigate('/buy-challenge')} style={{ background: '#2563EB', color: 'white', border: 'none', borderRadius: 10, padding: '12px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Buy Challenge →</button>
          </div>
        </div>
      )}

      {/* Passed Challenge Modal */}
      {showPassModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#0D1420', border: '1px solid #10B981', borderRadius: 20, padding: '48px 40px', maxWidth: 440, textAlign: 'center', boxShadow: '0 0 60px rgba(16,185,129,0.2)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ color: '#10B981', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Challenge Passed!</h2>
            <p style={{ color: '#94A3B8', marginBottom: 24, fontSize: 14 }}>Congratulations! You have successfully completed your {challenge?.planName} challenge.</p>
            <button onClick={() => navigate('/challenges')} style={{ background: '#10B981', color: 'white', padding: '10px 20px', borderRadius: 8, marginRight: 10, border: 'none', cursor: 'pointer' }}>View Certificate</button>
            <button onClick={() => navigate('/payouts')} style={{ background: '#0D1420', color: '#10B981', border: '1px solid #10B981', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>Request Payout</button>
          </div>
        </div>
      )}

      {/* Failed Challenge Modal */}
      {showFailModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#0D1420', border: '1px solid #EF4444', borderRadius: 20, padding: '48px 40px', maxWidth: 440, textAlign: 'center', boxShadow: '0 0 60px rgba(239,68,68,0.2)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
            <h2 style={{ color: '#EF4444', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Challenge Failed</h2>
            <p style={{ color: '#94A3B8', marginBottom: 24, fontSize: 14 }}>{showFailModal.reason}</p>
            <button onClick={() => navigate('/buy-challenge')} style={{ background: '#EF4444', color: 'white', padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Try Again</button>
          </div>
        </div>
      )}

      {/* Grid Components */}
      <ErrorBoundary>
        <TopBar 
          selectedInstrument={selectedInstrument} 
          onInstrumentChange={handleInstrumentChange} 
          challenge={challenge} 
          marketStatus={marketStatus} 
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <WatchlistPanel 
          selectedInstrument={selectedInstrument}
          onInstrumentChange={handleInstrumentChange}
          challenge={challenge}
          marketStatus={marketStatus}
          updateGlobalPriceRef={updateGlobalPriceRef}
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <ChartPanel symbol={tvSymbol} />
      </ErrorBoundary>

      <ErrorBoundary>
        <RightPanel 
          selectedInstrument={selectedInstrument}
          challenge={challenge}
          marketStatus={marketStatus}
          onPlaceOrder={handlePlaceOrder}
          orderLoading={orderLoading}
          orderStatus={orderStatus}
          lastOrderResult={lastOrderResult}
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <PositionsBar 
          positions={positions}
          onExitPosition={handleExitPosition}
        />
      </ErrorBoundary>

      {/* Global Toasts rendered manually avoiding overlap collisions within grid */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'success' ? '#10B981' : (t.type === 'error' ? '#EF4444' : (t.type === 'info' ? '#2563EB' : '#F59E0B')),
            color: 'white', padding: '12px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <span>{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}>×</button>
          </div>
        ))}
      </div>

    </div>
  )
}
