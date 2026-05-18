import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', exact: true },
  { to: '/register', label: 'Register' },
  { to: '/auction', label: 'Auction' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/matches', label: 'Matches' },
  { to: '/teams', label: 'Teams' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location])

  return (
    <nav className="navbar" style={scrolled ? { borderBottomColor: 'rgba(255,58,0,0.3)' } : {}}>
      <NavLink to="/" className="nav-logo">
        ⚡ BATTLEBOTS
        <span>2025 CHAMPIONSHIP</span>
      </NavLink>

      <ul className={`nav-links ${open ? 'open' : ''}`}>
        {links.map(l => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.exact}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {l.label}
            </NavLink>
          </li>
        ))}
        <li>
          <NavLink to="/admin" className="nav-cta">
            Admin Panel
          </NavLink>
        </li>
      </ul>

      <button
        className="hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span style={open ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}} />
        <span style={open ? { opacity: 0 } : {}} />
        <span style={open ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}} />
      </button>
    </nav>
  )
}
