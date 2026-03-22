import { useState } from 'react'
import { Plus, X, Send } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const colors = {
  bg: '#0A0F1E', card: '#111827', border: '#1F2937', accent: '#10B981',
  text: '#F9FAFB', muted: '#6B7280'
}

const faqs = [
  { q: "What is a proprietary trading firm?", a: "A prop firm provides traders with virtual capital to trade financial markets. You prove your skills during a paid challenge period. Pass the challenge and you get a funded account to trade with our virtual capital — keeping 80% of all profits you generate." },
  { q: "What can I trade on Indipips?", a: "You can trade Nifty 50, BankNifty, MidcapNifty, FinNifty, all F&O contracts, and NSE/BSE equity stocks. All trading happens during Indian market hours: 9:15 AM to 3:15 PM IST." },
  { q: "Is algo/bot trading allowed?", a: "Yes — 100% allowed. Unlike global prop firms that restrict or ban automated trading, Indipips fully supports all trading bots, algorithms, and automated strategies with absolutely no restrictions." },
  { q: "How do payouts work?", a: "Once you pass the challenge and your funded account is 14+ days old, you can request a payout. You keep 80% of profits. We deduct 30% TDS as required by Indian law, and transfer the remaining amount via NEFT/IMPS to your bank within 3 business days." },
  { q: "What is the challenge fee?", a: "Challenge fees range from ₹999 to ₹5,999 depending on account size. 18% GST is included. The fee is fully refunded as a credit with your very first payout after passing." },
  { q: "What happens if I fail?", a: "If you breach any rule (daily loss, max drawdown) your challenge ends. You can retry immediately with a 20% discount on your next challenge fee." },
  { q: "How long is the challenge?", a: "You have 45 calendar days to hit the 8% profit target while following all trading rules. Most successful traders pass within 15-20 days." },
  { q: "Is my money safe?", a: "All challenge accounts are simulated — no real market money is at risk. Challenge fees are collected via Razorpay, a licensed Indian payment gateway. Payouts are made via verified NEFT/IMPS bank transfers." }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)
  const [ref, isVisible] = useScrollReveal()

  const revealStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
  }

  return (
    <section id="faq" ref={ref} style={{ padding: '96px 24px', background: colors.bg }}>
      <div style={{ maxWidth: '768px', margin: '0 auto', ...revealStyle }}>
        
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 'bold', color: colors.text, marginBottom: '16px' }}>Frequently Asked Questions</h2>
          <p style={{ color: colors.muted, fontSize: '18px' }}>Everything you need to know about Indipips and our funding process.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={index} style={{
                border: `1px solid ${isOpen ? `${colors.accent}80` : colors.border}`,
                borderRadius: '16px', background: isOpen ? colors.card : `${colors.card}66`,
                transition: 'all 0.3s ease', ...revealStyle, transitionDelay: `${index * 0.05}s`
              }}>
                <button onClick={() => setOpenIndex(isOpen ? -1 : index)} style={{
                  width: '100%', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: isOpen ? colors.text : colors.muted, transition: 'color 0.3s' }}>
                    {faq.q}
                  </span>
                  <div style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                    {isOpen ? <X size={20} color={colors.accent} /> : <Plus size={20} color={colors.muted} />}
                  </div>
                </button>

                <div style={{
                  maxHeight: isOpen ? '400px' : '0px', opacity: isOpen ? 1 : 0, overflow: 'hidden', transition: 'all 0.3s ease'
                }}>
                  <div style={{ padding: '0 24px 24px', color: colors.muted, lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '64px', textAlign: 'center' }}>
          <p style={{ color: colors.muted, marginBottom: '16px' }}>Still have questions?</p>
          <a href="https://t.me/indipips" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
            borderRadius: '12px', background: `${colors.accent}1A`, border: `1px solid ${colors.accent}4D`,
            color: colors.accent, fontWeight: 'bold', textDecoration: 'none', transition: 'background-color 0.2s'
          }}>
            Contact us on Telegram <Send size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}
