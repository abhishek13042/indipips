import React, { useRef, useEffect } from 'react'

const BASE_PRICES = {
  'NIFTY':       22419.95,
  'BANKNIFTY':   47830.20,
  'MIDCAPNIFTY': 51240.60,
  'FINNIFTY':    23100.45,
  'RELIANCE':    2847.30,
  'TCS':         3920.15,
  'HDFCBANK':    1642.80,
  'INFY':        1847.55,
  'ICICIBANK':   1284.90,
  'WIPRO':       487.25,
  'ADANIENT':    2340.10,
  'BAJFINANCE':  6780.40,
  'SBIN':        745.60,
  'AXISBANK':    1089.75,
  'KOTAKBANK':   1756.30,
}

const WATCHLIST = [
  { id: 'NIFTY', label: 'NIFTY 50', sub: 'NSE Index' },
  { id: 'BANKNIFTY', label: 'BANKNIFTY', sub: 'NSE Index' },
  { id: 'MIDCAPNIFTY', label: 'MIDCAP', sub: 'NSE Index' },
  { id: 'FINNIFTY', label: 'FINNIFTY', sub: 'NSE Index' },
  { id: 'RELIANCE', label: 'RELIANCE', sub: 'NSE EQ' },
  { id: 'TCS', label: 'TCS', sub: 'NSE EQ' },
  { id: 'HDFCBANK', label: 'HDFC BANK', sub: 'NSE EQ' },
  { id: 'INFY', label: 'INFOSYS', sub: 'NSE EQ' },
  { id: 'ICICIBANK', label: 'ICICI BANK', sub: 'NSE EQ' },
  { id: 'WIPRO', label: 'WIPRO', sub: 'NSE EQ' },
]

const formatINR = (rupees) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(rupees)
}

const WatchlistPanel = ({ selectedInstrument, onInstrumentChange, challenge, marketStatus, updateGlobalPriceRef }) => {
  const priceRefs = useRef({})
  const changeRefs = useRef({})
  const prices = useRef({...BASE_PRICES})
  const changes = useRef(Object.fromEntries(Object.keys(BASE_PRICES).map(k => [k, 0])))

  // DOM refs for account dynamically bypassed
  const balanceRef = useRef(null)
  const pnlRef = useRef(null)
  const dailyRef = useRef(null)
  const dailyBarRef = useRef(null)
  const ddBarRef = useRef(null)

  useEffect(() => {
    const simulate = setInterval(() => {
      const isOpen = marketStatus?.isOpen
      if (!isOpen) {
        // Update window global even if closed to sync initial state
        window.__indipips_live_prices = prices.current
        return
      }
      
      Object.keys(prices.current).forEach(sym => {
        const change = (Math.random() - 0.5) * 0.0005
        const newPrice = prices.current[sym] * (1 + change)
        prices.current[sym] = newPrice
        
        const pctChange = ((newPrice - BASE_PRICES[sym]) / BASE_PRICES[sym]) * 100
        changes.current[sym] = pctChange

        if (priceRefs.current[sym]) {
          priceRefs.current[sym].textContent = new Intl.NumberFormat('en-IN').format(newPrice.toFixed(2))
          priceRefs.current[sym].style.color = pctChange >= 0 ? '#10B981' : '#EF4444'
        }
        if (changeRefs.current[sym]) {
          changeRefs.current[sym].textContent = (pctChange >= 0 ? '+' : '') + pctChange.toFixed(2) + '%'
          changeRefs.current[sym].style.color = pctChange >= 0 ? '#10B981' : '#EF4444'
        }

        if (sym === selectedInstrument && updateGlobalPriceRef) {
          updateGlobalPriceRef(newPrice, pctChange)
        }
        window.__indipips_live_prices = prices.current
      })
    }, 2000)

    return () => clearInterval(simulate)
  }, [selectedInstrument, marketStatus, updateGlobalPriceRef])

  useEffect(() => {
    if (challenge) {
      const bal = challenge.currentBalance || 0
      const totalP = challenge.totalPnl || 0
      const dPnl = challenge.dailyPnl || 0

      if (balanceRef.current) balanceRef.current.textContent = formatINR(bal)
      
      if (pnlRef.current) {
        pnlRef.current.textContent = (totalP >= 0 ? '+' : '') + formatINR(totalP)
        pnlRef.current.style.color = totalP >= 0 ? '#10B981' : '#EF4444'
      }
      
      if (dailyRef.current) {
        dailyRef.current.textContent = (dPnl >= 0 ? '+' : '') + formatINR(dPnl)
        dailyRef.current.style.color = dPnl >= 0 ? '#10B981' : '#EF4444'
      }

      // Progress bars
      if (dailyBarRef.current) {
        const lossAbs = dPnl < 0 ? Math.abs(dPnl) : 0
        const limit = challenge.dailyLossLimitAmount || 1
        const pct = Math.min(100, (lossAbs / limit) * 100)
        dailyBarRef.current.style.width = pct + '%'
        dailyBarRef.current.style.background = pct > 80 ? '#EF4444' : pct > 50 ? '#F59E0B' : '#10B981'
      }
      
      if (ddBarRef.current) {
        const pct = challenge.drawdownPct || 0
        const limit = challenge.maxDrawdown || 8
        const barPct = Math.min(100, (pct / limit) * 100)
        ddBarRef.current.style.width = barPct + '%'
        ddBarRef.current.style.background = barPct > 80 ? '#EF4444' : barPct > 50 ? '#F59E0B' : '#10B981'
      }
    }
  }, [challenge])

  return (
    <div style={{
      gridArea: 'watchlist',
      width: 200,
      background: '#0D1420',
      borderRight: '1px solid #1E2D40',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* WATCHLIST ITEMS */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {WATCHLIST.map(item => {
          const isSelected = selectedInstrument === item.id
          return (
            <div
              key={item.id}
              onClick={() => onInstrumentChange(item.id)}
              style={{
                padding: '8px 12px',
                borderLeft: isSelected ? '3px solid #2563EB' : '3px solid transparent',
                background: isSelected ? 'rgba(37,99,235,0.08)' : 'transparent',
                cursor: 'pointer',
                borderBottom: '1px solid #0F1923',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 11, color: '#F1F5F9' }}>{item.label}</span>
                <span ref={el => priceRefs.current[item.id] = el} style={{ fontSize: 11, fontWeight: 500 }}>
                  {new Intl.NumberFormat('en-IN').format(prices.current[item.id].toFixed(2))}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                <span style={{ fontSize: 10, color: '#475569' }}>{item.sub}</span>
                <span ref={el => changeRefs.current[item.id] = el} style={{ fontSize: 10 }}>
                  {changes.current[item.id].toFixed(2)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ACCOUNT SECTION */}
      <div style={{ borderTop: '1px solid #1E2D40', padding: 12 }}>
        <div style={{ fontSize: 9, textTransform: 'uppercase', color: '#475569', fontWeight: 700, marginBottom: 8 }}>
          ACCOUNT
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span style={{ color: '#94A3B8' }}>Balance</span>
          <span ref={balanceRef} id="acct-balance" style={{ color: '#F1F5F9', fontWeight: 600 }}>
            {challenge ? formatINR(challenge.currentBalance) : '--'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span style={{ color: '#94A3B8' }}>Total P&L</span>
          <span ref={pnlRef} id="acct-total-pnl" style={{ fontWeight: 600, color: (challenge?.totalPnl || 0) >= 0 ? '#10B981' : '#EF4444' }}>
            {challenge ? (challenge.totalPnl >= 0 ? '+' : '') + formatINR(challenge.totalPnl) : '--'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 12 }}>
          <span style={{ color: '#94A3B8' }}>Day's P&L</span>
          <span ref={dailyRef} id="acct-daily-pnl" style={{ fontWeight: 600, color: (challenge?.dailyPnl || 0) >= 0 ? '#10B981' : '#EF4444' }}>
            {challenge ? (challenge.dailyPnl >= 0 ? '+' : '') + formatINR(challenge.dailyPnl) : '--'}
          </span>
        </div>

        <div style={{ fontSize: 9, textTransform: 'uppercase', color: '#475569', fontWeight: 700, marginBottom: 8 }}>
          RISK RULES
        </div>

        {/* Daily Loss */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94A3B8', marginBottom: 4 }}>
            <span>Daily Loss Limit</span>
            <span style={{ fontSize: 9 }}>{challenge?.dailyLossPct || 0}%</span>
          </div>
          <div style={{ height: 4, background: '#1E2D40', borderRadius: 2, overflow: 'hidden' }}>
            <div ref={dailyBarRef} id="progress-daily" style={{ height: '100%', width: (challenge?.dailyPnl < 0 ? Math.min(100, (Math.abs(challenge.dailyPnl) / (challenge.dailyLossLimitAmount || 1)) * 100) : 0) + '%', background: '#10B981', transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Max Drawdown */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94A3B8', marginBottom: 4 }}>
            <span>Max Drawdown</span>
            <span style={{ fontSize: 9 }}>{challenge?.drawdownPct || 0}% / {challenge?.maxDrawdown || 8}%</span>
          </div>
          <div style={{ height: 4, background: '#1E2D40', borderRadius: 2, overflow: 'hidden' }}>
            <div ref={ddBarRef} id="progress-drawdown" style={{ height: '100%', width: Math.min(100, ((challenge?.drawdownPct || 0) / (challenge?.maxDrawdown || 8)) * 100) + '%', background: '#10B981', transition: 'width 0.3s' }} />
          </div>
        </div>

      </div>
    </div>
  )
}

export default React.memo(WatchlistPanel)
