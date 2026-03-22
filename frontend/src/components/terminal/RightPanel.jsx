import React, { useState, useRef, useEffect } from 'react'

const formatINR = (rupees) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(rupees)
}

const LOT_SIZES = {
  'NIFTY': 65,
  'BANKNIFTY': 30,
  'FINNIFTY': 60,
  'MIDCAPNIFTY': 50,
  'DEFAULT': 1,
}

const getLotSize = (instrument) => {
  const upper = instrument.toUpperCase()
  for (const [key, size] of Object.entries(LOT_SIZES)) {
    if (upper.startsWith(key)) return size
  }
  return LOT_SIZES.DEFAULT
}

const generateStrikes = (spot) => {
  const atm = Math.round(spot / 50) * 50
  const strikes = []
  for (let i = -10; i <= 10; i++) {
    strikes.push(atm + (i * 50))
  }
  return strikes
}

const getOptionPrice = (spot, strike, type, daysToExpiry) => {
  const intrinsic = type === 'CE' ? Math.max(0, spot - strike) : Math.max(0, strike - spot)
  const timeValue = Math.max(50, (Math.abs(spot - strike) * 0.1) + (daysToExpiry * 5))
  return intrinsic + timeValue
}

const RightPanel = ({ selectedInstrument, challenge, marketStatus, onPlaceOrder, orderLoading, orderStatus, lastOrderResult }) => {
  const [activeTab, setActiveTab] = useState('options') // 'options' | 'order'
  
  // Order State
  const lotSize = getLotSize(selectedInstrument)
  const [orderData, setOrderData] = useState({
    type: 'BUY',
    instrument: '',
    price: 0,
    lots: 1,
    quantity: lotSize,
    lotSize: lotSize,
    orderType: 'MARKET'
  })

  // Option Chain State
  const optionRefs = useRef({})
  const [strikes, setStrikes] = useState([])
  const [spot, setSpot] = useState(22419.95) // Base start

  // Sync lotsize on instrument change
  useEffect(() => {
    const ls = getLotSize(selectedInstrument)
    setOrderData(prev => ({
      ...prev,
      lotSize: ls,
      quantity: Math.max(ls, ls * prev.lots)
    }))
  }, [selectedInstrument])

  // Track Simulated Spot Prices Dynamically
  useEffect(() => {
    const updateOptions = () => {
      const livePrices = window.__indipips_live_prices || {}
      const currentSpot = livePrices[selectedInstrument] || 22419.95
      setSpot(currentSpot)
      
      const newStrikes = generateStrikes(currentSpot)
      // Only set strikes if they shifted significantly to avoid DOM thrashing
      if (!strikes.length || Math.abs(strikes[10] - currentSpot) > 100) {
        setStrikes(newStrikes)
      } else {
        // Update DOM prices directly using BlackScholes approx
        strikes.forEach(strike => {
          const cePrice = getOptionPrice(currentSpot, strike, 'CE', 6)
          const pePrice = getOptionPrice(currentSpot, strike, 'PE', 6)

          const ceRef = optionRefs.current[strike + '-CE']
          const peRef = optionRefs.current[strike + '-PE']

          if (ceRef) ceRef.textContent = '₹' + cePrice.toFixed(2)
          if (peRef) peRef.textContent = '₹' + pePrice.toFixed(2)
        })
      }
    }

    const timer = setInterval(updateOptions, 3000)
    // Run once immediately
    updateOptions()
    return () => clearInterval(timer)
  }, [selectedInstrument, strikes, marketStatus])

  const handleOptionClick = (type, strike, optionType, price) => {
    const instrument = selectedInstrument + '-' + optionType + '-' + strike
    const ls = getLotSize(selectedInstrument)
    
    setOrderData(prev => ({
      ...prev,
      type,
      instrument,
      price: price || 0,
      lots: 1,
      quantity: ls,
      lotSize: ls,
    }))
    setActiveTab('order')
  }

  // Derived Account
  const targetPctRef = useRef(null)
  const targetBarRef = useRef(null)
  const pnlProgressRef = useRef(null)

  useEffect(() => {
    if (challenge && targetPctRef.current && targetBarRef.current && pnlProgressRef.current) {
      const pct = challenge.profitTargetPct || 0
      const currentPnl = challenge.totalPnl || 0
      const target = challenge.profitTargetAmount || 0
      
      targetPctRef.current.textContent = pct + '%'
      targetBarRef.current.style.width = pct + '%'
      pnlProgressRef.current.textContent = `${formatINR(currentPnl)} / ${formatINR(target)}`
    }
  }, [challenge])

  const estimatedValue = (orderData.price > 0 ? orderData.price : spot) * orderData.quantity

  return (
    <div style={{
      gridArea: 'rightpanel',
      width: 300,
      background: '#0D1420',
      borderLeft: '1px solid #1E2D40',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* TAB HEADER */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1E2D40' }}>
        <div
          onClick={() => setActiveTab('options')}
          style={{
            flex: 1, textAlign: 'center', padding: 10, fontSize: 12, cursor: 'pointer',
            color: activeTab === 'options' ? '#2563EB' : '#94A3B8',
            borderBottom: activeTab === 'options' ? '2px solid #2563EB' : '2px solid transparent',
            background: activeTab === 'options' ? 'rgba(37,99,235,0.05)' : 'transparent'
          }}
        >
          Option Chain
        </div>
        <div
          onClick={() => setActiveTab('order')}
          style={{
            flex: 1, textAlign: 'center', padding: 10, fontSize: 12, cursor: 'pointer',
            color: activeTab === 'order' ? '#2563EB' : '#94A3B8',
            borderBottom: activeTab === 'order' ? '2px solid #2563EB' : '2px solid transparent',
            background: activeTab === 'order' ? 'rgba(37,99,235,0.05)' : 'transparent'
          }}
        >
          Order Panel
        </div>
      </div>

      {/* --- TAB 1: OPTION CHAIN --- */}
      {activeTab === 'options' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* HEADER ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', background: '#0A0F1A', fontSize: 9, color: '#94A3B8', textTransform: 'uppercase', padding: '6px 8px', position: 'sticky', top: 0, zIndex: 10 }}>
            <div>CALL</div>
            <div style={{ textAlign: 'center' }}>STRIKE</div>
            <div style={{ textAlign: 'right' }}>PUT</div>
          </div>

          <div style={{ background: 'rgba(37,99,235,0.05)', textAlign: 'center', fontSize: 11, color: '#2563EB', padding: 4 }}>
            Spot: {spot.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>

          {/* CHAIN */}
          {strikes.map((strike, idx) => {
            const isATM = strike === Math.round(spot / 50) * 50
            const cePrice = getOptionPrice(spot, strike, 'CE', 6)
            const pePrice = getOptionPrice(spot, strike, 'PE', 6)

            return (
              <div key={strike} style={{
                display: 'grid', gridTemplateColumns: '40% 20% 40%',
                background: isATM ? 'rgba(37,99,235,0.12)' : (idx % 2 === 0 ? '#0A0F1A' : '#0D1420'),
                borderLeft: isATM ? '2px solid #2563EB' : 'none',
                borderRight: isATM ? '2px solid #2563EB' : 'none'
              }}>
                {/* CALL */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => handleOptionClick('BUY', strike, 'CE', cePrice)} style={{ background: 'rgba(37,99,235,0.2)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 3, padding: '2px 6px', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>B</button>
                    <button onClick={() => handleOptionClick('SELL', strike, 'CE', cePrice)} style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 3, padding: '2px 6px', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>S</button>
                  </div>
                  <span ref={el => optionRefs.current[strike+'-CE'] = el} style={{ fontSize: 11, color: '#F1F5F9', fontWeight: 500 }}>
                    {'₹' + cePrice.toFixed(2)}
                  </span>
                </div>

                {/* STRIKE */}
                <div style={{ textAlign: 'center', fontSize: isATM ? 12 : 11, fontWeight: isATM ? 700 : 400, color: isATM ? '#F1F5F9' : '#94A3B8', padding: '6px 4px', borderLeft: '1px solid #1E2D40', borderRight: '1px solid #1E2D40' }}>
                  {strike.toLocaleString('en-IN')}
                </div>

                {/* PUT */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
                  <span ref={el => optionRefs.current[strike+'-PE'] = el} style={{ fontSize: 11, color: '#F1F5F9', fontWeight: 500 }}>
                    {'₹' + pePrice.toFixed(2)}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => handleOptionClick('BUY', strike, 'PE', pePrice)} style={{ background: 'rgba(37,99,235,0.2)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 3, padding: '2px 6px', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>B</button>
                    <button onClick={() => handleOptionClick('SELL', strike, 'PE', pePrice)} style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 3, padding: '2px 6px', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>S</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* --- TAB 2: ORDER PANEL --- */}
      {activeTab === 'order' && (
        <div style={{ flex: 1, padding: 14, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 12 }}>
            <button
              onClick={() => setOrderData(prev => ({...prev, type: 'BUY'}))}
              style={{ padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: orderData.type === 'BUY' ? '#10B981' : 'rgba(16,185,129,0.1)', color: orderData.type === 'BUY' ? 'white' : '#10B981' }}
            >BUY</button>
            <button
              onClick={() => setOrderData(prev => ({...prev, type: 'SELL'}))}
              style={{ padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: orderData.type === 'SELL' ? '#EF4444' : 'rgba(239,68,68,0.1)', color: orderData.type === 'SELL' ? 'white' : '#EF4444' }}
            >SELL</button>
          </div>

          <div style={{ background: '#131D2E', border: '1px solid #1E2D40', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Instrument</div>
            <div style={{ fontSize: 12, color: '#F1F5F9', fontWeight: 500 }}>{orderData.instrument || selectedInstrument}</div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Lots</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onClick={() => setOrderData(prev => ({ ...prev, lots: Math.max(1, prev.lots - 1), quantity: Math.max(prev.lotSize, (prev.lots - 1) * prev.lotSize) }))}
                style={{ width: 32, height: 32, background: '#131D2E', border: '1px solid #1E2D40', borderRadius: 6, color: '#F1F5F9', fontSize: 16, cursor: 'pointer' }}
              >-</button>
              <input
                type="number" min="1" max="100" value={orderData.lots}
                onChange={(e) => { const lots = Math.max(1, parseInt(e.target.value) || 1); setOrderData(prev => ({ ...prev, lots, quantity: lots * prev.lotSize })) }}
                style={{ flex: 1, background: '#131D2E', border: '1px solid #1E2D40', borderRadius: 6, padding: '6px 10px', color: '#F1F5F9', fontSize: 13, textAlign: 'center', outline: 'none' }}
              />
              <button
                onClick={() => setOrderData(prev => ({ ...prev, lots: Math.min(100, prev.lots + 1), quantity: Math.min(100 * prev.lotSize, (prev.lots + 1) * prev.lotSize) }))}
                style={{ width: 32, height: 32, background: '#131D2E', border: '1px solid #1E2D40', borderRadius: 6, color: '#F1F5F9', fontSize: 16, cursor: 'pointer' }}
              >+</button>
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>{orderData.quantity} units ({orderData.lotSize} per lot)</div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Order Type</label>
            <select
              value={orderData.orderType}
              onChange={(e) => setOrderData(prev => ({...prev, orderType: e.target.value}))}
              style={{ width: '100%', background: '#131D2E', border: '1px solid #1E2D40', borderRadius: 8, padding: '8px 12px', color: '#F1F5F9', fontSize: 12, outline: 'none' }}
            >
              <option value="MARKET">MARKET</option>
              <option value="LIMIT">LIMIT</option>
              <option value="SL">Stop Loss</option>
            </select>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, color: '#475569', display: 'block', marginBottom: 4 }}>Price (₹)</label>
            <input
              type="number" step="0.05" value={orderData.price}
              onChange={(e) => setOrderData(prev => ({...prev, price: parseFloat(e.target.value)}))}
              disabled={orderData.orderType === 'MARKET'}
              style={{ width: '100%', background: orderData.orderType === 'MARKET' ? '#0A0F1A' : '#131D2E', border: '1px solid #1E2D40', borderRadius: 8, padding: '8px 12px', color: orderData.orderType === 'MARKET' ? '#475569' : '#F1F5F9', fontSize: 13, outline: 'none' }}
            />
            {orderData.orderType === 'MARKET' && <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Executed at best available price</div>}
          </div>

          {/* SUMMARY */}
          <div style={{ background: '#131D2E', border: '1px solid #1E2D40', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>
              <span>Est. Value</span><span style={{ color: '#F1F5F9' }}>{formatINR(estimatedValue)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8' }}>
              <span>Margin Used</span><span style={{ color: '#F1F5F9' }}>{formatINR(estimatedValue)}</span>
            </div>
            <div style={{ borderTop: '1px solid #1E2D40', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: '#94A3B8' }}>Account Balance</span>
              <span style={{ color: '#10B981' }}>{formatINR((challenge?.currentBalance || 0) / 100)}</span>
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={() => onPlaceOrder(orderData)}
            disabled={orderLoading || !challenge || challenge.status !== 'ACTIVE' || !marketStatus?.isOpen}
            style={{
              width: '100%', height: 44, background: orderLoading ? '#1E2D40' : (orderData.type === 'BUY' ? '#10B981' : '#EF4444'),
              border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600,
              cursor: orderLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s', opacity: (orderLoading || !marketStatus?.isOpen || challenge?.status !== 'ACTIVE') ? 0.5 : 1
            }}
          >
            {orderLoading ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
                {orderStatus === 'queued' ? 'Processing...' : 'Submitting...'}
              </>
            ) : (
              orderData.type === 'BUY' ? 'Buy at Market →' : 'Sell at Market →'
            )}
          </button>

          {!marketStatus?.isOpen && <div style={{ textAlign: 'center', fontSize: 11, color: '#EF4444', marginTop: 6 }}>Market closed — opens 9:15 AM IST Mon-Fri</div>}
          {challenge?.status === 'SUSPENDED' && <div style={{ textAlign: 'center', fontSize: 11, color: '#EF4444', marginTop: 6 }}>⚠️ Trading suspended — daily loss limit reached</div>}

          {/* ORDER RESULT */}
          {lastOrderResult && (
            <div style={{
              marginTop: 10, padding: '10px 12px', borderRadius: 8,
              background: lastOrderResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${lastOrderResult.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              fontSize: 11, color: lastOrderResult.success ? '#10B981' : '#EF4444'
            }}>
              {lastOrderResult.message}
            </div>
          )}

          {/* PROGRESS */}
          <div style={{ borderTop: '1px solid #1E2D40', paddingTop: 10, marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94A3B8', marginBottom: 4 }}>
              <span>Profit Target</span><span ref={targetPctRef}>--</span>
            </div>
            <div style={{ height: 4, background: '#1E2D40', borderRadius: 2, overflow: 'hidden' }}>
              <div ref={targetBarRef} style={{ height: '100%', width: '0%', background: 'linear-gradient(90deg,#2563EB,#10B981)', transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>
              <span ref={pnlProgressRef}>₹0 / ₹0</span><span> target</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(RightPanel)
