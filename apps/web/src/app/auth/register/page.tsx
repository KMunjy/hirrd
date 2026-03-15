'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import HirrdLogo from '@/components/HirrdLogo'

type Role = 'candidate' | 'employer'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole] = useState<Role>('candidate')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { role },
      },
    })
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '40px', maxWidth: '420px', width: '100%', textAlign: 'center', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Check your email</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your Hirrd account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '440px', border: '1px solid var(--border)', boxShadow: '0 8px 40px rgba(124,88,232,0.1)' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <HirrdLogo size="md" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>Get hirrd today</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>South Africa · Zimbabwe · United Kingdom</p>
        </div>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
          {(['candidate', 'employer'] as Role[]).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: `2px solid ${role === r ? 'var(--primary)' : 'var(--border)'}`,
                background: role === r ? 'rgba(124,88,232,0.06)' : 'var(--bg-card)',
                color: role === r ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {r === 'candidate' ? '👤 Job Seeker' : '🏢 Employer'}
            </button>
          ))}
        </div>

        <button
          onClick={handleGoogle}
          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleRegister}>
          {[
            { label: 'FULL NAME', value: fullName, onChange: setFullName, type: 'text', placeholder: 'Thabo Mokoena' },
            { label: 'EMAIL', value: email, onChange: setEmail, type: 'email', placeholder: 'you@example.com' },
            { label: 'PASSWORD', value: password, onChange: setPassword, type: 'password', placeholder: '••••••••' },
          ].map(field => (
            <div key={field.label} style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', letterSpacing: '0.06em' }}>
                {field.label}
              </label>
              <input
                type={field.type}
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                required
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
              />
            </div>
          ))}

          {error && (
            <div style={{ background: 'var(--error-light)', border: '1px solid rgba(192,80,74,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--error)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', fontSize: '15px', padding: '13px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          By signing up you agree to our{' '}
          <Link href="/terms" style={{ color: 'var(--primary)' }}>Terms</Link> and{' '}
          <Link href="/privacy" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
