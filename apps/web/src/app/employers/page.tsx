'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import HirrdLogo from '@/components/HirrdLogo'

const HIGH_RISK_INDUSTRIES = ['cryptocurrency', 'forex', 'investment', 'mlm', 'adult', 'gambling']
const FREE_EMAIL_DOMAINS = ['gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com','live.com']

function computeRiskFlags(data: any): string[] {
  const flags: string[] = []
  const emailDomain = data.work_email?.split('@')[1]?.toLowerCase() || ''
  if (FREE_EMAIL_DOMAINS.some(d => emailDomain.endsWith(d))) flags.push('free_email')
  if (!data.website || data.website.trim() === '') flags.push('no_website')
  if (!data.cipc_number || data.cipc_number.trim() === '') flags.push('no_cipc')
  if (HIGH_RISK_INDUSTRIES.some(i => (data.industry || '').toLowerCase().includes(i))) flags.push('high_risk_industry')
  return flags
}

export default function EmployersPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tos, setTos] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [form, setForm] = useState({
    company_name: '', work_email: '', contact_name: '', contact_title: '',
    phone: '', company_size: '', market: 'za', industry: '',
    cipc_number: '', website: '',
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tos) { setError('Please accept the Terms of Service.'); return }
    setLoading(true)
    setError('')
    const risk_flags = computeRiskFlags(form)

    try {
      const res = await fetch('/api/employer-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, risk_flags, marketing_consent: marketing }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Submission failed') }
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid rgba(124,88,232,0.2)', background: 'var(--bg-base)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
  }
  const labelStyle = { fontSize: '11px', fontWeight: 600 as const, color: 'var(--text-muted)', display: 'block' as const, marginBottom: '6px', letterSpacing: '0.07em' }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>You&apos;re on the list</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6, marginBottom: '8px' }}>
        We&apos;ll reach out to <strong>{form.work_email}</strong> within 1–2 business days to complete your verification.
      </p>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        You&apos;ll get early access and free job credits when employer accounts launch.
      </p>
      <Link href="/" style={{ padding: '12px 28px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, textDecoration: 'none' }}>
        ← Back to Hirrd
      </Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ marginBottom: '28px' }}><HirrdLogo size="md" /></div>
      <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '520px', border: '1px solid var(--border)', boxShadow: '0 8px 40px rgba(124,88,232,0.08)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>Post jobs on Hirrd</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
          We verify every employer to protect our candidates. This takes 1–2 business days.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>COMPANY NAME *</label>
              <input type="text" required value={form.company_name} onChange={set('company_name')} placeholder="Acme Corp" style={inputStyle} autoComplete="organization" />
            </div>
            <div>
              <label style={labelStyle}>CIPC REG NUMBER</label>
              <input type="text" value={form.cipc_number} onChange={set('cipc_number')} placeholder="2020/123456/07" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>WORK EMAIL *</label>
            <input type="email" required value={form.work_email} onChange={set('work_email')} placeholder="you@yourcompany.co.za" style={inputStyle} autoComplete="email" />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Company domain preferred — free email may delay verification.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>CONTACT NAME *</label>
              <input type="text" required value={form.contact_name} onChange={set('contact_name')} placeholder="Thabo Mokoena" style={inputStyle} autoComplete="name" />
            </div>
            <div>
              <label style={labelStyle}>JOB TITLE *</label>
              <input type="text" required value={form.contact_title} onChange={set('contact_title')} placeholder="HR Manager" style={inputStyle} autoComplete="organization-title" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>SA PHONE *</label>
              <input type="tel" required value={form.phone} onChange={set('phone')} placeholder="+27 82 000 0000" style={inputStyle} autoComplete="tel" pattern="^(\+27|0)[6-8][0-9]{8}$" title="SA mobile number" />
            </div>
            <div>
              <label style={labelStyle}>WEBSITE</label>
              <input type="url" value={form.website} onChange={set('website')} placeholder="https://yourcompany.co.za" style={inputStyle} autoComplete="url" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>COMPANY SIZE *</label>
              <select required value={form.company_size} onChange={set('company_size')} style={inputStyle}>
                <option value="">Select size</option>
                <option value="1-10">1–10 employees</option>
                <option value="11-50">11–50 employees</option>
                <option value="51-200">51–200 employees</option>
                <option value="201+">201+ employees</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>INDUSTRY *</label>
              <input type="text" required value={form.industry} onChange={set('industry')} placeholder="Financial services" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>PRIMARY MARKET *</label>
            <select required value={form.market} onChange={set('market')} style={inputStyle}>
              <option value="za">South Africa</option>
              <option value="remote">Remote / Global</option>
            </select>
          </div>

          {/* POPIA notice */}
          <div style={{ background: 'rgba(124,88,232,0.04)', borderRadius: '10px', padding: '14px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            🔒 Your information is protected under POPIA (Act 4 of 2013). We use it only to verify your employer account and manage your Hirrd profile. We will never sell your data. <Link href="/privacy" style={{ color: 'var(--primary)' }}>Read our Privacy Policy.</Link>
          </div>

          {/* Consent checkboxes */}
          <div style={{ marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <input id="emp-tos" type="checkbox" required checked={tos} onChange={e => setTos(e.target.checked)} style={{ marginTop: '3px', accentColor: 'var(--primary)', flexShrink: 0 }} />
            <label htmlFor="emp-tos" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              I confirm I am authorised to recruit for this company, I will not charge candidates any fees, and I agree to Hirrd&apos;s <Link href="/terms" style={{ color: 'var(--primary)' }}>Terms of Service</Link>. <span style={{ color: 'var(--error)' }}>*</span>
            </label>
          </div>
          <div style={{ marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <input id="emp-mkt" type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} style={{ marginTop: '3px', accentColor: 'var(--primary)', flexShrink: 0 }} />
            <label htmlFor="emp-mkt" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              I&apos;d like to receive hiring insights and product updates from Hirrd. (Optional)
            </label>
          </div>

          {error && <div role="alert" style={{ background: '#fff5f5', border: '1px solid rgba(192,80,74,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--error)' }}>{error}</div>}

          <button type="submit" disabled={loading || !tos} style={{ width: '100%', padding: '13px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, fontSize: '15px', border: 'none', cursor: loading || !tos ? 'default' : 'pointer', opacity: loading || !tos ? 0.65 : 1 }}>
            {loading ? 'Submitting…' : 'Register interest →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Already a candidate? <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
