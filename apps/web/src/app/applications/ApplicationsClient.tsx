'use client'

import { useState } from 'react'
import Link from 'next/link'

const STATUS_META: Record<string, { label: string; color: string; bg: string; step: number }> = {
  draft:       { label: 'Draft',        color: '#6B7280', bg: 'rgba(107,114,128,0.1)', step: 0 },
  applied:     { label: 'Applied',      color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',  step: 1 },
  viewed:      { label: 'Viewed',       color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', step: 2 },
  shortlisted: { label: 'Shortlisted',  color: '#FCD34D', bg: 'rgba(252,211,77,0.1)',  step: 3 },
  interview:   { label: 'Interview',    color: '#FB923C', bg: 'rgba(251,146,60,0.1)',  step: 4 },
  offered:     { label: '🎉 Offered',   color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',  step: 5 },
  rejected:    { label: 'Not selected', color: '#F87171', bg: 'rgba(248,113,113,0.1)', step: -1 },
  withdrawn:   { label: 'Withdrawn',    color: '#6B7280', bg: 'rgba(107,114,128,0.1)', step: -1 },
  placed:      { label: '✓ Placed',     color: '#4ADE80', bg: 'rgba(74,222,128,0.12)', step: 6 },
}

const TYPE_COLOR: Record<string, string> = {
  job: '#4ADE80', learnership: '#5EEAD4', internship: '#FCD34D', bursary: '#FB7185', course: '#A78BFA',
}

const PIPELINE_STEPS = ['Applied', 'Viewed', 'Shortlisted', 'Interview', 'Offered']

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatSal(o: any) {
  if (!o.salary_min && !o.salary_max) return null
  const cur = o.salary_currency || 'R'
  if (o.salary_min && o.salary_max) return `${cur} ${(o.salary_min/1000).toFixed(0)}k–${(o.salary_max/1000).toFixed(0)}k`
  return `From ${cur} ${(o.salary_min/1000).toFixed(0)}k`
}

interface Props {
  applications: any[]
  hasCandidate: boolean
}

export default function ApplicationsClient({ applications, hasCandidate }: Props) {
  const [filter, setFilter] = useState<string>('all')

  const filters = ['all', 'active', 'applied', 'shortlisted', 'interview', 'offered', 'rejected']

  const filtered = applications.filter(a => {
    if (filter === 'all') return true
    if (filter === 'active') return !['rejected', 'withdrawn', 'placed'].includes(a.status)
    return a.status === filter
  })

  const stats = {
    total: applications.length,
    active: applications.filter(a => !['rejected', 'withdrawn', 'placed'].includes(a.status)).length,
    interviews: applications.filter(a => a.status === 'interview').length,
    offers: applications.filter(a => ['offered', 'placed'].includes(a.status)).length,
  }

  const s: Record<string, React.CSSProperties> = {
    page: { maxWidth: '860px', margin: '0 auto', padding: '32px 20px 80px' },
    card: { background: 'var(--glass-2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '12px', transition: 'border-color 0.15s' },
    stat: { background: 'var(--glass-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', textAlign: 'center' as const },
    filterBtn: (active: boolean): React.CSSProperties => ({
      padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
      cursor: 'pointer', border: 'none', transition: 'all 0.15s',
      background: active ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
      color: active ? 'white' : 'var(--text-muted)',
    }),
  }

  if (!hasCandidate) return (
    <main style={s.page}>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Set up your profile first</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
          Upload your CV to start applying for opportunities.
        </p>
        <Link href="/profile" style={{
          padding: '12px 28px', borderRadius: '10px', background: 'var(--gradient-primary)',
          color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: '14px',
        }}>Set Up Profile →</Link>
      </div>
    </main>
  )

  return (
    <main style={s.page}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          My Applications
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Track every application in real time.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: stats.total, color: 'var(--text-primary)' },
          { label: 'Active', value: stats.active, color: '#60A5FA' },
          { label: 'Interviews', value: stats.interviews, color: '#FB923C' },
          { label: 'Offers', value: stats.offers, color: '#4ADE80' },
        ].map(s2 => (
          <div key={s2.label} style={s.stat}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: s2.color }}>{s2.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s2.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={s.filterBtn(filter === f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && <span style={{ marginLeft: '4px', opacity: 0.7 }}>
              {applications.filter(a => f === 'active'
                ? !['rejected', 'withdrawn', 'placed'].includes(a.status)
                : a.status === f
              ).length}
            </span>}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>
            {applications.length === 0 ? '🚀' : '🔍'}
          </div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {applications.length === 0 ? 'No applications yet' : 'No applications match this filter'}
          </div>
          {applications.length === 0 && (
            <Link href="/jobs" style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              Browse opportunities →
            </Link>
          )}
        </div>
      )}

      {/* Application cards */}
      {filtered.map(app => {
        const opp = app.opportunities
        if (!opp) return null
        const statusMeta = STATUS_META[app.status] || STATUS_META.applied
        const typeColor = TYPE_COLOR[opp.type] || '#4ADE80'
        const sal = formatSal(opp)
        const currentStep = statusMeta.step

        return (
          <div key={app.id} style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
              {/* Left: job info */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px',
                    background: `${typeColor}18`, color: typeColor, border: `1px solid ${typeColor}30`, letterSpacing: '0.08em' }}>
                    {opp.type?.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px',
                    background: statusMeta.bg, color: statusMeta.color, fontWeight: 600 }}>
                    {statusMeta.label}
                  </span>
                  {!opp.is_active && (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>· Listing closed</span>
                  )}
                </div>

                <Link href={`/jobs/${opp.id}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px', lineHeight: 1.3 }}>
                    {opp.title}
                  </h3>
                </Link>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {opp.employers?.company_name}
                  {opp.location_city && ` · ${opp.location_city}`}
                  {sal && <span style={{ color: '#4ADE80', fontWeight: 600 }}> · {sal}</span>}
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Applied {formatDate(app.created_at)}
                  {app.updated_at !== app.created_at && ` · Updated ${formatDate(app.updated_at)}`}
                </div>
              </div>

              {/* Right: view button */}
              <Link href={`/jobs/${opp.id}`} style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', textDecoration: 'none', whiteSpace: 'nowrap',
              }}>View Job</Link>
            </div>

            {/* Pipeline progress - only for non-terminal statuses */}
            {currentStep > 0 && currentStep <= 5 && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                  {PIPELINE_STEPS.map((step, i) => {
                    const stepNum = i + 1
                    const done = currentStep >= stepNum
                    const current = currentStep === stepNum
                    return (
                      <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < 4 ? 1 : 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: done ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                            border: current ? '2px solid var(--primary)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', color: done ? 'white' : 'var(--text-muted)',
                            fontWeight: 700, transition: 'all 0.3s',
                          }}>
                            {done ? '✓' : stepNum}
                          </div>
                          <span style={{ fontSize: '9px', color: done ? 'var(--text-secondary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {step}
                          </span>
                        </div>
                        {i < 4 && (
                          <div style={{
                            flex: 1, height: '2px', margin: '0 4px', marginBottom: '16px',
                            background: currentStep > stepNum ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                            transition: 'background 0.3s',
                          }} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recruiter note if any */}
            {app.recruiter_notes && (
              <div style={{
                marginTop: '12px', padding: '10px 12px', borderRadius: '8px',
                background: 'rgba(124,88,232,0.06)', border: '1px solid rgba(124,88,232,0.15)',
                fontSize: '13px', color: 'var(--text-secondary)',
              }}>
                💬 <strong>Note from employer:</strong> {app.recruiter_notes}
              </div>
            )}
          </div>
        )
      })}

      {/* Browse more */}
      {applications.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/jobs" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Browse more opportunities →
          </Link>
        </div>
      )}
    </main>
  )
}
