'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import HirrdLogo from './HirrdLogo'
import ThemeSwitcher from './ThemeSwitcher'

export default function HirrdNav({ user, profile }: { user?: any; profile?: any } = {}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Close on escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const navLinks = [
    { href: '/jobs', label: 'Jobs' },
    { href: '/learnerships', label: 'Learnerships' },
    { href: '/courses', label: 'Courses' },
    { href: '/employers', label: 'Employers' },
  ]

  return (
    <>
      <nav style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <HirrdLogo size="sm" />
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}
             className="hirrd-nav-desktop">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} style={{
              fontSize: '13px', fontWeight: 500,
              color: pathname === href ? 'var(--primary)' : 'var(--text-muted)',
              textDecoration: 'none', transition: 'color 0.15s',
            }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Live indicator — desktop only */}
          <div className="hirrd-nav-desktop" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(58,174,114,0.1)',
            border: '1px solid rgba(58,174,114,0.25)',
            borderRadius: '9999px', padding: '4px 12px',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--success)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>24 LIVE</span>
          </div>

          <ThemeSwitcher />

          <div className="hirrd-nav-desktop" style={{ display: 'flex', gap: '8px' }}>
            <Link href="/auth/login" style={{
              padding: '8px 16px', fontSize: '13px', fontWeight: 600,
              border: '1px solid rgba(124,88,232,0.3)', borderRadius: '8px',
              color: 'var(--primary)', textDecoration: 'none',
              background: 'transparent',
            }}>Sign in</Link>
            <Link href="/auth/register" style={{
              padding: '8px 16px', fontSize: '13px', fontWeight: 600,
              background: 'var(--gradient-primary)', borderRadius: '8px',
              color: 'white', textDecoration: 'none', border: 'none',
            }}>Get hirrd →</Link>
          </div>

          {/* Hamburger — mobile only */}
          <button
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            className="hirrd-nav-mobile"
            style={{
              background: 'none', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '7px 9px',
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              gap: '4px', alignItems: 'center',
            }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: 'block', width: '18px', height: '2px',
                background: 'var(--text-primary)', borderRadius: '2px',
                transition: 'all 0.2s',
                transform: menuOpen
                  ? i === 0 ? 'rotate(45deg) translate(4px, 4px)'
                  : i === 2 ? 'rotate(-45deg) translate(4px, -4px)'
                  : 'scaleX(0)'
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(26,18,64,0.4)',
            zIndex: 40, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Mobile drawer */}
      <div role="dialog" aria-label="Navigation menu" style={{
        position: 'fixed', top: 0, right: 0,
        width: '280px', maxWidth: '85vw',
        height: '100vh', background: 'var(--bg-card)',
        boxShadow: '-4px 0 24px rgba(124,88,232,0.12)',
        zIndex: 50, padding: '20px 0',
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s ease',
      }}>
        <div style={{ padding: '0 24px 20px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
          <HirrdLogo size="sm" />
        </div>

        {navLinks.map(({ href, label }) => (
          <Link key={href} href={href} style={{
            display: 'block', padding: '14px 24px',
            fontSize: '15px', fontWeight: 600,
            color: pathname === href ? 'var(--primary)' : 'var(--text-primary)',
            textDecoration: 'none',
            background: pathname === href ? 'rgba(124,88,232,0.06)' : 'transparent',
            borderLeft: pathname === href ? '3px solid var(--primary)' : '3px solid transparent',
          }}>
            {label}
          </Link>
        ))}

        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/auth/login" style={{
            display: 'block', padding: '13px', textAlign: 'center',
            fontWeight: 600, fontSize: '14px',
            border: '1px solid rgba(124,88,232,0.3)', borderRadius: '10px',
            color: 'var(--primary)', textDecoration: 'none',
          }}>Sign in</Link>
          <Link href="/auth/register" style={{
            display: 'block', padding: '13px', textAlign: 'center',
            fontWeight: 600, fontSize: '14px',
            background: 'var(--gradient-primary)', borderRadius: '10px',
            color: 'white', textDecoration: 'none',
          }}>Get hirrd →</Link>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .hirrd-nav-mobile { display: none !important; } }
        @media (max-width: 767px) { .hirrd-nav-desktop { display: none !important; } }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </>
  )
}
