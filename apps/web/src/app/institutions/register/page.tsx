'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import HirrdLogo from '@/components/HirrdLogo'

const INSTITUTION_TYPES = [
  { value: 'public_university', label: 'Public University' },
  { value: 'tvet', label: 'TVET College' },
  { value: 'private_college', label: 'Private College' },
  { value: 'training_provider', label: 'Skills Training Provider' },
  { value: 'placement_agency', label: 'Placement Agency' },
  { value: 'other', label: 'Other' },
]

export default function InstitutionRegisterPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tos, setTos] = useState(false)
  const [form, setForm] = useState({
    legal_name: '', trading_name: '', institution_type: '',
    dhet_reg_number: '', seta_name: '', saqa_id: '',
    website: '', physical_address: '',
    contact_name: '', contact_title: '', contact_email: '', contact_phone: '',
    programmes_summary: '',
  })
  const [contactEmail, setContactEmail] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tos) { setError('Please accept the Terms of Service.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/institution-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tos_accepted_at: new Date().toISOString() }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Submission failed') }
      setContactEmail(form.contact_email)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid rgba(124,88,232,0.2)', background: 'var(--glass-1)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)',
    display: 'block', marginBottom: '6px', letterSpacing: '0.07em',
  }
  const fieldWrap: React.CSSProperties = { marginBottom: '16px' }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ maxWidth: '420px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎓</div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Application received</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
          We&apos;ll review your institution and reach out to <strong>{contactEmail}</strong> within 2 business days.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          Verified institutions can list programmes, learnerships, and courses for SA candidates.
        </p>
        <Link href="/" style={{ padding: '12px 28px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, textDecoration: 'none' }}>
          ← Back to Hirrd
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', padding: '40px 24px' }}>
      <div style={{ maxWidth: '580px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <HirrdLogo size="md" />
        </div>
        <div style={{ background: 'var(--glass-2)', borderRadius: '20px', padding: '40px', border: '1px solid var(--border)', boxShadow: '0 8px 40px rgba(124,88,232,0.08)' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Register your institution
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.5 }}>
            List your courses, learnerships, and programmes for South African candidates. We verify all institutions before listing.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Institution details */}
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '16px' }}>
              INSTITUTION DETAILS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>LEGAL NAME *</label>
                <input type="text" required value={form.legal_name} onChange={set('legal_name')} placeholder="University of Cape Town" style={inputStyle} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>TRADING NAME</label>
                <input type="text" value={form.trading_name} onChange={set('trading_name')} placeholder="If different" style={inputStyle} />
              </div>
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>INSTITUTION TYPE *</label>
              <select required value={form.institution_type} onChange={set('institution_type')} style={inputStyle}>
                <option value="">Select type</option>
                {INSTITUTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>DHET REG NUMBER</label>
                <input type="text" value={form.dhet_reg_number} onChange={set('dhet_reg_number')} placeholder="DHET/REG/..." style={inputStyle} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>SETA NAME</label>
                <input type="text" value={form.seta_name} onChange={set('seta_name')} placeholder="e.g. MERSETA" style={inputStyle} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>SAQA ID</label>
                <input type="text" value={form.saqa_id} onChange={set('saqa_id')} placeholder="SAQA provider ID" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>WEBSITE</label>
                <input type="url" value={form.website} onChange={set('website')} placeholder="https://yoursite.ac.za" style={inputStyle} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>SA PHYSICAL ADDRESS *</label>
                <input type="text" required value={form.physical_address} onChange={set('physical_address')} placeholder="123 Main St, Johannesburg" style={inputStyle} />
              </div>
            </div>

            {/* Contact person */}
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '16px', marginTop: '8px' }}>
              CONTACT PERSON
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>FULL NAME *</label>
                <input type="text" required value={form.contact_name} onChange={set('contact_name')} placeholder="Dr Nomsa Dlamini" style={inputStyle} autoComplete="name" />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>TITLE / ROLE *</label>
                <input type="text" required value={form.contact_title} onChange={set('contact_title')} placeholder="Principal / Registrar" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>EMAIL *</label>
                <input type="email" required value={form.contact_email} onChange={set('contact_email')} placeholder="you@institution.ac.za" style={inputStyle} autoComplete="email" />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>SA PHONE *</label>
                <input type="tel" required value={form.contact_phone} onChange={set('contact_phone')} placeholder="+27 82 000 0000" style={inputStyle} autoComplete="tel" />
              </div>
            </div>

            {/* Programmes summary */}
            <div style={fieldWrap}>
              <label style={labelStyle}>PROGRAMMES SUMMARY</label>
              <textarea
                value={form.programmes_summary}
                onChange={set('programmes_summary')}
                rows={3}
                placeholder="Brief description of your programmes, courses, or learnerships"
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            {/* POPIA + consent */}
            <div style={{ background: 'rgba(124,88,232,0.04)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              🔒 Your data is protected under POPIA (Act 4 of 2013). We use it only to verify your institution. <Link href="/privacy" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', alignItems: 'flex-start' }}>
              <input id="inst-tos" type="checkbox" required checked={tos} onChange={e => setTos(e.target.checked)}
                style={{ marginTop: '3px', accentColor: 'var(--primary)', flexShrink: 0 }} />
              <label htmlFor="inst-tos" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                I confirm this institution is legitimately registered in South Africa and I agree to Hirrd&apos;s{' '}
                <Link href="/terms" style={{ color: 'var(--primary)' }}>Terms of Service</Link>. <span style={{ color: 'var(--error)' }}>*</span>
              </label>
            </div>

            {error && (
              <div role="alert" style={{ background: '#fff5f5', border: '1px solid rgba(192,80,74,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--error)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !tos} style={{
              width: '100%', padding: '13px', borderRadius: '10px',
              background: 'var(--gradient-primary)', color: 'white', border: 'none',
              fontWeight: 600, fontSize: '15px', cursor: loading || !tos ? 'default' : 'pointer',
              opacity: loading || !tos ? 0.65 : 1,
            }}>
              {loading ? 'Submitting…' : 'Register institution →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
