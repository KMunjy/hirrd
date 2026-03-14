'use client'

import { useState } from 'react'
import Link from 'next/link'
import HirrdLogo from './HirrdLogo'
import ThemeSwitcher from './ThemeSwitcher'

export default function HirrdNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav
      style={{
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
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <HirrdLogo size="sm" />
      </Link>

      {/* Desktop nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}
           className="hidden md:flex">
        <NavLink href="/jobs">Jobs</NavLink>
        <NavLink href="/learnerships">Learnerships</NavLink>
        <NavLink href="/courses">Courses</NavLink>
        <NavLink href="/employers">Employers</NavLink>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Live indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--success-light)',
          border: '1px solid rgba(58,174,114,0.25)',
          borderRadius: '9999px',
          padding: '4px 12px',
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--success)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>24 LIVE</span>
        </div>

        <ThemeSwitcher />

        <Link href="/auth/login">
          <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Sign in
          </button>
        </Link>
        <Link href="/auth/register">
          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Get hirrd →
          </button>
        </Link>
      </div>
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-muted)',
        textDecoration: 'none',
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
    >
      {children}
    </Link>
  )
}
