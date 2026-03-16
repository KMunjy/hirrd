'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import HirrdLogo from '@/components/HirrdLogo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'var(--glass-2)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', border: '1px solid var(--border)', boxShadow: '0 8px 40px rgba(124,88,232,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <HirrdLogo size="md" />
          </div>
          {sent ? (
            <>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📬</div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Check your inbox</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                We sent a reset link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. It expires in 1 hour.
              </p>
              <Link href="/auth/login" style={{ display: 'inline-block', marginTop: '24px', padding: '12px 28px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Reset your password</h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Enter your email and we&apos;ll send a reset link</p>
            </>
          )}
        </div>

        {!sent && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="forgot-email" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', letterSpacing: '0.06em' }}>EMAIL</label>
              <input
                id="forgot-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(124,88,232,0.2)', background: 'var(--glass-1)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {error && (
              <div style={{ background: '#fff5f5', border: '1px solid rgba(192,80,74,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--error)' }}>{error}</div>
            )}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, fontSize: '15px', border: 'none', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Sending…' : 'Send reset link →'}
            </button>
          </form>
        )}

        {!sent && (
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Remembered it? <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
