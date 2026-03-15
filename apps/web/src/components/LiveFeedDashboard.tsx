'use client'

import { useState } from 'react'

type FilterType = 'all' | 'job' | 'learnership' | 'course'

interface Opportunity {
  id: string
  type: string
  title: string
  employers?: { company_name: string; company_logo_url?: string }
  location_city?: string
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  skills_required?: string[]
  match_score?: number
  employment_type?: string
}

interface Props {
  opportunities?: Opportunity[]
  candidate?: any
}

export default function LiveFeedDashboard({ opportunities = [], candidate }: Props) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [applied, setApplied] = useState<Record<string, boolean>>({})
  const [applying, setApplying] = useState<string | null>(null)

  const filtered = filter === 'all'
    ? opportunities
    : opportunities.filter(o => o.type === filter)

  async function applyToJob(oppId: string) {
    setApplying(oppId)
    try {
      const res = await fetch('/api/applications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: oppId }),
      })
      const data = await res.json()
      if (res.ok || data.code === 'duplicate') {
        setApplied(prev => ({ ...prev, [oppId]: true }))
      }
    } catch {}
    setApplying(null)
  }

  function matchColour(score: number) {
    if (score >= 75) return 'var(--success)'
    if (score >= 50) return 'var(--warning)'
    return 'var(--error)'
  }

  function formatSalary(opp: Opportunity) {
    if (!opp.salary_min && !opp.salary_max) return null
    const cur = opp.salary_currency === 'ZAR' ? 'R' : opp.salary_currency || 'R'
    const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : String(n)
    if (opp.salary_min && opp.salary_max) return `${cur}${fmt(opp.salary_min)}–${cur}${fmt(opp.salary_max)}`
    if (opp.salary_min) return `${cur}${fmt(opp.salary_min)}+`
    return null
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    transition: 'box-shadow 0.15s',
  }

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 14px', borderRadius: '20px', fontSize: '12px',
    fontWeight: 600, cursor: 'pointer', border: 'none',
    background: active ? 'var(--primary)' : 'var(--bg-base)',
    color: active ? 'white' : 'var(--text-muted)',
    transition: 'all 0.15s',
  })

  return (
    <div>
      {/* Section header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', margin: 0 }}>
          LIVE FEED — RANKED BY MATCH
        </h2>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'job', 'learnership', 'course'] as FilterType[]).map(f => (
            <button key={f} style={pillStyle(filter === f)} onClick={() => setFilter(f)}>
              {f === 'all' ? `All ${opportunities.length}` : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          background: 'var(--bg-base)', borderRadius: '12px',
          border: '1px dashed var(--border-medium)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            {candidate?.cv_status === 'parsed' ? 'No matches yet' : 'Upload your CV to get matched'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {candidate?.cv_status === 'parsed'
              ? 'New opportunities are added daily. Check back soon.'
              : 'Once you upload your CV, AI will match you to the best opportunities.'}
          </div>
        </div>
      )}

      {/* Top match card (featured) */}
      {filtered[0] && (
        <div style={{ ...cardStyle, border: '1.5px solid rgba(124,88,232,0.25)', boxShadow: '0 2px 12px rgba(124,88,232,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, padding: '3px 8px',
                borderRadius: '4px', background: 'rgba(124,88,232,0.1)',
                color: 'var(--primary)', letterSpacing: '0.06em',
              }}>
                {(filtered[0].type || 'JOB').toUpperCase()}
              </span>
              {filtered[0].match_score && (
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '3px 8px',
                  borderRadius: '4px', background: 'rgba(58,174,114,0.1)',
                  color: 'var(--success)', letterSpacing: '0.06em',
                }}>TOP MATCH</span>
              )}
            </div>
            {filtered[0].match_score && (
              <div style={{
                width: '52px', height: '52px', borderRadius: '12px',
                background: matchColour(filtered[0].match_score),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', flexShrink: 0,
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                  {filtered[0].match_score}
                </div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>MATCH %</div>
              </div>
            )}
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            {filtered[0].title}
          </h3>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            {filtered[0].employers?.company_name || 'SA Employer'} · {filtered[0].location_city || 'South Africa'}
            {formatSalary(filtered[0]) && ` · ${formatSalary(filtered[0])}`}
            {filtered[0].employment_type && ` · ${filtered[0].employment_type.replace('_', '-')}`}
          </div>

          {filtered[0].skills_required?.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {filtered[0].skills_required.slice(0, 5).map((sk: string) => {
                const hasSkill = candidate?.skills?.includes(sk)
                return (
                  <span key={sk} style={{
                    fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '5px',
                    background: hasSkill ? 'rgba(58,174,114,0.1)' : 'rgba(192,80,74,0.08)',
                    color: hasSkill ? 'var(--success)' : 'var(--error)',
                    border: `1px solid ${hasSkill ? 'rgba(58,174,114,0.2)' : 'rgba(192,80,74,0.15)'}`,
                  }}>
                    {sk} {hasSkill ? '✓' : '✗'}
                  </span>
                )
              })}
            </div>
          )}

          <button
            onClick={() => applyToJob(filtered[0].id)}
            disabled={!!applied[filtered[0].id] || applying === filtered[0].id}
            style={{
              padding: '9px 22px', borderRadius: '8px', fontWeight: 600, fontSize: '13px',
              background: applied[filtered[0].id] ? 'var(--success)' : 'var(--gradient-primary)',
              color: 'white', border: 'none',
              cursor: applied[filtered[0].id] ? 'default' : 'pointer',
              opacity: applying === filtered[0].id ? 0.7 : 1,
            }}
          >
            {applying === filtered[0].id ? 'Applying…' : applied[filtered[0].id] ? '✓ Applied' : 'Apply →'}
          </button>
        </div>
      )}

      {/* Remaining cards — 2-column grid */}
      {filtered.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {filtered.slice(1).map(opp => (
            <div key={opp.id} style={cardStyle}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '6px' }}>
                {(opp.type || 'JOB').toUpperCase()}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.3 }}>
                {opp.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {opp.employers?.company_name || 'SA Employer'} · {opp.location_city || 'SA'}
              </div>
              {opp.match_score && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <div style={{ flex: 1, height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${opp.match_score}%`, background: matchColour(opp.match_score), borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: matchColour(opp.match_score) }}>{opp.match_score}%</span>
                </div>
              )}
              <button
                onClick={() => applyToJob(opp.id)}
                disabled={!!applied[opp.id] || applying === opp.id}
                style={{
                  width: '100%', padding: '7px', borderRadius: '7px',
                  fontWeight: 600, fontSize: '12px',
                  background: applied[opp.id] ? 'rgba(58,174,114,0.1)' : 'rgba(124,88,232,0.08)',
                  color: applied[opp.id] ? 'var(--success)' : 'var(--primary)',
                  border: `1px solid ${applied[opp.id] ? 'rgba(58,174,114,0.2)' : 'rgba(124,88,232,0.15)'}`,
                  cursor: applied[opp.id] ? 'default' : 'pointer',
                }}
              >
                {applying === opp.id ? '…' : applied[opp.id] ? '✓ Applied' : 'Apply →'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
