import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Link, Gift, TrendingUp, Copy, CheckCircle2, ChevronRight, Share2, Award } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'

function RewardsPage() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  // Mock affiliate stats since backend doesn't have an affiliate engine built yet
  const affiliateStats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarned: 1450.00,
    pendingPayout: 350.00,
    tier: 'Gold Partner',
    commissionRate: '15%',
    referralLink: `https://indipips.com/ref/${user?.id || 'IND-883921'}`
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateStats.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header & Main Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Affiliate Status */}
          <motion.div variants={itemVariants} className="lg:col-span-2 glass-dark border border-gray-800 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/5 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h2 className="text-3xl font-black text-white font-outfit mb-2">Partner Rewards</h2>
                <p className="text-gray-400 font-medium">Earn up to 20% commission on every successful referral.</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500/10 to-yellow-500/20 border border-yellow-500/30 flex items-center gap-2">
                 <Award className="text-yellow-400" size={18} />
                 <span className="text-yellow-400 font-bold text-sm tracking-widest uppercase">{affiliateStats.tier}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
               {[
                 { label: 'Total Referrals', val: affiliateStats.totalReferrals, icon: Users },
                 { label: 'Active Traders', val: affiliateStats.activeReferrals, icon: CheckCircle2 },
                 { label: 'Total Earned', val: `$${affiliateStats.totalEarned.toLocaleString()}`, icon: TrendingUp },
                 { label: 'Pending Payout', val: `$${affiliateStats.pendingPayout.toLocaleString()}`, icon: Gift, color: 'text-green-400' },
               ].map((stat, i) => {
                 const Icon = stat.icon
                 return (
                   <div key={i} className="bg-black/50 border border-gray-800 rounded-2xl p-4">
                     <Icon size={16} className="text-gray-500 mb-3" />
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                     <p className={`text-xl font-black font-outfit ${stat.color || 'text-white'}`}>{stat.val}</p>
                   </div>
                 )
               })}
            </div>
          </motion.div>

          {/* Referral Link Grabber */}
          <motion.div variants={itemVariants} className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            <h3 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-4 z-10">Your Unique Link</h3>
            
            <div className="bg-black border border-gray-800 rounded-2xl p-4 mb-6 z-10 relative group-hover:border-green-400/50 transition-colors">
              <p className="text-sm font-medium text-gray-400 truncate pr-8">{affiliateStats.referralLink}</p>
              <button 
                onClick={handleCopyLink}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gray-900 text-gray-300 hover:text-white hover:bg-green-400/20 transition-all"
              >
                {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>

            <button className="w-full py-4 rounded-xl font-black text-sm text-black bg-white hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 z-10 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
               <Share2 size={16} /> Share on Socials
            </button>
          </motion.div>
        </div>

        {/* Affiliate Commission Tiers */}
        <motion.div variants={itemVariants} className="mb-8 p-8 bg-black border border-gray-800 rounded-3xl relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-900 -translate-y-1/2 rounded-full hidden md:block z-0"></div>
          
          <div className="flex justify-between items-center mb-8 relative z-10">
             <div>
               <h3 className="text-xl font-black text-white font-outfit">Commission Tiers</h3>
               <p className="text-sm text-gray-500 font-medium">Level up to increase your percentage share.</p>
             </div>
             <p className="text-sm font-bold text-gray-400">Current Rate: <span className="text-green-400 text-lg ml-1">{affiliateStats.commissionRate}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
             {[
               { name: 'Silver Partner', req: '0 - 10 Referrals', rate: '10%', active: false },
               { name: 'Gold Partner', req: '11 - 50 Referrals', rate: '15%', active: true },
               { name: 'Platinum Partner', req: '50+ Referrals', rate: '20%', active: false },
             ].map((tier, i) => (
               <div key={i} className={`p-6 rounded-2xl border ${tier.active ? 'bg-gray-900 border-green-400/30 shadow-[0_0_30px_rgba(74,222,128,0.1)]' : 'bg-black border-gray-800'}`}>
                 <div className="flex justify-between items-center mb-4">
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{tier.req}</span>
                   {tier.active && <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></span>}
                 </div>
                 <h4 className={`text-xl font-black font-outfit mb-1 ${tier.active ? 'text-white' : 'text-gray-400'}`}>{tier.name}</h4>
                 <p className={`text-3xl font-black font-outfit ${tier.active ? 'text-green-400' : 'text-gray-600'}`}>{tier.rate}</p>
               </div>
             ))}
          </div>
        </motion.div>

        {/* Recent Referrals Logic / Table */}
        <motion.div variants={itemVariants} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl overflow-hidden">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-black text-white font-outfit">Recent Matrix Referrals</h3>
             <button className="text-green-400 text-xs font-bold hover:text-green-300 transition-colors flex items-center gap-1">
               View Complete Ledger <ChevronRight size={14} />
             </button>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[600px]">
               <thead>
                 <tr className="border-b border-gray-800">
                   {['Date', 'User Identity', 'Purchased Node', 'Status', 'Commission Earned'].map(h => (
                     <th key={h} className="pb-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                   ))}
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-800/50">
                  {[
                    { date: 'Oct 12, 2026', user: 'raj***@gmail.com', plan: '$100K Competition', status: 'Completed', earned: '$74.85' },
                    { date: 'Oct 10, 2026', user: 'ami***@yahoo.com', plan: '$50K Rapid', status: 'Pending', earned: '$44.85' },
                    { date: 'Oct 08, 2026', user: 'vik***@proton.me', plan: '$200K Competition', status: 'Completed', earned: '$149.85' },
                    { date: 'Oct 05, 2026', user: 'san***@gmail.com', plan: '$10K Student', status: 'Completed', earned: '$15.00' },
                  ].map((ref, i) => (
                    <tr key={i} className="hover:bg-black/40 transition-colors">
                      <td className="py-4 font-medium text-xs text-gray-500">{ref.date}</td>
                      <td className="py-4 font-bold text-sm text-gray-300">{ref.user}</td>
                      <td className="py-4 font-medium text-xs text-gray-400">{ref.plan}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 text-[10px] font-black rounded-md ${
                          ref.status === 'Completed' 
                            ? 'bg-green-400/10 text-green-400 border border-green-400/20' 
                            : 'bg-yellow-400/10 text-yellow-500 border border-yellow-400/20'
                        }`}>
                          {ref.status}
                        </span>
                      </td>
                      <td className={`py-4 font-black text-sm ${ref.status === 'Completed' ? 'text-white' : 'text-gray-600'}`}>
                        {ref.earned}
                      </td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  )
}

export default RewardsPage
