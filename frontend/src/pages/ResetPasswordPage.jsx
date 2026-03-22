import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
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

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  // If no token, redirect
  if (!token) {
    navigate('/forgot-password', { replace: true })
    return null
  }

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Password strength logic
  const hasUpper = /[A-Z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecial = /[!@#$%^&*]/.test(newPassword)
  const hasLength = newPassword.length >= 8
  const strengthScore = [hasUpper, hasNumber, hasSpecial, hasLength].filter(Boolean).length

  const getStrengthWord = () => {
    if (newPassword.length === 0) return ''
    if (strengthScore <= 1) return 'Weak'
    if (strengthScore === 2) return 'Fair'
    if (strengthScore === 3) return 'Good'
    return 'Strong'
  }

  const getBarColor = (index) => {
    if (index >= strengthScore) return colors.surface2
    if (strengthScore <= 1) return colors.danger
    if (strengthScore === 2) return colors.gold
    if (strengthScore === 3) return '#EAB308' // yellow
    return colors.success
  }

  const handleInputFocus = (e, isValid, hasError) => {
    if (hasError) {
      e.target.style.borderColor = colors.danger
      e.target.style.boxShadow = `0 0 0 3px rgba(239,68,68,0.15)`
    } else if (isValid) {
      e.target.style.borderColor = colors.success
      e.target.style.boxShadow = `0 0 0 3px rgba(16,185,129,0.15)`
    } else {
      e.target.style.borderColor = colors.accent
      e.target.style.boxShadow = `0 0 0 3px rgba(37,99,235,0.15)`
    }
  }

  const handleInputBlur = (e, isValid, hasError) => {
    if (hasError) {
      e.target.style.borderColor = colors.danger
    } else if (isValid) {
      e.target.style.borderColor = colors.success
    } else {
      e.target.style.borderColor = colors.border
    }
    e.target.style.boxShadow = 'none'
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!hasLength) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password', { 
        token,
        newPassword 
      })
      setIsSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password. The link might be expired.')
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
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
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
        .success-icon {
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>

      {/* Main Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
      }}>

        {isSuccess ? (
          <div style={{ textAlign: 'center' }}>
            <div className="success-icon" style={{ 
              width: '64px', height: '64px', borderRadius: '16px', 
              backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 24px auto',
              border: `1px solid rgba(16,185,129,0.2)`
            }}>
              <CheckCircle size={32} color={colors.success} />
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Password updated successfully!</h2>
            <p style={{ color: colors.text2, fontSize: '14px', lineHeight: '1.5', marginBottom: '32px' }}>
              Your account is now secure. Please sign in with your new password.
            </p>

            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: colors.accent,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.accent2
                e.target.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colors.accent
                e.target.style.transform = 'translateY(0)'
              }}
            >
              Go to Login →
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '16px', 
                backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 24px auto',
                border: `1px solid rgba(16,185,129,0.2)`
              }}>
                <Shield size={32} color={colors.success} />
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Reset your password</h2>
              <p style={{ color: colors.text2, fontSize: '14px' }}>Enter your new password below</p>
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

            <form onSubmit={handleReset}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: colors.text3 }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ ...inputStyle, paddingRight: '44px' }}
                    onFocus={(e) => handleInputFocus(e, false, !!error)}
                    onBlur={(e) => handleInputBlur(e, false, !!error)}
                  />
                  <div 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '15px', cursor: 'pointer', color: colors.text3 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>

                {newPassword && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ 
                          height: '4px', flex: 1, borderRadius: '2px', 
                          backgroundColor: getBarColor(i), transition: 'background-color 0.3s'
                        }}></div>
                      ))}
                      <span style={{ fontSize: '11px', color: getBarColor(strengthScore), marginLeft: '8px', minWidth: '40px' }}>
                        {getStrengthWord()}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ color: hasLength ? colors.success : colors.danger }}>{hasLength ? '✓' : '✗'} At least 8 characters</div>
                      <div style={{ color: hasUpper ? colors.success : colors.danger }}>{hasUpper ? '✓' : '✗'} One uppercase letter</div>
                      <div style={{ color: hasNumber ? colors.success : colors.danger }}>{hasNumber ? '✓' : '✗'} One number</div>
                      <div style={{ color: hasSpecial ? colors.success : colors.danger }}>{hasSpecial ? '✓' : '✗'} One special character</div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: colors.text3 }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ 
                      ...inputStyle, paddingRight: '44px',
                      borderColor: (confirmPassword && newPassword === confirmPassword) ? colors.success : colors.border
                    }}
                    onFocus={(e) => handleInputFocus(e, confirmPassword && newPassword === confirmPassword, false)}
                    onBlur={(e) => handleInputBlur(e, confirmPassword && newPassword === confirmPassword, false)}
                  />
                  <div 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '14px', top: '15px', cursor: 'pointer', color: colors.text3 }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !hasLength || newPassword !== confirmPassword}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: colors.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: (isLoading || !hasLength || newPassword !== confirmPassword) ? 'not-allowed' : 'pointer',
                  opacity: (isLoading || !hasLength || newPassword !== confirmPassword) ? 0.8 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && hasLength && newPassword === confirmPassword) {
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
                {isLoading ? <><div className="spinner"></div> Setting...</> : 'Set New Password'}
              </button>

              {error && error.includes('expired') && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <span 
                    onClick={() => navigate('/forgot-password')}
                    style={{ color: colors.accent, fontSize: '14px', cursor: 'pointer' }}
                  >
                    Request a new link →
                  </span>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage
