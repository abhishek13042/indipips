import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api'

function LoginPage() {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.data.user, res.data.data.accessToken)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.')
    } finally {
      setLoading(false)
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
          <h2 className="text-2xl font-bold tracking-tight">Sign in to your account</h2>
        </div>

        {/* Auth Form */}
        <div className="w-full">
          
          {error && (
             <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold text-center">
               {error}
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className={`w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#3b66f5] transition-shadow ${
                  isDarkMode 
                    ? 'bg-[#151b28] border border-slate-700 text-white placeholder-slate-500' 
                    : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm'
                }`}
                placeholder="nomad@indipips.com"
              />
            </div>

            <div>
               <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Password</label>
               <input
                 type="password"
                 name="password"
                 value={form.password}
                 onChange={handleChange}
                 required
                 className={`w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#3b66f5] transition-shadow ${
                   isDarkMode 
                     ? 'bg-[#151b28] border border-slate-700 text-white placeholder-slate-500' 
                     : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm'
                 }`}
                 placeholder="••••••••••••"
               />
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-600 text-[#3b66f5] focus:ring-[#3b66f5] bg-transparent"
                />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>Remember Me</span>
              </label>
              
              <Link to="/forgot-password" className="text-sm font-semibold text-[#3b66f5] hover:text-blue-500 transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#3b66f5] text-white font-semibold text-sm hover:bg-blue-600 transition-colors mt-2 flex justify-center items-center shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign in'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}></div>
            </div>
            <div className="relative flex justify-center">
              <span className={`px-4 text-sm ${isDarkMode ? 'bg-[#0f141e] text-slate-500' : 'bg-white text-slate-500'}`}>OR</span>
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
          Ready to trade? <Link to="/register" className="text-[#3b66f5] hover:text-blue-500 font-semibold transition-colors">Create your account</Link>
        </p>

      </div>
    </div>
  )
}

export default LoginPage