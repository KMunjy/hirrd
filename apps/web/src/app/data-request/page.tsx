'use client'
import { useState } from 'react'
import HirrdNav from '@/components/HirrdNav'
import Link from 'next/link'

const REQUEST_TYPES = [
  { value: 'access',     label: 'Access my data',          desc: 'Receive a copy of all personal information we hold about you.' },
  { value: 'correction', label: 'Correct my data',         desc: 'Request correction of inaccurate or incomplete information.' },
  { value: 'deletion',   label: 'Delete my data',          desc: 'Request deletion of your personal information (Right to be Forgotten).' },
  { value: 'portability',label: 'Export my data',          desc: 'Receive your data in a portable, machine-readable format.' },
  { value: 'objection',  label: 'Object to processing',    desc: 'Object to how we process your personal information.' },
]

export default function DataRequestPage() {
  const [type, setType]     = useState('')
  const [desc, setDesc]     = useState('')
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)
  const [err, setErr]       = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!type) { setErr('Please select a request type.'); return }
    setLoading(true); setErr('')
    const res = await fetch('/api/data-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_type: type, description: desc, email_provided: email }),
    })
    setLoading(false)
    if (res.ok) { setDone(true) } else { setErr('Failed to submit. Please try again.') }
  }

  return (
    <>
      <HirrdNav />
      <div style={{ minHeight:'100vh', background:'var(--void)', padding:'80px 24px 60px' }}>
        <div style={{ maxWidth:'600px', margin:'0 auto' }}>
          <div style={{ marginBottom:'32px' }}>
            <div className="badge badge-primary" style={{ marginBottom:'12px' }}>POPIA — Data Subject Rights</div>
            <h1 style={{ fontSize:'28px', fontWeight:800, color:'var(--text-primary)', marginBottom:'10px' }}>
              Your Data Rights
            </h1>
            <p style={{ fontSize:'14px', color:'var(--text-muted)', lineHeight:1.7 }}>
              Under the Protection of Personal Information Act (POPIA), you have the right to access, correct, delete, or object to the processing of your personal information. We will respond within 30 days.
            </p>
          </div>

          {done ? (
            <div className="card" style={{ textAlign:'center', padding:'40px' }}>
              <div style={{ fontSize:'40px', marginBottom:'16px' }}>✅</div>
              <h2 style={{ fontSize:'20px', fontWeight:700, color:'var(--text-primary)', marginBottom:'8px' }}>Request Received</h2>
              <p style={{ fontSize:'14px', color:'var(--text-muted)' }}>We will respond within 30 days as required by POPIA. You will receive confirmation by email.</p>
              <Link href="/" className="btn btn-ghost" style={{ marginTop:'20px', display:'inline-block', textDecoration:'none' }}>Back to home</Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="card" style={{ marginBottom:'16px' }}>
                <div className="section-label">Request Type</div>
                {REQUEST_TYPES.map(rt => (
                  <label key={rt.value} style={{ display:'flex', gap:'12px', padding:'14px', borderRadius:'10px', background: type===rt.value ? 'rgba(123,92,240,0.1)' : 'transparent', border: type===rt.value ? '1px solid rgba(123,92,240,0.3)' : '1px solid transparent', cursor:'pointer', marginBottom:'8px' }}>
                    <input type="radio" name="type" value={rt.value} checked={type===rt.value} onChange={e=>setType(e.target.value)} style={{ marginTop:'3px', accentColor:'var(--violet)', flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:'14px', fontWeight:700, color:'var(--text-primary)', marginBottom:'3px' }}>{rt.label}</div>
                      <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>{rt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="card" style={{ marginBottom:'16px' }}>
                <div className="section-label" style={{ marginBottom:'10px' }}>Additional Details (optional)</div>
                <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe your request in more detail..." rows={4} style={{ width:'100%', resize:'vertical' }} />
              </div>

              <div className="card" style={{ marginBottom:'24px' }}>
                <div className="section-label" style={{ marginBottom:'10px' }}>Contact Email</div>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com (required if not logged in)" />
              </div>

              {err && <div style={{ background:'var(--error-light)', border:'1px solid rgba(244,63,94,0.2)', borderRadius:'10px', padding:'12px', color:'var(--error)', fontSize:'13px', marginBottom:'16px' }}>{err}</div>}

              <button type="submit" className="btn btn-primary" style={{ width:'100%', fontSize:'15px', padding:'14px' }} disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Data Request →'}
              </button>

              <p style={{ fontSize:'11px', color:'var(--text-subtle)', textAlign:'center', marginTop:'12px', lineHeight:1.6 }}>
                Hirrd is compliant with POPIA (Protection of Personal Information Act). 
                For queries, contact <a href="mailto:privacy@hirrd.co.za" style={{ color:'var(--violet)' }}>privacy@hirrd.co.za</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
