'use client'

import { useState, useEffect } from 'react'

// ─── TESTIMONIAL BANNER ───────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    initials: 'TM', name: 'Thabo Mokoena', company: 'FNB · Data Analyst', city: 'Johannesburg',
    accentColor: 'var(--primary)', bgColor: 'rgba(124,88,232,0.08)',
    quote: '"Hirrd changed my life with an improved CV and finding me opportunities even while I was at home with no data — once I uploaded my CV, Hirrd didn\'t stop until I found my right opportunity. Thank you Hirrd."',
  },
  {
    initials: 'SN', name: 'Sive Nkosi', company: 'Standard Bank · UX Researcher', city: 'Cape Town',
    accentColor: 'var(--secondary)', bgColor: 'rgba(56,198,212,0.08)',
    quote: '"I had no idea my CV was holding me back. Hirrd improved it and matched me to roles I didn\'t even know existed. I got the call within a week. Truly life-changing."',
  },
  {
    initials: 'PM', name: 'Priya Moodley', company: 'Discovery · Data Science Intern', city: 'Johannesburg',
    accentColor: 'var(--warning)', bgColor: 'rgba(196,150,42,0.08)',
    quote: '"As a graduate with no connections I thought it would take months. Hirrd matched me to this learnship in 48 hours. The AI knew exactly what I needed. Thank you."',
  },
]

export function TestimonialBanner() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setCurrent(c => (c + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(interval)
  }, [])

  const t = TESTIMONIALS[current]

  return (
    <div style={{
      background: 'var(--glass-2)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      padding: '16px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: t.bgColor, border: `2.5px solid ${t.accentColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '15px', fontWeight: 700, color: t.accentColor, flexShrink: 0,
          transition: 'all 0.4s ease',
        }}>
          {t.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</span>
            <span style={{
              fontSize: '11px', padding: '2px 10px', borderRadius: '9999px',
              background: 'var(--success-light)', color: 'var(--success)',
              border: '1px solid rgba(58,174,114,0.2)', fontWeight: 600,
            }}>{t.company}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.city}</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.7 }}>
            {t.quote}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Show testimonial ${i + 1} of ${TESTIMONIALS.length}`}
              aria-pressed={i === current}
              style={{
                width: '8px', height: '8px', borderRadius: '50%', border: 'none',
                cursor: 'pointer', padding: 0,
                background: i === current ? 'var(--primary)' : 'rgba(124,88,232,0.2)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}


// ─── HERO SECTION ─────────────────────────────────────────────────────────────

export function HeroSection() {
  return (
    <section style={{
      padding: '48px 24px 32px',
      textAlign: 'center',
      background: 'var(--gradient-hero)',
      borderBottom: '1px solid var(--border)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,88,232,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', left: '-60px',
        width: '250px', height: '250px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,198,212,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'rgba(124,88,232,0.08)', border: '1px solid var(--border-medium)',
        borderRadius: '9999px', padding: '6px 16px', marginBottom: '20px',
        fontSize: '12px', color: 'var(--primary)', fontWeight: 600,
      }}>
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
        AI-powered · South Africa · Early Access
      </div>

      <h1 style={{
        fontSize: 'clamp(32px, 5vw, 56px)',
        fontWeight: 800,
        color: 'var(--text-primary)',
        lineHeight: 1.15,
        marginBottom: '16px',
        letterSpacing: '-0.03em',
        maxWidth: '700px',
        margin: '0 auto 16px',
      }}>
        The platform built to{' '}
        <span style={{
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          change careers
        </span>
      </h1>

      <p style={{
        fontSize: '17px',
        color: 'var(--text-muted)',
        maxWidth: '540px',
        margin: '0 auto 32px',
        lineHeight: 1.7,
      }}>
        Upload your CV once. Hirrd matches you with jobs, learnerships, and courses across South Africa — even when you're offline.
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" style={{ fontSize: '15px', padding: '13px 28px' }}>
          Upload CV — get matched →
        </button>
        <button className="btn btn-outline" style={{ fontSize: '15px', padding: '13px 24px' }}>
          Post a job
        </button>
      </div>

      <div style={{
        marginTop: '32px',
        display: 'flex',
        justifyContent: 'center',
        gap: '32px',
        flexWrap: 'wrap',
      }}>
        {[
          { value: 'Early', label: 'Access Open' },
          { value: 'SA', label: 'Focus' },
          { value: 'AI', label: 'Powered' },
          { value: 'Free', label: 'To Join' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── FOOTER BAR ───────────────────────────────────────────────────────────────

export function FooterBar() {
  return (
    <footer style={{
      background: 'var(--gradient-primary)',
      padding: '8px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
        Hirrd · Career Intelligence · hirrd.com
      </span>
      <div style={{ display: 'flex', gap: '16px' }}>
        {['JHB LIVE', 'CPT LIVE', 'LDN LIVE'].map(m => (
          <span key={m} style={{ fontSize: '10px', color: '#fff', fontWeight: 600 }}>● {m}</span>
        ))}
      </div>
    </footer>
  )
}


export default HeroSection
