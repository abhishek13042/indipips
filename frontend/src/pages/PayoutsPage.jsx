import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Clock, Shield, CheckCircle, AlertTriangle, ArrowRight, Copy, Loader2, Info } from 'lucide-react'
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

const PayoutsPage = () => {
  const [challenges, setChallenges] = useState([])
  const [eligibility, setEligibility] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [chRes, payRes] = await Promise.all([
        api.get('/challenges'),
        api.get('/payouts/history')
      ])
      
      const allChallenges = chRes.data.data || []
      setChallenges(allChallenges)
      setHistory(payRes.data.data || [])

      // Find first passed/funded challenge to check eligibility
      const passed = allChallenges.find(c => c.status === 'PASSED' || c.accountType === 'FUNDED')
      if (passed) {
        const elRes = await api.get(`/payouts/eligibility/${passed.id}`)
        setEligibility(elRes.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPayout = async () => {
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < (eligibility?.minimumAmount || 500)) {
      showToast(`Minimum payout amount is ₹${eligibility?.minimumAmount || 500}`, 'error')
      return
    }

    setSubmitting(true)
    try {
      const passed = challenges.find(c => c.status === 'PASSED' || c.accountType === 'FUNDED')
      await api.post('/payouts/request', { 
        challengeId: passed.id, 
        amountRequested: amountNum // Assuming backend handles rupee to paise conversion or expects rupees
      })
      showToast('Payout request submitted successfully!')
      setAmount('')
      setShowConfirm(false)
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit request', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showToast('UTR copied to clipboard')
  }

  const timeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (mins < 1) return 'Just now'
    if (mins < 60) return mins + 'm ago'
    if (hours < 24) return hours + 'h ago'
    if (days === 1) return 'Yesterday'
    if (days < 7) return days + 'd ago'
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  if (loading) return null

  const hasPassedChallenge = challenges.some(c => c.status === 'PASSED' || c.accountType === 'FUNDED')

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '240px', paddingTop: '64px', minHeight: '100vh' }}>
        <TopBar />
        <div style={{ padding: '32px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Payouts</h1>
            <p style={{ fontSize: '16px', color: colors.text2 }}>Withdraw your trading profits</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'flex-start' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Eligibility Section */}
              {!hasPassedChallenge ? (
                <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: colors.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                    <Wallet size={32} color={colors.text3} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>No Funded Account Yet</h3>
                  <p style={{ color: colors.text2, fontSize: '14px', marginBottom: '24px', maxWidth: '300px', margin: '0 auto 24px auto' }}>
                    Complete a challenge to become eligible for payouts and start earning your 80% profit share.
                  </p>
                  <button onClick={() => navigate('/buy-challenge')} style={{ backgroundColor: colors.accent, color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: 600, cursor: 'pointer' }}>
                    Buy Challenge →
                  </button>
                </div>
              ) : eligibility && !eligibility.eligible ? (
                <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '32px' }}>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                     <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Clock color={colors.warning} size={24} />
                     </div>
                     <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>Payout Available Soon</h3>
                        <p style={{ fontSize: '14px', color: colors.text2 }}>{eligibility.reason || 'Your funded account needs to be at least 14 days old'}</p>
                     </div>
                  </div>
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: colors.text2 }}>{eligibility.daysRemaining} days remaining</span>
                    <span style={{ color: 'white' }}>Available from: {new Date(eligibility.availableFrom).toLocaleDateString()}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: colors.surface2, borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(10, 100 - (eligibility.daysRemaining / 30 * 100))}%`, height: '100%', backgroundColor: colors.warning }}></div>
                  </div>
                </div>
              ) : eligibility && eligibility.eligible && (
                <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.success}`, borderRadius: '16px', padding: '32px' }}>
                   <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', alignItems: 'center' }}>
                     <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle color={colors.success} size={24} />
                     </div>
                     <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>You're eligible for a payout! 🎉</h3>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                     <div>
                        <label style={{ display: 'block', color: colors.text2, fontSize: '14px', marginBottom: '12px' }}>Amount to Withdraw</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'white', fontWeight: 'bold' }}>₹</span>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={`Min ₹${eligibility.minimumAmount || 500}`}
                            style={{ width: '100%', padding: '16px 16px 16px 32px', backgroundColor: colors.surface2, border: `1px solid ${colors.border}`, borderRadius: '12px', color: 'white', fontSize: '20px', fontWeight: 'bold' }}
                          />
                        </div>
                        <p style={{ fontSize: '12px', color: colors.text3, marginTop: '12px' }}>Maximum available: {formatINR(eligibility.estimatedPayout.grossProfit)}</p>
                     </div>

                     <div style={{ backgroundColor: colors.surface2, borderRadius: '16px', padding: '24px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', marginBottom: '20px' }}>Estimated Payout</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: colors.text2 }}>
                            <span>Gross Profit</span>
                            <span style={{ color: 'white' }}>{formatINR(eligibility.estimatedPayout.grossProfit)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: colors.text2 }}>
                            <span>Your Share (80%)</span>
                            <span style={{ color: 'white' }}>{formatINR(eligibility.estimatedPayout.traderShare)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: colors.danger }}>
                            <span>TDS (30%)</span>
                            <span>-{formatINR(eligibility.estimatedPayout.tdsAmount)}</span>
                          </div>
                          <div style={{ height: '1px', backgroundColor: colors.border, margin: '8px 0' }}></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                            <span style={{ color: 'white' }}>Net Payout</span>
                            <span style={{ color: colors.accent }}>{formatINR(eligibility.estimatedPayout.netPayout)}</span>
                          </div>
                        </div>
                     </div>
                   </div>

                   <button
                    onClick={() => setShowConfirm(true)}
                    style={{ width: '100%', marginTop: '32px', backgroundColor: colors.accent, color: 'white', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                   >
                     Process Payout Request →
                   </button>
                </div>
              )}

              {/* Payout History */}
              <div style={{ marginTop: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>Payout History</h2>
                <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '16px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${colors.border}`, color: colors.text2, fontSize: '13px' }}>
                        <th style={{ padding: '20px 24px' }}>Date</th>
                        <th style={{ padding: '20px 24px' }}>Gross Amount</th>
                        <th style={{ padding: '20px 24px' }}>TDS</th>
                        <th style={{ padding: '20px 24px' }}>Net Payout</th>
                        <th style={{ padding: '20px 24px' }}>Status</th>
                        <th style={{ padding: '20px 24px' }}>UTR / Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '60px 24px', textAlign: 'center', color: colors.text3 }}>
                            No payouts yet. Your payout history will appear here.
                          </td>
                        </tr>
                      ) : (
                        history.map((p) => (
                          <tr key={p.id} style={{ borderBottom: `1px solid ${colors.border}`, fontSize: '14px', color: 'white' }}>
                            <td style={{ padding: '20px 24px' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '20px 24px' }}>{formatINR(p.amountSupported || p.grossAmount)}</td>
                            <td style={{ padding: '20px 24px', color: colors.danger }}>-{formatINR(p.tdsAmount)}</td>
                            <td style={{ padding: '20px 24px', fontWeight: 600, color: colors.accent }}>{formatINR(p.netAmount)}</td>
                            <td style={{ padding: '20px 24px' }}>
                              <span style={{
                                padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                                backgroundColor: p.status === 'TRANSFERRED' ? 'rgba(16,185,129,0.1)' : p.status === 'PENDING' ? 'rgba(245,158,11,0.1)' : 'rgba(37,99,235,0.1)',
                                color: p.status === 'TRANSFERRED' ? colors.success : p.status === 'PENDING' ? colors.warning : colors.accent
                              }}>
                                {p.status}
                              </span>
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                              {p.utr ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.text2, fontSize: '13px' }}>
                                  {p.utr} <Copy size={14} style={{ cursor: 'pointer' }} onClick={() => copyToClipboard(p.utr)} />
                                </div>
                              ) : '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Sidebar info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ backgroundColor: 'rgba(245,158,11,0.05)', borderLeft: `3px solid ${colors.warning}`, padding: '24px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', color: colors.warning, marginBottom: '12px' }}>
                  <Info size={20} /> <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Tax Information</span>
                </div>
                <p style={{ fontSize: '13px', color: colors.text2, lineHeight: '1.6' }}>
                  TDS of 30% is deducted on net winnings as per Section 194BA of the Income Tax Act. You will receive Form 16A quarterly for your tax filings.
                </p>
              </div>

              <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '24px' }}>
                <h4 style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px' }}>Payout Schedule</h4>
                <ul style={{ color: colors.text2, fontSize: '13px', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li>Minimum payout is ₹500</li>
                  <li>First payout after 14 days of funded account</li>
                  <li>Subsequent payouts every 14 days</li>
                  <li>Processing time: 3 business days</li>
                  <li>80% profit share for all traders</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '32px', maxWidth: '480px', width: '100%' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Confirm Payout Request</h2>
            <p style={{ color: colors.text2, fontSize: '14px', marginBottom: '24px' }}>Please review your payout details before submitting.</p>
            
            <div style={{ backgroundColor: colors.surface2, borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: colors.text2 }}>
                  <span>Requested Amount</span>
                  <span style={{ color: 'white' }}>{formatINR(amount * 100)}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: colors.danger }}>
                  <span>TDS Estimate (30%)</span>
                  <span>-{formatINR(amount * 30)}</span>
               </div>
               <div style={{ height: '1px', backgroundColor: colors.border, margin: '8px 0' }}></div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                  <span style={{ color: 'white' }}>Net Transferred</span>
                  <span style={{ color: colors.accent }}>{formatINR(amount * 70)}</span>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: '14px', backgroundColor: 'transparent', color: 'white', border: `1px solid ${colors.border}`, borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestPayout}
                disabled={submitting}
                style={{ flex: 1, padding: '14px', backgroundColor: colors.success, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PayoutsPage
