import { Link } from 'react-router-dom'
import { Twitter, Instagram, Linkedin, Send } from 'lucide-react'

const colors = {
  bg: '#0A0F1E', border: '#1F2937', accent: '#10B981', text: '#F9FAFB', muted: '#6B7280'
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{ background: colors.bg, borderTop: `1px solid ${colors.border}`, paddingTop: '80px', paddingBottom: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '80px' }}>
          
          <div style={{ gridColumn: '1 / -1', maxWidth: '400px' }} className="lg-col-span-2">
            <style dangerouslySetInnerHTML={{ __html: `
              @media (min-width: 1024px) { .lg-col-span-2 { grid-column: span 2 / span 2 !important; } }
              .footer-link:hover { color: ${colors.accent} !important; }
            `}} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <div style={{ width: '32px', height: '32px', background: colors.accent, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>IP</div>
              <span style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>Indipips</span>
            </div>
            <p style={{ color: colors.muted, lineHeight: 1.6, marginBottom: '32px' }}>
              India's premier proprietary trading firm, exclusively built for Indian markets, instruments, and infrastructure.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{ color: colors.muted, transition: 'color 0.2s' }} className="footer-link"><Twitter size={20} /></a>
              <a href="#" style={{ color: colors.muted, transition: 'color 0.2s' }} className="footer-link"><Instagram size={20} /></a>
              <a href="#" style={{ color: colors.muted, transition: 'color 0.2s' }} className="footer-link"><Linkedin size={20} /></a>
              <a href="https://t.me/indipips" style={{ color: colors.muted, transition: 'color 0.2s' }} className="footer-link"><Send size={20} /></a>
            </div>
          </div>

          <div>
            <h4 style={{ color: colors.text, fontWeight: 'bold', marginBottom: '24px' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li><a href="#how-it-works" className="footer-link" style={{ color: colors.muted, textDecoration: 'none', transition: 'color 0.2s' }}>How it Works</a></li>
              <li><a href="#plans" className="footer-link" style={{ color: colors.muted, textDecoration: 'none', transition: 'color 0.2s' }}>Pricing</a></li>
              <li><Link to="/leaderboard" className="footer-link" style={{ color: colors.muted, textDecoration: 'none', transition: 'color 0.2s' }}>Leaderboard</Link></li>
              <li><Link to="/certificate-verify" className="footer-link" style={{ color: colors.muted, textDecoration: 'none', transition: 'color 0.2s' }}>Verify Certificate</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: colors.text, fontWeight: 'bold', marginBottom: '24px' }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li><a href="#faq" className="footer-link" style={{ color: colors.muted, textDecoration: 'none', transition: 'color 0.2s' }}>FAQ</a></li>
              <li><a href="mailto:support@indipips.com" className="footer-link" style={{ color: colors.muted, textDecoration: 'none', transition: 'color 0.2s' }}>Contact Us</a></li>
              <li><a href="https://t.me/indipips" className="footer-link" style={{ color: colors.muted, textDecoration: 'none', transition: 'color 0.2s' }}>Telegram Community</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: colors.text, fontWeight: 'bold', marginBottom: '24px' }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li><Link to="/terms" className="footer-link" style={{ color: colors.muted, textDecoration: 'none', transition: 'color 0.2s' }}>Terms of Service</Link></li>
              <li><Link to="/privacy" className="footer-link" style={{ color: colors.muted, textDecoration: 'none', transition: 'color 0.2s' }}>Privacy Policy</Link></li>
              <li><Link to="/refunds" className="footer-link" style={{ color: colors.muted, textDecoration: 'none', transition: 'color 0.2s' }}>Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div style={{ padding: '24px', background: `${colors.border}33`, borderRadius: '16px', border: `1px solid ${colors.border}`, marginBottom: '48px' }}>
          <p style={{ color: colors.muted, fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: colors.text }}>Risk Disclaimer:</strong> All information provided on this site is intended solely for the study purposes related to trading on financial markets and does not serve in any way as a specific investment recommendation, business recommendation, investment opportunity analysis or similar general recommendation regarding the trading of investment instruments. Indipips provides simulated trading environments. We do not provide brokerage services or act as a financial institution. Traders are compensated based on their simulated performance following our profit-sharing agreement.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', mdFlexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderTop: `1px solid ${colors.border}`, paddingTop: '32px' }}>
          <p style={{ color: colors.muted, fontSize: '14px', margin: 0 }}>
            &copy; {currentYear} Indipips. All rights reserved.
          </p>
          <div style={{ color: colors.muted, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Made with <span style={{ color: '#EF4444' }}>❤️</span> in India
          </div>
        </div>

      </div>
    </footer>
  )
}
