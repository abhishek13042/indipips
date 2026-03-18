import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Moon, Sun, Mail, CheckCircle2, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api'

function LoginPage() {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Verification State
  const [showVerification, setShowVerification] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [userId, setUserId] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value })
  }

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.data.user, res.data.data.accessToken)
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.data?.mustVerify) {
        setUserId(err.response.data.userId)
        setShowVerification(true)
      } else {
        setError(err.response?.data?.message || 'Login failed. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits.")
      return
    }

    setVerifying(true)
    setError('')
    
    try {
      await api.post('/auth/verify-email', { userId, otp: otpCode })
      setSuccess("Email verified! You can now log in.")
      setShowVerification(false)
      setOtp(['', '', '', '', '', ''])
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.')
    } finally {
      setVerifying(false)
    }
  }

  const handleResendOtp = async () => {
    setResending(true)
    setError('')
    try {
      await api.post('/auth/resend-otp', { userId })
      setSuccess("New code sent to your email.")
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError("Failed to resend code.")
    } finally {
      setResending(false)
    }
  }

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  return (
    <div className={`min-h-screen flex flex-col font-inter transition-colors duration-300 ${isDarkMode ? 'bg-[#0f141e] text-white' : 'bg-white text-slate-900'}`}>
      
      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 w-full max-w-md mx-auto">
        
        {/* Logo Section */}
        <div className="text-center mb-8 w-full flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2 mb-6 cursor-pointer">
            <div className={`w-8 h-8 rounded flex items-center justify-center font-black ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
              IP
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              IndiPips <span className="text-[10px] align-top">®</span>
            </h1>
          </Link>
          
          {!showVerification ? (
            <h2 className="text-2xl font-bold tracking-tight">Sign in to your account</h2>
          ) : (
             <>
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                  <Mail className="text-blue-500" size={32} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Verify your email</h2>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Your account is not verified. Check your email for the code.
                </p>
             </>
          )}
        </div>

        {/* Auth Form */}
        <div className="w-full">
          
          {error && (
             <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold text-center">
               {error}
             </div>
          )}

          {success && (
             <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-semibold flex items-center gap-3">
               <CheckCircle2 size={18} />
               {success}
             </div>
          )}

          {!showVerification ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Email address</label>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange} required
                  className={`w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#3b66f5] transition-shadow ${
                    isDarkMode ? 'bg-[#151b28] border border-slate-700 text-white placeholder-slate-500' : 'bg-white border border-slate-300 text-slate-900 shadow-sm'
                  }`}
                  placeholder="nomad@indipips.com"
                />
              </div>

              <div>
                 <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Password</label>
                 <input
                   type="password" name="password" value={form.password} onChange={handleChange} required
                   className={`w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#3b66f5] transition-shadow ${
                     isDarkMode ? 'bg-[#151b28] border border-slate-700 text-white placeholder-slate-500' : 'bg-white border border-slate-300 text-slate-900 shadow-sm'
                   }`}
                   placeholder="••••••••••••"
                 />
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange} className="w-4 h-4 rounded border-slate-600 text-[#3b66f5] focus:ring-[#3b66f5] bg-transparent" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>Remember Me</span>
                </label>
                <Link to="/forgot-password" virtual className="text-sm font-semibold text-[#3b66f5] hover:text-blue-500 transition-colors">Forgot Password?</Link>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all mt-2 shadow-lg shadow-blue-500/20 active:scale-95 flex justify-center items-center"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Sign in'}
              </button>
            </form>
          ) : (
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-[#151b28] border border-slate-800' : 'bg-white border border-slate-100 shadow-xl'}`}>
              <div className="flex justify-center gap-2 mb-8">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text" maxLength="1"
                    className={`w-10 h-12 text-center text-lg font-bold rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                      isDarkMode ? 'bg-[#0f141e] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                    value={data}
                    onChange={e => handleOtpChange(e.target, index)}
                    onFocus={e => e.target.select()}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp} disabled={verifying}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 mb-6"
              >
                {verifying ? <RefreshCw className="animate-spin" size={18} /> : 'Verify & Continue'}
              </button>

              <div className="text-center">
                <button
                  onClick={handleResendOtp} disabled={resending}
                  className="text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors disabled:opacity-50 mr-4"
                >
                  {resending ? 'Resending...' : 'Resend Code'}
                </button>
                <button
                  onClick={() => setShowVerification(false)}
                  className={`text-sm font-medium ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'} transition-colors`}
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}

          {!showVerification && (
            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center text-slate-500 opacity-20"><div className="w-full border-t border-current"></div></div>
                <div className="relative flex justify-center text-xs uppercase font-bold"><span className={`px-4 ${isDarkMode ? 'bg-[#0f141e]' : 'bg-white'}`}>OR</span></div>
              </div>

              <button
                type="button"
                onClick={() => window.location.href = 'http://localhost:5000/api/v1/auth/google'}
                className={`w-full py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-3 transition-all ${
                  isDarkMode ? 'bg-[#151b28] border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>
            </div>
          )}
        </div>
        
        <p className={`text-center mt-8 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Ready to trade? <Link to="/register" className="text-blue-500 hover:text-blue-400 font-bold transition-colors">Create your account</Link>
        </p>

      </div>
    </div>
  )
}

export default LoginPage