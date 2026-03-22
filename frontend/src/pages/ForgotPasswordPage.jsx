import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle, Lock } from 'lucide-react'
import api from '../api'

const colors = {
  bg: '#060B14',
  surface: '#0D1420',
  surface2: '#131D2E',
  border: '#1E2D40',
  accent: '#2563EB',
  accent2: '#1D4ED8',
  gold: '#F59E0B',
  success: '#10B981',
  danger: '#EF4444',
  text: '#F1F5F9',
  text2: '#94A3B8',
  text3: '#475569'
}

const inputStyle = {
  width: '100%',
  height: '48px',
  background: colors.surface2,
  border: `1px solid ${colors.border}`,
  borderRadius: '10px',
  padding: '0 16px 0 44px',
  color: colors.text,
  fontSize: '15px',
  outline: 'none',
  fontFamily: "'Inter', sans-serif",
  transition: 'border-color 0.2s, box-shadow 0.2s'
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  color: colors.text2,
  fontWeight: '500',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginBottom: '6px'
}

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() })
      setIsSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: colors.bg,
      backgroundImage: 'radial-gradient(ellipse at center, rgba(37,99,235,0.08) 0%, transparent 70%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .error-banner {
          animation: slideDown 0.2s ease;
        }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
      }}>
        
        <div 
          onClick={() => navigate('/login')}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: colors.text2, 
            fontSize: '14px', 
            cursor: 'pointer',
            marginBottom: '32px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = 'white'}
          onMouseLeave={(e) => e.target.style.color = colors.text2}
        >
          <ArrowLeft size={16} />
          Back to login
        </div>

        {isSubmitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '16px', 
              backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 24px auto',
              border: `1px solid rgba(16,185,129,0.2)`
            }}>
              <CheckCircle size={32} color={colors.success} />
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Check your email</h2>
            <p style={{ color: colors.text2, fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
              We've sent a password reset link to <strong style={{color:'white'}}>{email}</strong>. 
              Please check your inbox and spam folder.
            </p>

            <button
              onClick={() => setIsSubmitted(false)}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: colors.surface2,
                color: 'white',
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = colors.border}
              onMouseLeave={(e) => e.target.style.backgroundColor = colors.surface2}
            >
              Try another email
            </button>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '16px', 
                backgroundColor: 'rgba(37,99,235,0.1)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 24px auto',
                border: `1px solid rgba(37,99,235,0.2)`
              }}>
                <Lock size={32} color={colors.accent} />
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Forgot password?</h2>
              <p style={{ color: colors.text2, fontSize: '14px' }}>No worries, we'll send you reset instructions.</p>
            </div>

            {error && (
              <div className="error-banner" style={{
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderLeft: `3px solid ${colors.danger}`,
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#FCA5A5',
                fontSize: '14px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: colors.text3 }} />
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: colors.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.8 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = colors.accent2
                    e.target.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = colors.accent
                    e.target.style.transform = 'translateY(0)'
                  }
                }}
              >
                {isLoading ? <><div className="spinner"></div> Sending...</> : 'Reset Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage
