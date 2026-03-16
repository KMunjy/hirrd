'use client'

import { useState, useCallback } from 'react'

interface Opportunity {
  id: string
  type: string
  title: string
  sector?: string
  location_city?: string
  salary_min?: number
  salary_max?: number
  skills_required?: string[]
  is_verified?: boolean
  verification_status?: string
  seta_name?: string
}

interface Props {
  opportunities: Opportunity[]
  type?: 'job' | 'learnership' | 'internship' | 'bursary'
}

const SECTORS = ['All sectors','Financial Services','Technology','Healthcare','Retail',
  'Mining','Construction','Education','Government','Telecoms','Agriculture','Hospitality']

const PROVINCES = ['All provinces','Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape',
  'Limpopo','Mpumalanga','North West','Free State','Northern Cape']

export default function OpportunitySearch({ opportunities, type }: Props) {
  const [query, setQuery] = useState('')
  const [sector, setSector] = useState('All sectors')
  const [province, setProvince] = useState('All provinces')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [salaryMin, setSalaryMin] = useState('')

  const filtered = opportunities.filter(o => {
    if (type && o.type !== type) return false
    if (query) {
      const q = query.toLowerCase()
      const matches =
        o.title?.toLowerCase().includes(q) ||
        o.sector?.toLowerCase().includes(q) ||
        o.location_city?.toLowerCase().includes(q) ||
        o.skills_required?.some(s => s.toLowerCase().includes(q))
      if (!matches) return false
    }
    if (sector !== 'All sectors' && o.sector !== sector) return false
    if (province !== 'All provinces' && o.location_city !== province) return false
    if (verifiedOnly && !o.is_verified && o.verification_status !== 'verified') return false
    if (salaryMin && o.salary_min && o.salary_min < Number(salaryMin)) return false
    return true
  })

  const inp: React.CSSProperties = {
    padding: '10px 14px', borderRadius: '10px',
    border: '1px solid rgba(124,88,232,0.2)', background: 'var(--bg-base)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    fontFamily: 'inherit',
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '12px', padding: '18px', transition: 'box-shadow 0.15s',
  }

  function verificationBadge(o: Opportunity) {
    if (o.seta_name && (o.is_verified || o.verification_status === 'verified')) {
      return <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: 'rgba(58,174,114,0.12)', color: 'var(--success)', border: '1px solid rgba(58,174,114,0.25)' }}>✓ SETA: {o.seta_name}</span>
    }
    if (o.is_verified || o.verification_status === 'verified') {
      return <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: 'rgba(58,174,114,0.12)', color: 'var(--success)', border: '1px solid rgba(58,174,114,0.25)' }}>✓ Verified</span>
    }
    return null
  }

  return (
    <div>
      {/* Search + filters */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
        <input
          type="search" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search by title, skills, location…"
          style={{ ...inp, width: '100%', marginBottom: '12px', boxSizing: 'border-box' }}
          aria-label="Search opportunities"
        />
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={sector} onChange={e => setSector(e.target.value)} style={{ ...inp, flex: '1', minWidth: '160px' }}>
            {SECTORS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={province} onChange={e => setProvince(e.target.value)} style={{ ...inp, flex: '1', minWidth: '160px' }}>
            {PROVINCES.map(p => <option key={p}>{p}</option>)}
          </select>
          <input
            type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)}
            placeholder="Min salary (R)" style={{ ...inp, width: '140px' }}
            aria-label="Minimum salary in Rand"
          />
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>
            <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
            Verified only ✓
          </label>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
          {filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'} found
          {verifiedOnly && ' · verified employers only'}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>No results for "{query}"</div>
          <div style={{ fontSize: '13px' }}>Try a broader search or remove some filters.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(o => (
            <div key={o.id} style={cardStyle}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(124,88,232,0.1)', color: 'var(--primary)' }}>
                  {(o.type || 'JOB').toUpperCase()}
                </span>
                {verificationBadge(o)}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{o.title}</h3>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {o.sector} · {o.location_city || 'South Africa'}
                {o.salary_min && ` · R${Math.round(o.salary_min / 1000)}k${o.salary_max ? `–R${Math.round(o.salary_max / 1000)}k` : '+'}`}
              </div>
              {(o.skills_required || []).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(o.skills_required || []).slice(0, 5).map(s => (
                    <span key={s} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '5px', background: 'var(--bg-base)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
