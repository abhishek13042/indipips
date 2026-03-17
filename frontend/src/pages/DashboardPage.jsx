import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Share2, ChevronUp, ArrowLeft } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import api from '../api'

function DashboardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)

  // Using mock data for UI replication since API might not match screenshot exactly
  const mockData = {
    totalAllocation: 0.00,
    totalTrades: 647,
    level: 'Bronze',
    totalReward: 0.00,
    highestReward: 0.00,
    count: 0,
    winRate: 21.9,
    won: 142,
    lost: 505,
    avgHolding: '18m',
    sessions: [
      { name: 'New York', percent: 27.4, val: 27.4 },
      { name: 'London', percent: 17.4, val: 17.4 },
      { name: 'Asia', percent: 22.0, val: 22.0 }
    ],
    instruments: [
      { name: 'GBPUSD', w: 42, l: 165 },
      { name: 'XAUUSD', w: 35, l: 132 },
      { name: 'EURUSD', w: 30, l: 89 }
    ]
  }

  useEffect(() => {
    const fetchRealData = async () => {
       try {
         const res = await api.get(`/challenges/${id}`)
         if (res.data?.data) {
           setChallenge(res.data.data)
         }
       } catch (err) {
         console.warn("Using mock data")
         setChallenge({ id, ...mockData })
       } finally {
         setLoading(false)
       }
    }
    if (id) fetchRealData()
    else setLoading(false)
  }, [id])

  // Simulating light/dark mode for the inner components. 
  // Normally we would pull this state from a higher level context or use Tailwind's dark class
  const isDarkMode = false; 

  const cardClass = `rounded-xl border ${isDarkMode ? 'bg-[#151b28] border-slate-700' : 'bg-white border-slate-200 shadow-sm'} p-4 md:p-6`
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900'
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500'

  if (loading) {
     return <DashboardLayout><div className="flex justify-center items-center h-full">Loading...</div></DashboardLayout>
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
                  Hey, {user?.firstName || 'Abhishek'}
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
               <span className="text-sm text-slate-500 whitespace-nowrap">Total Allocation: <span className="font-bold text-slate-900">${mockData.totalAllocation.toFixed(2)}</span></span>
           </div>

           <div className="flex items-center gap-3">
             <button className="px-4 py-2 bg-[#3b66f5] hover:bg-blue-600 transition-colors text-white text-sm font-bold rounded-lg flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white rounded flex items-center justify-center border-dashed"></span>
                BUY CHALLENGE
             </button>
             <button className="px-4 py-2 border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 text-sm font-semibold rounded-lg flex items-center gap-2 bg-white">
                <Share2 size={16} /> Share
             </button>
           </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
           
           {/* Left Col: No Data Box & Bronze Banner */}
           <div className="lg:col-span-1 flex flex-col gap-4 md:gap-6">
              <div className="bg-[#3b66f5] rounded-xl flex-1 min-h-[200px] flex items-center justify-center shadow-sm">
                 <span className="text-blue-200 text-sm font-medium">No data available</span>
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
                       <div>
                          <p className="text-xs text-slate-400 mb-1">Total Reward</p>
                          <p className="font-bold">${mockData.totalReward.toFixed(2)}</p>
                       </div>
                       <div>
                          <p className="text-xs text-slate-400 mb-1">Highest Reward</p>
                          <p className="font-bold">${mockData.highestReward.toFixed(2)}</p>
                       </div>
                       <div>
                          <p className="text-xs text-slate-400 mb-1">Count</p>
                          <p className="font-bold">{mockData.count}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Middle Col: Bias & Progress Stats & Profitability */}
           <div className="lg:col-span-1 flex flex-col gap-4 md:gap-6">
              
              {/* Behavioral Bias */}
              <div className={`${cardClass} flex-1`}>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-sm font-semibold ${textSecondary}`}>Behavioral Bias</h3>
                    <span className={`text-sm font-semibold ${textPrimary}`}>Total Trades: {mockData.totalTrades}</span>
                 </div>
                 
                 <div className="flex justify-between items-center mb-6">
                    <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-3xl">🐻</div>
                    <h2 className={`text-2xl font-bold ${textPrimary}`}>Neutral</h2>
                    <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-3xl">🐂</div>
                 </div>

                 <div className="w-full h-2 bg-slate-200 rounded-full mb-2 overflow-hidden flex">
                    <div className="h-full bg-slate-300" style={{ width: '56.3%' }}></div>
                    <div className="h-full bg-[#111827] w-2 rounded-full relative -left-1"></div>
                 </div>
                 <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>364 (56.3%)</span>
                    <ChevronUp size={14} className="text-slate-400" />
                    <span>283 (43.7%)</span>
                 </div>
              </div>

              {/* Profitability Donut Placeholder */}
              <div className={`${cardClass} h-[180px] flex flex-col justify-between`}>
                 <div className="flex justify-between items-center z-10">
                    <h3 className={`text-sm font-semibold ${textSecondary}`}>Profitability</h3>
                    <span className={`text-sm font-semibold ${textSecondary}`}>Avg Holding Period: <span className={textPrimary}>{mockData.avgHolding}</span></span>
                 </div>

                 <div className="flex items-end justify-between px-2 relative">
                    <div className="text-left w-20">
                       <p className={`text-xs ${textSecondary}`}>Won</p>
                       <p className={`text-xl font-bold ${textPrimary}`}>{mockData.winRate}%</p>
                       <p className={`text-xs ${textSecondary}`}>{mockData.won}</p>
                    </div>

                    <div className="w-40 h-20 overflow-hidden relative flex flex-col justify-end items-center">
                       {/* Semi circle arc representing 21.9% vs 78.1% */}
                       <div className="w-40 h-40 rounded-full border-[12px] border-slate-100 absolute bottom-0 left-0" 
                            style={{ 
                               borderTopColor: '#00D084',  /* green for right/win */
                               borderRightColor: '#00D084',
                               borderBottomColor: '#FF6B6B', /* red for left/loss */
                               borderLeftColor: '#FF6B6B',
                               transform: 'rotate(120deg)' 
                            }}>
                       </div>
                       
                       <div className="relative z-10 text-center bg-white w-24 h-12 rounded-t-full pt-1">
                          <p className={`text-[10px] ${textSecondary}`}>Trades Taken</p>
                          <p className={`text-lg font-bold leading-tight ${textPrimary}`}>{mockData.totalTrades}</p>
                          <p className={`text-[8px] ${textSecondary}`}>Winrate: {mockData.winRate}%</p>
                       </div>
                    </div>

                    <div className="text-right w-20">
                       <p className={`text-xs ${textSecondary}`}>Lost</p>
                       <p className={`text-xl font-bold ${textPrimary}`}>{100 - mockData.winRate}%</p>
                       <p className={`text-xs ${textSecondary}`}>{mockData.lost}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Col: Bar Chart & Instruments */}
           <div className="lg:col-span-1 flex flex-col gap-4 md:gap-6">
              
              {/* Trading Day Performance (Bar Chart Replica) */}
              <div className={`${cardClass} flex-1`}>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-sm font-semibold ${textSecondary}`}>Trading Day Performance</h3>
                    <span className={`text-sm font-semibold ${textSecondary}`}>Best Day: <span className={textPrimary}>Thu</span></span>
                 </div>
                 
                 <div className="flex items-end justify-between h-32 pt-4 px-2">
                    {[
                      { l: 'Sun', v: 47, isPos: true },
                      { l: 'Mon', v: 56, isPos: false },
                      { l: 'Tue', v: 35, isPos: false },
                      { l: 'Wed', v: 54, isPos: false },
                      { l: 'Thu', v: 89, isPos: false },
                      { l: 'Fri', v: 32, isPos: false }
                    ].map((bar, i) => (
                       <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer w-[12%]">
                          <div className={`w-full rounded-md transition-all ${bar.isPos ? 'bg-[#00D084] group-hover:bg-[#00e691]' : 'bg-[#FF6B6B] group-hover:bg-[#ff8585]'}`} style={{ height: `${Math.max(bar.v, 15)}%` }}></div>
                          <div className="text-center">
                             <p className={`text-[10px] font-bold ${textPrimary}`}>{bar.isPos ? '+' : '-'}${bar.v}</p>
                             <p className={`text-[9px] ${textSecondary}`}>{bar.l}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Sessions & Instruments Placeholder Area */}
              <div className="flex gap-4 md:gap-6 h-[180px]">
                 
                 {/* Instruments */}
                 <div className={`${cardClass} flex-1 flex flex-col justify-between py-4 px-5`}>
                     <h3 className={`text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3`}>Most Traded 3 Instruments</h3>
                     <div className="space-y-4">
                        {mockData.instruments.map((inst, i) => {
                           const total = inst.w + inst.l;
                           const wPct = (inst.w / total) * 100;
                           return (
                              <div key={i} className="flex items-center gap-3">
                                 <span className={`text-sm font-bold w-16 ${textPrimary}`}>{inst.name}</span>
                                 <div className="flex-1 h-3 flex overflow-hidden rounded">
                                    <div className="bg-[#00D084]" style={{ width: `${wPct}%` }}></div>
                                    <div className="bg-[#FF6B6B]" style={{ width: `${100 - wPct}%` }}></div>
                                 </div>
                                 <span className={`text-xs font-bold w-16 text-right ${textPrimary}`}>{inst.w}W / {inst.l}L</span>
                              </div>
                           )
                        })}
                     </div>
                 </div>

              </div>

           </div>
           
           {/* Bottom Full Width - Sessions Win Rates (Mockup requires moving it out of the 3 col grid or tweaking) */}
           <div className="lg:col-span-3 pb-8">
              <div className={`${cardClass} flex flex-col justify-center py-5 px-6`}>
                 <h3 className={`text-xs text-slate-400 uppercase tracking-wider font-semibold mb-4`}>Session Win Rates</h3>
                 <div className="space-y-5">
                    {mockData.sessions.map((session, i) => (
                       <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <span className={`text-sm font-bold w-20 ${textPrimary}`}>{session.name}</span>
                          <div className="flex-1 h-2 relative rounded-full bg-slate-200">
                             <div className="absolute top-0 left-0 h-full bg-[#3b66f5] rounded-full" style={{ width: `${session.percent}%` }}></div>
                             <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full shadow border border-white" style={{ left: `calc(${session.percent}% - 4px)` }}></div>
                          </div>
                          <span className={`text-sm font-bold w-12 text-right ${textPrimary}`}>{session.percent}%</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
           
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage