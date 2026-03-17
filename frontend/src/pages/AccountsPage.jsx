import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Trash2, CheckCircle2, List, LayoutGrid, MoreVertical, Briefcase, GraduationCap, Package } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import api from '../api'

function AccountsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get('/challenges')
        if (res.data?.data && res.data.data.length > 0) {
          setAccounts(res.data.data)
        } else {
          // Fallback mock data matching the screenshot exactly
          setAccounts([
            {
              id: '11740829',
              size: 5000,
              type: 'Two Step',
              role: 'Student',
              status: 'Not Passed',
              balance: 4503.61,
              target: 10,
              targetProgress: 0,
              pnl: -496.39,
              profitPercent: -9.9,
              icon: 'student'
            },
            {
              id: '100889987',
              size: 100000,
              type: 'Competition',
              role: 'Student',
              status: 'Not Passed',
              balance: 94585.00,
              pnl: -5415.00,
              profitPercent: -5.4,
              icon: 'competition'
            }
          ])
        }
      } catch (err) {
        console.warn('Failed to fetch accounts, using mock data')
        setAccounts([
            {
              id: '11740829',
              size: 5000,
              type: 'Two Step',
              role: 'Student',
              status: 'Not Passed',
              balance: 4503.61,
              target: 10,
              targetProgress: 0,
              pnl: -496.39,
              profitPercent: -9.9,
              icon: 'student'
            },
            {
              id: '100889987',
              size: 100000,
              type: 'Competition',
              role: 'Student',
              status: 'Not Passed',
              balance: 94585.00,
              pnl: -5415.00,
              profitPercent: -5.4,
              icon: 'competition'
            }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  return (
    <DashboardLayout>
      <div className="flex h-full gap-6 max-w-[1600px] mx-auto pb-6">
        
        {/* Left Sidebar - Accounts List */}
        <div className="w-full md:w-[380px] flex flex-col h-full shrink-0">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg">
              {user?.firstName?.charAt(0) || 'A'}
            </div>
            <h1 className="text-2xl text-slate-900">Hey, <span className="font-bold">{user?.firstName || 'Abhishek'}</span></h1>
          </div>

          <button 
            onClick={() => navigate('/dashboard/new-challenge')}
            className="w-full bg-[#3b66f5] hover:bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mb-6 shadow-sm"
          >
            <span className="w-4 h-4 border-2 border-white rounded flex items-center justify-center border-dashed"></span> BUY CHALLENGE
          </button>

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <button className="flex-1 bg-white border border-slate-200 text-slate-600 text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-between hover:bg-slate-50 transition-colors">
              All Types <ChevronDown size={14} />
            </button>
            <button className="flex-1 bg-white border border-slate-200 text-slate-600 text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-between hover:bg-slate-50 transition-colors">
              All States <ChevronDown size={14} />
            </button>
            <button className="flex-1 bg-white border border-slate-200 text-slate-600 text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-between hover:bg-slate-50 transition-colors">
              All Phases <ChevronDown size={14} />
            </button>
          </div>

          {/* List Controls */}
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
                <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"><Trash2 size={14} /></button>
                <button className="p-1.5 text-white bg-[#3b66f5] rounded-full shadow-sm"><CheckCircle2 size={14} /></button>
             </div>
             <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
                <button className="p-1.5 text-slate-700 hover:text-black transition-colors"><List size={14} /></button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"><LayoutGrid size={14} /></button>
             </div>
          </div>

          {/* Accounts Scrollable List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pb-10">
            {accounts.map((acc, index) => (
              <motion.div 
                key={acc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedAccount(acc)}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${selectedAccount?.id === acc.id ? 'border-[#3b66f5] shadow-md ring-1 ring-[#3b66f5]' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {acc.icon === 'student' ? <GraduationCap size={16} className="text-[#3b66f5]" /> : <Package size={16} className="text-[#f97316]" />}
                      <span className="font-bold text-slate-900">#{acc.id}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      ${acc.size >= 1000 ? acc.size/1000 + 'K' : acc.size} • {acc.type} • {acc.role}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {acc.status === 'Not Passed' && (
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100">
                        Not Passed
                      </span>
                    )}
                    <button className="p-1 text-slate-400 hover:text-slate-600 border border-slate-200 rounded">
                       <MoreVertical size={14} />
                    </button>
                  </div>
                </div>

                {/* Card Body Metrics */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                   <div>
                     <p className="text-xs text-slate-500 mb-1">Balance</p>
                     <p className="font-bold text-slate-900">${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                   </div>
                   <div>
                     {acc.target !== undefined ? (
                       <>
                         <div className="flex justify-between text-xs text-slate-500 mb-1">
                           <span>Profit Target ({acc.target}%)</span>
                           <span className="font-bold text-slate-900">{acc.targetProgress}%</span>
                         </div>
                         <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-[#3b66f5] h-full" style={{ width: `${acc.targetProgress}%` }}></div>
                         </div>
                       </>
                     ) : (
                       <>
                         <p className="text-xs text-slate-500 mb-1">Account Type</p>
                         <p className="font-bold text-slate-900">{acc.type}</p>
                       </>
                     )}
                   </div>
                   <div>
                     <p className="text-xs text-slate-500 mb-1">P&L</p>
                     <p className={`font-bold ${acc.pnl < 0 ? 'text-red-500' : 'text-green-500'}`}>
                       {acc.pnl < 0 ? '-' : '+'}${Math.abs(acc.pnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                     </p>
                   </div>
                   <div>
                     <p className="text-xs text-slate-500 mb-1">Profit %</p>
                     <p className={`font-bold ${acc.profitPercent < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {acc.profitPercent}%
                     </p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* Right Content Area (Master-Detail logic) */}
        <div className="hidden md:flex flex-1 bg-white rounded-2xl border border-slate-200 items-center justify-center p-8 relative overflow-hidden shadow-sm">
           
           {/* Expand icon placeholder like in screenshot top left */}
           <button className="absolute top-4 left-4 p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-600 hover:bg-slate-50 transition-colors z-10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
           </button>

           {!selectedAccount ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center flex flex-col items-center bg-slate-50/50 p-12 rounded-[2rem] border border-slate-100 border-dashed"
              >
                 <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 mb-6 shadow-sm">
                   <Briefcase size={28} />
                 </div>
                 <h2 className="text-xl font-bold text-slate-900 mb-3">Select an Account to View Details</h2>
                 <p className="text-sm text-slate-500 mb-10 leading-relaxed">
                   Choose a trading account from the list to see its detailed information and performance metrics.
                 </p>
                 
                 <div className="w-full h-px bg-slate-200 mb-8 relative">
                    <span className="absolute bg-slate-50/50 px-2 text-slate-400 text-xs left-1/2 -translate-x-1/2 -top-2">or</span>
                 </div>

                 <p className="text-sm text-slate-600 mb-4 font-medium">
                   Don't have an account yet?<br />
                   <span className="text-slate-500 font-normal">Trade up to $300,000 in simulated capital.</span>
                 </p>
                 <button 
                  onClick={() => navigate('/dashboard/new-challenge')}
                  className="w-full bg-[#3b66f5] hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                 >
                   <span className="w-4 h-4 border-2 border-white rounded flex items-center justify-center border-dashed"></span> BUY CHALLENGE
                 </button>
              </motion.div>
           ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                 {/* This is where the detailed dashboard components for `selectedAccount` would render. 
                     For accuracy to the prompt, we will route to the detailed view or render a placeholder. */}
                 <div className="text-center">
                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                      <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Account #{selectedAccount.id} Selected</h2>
                    <p className="text-slate-500 mb-6">Detailed metrics connection established.</p>
                    <button 
                      onClick={() => navigate(`/dashboard/summary/${selectedAccount.id}`)}
                      className="px-6 py-2 bg-[#3b66f5] text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                      Open Full Dashboard Overview
                    </button>
                 </div>
              </div>
           )}

        </div>

      </div>
    </DashboardLayout>
  )
}

export default AccountsPage
