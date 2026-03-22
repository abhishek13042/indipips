import { useState, useEffect } from 'react'
import { User, Mail, Phone, Shield, Lock, Share2, Trash2, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import api from '../api'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import { useToast } from '../components/ui/Toast'

const colors = {
  bg: '#060B14',
  surface: '#0D1420',
  surface2: '#131D2E',
  border: '#1E2D40',
  accent: '#2563EB',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  text: '#F1F5F9',
  text2: '#94A3B8',
  text3: '#475569'
}

const formatINR = (paise) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(paise / 100)
}

const ProfilePage = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  
  const { showToast } = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile')
      setProfile(res.data.data)
      setFullName(res.data.data.fullName)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    setSubmitting(true)
    try {
      await api.put('/users/profile', { fullName })
      showToast('Profile updated successfully')
      setEditing(false)
      fetchProfile()
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (passwordData.new !== passwordData.confirm) {
        showToast('Passwords do not match', 'error')
        return
    }
    setSubmitting(true)
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      })
      showToast('Password updated successfully')
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (err) {
      showToast(err.response?.data?.message || 'Password update failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return
    setSubmitting(true)
    try {
      await api.delete('/users/account')
      showToast('Account deleted successfully')
      window.location.href = '/login'
    } catch (err) {
      showToast(err.response?.data?.message || 'Deletion failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const copyReferral = () => {
    navigator.clipboard.writeText(profile.referralCode)
    showToast('Referral code copied!')
  }

  if (loading) return null

  const initials = profile?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '240px', paddingTop: '64px', minHeight: '100vh', padding: '32px' }}>
        <TopBar />
        
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Profile & Settings</h1>
            <p style={{ fontSize: '16px', color: colors.text2 }}>Manage your account and preferences</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'flex-start' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Profile Overview */}
              <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(37,99,235,0.15)', color: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                  {initials}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{profile.fullName}</h2>
                  <div style={{ display: 'flex', gap: '16px', color: colors.text2, fontSize: '14px', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {profile.email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {profile.phone || 'No phone'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', backgroundColor: 'rgba(37,99,235,0.1)', color: colors.accent, textTransform: 'uppercase' }}>Trader</span>
                    {profile.kycVerified ? (
                      <span style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', backgroundColor: 'rgba(16,185,129,0.1)', color: colors.success, textTransform: 'uppercase' }}>KYC Verified ✓</span>
                    ) : (
                      <span style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', backgroundColor: 'rgba(245,158,11,0.1)', color: colors.warning, textTransform: 'uppercase' }}>KYC Pending ⚠</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>Personal Information</h3>
                  {!editing ? (
                    <button onClick={() => setEditing(true)} style={{ background: 'none', border: `1px solid ${colors.border}`, color: 'white', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: colors.text2, fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                      <button onClick={handleUpdateProfile} disabled={submitting} style={{ backgroundColor: colors.accent, border: 'none', color: 'white', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                        {submitting ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', color: colors.text2, fontSize: '12px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Full Name</label>
                    {editing && !profile.kycVerified ? (
                      <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '10px 14px', backgroundColor: colors.surface2, border: `1px solid ${colors.border}`, borderRadius: '8px', color: 'white' }} />
                    ) : (
                      <div style={{ color: 'white', fontSize: '16px' }}>{profile.fullName}</div>
                    )}
                    {profile.kycVerified && editing && (
                      <p style={{ fontSize: '11px', color: colors.warning, marginTop: '4px' }}>Name is locked after Aadhaar verification.</p>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', color: colors.text2, fontSize: '12px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Email Address</label>
                    <div style={{ color: 'white', fontSize: '16px', opacity: 0.6 }}>{profile.email}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: colors.text2, fontSize: '12px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Phone Number</label>
                    <div style={{ color: 'white', fontSize: '16px' }}>{profile.phone || 'Not added'}</div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div style={{ backgroundColor: 'rgba(239,68,68,0.02)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.danger, marginBottom: '16px' }}>Danger Zone</h3>
                <p style={{ fontSize: '14px', color: colors.text2, marginBottom: '20px' }}>Permanently delete your account and all trading data. This action is irreversible.</p>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  style={{ backgroundColor: 'transparent', border: `1px solid ${colors.danger}`, color: colors.danger, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Delete Account
                </button>
              </div>

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Security Settings */}
              <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <Lock color={colors.accent} size={20} />
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>Security Settings</h3>
                </div>

                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: colors.text2, fontSize: '13px', marginBottom: '8px' }}>Current Password</label>
                    <input type="password" value={passwordData.current} onChange={(e) => setPasswordData({...passwordData, current: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: colors.surface2, border: `1px solid ${colors.border}`, borderRadius: '8px', color: 'white' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: colors.text2, fontSize: '13px', marginBottom: '8px' }}>New Password</label>
                    <input type="password" value={passwordData.new} onChange={(e) => setPasswordData({...passwordData, new: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: colors.surface2, border: `1px solid ${colors.border}`, borderRadius: '8px', color: 'white' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: colors.text2, fontSize: '13px', marginBottom: '8px' }}>Confirm New Password</label>
                    <input type="password" value={passwordData.confirm} onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: colors.surface2, border: `1px solid ${colors.border}`, borderRadius: '8px', color: 'white' }} />
                  </div>
                  <button type="submit" disabled={submitting} style={{ backgroundColor: 'transparent', border: `1px solid ${colors.border}`, color: 'white', padding: '12px', borderRadius: '10px', marginTop: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    {submitting ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

              {/* Referral System */}
              <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <Share2 color={colors.accent} size={20} />
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>Referral Program</h3>
                </div>

                <div style={{ backgroundColor: colors.surface2, border: `1px dashed ${colors.border}`, borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                  <p style={{ fontSize: '11px', color: colors.text3, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Your Referral Code</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: colors.accent, letterSpacing: '4px' }}>{profile.referralCode}</span>
                    <button onClick={copyReferral} style={{ background: 'none', border: 'none', color: colors.text2, cursor: 'pointer' }}><Copy size={18} /></button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                   <div style={{ backgroundColor: 'rgba(37,99,235,0.05)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: colors.text2, marginBottom: '4px' }}>Total Referred</p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{profile.referralCount || 0}</p>
                   </div>
                   <div style={{ backgroundColor: 'rgba(16,185,129,0.05)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: colors.text2, marginBottom: '4px' }}>Wallet Balance</p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: colors.success }}>{formatINR(profile.walletBalance || 0)}</p>
                   </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', backgroundColor: 'rgba(37,99,235,0.05)', padding: '16px', borderRadius: '12px' }}>
                   <CheckCircle size={16} color={colors.accent} style={{ flexShrink: 0 }} />
                   <p style={{ fontSize: '12px', color: colors.text2, lineHeight: '1.5' }}>
                     Earn 10% of your friend's first challenge fee as wallet credits. Credits can be used for discounts on your future challenges.
                   </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.danger}`, borderRadius: '24px', padding: '32px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
            <Trash2 size={48} color={colors.danger} style={{ marginBottom: '20px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>Are you sure?</h2>
            <p style={{ color: colors.text2, fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
              This action will permanently delete your account, wipe all your trading history, and cancel active challenges. You cannot undo this.
            </p>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: colors.text3, fontSize: '12px', marginBottom: '8px' }}>Type "DELETE" to confirm</label>
              <input 
                value={deleteConfirm} 
                onChange={(e) => setDeleteConfirm(e.target.value)} 
                placeholder="DELETE"
                style={{ width: '100%', padding: '12px', backgroundColor: colors.surface2, border: `1px solid ${colors.border}`, borderRadius: '10px', color: 'white', textAlign: 'center', fontWeight: 'bold', letterSpacing: '2px' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: 'white', border: `1px solid ${colors.border}`, borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || submitting}
                style={{ flex: 1, padding: '12px', backgroundColor: colors.danger, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, opacity: deleteConfirm === 'DELETE' ? 1 : 0.5 }}
              >
                {submitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
