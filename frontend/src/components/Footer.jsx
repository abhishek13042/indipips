import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
                <span className="text-black font-black text-sm">IP</span>
              </div>
              <span className="text-white font-bold text-xl">Indipips</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              India's first proprietary trading platform built exclusively for Indian traders.
            </p>
            <p className="text-gray-500 text-xs">
              Indipips Private Limited<br />
              CIN: U74999MH2026PTC000000
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="text-white font-bold mb-4">Platform</p>
            <div className="space-y-3">
              <a href="#how-it-works" className="block text-gray-400 hover:text-white text-sm transition-colors">How It Works</a>
              <a href="#plans" className="block text-gray-400 hover:text-white text-sm transition-colors">Challenge Plans</a>
              <a href="#why-us" className="block text-gray-400 hover:text-white text-sm transition-colors">Why Indipips</a>
              <a href="#faq" className="block text-gray-400 hover:text-white text-sm transition-colors">FAQ</a>
            </div>
          </div>

          {/* Account */}
          <div>
            <p className="text-white font-bold mb-4">Account</p>
            <div className="space-y-3">
              <Link to="/register" className="block text-gray-400 hover:text-white text-sm transition-colors">Start Challenge</Link>
              <Link to="/login" className="block text-gray-400 hover:text-white text-sm transition-colors">Login</Link>
              <Link to="/dashboard" className="block text-gray-400 hover:text-white text-sm transition-colors">Dashboard</Link>
              <Link to="/leaderboard" className="block text-gray-400 hover:text-white text-sm transition-colors">Leaderboard</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-white font-bold mb-4">Legal</p>
            <div className="space-y-3">
              <Link to="/terms" className="block text-gray-400 hover:text-white text-sm transition-colors">Terms & Conditions</Link>
              <Link to="/privacy" className="block text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link to="/refund" className="block text-gray-400 hover:text-white text-sm transition-colors">Refund Policy</Link>
              <a href="mailto:support@indipips.com" className="block text-gray-400 hover:text-white text-sm transition-colors">support@indipips.com</a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <p className="text-gray-500 text-xs leading-relaxed">
            <strong className="text-gray-400">Risk Disclaimer:</strong> Trading in financial instruments involves substantial risk of loss. 
            Indipips provides simulated trading environments for evaluation purposes only. 
            Past performance is not indicative of future results. 
            Challenge fees are non-refundable once trading has commenced. 
            Please read our full Terms & Conditions before participating.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 Indipips Private Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://twitter.com/indipips" className="text-gray-500 hover:text-white text-sm transition-colors">Twitter</a>
            <a href="https://t.me/indipips" className="text-gray-500 hover:text-white text-sm transition-colors">Telegram</a>
            <a href="https://instagram.com/indipips" className="text-gray-500 hover:text-white text-sm transition-colors">Instagram</a>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer