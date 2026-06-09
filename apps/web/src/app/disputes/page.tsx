'use client'
import { useState } from 'react'
import HirrdNav from '@/components/HirrdNav'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'FRAUDULENT_LISTING',  label: 'Fraudulent Job Listing',    icon: '🚨' },
  { value: 'UNFAIR_REJECTION',    label: 'Unfair Application Rejection', icon: '⚠️' },
  { value: 'NON_PAYMENT',         label: 'Non-Payment / Stipend Issue',  icon: '💰' },
  { value: 'DATA_BREACH',         label: 'Suspected Data Breach',        icon: '🔐' },
  { value: 'OTHER',               label: 'Other Complaint',              icon: '📝' },
]

export default function DisputesPage() {
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<{id:string}|null>(null)
  const [err, setErr] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!category) { setErr('Please select a category.'); return }
    if (description.length < 30) { setErr('Please provide more detail (minimum 30 characters).'); return }
    setLoading(true); setErr('')
    const res = await fetch('/api/disputes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, description }),
    })
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      setDone(data.dispute)
    } else {
      const data = await res.json().catch(() => ({}))
      setErr(data.error || 'Failed to submit. Please try again.')
    }
  }

  return (
    <>
      <HirrdNav />
      <div style={{ minHeight:'100vh', background:'var(--void)', padding:'80px 24px 60px' }}>
        <div style={{ maxWidth:'620px', margin:'0 auto' }}>
          <div style={{ marginBottom:'32px' }}>
            <div className="badge badge-bursary" style={{ marginBottom:'12px' }}>Dispute Resolution</div>
            <h1 style={{ fontSize:'28px', fontWeight:800, color:'var(--text-primary)', marginBottom:'10px' }}>Raise a Dispute</h1>
            <p style={{ fontSize:'14px', color:'var(--text-muted)', lineHeight:1.7 }}>
              We take all disputes seriously. Our team will review your case within 5 business days as required by our SLA. For urgent safety concerns, contact us directly at <a href="mailto:safety@hirrd.co.za" style={{ color:'var(--violet)' }}>safety@hirrd.co.za</a>
            </p>
          </div>

          {done ? (
            <div className="card" style={{ textAlign:'center', padding:'40px' }}>
              <div style={{ fontSize:'40px', marginBottom:'16px' }}>📋</div>
              <h2 style={{ fontSize:'20px', fontWeight:700, color:'var(--text-primary)', marginBottom:'8px' }}>Dispute Submitted</h2>
              <p style={{ fontSize:'14px', color:'var(--text-muted)', marginBottom:'8px' }}>Reference: <code style={{ background:'var(--glass-2)', padding:'2px 8px', borderRadius:'6px', fontSize:'12px' }}>{done.id.slice(0,8).toUpperCase()}</code></p>
              <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>We will respond within 5 business days. You can track this dispute in your profile settings.</p>
              <Link href="/" className="btn btn-ghost" style={{ marginTop:'20px', display:'inline-block', textDecoration:'none' }}>Back to home</Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="card" style={{ marginBottom:'16px' }}>
                <div className="section-label">What is your dispute about?</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'12px' }}>
                  {CATEGORIES.map(c => (
                    <button key={c.value} type="button" onClick={() => setCategory(c.value)} style={{
                      padding:'14px 12px', borderRadius:'12px', border: category===c.value ? '1px solid rgba(123,92,240,0.5)' : '1px solid var(--glass-border)',
                      background: category===c.value ? 'rgba(123,92,240,0.12)' : 'var(--glass-1)',
                      cursor:'pointer', textAlign:'left', transition:'all 0.2s',
                    }}>
                      <div style={{ fontSize:'20px', marginBottom:'6px' }}>{c.icon}</div>
                      <div style={{ fontSize:'12px', fontWeight:700, color:'var(--text-primary)', lineHeight:1.4 }}>{c.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card" style={{ marginBottom:'24px' }}>
                <div className="section-label" style={{ marginBottom:'10px' }}>Describe the issue</div>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Please describe what happened, including relevant dates, names, and any evidence you have..."
                  rows={6} style={{ width:'100%', resize:'vertical' }}
                  required minLength={30} maxLength={2000}
                />
                <div style={{ fontSize:'11px', color:'var(--text-subtle)', marginTop:'6px' }}>{description.length}/2000 characters</div>
              </div>

              {err && <div style={{ background:'var(--error-light)', border:'1px solid rgba(244,63,94,0.2)', borderRadius:'10px', padding:'12px', color:'var(--error)', fontSize:'13px', marginBottom:'16px' }}>{err}</div>}

              <button type="submit" className="btn btn-primary" style={{ width:'100%', fontSize:'15px', padding:'14px' }} disabled={loading || !category}>
                {loading ? 'Submitting…' : 'Submit Dispute →'}
              </button>

              <p style={{ fontSize:'11px', color:'var(--text-subtle)', textAlign:'center', marginTop:'12px' }}>
                For urgent issues contact <a href="mailto:safety@hirrd.co.za" style={{ color:'var(--violet)' }}>safety@hirrd.co.za</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
