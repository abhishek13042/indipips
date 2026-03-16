import { useNavigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }
  const navItems = [
    { label: '📊', name: 'Dashboard', path: '/dashboard' },
    { label: '🏆', name: 'Challenges', path: '/dashboard/challenges' },
    { label: '🎫', name: 'Certificates', path: '/dashboard/certificates' },
    { label: '🎁', name: 'Rewards', path: '/dashboard/rewards' },
    { label: '🛡️', name: 'KYC', path: '/dashboard/kyc' },
    { label: '👤', name: 'Profile', path: '/dashboard/profile' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fdfdff', fontFamily: "'Inter', sans-serif" }}>

      {/* Sidebar - Indipips Bespoke "Indigo-Glass" */}
      <aside style={{
        width: '84px',
        background: 'linear-gradient(180deg, #312e81 0%, #1e1b4b 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '28px 0',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxShadow: '4px 0 24px rgba(31, 46, 129, 0.15)',
        zIndex: 50
      }}>
        {/* Logo Icon - Bespoke Glass Style */}
        <div 
          onClick={() => navigate('/')}
          style={{
            width: '42px', height: '42px', 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            marginBottom: '44px', transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          <span style={{ fontWeight: 900, fontSize: '13px', color: 'white', letterSpacing: '1px' }}>IP</span>
        </div>

        {/* Nav Links - Glass Buttons */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.path} style={{ position: 'relative' }}>
                <button
                  onClick={() => navigate(item.path)}
                  title={item.name}
                  style={{
                    width: '48px', height: '48px', borderRadius: '14px', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.4)' : 'transparent',
                    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.5)',
                    fontSize: '20px', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: isActive ? 'blur(4px)' : 'none',
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                  }}
                  onMouseOver={(e) => !isActive && (e.currentTarget.style.color = 'white')}
                  onMouseOut={(e) => !isActive && (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
                >
                  {item.label}
                </button>
                {isActive && (
                  <div style={{
                    position: 'absolute', left: '-18px', top: '14px', width: '4px', height: '20px',
                    backgroundColor: '#10b981', borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 12px #10b981'
                  }} />
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '16px' }}>
          <button style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'rgba(255, 255, 255, 0.4)' }}>⚙️</button>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '40px', height: '40px', borderRadius: '10px',
              backgroundColor: 'rgba(244, 63, 94, 0.1)', border: 'none', 
              cursor: 'pointer', fontSize: '18px', color: '#fca5a5',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            🚪
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Indipips Accent Bar */}
        <div style={{ 
          height: '6px', 
          background: 'linear-gradient(90deg, #4338ca 0%, #10b981 100%)',
          width: '100%'
        }} />

        <main style={{ padding: '40px 60px', overflowY: 'auto', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout