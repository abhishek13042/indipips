import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, Mail, Phone, Lock, 
  Eye, EyeOff, Gift, CheckCircle, 
  XCircle 
} from 'lucide-react'
import useAuthStore from '../stores/authStore'
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

const errorTextStyle = {
  fontSize: '12px',
  color: colors.danger,
  marginTop: '4px'
}

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register, clearError } = useAuthStore()
  
  const [step, setStep] = useState('register') // 'register' or 'verify-otp'
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  })
  
  const [otp, setOtp] = useState(['','','','','',''])
  const [otpError, setOtpError] = useState('')
  const [userId, setUserId] = useState(null)
  const [resendTimer, setResendTimer] = useState(60)
  const [termsChecked, setTermsChecked] = useState(false)
  const [ageChecked, setAgeChecked] = useState(false)
  
  const [localError, setLocalError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if logged in
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) navigate('/dashboard')
  }, [navigate])

  // Password strength logic
  const hasUpper = /[A-Z]/.test(form.password)
  const hasNumber = /[0-9]/.test(form.password)
  const hasSpecial = /[!@#$%^&*]/.test(form.password)
  const hasLength = form.password.length >= 8
  const strengthScore = [hasUpper, hasNumber, hasSpecial, hasLength].filter(Boolean).length

  const getStrengthWord = () => {
    if (form.password.length === 0) return ''
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

  // Real-time email logic
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmailValid = emailRegex.test(form.email)

  // Real-time phone logic
  const phoneRegex = /^[0-9]{10}$/
  const isPhoneValid = phoneRegex.test(form.phone)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLocalError('')
    setFieldErrors({})

    const errors = {}
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      errors.fullName = 'Enter your full name'
    }
    if (!isEmailValid) {
      errors.email = 'Enter a valid email'
    }
    if (!isPhoneValid) {
      errors.phone = 'Enter valid 10-digit phone number'
    }
    if (!hasLength) {
      errors.password = 'Password must be at least 8 characters'
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    if (!termsChecked || !ageChecked) {
      setLocalError('Please accept all terms to continue')
      return
    }

    setIsLoading(true)
    try {
      const data = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        referralCode: form.referralCode.trim() || undefined
      })
      setUserId(data.userId)
      setStep('verify-otp')
      startResendTimer()
    } catch (err) {
      const msg = err.message || 'Registration failed. Try again.'
      if (msg.toLowerCase().includes('email')) {
        setFieldErrors({ email: 'This email is already registered' })
      } else if (msg.toLowerCase().includes('phone')) {
        setFieldErrors({ phone: 'This phone is already registered' })
      } else {
        setLocalError(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const startResendTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]$/.test(value) && value !== '') return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto focus next
    if (value && index < 5) {
      document.getElementById('otp-' + (index + 1))?.focus()
    }
    // Auto submit
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''))
    }
  }

  const handleVerifyOtp = async (otpCode) => {
    setIsLoading(true)
    try {
      await api.post('/auth/verify-email', {
        userId: userId,
        otp: otpCode
      })
      navigate('/login') // or /dashboard depending on how auth holds token
    } catch (err) {
      setOtpError('Invalid code. Please try again.')
      setOtp(['','','','','',''])
      document.getElementById('otp-0')?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    setIsLoading(true)
    try {
      await api.post('/auth/resend-otp', {
        userId: userId
      })
      startResendTimer()
      setOtpError('')
    } catch {
      setOtpError('Failed to resend. Try again.')
    } finally {
      setIsLoading(false)
    }
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
        input::placeholder {
          color: ${colors.text3};
        }
        .custom-checkbox {
          appearance: none;
          width: 16px;
          height: 16px;
          border: 1px solid ${colors.border};
          border-radius: 4px;
          background-color: ${colors.surface2};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          margin: 0;
          padding: 0;
        }
        .custom-checkbox:checked {
          background-color: ${colors.accent};
          border-color: ${colors.accent};
        }
        .custom-checkbox:checked::after {
          content: '✔';
          color: white;
          font-size: 10px;
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
        <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Create your account</h1>
        <p style={{ color: colors.text2, fontSize: '14px', margin: 0 }}>Join 847+ traders already on Indipips</p>
      </div>

      {/* Main Card */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
      }}>
        {(localError) && step === 'register' && (
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
            {localError}
          </div>
        )}

        {step === 'register' ? (
          <form onSubmit={handleRegister}>
            {/* FULL NAME */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: colors.text3 }} />
                <input
                  type="text"
                  placeholder="Arjun Sharma"
                  value={form.fullName}
                  onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                  style={{ ...inputStyle, borderColor: fieldErrors.fullName ? colors.danger : colors.border }}
                  onFocus={(e) => handleInputFocus(e, false, !!fieldErrors.fullName)}
                  onBlur={(e) => handleInputBlur(e, false, !!fieldErrors.fullName)}
                />
              </div>
              {fieldErrors.fullName && <div style={errorTextStyle}>{fieldErrors.fullName}</div>}
              <div style={{ fontSize: '11px', color: colors.text3, marginTop: '5px' }}>
                Use your legal name — required for KYC verification
              </div>
            </div>

            {/* EMAIL */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: colors.text3 }} />
                <input
                  type="email"
                  placeholder="arjun@gmail.com"
                  value={form.email}
                  onChange={(e) => {
                    setForm(f => ({ ...f, email: e.target.value }))
                    if(fieldErrors.email) setFieldErrors(e => ({ ...e, email: null }))
                  }}
                  style={{ 
                    ...inputStyle, 
                    borderColor: fieldErrors.email ? colors.danger : (form.email && isEmailValid ? colors.success : colors.border) 
                  }}
                  onFocus={(e) => handleInputFocus(e, form.email && isEmailValid, !!fieldErrors.email)}
                  onBlur={(e) => handleInputBlur(e, form.email && isEmailValid, !!fieldErrors.email)}
                />
                {form.email && isEmailValid && !fieldErrors.email && (
                  <CheckCircle size={16} color={colors.success} style={{ position: 'absolute', right: '14px', top: '16px' }} />
                )}
                {form.email && !isEmailValid && (
                  <XCircle size={16} color={colors.danger} style={{ position: 'absolute', right: '14px', top: '16px' }} />
                )}
              </div>
              {fieldErrors.email && <div style={errorTextStyle}>{fieldErrors.email}</div>}
            </div>

            {/* PHONE */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: colors.text3 }} />
                <input
                  type="text"
                  placeholder="9876543210"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                  style={{ 
                    ...inputStyle, 
                    borderColor: fieldErrors.phone ? colors.danger : (form.phone && isPhoneValid ? colors.success : colors.border) 
                  }}
                  onFocus={(e) => handleInputFocus(e, form.phone && isPhoneValid, !!fieldErrors.phone)}
                  onBlur={(e) => handleInputBlur(e, form.phone && isPhoneValid, !!fieldErrors.phone)}
                />
                {form.phone && isPhoneValid && !fieldErrors.phone && (
                  <CheckCircle size={16} color={colors.success} style={{ position: 'absolute', right: '14px', top: '16px' }} />
                )}
              </div>
              {fieldErrors.phone && <div style={errorTextStyle}>{fieldErrors.phone}</div>}
              <div style={{ fontSize: '11px', color: colors.text3, marginTop: '5px' }}>
                10-digit Indian mobile number
              </div>
            </div>

            {/* PASSWORD */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: colors.text3 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ ...inputStyle, paddingRight: '44px', borderColor: fieldErrors.password ? colors.danger : colors.border }}
                  onFocus={(e) => handleInputFocus(e, false, !!fieldErrors.password)}
                  onBlur={(e) => handleInputBlur(e, false, !!fieldErrors.password)}
                />
                <div 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '15px', cursor: 'pointer', color: colors.text3 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>

              {/* Strength Meter */}
              {form.password && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ 
                        height: '4px', 
                        flex: 1, 
                        borderRadius: '2px', 
                        backgroundColor: getBarColor(i),
                        transition: 'background-color 0.3s'
                      }}></div>
                    ))}
                    <span style={{ fontSize: '11px', color: getBarColor(strengthScore), marginLeft: '8px', minWidth: '40px' }}>
                      {getStrengthWord()}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ color: hasLength ? colors.success : colors.danger }}>
                      {hasLength ? '✓' : '✗'} At least 8 characters
                    </div>
                    <div style={{ color: hasUpper ? colors.success : colors.danger }}>
                      {hasUpper ? '✓' : '✗'} One uppercase letter
                    </div>
                    <div style={{ color: hasNumber ? colors.success : colors.danger }}>
                      {hasNumber ? '✓' : '✗'} One number
                    </div>
                    <div style={{ color: hasSpecial ? colors.success : colors.danger }}>
                      {hasSpecial ? '✓' : '✗'} One special character (!@#$%)
                    </div>
                  </div>
                </div>
              )}
              {fieldErrors.password && !form.password && <div style={errorTextStyle}>{fieldErrors.password}</div>}
            </div>

            {/* CONFIRM PASSWORD */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: colors.text3 }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  style={{ 
                    ...inputStyle, 
                    paddingRight: '44px',
                    borderColor: fieldErrors.confirmPassword ? colors.danger : (form.confirmPassword && form.password === form.confirmPassword ? colors.success : colors.border)
                  }}
                  onFocus={(e) => handleInputFocus(e, form.confirmPassword && form.password === form.confirmPassword, !!fieldErrors.confirmPassword)}
                  onBlur={(e) => handleInputBlur(e, form.confirmPassword && form.password === form.confirmPassword, !!fieldErrors.confirmPassword)}
                />
                <div 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '14px', top: '15px', cursor: 'pointer', color: colors.text3 }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
              {fieldErrors.confirmPassword && <div style={errorTextStyle}>{fieldErrors.confirmPassword}</div>}
            </div>

            {/* REFERRAL CODE */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Referral Code</label>
                <span style={{ fontSize: '10px', color: colors.gold, padding: '2px 6px', background: 'rgba(245,158,11,0.1)', borderRadius: '4px' }}>(optional)</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Gift size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: colors.text3 }} />
                <input
                  type="text"
                  placeholder="INDI7X3K9M"
                  value={form.referralCode}
                  onChange={(e) => setForm(f => ({ ...f, referralCode: e.target.value.toUpperCase() }))}
                  style={{ ...inputStyle, textTransform: 'uppercase' }}
                  onFocus={(e) => handleInputFocus(e, false, false)}
                  onBlur={(e) => handleInputBlur(e, false, false)}
                />
              </div>
              <div style={{ fontSize: '11px', color: colors.text3, marginTop: '5px' }}>
                Have a referral code? Enter it here to get benefits
              </div>
            </div>

            {/* CHECKBOXES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <label style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'flex-start' }}>
                <input 
                  type="checkbox" 
                  className="custom-checkbox" 
                  checked={termsChecked}
                  onChange={() => setTermsChecked(!termsChecked)}
                  style={{ marginTop: '2px' }}
                />
                <span style={{ fontSize: '13px', color: colors.text2, lineHeight: '1.4' }}>
                  I agree to Indipips <a href="#" style={{ color: colors.accent, textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: colors.accent, textDecoration: 'none' }}>Privacy Policy</a>
                </span>
              </label>
              
              <label style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'flex-start' }}>
                <input 
                  type="checkbox" 
                  className="custom-checkbox" 
                  checked={ageChecked}
                  onChange={() => setAgeChecked(!ageChecked)}
                  style={{ marginTop: '2px' }}
                />
                <span style={{ fontSize: '13px', color: colors.text2, lineHeight: '1.4' }}>
                  I confirm I am 18+ years old and my details are accurate
                </span>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading || !termsChecked || !ageChecked || (form.password !== form.confirmPassword && form.confirmPassword !== '')}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: colors.accent,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: (isLoading || !termsChecked || !ageChecked) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !termsChecked || !ageChecked) ? 0.8 : 1,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && termsChecked && ageChecked) {
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
                  Creating account...
                </>
              ) : 'Create Account →'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }}></div>
              <span style={{ color: colors.text3, fontSize: '13px' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }}></div>
            </div>

            <button
              type="button"
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
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            {otpError && (
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
                gap: '8px',
                textAlign: 'left'
              }}>
                <span>⚠️</span>
                {otpError}
              </div>
            )}
            
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '16px', 
              backgroundColor: 'rgba(37,99,235,0.1)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 24px auto',
              border: `1px solid rgba(37,99,235,0.2)`
            }}>
              <Mail size={32} color={colors.accent} />
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>Verify your email</h2>
            <p style={{ color: colors.text2, fontSize: '14px', lineHeight: '1.5', marginBottom: '32px' }}>
              We sent a 6-digit code to <br />
              <strong style={{ color: 'white' }}>{form.email}</strong>
            </p>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digit && index > 0) {
                      document.getElementById(`otp-${index - 1}`)?.focus()
                    }
                  }}
                  style={{
                    width: '48px',
                    height: '56px',
                    backgroundColor: colors.surface2,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: 'white',
                    outline: 'none',
                    transition: 'all 0.2s'
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
              ))}
            </div>

            <button
              onClick={() => handleVerifyOtp(otp.join(''))}
              disabled={otp.join('').length !== 6 || isLoading}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: colors.accent,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: (otp.join('').length !== 6 || isLoading) ? 'not-allowed' : 'pointer',
                opacity: (otp.join('').length !== 6 || isLoading) ? 0.8 : 1,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '24px'
              }}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Verifying...
                </>
              ) : 'Verify Code'}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
              {resendTimer > 0 ? (
                <span style={{ color: colors.text3 }}>
                  Resend code in {resendTimer}s
                </span>
              ) : (
                <span 
                  onClick={handleResendOtp}
                  style={{ color: colors.accent, cursor: 'pointer' }}
                >
                  Resend code
                </span>
              )}

              <span 
                onClick={() => setStep('register')}
                style={{ color: colors.text2, cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = colors.text2}
              >
                Wrong email? Go back
              </span>
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: '24px', fontSize: '14px', color: colors.text2, textAlign: 'center' }}>
        Already have an account?{' '}
        <span 
          onClick={() => navigate('/login')}
          style={{ color: colors.accent, cursor: 'pointer', transition: 'text-decoration 0.2s' }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
        >
          Sign in →
        </span>
      </p>
    </div>
  )
}

export default RegisterPage
