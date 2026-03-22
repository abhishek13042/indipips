import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, FileText, Building2, CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
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

const KYCPage = () => {
  const [kycStatus, setKycStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [aadhaarOtp, setAadhaarOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [requestId, setRequestId] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [bankName, setBankName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    fetchKycStatus()
  }, [])

  const fetchKycStatus = async () => {
    try {
      const res = await api.get('/kyc/status')
      const data = res.data.data
      if (data) {
        setKycStatus(data)
        if (data.aadhaarVerified) setStep(2)
        if (data.panNumber) setStep(3)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAadhaarSubmit = async (e) => {
    e.preventDefault()
    const cleanNumbers = aadhaarNumber.replace(/\s/g, '')
    if (cleanNumbers.length !== 12) {
      showToast('Aadhaar number must be 12 digits', 'error')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.post('/kyc/aadhaar', { aadhaarNumber: cleanNumbers, consent: true })
      setRequestId(res.data.data.requestId)
      setOtpSent(true)
      showToast('OTP sent to your Aadhaar linked mobile number')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send OTP', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAadhaarVerify = async (e) => {
    e.preventDefault()
    if (aadhaarOtp.length !== 6) {
      showToast('Please enter a 6-digit OTP', 'error')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/kyc/verify-otp', { requestId, otp: aadhaarOtp })
      showToast('Aadhaar verified successfully')
      setKycStatus(prev => ({ ...prev, aadhaarVerified: true }))
      setStep(2)
    } catch (err) {
      showToast(err.response?.data?.message || 'Verification failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePanSubmit = async (e) => {
    e.preventDefault()
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    if (!panRegex.test(panNumber)) {
      showToast('Please enter a valid PAN (ABCDE1234F)', 'error')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/kyc/pan', { panNumber })
      showToast('PAN details submitted')
      setKycStatus(prev => ({ ...prev, panSubmitted: true, panNumber }))
      setStep(3)
    } catch (err) {
      showToast(err.response?.data?.message || 'Submission failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBankSubmit = async (e) => {
    e.preventDefault()
    if (!accountNumber || ifsc.length !== 11) {
      showToast('Please check your bank details', 'error')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/kyc/bank', { accountNumber, ifsc })
      showToast('Bank details verified')
      setKycStatus(prev => ({ ...prev, bankVerified: true, isVerified: true }))
      // In a real app we'd fetch all again
      fetchKycStatus()
    } catch (err) {
      showToast(err.response?.data?.message || 'Bank verification failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const formatAadhaar = (val) => {
    const v = val.replace(/\D/g, '').substring(0, 12)
    const matches = v.match(/(\d{0,4})(\d{0,4})(\d{0,4})/)
    return !matches[2] ? matches[1] : `${matches[1]} ${matches[2]}${matches[3] ? ` ${matches[3]}` : ''}`
  }

  if (loading) return null

  const isKycComplete = kycStatus?.isVerified

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '240px', paddingTop: '64px', minHeight: '100vh', backgroundColor: colors.bg }}>
        <TopBar />
        <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>KYC Verification</h1>
            <p style={{ fontSize: '16px', color: colors.text2 }}>Complete identity verification to enable payouts</p>
          </div>

          {isKycComplete ? (
            <div style={{ backgroundColor: colors.surface, borderRadius: '24px', padding: '48px', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                <CheckCircle size={48} color={colors.success} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>KYC Verified ✓</h2>
              <p style={{ color: colors.text2, marginBottom: '32px' }}>Your identity has been verified successfully.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px', margin: '0 auto 32px auto', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: colors.success }}>
                  <CheckCircle size={18} /> <span>Aadhaar Verified</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: colors.success }}>
                  <CheckCircle size={18} /> <span>PAN Submitted</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: colors.success }}>
                  <CheckCircle size={18} /> <span>Bank Account Verified</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/payouts')}
                style={{ backgroundColor: colors.accent, color: 'white', border: 'none', borderRadius: '12px', padding: '12px 32px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
              >
                You can now request payouts →
              </button>
            </div>
          ) : (
            <>
              {/* Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', backgroundColor: colors.border, zIndex: 0 }}></div>
                {[1, 2, 3].map(s => (
                  <div key={s} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: s < step || (s === 3 && kycStatus?.bankVerified) ? colors.success : s === step ? colors.accent : colors.surface,
                      border: `2px solid ${s <= step ? 'transparent' : colors.border}`,
                      color: 'white', fontSize: '14px', fontWeight: 'bold'
                    }}>
                      {s < step || (s === 3 && kycStatus?.bankVerified) ? '✓' : s}
                    </div>
                    <span style={{ fontSize: '12px', color: s <= step ? 'white' : colors.text3, fontWeight: s === step ? 'bold' : 'normal' }}>
                      {s === 1 ? 'Aadhaar' : s === 2 ? 'PAN Card' : 'Bank Account'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step 1: Aadhaar */}
              {step === 1 && (
                <div style={{ backgroundColor: colors.surface, borderRadius: '16px', padding: '32px', border: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <Shield color={colors.accent} size={24} />
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>Aadhaar Verification</h3>
                  </div>
                  
                  <div style={{ backgroundColor: 'rgba(37,99,235,0.05)', borderLeft: `3px solid ${colors.accent}`, padding: '16px', borderRadius: '4px', marginBottom: '24px' }}>
                    <p style={{ fontSize: '13px', color: colors.text2, lineHeight: '1.5' }}>
                      Your Aadhaar number is never stored. We only use it to verify your identity with UIDAI as per regulations.
                    </p>
                  </div>

                  {!otpSent ? (
                    <form onSubmit={handleAadhaarSubmit}>
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: colors.text2, fontSize: '14px', marginBottom: '8px' }}>Aadhaar Number</label>
                        <input
                          type="text"
                          value={aadhaarNumber}
                          onChange={(e) => setAadhaarNumber(formatAadhaar(e.target.value))}
                          placeholder="XXXX XXXX XXXX"
                          style={{ width: '100%', padding: '12px 16px', backgroundColor: colors.surface2, border: `1px solid ${colors.border}`, borderRadius: '8px', color: 'white', fontSize: '16px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                        <input type="checkbox" required style={{ width: '16px', height: '16px' }} id="consent" />
                        <label htmlFor="consent" style={{ fontSize: '13px', color: colors.text3 }}>
                          I consent to Aadhaar-based verification as per UIDAI guidelines.
                        </label>
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{ width: '100%', backgroundColor: colors.accent, color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Send OTP'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleAadhaarVerify}>
                       <p style={{ fontSize: '14px', color: colors.text2, marginBottom: '16px' }}>
                         OTP sent to mobile linked with Aadhaar ending in {aadhaarNumber.slice(-4)}
                       </p>
                       <div style={{ marginBottom: '24px' }}>
                        <input
                          type="text"
                          maxLength={6}
                          value={aadhaarOtp}
                          onChange={(e) => setAadhaarOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 6-digit OTP"
                          style={{ width: '100%', padding: '12px 16px', backgroundColor: colors.surface2, border: `1px solid ${colors.border}`, borderRadius: '8px', color: 'white', fontSize: '18px', textAlign: 'center', letterSpacing: '4px' }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{ width: '100%', backgroundColor: colors.accent, color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Verify Aadhaar'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setOtpSent(false)} 
                        style={{ width: '100%', background: 'none', border: 'none', color: colors.text3, marginTop: '12px', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Change Aadhaar Number
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Step 2: PAN */}
              {step === 2 && (
                <div style={{ backgroundColor: colors.surface, borderRadius: '16px', padding: '32px', border: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <FileText color={colors.accent} size={24} />
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>PAN Card Verification</h3>
                  </div>
                  
                  <div style={{ backgroundColor: 'rgba(245,158,11,0.05)', borderLeft: `3px solid ${colors.warning}`, padding: '16px', borderRadius: '4px', marginBottom: '24px' }}>
                    <p style={{ fontSize: '13px', color: colors.text2, lineHeight: '1.5' }}>
                      PAN is required for tax deduction as per Section 194BA of the IT Act. Payouts without PAN will attract 30% TDS.
                    </p>
                  </div>

                  <form onSubmit={handlePanSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', color: colors.text2, fontSize: '14px', marginBottom: '8px' }}>PAN Number</label>
                      <input
                        type="text"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase().substring(0, 10))}
                        placeholder="ABCDE1234F"
                        style={{ width: '100%', padding: '12px 16px', backgroundColor: colors.surface2, border: `1px solid ${colors.border}`, borderRadius: '8px', color: 'white', fontSize: '16px' }}
                      />
                      <p style={{ fontSize: '12px', color: colors.text3, marginTop: '8px' }}>Format: 5 letters, 4 digits, 1 letter</p>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{ width: '100%', backgroundColor: colors.accent, color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit PAN Details'}
                    </button>
                  </form>
                </div>
              )}

              {/* Step 3: Bank */}
              {step === 3 && (
                <div style={{ backgroundColor: colors.surface, borderRadius: '16px', padding: '32px', border: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <Building2 color={colors.accent} size={24} />
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>Bank Account Verification</h3>
                  </div>

                  <form onSubmit={handleBankSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', color: colors.text2, fontSize: '14px', marginBottom: '8px' }}>Account Number</label>
                      <input
                        type="password"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter your bank account number"
                        style={{ width: '100%', padding: '12px 16px', backgroundColor: colors.surface2, border: `1px solid ${colors.border}`, borderRadius: '8px', color: 'white', fontSize: '16px' }}
                      />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', color: colors.text2, fontSize: '14px', marginBottom: '8px' }}>IFSC Code</label>
                      <input
                        type="text"
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value.toUpperCase().substring(0, 11))}
                        placeholder="e.g. SBIN0001234"
                        style={{ width: '100%', padding: '12px 16px', backgroundColor: colors.surface2, border: `1px solid ${colors.border}`, borderRadius: '8px', color: 'white', fontSize: '16px' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{ width: '100%', backgroundColor: colors.accent, color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Complete Verification'}
                    </button>
                  </form>
                </div>
              )}

              <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: colors.text3 }}>
                  KYC Progress: {step-1 + (kycStatus?.bankVerified ? 1 : 0)}/3 steps complete
                </p>
                <div style={{ width: '100%', height: '4px', backgroundColor: colors.border, borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                    <div style={{ width: `${((step-1 + (kycStatus?.bankVerified ? 1 : 0)) / 3) * 100}%`, height: '100%', backgroundColor: colors.accent, transition: 'width 0.3s' }}></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default KYCPage
