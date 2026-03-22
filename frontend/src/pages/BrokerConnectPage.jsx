import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Link, CheckCircle, AlertTriangle, ExternalLink, RefreshCw, XCircle, Info, ShieldCheck, Loader2 } from 'lucide-react'
import api from '../api'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import { useToast } from '../components/ui/Toast'

const colors = {
  bg: '#060B14',
  surface: '#0D1420',
  surface2: '#131D2E',
  border: '#1E2D40',
  accent: '#2563EB',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  text: '#F1F5F9',
  text2: '#94A3B8',
  text3: '#475569'
}

const BrokerConnectPage = () => {
  const [brokerStatus, setBrokerStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    fetchBrokerStatus()
    
    // Handle OAuth callbacks
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    
    if (connected === 'true') {
      showToast('Upstox connected successfully! 🎉')
      setSearchParams({}) // Clear params
    } else if (error) {
      showToast(error, 'error')
      setSearchParams({}) // Clear params
    }
  }, [])

  const fetchBrokerStatus = async () => {
    try {
      const res = await api.get('/broker/status')
      setBrokerStatus(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectUpstox = () => {
    // Redirect to backend OAuth endpoint which will redirect to Upstox
    window.location.href = `http://localhost:5000/api/v1/upstox/login`
  }

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure? This will stop all trade syncing.')) return
    setDisconnecting(true)
    try {
      await api.delete('/broker/disconnect')
      showToast('Broker disconnected')
      fetchBrokerStatus()
    } catch (err) {
      showToast('Failed to disconnect', 'error')
    } finally {
      setDisconnecting(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await api.post('/broker/sync')
      showToast('Trade sync initiated')
      fetchBrokerStatus()
    } catch (err) {
      showToast(err.response?.data?.message || 'Sync failed', 'error')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) return null

  const isConnected = brokerStatus?.isConnected

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '240px', paddingTop: '64px', minHeight: '100vh', padding: '32px' }}>
        <TopBar />
        
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Broker Connection</h1>
            <p style={{ fontSize: '16px', color: colors.text2 }}>Connect your broker to sync trades automatically</p>
          </div>

          {isConnected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Connected Card */}
              <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.success}`, borderRadius: '24px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
                    {/* Placeholder for Upstox Logo */}
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#6B3C9B', borderRadius: '4px', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>U</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>Upstox</h2>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: colors.success, backgroundColor: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px' }}>● CONNECTED</span>
                    </div>
                    <p style={{ fontSize: '14px', color: colors.text2 }}>Account: {brokerStatus.brokerAccountId || 'Verified Account'}</p>
                    <p style={{ fontSize: '12px', color: colors.text3, marginTop: '4px' }}>Last synced: {brokerStatus.lastSyncAt ? new Date(brokerStatus.lastSyncAt).toLocaleTimeString() : 'Just now'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={handleSync} 
                    disabled={syncing}
                    style={{ background: 'none', border: `1px solid ${colors.border}`, color: 'white', padding: '10px 18px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {syncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />} Sync Now
                  </button>
                  <button 
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    style={{ background: 'none', border: `1px solid rgba(239,68,68,0.3)`, color: colors.danger, padding: '10px 18px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Stats & Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                 <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '20px' }}>
                    <p style={{ fontSize: '12px', color: colors.text2, marginBottom: '8px' }}>Trades Synced Today</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{brokerStatus.tradesCount || 0}</p>
                 </div>
                 <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '20px' }}>
                    <p style={{ fontSize: '12px', color: colors.text2, marginBottom: '8px' }}>Open Positions</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: colors.success }}>{brokerStatus.openPositionsCount || 0}</p>
                 </div>
                 <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '20px' }}>
                    <p style={{ fontSize: '12px', color: colors.text2, marginBottom: '8px' }}>Broker User ID</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{brokerStatus.brokerUserId || 'N/A'}</p>
                 </div>
              </div>

              <div style={{ backgroundColor: 'rgba(16,185,129,0.05)', borderLeft: `4px solid ${colors.success}`, padding: '24px', borderRadius: '12px', display: 'flex', gap: '16px' }}>
                 <ShieldCheck color={colors.success} size={24} style={{ flexShrink: 0 }} />
                 <div>
                    <h4 style={{ color: 'white', fontWeight: 'bold', fontSize: '15px', marginBottom: '8px' }}>Secure READ-ONLY Connection</h4>
                    <p style={{ color: colors.text2, fontSize: '13px', lineHeight: '1.6' }}>
                      Indipips only has read-access to your trade and order data. We cannot place orders, transfer funds, or modify any settings on your Upstox account.
                    </p>
                 </div>
              </div>

            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                {/* Upstox Card */}
                <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#6B3C9B', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>U</div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: colors.success, backgroundColor: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px' }}>RECOMMENDED</span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Upstox</h2>
                  <p style={{ fontSize: '14px', color: colors.text2, marginBottom: '24px', flex: 1 }}>Indipips' primary integration partner. Features 1-click ultra-fast OAuth syncing with zero latency.</p>
                  
                  <ul style={{ padding: 0, margin: '0 0 32px 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li style={{ fontSize: '13px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color={colors.success} /> Secure OAuth connection</li>
                    <li style={{ fontSize: '13px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color={colors.success} /> Real-time trade sync</li>
                    <li style={{ fontSize: '13px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color={colors.success} /> All F&O instruments</li>
                  </ul>

                  <button 
                    onClick={handleConnectUpstox}
                    style={{ backgroundColor: colors.accent, color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    Connect Upstox <ExternalLink size={18} />
                  </button>
                </div>

                {/* Zerodha Card */}
                <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '32px', opacity: 0.6, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#397BDD', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>Z</div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: colors.warning, backgroundColor: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '4px' }}>COMING SOON</span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Zerodha Kite</h2>
                  <p style={{ fontSize: '14px', color: colors.text2, marginBottom: '24px', flex: 1 }}>Integration for India's largest broker. We're currently undergoing security audits for Kite integration.</p>
                  
                  <button disabled style={{ backgroundColor: colors.surface2, color: colors.text3, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'not-allowed' }}>
                    Coming Soon
                  </button>
                </div>

              </div>

              {/* How it works */}
              <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '32px' }}>How it works</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: colors.surface2, color: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
                    <h4 style={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>Click Connect</h4>
                    <p style={{ color: colors.text2, fontSize: '13px', lineHeight: '1.5' }}>You'll be redirected to Upstox's secure login portal to authenticate your session.</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: colors.surface2, color: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                    <h4 style={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>Authorize Access</h4>
                    <p style={{ color: colors.text2, fontSize: '13px', lineHeight: '1.5' }}>Grant Indipips read-only access to view your orders and trades. Indipips cannot place orders.</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: colors.surface2, color: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
                    <h4 style={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>Auto Sync</h4>
                    <p style={{ color: colors.text2, fontSize: '13px', lineHeight: '1.5' }}>Your trades will begin syncing automatically. You can always disconnect with one click.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default BrokerConnectPage
