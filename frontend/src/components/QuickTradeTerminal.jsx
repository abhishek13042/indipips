import { useState, useEffect } from 'react'
import { Zap, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, History } from 'lucide-react'
import api from '../api'
import { formatRupee } from '../utils/format'

function QuickTradeTerminal({ challenge, livePrices }) {
  const [symbol, setSymbol] = useState('')
  const [tradeType, setTradeType] = useState('BUY')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (challenge?.instruments?.length > 0) {
      setSymbol(challenge.instruments[0].key)
    }
  }, [challenge])

  const handleTrade = async (type) => {
    setLoading(true)
    setError('')
    setSuccess('')
    setTradeType(type)

    const currentPrice = livePrices[symbol]?.price
    if (!currentPrice) {
      setError('Live price not available for this instrument.')
      setLoading(false)
      return
    }

    try {
      await api.post('/trades/open', {
        challengeId: challenge.id,
        symbol,
        tradeType: type,
        quantity,
        entryPrice: currentPrice
      })
      setSuccess(`${type} order executed successfully!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Trade execution failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full">
      {/* Terminal Header */}
      <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-white text-xs font-black uppercase tracking-widest">Execution Engine</span>
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Low Latency Mode</div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Symbol Selection */}
        <div className="mb-6">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Select Instrument</label>
          <select 
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
          >
            {challenge?.instruments?.map((inst, i) => (
              <option key={i} value={inst.key}>{inst.name}</option>
            ))}
          </select>
        </div>

        {/* Live Display & Settings */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Live Price</span>
              <div className="text-xl font-black text-slate-900 tabular-nums">
                 {livePrices[symbol]?.price ? formatRupee(livePrices[symbol].price, false) : '---'}
              </div>
           </div>
           <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Quantity</span>
              <input 
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="w-full bg-transparent text-xl font-black text-slate-900 border-none p-0 focus:ring-0"
              />
           </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <button
            onClick={() => handleTrade('BUY')}
            disabled={loading}
            className="group relative overflow-hidden py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
               <TrendingUp size={18} /> BUY
            </div>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>

          <button
            onClick={() => handleTrade('SELL')}
            disabled={loading}
            className="group relative overflow-hidden py-4 rounded-2xl bg-rose-500 text-white font-black text-sm hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50"
          >
             <div className="relative z-10 flex items-center justify-center gap-2">
               <TrendingDown size={18} /> SELL
            </div>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
           <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
             <AlertCircle size={14} /> {error}
           </div>
        )}
        {success && (
           <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
             <CheckCircle2 size={14} /> {success}
           </div>
        )}
      </div>

      {/* Terminal Footer */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
         <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Zap size={10} fill="currentColor" /> Broker: {challenge?.isLive ? 'Upstox' : 'Simulation'}
         </div>
         <button className="text-[10px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
            <History size={10} /> View Logs
         </button>
      </div>
    </div>
  )
}

export default QuickTradeTerminal
