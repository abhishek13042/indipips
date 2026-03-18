import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, Info, AlertTriangle, TrendingUp, Filter } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import { economicEvents } from '../data/EconomicEvents'

function CalendarPage() {
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-600 border-red-200'
      case 'Medium': return 'bg-amber-100 text-amber-600 border-amber-200'
      case 'Low': return 'bg-green-100 text-green-600 border-green-200'
      default: return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  }

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto space-y-8 p-4 md:p-10 h-full flex flex-col pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                 <CalendarIcon className="text-[#3b66f5]" size={32} />
                 Economic Calendar
              </h1>
              <p className="text-slate-500 font-medium mt-1">Indian Market Events & Market Moving Indicators</p>
           </div>
           
           <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                 <Filter size={16} /> Filters
              </button>
              <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100">
                 Next 30 Days
              </div>
           </div>
        </div>

        {/* Calendar Grid/List */}
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Event</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Impact</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actual</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Forecast</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Previous</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {economicEvents.map((item) => (
                       <motion.tr 
                          key={item.id}
                          whileHover={{ backgroundColor: 'rgba(248, 250, 252, 0.5)' }}
                          className="group transition-colors"
                       >
                          <td className="px-8 py-6">
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800">{formatDate(item.date)}</span>
                                <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                   <Clock size={12} /> {item.time} IST
                                </span>
                             </div>
                          </td>
                          <td className="px-8 py-6 max-w-sm">
                             <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold text-slate-900 leading-tight group-hover:text-[#3b66f5] transition-colors cursor-help" title={item.description}>
                                   {item.event}
                                </span>
                                <span className="text-[10px] text-slate-400 line-clamp-1 italic font-medium">
                                   {item.description}
                                </span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getImpactColor(item.impact)}`}>
                                {item.impact === 'High' && <AlertTriangle size={10} />}
                                {item.impact}
                             </div>
                          </td>
                          <td className="px-6 py-6 text-right font-black text-slate-900 text-sm">{item.actual}</td>
                          <td className="px-6 py-6 text-right font-bold text-slate-500 text-sm">{item.forecast}</td>
                          <td className="px-6 py-6 text-right font-bold text-slate-500 text-sm">{item.previous}</td>
                       </motion.tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Educational/Disclaimer Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 bg-[#3b66f5]/5 border border-[#3b66f5]/10 rounded-2xl p-6 flex gap-5">
              <div className="w-12 h-12 rounded-xl bg-[#3b66f5] flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                 <Info className="text-white" size={24} />
              </div>
              <div>
                 <h4 className="font-bold text-slate-900 mb-1">Trader Intelligence</h4>
                 <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    Economic events can trigger extreme volatility. At IndiPips, we encourage traders to be mindful of <span className="text-red-500 font-bold">High Impact</span> events. High-news volatility may lead to slippage.
                 </p>
              </div>
           </div>
           
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
              <TrendingUp className="absolute -right-4 -bottom-4 text-white/5" size={120} />
              <div className="relative z-10">
                 <h4 className="font-bold text-white mb-1">Market Sentiment</h4>
                 <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    RBI Policy is the primary driver of INR pair volatility this month.
                 </p>
              </div>
              <button className="relative z-10 w-full mt-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all backdrop-blur-sm border border-white/5">
                 View Historical Analysis
              </button>
           </div>
        </div>

      </div>
    </DashboardLayout>
  )
}

export default CalendarPage
