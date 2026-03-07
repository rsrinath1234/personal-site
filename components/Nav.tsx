import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'

export default function Nav() {
  const router = useRouter()
  const navRef = useRef<HTMLElement>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const stored = typeof window !== 'undefined' && localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = stored || (systemDark ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [router.asPath])

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [menuOpen])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    if (typeof window !== 'undefined') localStorage.setItem('theme', next)
  }

  return (
    <nav ref={navRef}>
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          <span className="nav-icon" aria-hidden>🏠</span> Home
        </Link>
        <ul className="nav-links">
          <li className="nav-link-item"><Link href="/blog"><span className="nav-icon" aria-hidden>📝</span> Writing</Link></li>
          <li className="nav-link-item"><Link href="/projects"><span className="nav-icon" aria-hidden>🔨</span> Projects</Link></li>
          <li className="nav-link-item"><Link href="/consulting"><span className="nav-icon" aria-hidden>🤝</span> Work With Me</Link></li>
          <li className="nav-actions">
            <button
              className="nav-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span className="nav-menu-icon" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </button>
            <button className="theme-toggle" onClick={toggleTheme} type="button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              <span className="icon" aria-hidden>{theme === 'light' ? '☀️' : '🌙'}</span>
              <span className="label">{theme === 'light' ? 'Light' : 'Dark'}</span>
            </button>
          </li>
        </ul>
      </div>
      <div className={`nav-dropdown ${menuOpen ? 'nav-dropdown--open' : ''}`}>
        <Link href="/blog" className="nav-dropdown-link"><span className="nav-icon" aria-hidden>📝</span> Writing</Link>
        <Link href="/projects" className="nav-dropdown-link"><span className="nav-icon" aria-hidden>🔨</span> Projects</Link>
        <Link href="/consulting" className="nav-dropdown-link"><span className="nav-icon" aria-hidden>🤝</span> Work With Me</Link>
      </div>
    </nav>
  )
}
