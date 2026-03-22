import React, { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const INSTRUMENTS = [
  { id: 'NIFTY', label: 'NIFTY 50', tvSymbol: 'NSE:NIFTY' },
  { id: 'BANKNIFTY', label: 'BANKNIFTY', tvSymbol: 'NSE:BANKNIFTY' },
  { id: 'MIDCAPNIFTY', label: 'MIDCAP', tvSymbol: 'NSE:MIDCPNIFTY' },
  { id: 'FINNIFTY', label: 'FINNIFTY', tvSymbol: 'NSE:FINNIFTY' },
]

const formatINR = (rupees) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(rupees)
}

const TopBar = ({ selectedInstrument, onInstrumentChange, challenge, marketStatus }) => {
  const navigate = useNavigate()
  
  const priceRef = useRef(null)
  const changeRef = useRef(null)
  const clockRef = useRef(null)
  const pnlBadgeRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => {
      if (clockRef.current) {
        const ist = new Date(Date.now() + 5.5 * 3600000)
        clockRef.current.textContent = ist.toISOString().split('T')[1].substring(0, 8) + ' IST'
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Sync PNL ref directly on challenge mutation without tracking it as an effect dependency cleanly
  useEffect(() => {
    if (pnlBadgeRef.current && challenge) {
      const pnlRupees = (challenge.totalPnl || 0) / 100
      pnlBadgeRef.current.textContent = (pnlRupees >= 0 ? '+' : '') + formatINR(pnlRupees)
      pnlBadgeRef.current.style.color = pnlRupees >= 0 ? '#10B981' : '#EF4444'
    }
  }, [challenge?.totalPnl])

  return (
    <div style={{
      gridArea: 'topbar',
      background: '#0D1420',
      borderBottom: '1px solid #1E2D40',
      height: 48,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 16,
      zIndex: 100
    }}>
      {/* LEFT SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 24, height: 24, background: '#2563EB',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 10, borderRadius: 6
        }}>
          IP
        </div>
        <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>Indipips</div>
        <div style={{ width: 1, height: 24, background: '#1E2D40', margin: '0 8px' }} />
      </div>

      {/* INSTRUMENT TABS */}
      <div style={{ display: 'flex', gap: 4 }}>
        {INSTRUMENTS.map(inst => {
          const isActive = selectedInstrument === inst.id
          return (
            <button
              key={inst.id}
              onClick={() => onInstrumentChange(inst.id, inst.tvSymbol)}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
                background: isActive ? 'rgba(37,99,235,0.2)' : 'transparent',
                color: isActive ? '#2563EB' : '#94A3B8',
                border: isActive ? '1px solid rgba(37,99,235,0.4)' : '1px solid transparent',
                outline: 'none',
                fontWeight: isActive ? 600 : 400
              }}
            >
              {inst.label}
            </button>
          )
        })}
      </div>

      {/* LIVE PRICE DISPLAY */}
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <span ref={priceRef} id="topbar-live-price" style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginLeft: 12 }}>
          --,---.--
        </span>
        <span ref={changeRef} id="topbar-live-change" style={{ fontSize: 12, marginLeft: 6 }}>
          --%
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* RIGHT SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Challenge name pill */}
        <div style={{
          background: 'rgba(245,158,11,0.1)',
          color: '#F59E0B',
          border: '1px solid rgba(245,158,11,0.3)',
          padding: '4px 10px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600
        }}>
          {challenge?.planName || 'No Active Challenge'}
        </div>

        {/* Total P&L badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span style={{ color: '#94A3B8' }}>Net P&L:</span>
          <span ref={pnlBadgeRef} style={{ fontWeight: 600 }}>--</span>
        </div>

        {/* Market Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: marketStatus?.isOpen ? '#10B981' : '#EF4444',
            boxShadow: marketStatus?.isOpen ? '0 0 8px rgba(16,185,129,0.5)' : 'none'
          }} />
          <span style={{ fontSize: 11, color: marketStatus?.isOpen ? '#10B981' : '#EF4444', fontWeight: 600 }}>
            {marketStatus?.isOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: '#1E2D40' }} />

        {/* IST Clock */}
        <div ref={clockRef} style={{ fontFamily: 'monospace', fontSize: 12, color: '#94A3B8' }}>
          --:--:-- IST
        </div>

        {/* Buttons */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent',
            color: '#94A3B8',
            border: '1px solid #1E2D40',
            borderRadius: 6,
            padding: '4px 12px',
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          &larr; Dashboard
        </button>
        
        <button
          onClick={() => window.alert('Shortcuts:\nB: Buy\nS: Sell\n1-4: Switch Instruments\nESC: Close Modals')}
          style={{
            background: '#131D2E',
            color: '#F1F5F9',
            border: '1px solid #1E2D40',
            borderRadius: 6,
            width: 26, height: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          ?
        </button>
      </div>
    </div>
  )
}

export default React.memo(TopBar)
