'use client'

import { useState, useEffect } from 'react'

// ─── TESTIMONIAL BANNER ───────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    initials: 'TM', name: 'Thabo Mokoena', company: 'FNB · Data Analyst', city: 'Johannesburg',
    accentColor: 'var(--primary)', bgColor: 'rgba(123,92,240,0.12)',
    quote: '"Hirrd changed my life. Once I uploaded my CV, the AI matched me to roles I never would have found. Got the call within a week."',
  },
  {
    initials: 'SN', name: 'Sive Nkosi', company: 'Standard Bank · UX Researcher', city: 'Cape Town',
    accentColor: 'var(--secondary)', bgColor: 'rgba(45,212,191,0.12)',
    quote: '"I had no idea my CV was holding me back. Hirrd improved it and matched me to roles I didn\'t even know existed. Truly life-changing."',
  },
  {
    initials: 'PM', name: 'Priya Moodley', company: 'Discovery · Data Science Intern', city: 'Johannesburg',
    accentColor: 'var(--amber)', bgColor: 'rgba(245,158,11,0.12)',
    quote: '"As a graduate with no connections I thought it would take months. Hirrd matched me to a learnership in 48 hours."',
  },
]

export function TestimonialBanner() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setCurrent(c => (c + 1) % TESTIMONIALS.length), 5500)
    return () => clearInterval(interval)
  }, [])

  const t = TESTIMONIALS[current]

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(123,92,240,0.06) 0%, rgba(45,212,191,0.04) 100%)',
      borderTop: '1px solid var(--glass-border)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '20px 32px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '80px', background: 'radial-gradient(ellipse, rgba(123,92,240,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '860px', margin: '0 auto', position: 'relative' }}>
        {/* Avatar */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: t.bgColor,
          border: `2px solid ${t.accentColor}40`,
          boxShadow: `0 0 20px ${t.accentColor}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '15px', fontWeight: 800, color: t.accentColor, flexShrink: 0,
          transition: 'all 0.5s ease',
        }}>{t.initials}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</span>
            <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '9999px', background: 'var(--success-light)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 600 }}>{t.company}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📍 {t.city}</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.7 }}>{t.quote}</div>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} aria-label={`Testimonial ${i + 1}`}
              style={{ width: '7px', height: i === current ? '20px' : '7px', borderRadius: '4px', border: 'none', cursor: 'pointer', padding: 0, background: i === current ? t.accentColor : 'rgba(255,255,255,0.15)', transition: 'all 0.3s ease' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────

interface HeroStats {
  jobs: number
  learnerships: number
  internships: number
  bursaries: number
}

export function HeroSection({ stats }: { stats?: HeroStats }) {
  const total = (stats?.jobs || 0) + (stats?.learnerships || 0) + (stats?.internships || 0) + (stats?.bursaries || 0)

  return (
    <section style={{
      padding: 'clamp(48px, 8vw, 96px) 24px clamp(40px, 6vw, 72px)',
      textAlign: 'center',
      background: 'var(--gradient-hero)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Orbital rings */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '700px', height: '700px', border: '1px solid rgba(123,92,240,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', border: '1px solid rgba(45,212,191,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Gradient orbs */}
      <div style={{ position: 'absolute', top: '-100px', right: '-80px', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,240,0.15) 0%, transparent 65%)', pointerEvents: 'none', filter: 'blur(20px)' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 65%)', pointerEvents: 'none', filter: 'blur(20px)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Live badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(123,92,240,0.1)', border: '1px solid rgba(123,92,240,0.25)', borderRadius: '9999px', padding: '7px 18px', marginBottom: '28px', fontSize: '12px', color: 'var(--violet-glow)', fontWeight: 700, letterSpacing: '0.04em' }}>
          <span className="glow-dot" style={{ width: '7px', height: '7px' }} />
          {total > 0 ? `${total.toLocaleString()} live opportunities` : 'AI-powered · South Africa · Early Access'}
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.03em', maxWidth: '780px', margin: '0 auto 20px' }}>
          The platform built to{' '}
          <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            change careers
          </span>
        </h1>

        {/* Sub */}
        <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 36px', lineHeight: 1.75 }}>
          Upload your CV once. Hirrd matches you with SA jobs, learnerships, bursaries and internships — powered by AI.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/auth/register" className="btn btn-primary" style={{ fontSize: '15px', padding: '14px 32px', gap: '8px' }}>
            Upload CV — get matched →
          </a>
          <a href="/employers" className="btn btn-ghost" style={{ fontSize: '15px', padding: '14px 28px' }}>
            Post a job
          </a>
        </div>

        {/* Stats row */}
        <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center', gap: 'clamp(24px, 5vw, 56px)', flexWrap: 'wrap' }}>
          {[
            { value: stats?.jobs ? `${stats.jobs.toLocaleString()}+` : 'Live', label: 'Jobs' },
            { value: stats?.learnerships ? `${stats.learnerships.toLocaleString()}+` : 'SETA', label: 'Learnerships' },
            { value: stats?.bursaries ? `${stats.bursaries.toLocaleString()}+` : 'Funded', label: 'Bursaries' },
            { value: 'Free', label: 'To Join' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Trusted by strip */}
        <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Trusted by</span>
          {['FNB', 'Standard Bank', 'Vodacom', 'Discovery', 'MTN'].map(name => (
            <span key={name} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', padding: '4px 12px', background: 'var(--glass-1)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>{name}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FOOTER BAR ───────────────────────────────────────────────────────────────

export function FooterBar() {
  return (
    <footer style={{ background: 'var(--deep)', borderTop: '1px solid var(--glass-border)', padding: '24px 32px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Hirrd</span>
          <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Career Intelligence · ZA · ZW · UK</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {['Privacy', 'Terms', 'Support'].map(l => (
            <a key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {['JHB', 'CPT', 'LDN'].map(m => (
            <span key={m} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 6px rgba(16,185,129,0.8)', display: 'inline-block' }} />
              {m}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default HeroSection
