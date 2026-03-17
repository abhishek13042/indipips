import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tag, Users, CheckCircle2 } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import { useAuth } from '../context/AuthContext'

function CompetitionsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Fundingpips')

  const tabs = ['Joined', 'Fundingpips', 'Championships', 'Hosted']

  const competitions = [
    { month: 'March 2026', title: 'March 2026 Monthly Competition', endingIn: '13:16:24:23', isOngoing: true },
    { month: 'February 2026', title: 'February 2026 Monthly Competition', endingIn: '00:00:00', isOngoing: false },
    { month: 'January 2026', title: 'January 2026 Monthly Competition', endingIn: '00:00:00', isOngoing: false },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto space-y-8 p-2 md:p-6 h-full flex flex-col pb-20">
        
        {/* Header Ribbon */}
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg">
              {user?.firstName?.charAt(0) || 'A'}
           </div>
           <h1 className="text-2xl text-slate-900">Hey, <span className="font-bold">{user?.firstName || 'Abhishek'}</span></h1>
        </div>

        {/* Hero Banner Component */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border text-left border-slate-200 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden"
        >
           {/* Information Left Side */}
           <div className="flex-1 z-10 relative">
              <p className="text-sm font-semibold text-slate-500 mb-2">Monthly Competition</p>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">March 2026 Monthly Competition</h2>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 mb-8">
                 <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500 fill-green-100" /> Ongoing</span>
                 <span className="flex items-center gap-1.5"><Tag size={14} /> matchtrader</span>
                 <span className="flex items-center gap-1.5"><Users size={14} /> 46,841</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8 max-w-md">
                 <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Starts</p>
                    <p className="font-bold text-slate-800 text-sm">Mar 2, 2026</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Ends</p>
                    <p className="font-bold text-slate-800 text-sm">Mar 31, 2026</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Ending In</p>
                    <p className="font-bold text-slate-800 text-sm">13:16:24:24</p>
                 </div>
              </div>

              <div className="flex items-center gap-6">
                 <button className="px-8 py-2.5 bg-[#3b66f5] hover:bg-blue-600 transition-colors text-white font-bold rounded-xl shadow-lg shadow-blue-500/30">
                    View
                 </button>
                 <button className="text-slate-600 font-bold hover:text-slate-900 transition-colors text-sm">
                    Show Prizepool
                 </button>
                 <button className="text-slate-600 font-bold hover:text-slate-900 transition-colors text-sm">
                    More Info
                 </button>
              </div>
           </div>

           {/* Hero Image Right Side */}
           <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#e6f0ff] to-transparent items-center justify-end pr-10">
              <img 
                src="https://cdn3d.iconscout.com/3d/premium/thumb/trophy-4620608-3832145.png" 
                alt="3D Trophy" 
                className="w-64 h-64 object-contain drop-shadow-2xl translate-y-4"
              />
           </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-end border-b border-slate-200 mt-8 mb-6">
           {tabs.map(tab => (
              <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
                    activeTab === tab 
                      ? 'border-[#3b66f5] text-[#3b66f5]' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                 }`}
              >
                 {tab}
              </button>
           ))}
        </div>

        {/* Competitions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {competitions.map((comp, i) => (
              <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 + (i * 0.1) }}
                 key={i} 
                 className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              >
                 <div className="flex justify-between items-center mb-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
                       {comp.endingIn}
                    </span>
                 </div>
                 <h3 className="font-bold text-slate-900 text-base">{comp.title}</h3>
              </motion.div>
           ))}
        </div>

      </div>
    </DashboardLayout>
  )
}

export default CompetitionsPage
