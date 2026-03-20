import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Share2, ChevronUp, ArrowLeft, Zap, TrendingUp, TrendingDown } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import useAuthStore from '../stores/authStore'
import useChallengeStore from '../stores/challengeStore'
import { useSocket } from '../context/SocketContext'
import QuickTradeTerminal from '../components/QuickTradeTerminal'
import ActivePositionsTable from '../components/ActivePositionsTable'
import api from '../api'
import { formatRupee } from '../utils/format'

function DashboardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { socket } = useSocket()
  const { challenges, fetchChallenges, activeChallenge, setActiveChallenge, isLoading } = useChallengeStore()
  const [livePrices, setLivePrices] = useState({})

  useEffect(() => {
    if (challenges.length === 0) {
      fetchChallenges()
    }
  }, [fetchChallenges, challenges.length])

  useEffect(() => {
    if (id && challenges.length > 0) {
      const found = challenges.find(c => c.id === id)
      if (found) setActiveChallenge(found)
    } else if (!id && challenges.length > 0) {
      setActiveChallenge(challenges[0])
    }
  }, [id, challenges, setActiveChallenge])

  // Socket listener for live price updates
  useEffect(() => {
    if (socket && activeChallenge) {
      // Subscribe to price updates
      const instruments = [
          { key: 'NSE_INDEX|Nifty 50' },
          { key: 'NSE_INDEX|Nifty Bank' },
          { key: 'NSE_EQ|INE002A01018' }
      ];
      instruments.forEach(inst => socket.emit('subscribe_price', inst.key));

      socket.on('price_update', (data) => {
        setLivePrices(prev => ({
          ...prev,
          [data.instrument]: {
            price: data.price,
            prevPrice: prev[data.instrument]?.price || data.price,
            timestamp: data.timestamp
          }
        }))
      })

      return () => socket.off('price_update');
    }
  }, [socket, activeChallenge])

  const displayData = activeChallenge;
  const isDarkMode = false; 

  const cardClass = `rounded-xl border ${isDarkMode ? 'bg-[#151b28] border-slate-700' : 'bg-white border-slate-200 shadow-sm'} p-4 md:p-6`
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900'
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500'

  if (isLoading || !displayData) {
     return <DashboardLayout><div className="flex justify-center items-center h-full">Loading account data...</div></DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-6">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard/accounts')}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xl uppercase shrink-0">
                   {user?.firstName?.charAt(0) || 'A'}
                </div>
                <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary}`}>
                  Hey, {user?.firstName}
                </h1>
              </div>
           </div>
           
           <div className="flex items-center gap-4 bg-white rounded-lg px-4 py-2 shadow-sm border border-slate-200">
               <div className="flex items-center gap-2">
                 <div className="w-5 h-5 bg-black text-white rounded flex flex-col items-center justify-center text-[10px] font-black leading-none">
                   IP
                 </div>
                 <span className="text-xs font-bold whitespace-nowrap">IndiPips®</span>
               </div>
               <div className="h-6 w-px bg-slate-200"></div>
               <span className="text-sm font-bold whitespace-nowrap">Trader Summary</span>
               <div className="h-6 w-px bg-slate-200"></div>
               <span className="text-sm text-slate-500 whitespace-nowrap">Total Allocation: <span className="font-bold text-slate-900">{formatRupee(displayData.totalAllocation)}</span></span>
           </div>

           <div className="flex items-center gap-3">
             <button 
               onClick={() => navigate('/dashboard/new-challenge')}
               className="px-4 py-2 bg-[#3b66f5] hover:bg-blue-600 transition-colors text-white text-sm font-bold rounded-lg flex items-center gap-2"
             >
                <Zap size={16} fill="white" />
                BUY CHALLENGE
             </button>
             <button className="px-4 py-2 border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 text-sm font-semibold rounded-lg flex items-center gap-2 bg-white">
                <Share2 size={16} /> Share
             </button>
           </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
           
           {/* Left Col: Live Feed & Stats */}
           <div className="lg:col-span-1 flex flex-col gap-4 md:gap-6">
              <div className={`${cardClass} bg-[#111827] text-white border-0 shadow-xl shadow-blue-900/10`}>
                 <div className="flex justify-between items-center mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Live Market Feed</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Live</span>
                 </div>
                  <div className="divide-y divide-slate-800">
                    {(displayData.instruments || [
                        { name: 'NIFTY 50', key: 'NSE_INDEX|Nifty 50' },
                        { name: 'BANK NIFTY', key: 'NSE_INDEX|Nifty Bank' },
                        { name: 'RELIANCE', key: 'NSE_EQ|INE002A01018' }
                    ]).map((inst, i) => {
                       const live = livePrices[inst.key];
                       const direction = live?.price > live?.prevPrice ? 'up' : live?.price < live?.prevPrice ? 'down' : 'stable';
                       return (
                          <div key={i} className="py-3 flex justify-between items-center">
                             <div>
                                <span className="text-sm font-bold block">{inst.name}</span>
                                <span className="text-[10px] text-slate-500 font-medium">NSE / MCX</span>
                             </div>
                             <div className="text-right">
                                <div className={`text-sm font-bold flex items-center gap-1 ${direction === 'up' ? 'text-emerald-400' : direction === 'down' ? 'text-rose-400' : 'text-white'}`}>
                                   {direction === 'up' ? <TrendingUp size={14} /> : direction === 'down' ? <TrendingDown size={14} /> : null}
                                   {live?.price ? formatRupee(live.price, false) : '---'}
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">LTP</div>
                             </div>
                          </div>
                       )
                    })}
                  </div>
              </div>
              
              {/* Bronze Level Card */}
              <div className="rounded-xl bg-gradient-to-r from-black to-[#2A1808] text-white p-6 relative overflow-hidden h-[180px] shadow-lg">
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-10 opacity-40">
                    <img src="https://ui-avatars.com/api/?name=P&background=D27D2D&color=fff&rounded=true&size=200" alt="Bronze Badge" className="w-[200px] h-[200px] blur-[2px] grayscale-[50%] brightness-150" />
                 </div>
                 <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                       <p className="text-sm text-slate-400 font-medium">Your Level</p>
                       <h2 className="text-2xl font-bold">Bronze</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       <div><p className="text-xs text-slate-400 mb-1">Total Reward</p><p className="font-bold">₹{displayData.totalReward.toFixed(2)}</p></div>
                       <div><p className="text-xs text-slate-400 mb-1">Highest Reward</p><p className="font-bold">₹{displayData.highestReward.toFixed(2)}</p></div>
                       <div><p className="text-xs text-slate-400 mb-1">Count</p><p className="font-bold">{displayData.count}</p></div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Middle Col: Bias & QUICK TRADE TERMINAL */}
           <div className="lg:col-span-1 flex flex-col gap-4 md:gap-6">
              <div className="flex-1">
                 <QuickTradeTerminal challenge={displayData} livePrices={livePrices} />
              </div>
              <div className={`${cardClass} h-[180px]`}>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-sm font-semibold ${textSecondary}`}>Behavioral Bias</h3>
                    <span className={`text-sm font-semibold ${textPrimary}`}>{displayData.totalTrades} Trades</span>
                 </div>
                 <div className="flex justify-between items-center mb-6 text-2xl font-bold text-slate-900">
                    Neutral
                 </div>
                 <div className="w-full h-2 bg-slate-100 rounded-full mb-2 overflow-hidden flex">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `52%` }}></div>
                 </div>
              </div>
           </div>

           {/* Right Col: Performance & Profitability */}
           <div className="lg:col-span-1 flex flex-col gap-4 md:gap-6">
              <div className={`${cardClass} flex-1`}>
                 <h3 className={`text-sm font-semibold ${textSecondary} mb-4`}>Performance History</h3>
                 <div className="h-44 flex items-end justify-between gap-1 mt-4">
                    {[65, 45, 85, 30, 95, 60, 75].map((val, i) => (
                       <div key={i} className="flex-1 bg-blue-500/10 rounded-t-lg transition-all hover:bg-blue-500/20" style={{ height: `${val}%` }}></div>
                    ))}
                 </div>
              </div>
              <div className={`${cardClass} h-[180px] flex flex-col justify-between`}>
                 <div className="flex justify-between items-center">
                    <h3 className={`text-sm font-semibold ${textSecondary}`}>Win Rate</h3>
                    <span className={`text-xs font-bold text-emerald-500`}>{displayData.winRate}% PROFITABLE</span>
                 </div>
                 <div className="flex items-center justify-center h-full gap-8">
                    <div className="relative w-20 h-20">
                       <svg className="w-20 h-20 transform -rotate-90">
                          <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                          <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-emerald-500" strokeDasharray={213.6} strokeDashoffset={213.6 - (213.6 * displayData.winRate) / 100} />
                       </svg>
                       <div className="absolute inset-0 flex items-center justify-center font-black text-sm">{displayData.winRate}%</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Positions Table Section */}
        <div className="pt-2 pb-12">
           <ActivePositionsTable challengeId={id} livePrices={livePrices} />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage