import { useState, useEffect } from 'react'
import { XCircle, Loader2, ArrowUpRight, ArrowDownRight, Clock, Target } from 'lucide-react'
import api from '../api'
import { formatRupee } from '../utils/format'

function ActivePositionsTable({ challengeId, livePrices }) {
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [closingId, setClosingId] = useState(null)

  const fetchPositions = async () => {
    try {
      const res = await api.get(`/trades/active/${challengeId || ''}`)
      if (res.data?.success) {
        setPositions(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch positions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPositions()
    // Poll every 10 seconds as fallback to socket updates
    const interval = setInterval(fetchPositions, 10000)
    return () => clearInterval(interval)
  }, [challengeId])

  const handleClose = async (tradeId) => {
    const trade = positions.find(p => p.id === tradeId)
    const currentPrice = livePrices[trade.symbol]?.price
    
    if (!currentPrice) {
      alert('Cannot close trade: Live price not available.')
      return
    }

    setClosingId(tradeId)
    try {
      await api.post('/trades/close', {
        tradeId,
        exitPrice: currentPrice
      })
      setPositions(prev => prev.filter(p => p.id !== tradeId))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close trade.')
    } finally {
      setClosingId(null)
    }
  }

  if (loading && positions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="text-blue-500 animate-spin" size={32} />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Syncing Positions...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-500/20">
               <Target size={18} />
            </div>
            <div>
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Positions</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time Trading Bridge</p>
            </div>
         </div>
         <div className="bg-white px-3 py-1.5 rounded-full border border-slate-200 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{positions.length} OPEN</span>
         </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/30">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Instrument</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">LTP</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">PnL (Real-time)</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {positions.length === 0 ? (
               <tr>
                 <td colSpan="7" className="px-6 py-12 text-center">
                    <p className="text-slate-400 text-sm font-medium italic">No active positions found.</p>
                 </td>
               </tr>
            ) : (
              positions.map((pos) => {
                const live = livePrices[pos.symbol]?.price;
                const pnl = live 
                  ? (pos.tradeType === 'BUY' ? (live - pos.entryPrice) : (pos.entryPrice - live)) * pos.quantity
                  : 0;
                const isProfit = pnl >= 0;

                return (
                  <tr key={pos.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <span className="text-sm font-black text-slate-900">{pos.symbol.split('|')[1] || pos.symbol}</span>
                       <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{pos.symbol.split('|')[0]}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${pos.tradeType === 'BUY' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {pos.tradeType}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{pos.quantity}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{formatRupee(pos.entryPrice, false)}</td>
                    <td className={`px-6 py-4 text-sm font-black tabular-nums ${live ? 'text-slate-900' : 'text-slate-300'}`}>
                       {live ? formatRupee(live, false) : '---'}
                    </td>
                    <td className="px-6 py-4">
                       <div className={`flex items-center gap-1 font-black text-sm ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isProfit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {formatRupee(Math.abs(pnl), false)}
                       </div>
                       <div className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={8} /> {new Date(pos.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => handleClose(pos.id)}
                         disabled={closingId === pos.id}
                         className="p-2 text-slate-400 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-50 active:scale-90 disabled:opacity-50"
                         title="Close Position"
                       >
                          {closingId === pos.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                       </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer / Summary */}
      {positions.length > 0 && (
         <div className="px-6 py-4 bg-slate-900 flex justify-between items-center text-white">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Portfolio P&L</span>
            <div className="flex items-center gap-2">
               <span className="text-lg font-black tracking-tight">
                  {formatRupee(positions.reduce((acc, pos) => {
                     const live = livePrices[pos.symbol]?.price;
                     return acc + (live ? (pos.tradeType === 'BUY' ? (live - pos.entryPrice) : (pos.entryPrice - live)) * pos.quantity : 0);
                  }, 0), false)}
               </span>
               <div className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-black uppercase tracking-widest text-emerald-400">Live</div>
            </div>
         </div>
      )}
    </div>
  )
}

export default ActivePositionsTable
