import { useState } from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-sm">IP</span>
            </div>
            <span className="text-white font-bold text-xl">Indipips</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How It Works</a>
            <a href="#plans" className="text-gray-400 hover:text-white transition-colors text-sm">Plans & Pricing</a>
            <a href="#why-us" className="text-gray-400 hover:text-white transition-colors text-sm">Why Indipips</a>
            <a href="#faq" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-gray-300 hover:text-white text-sm transition-colors">
              Login
            </Link>
            <Link to="/register" className="bg-green-400 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-300 transition-colors">
              Start Challenge
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4 flex flex-col gap-4">
            <a href="#how-it-works" className="text-gray-400 hover:text-white text-sm">How It Works</a>
            <a href="#plans" className="text-gray-400 hover:text-white text-sm">Plans & Pricing</a>
            <a href="#why-us" className="text-gray-400 hover:text-white text-sm">Why Indipips</a>
            <a href="#faq" className="text-gray-400 hover:text-white text-sm">FAQ</a>
            <Link to="/login" className="text-gray-300 text-sm">Login</Link>
            <Link to="/register" className="bg-green-400 text-black px-4 py-2 rounded-lg text-sm font-bold text-center">
              Start Challenge
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar