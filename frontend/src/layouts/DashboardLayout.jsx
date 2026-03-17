import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Plus, 
  Briefcase, 
  Coins, 
  Trophy, 
  List,
  ListOrdered, 
  FileBadge, 
  Calendar, 
  Wrench, 
  Users, 
  Settings, 
  Moon,
  Sun,
  LogOut
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(false) // Defaulting to light mode based on image

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  const navItems = [
    { icon: Briefcase, path: '/dashboard/accounts' },
    { icon: Coins, path: '/dashboard/payouts' }, 
    { icon: Trophy, path: '/dashboard/competitions' }, 
    { icon: List, path: '/dashboard/leaderboard' },
    { icon: FileBadge, path: '/dashboard/certificates' },
    { icon: Calendar, path: '/dashboard/calendar' },
    { icon: Wrench, path: '/dashboard/tools' },
    { icon: Users, path: '/dashboard/affiliates' }, 
    { icon: Settings, path: '/dashboard/profile' },
  ]

  // Marquee items
  const marqueeItems = [
    "Eid Mubarak! Use code \"FP\" to get 20% off all accounts. Excludes 100K 1-Step and 2-Step accounts.",
    "Haven't purchased yet? Use code HELLO & Get 20% OFF now on your first purchase!",
  ]
  const fullMarqueeList = [...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems]

  return (
    <div className={`flex h-screen overflow-hidden font-inter transition-colors duration-300 ${isDarkMode ? 'bg-[#0f141e] text-white' : 'bg-[#f4f6fa] text-slate-900'}`}>
      
      {/* Top Banner (Infinite Marquee Promo) */}
      <div className="absolute top-0 left-16 right-0 h-8 bg-[#8b5cf6] text-white flex items-center overflow-hidden z-40 hidden md:flex font-semibold text-xs border-b border-purple-400">
        <motion.div 
          animate={{ x: [0, -2000] }}
          transition={{ 
            repeat: Infinity, 
            ease: "linear", 
            duration: 40 
          }}
          className="flex gap-20 whitespace-nowrap pl-10"
        >
          {fullMarqueeList.map((text, i) => (
             <span key={i}>{text}</span>
          ))}
        </motion.div>
      </div>

      {/* Slim Icon Sidebar */}
      <aside className={`w-16 flex flex-col items-center py-4 z-50 relative border-r transition-colors ${
        isDarkMode ? 'bg-[#151b28] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        
        {/* Top Logo (Stylized 'iP') */}
        <div 
          onClick={() => navigate('/')} 
          className="cursor-pointer mb-6 group relative"
        >
           {/* Abstract minimalist logo similar to the 'P' with dot */}
           <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C12 9.79086 13.7909 8 16 8H28C30.2091 8 32 9.79086 32 12V16C32 18.2091 30.2091 20 28 20H16V32" stroke={isDarkMode ? 'white' : '#1e293b'} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="4" fill={isDarkMode ? 'white' : '#1e293b'} />
           </svg>
        </div>

        {/* Top "Plus" Button */}
        <button 
          onClick={() => navigate('/dashboard/new-challenge')}
          className="w-10 h-10 rounded-full bg-[#3b66f5] text-white flex items-center justify-center mb-8 hover:bg-blue-600 transition-colors shadow-sm shrink-0"
        >
           <Plus size={24} />
        </button>

        {/* Navigation Icons */}
        <div className="flex-1 flex flex-col gap-6 w-full items-center overflow-y-auto scrollbar-hide py-2">
          {navItems.map((item, index) => {
            const isAccountsBase = item.path === '/dashboard/accounts'
            const isSummaryView = location.pathname.startsWith('/dashboard/summary')
            const isActive = location.pathname === item.path || 
                           (location.pathname.startsWith(item.path) && item.path !== '/dashboard/accounts') ||
                           (isAccountsBase && isSummaryView)
            const Icon = item.icon
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`relative flex items-center justify-center p-2 rounded-lg transition-colors group ${
                  isActive 
                    ? (isDarkMode ? 'text-white' : 'text-slate-900') 
                    : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div 
                    layoutId="sidebarIndicator"
                    className="absolute -left-3 w-1 h-6 bg-[#3b66f5] rounded-r-full"
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Bottom Icons */}
        <div className="flex flex-col gap-6 mt-4 w-full items-center shrink-0">
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-colors ${
              isDarkMode 
                ? 'bg-slate-800 text-slate-300 hover:text-white' 
                : 'bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
          >
            {isDarkMode ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
          </button>
          
          <button 
             onClick={handleLogout}
             className={`p-2 transition-colors ${isDarkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-500 hover:text-red-500'}`}
          >
            <LogOut size={20} strokeWidth={2} className="rotate-180" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden mt-8 md:mt-8">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative z-10 scrollbar-hide">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {children || <Outlet />}
          </motion.div>
        </main>
      </div>
      
    </div>
  )
}

export default DashboardLayout
