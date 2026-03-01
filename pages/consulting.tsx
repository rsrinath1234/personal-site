import Head from 'next/head'
import { useState } from 'react'

export default function Consulting() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = new FormData(form)

    // Replace YOUR_FORM_ID below with your Formspree form ID
    // Sign up free at formspree.io, create a form, copy the ID
    const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    })

    if (res.ok) {
      setSubmitted(true)
    }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Work With Me — Your Name</title>
      </Head>

      <div className="container page">
        <div className="fade-up" style={{ marginBottom: '3.5rem' }}>
          <h1 style={{ marginBottom: '0.75rem' }}>Work With Me</h1>
          <p style={{ color: 'var(--ink-secondary)', maxWidth: '520px', fontSize: '1.05rem', lineHeight: '1.8' }}>
            I advise early-stage teams on operations, hiring, and building high-functioning offshore teams. 
            If you're working on something interesting, I'd love to hear about it.
          </p>
          <div className="hero-divider" style={{ marginTop: '2rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
            {['Operations & Scaling', 'Offshore Team Building', 'Hiring Strategy', 'Exec Advising'].map(area => (
              <div key={area} style={{ padding: '1.25rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{area}</p>
              </div>
            ))}
          </div>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✉️</div>
            <h2 style={{ marginBottom: '0.75rem' }}>Got it — thanks.</h2>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem' }}>I'll be in touch within a few days.</p>
          </div>
        ) : (
          <div>
            <p className="section-label">Send an Inquiry</p>
            <form onSubmit={handleSubmit} style={{ maxWidth: '560px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input id="name" name="name" type="text" required placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" required placeholder="you@company.com" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="company">Company / Context</label>
                <input id="company" name="company" type="text" placeholder="Where you're coming from" />
              </div>
              <div className="form-group">
                <label htmlFor="message">What are you working on?</label>
                <textarea id="message" name="message" required placeholder="Tell me about the problem or opportunity..." />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  )
}
