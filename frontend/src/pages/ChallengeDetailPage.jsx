import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Target, ShieldAlert, Award, AlertTriangle, Download, ExternalLink } from 'lucide-react'
import api from '../api'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'

const formatINR = (paise) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((paise || 0) / 100)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'numeric', minute:'2-digit' })
}

const ChallengeDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [challenge, setChallenge] = useState(null)
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chRes, trRes] = await Promise.all([
          api.get(`/challenges/${id}`),
          api.get(`/trades/active?challengeId=${id}`) // Re-using endpoint for ease, normally this would be a historic trades endpoint
        ])
        setChallenge(chRes.data.data)
        setTrades(trRes.data.data || [])
      } catch (err) {
        console.error('Error fetching deep dive:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#060B14' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TopBar />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94A3B8' }}>Loading challenge details...</div>
        </div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#060B14' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TopBar />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#EF4444' }}>Challenge not found.</div>
        </div>
      </div>
    )
  }

  const { plan, rules } = challenge
  const accountSize = Number(challenge.accountSize)
  const currentBalance = Number(challenge.currentBalance) || accountSize
  const totalPnl = currentBalance - accountSize
  const dailyStartingBalance = Number(challenge.dailyStartingBalance) || accountSize
  const dailyPnl = currentBalance - dailyStartingBalance

  // Rules calcs
  const profitTarget = accountSize * ((rules?.profitTargetPct || 8) / 100)
  const maxLossLimit = accountSize * ((rules?.maxDrawdownPct || 10) / 100)
  const dailyLossLimit = accountSize * ((rules?.dailyLossLimitPct || 4) / 100)
  
  const dailyLossPct = Math.max(0, ((dailyStartingBalance - currentBalance) / dailyStartingBalance) * 100)

  // Certificate logic
  const isPassed = challenge.status === 'PASSED'
  const isFailed = challenge.status === 'FAILED'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#060B14', color: '#F1F5F9' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />
        
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {/* BACK BUTTON */}
          <button 
            onClick={() => navigate('/challenges')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px', padding: 0, marginBottom: '24px' }}
          >
            <ArrowLeft size={16} /> My Challenges
          </button>

          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                {plan?.name || 'Evaluation'} Challenge
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{formatINR(accountSize)}</h1>
              <div style={{ color: '#475569', fontSize: '13px' }}>
                Started: {formatDate(challenge.startDate)} {challenge.endDate && `• Ends: ${formatDate(challenge.endDate)}`}
              </div>
            </div>
            <div style={{ 
              backgroundColor: isPassed ? 'rgba(16,185,129,0.1)' : isFailed ? 'rgba(239,68,68,0.1)' : 'rgba(37,99,235,0.1)', 
              color: isPassed ? '#10B981' : isFailed ? '#EF4444' : '#2563EB', 
              padding: '6px 16px', 
              borderRadius: '20px', 
              fontSize: '14px', 
              fontWeight: 'bold',
              border: `1px solid ${isPassed ? '#10B981' : isFailed ? '#EF4444' : '#2563EB'}44`
            }}>
              {challenge.status}
            </div>
          </div>

          {/* SECTION 1: OVERVIEW & ALERTS */}
          {isPassed && (
            <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', borderRadius: '12px', padding: '20px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#10B981', color: '#060B14', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={24} /></div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#10B981', fontSize: '16px', fontWeight: 'bold' }}>Challenge Completed!</h3>
                <p style={{ margin: 0, color: '#A7F3D0', fontSize: '14px' }}>Congratulations, you have successfully passed this evaluation phase.</p>
              </div>
            </div>
          )}

          {isFailed && (
            <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', borderRadius: '12px', padding: '20px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ color: '#EF4444' }}><AlertTriangle size={32} /></div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#EF4444', fontSize: '16px', fontWeight: 'bold' }}>Challenge Ended</h3>
                  <p style={{ margin: 0, color: '#FECACA', fontSize: '14px' }}>Rule violation breached. Don't give up! 80% of funded traders failed at least once.</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/buy-challenge')}
                style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Retry with 20% Discount →
              </button>
            </div>
          )}

          {/* CORE STATS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', padding: '24px' }}>
              <div style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '8px' }}>Current Balance</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F1F5F9', marginBottom: '16px' }}>{formatINR(currentBalance)}</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ color: '#475569' }}>Total Net P&L</span>
                <span style={{ color: totalPnl >= 0 ? '#10B981' : '#EF4444', fontWeight: '600' }}>{totalPnl >= 0 ? '+' : ''}{formatINR(totalPnl)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#475569' }}>Daily Net P&L</span>
                <span style={{ color: dailyPnl >= 0 ? '#10B981' : '#EF4444', fontWeight: '600' }}>{dailyPnl >= 0 ? '+' : ''}{formatINR(dailyPnl)}</span>
              </div>
            </div>

            {/* Profit Target Progress Wrapper */}
            <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ color: '#94A3B8', fontSize: '14px' }}>Profit Target Progress</span>
                <span style={{ color: '#F1F5F9', fontSize: '14px', fontWeight: 'bold' }}>{rules?.profitTargetPct || 8}%</span>
              </div>
              <div style={{ color: '#2563EB', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                {formatINR(Math.max(0, totalPnl))} <span style={{ color: '#475569', fontSize: '16px', fontWeight: 'normal' }}>/ {formatINR(profitTarget)}</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#131D2E', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, (totalPnl / profitTarget) * 100))}%`, backgroundColor: totalPnl >= profitTarget ? '#10B981' : '#2563EB', transition: 'width 0.5s ease-out' }} />
              </div>
            </div>
            
            {/* Rules Overview Row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '12px', padding: '16px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '4px' }}>Daily Loss Status</div>
                  <div style={{ color: dailyLossPct > 2 ? '#F59E0B' : '#10B981', fontSize: '16px', fontWeight: 'bold' }}>{dailyLossPct.toFixed(2)}% <span style={{color: '#475569', fontWeight: 'normal', fontSize: '13px'}}>of {rules?.dailyLossLimitPct || 4}%</span></div>
                </div>
                {dailyLossPct > 3 && <AlertTriangle size={20} color="#F59E0B" />}
              </div>
              <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '12px', padding: '16px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '4px' }}>Max Drawdown Limit</div>
                  <div style={{ color: '#EF4444', fontSize: '16px', fontWeight: 'bold' }}>{rules?.maxDrawdownPct || 10}% <span style={{color: '#475569', fontWeight: 'normal', fontSize: '13px'}}>(₹{formatINR(maxLossLimit)})</span></div>
                </div>
                <ShieldAlert size={20} color="#EF4444" />
              </div>
            </div>
          </div>

          {/* SECTION 4: CERTIFICATE (If Passed) */}
          {isPassed && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Your Certificate</h2>
              
              <div style={{ 
                background: 'linear-gradient(135deg, #0D1420, #111827)', 
                border: '2px solid #F59E0B', 
                borderRadius: '16px', 
                padding: '40px', 
                maxWidth: '800px',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                margin: '0 auto 24px auto',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #F59E0B, #FEF3C7, #F59E0B)' }} />
                
                <h3 style={{ color: '#F59E0B', fontSize: '24px', letterSpacing: '4px', textTransform: 'uppercase', margin: '0 0 24px 0' }}>INDIPIPS</h3>
                <p style={{ color: '#94A3B8', fontSize: '16px', fontStyle: 'italic', marginBottom: '24px' }}>Certificate of Achievement</p>
                <div style={{ width: '100px', height: '1px', backgroundColor: '#F59E0B', margin: '0 auto 24px' }} />
                
                <p style={{ color: '#94A3B8', fontStyle: 'italic', marginBottom: '8px' }}>This certifies that</p>
                <h2 style={{ fontSize: '36px', color: '#FFF', margin: '0 0 8px 0', fontWeight: '800' }}>{challenge.user?.fullName || 'Trader'}</h2>
                
                <p style={{ color: '#94A3B8', marginBottom: '8px' }}>has successfully completed the</p>
                <h3 style={{ color: '#2563EB', fontSize: '24px', margin: '0 0 8px 0' }}>{plan?.name} Challenge</h3>
                
                <p style={{ color: '#94A3B8', marginBottom: '8px' }}>with an account size of</p>
                <h3 style={{ color: '#F59E0B', fontSize: '28px', margin: '0 0 24px 0' }}>{formatINR(accountSize)}</h3>
                
                <div style={{ width: '100px', height: '1px', backgroundColor: '#F59E0B', margin: '0 auto 32px' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '14px', maxWidth: '500px', margin: '0 auto' }}>
                  <div>
                    <div style={{ marginBottom: '4px' }}>Passed On</div>
                    <div style={{ color: '#F1F5F9', fontWeight: 'bold' }}>{formatDate(new Date())}</div> 
                  </div>
                  <div>
                    <div style={{ marginBottom: '4px' }}>Verification Code</div>
                    <div style={{ color: '#F1F5F9', fontWeight: 'bold', fontFamily: 'monospace' }}>IND-5K-9X82M</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  <Download size={18} /> Download PDF
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#2563EB', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  <ExternalLink size={18} /> Share on LinkedIn
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: TRADE HISTORY */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#F1F5F9', margin: '0 0 20px 0' }}>Trade History</h2>
            
            <div style={{ backgroundColor: '#0D1420', border: '1px solid #1E2D40', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#131D2E', color: '#94A3B8', fontSize: '13px', borderBottom: '1px solid #1E2D40' }}>
                      <th style={{ padding: '16px', fontWeight: '500' }}>Time</th>
                      <th style={{ padding: '16px', fontWeight: '500' }}>Instrument</th>
                      <th style={{ padding: '16px', fontWeight: '500' }}>Action</th>
                      <th style={{ padding: '16px', fontWeight: '500' }}>Qty</th>
                      <th style={{ padding: '16px', fontWeight: '500' }}>Entry Avg</th>
                      <th style={{ padding: '16px', fontWeight: '500' }}>Current / Exit</th>
                      <th style={{ padding: '16px', fontWeight: '500', textAlign: 'right' }}>P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.length === 0 ? (
                      <tr><td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>No trades recorded in this challenge yet.</td></tr>
                    ) : trades.map((t) => {
                      // Using the same active/historic mockup logic
                      const pnl = Number(t.realizedPnl) || (Number(t.currentPrice || 0) - Number(t.entryPrice)) * Number(t.quantity) * (t.side === 'BUY' ? 1 : -1)
                      return (
                        <tr key={t.id} style={{ borderBottom: '1px solid #1E2D40' }}>
                          <td style={{ padding: '16px', color: '#F1F5F9', fontSize: '13px' }}>{formatDateTime(t.entryTime || t.createdAt)}</td>
                          <td style={{ padding: '16px', color: '#F1F5F9', fontSize: '14px', fontWeight: '500' }}>{t.instrument}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ backgroundColor: t.side === 'BUY' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: t.side === 'BUY' ? '#10B981' : '#EF4444', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                              {t.side}
                            </span>
                          </td>
                          <td style={{ padding: '16px', color: '#F1F5F9', fontSize: '14px' }}>{t.quantity}</td>
                          <td style={{ padding: '16px', color: '#94A3B8', fontSize: '14px' }}>₹{Number(t.entryPrice).toFixed(2)}</td>
                          <td style={{ padding: '16px', color: '#94A3B8', fontSize: '14px' }}>₹{(Number(t.exitPrice) || Number(t.currentPrice) || 0).toFixed(2)}</td>
                          <td style={{ padding: '16px', color: pnl >= 0 ? '#10B981' : '#EF4444', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>
                            {pnl >= 0 ? '+' : ''}{formatINR(pnl)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

export default ChallengeDetailPage
