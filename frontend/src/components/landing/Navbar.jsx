import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const colors = {
  bg: '#0A0F1E', card: '#111827', border: '#1F2937', accent: '#10B981',
  text: '#F9FAFB', muted: '#6B7280'
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem('accessToken')

  const navLinks = [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Plans', href: '#plans' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'FAQ', href: '#faq' }
  ]

  const handleScroll = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const element = document.getElementById(href.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        setIsOpen(false)
      }
    } else {
      navigate(href)
      setIsOpen(false)
    }
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 50,
      background: colors.card, padding: '16px 32px',
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      boxSizing: 'border-box'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div style={{
          width: '40px', height: '40px', background: colors.accent,
          borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 'bold', fontSize: '18px'
        }}>
          IP
        </div>
        <span style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
          Indipips
        </span>
      </div>

      {/* Desktop Links */}
      <div style={{ display: 'none', gap: '32px' }} className="md-flex">
        <style dangerouslySetInnerHTML={{ __html: `
          @media (min-width: 768px) { .md-flex { display: flex !important; align-items: center; } .mobile-menu { display: none !important; } }
          .nav-link:hover { color: ${colors.text} !important; }
        `}} />
        {navLinks.map((link, i) => (
          <a key={i} href={link.href} onClick={(e) => handleScroll(e, link.href)} 
             className="nav-link"
             style={{ color: colors.muted, textDecoration: 'none', fontWeight: 500, fontSize: '15px', transition: 'color 0.2s' }}>
            {link.name}
          </a>
        ))}
      </div>

      {/* Desktop Buttons */}
      <div style={{ display: 'none', gap: '16px' }} className="md-flex">
        {token ? (
          <button onClick={() => navigate('/dashboard')} style={{
            padding: '10px 24px', borderRadius: '8px', background: colors.accent,
            color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer'
          }}>Dashboard</button>
        ) : (
          <>
            <button onClick={() => navigate('/login')} style={{
              padding: '10px 24px', borderRadius: '8px', background: 'transparent',
              color: colors.text, border: `1px solid ${colors.border}`, fontWeight: 'bold', cursor: 'pointer'
            }}>Login</button>
            <button onClick={() => navigate('/register')} style={{
              padding: '10px 24px', borderRadius: '8px', background: colors.accent,
              color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer'
            }}>Start Challenge</button>
          </>
        )}
      </div>

      {/* Mobile Toggle */}
      <button className="mobile-menu" onClick={() => setIsOpen(!isOpen)} style={{
        background: 'transparent', border: 'none', color: colors.text, cursor: 'pointer'
      }}>
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: '73px', left: 0, width: '100%',
          background: colors.card, borderBottom: `1px solid ${colors.border}`,
          padding: '24px', display: 'flex', flexDirection: 'col', gap: '16px',
          boxSizing: 'border-box'
        }}>
          {navLinks.map((link, i) => (
            <a key={i} href={link.href} onClick={(e) => handleScroll(e, link.href)} 
               style={{ display: 'block', color: colors.text, textDecoration: 'none', fontWeight: 500, padding: '8px 0' }}>
              {link.name}
            </a>
          ))}
          <div style={{ height: '1px', background: colors.border, margin: '8px 0' }} />
          <button onClick={() => navigate(token ? '/dashboard' : '/login')} style={{
            width: '100%', padding: '12px', borderRadius: '8px', background: 'transparent',
            color: colors.text, border: `1px solid ${colors.border}`, fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px'
          }}>{token ? 'Dashboard' : 'Login'}</button>
          {!token && (
            <button onClick={() => navigate('/register')} style={{
              width: '100%', padding: '12px', borderRadius: '8px', background: colors.accent,
              color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer'
            }}>Start Challenge</button>
          )}
        </div>
      )}
    </nav>
  )
}
