import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Nav() {
  const router = useRouter()

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
        </ul>
      </div>
    </nav>
  )
}
