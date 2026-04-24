import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Safety', href: '#safety' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    // Check login state
    const stored = localStorage.getItem('userInfo')
    if (stored) setUser(JSON.parse(stored))
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('userInfo')
    setUser(null)
  }

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-200 ${
      scrolled ? 'bg-white shadow-sm border-b border-gray-100' : 'bg-white/90 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-md">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V7c0-.55.45-1 1-1z"/>
            </svg>
          </div>
          <span className="font-black text-gray-950 text-lg tracking-tight">
            Rapid<span className="text-red-600">Care</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <a href="tel:108" className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-red-600 transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17.5z"/>
            </svg>
            108
          </a>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl">
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-black">{user.name?.[0]?.toUpperCase()}</span>
                </div>
                <span className="text-sm font-bold text-gray-700">{user.name?.split(' ')[0]}</span>
              </div>
              <button onClick={handleLogout} className="text-xs font-bold text-gray-400 hover:text-gray-700 transition">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition">
              Sign In
            </Link>
          )}
          <Link
            to="/book"
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-md shadow-red-100"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">
              {l.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <a href="tel:108" className="text-center border border-gray-200 py-3 rounded-xl font-bold text-sm text-gray-700">
              Call 108 (Free)
            </a>
            <Link to="/book" onClick={() => setOpen(false)}
              className="bg-red-600 text-white py-3 rounded-xl font-bold text-sm text-center">
              Book Ambulance
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
