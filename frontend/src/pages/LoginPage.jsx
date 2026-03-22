import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../stores/authStore'

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

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  // If already logged in redirect
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) navigate('/dashboard')
  }, [navigate])

  // Clear error when typing
  useEffect(() => {
    if (error) clearError()
    setLocalError('')
  }, [email, password, error, clearError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    // Client-side validation
    if (!email.trim()) {
      setLocalError('Please enter your email')
      return
    }
    if (!password) {
      setLocalError('Please enter your password')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email')
      return
    }

    try {
      const user = await login(email.trim(), password)
      
      // Redirect based on user state
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        navigate('/admin')
      } else if (user.kycStatus !== 'VERIFIED') {
        navigate('/kyc')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      const msg = err.message || 'Login failed. Please try again.'
      
      if (msg.includes('suspended')) {
        setLocalError('Your account has been suspended. Contact support@indipips.com')
      } else if (msg.includes('locked')) {
        setLocalError('Account temporarily locked. Too many failed attempts. Try again in 15 minutes.')
      } else {
        setLocalError(msg)
      }
    }
  }

  const displayError = localError || error

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
      padding: '24px',
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
        input::placeholder {
          color: ${colors.text3};
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(37,99,235,0.4)'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>IP</span>
          </div>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '22px' }}>Indipips</span>
        </div>
        <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Welcome back</h1>
        <p style={{ color: colors.text2, fontSize: '14px', margin: 0 }}>Sign in to continue trading</p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
      }}>
        {displayError && (
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
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: colors.text2,
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.text3 }} 
              />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: colors.surface2,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '10px',
                  padding: '0 16px 0 44px',
                  color: colors.text,
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.accent
                  e.target.style.boxShadow = `0 0 0 3px rgba(37,99,235,0.15)`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: colors.text2,
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.text3 }} 
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: colors.surface2,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '10px',
                  padding: '0 44px 0 44px',
                  color: colors.text,
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.accent
                  e.target.style.boxShadow = `0 0 0 3px rgba(37,99,235,0.15)`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border
                  e.target.style.boxShadow = 'none'
                }}
              />
              <div 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  cursor: 'pointer',
                  color: colors.text3,
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = colors.text2}
                onMouseLeave={(e) => e.currentTarget.style.color = colors.text3}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: colors.accent,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'text-decoration 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              Forgot password?
            </button>
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
                e.target.style.boxShadow = '0 4px 15px rgba(37,99,235,0.4)'
                e.target.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = colors.accent
                e.target.style.boxShadow = 'none'
                e.target.style.transform = 'translateY(0)'
              }
            }}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Signing in...
              </>
            ) : 'Sign in'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }}></div>
          <span style={{ color: colors.text3, fontSize: '13px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }}></div>
        </div>

        <button
          onClick={() => window.location.href = 'http://localhost:5000/api/v1/auth/google'}
          style={{
            width: '100%',
            height: '48px',
            backgroundColor: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: '10px',
            color: colors.text,
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = colors.surface2
            e.target.style.borderColor = colors.accent
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent'
            e.target.style.borderColor = colors.border
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <p style={{ marginTop: '24px', fontSize: '14px', color: colors.text2, textAlign: 'center' }}>
        New to Indipips?{' '}
        <span 
          onClick={() => navigate('/register')}
          style={{ color: colors.accent, cursor: 'pointer', transition: 'text-decoration 0.2s' }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
        >
          Create your account
        </span>
      </p>

      {/* Security badges */}
      <div style={{ 
        marginTop: 'auto', 
        paddingTop: '40px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '24px',
        color: colors.text3,
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🔒</span> 256-bit SSL
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🛡️</span> Razorpay Secured
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🇮🇳</span> Indian Platform
        </div>
      </div>
    </div>
  )
}

export default LoginPage
