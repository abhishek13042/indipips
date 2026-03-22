import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { LayoutDashboard, Users, TrendingUp, Wallet, BarChart2, LogOut } from 'lucide-react'
import useAuthStore from '../../stores/authStore'

const AdminLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  
  const [time, setTime] = useState(new Date())
  
  // Role Protection
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    const currentUser = user || storedUser
    
    if (!currentUser?.role || !['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Market Status Logic (Mon-Fri 9:15-15:30 IST)
  const isMarketOpen = () => {
    const now = new Date()
    // Convert to IST
    const istOffset = 5.5 * 60 * 60000 // 5 hours 30 minutes
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
    const istDate = new Date(utc + istOffset)
    
    const day = istDate.getDay() // 0 = Sunday, 1 = Monday
    const hours = istDate.getHours()
    const minutes = istDate.getMinutes()
    const timeInMinutes = hours * 60 + minutes
    
    // Weekend check
    if (day === 0 || day === 6) return false
    
    // 9:15 = 555 mins, 15:30 = 930 mins
    if (timeInMinutes >= 555 && timeInMinutes <= 930) return true
    
    return false
  }
  
  const marketOpen = isMarketOpen()

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { name: 'Traders', icon: Users, path: '/admin/traders' },
    { name: 'Challenges', icon: TrendingUp, path: '/admin/challenges' },
    { name: 'Payouts', icon: Wallet, path: '/admin/payouts' },
    { name: 'Analytics', icon: BarChart2, path: '/admin/analytics' }
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#060B14', color: '#F1F5F9', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Sidebar */}
      <div style={{
        width: '240px',
        backgroundColor: '#0A0F1E',
        borderRight: '1px solid #1E2D40',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 40
      }}>
        {/* Logo Section */}
        <div style={{ padding: '24px', borderBottom: '1px solid #1E2D40', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#2563EB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            IP
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>Indipips Admin</div>
            <div style={{ fontSize: '10px', color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'inline-block', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', letterSpacing: '0.05em', marginTop: '4px' }}>
              ADMIN
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path !== '/admin' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: isActive ? '#F1F5F9' : '#94A3B8',
                  backgroundColor: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                  fontWeight: isActive ? '500' : '400',
                  transition: 'background-color 0.2s, color 0.2s',
                  position: 'relative'
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#F1F5F9'
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#94A3B8'
                }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '20px', backgroundColor: '#2563EB', borderRadius: '0 4px 4px 0' }} />
                )}
                <item.icon size={20} color={isActive ? '#2563EB' : 'currentColor'} />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Bottom Section */}
        <div style={{ padding: '24px', borderTop: '1px solid #1E2D40' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>
              Logged in as<br />
              <strong style={{ color: '#F1F5F9', fontSize: '14px', marginTop: '4px', display: 'block' }}>
                {user?.fullName || 'Admin User'}
              </strong>
            </div>
            
            <Link to="/dashboard" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              backgroundColor: '#131D2E',
              color: '#F1F5F9',
              borderRadius: '8px',
              fontSize: '14px',
              textDecoration: 'none',
              border: '1px solid #1E2D40'
            }}>
              Back to Platform
            </Link>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                backgroundColor: 'transparent',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: '24px', paddingLeft: '240px' }}>
        
        {/* TopBar */}
        <div style={{
          height: '64px',
          borderBottom: '1px solid #1E2D40',
          backgroundColor: '#060B14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <div>
            <span style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '500' }}>
              Admin Panel
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Market Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: marketOpen ? '#10B981' : '#EF4444'
              }} />
              <span style={{ color: '#94A3B8' }}>Market {marketOpen ? 'Open' : 'Closed'}</span>
            </div>

            {/* Live IST Time */}
            <div style={{ fontSize: '13px', color: '#94A3B8' }}>
              {time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit' })} IST
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '32px', flex: 1, overflowX: 'auto' }}>
          {children}
        </div>
        
      </div>

    </div>
  )
}

export default AdminLayout
