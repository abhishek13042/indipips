import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link2, ShieldCheck, Zap, AlertCircle, CheckCircle2, RefreshCw, LogOut } from 'lucide-react'
import api from '../api'

function BrokerConnectPage() {
  const [status, setStatus] = useState('loading') // loading, disconnected, connected
  const [brokerInfo, setBrokerInfo] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await api.get('/upstox/status')
      if (res.data.data.isConnected) {
        setStatus('connected')
        setBrokerInfo(res.data.data)
      } else {
        setStatus('disconnected')
      }
    } catch (err) {
      setError('Could not fetch broker status.')
      setStatus('disconnected')
    }
  }

  const handleConnect = async () => {
    try {
      const res = await api.get('/upstox/login')
      if (res.data.data.loginUrl) {
        window.location.href = res.data.data.loginUrl
      }
    } catch (err) {
      setError('Failed to initiate login flow.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">Broker Terminal</h1>
        <p className="text-slate-500 font-medium">Link your Upstox account to start trading on IndiPips.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Card: Connection Status */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center justify-center min-h-[400px]"
        >
          {status === 'loading' ? (
            <RefreshCw className="text-blue-500 animate-spin" size={48} />
          ) : status === 'connected' ? (
            <>
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
                <CheckCircle2 className="text-emerald-500" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Connected!</h2>
              <p className="text-slate-500 mb-8 font-medium">Your Upstox account is linked and ready for trading.</p>
              
              <div className="w-full bg-slate-50 rounded-2xl p-4 mb-8 text-left border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Broker Identity</div>
                <div className="text-slate-900 font-bold">{brokerInfo?.brokerName || 'Upstox Trader'}</div>
              </div>

              <button className="flex items-center gap-2 text-rose-500 font-bold text-sm hover:text-rose-600 transition-colors">
                <LogOut size={16} /> Disconnect Broker
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 border border-blue-100">
                <Link2 className="text-blue-500" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No Broker Linked</h2>
              <p className="text-slate-500 mb-8 font-medium italic text-sm">"Success requires execution" — Connect your terminal to begin reaching your profit targets.</p>
              
              <button 
                onClick={handleConnect}
                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3"
              >
                <Zap size={18} fill="currentColor" /> CONNECT UPSTOX
              </button>
              
              {error && <p className="mt-4 text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={14}/> {error}</p>}
            </>
          )}
        </motion.div>

        {/* Right Card: Why Connect? */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col"
        >
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest mb-6">
            <ShieldCheck size={16} /> Security-First Architecture
          </div>
          
          <h3 className="text-xl font-bold mb-6">How connecting works:</h3>
          
          <ul className="space-y-6">
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex-shrink-0 flex items-center justify-center font-bold text-blue-400">1</div>
              <div>
                <div className="font-bold mb-1">Secure OAuth 2.0</div>
                <p className="text-slate-400 text-sm">We never see your password. You authorize Indipips directly via Upstox's secure gateway.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex-shrink-0 flex items-center justify-center font-bold text-blue-400">2</div>
              <div>
                <div className="font-bold mb-1">Real-Time Sync</div>
                <p className="text-slate-400 text-sm">Connecting syncs your phase progression and verifies rule compliance automatically.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex-shrink-0 flex items-center justify-center font-bold text-blue-400">3</div>
              <div>
                <div className="font-bold mb-1">Localized Scaling</div>
                <p className="text-slate-400 text-sm">Execute trades in INR and scale your account using our proprietary funding engine.</p>
              </div>
            </li>
          </ul>

          <div className="mt-auto pt-8 border-t border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/5">
               <img src="https://upstox.com/apple-touch-icon.png" alt="Upstox" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Official Partner</div>
              <div className="text-sm font-bold">Upstox Trading Bridge</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default BrokerConnectPage
