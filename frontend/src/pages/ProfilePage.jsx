import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Lock, Bell, BellOff, ShieldCheck, UserCheck, Save, Camera } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import api from '../api'

function ProfilePage() {
  const { user } = useAuth()
  
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })

  const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      // Endpoint logic would go here
      await new Promise(res => setTimeout(res, 1000)) // Mock delay
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' })
    } catch (err) {
      setProfileMessage({ type: 'error', text: 'Failed to update profile.' })
    } finally {
      setSavingProfile(false)
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    setSavingPassword(true)
    try {
      // Endpoint logic would go here
      await new Promise(res => setTimeout(res, 1000)) // Mock delay
      setPasswordMessage({ type: 'success', text: 'Security key updated.' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordMessage({ type: 'error', text: 'Failed to update security key.' })
    } finally {
      setSavingPassword(false)
      setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000)
    }
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
        {/* Header Area */}
        <motion.div variants={itemVariants} className="bg-black border border-gray-800 rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 rounded-full bg-gray-900 border-2 border-gray-700 flex items-center justify-center relative group overflow-hidden">
               <span className="text-3xl font-black text-gray-500">{user?.firstName?.charAt(0) || 'U'}</span>
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <Camera className="text-white" size={24} />
               </div>
            </div>
          </div>
          
          <div className="text-center md:text-left relative z-10 flex-1">
             <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
               <h2 className="text-3xl font-black text-white font-outfit tracking-tight">{user?.firstName} {user?.lastName}</h2>
               <span className="px-3 py-1 rounded-md bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-black flex items-center gap-1">
                 <UserCheck size={14} /> Verified Matrix Identity
               </span>
             </div>
             <p className="text-gray-400 font-medium">Manage your personal settings, security keys, and communication preferences.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Section 1: Personal Details */}
           <motion.div variants={itemVariants} className="glass-dark border border-gray-800 rounded-3xl p-8 shadow-2xl relative">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-gray-400">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white font-outfit">Identity Specs</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Personal Information</p>
                </div>
              </div>

              {profileMessage.text && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-bold border ${profileMessage.type === 'success' ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {profileMessage.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">First Name</label>
                    <input type="text" name="firstName" value={profileForm.firstName} onChange={handleProfileChange} className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-400 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Last Name</label>
                    <input type="text" name="lastName" value={profileForm.lastName} onChange={handleProfileChange} className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-400 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Primary Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="email" name="email" value={profileForm.email} disabled className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-gray-500 cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-green-400 mt-2 font-bold flex items-center gap-1"><ShieldCheck size={12} /> Contact support to change secure Email</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="tel" name="phone" value={profileForm.phone} onChange={handleProfileChange} className="w-full bg-black border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-green-400 transition-colors" />
                  </div>
                </div>

                <div className="pt-4 mt-8 border-t border-gray-800 flex justify-end">
                  <button type="submit" disabled={savingProfile} className="px-6 py-3 rounded-xl bg-white text-black font-black text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    {savingProfile ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Save size={16} /> Save Identity</>}
                  </button>
                </div>
              </form>
           </motion.div>

           {/* Column 2: Security & Preferences */}
           <div className="space-y-8">
              {/* Security */}
              <motion.div variants={itemVariants} className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-xl">
                 <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-800">
                   <div className="w-10 h-10 rounded-xl bg-black border border-gray-700 flex items-center justify-center text-gray-400">
                     <Lock size={18} />
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-white font-outfit">Matrix Security</h3>
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Update Master Key</p>
                   </div>
                 </div>

                 {passwordMessage.text && (
                  <div className={`p-4 rounded-xl mb-6 text-sm font-bold border ${passwordMessage.type === 'success' ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {passwordMessage.text}
                  </div>
                )}

                 <form onSubmit={handleUpdatePassword} className="space-y-4">
                   <div>
                     <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} placeholder="Current Security Key" required className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-400 transition-colors" />
                   </div>
                   <div>
                     <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} placeholder="New Security Key" required className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-400 transition-colors" />
                   </div>
                   <div>
                     <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm New Key" required className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-400 transition-colors" />
                   </div>
                   <button type="submit" disabled={savingPassword} className="w-full py-4 rounded-xl bg-gray-800 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-700 hover:text-green-400 transition-colors mt-2">
                     {savingPassword ? <div className="w-5 h-5 border-2 border-white/30 border-t-green-400 rounded-full animate-spin" /> : 'Update Key Protocol'}
                   </button>
                 </form>
              </motion.div>

              {/* Notifications */}
              <motion.div variants={itemVariants} className="bg-black border border-gray-800 rounded-3xl p-8 shadow-xl">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400">
                     <Bell size={18} />
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-white font-outfit">Comms Feed</h3>
                   </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl">
                       <div>
                         <p className="font-bold text-white text-sm">Matrix Updates (Trades)</p>
                         <p className="text-xs text-gray-500 mt-1">Receive signals on trade closures and equity triggers</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" className="sr-only peer" defaultChecked />
                         <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]"></div>
                       </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl opacity-60">
                       <div>
                         <p className="font-bold text-white text-sm">Marketing Transmissions</p>
                         <p className="text-xs text-gray-500 mt-1">Offers and promotional content</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" className="sr-only peer" />
                         <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-400"></div>
                       </label>
                    </div>
                 </div>
              </motion.div>
           </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

export default ProfilePage
