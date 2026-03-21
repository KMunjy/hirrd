'use client'
import { useState } from 'react'
import Link from 'next/link'
import HirrdLogo from './HirrdLogo'

interface Props { user?: any; profile?: any }

export default function HirrdNav({ user, profile }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: '/jobs', label: 'Jobs' },
    { href: '/learnerships', label: 'Learnerships' },
    { href: '/courses', label: 'Courses' },
    { href: '/employers', label: 'For Employers' },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(9,6,26,0.82)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 28px',
        height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <HirrdLogo size="sm" />
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="hide-mobile">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="nav-pill">{l.label}</Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '9999px' }} className="hide-mobile">
            <span className="glow-dot" style={{ width: '6px', height: '6px' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#34D399', letterSpacing: '0.08em' }}>LIVE</span>
          </div>

          {user ? (
            <>
              <Link href="/applications" className="nav-pill hide-mobile">Applications</Link>
              <Link href="/profile" className="nav-pill hide-mobile">Profile</Link>
              <Link href="/dashboard" style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #7B5CF0, #2DD4BF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 800, color: 'white',
                textDecoration: 'none', flexShrink: 0,
                boxShadow: '0 0 16px rgba(123,92,240,0.4)',
              }}>
                {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="nav-pill hide-mobile">Sign in</Link>
              <Link href="/auth/register" className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 18px' }}>
                Get hirrd →
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(o => !o)} aria-label="Toggle navigation"
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,236,255,0.7)', padding: '6px' }}
            className="show-mobile">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <><path d="M3 12h18M3 6h18M3 18h18" /></>}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, right: 0, zIndex: 99,
          background: 'rgba(9,6,26,0.97)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '16px 24px 24px',
        }}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{
              display: 'block', padding: '14px 0',
              fontSize: '16px', fontWeight: 600, color: 'rgba(240,236,255,0.8)',
              textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>{l.label}</Link>
          ))}
          {user && (
            <>
              <Link href="/applications" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '14px 0', fontSize: '16px', fontWeight: 600, color: 'rgba(240,236,255,0.8)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Applications</Link>
              <Link href="/profile" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '14px 0', fontSize: '16px', fontWeight: 600, color: 'rgba(240,236,255,0.8)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Profile</Link>
            </>
          )}
          <div style={{ paddingTop: '16px', display: 'flex', gap: '10px' }}>
            {user ? (
              <Link href="/dashboard" className="btn btn-primary" style={{ flex: 1, textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>Dashboard →</Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-ghost" style={{ flex: 1, textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>Sign in</Link>
                <Link href="/auth/register" className="btn btn-primary" style={{ flex: 1, textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>Get hirrd →</Link>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ height: '60px' }} />

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </>
  )
}
