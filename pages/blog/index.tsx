import Head from 'next/head'
import Link from 'next/link'
import { getAllPosts } from '../../lib/posts'

export default function Blog({ posts }: { posts: any[] }) {
  return (
    <>
      <Head>
        <title>Writing — Your Name</title>
      </Head>

      <div className="container page">
        <div className="fade-up" style={{ marginBottom: '3rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Writing</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '1rem' }}>
            Essays on building, identity, and whatever's on my mind.
            Some posts are private — request access below.
          </p>
        </div>

        <div className="card-grid">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`card fade-up fade-up-delay-${Math.min(i + 1, 3)}`}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>{post.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {post.private && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em' }}>🔒 PRIVATE</span>
                  )}
                  <span className="card-date" style={{ fontStyle: 'italic' }}>{post.date}</span>
                </div>
              </div>
              <p style={{ marginBottom: 0 }}>{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const posts = getAllPosts()
  return { props: { posts } }
}
