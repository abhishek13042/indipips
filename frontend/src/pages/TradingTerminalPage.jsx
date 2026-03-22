import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import api from '../api'
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

const getLotSize = (instrument) => {
  if (instrument === 'NIFTY') return 50
  if (instrument === 'BANKNIFTY') return 15
  return 1
}

const TradingTerminalPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [challenge, setChallenge] = useState({ id: id || 'default' })
  const [positions, setPositions] = useState([])
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderStatus, setOrderStatus] = useState('idle')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [bottomTab, setBottomTab] = useState('trade')
  const [alertMsg, setAlertMsg] = useState(null)
  
  const [orderPanel, setOrderPanel] = useState({
    instrument: 'NIFTY',
    type: 'BUY',
    lots: 1,
    price: 22000.50
  })

  const showToast = (message, type) => {
    setAlertMsg({ message, type })
    setTimeout(() => setAlertMsg(null), 3000)
  }

  const handleRiskEvent = (event) => {
    console.warn('Risk Event:', event)
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket']
    })

    // Authenticate with JWT to join user:{userId} room
    // The backend handles this automatically using handshake.auth.token !
    
    // Listen for order confirmations
    socket.on('order:confirmed', (data) => {
      setOrderLoading(false)
      setOrderStatus('idle')

      if (data.status === 'CONFIRMED') {
        // Order opened successfully
        showToast(data.message, 'success')
        
        // Add to positions list
        setPositions((prev) => [data.trade, ...prev])
        
        // Switch to positions tab
        setBottomTab('positions')
        
      } else if (data.status === 'CLOSED') {
        // Position closed
        showToast(data.message, data.trade.pnl >= 0 ? 'success' : 'warning')
        
        // Remove from positions
        setPositions((prev) => prev.filter((p) => p.id !== data.trade.id))
        
        // Update challenge P&L
        if (data.challenge) {
          setChallenge((prev) => ({
            ...prev,
            ...data.challenge,
          }))
        }
        
        // Handle risk events
        if (data.riskEvents?.length > 0) {
          data.riskEvents.forEach((event) => {
            handleRiskEvent(event)
          })
        }
      }
    })

    socket.on('order:failed', (data) => {
      setOrderLoading(false)
      setOrderStatus('idle')
      showToast(data.message, 'error')
      setPaymentLoading(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const handlePlaceOrder = async () => {
    setOrderLoading(true)
    setOrderStatus('processing')
    
    try {
      const res = await api.post(
        '/trades/open',
        {
          challengeId: challenge.id,
          instrument: orderPanel.instrument,
          tradeType: orderPanel.type,
          quantity: orderPanel.lots * getLotSize(orderPanel.instrument),
          entryPrice: orderPanel.price,
          orderType: 'MARKET',
        }
      )
      
      if (res.data.success) {
        // 202 Accepted — queued!
        setOrderStatus('queued')
        showToast('Order Queued...', 'info')
        // Button stays disabled
        // Socket event will re-enable it
        // and show confirmation
      }
    } catch (err) {
      setOrderLoading(false)
      setOrderStatus('idle')
      showToast(
        err.response?.data?.message || 'Order failed', 
        'error'
      )
    }
  }

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', display: 'flex', color: 'white' }}>
      <div className="desktop-only"><Sidebar /></div>
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        
        {alertMsg && (
          <div style={{ backgroundColor: alertMsg.type === 'error' ? colors.danger : colors.success, padding: '12px', textAlign: 'center' }}>
            {alertMsg.message}
          </div>
        )}

        <div style={{ padding: '24px 32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Terminal</h2>

          <div style={{ backgroundColor: colors.surface, padding: '24px', borderRadius: '12px', maxWidth: '400px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: colors.text2 }}>Instrument</label>
              <select 
                value={orderPanel.instrument} 
                onChange={e => setOrderPanel({...orderPanel, instrument: e.target.value})}
                style={{ width: '100%', padding: '12px', backgroundColor: colors.bg, color: 'white', border: `1px solid ${colors.border}`, borderRadius: '8px' }}
              >
                <option value="NIFTY">NIFTY</option>
                <option value="BANKNIFTY">BANKNIFTY</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setOrderPanel({...orderPanel, type: 'BUY'})}
                style={{ flex: 1, padding: '12px', backgroundColor: orderPanel.type === 'BUY' ? colors.success : colors.bg, color: 'white', border: `1px solid ${orderPanel.type === 'BUY' ? colors.success : colors.border}`, borderRadius: '8px', cursor: 'pointer' }}
              >
                BUY
              </button>
              <button 
                onClick={() => setOrderPanel({...orderPanel, type: 'SELL'})}
                style={{ flex: 1, padding: '12px', backgroundColor: orderPanel.type === 'SELL' ? colors.danger : colors.bg, color: 'white', border: `1px solid ${orderPanel.type === 'SELL' ? colors.danger : colors.border}`, borderRadius: '8px', cursor: 'pointer' }}
              >
                SELL
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: colors.text2 }}>Lots</label>
              <input 
                type="number" 
                value={orderPanel.lots}
                onChange={e => setOrderPanel({...orderPanel, lots: Number(e.target.value)})}
                style={{ width: '100%', padding: '12px', backgroundColor: colors.bg, color: 'white', border: `1px solid ${colors.border}`, borderRadius: '8px' }}
              />
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={orderLoading || orderStatus === 'queued' || orderStatus === 'processing'}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: colors.accent,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: (orderLoading || orderStatus === 'queued') ? 'not-allowed' : 'pointer',
                opacity: (orderLoading || orderStatus === 'queued') ? 0.7 : 1
              }}
            >
              {orderStatus === 'queued' ? 'Processing...' : `Place ${orderPanel.type} Market Order`}
            </button>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: colors.gold }}>Open Positions ({positions.length})</h3>
            {positions.map(pos => (
              <div key={pos.id} style={{ backgroundColor: colors.surface, padding: '16px', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{pos.instrument}</div>
                  <div style={{ fontSize: '13px', color: pos.tradeType === 'BUY' ? colors.success : colors.danger }}>{pos.tradeType} • {pos.quantity} Qty @ {pos.entryPrice}</div>
                </div>
                <div style={{ fontWeight: 'bold', color: pos.pnl >= 0 ? colors.success : colors.danger }}>
                  {pos.pnl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

export default TradingTerminalPage
