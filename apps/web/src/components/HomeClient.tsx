'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/* ─── TYPE HELPERS ─────────────────────────────────────────────────────────── */
type Opp = {
  id: string; type: string; title: string; location_city?: string;
  salary_min?: number; salary_max?: number; salary_currency?: string;
  is_verified?: boolean; verification_status?: string; seta_name?: string;
  skills_required?: string[]; employers?: { company_name?: string; company_logo_url?: string }
}
type Stats = { jobs: number; learnerships: number; internships: number; bursaries: number }
interface Props {
  user: any; profile: any; candidate: any;
  opportunities: Opp[]; matches: Opp[]; stats: Stats
}

/* ─── TICKER CARD ──────────────────────────────────────────────────────────── */
const TYPE_COLOR: Record<string, string> = {
  job: '#4ADE80', learnership: '#5EEAD4', internship: '#FCD34D',
  bursary: '#FB7185', course: '#A78BFA',
}

function TickerCard({ opp }: { opp: Opp }) {
  const color = TYPE_COLOR[opp.type] || '#9B7FF8'
  const company = opp.employers?.company_name
  const sal = opp.salary_min
    ? `R${Math.round(opp.salary_min / 1000)}k${opp.salary_max ? `–R${Math.round(opp.salary_max / 1000)}k` : '+'}`
    : null
  const verified = opp.is_verified || opp.verification_status === 'verified'

  return (
    <Link href="/jobs" style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 16px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        cursor: 'pointer',
        minWidth: '220px',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
        }}
      >
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: color, flexShrink: 0,
          boxShadow: `0 0 8px ${color}80`,
        }} />
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#F0ECFF', lineHeight: 1.2 }}>
            {opp.title.length > 28 ? opp.title.slice(0,28)+'…' : opp.title}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(240,236,255,0.5)', marginTop: '2px' }}>
            {company ? `${company} · ` : ''}{opp.location_city || 'SA'}{sal ? ` · ${sal}` : ''}
          </div>
        </div>
        {verified && (
          <span style={{
            fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px',
            background: 'rgba(16,185,129,0.15)', color: '#34D399',
            border: '1px solid rgba(16,185,129,0.2)', letterSpacing: '0.04em',
          }}>✓</span>
        )}
      </div>
    </Link>
  )
}

/* ─── TICKER ROW ───────────────────────────────────────────────────────────── */
function TickerRow({ items, reverse = false, label, labelColor }: {
  items: Opp[]; reverse?: boolean; label: string; labelColor: string
}) {
  if (!items.length) return null
  const doubled = [...items, ...items] // double for seamless loop

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', paddingLeft: '4px' }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: labelColor, boxShadow: `0 0 8px ${labelColor}`,
          flexShrink: 0,
        }} />
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(240,236,255,0.4)', letterSpacing: '0.12em' }}>
          {label}
        </span>
      </div>
      <div className="ticker-wrap">
        <div className={`ticker-track${reverse ? ' ticker-track-reverse' : ''}`}
          style={{ gap: '10px' }}>
          {doubled.map((opp, i) => (
            <TickerCard key={`${opp.id}-${i}`} opp={opp} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── PLACEMENTS TICKER ────────────────────────────────────────────────────── */
const PLACED = [
  { name: 'Thabo M.', role: 'Data Analyst', co: 'FNB', city: 'JHB', days: '3d' },
  { name: 'Nomsa D.', role: 'UX Researcher', co: 'Standard Bank', city: 'CPT', days: '5d' },
  { name: 'Priya M.', role: 'Data Intern', co: 'Discovery', city: 'JHB', days: '1w' },
  { name: 'Sipho N.', role: 'DevOps Eng', co: 'Vodacom', city: 'MID', days: '2d' },
  { name: 'Lerato S.', role: 'Product Mgr', co: 'Capitec', city: 'STB', days: '4d' },
  { name: 'Ayanda K.', role: 'Cloud Eng', co: 'MTN', city: 'JHB', days: '6d' },
  { name: 'Zanele M.', role: 'BA', co: 'Nedbank', city: 'JHB', days: '3d' },
  { name: 'Kagiso T.', role: 'Cyber Analyst', co: 'Absa', city: 'JHB', days: '1d' },
  { name: 'Lungelo C.', role: 'Full Stack', co: 'Accenture', city: 'CPT', days: '2w' },
  { name: 'Fatima E.', role: 'Finance Intern', co: 'Old Mutual', city: 'CPT', days: '1d' },
]

function PlacedPill({ p }: { p: typeof PLACED[0] }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 14px',
      background: 'rgba(16,185,129,0.08)',
      border: '1px solid rgba(16,185,129,0.18)',
      borderRadius: '999px',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: '26px', height: '26px', borderRadius: '50%',
        background: 'linear-gradient(135deg,#7B5CF0,#2DD4BF)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '9px', fontWeight: 800, color: 'white', flexShrink: 0,
      }}>{p.name[0]}{p.name.split(' ')[1]?.[0]}</span>
      <div>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#F0ECFF' }}>{p.name}</span>
        <span style={{ fontSize: '11px', color: 'rgba(240,236,255,0.5)', marginLeft: '4px' }}>
          → {p.role} at {p.co}
        </span>
      </div>
      <span style={{
        fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '6px',
        background: 'rgba(16,185,129,0.15)', color: '#34D399',
      }}>placed</span>
      <span style={{ fontSize: '10px', color: 'rgba(240,236,255,0.3)' }}>{p.days}</span>
    </div>
  )
}

/* ─── MATCH CARD (feed) ────────────────────────────────────────────────────── */
function MatchCard({ opp, applied, onApply }: { opp: Opp; applied: boolean; onApply: () => void }) {
  const company = opp.employers?.company_name || 'SA Employer'
  const color = TYPE_COLOR[opp.type] || '#9B7FF8'
  const verified = opp.is_verified || opp.verification_status === 'verified'
  const sal = opp.salary_min
    ? `R${Math.round(opp.salary_min / 1000)}k${opp.salary_max ? `–R${Math.round(opp.salary_max / 1000)}k` : '+'}`
    : null

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span className={`badge badge-${opp.type}`}>{opp.type}</span>
          {verified && (
            opp.seta_name
              ? <span className="badge badge-verified">✓ SETA</span>
              : <span className="badge badge-verified">✓ Verified</span>
          )}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px', lineHeight: 1.3 }}>
          {opp.title}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {company} · {opp.location_city || 'South Africa'}{sal ? ` · ${sal}` : ''}
        </div>
      </div>
      {(opp.skills_required || []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {(opp.skills_required || []).slice(0,4).map((s: string) => (
            <span key={s} style={{
              fontSize: '10px', padding: '2px 8px', borderRadius: '5px',
              background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>{s}</span>
          ))}
        </div>
      )}
      <button onClick={onApply} disabled={applied} style={{
        padding: '9px', borderRadius: '9px', fontSize: '12px', fontWeight: 700,
        background: applied ? 'rgba(16,185,129,0.15)' : 'rgba(123,92,240,0.15)',
        color: applied ? '#34D399' : '#A78BFA',
        border: `1px solid ${applied ? 'rgba(16,185,129,0.25)' : 'rgba(123,92,240,0.25)'}`,
        cursor: applied ? 'default' : 'pointer',
        transition: 'all 0.2s',
      }}>
        {applied ? '✓ Applied' : 'Apply →'}
      </button>
    </div>
  )
}

/* ─── MAIN COMPONENT ───────────────────────────────────────────────────────── */
export default function HomeClient({ user, profile, candidate, opportunities, matches, stats }: Props) {
  const [filter, setFilter] = useState<'all'|'job'|'learnership'|'internship'|'bursary'>('all')
  const [appliedMap, setAppliedMap] = useState<Record<string, boolean>>({})
  const [applyingId, setApplyingId] = useState<string|null>(null)

  // Split opps into categories for tickers
  const jobs        = opportunities.filter(o => o.type === 'job')
  const learnerships= opportunities.filter(o => o.type === 'learnership')
  const internships = opportunities.filter(o => o.type === 'internship')
  const bursaries   = opportunities.filter(o => o.type === 'bursary')

  const feedItems = filter === 'all' ? opportunities
    : opportunities.filter(o => o.type === filter)

  async function handleApply(oppId: string) {
    if (!user) { window.location.href = '/auth/register'; return }
    setApplyingId(oppId)
    try {
      const res = await fetch('/api/applications/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: oppId }),
      })
      if (res.ok) setAppliedMap(m => ({ ...m, [oppId]: true }))
    } catch {}
    setApplyingId(null)
  }

  const totalLive = stats.jobs + stats.learnerships + stats.internships + stats.bursaries

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{
        padding: '100px 24px 60px',
        background: 'var(--gradient-hero)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          borderRadius: '50%', top: '-200px', left: '60%',
          background: 'radial-gradient(circle, rgba(123,92,240,0.2) 0%, transparent 70%)',
          pointerEvents: 'none', filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          borderRadius: '50%', bottom: '-100px', left: '-50px',
          background: 'radial-gradient(circle, rgba(45,212,191,0.15) 0%, transparent 70%)',
          pointerEvents: 'none', filter: 'blur(60px)',
        }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
          {/* Status pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '5px 14px 5px 8px',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '999px', marginBottom: '28px',
          }}>
            <span className="glow-dot" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#34D399', letterSpacing: '0.08em' }}>
              {totalLive} LIVE OPPORTUNITIES · SOUTH AFRICA
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 76px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            color: '#F0ECFF',
          }}>
            The platform built<br />
            to <span className="serif gradient-text">change careers</span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: 'var(--text-secondary)',
            maxWidth: '560px',
            lineHeight: 1.65,
            marginBottom: '36px',
          }}>
            Upload your CV once. Hirrd matches you to verified SA jobs, learnerships,
            bursaries and internships — with AI that explains exactly why you match.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '48px' }}>
            <Link href={user ? '/dashboard' : '/auth/register'} className="btn btn-primary" style={{ gap: '8px', fontSize: '15px', padding: '13px 28px' }}>
              {user ? 'View my matches →' : 'Upload CV — get matched →'}
            </Link>
            <Link href="/build-profile" className="btn btn-ghost" style={{ fontSize: '14px', padding: '13px 24px' }}>
              No CV? Build your profile →
            </Link>
          </div>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { n: stats.jobs, label: 'Jobs', color: '#4ADE80' },
              { n: stats.learnerships, label: 'Learnerships', color: '#5EEAD4' },
              { n: stats.internships, label: 'Internships', color: '#FCD34D' },
              { n: stats.bursaries, label: 'Bursaries', color: '#FB7185' },
            ].map(({ n, label, color }) => (
              <div key={label} style={{
                padding: '6px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color }}>{n.toLocaleString()}</span>
                <span style={{ fontSize: '11px', color: 'rgba(240,236,255,0.5)', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OPPORTUNITY TICKER ROWS ────────────────────────────────────── */}
      <section style={{
        padding: '24px 0',
        borderTop: '1px solid var(--glass-border)',
        borderBottom: '1px solid var(--glass-border)',
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(8px)',
      }}>
        {jobs.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <TickerRow items={jobs} label="JOBS" labelColor="#4ADE80" />
          </div>
        )}
        {learnerships.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <TickerRow items={learnerships} reverse label="LEARNERSHIPS · SETA" labelColor="#5EEAD4" />
          </div>
        )}
        {internships.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <TickerRow items={internships} label="INTERNSHIPS" labelColor="#FCD34D" />
          </div>
        )}
        {bursaries.length > 0 && (
          <TickerRow items={bursaries} reverse label="BURSARIES" labelColor="#FB7185" />
        )}
        {opportunities.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
            Loading live opportunities…
          </div>
        )}
      </section>

      {/* ── PLACEMENTS TICKER ─────────────────────────────────────────── */}
      <section style={{
        padding: '18px 0',
        borderBottom: '1px solid var(--glass-border)',
        background: 'rgba(16,185,129,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '24px', marginBottom: '10px' }}>
          <span className="glow-dot" style={{ width: '6px', height: '6px' }} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(240,236,255,0.4)', letterSpacing: '0.12em' }}>
            RECENTLY PLACED THIS WEEK
          </span>
        </div>
        <div className="ticker-wrap">
          <div className="ticker-track" style={{ gap: '10px', animationDuration: '30s' }}>
            {[...PLACED, ...PLACED].map((p, i) => (
              <PlacedPill key={i} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE FEED ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Feed header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {user ? 'Your matches' : 'All opportunities'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {feedItems.length} live · Ranked by match · Verified SA employers
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['all','job','learnership','internship','bursary'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                border: filter === f ? '1.5px solid rgba(123,92,240,0.5)' : '1px solid var(--glass-border)',
                background: filter === f ? 'rgba(123,92,240,0.15)' : 'var(--glass-1)',
                color: filter === f ? '#A78BFA' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {f === 'all' ? `All ${opportunities.length}` : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        {feedItems.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'var(--glass-1)', borderRadius: '18px',
            border: '1px dashed var(--glass-border)',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '14px' }}>🔍</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {user ? 'Upload your CV to get personalised matches' : 'No opportunities found'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {user
                ? 'Once you upload, AI will match you to the best SA opportunities.'
                : 'Check back soon — new opportunities are added daily.'}
            </div>
            {user && (
              <Link href="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                Upload CV now →
              </Link>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '14px',
          }}>
            {feedItems.slice(0, 24).map(opp => (
              <MatchCard
                key={opp.id}
                opp={opp}
                applied={!!appliedMap[opp.id]}
                onApply={() => handleApply(opp.id)}
              />
            ))}
          </div>
        )}

        {feedItems.length > 24 && (
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/jobs" className="btn btn-ghost">
              View all {feedItems.length} opportunities →
            </Link>
          </div>
        )}
      </section>

      {/* ── CTA FOOTER ────────────────────────────────────────────────── */}
      {!user && (
        <section style={{
          padding: '64px 24px',
          background: 'linear-gradient(135deg, rgba(123,92,240,0.1), rgba(45,212,191,0.08))',
          borderTop: '1px solid var(--glass-border)',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>
              Ready to get <span className="gradient-text serif">hirrd?</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6 }}>
              Free for candidates. AI-powered matching. WhatsApp job alerts. SETA-verified opportunities.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/register" className="btn btn-primary" style={{ fontSize: '15px', padding: '13px 32px' }}>
                Get started free →
              </Link>
              <Link href="/employers" className="btn btn-ghost" style={{ fontSize: '14px' }}>
                For employers
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

// Expose PLACED for external use
export { PLACED }
