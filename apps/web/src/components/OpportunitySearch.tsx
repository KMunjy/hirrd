'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Opportunity {
  id: string; type: string; title: string; sector?: string; industry?: string;
  location_city?: string; salary_min?: number; salary_max?: number;
  skills_required?: string[]; is_verified?: boolean; verification_status?: string;
  seta_name?: string; employers?: { company_name?: string }
}
interface Props { opportunities: Opportunity[]; type?: string }

const SECTORS = ['All sectors','Financial Services','Technology','Healthcare','Retail',
  'Mining','Construction','Education','Government','Telecoms','Agriculture','Hospitality',
  'Professional Services','Logistics','Energy','FMCG','Insurance / FinTech','Diversified']

const PROVINCES = ['All provinces','Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape',
  'Limpopo','Mpumalanga','North West','Free State','Northern Cape']

const TYPE_META: Record<string,{color:string;bg:string;border:string}> = {
  job:         {color:'#4ADE80',bg:'rgba(16,185,129,0.12)',border:'rgba(16,185,129,0.25)'},
  learnership: {color:'#5EEAD4',bg:'rgba(45,212,191,0.12)',border:'rgba(45,212,191,0.25)'},
  internship:  {color:'#FCD34D',bg:'rgba(245,158,11,0.12)',border:'rgba(245,158,11,0.25)'},
  bursary:     {color:'#FB7185',bg:'rgba(244,63,94,0.12)',border:'rgba(244,63,94,0.25)'},
}

export default function OpportunitySearch({ opportunities, type }: Props) {
  const [query, setQuery]               = useState('')
  const [sector, setSector]             = useState('All sectors')
  const [province, setProvince]         = useState('All provinces')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [salaryMin, setSalaryMin]       = useState('')

  const filtered = opportunities.filter(o => {
    if (type && o.type !== type) return false
    if (query) {
      const q = query.toLowerCase()
      const hit = o.title?.toLowerCase().includes(q) ||
        (o.sector || o.industry || '')?.toLowerCase().includes(q) ||
        o.location_city?.toLowerCase().includes(q) ||
        o.employers?.company_name?.toLowerCase().includes(q) ||
        o.skills_required?.some(s => s.toLowerCase().includes(q))
      if (!hit) return false
    }
    if (sector !== 'All sectors' && o.sector !== sector && o.industry !== sector) return false
    if (province !== 'All provinces' && !o.location_city?.includes(province.split(' ')[0])) return false
    if (verifiedOnly && !o.is_verified && o.verification_status !== 'verified') return false
    if (salaryMin && o.salary_min && o.salary_min < Number(salaryMin) * 1000) return false
    return true
  })

  const inp: React.CSSProperties = {
    padding: '10px 14px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(10px)',
    color: '#F0ECFF', fontSize: '14px', outline: 'none',
    fontFamily: 'inherit', transition: 'all 0.2s',
  }

  function formatSal(o: Opportunity) {
    if (!o.salary_min && !o.salary_max) return null
    const f = (n: number) => n >= 1000 ? `R${Math.round(n/1000)}k` : `R${n}`
    if (o.salary_min && o.salary_max) return `${f(o.salary_min)}–${f(o.salary_max)}`
    return o.salary_min ? `${f(o.salary_min)}+` : null
  }

  return (
    <div>
      {/* Search bar */}
      <div className="card" style={{ marginBottom: '16px', padding: '16px 20px' }}>
        <input
          type="search" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search by title, skills, company, location…"
          style={{ ...inp, width: '100%', marginBottom: '12px', boxSizing: 'border-box', fontSize: '15px' }}
          aria-label="Search opportunities"
          onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(123,92,240,0.5)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(123,92,240,0.12)' }}
          onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.target as HTMLInputElement).style.boxShadow = 'none' }}
        />
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={sector} onChange={e => setSector(e.target.value)} style={{ ...inp, flex: '1', minWidth: '150px' }}>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={province} onChange={e => setProvince(e.target.value)} style={{ ...inp, flex: '1', minWidth: '150px' }}>
            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input
            type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)}
            placeholder="Min R (000s)" style={{ ...inp, width: '120px' }}
            aria-label="Minimum salary in thousands"
          />
          <label style={{ display: 'flex', gap: '7px', alignItems: 'center', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'rgba(240,236,255,0.6)', whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)}
              style={{ accentColor: '#7B5CF0', width: '14px', height: '14px' }} />
            ✓ Verified only
          </label>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-subtle,#4A4278)', marginTop: '10px', fontWeight: 600, letterSpacing: '0.04em' }}>
          {filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'} found
          {verifiedOnly && ' · verified employers only'}
          {query && ` · "${query}"`}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontWeight: 700, color: '#F0ECFF', marginBottom: '6px' }}>No results</div>
          <div style={{ fontSize: '13px', color: 'rgba(240,236,255,0.4)' }}>Try a broader search or remove filters</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(o => {
            const meta = TYPE_META[o.type] || TYPE_META.job
            const sal = formatSal(o)
            const verified = o.is_verified || o.verification_status === 'verified'
            return (
              <div key={o.id} className="card card-hover">
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, letterSpacing: '0.08em' }}>
                    {o.type.toUpperCase()}
                  </span>
                  {verified && (
                    <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px', background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' }}>
                      {o.seta_name ? `✓ ${o.seta_name}` : '✓ Verified'}
                    </span>
                  )}
                </a>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F0ECFF', marginBottom: '3px', lineHeight: 1.3 }}>{o.title}</h3>
                <div style={{ fontSize: '12px', color: 'rgba(240,236,255,0.45)', marginBottom: '8px' }}>
                  {o.employers?.company_name || (o.sector || o.industry || '')} · {o.location_city || 'South Africa'}
                  {sal && ` · ${sal}`}
                </a>
                {(o.skills_required || []).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {(o.skills_required || []).slice(0, 5).map(s => (
                      <span key={s} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'rgba(240,236,255,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>{s}</span>
                    ))}
                  </a>
                )}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
