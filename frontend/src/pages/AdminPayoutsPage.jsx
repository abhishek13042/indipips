import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Search, Download, Loader2 } from 'lucide-react'
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

const AdminPayoutsPage = () => {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [page, setPage] = useState(1)
  const limit = 20

  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState(null) // { action: 'approve' | 'reject', payout: object }
  const [notesOrReason, setNotesOrReason] = useState('')

  // Summary stats (mocked locally from fetch for now)
  const [sumPending, setSumPending] = useState(0)

  const fetchPayouts = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/payouts', {
        params: { status: statusFilter === 'All' ? undefined : statusFilter, page, limit }
      })
      setPayouts(res.data.data || [])
      setTotal(res.data.meta?.total || 0)

      if (statusFilter === 'PENDING') {
        const sum = (res.data.data || []).reduce((acc, p) => acc + Number(p.netPayoutAmount), 0)
        setSumPending(sum)
      }
    } catch (err) {
      console.error('Error fetching payouts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayouts()
  }, [statusFilter, page])

  const openApproveModal = (p) => {
    setModalData({ action: 'approve', payout: p })
    setNotesOrReason('')
    setModalOpen(true)
  }

  const openRejectModal = (p) => {
    setModalData({ action: 'reject', payout: p })
    setNotesOrReason('')
    setModalOpen(true)
  }

  const handleAction = async () => {
    if (!modalData?.payout) return
    const id = modalData.payout.id

    try {
      if (modalData.action === 'approve') {
        await api.put(`/admin/payouts/${id}/approve`, { notes: notesOrReason })
        // Toast could be added here
      } else {
        if (!notesOrReason) {
           alert("Rejection reason is required")
           return
        }
        await api.put(`/admin/payouts/${id}/reject`, { reason: notesOrReason })
      }
      setModalOpen(false)
      fetchPayouts()
    } catch (err) {
      alert(`Failed to ${modalData.action} payout.`)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span style={{ color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>PENDING</span>
      case 'APPROVED': return <span style={{ color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>APPROVED</span>
      case 'TRANSFERRED': return <span style={{ color: '#2563EB', backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>TRANSFERRED</span>
      case 'REJECTED': return <span style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>REJECTED</span>
      default: return <span>{status}</span>
    }
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#F1F5F9', margin: 0 }}>Payout Management</h1>
        {statusFilter === 'PENDING' && total > 0 && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: '600' }}>
            {total} pending
          </div>
        )}
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1E2D40', marginBottom: '24px' }}>
        {['PENDING', 'APPROVED', 'TRANSFERRED', 'REJECTED', 'All'].map(tab => (
          <button 
            key={tab}
            onClick={() => { setStatusFilter(tab); setPage(1) }}
            style={{
              padding: '12px 24px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
              color: statusFilter === tab ? '#2563EB' : '#94A3B8',
              borderBottom: statusFilter === tab ? '2px solid #2563EB' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()} {tab === 'PENDING' && statusFilter === 'PENDING' ? `(${total})` : ''}
          </button>
        ))}
      </div>

      {/* BULK ACTIONS (Example UI) */}
      {statusFilter === 'TRANSFERRED' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'transparent', color: '#F1F5F9', border: '1px solid #1E2D40', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <Download size={16} /> Export to CSV
          </button>
        </div>
      )}

      {/* TABLE */}
      <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', overflow: 'hidden', paddingBottom: '16px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead>
              <tr style={{ backgroundColor: '#131D2E', color: '#94A3B8', fontSize: '13px', borderBottom: '1px solid #1E2D40' }}>
                <th style={{ padding: '16px', fontWeight: '500' }}>#</th>
                <th style={{ padding: '16px', fontWeight: '500' }}>Trader / Plan</th>
                <th style={{ padding: '16px', fontWeight: '500' }}>Requested</th>
                <th style={{ padding: '16px', fontWeight: '500' }}>Gross</th>
                <th style={{ padding: '16px', fontWeight: '500' }}>TDS (30%)</th>
                <th style={{ padding: '16px', fontWeight: '500' }}>Net Amount</th>
                <th style={{ padding: '16px', fontWeight: '500' }}>KYC</th>
                <th style={{ padding: '16px', fontWeight: '500' }}>Bank</th>
                <th style={{ padding: '16px', fontWeight: '500' }}>Status</th>
                <th style={{ padding: '16px', fontWeight: '500' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" style={{ padding: '64px', textAlign: 'center', color: '#94A3B8' }}><Loader2 size={32} className="spinner" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />Loading payouts...</td></tr>
              ) : payouts.length === 0 ? (
                <tr><td colSpan="10" style={{ padding: '64px', textAlign: 'center', color: '#94A3B8' }}>No payouts found in this status.</td></tr>
              ) : payouts.map((p, index) => {
                const rowNum = (page - 1) * limit + index + 1
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1E2D40', backgroundColor: 'transparent', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#131D2E'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px', color: '#94A3B8', fontSize: '13px' }}>{rowNum}</td>
                    <td style={{ padding: '16px', color: '#F1F5F9', fontSize: '14px', fontWeight: '500' }}>
                      {p.user?.fullName} <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 'normal' }}><br/>{p.user?.email}</span>
                      <div style={{ fontSize: '11px', color: '#2563EB', backgroundColor: 'rgba(37,99,235,0.1)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                        {p.challenge?.plan?.name || 'Funded Acct'}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#F1F5F9', fontSize: '13px' }}>{formatDate(p.requestedAt)}</td>
                    <td style={{ padding: '16px', color: '#94A3B8', fontSize: '13px' }}>{formatINR(p.grossProfit)}</td>
                    <td style={{ padding: '16px', color: '#EF4444', fontSize: '13px' }}>-{formatINR(p.tdsAmount)}</td>
                    <td style={{ padding: '16px', color: '#10B981', fontSize: '14px', fontWeight: 'bold' }}>{formatINR(p.netPayoutAmount)}</td>
                    
                    <td style={{ padding: '16px' }}>
                      {p.user?.kycStatus === 'VERIFIED' ? <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><CheckCircle size={14} /> Verified</span> : <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><XCircle size={14} /> {p.user?.kycStatus || 'Unverified'}</span>}
                    </td>

                    <td style={{ padding: '16px', color: '#94A3B8', fontSize: '13px' }}>
                      {p.user?.bankData?.accountNumber ? `****${p.user.bankData.accountNumber.slice(-4)}` : 'Not set'}
                    </td>

                    <td style={{ padding: '16px' }}>{getStatusBadge(p.status)}</td>
                    
                    <td style={{ padding: '16px' }}>
                      {p.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => openApproveModal(p)} style={{ padding: '6px 12px', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                            ✓ Approve
                          </button>
                          <button onClick={() => openRejectModal(p)} style={{ padding: '6px 12px', backgroundColor: 'transparent', color: '#EF4444', border: '1px solid currentColor', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                            ✗ Reject
                          </button>
                        </div>
                      )}
                      {p.status !== 'PENDING' && <span style={{ color: '#475569', fontSize: '12px' }}>Processed</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && total > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #1E2D40', color: '#94A3B8', fontSize: '13px' }}>
            <div>Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '6px 12px', backgroundColor: 'transparent', color: page === 1 ? '#475569' : '#F1F5F9', border: '1px solid #1E2D40', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                ← Previous
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= total}
                style={{ padding: '6px 12px', backgroundColor: 'transparent', color: page * limit >= total ? '#475569' : '#F1F5F9', border: '1px solid #1E2D40', borderRadius: '6px', cursor: page * limit >= total ? 'not-allowed' : 'pointer' }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STATS SUMMARY */}
      <div style={{ display: 'flex', gap: '24px', marginTop: '24px', color: '#94A3B8', fontSize: '14px' }}>
        {statusFilter === 'PENDING' && <div><span style={{ fontWeight: '500', color: '#F1F5F9' }}>Total Pending:</span> {formatINR(sumPending)}</div>}
      </div>

      {/* MODAL */}
      <ConfirmModal
        isOpen={modalOpen}
        title={modalData?.action === 'approve' ? 'Approve Payout' : 'Reject Payout Request'}
        confirmText={modalData?.action === 'approve' ? 'Confirm & Approve' : 'Confirm Rejection'}
        confirmColor={modalData?.action === 'approve' ? 'green' : 'red'}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleAction}
      >
        {modalData?.action === 'approve' ? (
          <div>
            <div style={{ backgroundColor: '#131D2E', border: '1px solid #1E2D40', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#94A3B8' }}><span>Trader:</span> <span style={{ color: '#F1F5F9' }}>{modalData.payout?.user?.fullName}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#94A3B8' }}><span>Gross profit:</span> <span style={{ color: '#F1F5F9' }}>{formatINR(modalData.payout?.grossProfit)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#94A3B8' }}><span>TDS (30%):</span> <span style={{ color: '#EF4444' }}>-{formatINR(modalData.payout?.tdsAmount)}</span></div>
              <hr style={{ border: 'none', borderTop: '1px solid #1E2D40', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold' }}><span style={{ color: '#F1F5F9' }}>NET TRANSFER:</span> <span style={{ color: '#10B981' }}>{formatINR(modalData.payout?.netPayoutAmount)}</span></div>
            </div>

            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px dashed #EF4444', color: '#EF4444', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              <strong>Warning:</strong> This will initiate a real bank transfer via Razorpay. This action cannot be undone.
            </div>

            <input 
              type="text" 
              placeholder="Admin notes (optional)"
              value={notesOrReason}
              onChange={(e) => setNotesOrReason(e.target.value)}
              style={{ width: '100%', padding: '12px', backgroundColor: '#060B14', border: '1px solid #1E2D40', borderRadius: '8px', color: '#F1F5F9', fontSize: '14px', outline: 'none' }}
            />
          </div>
        ) : (
          <div>
            <textarea 
              placeholder="Enter reason for rejection... (required)"
              value={notesOrReason}
              onChange={(e) => setNotesOrReason(e.target.value)}
              style={{ width: '100%', minHeight: '100px', padding: '12px', backgroundColor: '#060B14', border: '1px solid #1E2D40', borderRadius: '8px', color: '#F1F5F9', fontSize: '14px', outline: 'none', resize: 'vertical', marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['KYC not verified', 'Bank details mismatch', 'Suspicious activity', 'Insufficient documentation'].map(reason => (
                <button 
                  key={reason}
                  onClick={() => setNotesOrReason(prev => prev ? prev + ', ' + reason : reason)}
                  style={{ backgroundColor: '#1E2D40', color: '#94A3B8', border: 'none', borderRadius: '16px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>
                  {reason}
                </button>
              ))}
            </div>
          </div>
        )}
      </ConfirmModal>

    </AdminLayout>
  )
}

export default AdminPayoutsPage
