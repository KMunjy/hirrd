'use client'
import { useState } from 'react'
import Link from 'next/link'
import HirrdLogo from '@/components/HirrdLogo'

export const dynamic = 'force-dynamic'

export default function EmployersPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ company: '', size: '', market: '', email: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <HirrdLogo size="md" />
      </div>

      {submitted ? (
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>You&apos;re on the list</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>We&apos;ll reach out to <strong>{form.email}</strong> when employer accounts launch. You&apos;ll get early access and free job credits.</p>
          <Link href="/" style={{ padding: '12px 28px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, textDecoration: 'none' }}>← Back to Hirrd</Link>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '460px', border: '1px solid var(--border)', boxShadow: '0 8px 40px rgba(124,88,232,0.08)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Post jobs on Hirrd</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.5 }}>
            Employer accounts are launching soon. Register your interest and get free job credits on launch day.
          </p>

          <form onSubmit={handleSubmit}>
            {[
              { label: 'COMPANY NAME', key: 'company', placeholder: 'Acme Corp', type: 'text' },
              { label: 'WORK EMAIL', key: 'email', placeholder: 'you@company.com', type: 'email' },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key} style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  required
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>COMPANY SIZE</label>
              <select
                required
                value={form.size}
                onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
              >
                <option value="">Select size</option>
                <option value="1-10">1–10 employees</option>
                <option value="11-50">11–50 employees</option>
                <option value="51-200">51–200 employees</option>
                <option value="201+">201+ employees</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>PRIMARY MARKET</label>
              <select
                required
                value={form.market}
                onChange={e => setForm(f => ({ ...f, market: e.target.value }))}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
              >
                <option value="">Select market</option>
                <option value="za">South Africa</option>
                <option value="zw">Zimbabwe</option>
                <option value="uk">United Kingdom</option>
                <option value="remote">Remote / Global</option>
              </select>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, fontSize: '15px', border: 'none', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Registering…' : 'Register interest →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Already a candidate? <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      )}
    </div>
  )
}
