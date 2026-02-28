import Head from 'next/head'
import { projects, statusLabel } from '../lib/projects'

export default function Projects() {
  return (
    <>
      <Head>
        <title>Projects — Your Name</title>
      </Head>

      <div className="container page">
        <div className="fade-up" style={{ marginBottom: '3rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Projects</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '1rem' }}>
            Things I'm building, leading, or thinking through.
          </p>
        </div>

        <div className="project-grid">
          {projects.map((project, i) => (
            <div
              key={i}
              className={`card fade-up fade-up-delay-${Math.min(i + 1, 3)}`}
              style={{ cursor: 'default' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>{project.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge badge--${project.status}`}>{statusLabel[project.status]}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>{project.year}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--ink-muted)', marginBottom: '1rem' }}>
                {project.description}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {project.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: '0.75rem',
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    color: 'var(--ink-muted)',
                    letterSpacing: '0.04em',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
