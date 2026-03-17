import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
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

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value })
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
    
    // Combining phone code and phone for backend, and full name
    const payload = {
      fullName: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      phone: `${form.phoneCode}${form.phone}`,
      password: form.password,
      // Sending additional fields in case backend supports them, or just extra safe
      title: form.title,
      dob: form.dob,
      country: form.country,
      referralCode: form.referralCode
    }

    try {
      const res = await api.post('/auth/register', payload)
      localStorage.setItem('accessToken', res.data.data.accessToken)
      localStorage.setItem('user', JSON.stringify(res.data.data.user))
      // Since they just registered, force reload to populate auth context or redirect directly
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
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
          <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
        </div>

        {/* Auth Form */}
        <div className="w-full">
          
          {error && (
             <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold text-center">
               {error}
             </div>
          )}

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
                    isDarkMode ? 'bg-[#151b28] border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900 shadow-sm'
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

            {/* Row 7: Referral code */}
            <div>
              <label className={`block text-xs font-bold mb-2 flex items-center gap-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                Referral code <span className={isDarkMode ? 'text-slate-500 font-normal' : 'text-slate-400 font-normal'}>(optional)</span>
              </label>
              <input
                type="text" name="referralCode" value={form.referralCode} onChange={handleChange}
                className={`w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#3b66f5] transition-shadow text-sm ${
                  isDarkMode ? 'bg-[#151b28] border border-slate-700 text-white placeholder-slate-500' : 'bg-white border border-slate-300 text-slate-900 shadow-sm'
                }`}
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-4">
               <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" name="agreeAge" checked={form.agreeAge} onChange={handleChange} required
                    className="mt-1 w-4 h-4 rounded border-slate-600 text-[#3b66f5] focus:ring-[#3b66f5] bg-transparent shrink-0"
                  />
                  <span className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>
                    I certify that I am 18 years of age or older, agree to the User Agreement, and acknowledge the Privacy policy.
                  </span>
               </label>

               <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" name="agreeName" checked={form.agreeName} onChange={handleChange} required
                    className="mt-1 w-4 h-4 rounded border-slate-600 text-[#3b66f5] focus:ring-[#3b66f5] bg-transparent shrink-0"
                  />
                  <span className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>
                    I acknowledge my name is correct and corresponds to the government-issued identification.
                  </span>
               </label>

               <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" name="agreeMarketing" checked={form.agreeMarketing} onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded border-slate-600 text-[#3b66f5] focus:ring-[#3b66f5] bg-transparent shrink-0"
                  />
                  <span className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>
                    I agree to receive news, updates, promotions, surveys, and other communications from IndiPips via phone and email.
                  </span>
               </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#3b66f5] text-white font-semibold text-sm hover:bg-blue-600 transition-colors mt-6 flex justify-center items-center shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Get Funded'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}></div>
            </div>
            <div className="relative flex justify-center">
              <span className={`px-4 text-xs ${isDarkMode ? 'bg-[#0f141e] text-slate-500' : 'bg-white text-slate-500'} uppercase`}>OR</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.location.href = 'http://localhost:5000/api/v1/auth/google'}
            className={`w-full py-2.5 rounded-lg border font-semibold text-sm flex items-center justify-center gap-3 transition-colors ${
              isDarkMode 
                ? 'bg-[#151b28] border-slate-700 text-slate-200 hover:bg-slate-800' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>
        
        <p className={`text-center mt-8 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Already have an account? <Link to="/login" className="text-[#3b66f5] hover:text-blue-500 font-semibold transition-colors">Sign in</Link>
        </p>

      </div>
    </div>
  )
}

export default RegisterPage