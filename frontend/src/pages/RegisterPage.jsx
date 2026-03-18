import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Moon, Sun, CheckCircle2, Mail, ArrowRight, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api'

function RegisterPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    title: '', 
    dob: '', 
    country: '', 
    email: '', 
    phoneCode: '', 
    phone: '', 
    password: '', 
    confirmPassword: '', 
    referralCode: '',
    agreeAge: false,
    agreeName: false,
    agreeMarketing: false
  })
  
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
    if (user) navigate('/dashboard')
  }, [user, navigate])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value })
  }

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (!form.agreeAge || !form.agreeName) {
      setError("You must agree to the required terms and conditions.")
      return
    }

    setLoading(true)
    setError('')
    
    const payload = {
      fullName: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      phone: `${form.phoneCode}${form.phone}`,
      password: form.password,
      title: form.title,
      dob: form.dob,
      country: form.country,
      referralCode: form.referralCode
    }

    try {
      const res = await api.post('/auth/register', payload)
      if (res.data.data.mustVerify) {
        setUserId(res.data.data.userId)
        setShowVerification(true)
        window.scrollTo(0, 0)
      } else {
        // Fallback if verification is disabled on backend
        localStorage.setItem('accessToken', res.data.data.accessToken)
        localStorage.setItem('user', JSON.stringify(res.data.data.user))
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.')
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
      setSuccess("Email verified! Redirecting to login...")
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code.')
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
    <div className={`min-h-screen flex flex-col font-inter transition-colors duration-300 ${isDarkMode ? 'bg-[#0f141e] text-white' : 'bg-white text-slate-900'} py-12 px-6`}>
      
      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <button 
          type="button"
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-start items-center relative z-10 w-full max-w-2xl mx-auto">
        
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
            <>
              <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>India's first localized prop firm experience.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                <Mail className="text-blue-500" size={32} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Verify your email</h2>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                We've sent a 6-digit code to <span className="text-blue-400 font-semibold">{form.email}</span>
              </p>
            </>
          )}
        </div>

        {/* Form Container */}
        <div className="w-full">
          
          {error && (
             <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold text-center">
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
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Row 1: First name, Last name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>First name</label>
                  <input
                    type="text" name="firstName" value={form.firstName} onChange={handleChange} required
                    className={`w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#3b66f5] transition-shadow text-sm ${
                      isDarkMode ? 'bg-[#151b28] border border-slate-700 text-white placeholder-slate-500' : 'bg-white border border-slate-300 text-slate-900 shadow-sm'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Last name</label>
                  <input
                    type="text" name="lastName" value={form.lastName} onChange={handleChange} required
                    className={`w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#3b66f5] transition-shadow text-sm ${
                      isDarkMode ? 'bg-[#151b28] border border-slate-700 text-white placeholder-slate-500' : 'bg-white border border-slate-300 text-slate-900 shadow-sm'
                    }`}
                  />
                </div>
              </div>

              {/* Row 2: Title, Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Title</label>
                  <select
                    name="title" value={form.title} onChange={handleChange} required
                    className={`w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#3b66f5] transition-shadow text-sm appearance-none cursor-pointer ${
                      isDarkMode ? 'bg-[#151b28] border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900 shadow-sm'
                    }`}
                  >
                    <option value="" disabled>Select title</option>
                    <option value="Mr">Mr.</option>
                    <option value="Ms">Ms.</option>
                    <option value="Mrs">Mrs.</option>
                    <option value="Dr">Dr.</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Date of Birth</label>
                  <input
                    type="date" name="dob" value={form.dob} onChange={handleChange} required
                    className={`w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#3b66f5] transition-shadow text-sm ${
                      isDarkMode ? 'bg-[#151b28] border border-slate-700 text-white placeholder-slate-500' : 'bg-white border border-slate-300 text-slate-900 shadow-sm'
                    }`}
                  />
                </div>
              </div>

              {/* Row 3: Country */}
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Country</label>
                <select
                  name="country" value={form.country} onChange={handleChange} required
                  className={`w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#3b66f5] transition-shadow text-sm appearance-none cursor-pointer ${
                    isDarkMode ? 'bg-[#151b28] border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900 shadow-sm'
                  }`}
                >
                  <option value="" disabled>Select a country</option>
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="AE">United Arab Emirates</option>
                </select>
              </div>

              {/* Row 4: Email */}
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Email</label>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange} required
                  className={`w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#3b66f5] transition-shadow text-sm ${
                    isDarkMode ? 'bg-[#151b28] border border-slate-700 text-white placeholder-slate-500' : 'bg-white border border-slate-300 text-slate-900 shadow-sm'
                  }`}
                />
              </div>

              {/* Row 5: Phone number */}
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Phone number</label>
                <div className="flex gap-2">
                  <select
                    name="phoneCode" value={form.phoneCode} onChange={handleChange} required
                    className={`w-1/3 sm:w-1/4 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#3b66f5] transition-shadow text-sm appearance-none cursor-pointer ${
                      isDarkMode ? 'bg-[#151b28] border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900 shadow-sm'
                    }`}
                  >
                    <option value="" disabled>Select country</option>
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+971">+971 (AE)</option>
                  </select>
                  <input
                    type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone number"
                    className={`w-2/3 sm:w-3/4 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#3b66f5] transition-shadow text-sm ${
                      isDarkMode ? 'bg-[#151b28] border border-slate-700 text-white placeholder-slate-500' : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm'
                    }`}
                  />
                </div>
              </div>

              {/* Row 6: Password, Confirm password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Password</label>
                  <input
                    type="password" name="password" value={form.password} onChange={handleChange} required
                    className={`w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#3b66f5] transition-shadow text-sm ${
                      isDarkMode ? 'bg-[#151b28] border border-slate-700 text-white placeholder-slate-500' : 'bg-white border border-slate-300 text-slate-900 shadow-sm'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Confirm password</label>
                  <input
                    type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
                    className={`w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#3b66f5] transition-shadow text-sm ${
                      isDarkMode ? 'bg-[#151b28] border border-slate-700 text-white placeholder-slate-500' : 'bg-white border border-slate-300 text-slate-900 shadow-sm'
                    }`}
                  />
                </div>
              </div>

              {/* Show All agreements similarly... */}
              <div className="space-y-3 pt-4">
                 <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" name="agreeAge" checked={form.agreeAge} onChange={handleChange} required className="mt-1 w-4 h-4 rounded border-slate-600 text-[#3b66f5] focus:ring-[#3b66f5] bg-transparent shrink-0" />
                    <span className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>I certify that I am 18 years of age or older.</span>
                 </label>
                 <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" name="agreeName" checked={form.agreeName} onChange={handleChange} required className="mt-1 w-4 h-4 rounded border-slate-600 text-[#3b66f5] focus:ring-[#3b66f5] bg-transparent shrink-0" />
                    <span className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>I acknowledge my name matches my ID.</span>
                 </label>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all mt-6 shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <>Get Funded <ArrowRight size={18} /></>}
              </button>
            </form>
          ) : (
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-[#151b28] border border-slate-800' : 'bg-white border border-slate-100 shadow-xl'}`}>
              <div className="flex justify-center gap-2 mb-8">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
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
                onClick={handleVerifyOtp}
                disabled={verifying}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 mb-6"
              >
                {verifying ? <RefreshCw className="animate-spin" size={18} /> : 'Verify & Continue'}
              </button>

              <div className="text-center">
                <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="mt-2 text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors disabled:opacity-50"
                >
                  {resending ? 'Resending...' : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          {!showVerification && (
            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center text-slate-500"><div className="w-full border-t border-current opacity-20"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className={`px-4 ${isDarkMode ? 'bg-[#0f141e]' : 'bg-white'}`}>OR</span></div>
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
          Already have an account? <Link to="/login" className="text-blue-500 hover:text-blue-400 font-bold transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage