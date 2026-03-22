import React, { useRef, useEffect } from 'react'

const formatINR = (rupees) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(rupees)
}

const PositionsBar = ({ positions, onExitPosition }) => {
  const positionPnlRefs = useRef({})

  // Unrealized P&L updater tracking physical variables mapped on Window globally synced via WatchList
  useEffect(() => {
    const updatePnls = () => {
      const livePrices = window.__indipips_live_prices || {}
      
      positions.forEach(pos => {
        const instrument = pos.instrument.split('-')[0] // NIFTY from NIFTY-CE-22500
        const currentPrice = livePrices[instrument] || pos.entryPrice / 100

        const priceDiff = pos.tradeType === 'BUY'
          ? (currentPrice - (pos.entryPrice / 100))
          : ((pos.entryPrice / 100) - currentPrice)
        
        const unrealized = priceDiff * pos.quantity

        const ref = positionPnlRefs.current[pos.id]
        if (ref) {
          ref.textContent = (unrealized >= 0 ? '+' : '') + formatINR(unrealized)
          ref.style.color = unrealized >= 0 ? '#10B981' : '#EF4444'
        }
      })
    }

    const timer = setInterval(updatePnls, 2000)
    return () => clearInterval(timer)
  }, [positions])

  const totalUnrealizedFallback = React.useMemo(() => {
    // Initial calculate before loop kicks in natively mapping static values securely preventing NaN limits
    return positions.reduce((sum, pos) => {
      return sum + 0
    }, 0)
  }, [positions])

  return (
    <div style={{
      gridArea: 'positions',
      background: '#0A0F1A',
      borderTop: '1px solid #1E2D40',
      height: 180,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* TAB ROW */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #1E2D40', padding: '0 16px', height: 40
      }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ color: '#2563EB', fontSize: 13, fontWeight: 600, borderBottom: '2px solid #2563EB', padding: '10px 0', cursor: 'pointer' }}>
            Positions ({positions.length})
          </div>
          <div style={{ color: '#475569', fontSize: 13, fontWeight: 500, padding: '10px 0', cursor: 'pointer' }}>
            Today's Trades
          </div>
          <div style={{ color: '#475569', fontSize: 13, fontWeight: 500, padding: '10px 0', cursor: 'pointer' }}>
            Order Book
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8' }}>
          Total Unrealized: <span style={{ color: '#94A3B8' }} id="global-unrealized-pnl">--</span>
        </div>
      </div>

      {/* POSITIONS TABLE */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* HEADER */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 80px 60px 100px 100px 120px 80px',
          alignItems: 'center', padding: '6px 16px', background: '#0D1420',
          fontSize: 9, color: '#475569', fontWeight: 700, textTransform: 'uppercase',
          position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #1E2D40'
        }}>
          <div>Instrument</div>
          <div>Type</div>
          <div>Qty</div>
          <div>Entry</div>
          <div>LTP</div>
          <div>Unrlzd P&L</div>
          <div>Action</div>
        </div>

        {/* ROWS */}
        {positions.map(pos => (
          <div key={pos.id} style={{
            display: 'grid',
            gridTemplateColumns: '2fr 80px 60px 100px 100px 120px 80px',
            alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #0D1420',
            fontSize: 12, background: '#0D1420'
          }}>
            <div style={{ color: '#F1F5F9', fontWeight: 500, fontFamily: 'monospace' }}>
              {pos.instrument}
            </div>
            <div>
              <span style={{
                background: pos.tradeType === 'BUY' ? 'rgba(37,99,235,0.2)' : 'rgba(239,68,68,0.15)',
                color: pos.tradeType === 'BUY' ? '#2563EB' : '#EF4444',
                border: `1px solid ${pos.tradeType === 'BUY' ? 'rgba(37,99,235,0.4)' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 600
              }}>
                {pos.tradeType}
              </span>
            </div>
            <div style={{ color: '#94A3B8' }}>{pos.quantity}</div>
            <div style={{ color: '#F1F5F9' }}>{formatINR(pos.entryPrice / 100)}</div>
            <div style={{ color: '#94A3B8' }}>--</div>
            <div ref={el => positionPnlRefs.current[pos.id] = el} style={{ color: '#94A3B8', fontWeight: 500 }}>
              Calculating...
            </div>
            <div>
              <button
                onClick={() => onExitPosition(pos)}
                style={{
                  background: 'rgba(239,68,68,0.15)', color: '#EF4444',
                  border: '1px solid rgba(239,68,68,0.3)', borderRadius: 4,
                  padding: '4px 12px', fontSize: 10, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Exit
              </button>
            </div>
          </div>
        ))}

        {positions.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', fontSize: 12 }}>
            No open positions — place an order to start trading
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(PositionsBar)
