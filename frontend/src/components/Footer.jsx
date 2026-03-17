import { Link } from 'react-router-dom'
import { Twitter, Send, Instagram, Mail } from 'lucide-react'

function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/10 pt-20 pb-10 px-4 overflow-hidden">
      
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-3/4 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-16 mb-16">

          {/* Brand Col */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-green-500 flex items-center justify-center shadow-lg">
                <span className="text-black font-black text-xl tracking-tighter">IP</span>
              </div>
              <span className="text-3xl font-outfit font-bold text-white tracking-tight">Indipips</span>
            </div>
            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-sm font-inter">
              Pioneering the proprietary trading landscape in India. We provide capital, technology, and fair rules for skilled traders to achieve financial independence.
            </p>
            
            <div className="flex items-center gap-4">
              <SocialIcon href="https://twitter.com/indipips" icon={Twitter} />
              <SocialIcon href="https://t.me/indipips" icon={Send} />
              <SocialIcon href="https://instagram.com/indipips" icon={Instagram} />
              <SocialIcon href="mailto:support@indipips.com" icon={Mail} />
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 font-outfit">Platform</h4>
            <div className="space-y-4">
              <FooterLink href="#how-it-works" label="How It Works" />
              <FooterLink href="#pricing" label="Trading Challenges" />
              <FooterLink href="#why-us" label="Why Indipips" />
              <FooterLink href="#faq" label="FAQ Database" />
            </div>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 font-outfit">Dashboard</h4>
            <div className="space-y-4">
              <FooterRouterLink to="/register" label="Start Challenge" />
              <FooterRouterLink to="/login" label="Client Login" />
              <FooterRouterLink to="/dashboard" label="Trader Hub" />
              <FooterRouterLink to="/leaderboard" label="Leaderboard" />
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 font-outfit">Legal</h4>
            <div className="space-y-4">
              <FooterRouterLink to="/terms" label="Terms of Service" />
              <FooterRouterLink to="/privacy" label="Privacy Policy" />
              <FooterRouterLink to="/refund" label="Refund Policy" />
              <FooterRouterLink to="/rules" label="Trading Rules" />
            </div>
          </div>
        </div>

        {/* Disclaimer Box */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 mb-8">
          <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-inter">
            <strong className="text-gray-300 font-semibold">Risk Disclosure:</strong> Trading involves significant risk of loss and is not suitable for all investors. 
            Indipips Private Limited provides simulated trading environments, tools, and evaluations to its clients. 
            All trading activities executed on the platform are simulated across all phases of the evaluation and funded state. 
            Clients do not trade live funds. Past performance in simulated or live markets is not indicative of future results.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <p className="text-gray-500 text-sm font-medium">
            © 2026 Indipips Private Limited. All rights reserved. (CIN: U74999MH2026PTC000000)
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            Designed for <span className="text-green-500 font-bold tracking-widest px-1">INDIA</span>
          </div>
        </div>

      </div>
    </footer>
  )
}

function FooterLink({ href, label }) {
  return (
    <a href={href} className="block text-gray-400 hover:text-green-400 hover:translate-x-1 transition-all duration-300 font-medium">
      {label}
    </a>
  )
}

function FooterRouterLink({ to, label }) {
  return (
    <Link to={to} className="block text-gray-400 hover:text-green-400 hover:translate-x-1 transition-all duration-300 font-medium">
      {label}
    </Link>
  )
}

function SocialIcon({ href, icon: Icon }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all hover:-translate-y-1"
    >
      <Icon size={18} />
    </a>
  )
}

export default Footer