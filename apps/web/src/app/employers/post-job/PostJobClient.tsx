'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  lead: any
  userId: string
  userEmail: string
  activeListings: number
  freeTierLimit: number
}

const SECTORS = ['Financial Services','Technology','Healthcare','Retail','Mining',
  'Construction','Education','Government','Telecoms','Agriculture','Hospitality','Manufacturing']

const OPP_TYPES = [
  { val: 'job', label: 'Full-time job' },
  { val: 'learnership', label: 'Learnership (SETA)' },
  { val: 'internship', label: 'Internship' },
  { val: 'bursary', label: 'Bursary / Scholarship' },
]

const EXPERIENCE_LEVELS = [
  { val: 'entry', label: 'Entry-level / School leavers' },
  { val: 'junior', label: 'Junior (0–2 years)' },
  { val: 'mid', label: 'Mid-level (2–5 years)' },
  { val: 'senior', label: 'Senior (5+ years)' },
]

const SKILLS_POOL = ['SQL','Python','Excel','Communication','Data Analysis','Customer Service',
  'Java','JavaScript','Project Management','Accounting','Sales','Marketing',
  'Teamwork','Microsoft Office','Leadership','Research','Tableau','AutoCAD']

const PROVINCES = ['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape',
  'Limpopo','Mpumalanga','North West','Free State','Northern Cape']

export default function PostJobClient({ lead, userId, userEmail, activeListings, freeTierLimit }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    type: 'job', title: '', description: '', requirements: '',
    sector: '', experience_level: 'junior', employment_type: 'full_time',
    salary_min: '', salary_max: '', province: '', city: '',
    seta_name: '', seta_accr: '', intake_date: '',
  })
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [customSkill, setCustomSkill] = useState('')

  const isVerified = !!lead
  const atFreeLimit = activeListings >= freeTierLimit && !lead?.plan_tier?.includes('pro')
  const isLearnership = form.type === 'learnership' || form.type === 'bursary'

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function toggleSkill(s: string) {
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.description || !form.sector) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/opportunities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          salary_min: form.salary_min ? Number(form.salary_min) : null,
          salary_max: form.salary_max ? Number(form.salary_max) : null,
          skills_required: selectedSkills,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid rgba(124,88,232,0.2)', background: 'var(--glass-1)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  }
  const lbl: React.CSSProperties = {
    fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
    display: 'block', marginBottom: '6px', letterSpacing: '0.07em',
  }
  const card: React.CSSProperties = {
    background: 'var(--glass-2)', border: '1px solid var(--border)',
    borderRadius: '14px', padding: '24px', marginBottom: '20px',
  }

  // Gate: must be verified employer
  if (!isVerified) return (
    <main id="main-content" style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Verification required
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.6 }}>
        Only verified employers can post opportunities. Register your company first — our team reviews applications within 2 business days.
      </p>
      <Link href="/employers" style={{ padding: '13px 28px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, textDecoration: 'none' }}>
        Register as employer →
      </Link>
    </main>
  )

  // Gate: free tier limit
  if (atFreeLimit) return (
    <main id="main-content" style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Free tier limit reached
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.6 }}>
        You have {activeListings} active listings. The free tier includes {freeTierLimit} active listings.
      </p>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.6 }}>
        Upgrade to <strong>Pro (R1,800/month)</strong> for unlimited listings, WhatsApp candidate alerts, and POPIA dashboard.
      </p>
      <Link href="mailto:employers@hirrd.com?subject=Hirrd Pro upgrade" style={{ padding: '13px 28px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, textDecoration: 'none' }}>
        Contact us to upgrade →
      </Link>
    </main>
  )

  if (submitted) return (
    <main id="main-content" style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Opportunity posted!</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px' }}>
        Your listing is live. Hirrd will match it to qualified SA candidates immediately.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/employer/dashboard" style={{ padding: '12px 24px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, textDecoration: 'none' }}>
          View dashboard →
        </Link>
        <button onClick={() => { setSubmitted(false); setForm(f => ({ ...f, title: '', description: '', requirements: '' })) }}
          style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--glass-2)', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>
          Post another →
        </button>
      </div>
    </main>
  )

  return (
    <main id="main-content" style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 20px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Post an opportunity
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {lead.company_name} · {activeListings}/{freeTierLimit} free listings used
          </p>
        </div>
        <Link href="/employer/dashboard" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
          ← Dashboard
        </Link>
      </div>

      {/* Free tier notice */}
      <div style={{ background: 'rgba(124,88,232,0.06)', border: '1px solid rgba(124,88,232,0.15)', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <strong>Free tier:</strong> {freeTierLimit} active listings included. Each listing runs for 30 days.
        Need more? <Link href="mailto:employers@hirrd.com?subject=Hirrd Pro" style={{ color: 'var(--primary)', fontWeight: 600 }}>Upgrade to Pro (R1,800/month) →</Link>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Opportunity type */}
        <div style={card}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '14px' }}>
            OPPORTUNITY TYPE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {OPP_TYPES.map(t => (
              <button key={t.val} type="button"
                onClick={() => setForm(f => ({ ...f, type: t.val }))}
                style={{
                  padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                  border: form.type === t.val ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
                  background: form.type === t.val ? 'rgba(124,88,232,0.08)' : 'var(--bg-base)',
                  color: form.type === t.val ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer', textAlign: 'left' as const,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Core details */}
        <div style={card}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '14px' }}>
            DETAILS
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>JOB TITLE *</label>
            <input required type="text" value={form.title} onChange={set('title')} placeholder="e.g. Junior Data Analyst" style={inp} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={lbl}>SECTOR *</label>
              <select required value={form.sector} onChange={set('sector')} style={inp}>
                <option value="">Select sector</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>EXPERIENCE LEVEL</label>
              <select value={form.experience_level} onChange={set('experience_level')} style={inp}>
                {EXPERIENCE_LEVELS.map(e => <option key={e.val} value={e.val}>{e.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>DESCRIPTION * <span style={{ fontWeight: 400 }}>— what candidates will do</span></label>
            <textarea required rows={4} value={form.description} onChange={set('description')}
              placeholder="Describe the role, responsibilities, and what makes it a great opportunity..."
              style={{ ...inp, resize: 'vertical' }} />
          </div>
          <div>
            <label style={lbl}>REQUIREMENTS <span style={{ fontWeight: 400 }}>— qualifications, years of experience</span></label>
            <textarea rows={3} value={form.requirements} onChange={set('requirements')}
              placeholder="e.g. Grade 12 pass. SA citizen. No prior experience needed — we train."
              style={{ ...inp, resize: 'vertical' }} />
          </div>
        </div>

        {/* SETA details — learnership/bursary only */}
        {isLearnership && (
          <div style={{ ...card, borderLeft: '3px solid var(--success)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--success)', letterSpacing: '0.1em', marginBottom: '14px' }}>
              SETA ACCREDITATION <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— improves trust signals and candidate apply rate</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={lbl}>SETA NAME</label>
                <input type="text" value={form.seta_name} onChange={set('seta_name')} placeholder="e.g. MERSETA, BANKSETA" style={inp} />
              </div>
              <div>
                <label style={lbl}>ACCREDITATION NUMBER</label>
                <input type="text" value={form.seta_accr} onChange={set('seta_accr')} placeholder="e.g. SD12345" style={inp} />
              </div>
              <div>
                <label style={lbl}>INTAKE DATE</label>
                <input type="date" value={form.intake_date} onChange={set('intake_date')} style={inp} />
              </div>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              ✓ Verified SETA badge increases candidate apply rate by up to 79% on Hirrd. We validate accreditation numbers independently.
            </p>
          </div>
        )}

        {/* Skills */}
        <div style={card}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '14px' }}>
            SKILLS REQUIRED <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>— used for AI matching</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            {SKILLS_POOL.map(s => (
              <button key={s} type="button" onClick={() => toggleSkill(s)} style={{
                padding: '6px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600,
                border: selectedSkills.includes(s) ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
                background: selectedSkills.includes(s) ? 'rgba(124,88,232,0.1)' : 'var(--bg-base)',
                color: selectedSkills.includes(s) ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}>
                {selectedSkills.includes(s) ? '✓ ' : ''}{s}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" value={customSkill} onChange={e => setCustomSkill(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (customSkill.trim()) { toggleSkill(customSkill.trim()); setCustomSkill('') } } }}
              placeholder="Add custom skill (press Enter)" style={{ ...inp, flex: 1 }} />
            <button type="button" onClick={() => { if (customSkill.trim()) { toggleSkill(customSkill.trim()); setCustomSkill('') } }}
              style={{ padding: '10px 18px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
              Add
            </button>
          </div>
        </div>

        {/* Location + salary */}
        <div style={card}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '14px' }}>
            LOCATION & COMPENSATION
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={lbl}>PROVINCE *</label>
              <select required value={form.province} onChange={set('province')} style={inp}>
                <option value="">Select province</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>CITY / TOWN</label>
              <input type="text" value={form.city} onChange={set('city')} placeholder="e.g. Johannesburg" style={inp} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={lbl}>MONTHLY STIPEND / SALARY MIN (R)</label>
              <input type="number" value={form.salary_min} onChange={set('salary_min')} placeholder="e.g. 8000" min="0" style={inp} />
            </div>
            <div>
              <label style={lbl}>SALARY MAX (R) <span style={{ fontWeight: 400 }}>— optional</span></label>
              <input type="number" value={form.salary_max} onChange={set('salary_max')} placeholder="e.g. 15000" min="0" style={inp} />
            </div>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
            ⚠️ POPIA notice: Do not request any fees from candidates. Fee-charging is illegal under SA labour law and will result in immediate removal and reporting.
          </p>
        </div>

        {error && (
          <div role="alert" style={{ background: 'var(--error-light)', border: '1px solid rgba(192,80,74,0.2)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: 'var(--error)' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} style={{
          width: '100%', padding: '14px', borderRadius: '10px',
          background: 'var(--gradient-primary)', color: 'white', border: 'none',
          fontWeight: 600, fontSize: '15px', cursor: submitting ? 'default' : 'pointer',
          opacity: submitting ? 0.7 : 1,
        }}>
          {submitting ? 'Posting…' : 'Post opportunity →'}
        </button>
      </form>
    </main>
  )
}
