import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, KeyRound } from 'lucide-react'
import api from '../api'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setMessage(res.data?.message || 'Password reset link sent to your email.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col justify-center items-center p-6 relative overflow-hidden font-inter">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-400/10 rounded-full blur-[150px] pointer-events-none"></div>

      <button 
        onClick={() => navigate('/login')}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} /> Back to Login
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-900 to-green-500/20 border border-green-400/20 mx-auto flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(74,222,128,0.15)]">
            <KeyRound className="text-green-400" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white font-outfit tracking-tight">Recover Access</h1>
          <p className="text-gray-400 font-medium mt-2">We will send a reset link to your registered identity.</p>
        </div>

        <div className="glass-dark border border-gray-800 rounded-3xl p-8 shadow-2xl relative">
          
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold text-center">
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold text-center">
              {message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Email Identity</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-green-400 transition-colors"
                  placeholder="nomad@indipips.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || Boolean(message)}
              className="w-full py-4 rounded-xl bg-green-400 text-black font-black text-sm flex justify-center items-center gap-2 hover:bg-green-300 transition-colors shadow-[0_0_20px_rgba(74,222,128,0.2)] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'SEND RECOVERY LINK'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
