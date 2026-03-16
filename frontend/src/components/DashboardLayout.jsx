import { useNavigate, useLocation } from 'react-router-dom'

function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const navItems = [
    { label: '📊 Dashboard', path: '/dashboard' },
    { label: '🏆 Challenges', path: '/dashboard/challenges' },
    { label: '👤 Profile', path: '/dashboard/profile' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>

      {/* Sidebar */}
      <aside style={{
        width: '240px',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div>
          {/* Logo */}
          <div style={{ padding: '0 20px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px', height: '36px', backgroundColor: '#22c55e', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontWeight: 900, fontSize: '14px', color: 'white' }}>IP</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '18px', color: '#111827' }}>Indipips</span>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: location.pathname === item.path ? 700 : 500,
                  color: location.pathname === item.path ? '#111827' : '#6b7280',
                  backgroundColor: location.pathname === item.path ? '#f3f4f6' : 'transparent',
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div style={{ padding: '0 12px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              color: '#ef4444',
              backgroundColor: 'transparent',
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
        {children}
      </main>

    </div>
  )
}

export default DashboardLayout