import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Mail, AlertTriangle, Shield, CheckCircle, XCircle, Unlock } from 'lucide-react'
import api from '../api'
import AdminLayout from '../components/admin/AdminLayout'
import ConfirmModal from '../components/admin/ConfirmModal'

const formatINR = (paise) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((paise || 0) / 100)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
}

const AdminTraderDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState('') // 'suspend', 'reinstate', 'delete', 'override_kyc'
  const [suspendReason, setSuspendReason] = useState('')
  const [kycOverride, setKycOverride] = useState('')

  const fetchTrader = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/admin/traders/${id}`)
      setData(res.data.data)
      setNotes(res.data.data.user?.adminNotes || '')
    } catch (err) {
      console.error('Error fetching trader details:', err)
      alert('Failed to load trader details')
      navigate('/admin/traders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrader()
  }, [id])

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true)
      await api.put(`/admin/traders/${id}/notes`, { notes })
      alert('Notes saved successfully')
    } catch (err) {
      alert('Failed to save notes')
    } finally {
      setSavingNotes(false)
    }
  }

  const handleAction = async () => {
    try {
      if (modalAction === 'suspend') {
        await api.put(`/admin/traders/${id}/suspend`, { reason: suspendReason })
      } else if (modalAction === 'reinstate') {
        await api.put(`/admin/traders/${id}/reinstate`)
      } else if (modalAction === 'override_kyc') {
        await api.put(`/admin/traders/${id}/kyc`, { status: kycOverride })
      } else if (modalAction === 'delete') {
        await api.delete(`/admin/traders/${id}`)
        navigate('/admin/traders')
        return
      }
      setModalOpen(false)
      fetchTrader()
    } catch (err) {
      alert(`Failed to execute ${modalAction}`)
    }
  }

  const openModal = (action) => {
    setModalAction(action)
    setSuspendReason('')
    setKycOverride('VERIFIED')
    setModalOpen(true)
  }

  if (loading || !data) {
    return (
      <AdminLayout>
        <div style={{ color: '#94A3B8', textAlign: 'center', marginTop: '64px' }}>Loading profile...</div>
      </AdminLayout>
    )
  }

  const { user, challenges, payouts, stats } = data
  const initials = user?.fullName?.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() || 'U'

  return (
    <AdminLayout>
      {/* BACK BUTTON */}
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate('/admin/traders')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px', padding: 0 }}>
          <ArrowLeft size={16} /> Back to Traders
        </button>
      </div>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#2563EB', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold' }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#F1F5F9', margin: '0 0 8px 0' }}>{user.fullName}</h1>
            <div style={{ color: '#94A3B8', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>{user.email}</span>
              <span>{user.phone || 'No phone'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <a href={`mailto:${user.email}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#131D2E', color: '#2563EB', border: '1px solid currentColor', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
            <Mail size={16} /> Send Email
          </a>
          
          {user.isActive ? (
            <button onClick={() => openModal('suspend')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              <Shield size={16} /> Suspend Trader
            </button>
          ) : (
            <button onClick={() => openModal('reinstate')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              <Unlock size={16} /> Reinstate
            </button>
          )}
        </div>
      </div>

      {/* STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {[
          { label: 'Total Challenges', value: stats?.totalChallenges || 0 },
          { label: 'Challenges Passed', value: stats?.passedChallenges || 0 },
          { label: 'Total Earned', value: formatINR(stats?.totalPaid || 0) },
          { label: 'Revenue Generated', value: formatINR(stats?.totalRevenue || 0) },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '12px', padding: '24px' }}>
            <div style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ color: '#F1F5F9', fontSize: '24px', fontWeight: 'bold' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* TWO COL LAYOUT (Left: History, Right: KYC & Notes) */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* LEFT COL */}
        <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* CHALLENGES */}
          <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#F1F5F9', margin: '0 0 20px 0' }}>Challenge History</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ color: '#94A3B8', fontSize: '13px', borderBottom: '1px solid #1E2D40' }}>
                    <th style={{ padding: '12px', fontWeight: '500' }}>Plan</th>
                    <th style={{ padding: '12px', fontWeight: '500' }}>Account</th>
                    <th style={{ padding: '12px', fontWeight: '500' }}>P&L</th>
                    <th style={{ padding: '12px', fontWeight: '500' }}>Status</th>
                    <th style={{ padding: '12px', fontWeight: '500' }}>Dates</th>
                  </tr>
                </thead>
                <tbody>
                  {challenges.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>No challenges found</td></tr>
                  ) : challenges.map((ch) => {
                    const pnl = Number(ch.currentBalance) - Number(ch.accountSize)
                    return (
                      <tr key={ch.id} style={{ borderBottom: '1px solid #1E2D40' }}>
                        <td style={{ padding: '16px', color: '#F1F5F9', fontSize: '14px' }}>{ch.plan?.name}</td>
                        <td style={{ padding: '16px', color: '#F1F5F9', fontSize: '14px' }}>{formatINR(ch.accountSize)}</td>
                        <td style={{ padding: '16px', color: pnl >= 0 ? '#10B981' : '#EF4444', fontSize: '14px', fontWeight: '500' }}>{pnl >= 0 ? '+' : ''}{formatINR(pnl)}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ backgroundColor: ch.status === 'PASSED' ? 'rgba(16,185,129,0.1)' : ch.status === 'FAILED' ? 'rgba(239,68,68,0.1)' : 'rgba(37,99,235,0.1)', color: ch.status === 'PASSED' ? '#10B981' : ch.status === 'FAILED' ? '#EF4444' : '#2563EB', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                            {ch.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px', color: '#94A3B8', fontSize: '13px' }}>
                          {formatDate(ch.startDate)} - {ch.endDate ? formatDate(ch.endDate) : 'Present'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAYOUTS */}
          <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#F1F5F9', margin: '0 0 20px 0' }}>Payout History</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ color: '#94A3B8', fontSize: '13px', borderBottom: '1px solid #1E2D40' }}>
                    <th style={{ padding: '12px', fontWeight: '500' }}>Requested</th>
                    <th style={{ padding: '12px', fontWeight: '500' }}>Gross</th>
                    <th style={{ padding: '12px', fontWeight: '500' }}>TDS</th>
                    <th style={{ padding: '12px', fontWeight: '500' }}>Net Paid</th>
                    <th style={{ padding: '12px', fontWeight: '500' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>No payouts requested</td></tr>
                  ) : payouts.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #1E2D40' }}>
                      <td style={{ padding: '16px', color: '#F1F5F9', fontSize: '13px' }}>{formatDate(p.requestedAt)}</td>
                      <td style={{ padding: '16px', color: '#F1F5F9', fontSize: '14px' }}>{formatINR(p.grossProfit)}</td>
                      <td style={{ padding: '16px', color: '#EF4444', fontSize: '14px' }}>-{formatINR(p.tdsAmount)}</td>
                      <td style={{ padding: '16px', color: '#10B981', fontSize: '14px', fontWeight: '600' }}>{formatINR(p.netPayoutAmount)}</td>
                      <td style={{ padding: '16px', fontSize: '12px' }}>{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COL */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* KYC DETAILS */}
          <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#F1F5F9', margin: 0 }}>KYC Information</h2>
              <button 
                onClick={() => openModal('override_kyc')}
                style={{ fontSize: '12px', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Override
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Status</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: user.kycStatus === 'VERIFIED' ? '#10B981' : (user.kycStatus === 'REJECTED' ? '#EF4444' : '#F59E0B'), fontSize: '14px', fontWeight: '600' }}>
                  {user.kycStatus === 'VERIFIED' ? <CheckCircle size={16} /> : (user.kycStatus === 'REJECTED' ? <XCircle size={16} /> : <AlertTriangle size={16} />)}
                  {user.kycStatus}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Aadhaar</div>
                <div style={{ color: '#F1F5F9', fontSize: '14px' }}>{user.kycData?.aadhaar ? 'Verified ✓' : 'Not submitted'}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>PAN Card</div>
                <div style={{ color: '#F1F5F9', fontSize: '14px', fontFamily: 'monospace' }}>{user.kycData?.pan ? `******${user.kycData.pan.slice(-4)}` : 'Not submitted'}</div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Bank Account</div>
                <div style={{ color: '#F1F5F9', fontSize: '14px' }}>
                  {user.bankData?.accountNumber ? `****${user.bankData.accountNumber.slice(-4)} • ${user.bankData.bankName}` : 'Not added'}
                </div>
              </div>
            </div>
          </div>

          {/* ADMIN NOTES */}
          <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#F1F5F9', margin: '0 0 16px 0' }}>Admin Notes</h2>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes about this trader..."
              style={{ width: '100%', minHeight: '120px', padding: '12px', backgroundColor: '#060B14', border: '1px solid #1E2D40', borderRadius: '8px', color: '#F1F5F9', fontSize: '14px', outline: 'none', resize: 'vertical', marginBottom: '16px' }}
            />
            <button 
              onClick={handleSaveNotes}
              disabled={savingNotes}
              style={{ width: '100%', padding: '10px', backgroundColor: '#2563EB', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>

          {/* DANGER ZONE */}
          <div style={{ backgroundColor: '#0D1420', border: '1px dashed #EF4444', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#EF4444', margin: '0 0 16px 0' }}>Danger Zone</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => openModal('delete')}
                style={{ padding: '10px', backgroundColor: 'transparent', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                Delete Account (Super Admin)
              </button>
            </div>
          </div>

        </div>

      </div>

      <ConfirmModal
        isOpen={modalOpen}
        title={
          modalAction === 'suspend' ? 'Suspend Account' :
          modalAction === 'reinstate' ? 'Reinstate Account' :
          modalAction === 'override_kyc' ? 'Override KYC Status' :
          modalAction === 'delete' ? 'Permanently Delete Account' : ''
        }
        message={
          modalAction === 'suspend' ? 'This user will no longer be able to log in or trade.' :
          modalAction === 'reinstate' ? 'This user will regain access to their account and active challenges.' :
          modalAction === 'delete' ? 'WARNING: This action cannot be undone. All data will be wiped.' : ''
        }
        confirmText={
          modalAction === 'suspend' ? 'Confirm Suspension' :
          modalAction === 'reinstate' ? 'Confirm Reinstatement' :
          modalAction === 'override_kyc' ? 'Update Status' :
          modalAction === 'delete' ? 'Delete Account' : 'Confirm'
        }
        confirmColor={
          modalAction === 'reinstate' || modalAction === 'override_kyc' ? 'green' : 'red'
        }
        onCancel={() => setModalOpen(false)}
        onConfirm={handleAction}
      >
        {modalAction === 'suspend' && (
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>Reason for suspension (required)</label>
            <input 
              type="text" 
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. Terms violation..."
              style={{ width: '100%', padding: '12px', backgroundColor: '#060B14', border: '1px solid #1E2D40', borderRadius: '8px', color: '#F1F5F9', fontSize: '14px', outline: 'none' }}
            />
          </div>
        )}
        {modalAction === 'override_kyc' && (
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>Select New Status</label>
            <select 
              value={kycOverride}
              onChange={(e) => setKycOverride(e.target.value)}
              style={{ width: '100%', padding: '12px', backgroundColor: '#060B14', border: '1px solid #1E2D40', borderRadius: '8px', color: '#F1F5F9', fontSize: '14px', outline: 'none' }}
            >
              <option value="PENDING">PENDING</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        )}
      </ConfirmModal>

    </AdminLayout>
  )
}

export default AdminTraderDetailPage
