import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Wallet,
  Shield,
  Link as LinkIcon,
  Bell,
  Trophy,
  User,
  Monitor,
  LogOut
} from 'lucide-react'
import useAuthStore from '../../stores/authStore'

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

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'terminal', label: 'Terminal', icon: Monitor, path: '/terminal' },
  { id: 'challenges', label: 'My Challenges', icon: TrendingUp, path: '/challenges' },
  { id: 'buy-challenge', label: 'Buy Challenge', icon: ShoppingCart, path: '/buy-challenge' },
  { id: 'payouts', label: 'Payouts', icon: Wallet, path: '/payouts' },
  { id: 'kyc', label: 'KYC', icon: Shield, path: '/kyc' },
  { id: 'broker', label: 'Broker', icon: LinkIcon, path: '/broker' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
]

const Sidebar = () => {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const userInitials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U'

  // Assuming broker connection logic might rely on user data or a separate store,
  // we'll default it to disconnected if brokerAccessToken is not present
  const isBrokerConnected = !!user?.brokerAccessToken

  return (
    <div style={{
      width: '240px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      backgroundColor: colors.surface,
      borderRight: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* TOP SECTION */}
      <div style={{
        padding: '24px 20px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.text} 100%)`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          IP
        </div>
        <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
          Indipips
        </span>
      </div>

      {/* NAVIGATION LINKS */}
      <div style={{
        flex: 1,
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        overflowY: 'auto'
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: isActive ? 'rgba(37,99,235,0.15)' : 'transparent',
                color: isActive ? colors.accent : colors.text2,
                borderLeft: isActive ? `3px solid ${colors.accent}` : '3px solid transparent',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#131D2E'
                  e.currentTarget.style.color = 'white'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = colors.text2
                }
              }}
            >
              <div style={{ position: 'relative' }}>
                <item.icon size={20} />
                {/* Badges */}
                {item.id === 'kyc' && user?.kycStatus !== 'VERIFIED' && (
                  <div style={{
                    position: 'absolute', top: '-2px', right: '-2px',
                    width: '8px', height: '8px', backgroundColor: colors.danger,
                    borderRadius: '50%', border: `2px solid ${colors.surface}`
                  }} />
                )}
                {item.id === 'broker' && !isBrokerConnected && (
                  <div style={{
                    position: 'absolute', top: '-2px', right: '-2px',
                    width: '8px', height: '8px', backgroundColor: colors.warning,
                    borderRadius: '50%', border: `2px solid ${colors.surface}`
                  }} />
                )}
                {item.id === 'notifications' && (
                  <div style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    backgroundColor: colors.danger, color: 'white',
                    fontSize: '9px', fontWeight: 'bold', minWidth: '14px', height: '14px',
                    borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${colors.surface}`
                  }}>
                    3
                  </div>
                )}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</span>
            </div>
          )
        })}
      </div>

      {/* BOTTOM SECTION */}
      <div style={{
        borderTop: `1px solid ${colors.border}`,
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: colors.accent,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {userInitials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.fullName}
              </div>
              <div style={{ color: colors.text2, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        <div
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            color: colors.danger,
            transition: 'background-color 0.2s',
            marginLeft: '-12px',
            marginRight: '-12px',
            width: 'calc(100% + 24px)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={20} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Logout</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
