import { motion } from 'framer-motion'
import { Trophy, Clock, Calendar } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import { useAuth } from '../context/AuthContext'

function CompetitionsPage() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto space-y-8 p-4 md:p-10 h-full flex flex-col items-center justify-center min-h-[70vh]">
        
        {/* Main Content Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-3xl bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
           {/* Background Decorative Element */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-0"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50/50 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl -z-0"></div>

           <div className="relative z-10 flex flex-col items-center">
              {/* Animated Icon Container */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-500/30 mb-8"
              >
                <Trophy size={48} className="text-white" />
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                Trading Competitions
              </h1>
              
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold uppercase tracking-widest mb-8 border border-blue-100">
                <Clock size={16} /> Coming Soon
              </div>

              <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed font-medium">
                We're engineering an institutional-grade tournament engine. IndiPips competitions will be arriving in <span className="text-blue-600 font-bold">2-3 months</span>.
              </p>

              {/* Status Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left mb-10">
                 <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                       <Calendar size={18} className="text-slate-500" />
                    </div>
                    <div>
                       <p className="font-bold text-slate-900 text-sm">Estimated Launch</p>
                       <p className="text-xs text-slate-500">June - July 2026</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-amber-500">
                       ★
                    </div>
                    <div>
                       <p className="font-bold text-slate-900 text-sm">₹-Prizes in Crores</p>
                       <p className="text-xs text-slate-500">Institutional scale prize pools</p>
                    </div>
                 </div>
              </div>

              <div className="text-slate-400 text-sm font-medium">
                Keep honing your skills. The arena is getting ready.
              </div>
           </div>
        </motion.div>

      </div>
    </DashboardLayout>
  )
}

export default CompetitionsPage
