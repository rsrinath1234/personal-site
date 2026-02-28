import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getAllPosts, getPostBySlug } from '../../lib/posts'

const BLOG_PASSWORD = 'bangalore2025' // Change this to whatever you want

export default function BlogPost({ post }: { post: any }) {
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (post.private) {
      const stored = sessionStorage.getItem('blog_unlocked')
      if (stored === 'true') setUnlocked(true)
    }
  }, [post.private])

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (input === BLOG_PASSWORD) {
      sessionStorage.setItem('blog_unlocked', 'true')
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  if (post.private && !unlocked) {
    return (
      <>
        <Head><title>Private Post — Your Name</title></Head>
        <div className="gate">
          <div className="gate-box">
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
            <h2>This one's private</h2>
            <p>Enter the password to read this post.</p>
            <form onSubmit={handleUnlock}>
              <input
                type="password"
                placeholder="Password"
                value={input}
                onChange={e => setInput(e.target.value)}
                autoFocus
              />
              {error && <p className="gate-error">That's not right — try again.</p>}
              <button type="submit">Unlock</button>
            </form>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{post.title} — Your Name</title>
        <meta name="description" content={post.excerpt} />
      </Head>

      <div className="container">
        <div className="post-header">
          <Link href="/blog" className="back-link">← All writing</Link>
          <span className="hero-eyebrow">{post.private ? '🔒 Private' : 'Essay'}</span>
          <h1>{post.title}</h1>
          <p className="post-meta">{post.date}</p>
        </div>

        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </div>
    </>
  )
}

export async function getStaticPaths() {
  const posts = getAllPosts()
  return {
    paths: posts.map(p => ({ params: { slug: p.slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  return { props: { post } }
}
