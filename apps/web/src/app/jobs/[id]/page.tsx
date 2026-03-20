'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import HirrdNav from '@/components/HirrdNav'
import Link from 'next/link'

type Rec = 'apply_now' | 'apply_with_note' | 'skill_up_first' | 'not_recommended'

interface Match {
  match_score: number
  matched_skills: string[]
  missing_skills: string[]
  match_breakdown: { skills: number; experience: number; location: number }
  recommendation: Rec
  tip: string
}

const REC_CONFIG: Record<Rec, { label: string; color: string; bg: string }> = {
  apply_now:        { label: '🟢 Strong match — apply now',          color: '#4ADE80', bg: 'rgba(74,222,128,0.08)' },
  apply_with_note:  { label: '🟡 Good fit — personalise your note',  color: '#FCD34D', bg: 'rgba(252,211,77,0.08)' },
  skill_up_first:   { label: '🟠 Skill gap — upskill first',         color: '#FB923C', bg: 'rgba(251,146,60,0.08)' },
  not_recommended:  { label: '🔴 Not recommended right now',          color: '#F87171', bg: 'rgba(248,113,113,0.08)' },
}

const TYPE_META: Record<string, { label: string; color: string }> = {
  job:         { label: 'JOB',         color: '#4ADE80' },
  learnership: { label: 'LEARNERSHIP', color: '#5EEAD4' },
  internship:  { label: 'INTERNSHIP',  color: '#FCD34D' },
  bursary:     { label: 'BURSARY',     color: '#FB7185' },
  course:      { label: 'COURSE',      color: '#A78BFA' },
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [candidate, setCandidate] = useState<any>(null)
  const [opp, setOpp] = useState<any>(null)
  const [match, setMatch] = useState<Match | null>(null)
  const [loadingOpp, setLoadingOpp] = useState(true)
  const [loadingMatch, setLoadingMatch] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [coverNote, setCoverNote] = useState('')
  const [showApplyModal, setShowApplyModal] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(p)
        const { data: c } = await supabase.from('candidates').select('*').eq('profile_id', user.id).single()
        setCandidate(c)
      }

      const { data: o } = await supabase
        .from('opportunities')
        .select('*, employers(company_name, company_logo_url, website)')
        .eq('id', id)
        .single()
      setOpp(o)
      setLoadingOpp(false)

      // Check if already applied
      if (user) {
        const { data: cand } = await supabase.from('candidates').select('id').eq('profile_id', user.id).single()
        if (cand) {
          const { data: existing } = await supabase
            .from('applications').select('id').eq('candidate_id', cand.id).eq('opportunity_id', id).single()
          if (existing) setApplied(true)
        }
      }
    }
    load()
  }, [id])

  async function getMatch() {
    if (!user || !candidate) return
    setLoadingMatch(true)
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: id }),
      })
      const data = await res.json()
      if (!data.error) setMatch(data)
    } finally {
      setLoadingMatch(false)
    }
  }

  async function handleApply() {
    if (!user) { router.push('/auth/login?redirect=/jobs/' + id); return }
    if (!candidate?.cv_url) { router.push('/profile'); return }
    setApplying(true)
    setApplyError('')
    try {
      const res = await fetch('/api/applications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: id, cover_note: coverNote }),
      })
      const data = await res.json()
      if (data.error && data.code !== 'duplicate') throw new Error(data.error)
      setApplied(true)
      setShowApplyModal(false)
    } catch (e: any) {
      setApplyError(e.message)
    } finally {
      setApplying(false)
    }
  }

  const s: Record<string, React.CSSProperties> = {
    page: { maxWidth: '800px', margin: '0 auto', padding: '32px 20px 80px' },
    card: { background: 'var(--glass-2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', marginBottom: '16px' },
    sectionLabel: { fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '12px' },
    tag: { fontSize: '11px', padding: '3px 9px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'rgba(240,236,255,0.6)', border: '1px solid rgba(255,255,255,0.07)', display: 'inline-block', margin: '2px' },
    btn: { padding: '12px 28px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none', transition: 'opacity 0.15s' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' },
    modalInner: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', maxWidth: '520px', width: '100%' },
  }

  if (loadingOpp) return (
    <>
      <HirrdNav user={user} profile={profile} />
      <main style={s.page}>
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading opportunity…</div>
      </main>
    </>
  )

  if (!opp) return (
    <>
      <HirrdNav user={user} profile={profile} />
      <main style={s.page}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Opportunity not found</h2>
          <Link href="/jobs" style={{ color: 'var(--primary)' }}>← Back to jobs</Link>
        </div>
      </main>
    </>
  )

  const typeMeta = TYPE_META[opp.type] || TYPE_META.job
  const salary = opp.salary_min && opp.salary_max
    ? `${opp.salary_currency || 'R'} ${(opp.salary_min/1000).toFixed(0)}k – ${(opp.salary_max/1000).toFixed(0)}k p/m`
    : opp.salary_min ? `From ${opp.salary_currency || 'R'} ${(opp.salary_min/1000).toFixed(0)}k p/m` : null

  return (
    <>
      <HirrdNav user={user} profile={profile} />
      <main style={s.page}>

        {/* Back */}
        <Link href="/jobs" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '20px' }}>
          ← Back to jobs
        </Link>

        {/* Header */}
        <div style={{ ...s.card, marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '5px', background: `${typeMeta.color}18`, color: typeMeta.color, border: `1px solid ${typeMeta.color}30`, letterSpacing: '0.08em' }}>
                  {typeMeta.label}
                </span>
                {(opp.is_verified || opp.verification_status === 'verified') && (
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', background: 'rgba(74,222,128,0.12)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.2)' }}>✓ Verified</span>
                )}
                {opp.seta_name && (
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', background: 'rgba(94,234,212,0.12)', color: '#5EEAD4', border: '1px solid rgba(94,234,212,0.2)' }}>SETA: {opp.seta_name}</span>
                )}
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{opp.title}</h1>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {opp.employers?.company_name}
                {opp.location_city && ` · ${opp.location_city}`}
                {opp.market && ` · ${opp.market.toUpperCase()}`}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
                {opp.employment_type && <span>📋 {opp.employment_type.replace('_', ' ')}</span>}
                {opp.experience_level && <span>📈 {opp.experience_level}</span>}
                {salary && <span style={{ color: '#4ADE80', fontWeight: 600 }}>💰 {salary}</span>}
                {opp.open_to_remote && <span>🌐 Remote OK</span>}
              </div>
            </div>

            {/* Apply button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
              {applied ? (
                <div style={{ padding: '12px 20px', borderRadius: '10px', background: 'rgba(74,222,128,0.12)', color: '#4ADE80', fontWeight: 700, fontSize: '14px', textAlign: 'center', border: '1px solid rgba(74,222,128,0.25)' }}>
                  ✓ Applied
                </div>
              ) : (
                <button
                  onClick={() => user ? setShowApplyModal(true) : router.push('/auth/login?redirect=/jobs/' + id)}
                  style={{ ...s.btn, background: 'var(--gradient-primary)', color: 'white' }}
                >
                  {user ? 'Apply Now' : 'Login to Apply'}
                </button>
              )}
              {user && candidate && !match && (
                <button
                  onClick={getMatch}
                  disabled={loadingMatch}
                  style={{ ...s.btn, background: 'rgba(123,92,240,0.12)', color: 'var(--primary)', border: '1px solid rgba(123,92,240,0.25)', padding: '10px 20px', fontSize: '13px' }}
                >
                  {loadingMatch ? 'Analysing…' : '⚡ Check My Match'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AI Match Card */}
        {match && (
          <div style={{ ...s.card, border: `1px solid ${REC_CONFIG[match.recommendation].color}30`, background: REC_CONFIG[match.recommendation].bg, marginBottom: '16px' }}>
            <div style={s.sectionLabel}>AI MATCH ANALYSIS</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '36px', fontWeight: 800, color: REC_CONFIG[match.recommendation].color, lineHeight: 1 }}>{match.match_score}<span style={{ fontSize: '18px' }}>%</span></div>
                <div style={{ fontSize: '13px', color: REC_CONFIG[match.recommendation].color, fontWeight: 600, marginTop: '4px' }}>
                  {REC_CONFIG[match.recommendation].label}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {Object.entries(match.match_breakdown).map(([k, v]) => (
                  <div key={k} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{v}%</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{k}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Score bars */}
            {Object.entries(match.match_breakdown).map(([k, v]) => (
              <div key={k} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'capitalize' }}>
                  <span>{k}</span><span>{v}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${v}%`, background: v >= 75 ? '#4ADE80' : v >= 50 ? '#FCD34D' : '#F87171', borderRadius: '2px', transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
            {match.tip && (
              <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                💡 <strong>Tip:</strong> {match.tip}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              {match.matched_skills.slice(0, 6).map(s => (
                <span key={s} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '6px', background: 'rgba(74,222,128,0.1)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.2)' }}>✓ {s}</span>
              ))}
              {match.missing_skills.slice(0, 4).map(s => (
                <span key={s} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '6px', background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '1px solid rgba(248,113,113,0.2)' }}>✗ {s}</span>
              ))}
            </div>
          </div>
        )}

        {/* No profile prompt */}
        {user && !candidate?.cv_url && (
          <div style={{ ...s.card, border: '1px solid rgba(252,211,77,0.25)', background: 'rgba(252,211,77,0.06)', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
              ⚠️ Upload your CV to get an AI match score and apply in one click.
            </p>
            <Link href="/profile" style={{ fontSize: '13px', fontWeight: 600, color: '#FCD34D', textDecoration: 'none' }}>
              Upload CV → 
            </Link>
          </div>
        )}

        {/* Description */}
        <div style={s.card}>
          <div style={s.sectionLabel}>ABOUT THIS ROLE</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {opp.description}
          </div>
        </div>

        {/* Requirements */}
        {opp.requirements && (
          <div style={s.card}>
            <div style={s.sectionLabel}>REQUIREMENTS</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {opp.requirements}
            </div>
          </div>
        )}

        {/* Skills */}
        {opp.skills_required?.length > 0 && (
          <div style={s.card}>
            <div style={s.sectionLabel}>SKILLS REQUIRED</div>
            <div>{opp.skills_required.map((sk: string) => <span key={sk} style={s.tag}>{sk}</span>)}</div>
          </div>
        )}

        {/* Company */}
        {opp.employers && (
          <div style={s.card}>
            <div style={s.sectionLabel}>EMPLOYER</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {opp.employers.company_logo_url && (
                <img src={opp.employers.company_logo_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
              )}
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{opp.employers.company_name}</div>
                {opp.employers.website && (
                  <a href={opp.employers.website} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--primary)' }}>
                    {opp.employers.website}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom apply */}
        {!applied && (
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <button
              onClick={() => user ? setShowApplyModal(true) : router.push('/auth/login?redirect=/jobs/' + id)}
              style={{ ...s.btn, background: 'var(--gradient-primary)', color: 'white', padding: '14px 40px', fontSize: '15px' }}
            >
              {user ? (candidate?.cv_url ? 'Apply Now' : 'Upload CV to Apply') : 'Login to Apply'}
            </button>
          </div>
        )}
      </main>

      {/* Apply Modal */}
      {showApplyModal && (
        <div style={s.modal} onClick={() => setShowApplyModal(false)}>
          <div style={s.modalInner} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Apply for this role</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>{opp.title} · {opp.employers?.company_name}</p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                COVER NOTE (optional)
              </label>
              <textarea
                value={coverNote}
                onChange={e => setCoverNote(e.target.value)}
                placeholder="Briefly why you're interested or a relevant achievement…"
                rows={4}
                style={{ width: '100%', background: 'var(--glass-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              📎 Your uploaded CV will be sent to the employer.
            </div>

            {applyError && <p style={{ fontSize: '13px', color: '#F87171', marginBottom: '12px' }}>{applyError}</p>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowApplyModal(false)} style={{ ...s.btn, background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', flex: 1 }}>
                Cancel
              </button>
              <button onClick={handleApply} disabled={applying} style={{ ...s.btn, background: 'var(--gradient-primary)', color: 'white', flex: 2, opacity: applying ? 0.7 : 1 }}>
                {applying ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
