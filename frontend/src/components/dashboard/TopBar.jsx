import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
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

const TopBar = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [timeState, setTimeState] = useState(new Date())

  const firstName = user?.fullName?.split(' ')[0] || 'Trader'

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeState(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Calculate greeting and market status in IST
  // Since new Date() already uses local time (if system is IST), let's explicitly format it as IST
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  })
  
  const formattedTimeStr = formatter.format(timeState) // e.g. "09:15:30"
  let hour = parseInt(formattedTimeStr.split(':')[0], 10)
  
  let greeting = 'Good morning'
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon'
  else if (hour >= 17 && hour < 21) greeting = 'Good evening'
  else if (hour >= 21 || hour < 5) greeting = 'Good night'

  // Time string like "09:15 AM IST"
  const timeFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
  const istTimeDisplay = `${timeFormatter.format(timeState)} IST`

  // Market status logic (9:15 AM to 3:30 PM Weekdays IST)
  const isWeekday = timeState.getDay() >= 1 && timeState.getDay() <= 5
  const minutesSinceMidnight = hour * 60 + parseInt(formattedTimeStr.split(':')[1], 10)
  const isMarketOpenTime = minutesSinceMidnight >= (9 * 60 + 15) && minutesSinceMidnight < (15 * 60 + 30)
  
  const isMarketOpen = isWeekday && isMarketOpenTime

  return (
    <div style={{
      height: '64px',
      backgroundColor: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* LEFT: Greeting */}
      <div style={{ fontSize: '18px', color: 'white', fontWeight: 600 }}>
        {greeting}, {firstName}! 👋
      </div>

      {/* RIGHT: Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Market Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '999px',
          backgroundColor: isMarketOpen ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${isMarketOpen ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isMarketOpen ? colors.success : colors.danger,
            boxShadow: `0 0 8px ${isMarketOpen ? colors.success : colors.danger}`
          }} />
          <span style={{ fontSize: '12px', fontWeight: 500, color: isMarketOpen ? colors.success : colors.danger }}>
            {isMarketOpen ? 'Market Open' : 'Market Closed'}
          </span>
        </div>

        {/* IST Clock */}
        <div style={{ color: colors.text2, fontSize: '13px', fontWeight: 500 }}>
          {istTimeDisplay}
        </div>

        {/* KYC Badge (Warning) */}
        {user?.kycStatus !== 'VERIFIED' && (
          <div
            onClick={() => navigate('/kyc')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 12px',
              backgroundColor: 'rgba(245,158,11,0.1)',
              border: `1px solid rgba(245,158,11,0.3)`,
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              color: colors.warning,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              gap: '4px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.1)'}
          >
            <span>⚠️</span> Complete KYC
          </div>
        )}

        {/* Notification Bell */}
        <div
          onClick={() => navigate('/notifications')}
          style={{
            position: 'relative',
            cursor: 'pointer',
            color: colors.text2,
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.text2}
        >
          <Bell size={20} />
          {/* Mock notification count */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '8px',
            height: '8px',
            backgroundColor: colors.danger,
            borderRadius: '50%',
            border: `2px solid ${colors.surface}`
          }} />
        </div>
      </div>
    </div>
  )
}

export default TopBar
