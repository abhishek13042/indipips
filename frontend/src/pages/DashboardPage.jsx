import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import api from '../api'

function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, challengesRes] = await Promise.all([
          api.get('/users/profile'),
          api.get('/challenges'),
        ])
        setUser(profileRes.data.data)
        setChallenges(challengesRes.data.data)
        setLoading(false)
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
          navigate('/login')
        }
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', backgroundColor: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '16px', color: '#374151' }}>{user?.fullName?.charAt(0)}</span>
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>Hey, {user?.fullName?.split(' ')[0]}</h1>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Trader Summary · Total Allocation: ₹0</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/new-challenge')}
          style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
        >
          🚀 BUY CHALLENGE
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Active Challenges', value: challenges.filter(c => c.status === 'ACTIVE').length, color: '#111827' },
          { label: 'Passed Challenges', value: challenges.filter(c => c.status === 'PASSED').length, color: '#22c55e' },
          { label: 'Wallet Balance', value: `₹${user?.walletBalance || '0'}`, color: '#111827' },
          { label: 'KYC Status', value: user?.kycStatus || 'PENDING', color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px 0' }}>{stat.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 900, color: stat.color, margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: 0 }}>My Challenges</h2>
          <button
            onClick={() => navigate('/dashboard/new-challenge')}
            style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
          >
            + Buy Challenge
          </button>
        </div>

        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>No challenges yet</h3>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>Purchase your first challenge to start trading</p>
          <button
            onClick={() => navigate('/dashboard/new-challenge')}
            style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
          >
            🚀 Buy Challenge
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage