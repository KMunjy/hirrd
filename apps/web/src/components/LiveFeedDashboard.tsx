'use client'

import { useState, useEffect } from 'react'
import { formatSalary, matchScoreColor, opportunityTypeLabels, marketLabels } from "@/lib/tokens"

const MOCK_OPPORTUNITIES = [
  { id: '1', title: 'Junior Data Analyst', company: 'FNB', city: 'Johannesburg', type: 'job', salary_min: 28000, salary_max: 40000, currency: 'ZAR', match_score: 82, skills: ['SQL', 'Python', 'Tableau'], market: 'za', posted: '2h ago' },
  { id: '2', title: 'UX Researcher', company: 'Standard Bank', city: 'Cape Town', type: 'job', salary_min: 32000, salary_max: 45000, currency: 'ZAR', match_score: 71, skills: ['Figma', 'UX Design'], market: 'za', posted: '4h ago' },
  { id: '3', title: 'Data Scientist', company: 'ABSA', city: 'Johannesburg', type: 'job', salary_min: 50000, salary_max: 70000, currency: 'ZAR', match_score: 77, skills: ['Python', 'Machine Learning'], market: 'za', posted: '6h ago' },
  { id: '4', title: 'Product Manager', company: 'Revolut', city: 'London', type: 'job', salary_min: 55000, salary_max: 70000, currency: 'GBP', match_score: 65, skills: ['Agile', 'Leadership'], market: 'uk', posted: '1d ago' },
  { id: '5', title: 'Data Science Learnship', company: 'Discovery', city: 'Sandton', type: 'learnership', salary_min: 8000, salary_max: 8000, currency: 'ZAR', match_score: 61, skills: ['Python', 'Statistics'], market: 'za', posted: '2d ago' },
  { id: '6', title: 'DevOps Engineer', company: 'Capitec', city: 'Stellenbosch', type: 'job', salary_min: 55000, salary_max: 75000, currency: 'ZAR', match_score: 58, skills: ['Docker', 'Kubernetes', 'AWS'], market: 'za', posted: '3d ago' },
]

const TICKER_ITEMS = MOCK_OPPORTUNITIES.map(o =>
  `${o.title.toUpperCase()} · ${o.company.toUpperCase()} · ${o.match_score}% MATCH`
).join('          ')

type FilterType = 'all' | 'job' | 'learnership' | 'internship' | 'course'

export default function LiveFeedDashboard() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [topCard] = useState(MOCK_OPPORTUNITIES[0])

  const filtered = filter === 'all'
    ? MOCK_OPPORTUNITIES
    : MOCK_OPPORTUNITIES.filter(o => o.type === filter)

  return (
    <section style={{ padding: '0 24px 32px' }}>

      {/* STAT STRIP */}
      <div style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '1px',
      }}>
        {[
          { value: '24', label: 'OPPORTUNITIES', color: 'var(--primary)' },
          { value: '9', label: 'LIVE JOBS', color: 'var(--success)' },
          { value: '12', label: 'COURSES', color: 'var(--secondary)' },
          { value: '82%', label: 'TOP MATCH', color: 'var(--warning)' },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '3px', letterSpacing: '0.06em' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* TICKER */}
      <div style={{
        background: 'var(--gradient-primary)',
        padding: '5px 0',
        overflow: 'hidden',
        marginBottom: '20px',
      }}>
        <div className="ticker-scroll" style={{ fontSize: '11px', fontWeight: 500, color: '#fff', whiteSpace: 'nowrap' }}>
          {TICKER_ITEMS}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{TICKER_ITEMS}
        </div>
      </div>

      {/* MAIN 3-COL GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.8fr 1fr',
        gap: '16px',
      }}>

        {/* LEFT — MATCH INDEX */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border)' }}>
          <SectionLabel>MATCH INDEX</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {MOCK_OPPORTUNITIES.slice(0, 5).map(opp => (
              <div key={opp.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>{opp.title.split(' ')[0]} {opp.title.split(' ')[1]}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: matchScoreColor(opp.match_score) }}>{opp.match_score}</span>
                </div>
                <div className="match-bar">
                  <div className="match-bar-fill" style={{ width: `${opp.match_score}%`, background: matchScoreColor(opp.match_score) === 'var(--success)' ? 'var(--gradient-primary)' : matchScoreColor(opp.match_score) }} />
                </div>
              </div>
            ))}
          </div>

          <SectionLabel>MARKETS</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '16px' }}>
            {[
              { label: 'South Africa', value: 14, color: 'var(--primary)' },
              { label: 'UK', value: 10, color: 'var(--secondary)' },
            ].map(m => (
              <div key={m.label} style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>{m.label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          <SectionLabel>SKILL GAPS</SectionLabel>
          <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ color: 'var(--error)', fontWeight: 500 }}>▲ AWS — 6 roles affected</span>
            <span style={{ color: 'var(--warning)', fontWeight: 500 }}>◆ Power BI — 4 roles</span>
            <span style={{ color: 'var(--success)', fontWeight: 500 }}>✓ SQL — strong match</span>
            <span style={{ color: 'var(--success)', fontWeight: 500 }}>✓ Python — strong match</span>
          </div>
        </div>

        {/* CENTRE — LIVE FEED */}
        <div style={{ background: 'var(--bg-base)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <SectionLabel>LIVE FEED — RANKED BY MATCH</SectionLabel>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['all', 'job', 'learnership', 'course'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    fontSize: '10px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border-medium)',
                    background: filter === f ? 'var(--primary)' : 'var(--bg-card)',
                    color: filter === f ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  {f === 'all' ? `All ${MOCK_OPPORTUNITIES.length}` : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* TOP MATCH HERO CARD */}
          <div className="card animate-pulse-border" style={{ marginBottom: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  <span className="badge badge-job">● JOB</span>
                  <span className="badge badge-primary">TOP MATCH</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '3px' }}>
                  {topCard.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {topCard.company} · {topCard.city} · {formatSalary(topCard.salary_min, topCard.salary_max, topCard.currency)} · Full-time
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                background: 'var(--success-light)',
                borderRadius: '12px',
                padding: '8px 14px',
                border: '1.5px solid rgba(58,174,114,0.25)',
                flexShrink: 0,
              }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--success)', lineHeight: 1 }}>{topCard.match_score}</div>
                <div style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 600 }}>MATCH %</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {topCard.skills.map(s => (
                <span key={s} className="badge badge-primary" style={{ fontSize: '11px' }}>{s} ✓</span>
              ))}
              <span className="badge" style={{ background: 'var(--error-light)', color: 'var(--error)', fontSize: '11px' }}>AWS ✗</span>
            </div>
            <div className="match-bar">
              <div className="match-bar-fill" style={{ width: `${topCard.match_score}%` }} />
            </div>
          </div>

          {/* REST OF FEED */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {filtered.slice(1, 5).map(opp => (
              <OpportunityMiniCard key={opp.id} opp={opp} />
            ))}
          </div>
        </div>

        {/* RIGHT — PROFILE */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SectionLabel>YOUR PROFILE</SectionLabel>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {[
              { v: '24', l: 'TOTAL', c: 'var(--primary)' },
              { v: '9', l: 'JOBS', c: 'var(--success)' },
              { v: '12', l: 'COURSES', c: 'var(--secondary)' },
              { v: '3', l: 'INTERN', c: 'var(--warning)' },
            ].map(s => (
              <div key={s.l} style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>{s.l}</div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" style={{ width: '100%', fontSize: '14px', padding: '12px' }}>
            Upload CV →
          </button>

          {/* CV STRENGTH */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>CV STRENGTH</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--warning)' }}>68/100</span>
            </div>
            <div className="match-bar" style={{ height: '6px', marginBottom: '10px' }}>
              <div style={{ width: '68%', height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, var(--warning), #F0C040)' }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              + Add measurable achievements<br />
              + Quantify impact with numbers<br />
              + Add certifications section
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '10px' }}>
      {children}
    </div>
  )
}

function OpportunityMiniCard({ opp }: { opp: typeof MOCK_OPPORTUNITIES[0] }) {
  return (
    <div className="card card-hover" style={{ padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{opp.title}</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: matchScoreColor(opp.match_score) }}>{opp.match_score}%</span>
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{opp.company} · {opp.city}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
        {formatSalary(opp.salary_min, opp.salary_max, opp.currency)}
      </div>
    </div>
  )
}
