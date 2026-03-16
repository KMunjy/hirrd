'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import HirrdLogo from '@/components/HirrdLogo'

// Hybrid pricing model (Decision 2: A/B/C approved)
// Per-listing: R400 (SMMEs) + Pro R1,800/mo + Enterprise R6,500/mo

const INDUSTRIES = [
  'Financial Services','Technology','Healthcare','Retail','Mining',
  'Construction','Education','Government & Public Sector','Telecoms',
  'Agriculture','Logistics','Hospitality','Manufacturing','Other',
]
const SIZES = ['1–10','11–50','51–200','201–500','500+']
const RISK_DOMAINS = ['gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com','aol.com']

function computeRiskFlags(email: string, cipc: string, website: string, industry: string): string[] {
  const flags: string[] = []
  const domain = email.split('@')[1]?.toLowerCase() || ''
  if (RISK_DOMAINS.includes(domain)) flags.push('free_email')
  if (!cipc) flags.push('no_cipc')
  if (!website) flags.push('no_website')
  return flags
}

type View = 'pricing' | 'register'

export default function EmployersPage() {
  const [view, setView] = useState<View>('pricing')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [tos, setTos] = useState(false)
  const [marketing, setMarketing] = useState(false)

  const [form, setForm] = useState({
    company_name: '', work_email: '', contact_name: '', contact_title: '',
    phone: '', company_size: '', industry: '', cipc_number: '', website: '',
    selected_plan: 'per_listing',
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tos) { setError('Please accept the Terms of Service.'); return }
    setLoading(true)
    setError('')
    try {
      const risk_flags = computeRiskFlags(form.work_email, form.cipc_number, form.website, form.industry)
      const res = await fetch('/api/employer-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, risk_flags, marketing_consent: marketing }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Submission failed') }
      setContactEmail(form.work_email)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid rgba(124,88,232,0.2)', background: '#FAFAF8',
    color: '#1a1240', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    fontSize: '11px', fontWeight: 600, color: '#6B7280',
    display: 'block', marginBottom: '6px', letterSpacing: '0.06em',
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '48px', maxWidth: '480px', textAlign: 'center', border: '1px solid rgba(124,88,232,0.12)' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1a1240', marginBottom: '8px' }}>Application received</h1>
        <p style={{ color: '#4a4270', lineHeight: 1.6, marginBottom: '8px' }}>
          Our team will review <strong>{form.company_name}</strong> and reach out to{' '}
          <strong>{contactEmail}</strong> within 1–2 business days.
        </p>
        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '28px', lineHeight: 1.5 }}>
          Once verified, you can post your first opportunity and get matched to SA candidates immediately.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/employer/dashboard" style={{ padding: '12px 24px', borderRadius: '10px', background: 'linear-gradient(135deg,#7C58E8,#38C6D4)', color: 'white', fontWeight: 600, textDecoration: 'none' }}>
            View application status →
          </Link>
          <Link href="/" style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid rgba(124,88,232,0.3)', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to Hirrd
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F6F3ED' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(124,88,232,0.1)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <HirrdLogo size="sm" />
        <Link href="/" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', fontWeight: 600 }}>← Back to Hirrd</Link>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '64px 24px 48px', background: 'linear-gradient(145deg,#0A0A0F,#1A0E3D)', color: 'white' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#00D9A6', letterSpacing: '0.15em', marginBottom: '16px' }}>
          FOR SOUTH AFRICAN EMPLOYERS
        </div>
        <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>
          Hire SA talent.<br />No per-CV fees. No lock-in.
        </h1>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto 36px', lineHeight: 1.5 }}>
          AI-matched candidates. WhatsApp notifications. POPIA-compliant. SETA learnership tools.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setView('register')} style={{ padding: '14px 32px', borderRadius: '12px', background: 'linear-gradient(135deg,#7C58E8,#38C6D4)', color: 'white', border: 'none', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>
            Get started free →
          </button>
          <button onClick={() => setView('pricing')} style={{ padding: '14px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
            View pricing
          </button>
        </div>
      </div>

      {/* PRICING SECTION */}
      {view === 'pricing' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#1a1240', marginBottom: '8px' }}>Simple, SA-market pricing</h2>
            <p style={{ color: '#6B7280', fontSize: '16px' }}>No hidden fees. Cancel any time. First 3 listings always free.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '48px' }}>
            {/* Per-listing tier */}
            <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', border: '1px solid rgba(124,88,232,0.15)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.12em', marginBottom: '12px' }}>PER LISTING · SMME</div>
              <div style={{ fontSize: '40px', fontWeight: 800, color: '#1a1240', marginBottom: '4px' }}>
                R400<span style={{ fontSize: '14px', fontWeight: 400, color: '#6B7280' }}>/listing</span>
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px' }}>30-day active period. Pay only when you post.</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px' }}>
                {['AI-matched candidate recommendations','WhatsApp + email candidate alerts','CV access for applicants','POPIA-compliant data handling','No subscription required'].map(f => (
                  <li key={f} style={{ fontSize: '13px', color: '#4a4270', padding: '6px 0', borderBottom: '1px solid rgba(124,88,232,0.06)', display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => setView('register')} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(124,88,232,0.08)', color: 'var(--primary)', border: '1px solid rgba(124,88,232,0.2)', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                Start posting →
              </button>
            </div>

            {/* Pro tier */}
            <div style={{ background: 'linear-gradient(135deg,#1A0E3D,#2D1B69)', borderRadius: '20px', padding: '32px', border: '1px solid rgba(124,88,232,0.3)', position: 'relative', color: 'white' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#00D9A6', color: '#0A0A0F', fontSize: '10px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>MOST POPULAR</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', marginBottom: '12px' }}>PRO · MID-MARKET</div>
              <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '4px' }}>
                R1,800<span style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>/month</span>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '24px' }}>10 active listings. Ideal for ongoing hiring programmes.</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px' }}>
                {['Everything in per-listing, plus:','10 simultaneous active listings','Bulk WhatsApp to shortlisted candidates','Candidate POPIA consent dashboard','Priority Hirrd verification badge','Monthly hiring analytics report'].map(f => (
                  <li key={f} style={{ fontSize: '13px', color: f.includes(':') ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '8px' }}>
                    {!f.includes(':') && <span style={{ color: '#00D9A6', flexShrink: 0 }}>✓</span>}{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => { setForm(f => ({ ...f, selected_plan: 'pro' })); setView('register') }}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg,#7C58E8,#38C6D4)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                Get Pro →
              </button>
            </div>

            {/* Enterprise tier */}
            <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', border: '1px solid rgba(124,88,232,0.15)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.12em', marginBottom: '12px' }}>ENTERPRISE · CORPORATES + SETA</div>
              <div style={{ fontSize: '40px', fontWeight: 800, color: '#1a1240', marginBottom: '4px' }}>
                R6,500<span style={{ fontSize: '14px', fontWeight: 400, color: '#6B7280' }}>/month</span>
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px' }}>Unlimited listings. Built for SETA learnership programmes.</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px' }}>
                {['Everything in Pro, plus:','Unlimited active listings','SETA reporting CSV export','Candidate readiness scores','Attendance tracking module','Dedicated account manager','ATS integration (on request)'].map(f => (
                  <li key={f} style={{ fontSize: '13px', color: f.includes(':') ? '#9CA3AF' : '#4a4270', padding: '6px 0', borderBottom: '1px solid rgba(124,88,232,0.06)', display: 'flex', gap: '8px' }}>
                    {!f.includes(':') && <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span>}{f}
                  </li>
                ))}
              </ul>
              <Link href="mailto:employers@hirrd.com?subject=Enterprise enquiry"
                style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(124,88,232,0.08)', color: 'var(--primary)', border: '1px solid rgba(124,88,232,0.2)', fontWeight: 600, cursor: 'pointer', fontSize: '14px', textDecoration: 'none', textAlign: 'center' }}>
                Contact us →
              </Link>
            </div>
          </div>

          {/* Trust signals */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '40px' }}>
            {[
              { icon: '🛡️', label: 'POPIA compliant', sub: 'Full POPIA compliance built in' },
              { icon: '✓', label: 'SA employer verified', sub: 'CIPC verification on all accounts' },
              { icon: '📱', label: 'WhatsApp first', sub: 'SA GenZ prefers WhatsApp alerts' },
              { icon: '🎓', label: 'SETA tools', sub: 'Learnership tracking and reporting' },
            ].map(t => (
              <div key={t.label} style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid rgba(124,88,232,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{t.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1a1240', marginBottom: '2px' }}>{t.label}</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>{t.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => setView('register')} style={{ padding: '14px 40px', borderRadius: '12px', background: 'linear-gradient(135deg,#7C58E8,#38C6D4)', color: 'white', border: 'none', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>
              Register your company — it's free →
            </button>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '12px' }}>No credit card required. First 3 listings free forever.</p>
          </div>
        </div>
      )}

      {/* REGISTRATION FORM */}
      {view === 'register' && (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 24px' }}>
          <button onClick={() => setView('pricing')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginBottom: '24px' }}>
            ← Back to pricing
          </button>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '40px', border: '1px solid rgba(124,88,232,0.12)', boxShadow: '0 8px 40px rgba(124,88,232,0.08)' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1a1240', marginBottom: '6px' }}>Register your company</h1>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px', lineHeight: 1.5 }}>
              Our team verifies all SA employers before listing. Usually 1–2 business days.
            </p>
            <form onSubmit={handleSubmit}>
              {[
                { label: 'COMPANY NAME *', id: 'company_name', type: 'text', ph: 'Acme (Pty) Ltd', ac: 'organization' },
                { label: 'WORK EMAIL *', id: 'work_email', type: 'email', ph: 'you@yourcompany.co.za', ac: 'email' },
                { label: 'CONTACT FULL NAME *', id: 'contact_name', type: 'text', ph: 'Thabo Mokoena', ac: 'name' },
                { label: 'TITLE / ROLE *', id: 'contact_title', type: 'text', ph: 'HR Manager', ac: 'off' },
                { label: 'SA PHONE *', id: 'phone', type: 'tel', ph: '+27 82 123 4567', ac: 'tel' },
                { label: 'CIPC REGISTRATION NUMBER', id: 'cipc_number', type: 'text', ph: '2019/445321/07', ac: 'off' },
                { label: 'COMPANY WEBSITE', id: 'website', type: 'url', ph: 'https://yourcompany.co.za', ac: 'url' },
              ].map(({ label, id, type, ph, ac }) => (
                <div key={id} style={{ marginBottom: '14px' }}>
                  <label htmlFor={id} style={lbl}>{label}</label>
                  <input id={id} name={id} type={type} autoComplete={ac}
                    value={(form as any)[id]} onChange={set(id)}
                    placeholder={ph} required={label.includes('*')} style={inp} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={lbl}>INDUSTRY *</label>
                  <select required value={form.industry} onChange={set('industry')} style={inp}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>COMPANY SIZE *</label>
                  <select required value={form.company_size} onChange={set('company_size')} style={inp}>
                    <option value="">Select size</option>
                    {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </div>
              </div>

              {/* Plan selection */}
              <div style={{ marginBottom: '16px' }}>
                <label style={lbl}>PREFERRED PLAN</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                  {[
                    { val: 'per_listing', label: 'Per-listing R400', sub: 'SMME / test' },
                    { val: 'pro', label: 'Pro R1,800/mo', sub: 'Mid-market' },
                    { val: 'enterprise', label: 'Enterprise R6,500/mo', sub: 'Corporates' },
                  ].map(p => (
                    <button key={p.val} type="button" onClick={() => setForm(f => ({ ...f, selected_plan: p.val }))} style={{
                      padding: '10px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      border: form.selected_plan === p.val ? '2px solid #7C58E8' : '1px solid rgba(124,88,232,0.2)',
                      background: form.selected_plan === p.val ? 'rgba(124,88,232,0.08)' : '#FAFAF8',
                      color: form.selected_plan === p.val ? 'var(--primary)' : '#6B7280',
                    }}>
                      <div>{p.label}</div>
                      <div style={{ fontWeight: 400, fontSize: '10px', marginTop: '2px', opacity: 0.7 }}>{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* POPIA notice */}
              <div style={{ background: 'rgba(124,88,232,0.04)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '12px', color: '#6B7280', lineHeight: 1.5 }}>
                🔒 Your data is protected under POPIA (Act 4 of 2013). We use it only to verify your company.{' '}
                <Link href="/privacy" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>
              </div>

              {/* Anti-scam notice */}
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '12px', color: '#EF4444', lineHeight: 1.5 }}>
                ⚠️ Hirrd strictly prohibits charging candidates any fees. Listings that request candidate fees will be immediately removed and reported to the CCMA and DHET.
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <input id="emp-tos" type="checkbox" required checked={tos} onChange={e => setTos(e.target.checked)} style={{ marginTop: '3px', accentColor: 'var(--primary)', flexShrink: 0 }} />
                <label htmlFor="emp-tos" style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.5 }}>
                  I confirm this company is legitimately registered in South Africa and I agree to Hirrd's{' '}
                  <Link href="/terms" style={{ color: 'var(--primary)' }}>Terms of Service</Link>. <span style={{ color: '#EF4444' }}>*</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <input id="emp-marketing" type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} style={{ marginTop: '3px', accentColor: 'var(--primary)', flexShrink: 0 }} />
                <label htmlFor="emp-marketing" style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.5 }}>
                  I'd like to receive SA hiring insights and product updates. (Optional)
                </label>
              </div>

              {error && (
                <div role="alert" style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(192,80,74,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#C0504A' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !tos} style={{
                width: '100%', padding: '14px', borderRadius: '10px',
                background: 'linear-gradient(135deg,#7C58E8,#38C6D4)', color: 'white', border: 'none',
                fontWeight: 700, fontSize: '15px', cursor: loading || !tos ? 'default' : 'pointer',
                opacity: loading || !tos ? 0.65 : 1,
              }}>
                {loading ? 'Registering…' : 'Register company →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
