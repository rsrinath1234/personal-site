import Head from 'next/head'
import Link from 'next/link'
import { getAllPosts } from '../lib/posts'
import { getRecentProjects, statusLabel } from '../lib/projects'

type RecentItem =
  | { type: 'writing'; slug: string; title: string; excerpt: string; date: string; private?: boolean }
  | { type: 'project'; title: string; description: string; status: string; year: string; tags: string[]; sortDate: string }

export default function Home({ recentUpdates }: { recentUpdates: RecentItem[] }) {
  return (
    <>
      <Head>
        <title>Raghav Srinath</title>
        <meta name="description" content="Learning about my Indian identity and building in AI. Check out my latest writing and projects." />
      </Head>

      <div className="container--wide">
        <section className="hero fade-up">
          <span className="hero-eyebrow">Raghav Srinath</span>
          <h1>Hello! My name is Raghav.</h1>
          <p className="hero-bio">
            I'll be documenting my latest adventures, thoughts, and projects here.
          </p>
        </section>

        <section style={{ paddingBottom: '6rem' }}>
          <p className="section-label fade-up fade-up-delay-1">Recent updates</p>
          <div className="card-grid">
            {recentUpdates.map((item, i) => (
              item.type === 'writing' ? (
                <Link
                  key={`post-${item.slug}`}
                  href={`/blog/${item.slug}`}
                  className={`card fade-up fade-up-delay-${Math.min(i + 2, 3)}`}
                >
                  <div className="card-tag">
                    {item.private ? <>🔒 Private</> : 'Essay'}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                  <span className="card-date">{item.date}</span>
                </Link>
              ) : (
                <Link
                  key={`project-${item.title}`}
                  href="/projects"
                  className={`card fade-up fade-up-delay-${Math.min(i + 2, 3)}`}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>{item.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge badge--${item.status}`}>{statusLabel[item.status]}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>{item.year}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', marginBottom: 0 }}>{item.description}</p>
                </Link>
              )
            ))}
          </div>
          <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/blog" style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: 'var(--ink-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              All writing →
            </Link>
            <Link href="/projects" style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: 'var(--ink-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              All projects →
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const posts = getAllPosts().slice(0, 4)
  const projectsList = getRecentProjects(4)
  const recentUpdates: RecentItem[] = [
    ...posts.map(p => ({ type: 'writing' as const, slug: p.slug, title: p.title, excerpt: p.excerpt, date: p.date, private: p.private })),
    ...projectsList.map(p => ({ type: 'project' as const, title: p.title, description: p.description, status: p.status, year: p.year, tags: p.tags, sortDate: p.sortDate })),
  ].sort((a, b) => {
    const dateA = a.type === 'writing' ? a.date : a.sortDate
    const dateB = b.type === 'writing' ? b.date : b.sortDate
    return dateA > dateB ? -1 : 1
  }).slice(0, 6)
  return { props: { recentUpdates } }
}
