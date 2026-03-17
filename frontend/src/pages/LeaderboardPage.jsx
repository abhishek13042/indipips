import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Calendar } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import { useAuth } from '../context/AuthContext'

function LeaderboardPage() {
  const { user } = useAuth()
  const [activeSize, setActiveSize] = useState('10k')
  
  const sizes = ['5k', '10k', '25k', '50k', '100k', '200k', 'All']

  // Mock highly detailed leaderboard data
  const topMetrics = [
    { title: 'HIGHEST TOTAL REWARDS', value: '$8,240.00', name: 'Suraj W', country: '🇮🇳', type: 'coins' },
    { title: 'LONGEST MASTER ACC DURATION', value: '841 days', name: 'Chauhan H', country: '🇮🇳', type: 'calendar' },
    { title: 'HIGHEST SINGLE REWARD', value: '$8,240.00', name: 'Suraj W', country: '🇮🇳', type: 'coins' },
    { title: 'HIGHEST TOTAL REWARDS COUNT', value: '19', name: 'Layla Z', country: '🇲🇦', type: 'stack' },
  ]

  const leaderboardData = [
    { rank: 1, name: 'Anuj K', flag: '🇮🇳', profit: '+$2,773.97', profitPct: '+27.74%', win: '59.3%', pair: 'XAUUSD', avgWin: '$268.41', avgLoss: '-$138.24', avgDur: '1h 49m', trades: 27, losingStreak: 3 },
    { rank: 2, name: 'Siswandy S', flag: '🇮🇩', profit: '+$2,678.56', profitPct: '+26.79%', win: '85.7%', pair: 'XAUUSD', avgWin: '$117.78', avgLoss: '-$37.03', avgDur: '1h', trades: 28, losingStreak: 1 },
    { rank: 3, name: 'Angelina S', flag: '🇦🇺', profit: '+$2,478.96', profitPct: '+24.79%', win: '36.4%', pair: 'XAUUSD', avgWin: '$790.08', avgLoss: '-$97.34', avgDur: '1h 22m', trades: 11, losingStreak: 7 },
    { rank: 4, name: 'Kenneth M', flag: '🇿🇦', profit: '+$2,234.82', profitPct: '+22.35%', win: '41.2%', pair: 'EURUSD', avgWin: '$106.70', avgLoss: '-$35.20', avgDur: '3h', trades: 102, losingStreak: 8 }
  ]

  const getShieldColor = (rank) => {
     if (rank === 1) return 'bg-yellow-500 shadow-yellow-500/50'
     if (rank === 2) return 'bg-slate-300 shadow-slate-400/50'
     if (rank === 3) return 'bg-amber-700 shadow-amber-700/50'
     return 'bg-slate-100 text-slate-400 border-slate-200 shadow-none'
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 p-2 md:p-6 h-full flex flex-col pb-20">
        
        {/* Header Ribbon & Account Size Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg">
                 {user?.firstName?.charAt(0) || 'A'}
              </div>
              <h1 className="text-2xl text-slate-900">Hey, <span className="font-bold">{user?.firstName || 'Abhishek'}</span></h1>
           </div>
           
           <div className="flex items-center gap-4 bg-white rounded-full border border-slate-200 p-1.5 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 pl-3">Account Size:</span>
              <div className="flex gap-1">
                 {sizes.map(size => (
                    <button
                       key={size}
                       onClick={() => setActiveSize(size)}
                       className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                          activeSize === size 
                            ? 'bg-[#3b66f5] text-white' 
                            : 'text-slate-600 hover:bg-slate-100'
                       }`}
                    >
                       {size}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Top Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
           {topMetrics.map((metric, i) => (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               key={i} 
               className="bg-[#3b66f5] rounded-2xl p-6 text-white flex justify-between items-center shadow-md relative overflow-hidden group"
             >
                <div className="z-10 relative">
                   <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-2">{metric.title}</p>
                   <p className="text-2xl font-bold mb-2">{metric.value}</p>
                   <p className="text-xs font-bold flex items-center gap-1.5 text-blue-100">
                      {metric.name} <span className="text-lg leading-none">{metric.country}</span>
                   </p>
                </div>
                {/* Simulated 3D Icon placement based on type */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 opacity-70 group-hover:opacity-100 transition-opacity">
                   {metric.type === 'coins' && (
                     <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-xl border-4 border-yellow-500 rotate-12 -mr-6">
                        <span className="text-5xl drop-shadow-lg font-bold text-yellow-600">$</span>
                     </div>
                   )}
                   {metric.type === 'calendar' && (
                     <div className="w-20 h-24 bg-yellow-400 rounded-xl flex items-center justify-center shadow-xl border-4 border-yellow-500 -mr-4 flex-col gap-1 pt-2">
                        <div className="w-full border-b-4 border-yellow-600 mb-1 px-4"></div>
                        <span className="text-3xl">⭐</span>
                     </div>
                   )}
                   {metric.type === 'stack' && (
                     <div className="flex flex-col gap-1 -mr-2">
                        <div className="w-16 h-4 bg-yellow-400 rounded-full border border-yellow-600 shadow-md"></div>
                        <div className="w-16 h-4 bg-yellow-400 rounded-full border border-yellow-600 shadow-md translate-x-1"></div>
                        <div className="w-16 h-4 bg-yellow-400 rounded-full border border-yellow-600 shadow-md translate-x-2"></div>
                     </div>
                   )}
                </div>
             </motion.div>
           ))}
        </div>

        {/* Main Table */}
        <div className="flex-1 mt-4">
           
           <div className="flex items-center gap-2 mb-6 text-slate-900 border-b border-slate-200 pb-4">
              <Trophy size={20} className="text-yellow-500" />
              <h2 className="text-lg font-bold">Leaderboard</h2>
           </div>

           <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-y-2">
                 <thead>
                    <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-4">
                       <th className="px-4 py-3">Rank</th>
                       <th className="px-4 py-3">Trader</th>
                       <th className="px-4 py-3 text-center">Country</th>
                       <th className="px-4 py-3">Profit</th>
                       <th className="px-4 py-3">Profit %</th>
                       <th className="px-4 py-3 text-center">Win Ratio</th>
                       <th className="px-4 py-3">Pair</th>
                       <th className="px-4 py-3">Avg. Win</th>
                       <th className="px-4 py-3">Avg. Loss</th>
                       <th className="px-4 py-3">Avg. Duration</th>
                       <th className="px-4 py-3 text-center">Trades</th>
                       <th className="px-4 py-3 text-center">Losing Streak</th>
                    </tr>
                 </thead>
                 <tbody>
                    {leaderboardData.map((row) => (
                       <tr key={row.rank} className="bg-white border-b hover:bg-slate-50 transition-colors rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                          
                          <td className="px-4 py-5 rounded-l-xl">
                             <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm border-2 border-white ${getShieldColor(row.rank)} ${row.rank > 3 ? 'bg-slate-100 text-slate-500' : 'text-white'}`}>
                                   {row.rank <= 3 ? <div className="w-4 h-5 rounded-t-full rounded-b border border-white/50 bg-white/20"></div> : null}
                                </div>
                                <span className={`font-bold text-xs ${row.rank <= 3 ? 'text-yellow-500' : 'text-slate-400'}`}>#{row.rank}</span>
                             </div>
                          </td>
                          
                          <td className="px-4 py-5 font-semibold text-slate-800">{row.name}</td>
                          <td className="px-4 py-5 text-center text-xl leading-none">{row.flag}</td>
                          
                          <td className="px-4 py-5 font-bold text-green-500">{row.profit}</td>
                          <td className="px-4 py-5 font-bold text-green-500">{row.profitPct}</td>
                          
                          <td className="px-4 py-5 text-center text-slate-800 font-semibold border-l border-r border-slate-100">
                             <div className="flex items-center justify-center gap-2">
                                <div className="w-1 h-3 bg-yellow-400 rounded-full"></div>
                                {row.win}
                             </div>
                          </td>
                          
                          <td className="px-4 py-5">
                             <span className="px-3 py-1 bg-indigo-50 text-indigo-500 text-xs font-bold rounded-full border border-indigo-100">
                                {row.pair}
                             </span>
                          </td>
                          
                          <td className="px-4 py-5 font-semibold text-green-500">{row.avgWin}</td>
                          <td className="px-4 py-5 font-semibold text-red-500">{row.avgLoss}</td>
                          
                          <td className="px-4 py-5 text-slate-600 font-medium">
                             <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-slate-400" /> {row.avgDur}
                             </div>
                          </td>
                          
                          <td className="px-4 py-5 text-center text-slate-800 font-semibold">{row.trades}</td>
                          <td className="px-4 py-5 text-center font-bold outline-none rounded-r-xl">
                             <span className="text-red-500">{row.losingStreak}</span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

        </div>

      </div>
    </DashboardLayout>
  )
}

export default LeaderboardPage
