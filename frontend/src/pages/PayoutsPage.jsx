import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Award } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'

function PayoutsPage() {
  const navigate = useNavigate()

  // Empty state data logic as requested to match the mock UI connection
  const payouts = []

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 p-2 md:p-6 h-full flex flex-col">
        
        {/* Header Ribbon */}
        <div className="flex items-center gap-4 mb-2">
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-black text-white rounded flex flex-col items-center justify-center text-[10px] font-black leading-none">
               IP
             </div>
             <span className="text-sm font-bold whitespace-nowrap">IndiPips®</span>
           </div>
           <div className="h-6 w-px bg-slate-200"></div>
           <h1 className="text-2xl font-bold text-slate-900">Rewards</h1>
        </div>

        {/* Top Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
           {/* Left Card: Certificate Status */}
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm"
           >
              <div className="text-slate-500 mb-4">
                 <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">No Certificate Available</h2>
              <p className="text-slate-600 text-sm max-w-sm mb-2">
                 You'll earn your reward certificate once you start receiving rewards.
              </p>
              <p className="text-slate-400 text-sm">
                 Keep trading to unlock your achievements!
              </p>
           </motion.div>

           {/* Right Card: Request Reward */}
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col justify-center shadow-sm"
           >
              <h2 className="text-lg font-bold text-slate-900 mb-2">Ready to request your reward?</h2>
              <p className="text-slate-600 text-sm max-w-sm mb-6 leading-relaxed">
                 Please click on the request button then proceed to fill out the required information, our team will reach out to you for further advancements.
              </p>
              <div>
                 <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm">
                    Request Reward
                 </button>
              </div>
           </motion.div>

        </div>

        {/* Dynamic Payouts Table connected to logic */}
        <div className="flex-1 mt-4 relative">
           <table className="w-full text-left text-sm text-slate-600 border-separate border-spacing-y-4">
              <thead>
                 <tr className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="px-4 pb-2">Reference ID</th>
                    <th className="px-4 pb-2">Reward Type</th>
                    <th className="px-4 pb-2">Requested On</th>
                    <th className="px-4 pb-2">Method</th>
                    <th className="px-4 pb-2">Status</th>
                    <th className="px-4 pb-2">Amount</th>
                    <th className="px-4 pb-2">Certificate</th>
                    <th className="px-4 pb-2">Invoice</th>
                 </tr>
              </thead>
              <tbody>
                 {payouts.length === 0 ? (
                    <tr>
                       {/* Table handles the empty state natively without big boxes to match clean UI layout */}
                       <td colSpan="8" className="text-center py-10 text-slate-400">
                          {/* Left blank empty state area representing no rows as requested in screenshot spacing */}
                       </td>
                    </tr>
                 ) : (
                    payouts.map((row, i) => (
                       <tr key={i} className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] rounded-lg">
                          <td className="px-4 py-4 rounded-l-lg font-medium text-slate-900">#{row.id}</td>
                          <td className="px-4 py-4">{row.type}</td>
                          <td className="px-4 py-4">{row.date}</td>
                          <td className="px-4 py-4">{row.method}</td>
                          <td className="px-4 py-4">
                             <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-bold border border-yellow-100">
                               {row.status}
                             </span>
                          </td>
                          <td className="px-4 py-4 font-bold text-slate-900">${row.amount}</td>
                          <td className="px-4 py-4 text-[#3b66f5] cursor-pointer hover:underline">View</td>
                          <td className="px-4 py-4 rounded-r-lg text-[#3b66f5] cursor-pointer hover:underline">Download</td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>

      </div>
    </DashboardLayout>
  )
}

export default PayoutsPage
