'use client'
import Link from 'next/link'
import HirrdLogo from './HirrdLogo'

interface ComingSoonProps {
  title: string
  description: string
  launchHint?: string
  ctaText?: string
  ctaHref?: string
  emoji?: string
}

export default function ComingSoon({ title, description, launchHint, ctaText = 'Upload your CV now', ctaHref = '/auth/register', emoji = '🚀' }: ComingSoonProps) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ marginBottom: '32px' }}>
        <HirrdLogo size="md" />
      </div>

      <div style={{ fontSize: '56px', marginBottom: '20px', lineHeight: 1 }}>{emoji}</div>

      <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', maxWidth: '500px' }}>
        {title}
      </h1>

      <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.6, marginBottom: '8px' }}>
        {description}
      </p>

      {launchHint && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          {launchHint}
        </p>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: launchHint ? '0' : '32px' }}>
        <Link href={ctaHref} style={{ padding: '12px 28px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, fontSize: '15px', textDecoration: 'none', display: 'inline-block' }}>
          {ctaText} →
        </Link>
        <Link href="/" style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid rgba(124,88,232,0.3)', color: 'var(--primary)', fontWeight: 600, fontSize: '15px', textDecoration: 'none', display: 'inline-block' }}>
          ← Back to Hirrd
        </Link>
      </div>

      <div style={{ marginTop: '48px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>HIRRD IS LIVE — START YOUR JOURNEY TODAY</span>
      </div>
    </div>
  )
}
