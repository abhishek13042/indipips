import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity } from 'lucide-react'

const NotFoundPage = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#060B14', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: '#F1F5F9',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '24px', maxWidth: '600px' }}>
        
        {/* SVG Graphic mimicking a trading chart */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', color: '#475569' }}>
          <Activity size={80} strokeWidth={1} />
        </div>

        <h1 style={{ 
          fontSize: '120px', 
          fontWeight: '900', 
          margin: '0 0 -20px 0',
          background: 'linear-gradient(135deg, #2563EB, #F59E0B)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: '1'
        }}>
          404
        </h1>
        
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Page Not Found</h2>
        
        <p style={{ color: '#94A3B8', fontSize: '16px', lineHeight: '1.6', margin: '0 auto 40px auto', maxWidth: '400px' }}>
          The page you're looking for doesn't exist, has been moved, or you took a wrong turn in the markets.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ 
              padding: '12px 28px', 
              backgroundColor: '#2563EB', 
              color: '#FFF', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '15px', 
              fontWeight: '600', 
              cursor: 'pointer' 
            }}
          >
            ← Go Home
          </button>
          
          {token && (
            <button 
              onClick={() => navigate('/dashboard')}
              style={{ 
                padding: '12px 28px', 
                backgroundColor: 'transparent', 
                color: '#F1F5F9', 
                border: '1px solid #1E2D40', 
                borderRadius: '8px', 
                fontSize: '15px', 
                fontWeight: '600', 
                cursor: 'pointer' 
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#131D2E'; e.currentTarget.style.borderColor = '#475569' }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#1E2D40' }}
            >
              Go to Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default NotFoundPage
