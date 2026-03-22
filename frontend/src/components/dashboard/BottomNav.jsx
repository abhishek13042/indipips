import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, ShoppingCart, Wallet, User } from 'lucide-react'

const colors = {
  bg: '#060B14',
  surface: '#0D1420',
  surface2: '#0F1923',
  border: '#1E2D40',
  accent: '#2563EB',
  text: '#F1F5F9',
  text2: '#94A3B8'
}

const navItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'challenges', label: 'Trades', icon: TrendingUp, path: '/challenges' },
  { id: 'buy', label: 'Buy', icon: ShoppingCart, path: '/buy-challenge' },
  { id: 'payouts', label: 'Payouts', icon: Wallet, path: '/payouts' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
]

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="mobile-only" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: colors.surface,
      borderTop: `1px solid ${colors.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 16px',
      paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
      zIndex: 50
    }}>
      {/* We'll use a media query trick in DashboardPage or index.css to hide this above 768px, 
          but since we're using inline styles, we can just rely on standard css classes where strictly necessary, 
          though the prompt says NO Tailwind classes. So I will control visibility from the parent layout component! */}
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path)
        return (
          <div
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px',
              color: isActive ? colors.accent : colors.text2,
              cursor: 'pointer',
              flex: 1
            }}
          >
            <item.icon size={20} />
            <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 500 }}>
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default BottomNav
