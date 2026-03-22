import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

const colors = {
  bg: '#0A0F1E',
  card: '#111827',
  border: '#1F2937',
  accent: '#2563EB', // Blue as requested
  gold: '#F59E0B',
  success: '#10B981',
  text: '#F9FAFB',
  muted: '#6B7280'
}

const formatINR = (paise) => {
  if (!paise && paise !== 0) return '₹0'
  const rupees = Number(paise) / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(rupees)
}

export default function Pricing() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState('ONE_STEP')
  const navigate = useNavigate()
  const token = localStorage.getItem('accessToken')

  useEffect(() => {
    api.get('/plans')
      .then(res => {
        console.log('Plans API response:', res.data)
        console.log('Plans data:', res.data.data)
        setPlans(res.data.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Plans error:', err)
        setError(true)
        setLoading(false)
      })
  }, [])

  const filteredPlans = plans.filter(p => 
    p.challengeType === activeTab || 
    p.type === activeTab || 
    p.planType === activeTab
  )

  const handleBuy = (planId) => {
    if (!token) {
      navigate('/register')
    } else {
      navigate(`/buy-challenge?planId=${planId}`)
    }
  }

  const renderRules = (type) => {
    if (type === 'ONE_STEP') {
      return (
        <>
          <Rule item="8% Profit Target" />
          <Rule item="4% Daily Loss Limit" />
          <Rule item="8% Max Drawdown" />
          <Rule item="Min 5 Trading Days" />
          <Rule item="45 Day Duration" />
          <Rule item="80% Profit Split" />
          <Rule item="Algo Trading Allowed" />
        </>
      )
    }
    if (type === 'TWO_STEP') {
      return (
        <>
          <Rule item="Phase 1: 8% Target" />
          <Rule item="Phase 2: 5% Target" />
          <Rule item="5% Daily Loss Limit" />
          <Rule item="10% Max Drawdown" />
          <Rule item="Min 3 Trading Days" />
          <Rule item="60 Day Duration" />
          <Rule item="80% Profit Split" />
        </>
      )
    }
    if (type === 'ZERO_STEP') {
      return (
        <>
          <Rule item="No Profit Target" />
          <Rule item="Instant Funding" />
          <Rule item="3% Daily Loss Limit" />
          <Rule item="5% Max Drawdown" />
          <Rule item="80% Profit Split" />
          <Rule item="Algo Trading Allowed" />
        </>
      )
    }
  }

  return (
    <section id="plans" style={{ padding: '80px 24px', background: colors.bg, minHeight: '800px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: colors.text, marginBottom: '16px' }}>
            Choose Your Challenge
          </h2>
          <p style={{ color: colors.muted, fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            Select the funding track that fits your style. Pass the challenge, get paid in INR.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '48px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'ONE_STEP', label: '1-Step' },
            { id: 'TWO_STEP', label: '2-Step' },
            { id: 'ZERO_STEP', label: 'Instant Funded' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '16px', transition: 'all 0.2s',
                background: activeTab === tab.id ? colors.accent : colors.card,
                color: colors.text, border: `1px solid ${activeTab === tab.id ? colors.accent : colors.border}`
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Plans Grid */}
        <div style={{ 
          display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'
        }}>
          {loading ? (
            Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : error ? (
            <div style={{ color: '#EF4444', textAlign: 'center', padding: '40px' }}>
              Failed to load plans. Please check if the backend is running.
            </div>
          ) : filteredPlans.length === 0 ? (
            <div style={{ color: colors.muted, textAlign: 'center', padding: '40px' }}>
              No plans found for this category.
            </div>
          ) : (
            filteredPlans.map((plan) => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onBuy={() => handleBuy(plan.id)} 
                rules={renderRules(activeTab)}
              />
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function PlanCard({ plan, onBuy, rules }) {
  const isPro = plan.name?.toLowerCase().includes('pro')
  
  return (
    <div style={{
      background: colors.card, border: `1px solid ${isPro ? colors.gold : colors.border}`,
      borderRadius: '16px', padding: '32px', width: '220px', display: 'flex',
      flexDirection: 'column', position: 'relative', transition: 'transform 0.2s'
    }}>
      {isPro && (
        <div style={{
          position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
          background: colors.gold, color: 'black', padding: '4px 12px', borderRadius: '999px',
          fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'
        }}>
          Most Popular
        </div>
      )}

      <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
        {plan.name}
      </div>
      
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
        {formatINR(plan.accountSize)}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.accent }}>
          {formatINR(plan.challengeFee)}
        </div>
        <div style={{ fontSize: '12px', color: colors.muted }}>+ 18% GST</div>
      </div>

      <div style={{ height: '1px', background: colors.border, marginBottom: '24px' }} />

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flexGrow: 1, gap: '12px', display: 'flex', flexDirection: 'column' }}>
        {rules}
      </ul>

      <button onClick={onBuy} style={{
        width: '100%', padding: '12px', borderRadius: '12px', background: colors.accent,
        color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer',
        fontSize: '14px', marginTop: 'auto'
      }}>
        Buy Challenge →
      </button>
    </div>
  )
}

function Rule({ item }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.text, fontSize: '13px' }}>
      <Check size={14} color={colors.success} />
      {item}
    </li>
  )
}

function SkeletonCard() {
  return (
    <div style={{
      background: colors.card, border: `1px solid ${colors.border}`,
      borderRadius: '16px', padding: '32px', width: '220px', height: '400px',
      display: 'flex', flexDirection: 'column', gap: '20px',
      animation: 'pulse 1.5s infinite ease-in-out'
    }}>
      <div style={{ height: '20px', background: colors.border, borderRadius: '4px', width: '60%' }} />
      <div style={{ height: '30px', background: colors.border, borderRadius: '4px', width: '80%' }} />
      <div style={{ height: '40px', background: colors.border, borderRadius: '4px', width: '100%' }} />
      <div style={{ height: '1px', background: colors.border, width: '100%' }} />
      <div style={{ height: '120px', background: colors.border, borderRadius: '4px', width: '100%' }} />
      <div style={{ height: '40px', background: colors.border, borderRadius: '12px', width: '100%', marginTop: 'auto' }} />
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
