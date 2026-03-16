'use client'

import { useState } from 'react'

type FilterType = 'all' | 'job' | 'learnership' | 'internship' | 'bursary' | 'course'

interface Opportunity {
  id: string; type: string; title: string;
  employers?: { company_name: string; company_logo_url?: string }
  location_city?: string; salary_min?: number; salary_max?: number;
  salary_currency?: string; skills_required?: string[]; match_score?: number;
  employment_type?: string; is_verified?: boolean; verification_status?: string; seta_name?: string;
}
interface Props { opportunities?: Opportunity[]; candidate?: any }

// Badge per type
const TYPE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  job:         { label: 'JOB',         color: '#4ADE80', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)' },
  learnership: { label: 'LEARNERSHIP', color: '#5EEAD4', bg: 'rgba(45,212,191,0.12)',  border: 'rgba(45,212,191,0.25)' },
  internship:  { label: 'INTERNSHIP',  color: '#FCD34D', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
  bursary:     { label: 'BURSARY',     color: '#FB7185', bg: 'rgba(244,63,94,0.12)',   border: 'rgba(244,63,94,0.25)'  },
  course:      { label: 'COURSE',      color: '#A78BFA', bg: 'rgba(123,92,240,0.12)',  border: 'rgba(123,92,240,0.25)' },
}

function VerificationBadge({ opp }: { opp: Opportunity }) {
  const verified = opp.is_verified || opp.verification_status === 'verified'
  if (opp.seta_name && verified) return (
    <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '5px', background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)', letterSpacing: '0.05em' }}>
      ✓ SETA
    </span>
  )
  if (verified) return (
    <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '5px', background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' }}>
      ✓ Verified
    </span>
  )
  return (
    <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', background: 'rgba(245,158,11,0.1)', color: '#FBB040', border: '1px solid rgba(245,158,11,0.2)' }}>
      ⏳ Pending
    </span>
  )
}

function MatchBar({ score }: { score: number }) {
  const color = score >= 75 ? '#4ADE80' : score >= 50 ? '#FCD34D' : '#FB7185'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: '2px', transition: 'width 0.8s ease' }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 700, color, minWidth: '32px', textAlign: 'right' }}>{score}%</span>
    </div>
  )
}

function MatchExplanation({ opp, candidate }: { opp: Opportunity; candidate: any }) {
  const [open, setOpen] = useState(false)
  const mine: string[] = candidate?.skills || []
  const req: string[] = opp.skills_required || []
  if (!req.length || !opp.match_score) return null
  const has = req.filter(s => mine.includes(s))
  const missing = req.filter(s => !mine.includes(s))
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        fontSize: '11px', color: 'var(--violet-glow, #9B7FF8)', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: '4px',
      }}>Why {opp.match_score}% match? {open ? '▲' : '▼'}</button>
      {open && (
        <div style={{ marginTop: '8px', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {has.length > 0 && (
            <div style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '9px', fontWeight: 800, color: '#34D399', letterSpacing: '0.1em', marginBottom: '4px' }}>YOU HAVE</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {has.map(s => <span key={s} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' }}>✓ {s}</span>)}
              </div>
            </div>
          )}
          {missing.length > 0 && (
            <div>
              <div style={{ fontSize: '9px', fontWeight: 800, color: '#FB7185', letterSpacing: '0.1em', marginBottom: '4px' }}>SKILL GAPS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {missing.map(s => <span key={s} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(244,63,94,0.12)', color: '#FB7185', border: '1px solid rgba(244,63,94,0.2)' }}>✗ {s}</span>)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted, #7A6FAA)', marginTop: '5px' }}>
                💡 Add these skills to your profile to improve your match
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function LiveFeedDashboard({ opportunities = [], candidate }: Props) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [applied, setApplied] = useState<Record<string, boolean>>({})
  const [applying, setApplying] = useState<string | null>(null)

  const filtered = filter === 'all' ? opportunities : opportunities.filter(o => o.type === filter)
  const verifiedCount = opportunities.filter(o => o.is_verified || o.verification_status === 'verified').length

  async function applyToJob(oppId: string) {
    setApplying(oppId)
    try {
      const res = await fetch('/api/applications/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: oppId }),
      })
      const data = await res.json()
      if (res.ok || data.code === 'duplicate') setApplied(prev => ({ ...prev, [oppId]: true }))
    } catch {}
    setApplying(null)
  }

  function formatSalary(o: Opportunity) {
    if (!o.salary_min && !o.salary_max) return null
    const c = o.salary_currency === 'ZAR' ? 'R' : o.salary_currency || 'R'
    const f = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : String(n)
    if (o.salary_min && o.salary_max) return `${c}${f(o.salary_min)}–${c}${f(o.salary_max)}`
    if (o.salary_min) return `${c}${f(o.salary_min)}+`
    return null
  }

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted,#7A6FAA)', letterSpacing: '0.1em', margin: 0 }}>
            LIVE FEED — RANKED BY MATCH
          </h2>
          {verifiedCount > 0 && (
            <div style={{ fontSize: '12px', color: '#34D399', marginTop: '2px', fontWeight: 600 }}>
              ✓ {verifiedCount} verified SA employer{verifiedCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['all','job','learnership','internship','bursary'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 12px', borderRadius: '7px', fontSize: '11px', fontWeight: 600,
              border: filter === f ? '1.5px solid rgba(123,92,240,0.5)' : '1px solid rgba(255,255,255,0.08)',
              background: filter === f ? 'rgba(123,92,240,0.15)' : 'rgba(255,255,255,0.04)',
              color: filter === f ? '#A78BFA' : 'var(--text-muted,#7A6FAA)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {f === 'all' ? `All ${opportunities.length}` : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary,#F0ECFF)', marginBottom: '6px' }}>
            {candidate?.cv_status === 'parsed' ? 'No matches yet' : 'Upload your CV to get matched'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted,#7A6FAA)' }}>
            New opportunities added daily. Check back soon.
          </div>
        </div>
      )}

      {/* Featured card */}
      {filtered[0] && (() => {
        const opp = filtered[0]
        const meta = TYPE_META[opp.type] || TYPE_META.job
        const sal = formatSalary(opp)
        return (
          <div className="card" style={{ marginBottom: '12px', border: '1px solid rgba(123,92,240,0.3)', boxShadow: '0 8px 40px rgba(123,92,240,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '5px', background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, letterSpacing: '0.08em' }}>{meta.label}</span>
                <VerificationBadge opp={opp} />
                {opp.match_score && <span style={{ fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '5px', background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)', letterSpacing: '0.06em' }}>TOP MATCH</span>}
              </div>
              {opp.match_score && (
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: opp.match_score >= 75 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${opp.match_score >= 75 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: opp.match_score >= 75 ? '#4ADE80' : '#FCD34D', lineHeight: 1 }}>{opp.match_score}</div>
                  <div style={{ fontSize: '8px', color: 'rgba(240,236,255,0.4)', fontWeight: 700, letterSpacing: '0.05em' }}>MATCH</div>
                </div>
              )}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary,#F0ECFF)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{opp.title}</h3>
            <div style={{ fontSize: '13px', color: 'var(--text-muted,#7A6FAA)', marginBottom: '12px' }}>
              {opp.employers?.company_name || 'SA Employer'} · {opp.location_city || 'South Africa'}
              {sal && ` · ${sal}`}
              {opp.employment_type && ` · ${opp.employment_type.replace('_','-')}`}
            </div>
            {opp.match_score && candidate && <div style={{ marginBottom: '10px' }}><MatchBar score={opp.match_score} /></div>}
            {opp.match_score && candidate && <div style={{ marginBottom: '12px' }}><MatchExplanation opp={opp} candidate={candidate} /></div>}
            {(opp.skills_required || []).length > 0 && (
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {(opp.skills_required || []).slice(0, 5).map((sk: string) => {
                  const hasSk = candidate?.skills?.includes(sk)
                  return (
                    <span key={sk} style={{ fontSize: '10px', fontWeight: 600, padding: '3px 9px', borderRadius: '5px', background: hasSk ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: hasSk ? '#34D399' : 'var(--text-muted,#7A6FAA)', border: `1px solid ${hasSk ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
                      {sk} {hasSk ? '✓' : ''}
                    </span>
                  )
                })}
              </div>
            )}
            <button onClick={() => applyToJob(opp.id)} disabled={!!applied[opp.id] || applying === opp.id} style={{
              padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '13px',
              background: applied[opp.id] ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg,#7B5CF0,#2DD4BF)',
              color: applied[opp.id] ? '#34D399' : 'white',
              border: applied[opp.id] ? '1px solid rgba(16,185,129,0.3)' : 'none',
              cursor: applied[opp.id] ? 'default' : 'pointer',
              opacity: applying === opp.id ? 0.7 : 1,
              boxShadow: applied[opp.id] ? 'none' : '0 4px 16px rgba(123,92,240,0.4)',
            }}>
              {applying === opp.id ? 'Applying…' : applied[opp.id] ? '✓ Applied' : 'Apply →'}
            </button>
          </div>
        )
      })()}

      {/* Grid of remaining */}
      {filtered.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '10px' }}>
          {filtered.slice(1).map(opp => {
            const meta = TYPE_META[opp.type] || TYPE_META.job
            const sal = formatSalary(opp)
            return (
              <div key={opp.id} className="card card-hover">
                <div style={{ display: 'flex', gap: '5px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px', background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, letterSpacing: '0.07em' }}>{meta.label}</span>
                  <VerificationBadge opp={opp} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary,#F0ECFF)', marginBottom: '3px', lineHeight: 1.3 }}>{opp.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted,#7A6FAA)', marginBottom: '10px' }}>
                  {opp.employers?.company_name || 'SA Employer'} · {opp.location_city || 'SA'}
                  {sal && ` · ${sal}`}
                </div>
                {opp.match_score && <div style={{ marginBottom: '10px' }}><MatchBar score={opp.match_score} /></div>}
                <button onClick={() => applyToJob(opp.id)} disabled={!!applied[opp.id] || applying === opp.id} style={{
                  width: '100%', padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: '12px',
                  background: applied[opp.id] ? 'rgba(16,185,129,0.1)' : 'rgba(123,92,240,0.1)',
                  color: applied[opp.id] ? '#34D399' : '#A78BFA',
                  border: `1px solid ${applied[opp.id] ? 'rgba(16,185,129,0.2)' : 'rgba(123,92,240,0.2)'}`,
                  cursor: applied[opp.id] ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                }}>
                  {applying === opp.id ? '…' : applied[opp.id] ? '✓ Applied' : 'Apply →'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
