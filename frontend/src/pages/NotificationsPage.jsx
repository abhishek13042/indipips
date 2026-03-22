import { useState, useEffect } from 'react'
import { Bell, Trophy, XCircle, Wallet, CheckCircle, AlertTriangle, TrendingDown, Shield, Trash2, CheckCircle2, Loader2, Clock } from 'lucide-react'
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

const timeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (isNaN(date.getTime())) return 'Recently'
  if (mins < 1) return 'Just now'
  if (mins < 60) return mins + 'm ago'
  if (hours < 24) return hours + 'h ago'
  if (days === 1) return 'Yesterday'
  if (days < 7) return days + 'd ago'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [markingAll, setMarkingAll] = useState(false)
  
  const { showToast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  const markAllRead = async () => {
    setMarkingAll(true)
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      showToast('All marked as read')
    } catch (err) {
      showToast('Failed to mark all as read', 'error')
    } finally {
      setMarkingAll(false)
    }
  }

  const deleteNotification = async (e, id) => {
    e.stopPropagation()
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
      showToast('Notification deleted')
    } catch (err) {
      showToast('Failed to delete', 'error')
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'CHALLENGE_PASSED': return { icon: <Trophy size={20} />, color: colors.success }
      case 'CHALLENGE_FAILED': return { icon: <XCircle size={20} />, color: colors.danger }
      case 'PAYOUT_APPROVED': return { icon: <Wallet size={20} />, color: colors.accent }
      case 'PAYOUT_TRANSFERRED': return { icon: <CheckCircle size={20} />, color: colors.success }
      case 'DAILY_LOSS_WARNING': return { icon: <AlertTriangle size={20} />, color: colors.warning }
      case 'DRAWDOWN_WARNING': return { icon: <TrendingDown size={20} />, color: colors.danger }
      case 'KYC_VERIFIED': return { icon: <Shield size={20} />, color: colors.success }
      default: return { icon: <Bell size={20} />, color: colors.accent }
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.isRead
    if (filter === 'challenges') return n.type?.includes('CHALLENGE') || n.type?.includes('LOSS') || n.type?.includes('DRAWDOWN')
    if (filter === 'payouts') return n.type?.includes('PAYOUT')
    return true
  })

  if (loading) return null

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '240px', paddingTop: '64px', minHeight: '100vh', padding: '32px' }}>
        <TopBar />
        
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Notifications</h1>
              <p style={{ fontSize: '16px', color: colors.text2 }}>Past updates and alerts from your trading activity</p>
            </div>
            <button 
              onClick={markAllRead} 
              disabled={markingAll || notifications.every(n => n.isRead)}
              style={{ background: 'none', border: 'none', color: colors.accent, fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: notifications.every(n => n.isRead) ? 0.5 : 1 }}
            >
              {markingAll ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Mark all as read
            </button>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '16px' }}>
            {['all', 'unread', 'challenges', 'payouts'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: 'none', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                  color: filter === f ? 'white' : colors.text3,
                  backgroundColor: filter === f ? colors.surface2 : 'transparent',
                  textTransform: 'capitalize'
                }}
              >
                {f} {f === 'unread' && notifications.filter(n => !n.isRead).length > 0 && `(${notifications.filter(n => !n.isRead).length})`}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '16px', overflow: 'hidden' }}>
            {filteredNotifications.length === 0 ? (
              <div style={{ padding: '80px 24px', textAlign: 'center' }}>
                <Bell size={48} color={colors.text3} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>No notifications found</h3>
                <p style={{ color: colors.text3, fontSize: '14px' }}>Important updates about your account will appear here.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const { icon, color } = getIcon(n.type)
                return (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    style={{
                      padding: '20px 24px',
                      display: 'flex',
                      gap: '20px',
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor: n.isRead ? 'transparent' : 'rgba(37,99,235,0.03)',
                      borderLeft: n.isRead ? '4px solid transparent' : `4px solid ${colors.accent}`,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.surface2 }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = n.isRead ? 'transparent' : 'rgba(37,99,235,0.03)' }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, flexShrink: 0 }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: n.isRead ? 600 : 'bold', color: n.isRead ? colors.text2 : 'white' }}>{n.title}</h4>
                        <span style={{ fontSize: '12px', color: colors.text3, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: colors.text3, lineHeight: '1.5', maxWidth: '90%' }}>{n.message}</p>
                    </div>

                    {!n.isRead && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent, position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}></div>
                    )}

                    <button
                      onClick={(e) => deleteNotification(e, n.id)}
                      style={{ background: 'none', border: 'none', color: colors.text3, cursor: 'pointer', padding: '8px', borderRadius: '8px', position: 'absolute', right: '12px', top: '12px', opacity: 0, transition: 'opacity 0.2s' }}
                      className="delete-btn"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
      <style>{`
        .delete-btn { opacity: 0; }
        div:hover > .delete-btn { opacity: 0.5; }
        .delete-btn:hover { opacity: 1 !important; color: ${colors.danger} !important; background-color: rgba(239,68,68,0.1) !important; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default NotificationsPage
