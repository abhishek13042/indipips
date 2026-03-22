import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MoreVertical, ShieldCheck, ShieldAlert, Loader2, Download } from 'lucide-react'
import api from '../api'
import AdminLayout from '../components/admin/AdminLayout'
import ConfirmModal from '../components/admin/ConfirmModal'

const AdminTradersPage = () => {
  const [traders, setTraders] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'suspended'
  const [kycFilter, setKycFilter] = useState('all') // 'all', 'VERIFIED', 'PENDING', 'REJECTED'
  const [page, setPage] = useState(1)
  const limit = 20

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTrader, setSelectedTrader] = useState(null)
  const [suspendReason, setSuspendReason] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const fetchTraders = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/admin/traders`, {
        params: {
          search: debouncedSearch,
          status: statusFilter !== 'all' ? (statusFilter === 'active' ? 'true' : 'false') : undefined,
          kycStatus: kycFilter !== 'all' ? kycFilter : undefined,
          page,
          limit
        }
      })
      setTraders(res.data.data || [])
      setTotal(res.data.meta?.total || 0)
    } catch (err) {
      console.error('Error fetching traders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTraders()
  }, [debouncedSearch, statusFilter, kycFilter, page])

  const openSuspendModal = (trader) => {
    setSelectedTrader(trader)
    setSuspendReason('')
    setModalOpen(true)
  }

  const handleSuspend = async () => {
    if (!selectedTrader) return
    try {
      if (selectedTrader.isActive) {
        await api.put(`/admin/traders/${selectedTrader.id}/suspend`, { reason: suspendReason })
      } else {
        await api.put(`/admin/traders/${selectedTrader.id}/reinstate`)
      }
      setModalOpen(false)
      fetchTraders()
    } catch (err) {
      alert('Failed to update trader status.')
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
  }

  const parseKycBadge = (status) => {
    if (status === 'VERIFIED') return <span style={{ color: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Verified ✓</span>
    if (status === 'REJECTED') return <span style={{ color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Rejected</span>
    return <span style={{ color: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Pending</span>
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#F1F5F9', margin: 0 }}>Traders</h1>
        <div style={{ backgroundColor: '#1E2D40', color: '#F1F5F9', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: '500' }}>
          {total} traders
        </div>
      </div>

      {/* FILTERS BAR */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '8px', color: '#F1F5F9', fontSize: '14px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '8px', overflow: 'hidden' }}>
          {['all', 'active', 'suspended'].map(tab => (
            <button 
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                padding: '10px 16px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                backgroundColor: statusFilter === tab ? 'rgba(37,99,235,0.1)' : 'transparent',
                color: statusFilter === tab ? '#2563EB' : '#94A3B8',
                borderRight: tab !== 'suspended' ? '1px solid #1E2D40' : 'none'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <select 
          value={kycFilter}
          onChange={(e) => setKycFilter(e.target.value)}
          style={{ padding: '10px 16px', backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '8px', color: '#F1F5F9', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
        >
          <option value="all">All KYC</option>
          <option value="VERIFIED">Verified</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <div style={{ marginLeft: 'auto' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'transparent', color: '#F1F5F9', border: '1px solid #1E2D40', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* TRADERS TABLE */}
      <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead>
              <tr style={{ backgroundColor: '#131D2E', color: '#94A3B8', fontSize: '13px', borderBottom: '1px solid #1E2D40' }}>
                <th style={{ padding: '16px', fontWeight: '500', width: '5%' }}>#</th>
                <th style={{ padding: '16px', fontWeight: '500', width: '25%' }}>Trader</th>
                <th style={{ padding: '16px', fontWeight: '500', width: '20%' }}>Contact Info</th>
                <th style={{ padding: '16px', fontWeight: '500', width: '10%' }}>KYC</th>
                <th style={{ padding: '16px', fontWeight: '500', width: '15%' }}>Challenges</th>
                <th style={{ padding: '16px', fontWeight: '500', width: '10%' }}>Joined</th>
                <th style={{ padding: '16px', fontWeight: '500', width: '10%' }}>Status</th>
                <th style={{ padding: '16px', fontWeight: '500', width: '5%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ padding: '64px', textAlign: 'center', color: '#94A3B8' }}>
                    <Loader2 size={32} className="spinner" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    Loading traders...
                  </td>
                </tr>
              ) : traders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '64px', textAlign: 'center', color: '#94A3B8' }}>
                    <Search size={32} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <div style={{ fontSize: '16px', color: '#F1F5F9', marginBottom: '8px' }}>No traders found</div>
                    <div style={{ fontSize: '14px' }}>Try adjusting your search filters</div>
                  </td>
                </tr>
              ) : traders.map((trader, index) => {
                const rowNum = (page - 1) * limit + index + 1
                const initials = trader.fullName?.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() || 'U'
                
                return (
                  <tr key={trader.id} style={{ borderBottom: '1px solid #1E2D40', backgroundColor: 'transparent', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#131D2E'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px', color: '#94A3B8', fontSize: '14px' }}>{rowNum}</td>
                    
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#2563EB', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                          {initials}
                        </div>
                        <div>
                          <Link to={`/admin/traders/${trader.id}`} style={{ color: '#F1F5F9', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>
                            {trader.fullName}
                          </Link>
                          {trader.role === 'ADMIN' && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '2px' }}>Admin</div>}
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: '16px', color: '#94A3B8', fontSize: '13px' }}>
                      <div style={{ color: '#F1F5F9' }}>{trader.email}</div>
                      <div style={{ marginTop: '4px' }}>{trader.phone ? trader.phone.replace(/(\d{5})(\d{5})/, '$1 **** $2') : 'No phone'}</div>
                    </td>
                    
                    <td style={{ padding: '16px' }}>
                      {parseKycBadge(trader.kycStatus)}
                    </td>
                    
                    <td style={{ padding: '16px', color: '#F1F5F9', fontSize: '13px' }}>
                      {trader._count?.challenges || 0} total
                    </td>
                    
                    <td style={{ padding: '16px', color: '#94A3B8', fontSize: '13px' }}>
                      {formatDate(trader.createdAt)}
                    </td>
                    
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: trader.isActive ? '#10B981' : '#EF4444' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: trader.isActive ? '#10B981' : '#EF4444' }} />
                        {trader.isActive ? 'Active' : 'Suspended'}
                      </div>
                    </td>
                    
                    <td style={{ padding: '16px', position: 'relative' }}>
                      <div className="action-dropdown-container" style={{ position: 'relative' }}>
                        <button 
                          style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            // Simple inline dropdown logic here or route direct
                            // For simplicity, we just use direct actions or a mini hover menu
                          }}
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {/* Hover UI for actions */}
                        <div className="action-menu" style={{ 
                            position: 'absolute', right: '0', top: '100%', backgroundColor: '#131D2E', 
                            border: '1px solid #1E2D40', borderRadius: '8px', padding: '8px', zIndex: 10,
                            minWidth: '150px', display: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                          }}>
                          <Link to={`/admin/traders/${trader.id}`} style={{ display: 'block', padding: '8px 12px', color: '#F1F5F9', textDecoration: 'none', fontSize: '13px', borderRadius: '4px' }} onMouseOver={(e)=>e.target.style.backgroundColor='#1E2D40'} onMouseOut={(e)=>e.target.style.backgroundColor='transparent'}>View Profile</Link>
                          
                          <button 
                            onClick={() => openSuspendModal(trader)}
                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', color: trader.isActive ? '#EF4444' : '#10B981', background: 'transparent', border: 'none', fontSize: '13px', borderRadius: '4px', cursor: 'pointer' }} 
                            onMouseOver={(e)=>e.target.style.backgroundColor='#1E2D40'} onMouseOut={(e)=>e.target.style.backgroundColor='transparent'}
                          >
                            {trader.isActive ? 'Suspend' : 'Reinstate'}
                          </button>
                        </div>
                        <style>{`
                          .action-dropdown-container:hover .action-menu { display: block !important; }
                        `}</style>
                      </div>
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
            <div>
              Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
            </div>
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

      <ConfirmModal
        isOpen={modalOpen}
        title={selectedTrader?.isActive ? `Suspend ${selectedTrader?.fullName}` : `Reinstate ${selectedTrader?.fullName}`}
        message={selectedTrader?.isActive ? "This will immediately restrict their access and stop any active challenges." : "This will restoring their platform access."}
        confirmText={selectedTrader?.isActive ? "Suspend Account" : "Reinstate Account"}
        confirmColor={selectedTrader?.isActive ? "red" : "green"}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleSuspend}
      >
        {selectedTrader?.isActive && (
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>Reason for suspension (optional)</label>
            <input 
              type="text" 
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. Terms violation, Fraud suspicion..."
              style={{ width: '100%', padding: '12px', backgroundColor: '#060B14', border: '1px solid #1E2D40', borderRadius: '8px', color: '#F1F5F9', fontSize: '14px', outline: 'none' }}
            />
          </div>
        )}
      </ConfirmModal>

    </AdminLayout>
  )
}

export default AdminTradersPage
