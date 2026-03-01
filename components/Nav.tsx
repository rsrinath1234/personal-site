import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function Nav() {
  const router = useRouter()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = typeof window !== 'undefined' && localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = stored || (systemDark ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    if (typeof window !== 'undefined') localStorage.setItem('theme', next)
  }

  return (
    <nav>
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          <span className="nav-icon" aria-hidden>🏠</span> Home
        </Link>
        <ul className="nav-links">
          <li><Link href="/blog"><span className="nav-icon" aria-hidden>📝</span> Writing</Link></li>
          <li><Link href="/projects"><span className="nav-icon" aria-hidden>🔨</span> Projects</Link></li>
          <li><Link href="/consulting"><span className="nav-icon" aria-hidden>🤝</span> Work With Me</Link></li>
          <li>
            <button className="theme-toggle" onClick={toggleTheme} type="button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              <span className="icon" aria-hidden>{theme === 'light' ? '☀️' : '🌙'}</span>
              <span className="label">{theme === 'light' ? 'Light' : 'Dark'}</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}
